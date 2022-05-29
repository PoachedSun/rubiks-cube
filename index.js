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
scene.background = new THREE.Color('white');

const cameraPole = new THREE.Object3D;
scene.add(cameraPole);
cameraPole.add(camera);



let dragging = false;
let pickedObject;
let pickedObjectFace;
let pickedObjectOriginalPosition;
let lastCoords;
let newCoords;
canvas.addEventListener('mousemove', (event) => {
  if (event.buttons === 1) {
    if (dragging && pickedObject) {
      const rect = canvas.getBoundingClientRect();
      lastCoords = newCoords;
      newCoords = new THREE.Vector3(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * -2 + 1,
        pickedObjectOriginalPosition.z,
      )
      newCoords.unproject(camera);
      if (lastCoords === undefined) {
        lastCoords = newCoords;
      }

      const change = {
        x: newCoords.x - pickedObject.position.x,
        y: newCoords.y - pickedObject.position.y,
        z: newCoords.z - pickedObject.position.z,
      }
    }
  } else {
    dragging = false;
    pickedObject = undefined;
    lastCoords = undefined;
    if (event.buttons === 2) {
      cameraPole.rotateX(event.movementY * -.003)
      cameraPole.rotateY(event.movementX * -.003);
    }
  }
});
canvas.addEventListener('mouseup', () => {
  dragging = false;
  pickedObject = undefined;
  lastCoords = undefined;
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
canvas.addEventListener('mousedown', (event) => {
  dragging = true;
  const rect = canvas.getBoundingClientRect();
  pick(
    {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * -2 + 1,
    },
    scene,
    camera,
  );
})

requestAnimationFrame(render);
function render(time) {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

const raycaster = new THREE.Raycaster();

function pick(normalizedPosition, scene, camera) {
  raycaster.setFromCamera(normalizedPosition, camera);
  const intersectedObjects = raycaster.intersectObjects(scene.children);
  if (intersectedObjects.length) {
    pickedObject = intersectedObjects[0].object;
    pickedObjectFace = intersectedObjects[0].face;
    
    pickedObjectOriginalPosition = new THREE.Vector3();

    pickedObjectOriginalPosition.setFromMatrixPosition(pickedObject.matrixWorld);
    pickedObjectOriginalPosition.project(camera);
  }
}

const cd = new Cube(scene);
