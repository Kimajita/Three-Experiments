import * as THREE from 'three';
import { EffectComposer } from 'effectComposer';
import { RenderPass } from 'renderPass';
import { ShaderPass } from 'shaderPass';

//################################################## // VARIABLES
//let controls;
let renderer, canvas, compose, pass, shader;
let scene, camera, light, pointLight;
let cameraDistance = 1.0; let fieldOfView = 75; let nearPlane = 0.1; let farPlane = 1000;

const width = window.innerWidth;
const height = window.innerHeight;
const aspectRatio = width / height;
const pixelRatio = window.devicePixelRatio;

//################################################## // RENDER
let writeBuffer;
function renderSetup() {
    writeBuffer = new THREE.WebGLRenderTarget(width, height);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    canvas = new THREE.Scene();
    canvas.background = new THREE.Color(0x111111);
}

function render() {
    requestAnimationFrame(render);
    renderer.setRenderTarget(null); renderer.clear();
    renderer.render(canvas, camera);
}

//################################################## // INIT
init();
async function init() {

    //############################################## // LIGHTS, CAMERA, ACTION!
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = cameraDistance;

    //defaults
    let left, right, top, bottom; left = -1; right = 1; top = 1; bottom = -1;
    //left = width / -2; right = width / 2; top = height / 2; bottom = height / -2;
    //camera = new THREE.OrthographicCamera(left, right, top, bottom, nearPlane, farPlane);
    //camera.position.z = cameraDistance;

    light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);

    renderSetup();
    document.body.appendChild(renderer.domElement);

    await startStream();
    draw();
    postPro();
    render();
}

//############################################## // STREAM
let analyse;
async function startStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true, });
        const listen = new THREE.AudioListener(); listen.setMasterVolume(0); camera.add(listen);
        const audio = new THREE.Audio(listen); audio.setMediaStreamSource(stream);
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

            //plane as big as window / canvas
            const planeHeight = 2 * Math.tan(THREE.MathUtils.degToRad(fieldOfView) / 2) * nearPlane;
            const planeWidth = planeHeight * aspectRatio;

            const geo = new THREE.PlaneGeometry(planeWidth, planeHeight);
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
                side: THREE.DoubleSide
            }, );

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.z = cameraDistance - nearPlane;
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
                if (current > max) { max = current; console.log('abs max:\t' + max); }

                normalFrequency = averageFrequency / max;
                mat.uniforms.uNormalFrequency.value = normalFrequency;

                renderer.setRenderTarget(writeBuffer); renderer.clear();
                renderer.render(scene, camera);
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

            const geo = new THREE.PlaneGeometry(1.5, 1.5);
            shader = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0.0 }, uSine: { value: 0.0 },
                    uResolution: { value: new THREE.Vector2(width, height) }, uAspect: { value: width / height },
                    uMouse: { value: new THREE.Vector2() }, uFrequency: { value: 0.0 }, uNormalFrequency: { value: 0.0 },
                    uTexture: { value: writeBuffer.texture }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
            const mesh = new THREE.Mesh(geo, shader);
            canvas.add(mesh);

            console.log(shader.uniforms.uTexture.value);
        });
    });
}
