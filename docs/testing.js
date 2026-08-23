import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';

//################################################## // VARIABLES
let controls;
let renderer, canvas, compose, pass, shader;
let scene, camera, light, pointLight;
let cameraDistance = 1.5; let fieldOfView = 75; let nearPlane = 0.1; let farPlane = 1000;
const speed = 0.001;

const width = window.innerWidth; const height = window.innerHeight; const aspectRatio = width / height; const pixelRatio = window.devicePixelRatio;
let canvasElem, canvasWidth, canvasHeight;

//################################################## // RENDER
let writeBuffer;
function renderSetup() {
    writeBuffer = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);

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
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(fieldOfView, canvasWidth / canvasHeight, nearPlane, farPlane);
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
    const importImg = new THREE.TextureLoader(); const importTxt = new THREE.FileLoader();
    importImg.load('./assets/earth/earth_squared1.jpg', (file) => {
        const image = file;
        importTxt.load('./fragmentShader.glsl', (file) => {
            const fragmentShader = file;

            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0.0 }, uSpeed: { value: speed },
                    uColor: { value: new THREE.Color(0.5, 0.0, 0.75) },
                    uResolution: { value: new THREE.Vector2(width, height) },
                    uTexture: { value: image },

                    //User Input:
                    uMouse: { value: new THREE.Vector2() },
                    uFrequency: { value: 0.0 }, uNormalFrequency: { value: 0.0 },

                    //Effect Slider:
                    eWhite: { value: new THREE.Vector2() },
                    eGrey: { value: new THREE.Vector2() },
                    eGrain: { value: new THREE.Vector2() },

                },
                vertexShader: `
                varying vec3 vNormal;
                varying vec2 vUV;

                void main() {

                    vNormal = normal;
                    vUV = uv;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);

            //FUNCTIONS
            const timer = new THREE.Timer();
            function update(timeStamp) {
                requestAnimationFrame(update);

                timer.update(timeStamp);

                mat.uniforms.uTime.value = timer.getElapsed();

            } update(0.0);

            const eff_White = document.querySelector('#effect_white'); eff_White.addEventListener('input', slide);
            const eff_Grey = document.querySelector('#effect_grey'); eff_Grey.addEventListener('input', slide);
            const eff_Grain = document.querySelector('#effect_grain'); eff_Grain.addEventListener('input', slide);
            function slide(event) {

                let effect = event.target;
                let value = effect.valueAsNumber;
                let normal = effect.valueAsNumber / effect.max;

                if (effect.name == "white") {
                    mat.uniforms.eWhite.value = new THREE.Vector2(value, normal);
                } else if (effect.name == "grey") {
                    mat.uniforms.eGrey.value = new THREE.Vector2(value, normal);
                } else if (effect.name == "grain") {
                    mat.uniforms.eGrain.value = new THREE.Vector2(value, normal);
                }
            }
        });
    });
}

//################################################## // EFFECTS
async function postPro() {

}

//################################################## // MENU
const btn = document.querySelector('#btn_hideMenu');
btn.addEventListener('click', hideMenu);
function hideMenu() {
    const menu = document.querySelector('#menu'); menu.style.display = 'none';
    const body = document.querySelector('body'); body.style.gridTemplateColumns = '1fr';
    resize();
}

function showMenu() {
    resize();
}

function resize() {
    canvasWidth = canvasElem.offsetWidth; canvasHeight = canvasElem.offsetHeight;
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvasWidth, canvasHeight);
}
