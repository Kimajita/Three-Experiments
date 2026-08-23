import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';

//################################################## // VARIABLES
let controls;
let renderer, canvas, compose, pass, shader;
let scene, camera, light, pointLight;
let cameraDistance = 1.5; let fieldOfView = 75; let nearPlane = 0.1; let farPlane = 1000;
const speed = 0.001;

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
    controls.update();
    renderer.setRenderTarget(null); renderer.clear();
    renderer.render(scene, camera);
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

    renderSetup();
    document.body.appendChild(renderer.domElement);
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
        });
    });
}

//################################################## // EFFECTS
async function postPro() {

}
