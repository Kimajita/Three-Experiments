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

    let radius = 1, widthSegments = 10, heightSegments = 16, phiLength = Math.PI * 2, thetaLength = 1.25;
    let head1_geo = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, phiLength, 0, thetaLength);

    radius = 0.97; widthSegments = 9; thetaLength = 1.35;
    let head2_geo = new THREE.SphereGeometry(radius - 0.05, widthSegments, heightSegments, 0, phiLength, 0, thetaLength)

    radius = 0.9; widthSegments = 7; thetaLength = 1.42;
    let head3_geo = new THREE.SphereGeometry(radius - 0.05, widthSegments, heightSegments, 0, phiLength, 0, thetaLength)

    //______________________________________________ // Material
    const head_mat = new THREE.MeshPhysicalNodeMaterial({
        metalness: 5,
        roughness: 0.42,
        transmission: 0.75,
        thickness: 4.2,
        ior: 4.2,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
    });

    const col1 = TSL.uniform(new THREE.Color(0xff0089));
    const col2 = TSL.uniform(new THREE.Color(0xc400ff));
    const col3 = TSL.uniform(new THREE.Color(0x00dce0));
    const gradient = TSL.sin(TSL.positionLocal.length().mul(3.0).add(TSL.time)).mul(-0.5).add(0.5);
    const color1 = TSL.mix(col1, col2, gradient);
    const color2 = TSL.mix(col2, col3, gradient);

    const head1_mat = head_mat; const head2_mat = head_mat; const head3_mat = head_mat;
    head1_mat.emissiveNode = color1; head2_mat.emissiveNode = color2;


    head1_mat.positionNode = TSL.Fn(function() {
        const pos = TSL.positionLocal;
        const normal = TSL.normalLocal;

        const displace = TSL.sin(TSL.time.mul(3.0).add(pos.y.mul(5.0))).mul(0.075);

        return pos.add(normal.mul(displace));
    })();

    const head = new THREE.Group();
    const head1 = new THREE.Mesh(head1_geo, head1_mat);
    const head2 = new THREE.Mesh(head2_geo, head2_mat);
    const head3 = new THREE.Mesh(head3_geo, head3_mat);
    head.add(head1); head.add(head2); head.add(head3);

    const tail_geo = new THREE.CapsuleGeometry(0.05, 3, 1, 1, 42);
    //const tail_mat = new THREE.MeshBasicMaterial({color: 0x420161});
    const tail_mat = head_mat;

    const tail1 = new THREE.Mesh(tail_geo, tail_mat);
    const tail2 = new THREE.Mesh(tail_geo, tail_mat);
    const tail3 = new THREE.Mesh(tail_geo, tail_mat);
    const tail4 = new THREE.Mesh(tail_geo, tail_mat);
    const tail5 = new THREE.Mesh(tail_geo, tail_mat);
    const tail6 = new THREE.Mesh(tail_geo, tail_mat);
    const tail7 = new THREE.Mesh(tail_geo, tail_mat);

    tail1.position.z = 0.42; tail2.position.z = -0.42;
    tail1.scale.x = 0.5; tail1.scale.y = 0.9;
    tail2.scale.x = 0.5; tail2.scale.y = 0.9;

    tail3.position.x = 0.42; tail4.position.x = -0.42;
    tail3.scale.x = 0.5; tail3.scale.y = 0.7;
    tail4.scale.x = 0.5; tail4.scale.y = 0.7;

    const tail = new THREE.Group();
    tail.add(tail1); tail.add(tail2); tail.add(tail3); tail.add(tail4); tail.add(tail5); tail.add(tail6); tail.add(tail7);
    tail.position.y = -0.75;

    const jellyfish = new THREE.Group();
    jellyfish.add(head); jellyfish.add(tail);
    jellyfish.position.y = 0.5; jellyfish.rotation.z = 0.15; jellyfish.rotation.x = 0.25;
    scene.add(jellyfish);

    function step() {
        requestAnimationFrame(step);
        let speed = 0.005;

        head1.rotation.y += speed;
        head2.rotation.y += speed + 0.0001;
        head3.rotation.y += speed + 0.0002;

        jellyfish.rotation.y += speed * -2;

    } step();
}
