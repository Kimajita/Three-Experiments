import * as THREE from 'three';
import { EffectComposer } from 'effectComposer';
import { RenderPass } from 'renderPass';
import { ShaderPass } from 'shaderPass';
//import { OrbitControls } from 'orbitControls';

//################################################## // VARIABLES
//let controls;
let renderer, canvas, compose, pass, shader;
let scene, camera, light, pointLight;
let cameraDistance = 0.82; let fieldOfView = 67; let nearPlane = 0.1; let farPlane = 1500;

const width = window.innerWidth;
const height = window.innerHeight;
const aspectRatio = width / height;

//################################################## // RENDER
function render() {
    requestAnimationFrame(render);
    //controls.update();
    compose.render();
}

//################################################## // INIT
init();
async function init() {

    //############################################## // LIGHTS, CAMERA, ACTION!
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = cameraDistance;

    light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);

    pointLight = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight.position.z = cameraDistance;
    //scene.add(pointLight)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    //############################################## // RENDER PASS
    compose = new EffectComposer(renderer); pass = new RenderPass(scene, camera);
    pass.needsSwap = false; compose.addPass(pass);
    await postPro();

    //controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableDamping = true;

    await startStream();
    draw();
    //postPro();
    render();
}

//############################################## // STREAM
let analyse;
async function startStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true, });

        const listen = new THREE.AudioListener();
        camera.add(listen);
        listen.setMasterVolume(0);

        const audio = new THREE.Audio(listen);
        audio.setMediaStreamSource(stream);

        analyse = new THREE.AudioAnalyser(audio, 2048);

    } catch(err) { console.error('streaming error :(', err)}
}

//################################################## // SCENE
function draw() {
    const speed = 0.001;

    const loader = new THREE.FileLoader();
    loader.load('./vertexShader.glsl', (file) => {
        const vertexShader = file;
        loader.load('./fragmentShader.glsl', (file) => {
            const fragmentShader = file;

            const geo = new THREE.PlaneGeometry(1, 1);
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0.0 }, uSine: { value: 0.0 },
                    uResolution: { value: new THREE.Vector2(width, height) },
                    uAspect: { value: width / height },
                    uMouse: { value: new THREE.Vector2() },
                    uFrequency: { value: 0.0 }, uNormalFrequency: { value: 0.0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
            }, );

            const basic_mat = new THREE.MeshBasicMaterial();
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);

            const timer = new THREE.Timer();
            function updateTime(timeStamp) {
                requestAnimationFrame(updateTime);

                timer.update(timeStamp);
                const elapsed = timer.getElapsed();
                mat.uniforms.uTime.value = elapsed;

                const t = (Math.sin(Date.now() * speed) + 1) / 2;
                mat.uniforms.uSine.value = t;

            } updateTime(0.0);

            document.onmousemove = function (mouse) {
                mat.uniforms.uMouse.value.x = mouse.pageX / width;
                mat.uniforms.uMouse.value.y = mouse.pageY / height;
            }

            let averageFrequency, normalFrequency;
            let max = 0.0; let current = 1.0;
            function stream() {
                requestAnimationFrame(stream);
                averageFrequency = analyse.getAverageFrequency();
                mat.uniforms.uFrequency.value = averageFrequency;

                current = averageFrequency;
                if (current > max) { max = current; console.log('max frequency: ' + max); }

                normalFrequency = averageFrequency / max;
                mat.uniforms.uNormalFrequency.value = normalFrequency;
            } stream();
        });
    });
}

async function postPro() {
    const loader = new THREE.FileLoader();
    loader.load('./postVertex.glsl', (file) => {
        const vertexShader = file;
        loader.load('./postFragment.glsl', (file) => {
            const fragmentShader = file;
            shader = new ShaderPass(new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0.0 }, uSine: { value: 0.0 },
                    uResolution: { value: new THREE.Vector2(width, height) }, uAspect: { value: width / height },
                    uMouse: { value: new THREE.Vector2() }, uFrequency: { value: 0.0 }, uNormalFrequency: { value: 0.0 },
                    uTexture: { value: renderer.render(scene, camera) }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            }));

            compose.addPass(shader);
        });
    });
}
