import * as THREE from './node_modules/three/build/three.module.js';

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });

const angles = [
  [Math.PI/5, Math.PI/4, 0],
  [Math.PI/5, (3*Math.PI)/4, 0],
  [Math.PI/5, (5*Math.PI)/4, 0],
  [Math.PI/5, (7*Math.PI)/4, 0],
  [Math.PI/5, (7*Math.PI)/4, Math.PI/2],
]


const fov = 60;
const aspect = 2;
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 2;

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const cameraPole = new THREE.Object3D;
scene.add(cameraPole);
cameraPole.add(camera);

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

const positionAttribute = geometry.getAttribute('position');
//               red       orange    green     blue      yellow     white
const hexes = [0xfc0f03, 0xff6200, 0x0ba313, 0x0a0dbf, 0xf8fc03, 0xbbbbbb];

const materials = hexes.map((hex) => new THREE.MeshBasicMaterial({ color: hex }));


const material = new THREE.MeshBasicMaterial({ vertexColors: true });
const cube = new THREE.Mesh(geometry, materials);
const axesHelper = new THREE.AxesHelper(5);
cube.add(axesHelper);


scene.add(cube);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
camera.add(light);


canvas.addEventListener('mousemove', (event) => {
  if (event.buttons === 1) {
    cameraPole.rotateX(event.movementY * -.003)
    cameraPole.rotateY(event.movementX * -.003);
  }
});
canvas.addEventListener('wheel', (event) => {
  if (event.deltaY < 0) {
    camera.zoom *= 1.1;
    camera.updateProjectionMatrix();
  } else {
    camera.zoom /= 1.1;
    camera.updateProjectionMatrix();
  }
});

const rotationSpeed = 0.05;

requestAnimationFrame(render);
function render(time) {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}