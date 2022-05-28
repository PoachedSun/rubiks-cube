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

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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


scene.add(cube);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
camera.add(light);

canvas.addEventListener('mousemove', (event) => {
  if (event.buttons === 1) {
  }
});

let rotatingX, rotatingY, rotatingZ = false;
let deltaYRotate = 0;
let targets = [0, 0, 0];
let currentAngle = 0;
let targeting = false;
document.querySelector('#x-button').addEventListener('click', () => targets[0]++);
document.querySelector('#y-button').addEventListener('click', () => targets[1]++);
document.querySelector('#z-button').addEventListener('click', () => targets[2]++);

document.querySelector('#left-button').addEventListener('click', () => {
  targets[1] += 1;
});
document.querySelector('#right-button').addEventListener('click', () => {
  targets[2] += 1;
}); // deltaYRotate -= Math.PI / 2);

const xDisplay = document.querySelector('#x-display');
const yDisplay = document.querySelector('#y-display');
const zDisplay = document.querySelector('#z-display');

const rotationSpeed = 0.05;

requestAnimationFrame(render);
function render(time) {
  const targets2 = [Math.PI/5 + ((targets[0] * Math.PI) / 2), ((targets[1] * Math.PI)/2) + (Math.PI / 4), (targets[2] * Math.PI) / 2];
  const rotations = ['x', 'y', 'z'];
  for (let i = 0; i < rotations.length; i++) {
    if (cube.rotation[rotations[i]] < targets2[i]) {
      cube.rotation[rotations[i]] += rotationSpeed;
      if (cube.rotation[rotations[i]] > targets2[i]) {
        cube.rotation[rotations[i]] = targets2[i];
      }
    } else if (cube.rotation[rotations[i]] > targets2[i]) {
      cube.rotation[rotations[i]] -= rotationSpeed;
      if (cube.rotation[rotations[i]] < targets2[i]) {
        cube.rotation[rotations[i]] = targets2[i];
      }
    }
  }

  xDisplay.innerHTML = (cube.rotation.x).toPrecision(2);
  yDisplay.innerHTML = (cube.rotation.y).toPrecision(2);
  zDisplay.innerHTML = (cube.rotation.z).toPrecision(2);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function reduceRotations(o) {
  ['x', 'y', 'z'].forEach((dimension) => {
    if (o.rotation[dimension] > 2 * Math.PI) {
      o.rotation[dimension] -= (2 * Math.PI);
    }
    if (o.rotation[dimension] < 0) {
      o.rotation[dimension] += (2 * Math.PI);
    }
  });
}