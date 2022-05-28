import * as THREE from './node_modules/three/build/three.module.js';

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });

const fov = 60;
const aspect = 2;
const near = 0.1;
const far = 30;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const cameraPole = new THREE.Object3D;
scene.add(cameraPole);
cameraPole.add(camera);

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

//               red       orange    green     blue      yellow     white
const hexes = [0xfc0f03, 0xff6200, 0x0ba313, 0x0a0dbf, 0xf8fc03, 0xbbbbbb];

const materials = hexes.map((hex) => new THREE.MeshBasicMaterial({ color: hex }));

const cubes = [];
for (let i = 0; i < 3; i++) {
  const layer = [];
  for (let j = 0; j < 3; j++) {
    const row = [];
    for (let k = 0; k < 3; k++) {
      row.push(new THREE.Mesh(geometry, materials));
      const cube = new THREE.Mesh(geometry, materials);
      cube.position.y = (1 - i) * boxHeight * 1.1;
      cube.position.z = (1 - j) * boxDepth * 1.1;
      cube.position.x = (1 - k) * boxWidth * 1.1;
      scene.add(cube);
      row.push(cube);
    }
    layer.push(row);
  }
  cubes.push(layer);
}

const fillerGeometry = new THREE.BoxGeometry(boxWidth * 3, boxHeight * 3, boxDepth * 3);
const fillerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

const fillerCube = new THREE.Mesh(fillerGeometry, fillerMaterial);
scene.add(fillerCube);

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

requestAnimationFrame(render);
function render(time) {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}