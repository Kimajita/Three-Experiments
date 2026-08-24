import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';

//################################################## // VARIABLES
let controls;
let renderer, canvas, compose, pass, shader;
let scene, camera, light, pointLight;
let cameraDistance = 0.82; let fieldOfView = 75; let nearPlane = 0.1; let farPlane = 1000;
const speed = 0.025;

//################################################## // HTML
const width = window.innerWidth; const height = window.innerHeight; const aspectRatio = width / height; const pixelRatio = window.devicePixelRatio;
let canvasElem, canvasWidth, canvasHeight;
function resize() {
    canvasWidth = canvasElem.offsetWidth; canvasHeight = canvasElem.offsetHeight;
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvasWidth, canvasHeight);
}

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
    controls.update();
    renderer.setRenderTarget(null); renderer.clear();
    renderer.render(scene, camera);
}

//################################################## // INIT
init();
async function init() {

    window.addEventListener('resize', resize);

    //############################################## // HTML
    canvasElem = document.querySelector('#canvas');
    canvasWidth = canvasElem.offsetWidth; canvasHeight = canvasElem.offsetHeight;

    //############################################## // LIGHTS, CAMERA, ACTION!
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151515);

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = cameraDistance;

    light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);

    renderSetup();
    canvasElem.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

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
    const loader = new THREE.FileLoader();
    loader.load('./vertexShader.glsl', (file) => {
        const vertexShader = file;
        loader.load('./fragmentShader.glsl', (file) => {
            const fragmentShader = file;

            const geo = new THREE.PlaneGeometry(1, 1);
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0.0 }, uTimeLimit: { value: 0.0 },
                    uColor: { value: new THREE.Color(0.5, 0.0, 0.75) },
                    uResolution: { value: new THREE.Vector2(width, height) },

                    //User Input:
                    uMouse: { value: new THREE.Vector2() },
                    uFrequency: { value: 0.0 }, uNormalFrequency: { value: 0.0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);

            //FUNCTIONS
            let time = 0.0; let timeLimit = 0.0;
            let timer1 = new THREE.Timer(); let timer2 = new THREE.Timer();
            let averageFrequency, normalFrequency; let max = 0.0; let current = 1.0;
            function update(timeStamp) {
                requestAnimationFrame(update);
                mat.uniforms.uTime.value = time;
                //mat.uniforms.uTimeLimit.value = timeLimit;

                timer1.update(timeStamp);
                //timer2.update(timeStamp);

                time = timer1.getElapsed();
                //timeLimit = timer2.getElapsed();

                //if (timeLimit > 42.0) { timer2 = new THREE.Timer(); }
                //console.log(time + "\t\t\t" + timeLimit);

                //AUDIO
                averageFrequency = analyse.getAverageFrequency(); mat.uniforms.uFrequency.value = averageFrequency;
                normalFrequency = averageFrequency / max; mat.uniforms.uNormalFrequency.value = normalFrequency;

                current = averageFrequency;
                if (current > max) { max = current; console.log('abs max:\t' + max); }

            } update(0.0);

            document.onmousemove = function (mouse) {
                mat.uniforms.uMouse.value.x = mouse.pageX / width;
                mat.uniforms.uMouse.value.y = mouse.pageY / height;
            }
        });
    });
}

//################################################## // EFFECTS
async function postPro() {

}
