import * as THREE from 'three/webgpu';
import { OrbitControls } from 'orbitControls';
import * as TSL from 'three/tsl';

//################################################## // VARIABLES

let scene, camera, light, pointLight, renderer, controls;
let cameraDistance = 7; let fieldOfView = 67; let nearPlane = 0.1; let farPlane = 1500;

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
        specular: 0x555555, shininess: 3, //0xaa33ff
    });
    const box = new THREE.Mesh(box_geo, box_mat);
    scene.add(box);

    let radius = 1, tube = 0.25, tubeSegments = 128, radialSegments = 32, p = 1, q = 5;
    let knot_geo = new THREE.TorusKnotGeometry(radius, tube, tubeSegments, radialSegments, p, q);

    //______________________________________________ // Material
    const knot_mat = new THREE.MeshPhysicalNodeMaterial({
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.5,
        thickness: 1.0,
        ior: 1.75,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
    });

    const col1 = TSL.uniform(new THREE.Color(0xff0089));
    const col2 = TSL.uniform(new THREE.Color(0xc400ff));
    const gradient = TSL.sin(TSL.positionLocal.length().mul(3.0).add(TSL.time)).mul(-0.5).add(0.5);
    const color = TSL.mix(col1, col2, gradient);
    knot_mat.emissiveNode = color;

    knot_mat.positionNode = TSL.Fn(function() {
        const pos = TSL.positionLocal;
        const normal = TSL.normalLocal;

        const displace = TSL.sin(TSL.time.mul(3.0).add(pos.y.mul(5.0))).mul(0.075);

        return pos.add(normal.mul(displace));
    })();

    const knot = new THREE.Mesh(knot_geo, knot_mat);
    scene.add(knot);

    function step() {
        requestAnimationFrame(step);

        knot.geometry = new THREE.TorusKnotGeometry(radius, tube, tubeSegments, radialSegments, p, q);

    } step();
}
