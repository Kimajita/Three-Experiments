import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';
import { EXRLoader } from 'exrLoader'; import { HDRLoader } from 'hdrLoader';
import { AsciiEffect } from 'asciiEffect'; import { StereoEffect } from 'stereoEffect';

//################################################## // VARIABLES

let scene, camera, light, pointLight, renderer, controls, mixer, clock;
let cameraDistance = 13; let fieldOfView = 67; let nearPlane = 0.1; let farPlane = 1500;

const width = window.innerWidth;
const height = window.innerHeight;
const aspectRatio = width / height;

//################################################## // SHADER
const fileLoader = new THREE.FileLoader();
const imgLoader = new THREE.TextureLoader();
const objLoader = new THREE.ObjectLoader();
const hdrLoader = new HDRLoader(); const exrLoader = new EXRLoader();

//################################################## // INIT
init();
async function init() {

    scene = new THREE.Scene();

    const envMap1 = await exrLoader.loadAsync('./assets/envMap2.exr');
    envMap1.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envMap1;

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = cameraDistance;

    light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);

    pointLight = new THREE.PointLight(0xff0040, 5, 0); //color, intensity, range, decay
    scene.add(pointLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    controls = new OrbitControls(camera, renderer.domElement);

    draw();
    run();
}

//################################################## // RUN
function run() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(run);
}

//################################################## // INTERPOLATION
function lerp(start, end, t) { return start * (1 - t) + end * t; }

//################################################## // SCENE
function draw() {

    //############################################## // HEART
    objLoader.load('./assets/small_heart.json', (heart) => {
        heart.scale.set(0.075, 0.075, 0.075);
        heart.position.y = -0.5;

        let material = new THREE.MeshBasicMaterial({
            color: 0xff0040,
            wireframe: true,
        })

        heart.material = material;
        scene.add(heart);

        const centerY = heart.position.y;

        function step() {
            requestAnimationFrame(step);

            const speed = 0.001;
            const t = (Math.sin(Date.now() * speed) + 1) / 2;

            heart.rotation.y += speed * 5;
            heart.position.y = lerp(centerY + ((t + 1) * 0.15), centerY - ((t + 1) * 0.15), t);
            pointLight.position.y = heart.position.y;
        } step();
    });

    //############################################## // KNOT
    let knot_geo = new THREE.TorusKnotGeometry(3.5, 0.5, 100, 15, 1, 5);
    let knot_mat = new THREE.MeshPhysicalMaterial({
        envMap: scene.environment,

        color: 0x000000, emissive: 0xffffff, emissiveIntensity: 0.001,
        transparent: true, opacity: 0.82,

        roughness: 0.42,
        metalness: 1,

        iridescence: 1,
        iridescenceIOR: 1,

        clearcoat: 0.75,
        clearcoatRoughness: 0.25,

        flatShading: true,

        sheen: 1,
        sheenColor: 0x000000,
        sheenRoughness: 0.5,

        specularIntensity: 1,
        specularColor: 0x00ffff,

    });
    let knot = new THREE.Mesh(knot_geo, knot_mat);
    scene.add(knot);

    //############################################## // MOON
    imgLoader.load('./assets/moon_color1.jpg', (color) => {
        const moon_texture = color;
        imgLoader.load('./assets/moon_map1.png', (map) => {
            const moon_map = map;
            fileLoader.load('./vertexShader.glsl', (data) => {
                const vertexShader = data;
                fileLoader.load('./fragmentShader.glsl', (data => {
                    const fragmentShader = data;
                    const shaderMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            u_Time: { type: 'f', value: 1.0 },
                            u_Resolution: { value: new THREE.Vector2(width, height) },

                            u_Texture: { type: 't', value: moon_texture },
                            u_Map: { type: 't', value: moon_map },
                        },
                        defines: { USE_UV: true, USE_MAP: true, },
                        vertexShader: vertexShader,
                        fragmentShader: fragmentShader,

                        //wireframe: true,
                    });

                    let moon_geo = new THREE.SphereGeometry(13, 42, 42);
                    let moon_mat = shaderMaterial;
                    let moon = new THREE.Mesh(moon_geo, moon_mat);
                    scene.add(moon);

                }));
            });
        });
    });

    const speed = 0.00025;
    function step() {
        requestAnimationFrame(step);

        const t = (Math.sin(Date.now() * speed) + 1) / 2;
        let max1 = 3; let max2 = (max1 * 2) -  1;
        knot_geo = new THREE.TorusKnotGeometry(3.5, 0.5, 100, 15, lerp(1, max1, t), lerp(2, max2, t));
        //knot_geo = new THREE.TorusKnotGeometry(3.5, 0.5, 100, 15, 1, lerp(2, 6, t));
        knot.geometry = knot_geo;

        const t2 = (Math.sin(Date.now() * speed) + 1) / 2;
        knot_mat.iridescenceIOR = lerp(1, 2.3, t2);
        knot_mat.opacity = lerp(0.37, 0.82, t2);
        knot.material = knot_mat;
    } step();
}
