import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';

//################################################## // VARIABLES

let scene, camera, light, pointLight, renderer, controls;
let cameraDistance = 1; let fieldOfView = 67; let nearPlane = 0.1; let farPlane = 1500;

const width = window.innerWidth;
const height = window.innerHeight;
const aspectRatio = width / height;

//################################################## // INIT
init();
async function init() {

    //############################################## // LIGHTS, CAMERA, ACTION!
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = cameraDistance;

    light = new THREE.HemisphereLight(0xffffff, 0x220055, 1);
    scene.add(light);

    pointLight = new THREE.PointLight(0xffffff, 1, 0, 0);
    //pointLight.position.z = cameraDistance / 2;
    scene.add(pointLight)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    document.body.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);

    draw();
    render();
}

//################################################## // RENDER
function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

//################################################## // INTERPOLATE
const speed = 0.001;
const t = (Math.sin(Date.now() * speed) + 1) / 2;
function lerp(start, end, t) { return start * (1 - t) + end * t; }

//################################################## // SCENE
function draw() {

    let geo = new THREE.BoxGeometry(5, 3, 7);
    let mat = new THREE.MeshPhongMaterial({
        color: 0x220055, side: THREE.BackSide,
        specular: 0xaa33ff, shininess: 3,
    });
    const room = new THREE.Mesh(geo, mat);
    scene.add(room);

    function step() {
        requestAnimationFrame(step);

    } step();
}
