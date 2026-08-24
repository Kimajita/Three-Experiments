import * as THREE from 'three/webgpu';
import { OrbitControls } from 'orbitControls';
import * as TSL from 'three/tsl';

//################################################## // VARIABLES

let scene, camera, light, pointLight, renderer, controls;
let cameraDistance = 3; let fieldOfView = 67; let nearPlane = 0.1; let farPlane = 1500;

const width = window.innerWidth;
const height = window.innerHeight;
const aspectRatio = width / height;

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
    pointLight.position.y = 2.5;
    scene.add(pointLight)

    renderer = new THREE.WebGPURenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    document.body.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    draw();

    await renderer.init();
    render();
}

//################################################## // RENDER
function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

//################################################## // SCENE
function draw() {

    const box_geo = new THREE.BoxGeometry(5, 5, 5);
    const box_mat = new THREE.MeshPhongMaterial({
        color: 0x000000, side: THREE.BackSide, //0x220055
        specular: 0x2a1d54, shininess: 3, //0xaa33ff
    });
    const box = new THREE.Mesh(box_geo, box_mat);
    scene.add(box);

    function step() {
        requestAnimationFrame(step);
        let speed = 0.005;

    } step();
}
