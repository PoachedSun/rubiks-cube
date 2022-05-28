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

const materials = hexes.map((hex) => new THREE.MeshBasicMaterial({
  color: hex,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
}));

const cubes = [];
const faces = {
  front: [],
  back: [],
  left: [],
  right: [],
  top: [],
  bottom: [],
};
for (let i = 0; i < 3; i++) {
  const layer = [];
  for (let j = 0; j < 3; j++) {
    const row = [];
    for (let k = 0; k < 3; k++) {
      row.push(new THREE.Mesh(geometry, materials));
      const cube = new THREE.Mesh(geometry, materials);
      cube.position.y = (1 - i) * boxHeight;
      cube.position.z = (1 - j) * boxDepth;
      cube.position.x = (1 - k) * boxWidth;

      const geo = new THREE.EdgesGeometry(cube.geometry);
      const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
      const wireframe = new THREE.LineSegments(geo, mat);
      cube.add(wireframe);

      scene.add(cube);
      row.push(cube);

      if (i === 0) {
        faces.top.push(cube);
      } else if (i === 2) {
        faces.bottom.push(cube);
      }

      if (j === 0) {
        faces.front.push(cube);
      } else if (j === 2) {
        faces.back.push(cube);
      }

      if (k === 0) {
        faces.right.push(cube);
      } else if (k === 2) {
        faces.left.push(cube);
      }
    }
    layer.push(row);
  }
  cubes.push(layer);
}

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

function rotateFrontStep(angle) {
  faces.front.forEach((cube) => {
    cube.rotation.z += angle;
    const newX = (cube.position.x * Math.cos(angle)) - (cube.position.y * Math.sin(angle));
    const newY = (cube.position.y * Math.cos(angle)) + (cube.position.x * Math.sin(angle));
    cube.position.x = newX;
    cube.position.y = newY;
  });
}

function rotateFrontLeft(steps) {
  const stepCount = steps ? steps : 8;
  const angle = (Math.PI / 2) / stepCount;

  let counter = 0;
  const int1 = setInterval(() => {
    rotateFrontStep(angle);
    counter++;
    if (counter === stepCount) {
      clearInterval(int1);
    }
  }, 40);
}

function rotateFrontRight(steps) {
  const stepCount = steps ? steps : 8;
  const angle = -1 * (Math.PI / 2) / stepCount;

  let counter = 0;
  const int1 = setInterval(() => {
    rotateFrontStep(angle);
    counter++;
    if (counter === stepCount) {
      clearInterval(int1);
    }
  }, 40);
}

function rotateRightStep(angle) {
  faces.right.forEach((cube) => {
    cube.rotation.x += angle;
    // const newZ = (cube.position.y * Math.sin(angle)) - (cube.position.z * Math.cos(angle));
    // const newY = (cube.position.z * Math.sin(angle)) + (cube.position.y * Math.cos(angle));
    
    // cube.position.y = newY;
    // cube.position.z = newZ;

    const newZ = (cube.position.z * Math.sin(angle)) - (cube.position.y * Math.cos(angle));
    const newY = (cube.position.y * Math.sin(angle)) + (cube.position.z * Math.cos(angle));
    cube.position.z = newZ;
    cube.position.y = newY;
  });
}

function rotateRightLeft(steps) {
  const stepCount = steps ? steps : 8;
  const angle = (Math.PI / 2) / stepCount;

  let counter = 0;
  const int1 = setInterval(() => {
    rotateRightStep(angle);
    counter++;
    if (counter === stepCount) {
      clearInterval(int1);
    }
  }, 40);
}