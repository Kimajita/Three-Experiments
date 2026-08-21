import * as THREE from 'three';
//import { OrbitControls } from 'orbitControls';

//################################################## // VARIABLES

let scene, camera, light, pointLight, renderer; //controls;
let cameraDistance = 1; let fieldOfView = 67; let nearPlane = 0.1; let farPlane = 1500;

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
    pointLight.position.z = cameraDistance;
    //scene.add(pointLight)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    //controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableDamping = true;

    draw();
    render();
}

//################################################## // RENDER
function render() {
    requestAnimationFrame(render);
    //controls.update();
    renderer.render(scene, camera);
}

//################################################## // SCENE
function draw() {
    const speed = 0.001;

    const loader = new THREE.FileLoader();
    loader.load('./vertexShader.glsl', (file) => {
        const vertexShader = file;
        loader.load('./fragmentShader.glsl', (file) => {
            const fragmentShader = file;

            const col = new THREE.Vector3(1, 1, 1);
            const geo = new THREE.PlaneGeometry(1, 1);
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0.0 },
                    uSine: { value: 0.0 },
                    uColor: { value: col },
                    uResolution: { value: new THREE.Vector2(width, height) },
                    uAspect: { value: width / height },
                    uMouse: { value: new THREE.Vector2 }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
            });

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
        });
    });

    function step() {
        requestAnimationFrame(step);



    } //step();
}
