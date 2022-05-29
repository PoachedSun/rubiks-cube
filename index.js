import * as THREE from './node_modules/three/build/three.module.js';
import Cube from './cube.js';

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });

const fov = 60;
const aspect = 2;
const near = 1;
const far = 20;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('cornflowerblue');

const cameraPole = new THREE.Object3D;
scene.add(cameraPole);
cameraPole.add(camera);



canvas.addEventListener('mousemove', (event) => {
  if (event.buttons === 2) {
    cameraPole.rotateX(event.movementY * -.003)
    cameraPole.rotateY(event.movementX * -.003);
  }
});
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  if (event.deltaY < 0) {
    camera.zoom *= 1.1;
    camera.updateProjectionMatrix();
  } else {
    camera.zoom /= 1.1;
    camera.updateProjectionMatrix();
  }
});

requestAnimationFrame(render);
function render(time) {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

const cd = new Cube(scene);
