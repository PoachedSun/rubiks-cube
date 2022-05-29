import * as THREE from './node_modules/three/build/three.module.js';

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

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);


const redMat = new THREE.MeshBasicMaterial({
  color: 0xfc0f03,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const orangeMat = new THREE.MeshBasicMaterial({
  color: 0xff6200,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const greenMat = new THREE.MeshBasicMaterial({
  color: 0x0ba313,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const blueMat = new THREE.MeshBasicMaterial({
  color: 0x0a0dbf,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const yellowMat = new THREE.MeshBasicMaterial({
  color: 0xf8fc03,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const whiteMat = new THREE.MeshBasicMaterial({
  color: 0xbbbbbb,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});

const blackMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});

const materials = [
  orangeMat,
  redMat,
  blueMat,
  greenMat,
  yellowMat,
  whiteMat,
]

const cubes = [];
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const defaultMaterials = [blackMat, blackMat, blackMat, blackMat, blackMat, blackMat];
      const cube = new THREE.Mesh(geometry, defaultMaterials);
      cube.position.y = (1 - i) * boxHeight;
      cube.position.z = (1 - j) * boxDepth;
      cube.position.x = (1 - k) * boxWidth;

      const geo = new THREE.EdgesGeometry(cube.geometry);
      const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
      const wireframe = new THREE.LineSegments(geo, mat);
      cube.add(wireframe);

      scene.add(cube);
      cubes.push(cube);
    }
  }
}

const MaterialOrder = {
  RIGHT: 0,
  LEFT: 1,
  TOP: 2,
  BOTTOM: 3,
  FRONT: 4,
  BACK: 5,
}

function roundPositions () {
  cubes.forEach((cube) => {
    cube.position.x = Math.round(cube.position.x);
    cube.position.y = Math.round(cube.position.y);
    cube.position.z = Math.round(cube.position.z);
    cube.rotation.set(0, 0, 0);
  });
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

document.querySelector('#front-left-button').addEventListener('click', () => rotateFrontLeft());
document.querySelector('#front-right-button').addEventListener('click', () => rotateFrontRight());

class CubeData {
  front = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
  back = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
  top = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
  bottom = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
  left = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
  right = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
  isRotating = false;
  constructor(cubes) {
    cubes.forEach((cube) => {
      if (cube.position.y < 0) {
        this.bottom[-cube.position.z + 1][cube.position.x + 1] = { cube, colorValue: 0 };
      } else if (cube.position.y > 0) {
        this.top[cube.position.z + 1][cube.position.x + 1] = { cube, colorValue: 1 };
      }

      if (cube.position.z < 0) {
        this.back[cube.position.y + 1][cube.position.x + 1] = { cube, colorValue: 2 };
      } else if (cube.position.z > 0) {
        this.front[-cube.position.y + 1][cube.position.x + 1] = { cube, colorValue: 3 };
      }

      if (cube.position.x < 0) {
        this.left[-cube.position.y + 1][cube.position.z + 1] = { cube, colorValue: 4 };
      } else if (cube.position.x > 0) {
        this.right[-cube.position.y + 1][-cube.position.z + 1] = { cube, colorValue: 5 };
      }
    });
  }

  removeFace(face) {
    face.forEach((row) => {
      row.forEach((cubeData) => {
        scene.remove(cubeData.cube);
      });
    });
  }

  getCubeArrayFromFace(face) {
    const cubeArray = [];
    face.forEach((row) => {
      row.forEach((cubeData) => {
        cubeArray.push(cubeData.cube);
      });
    });
    return cubeArray;
  }

  colorFaces () {
    cubes.forEach((cube) => {
      cube.material = [blackMat, blackMat, blackMat, blackMat, blackMat, blackMat];
    });
    this.front.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.FRONT] = materials[cubeData.colorValue];
      });
    });
    this.back.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.BACK] = materials[cubeData.colorValue];
      });
    });
    this.left.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.LEFT] = materials[cubeData.colorValue];
      });
    });
    this.right.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.RIGHT] = materials[cubeData.colorValue];
      });
    });
    this.top.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.TOP] = materials[cubeData.colorValue];
      });
    });
    this.bottom.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.BOTTOM] = materials[cubeData.colorValue];
      });
    });
  }

  /*
    Animates a rotation of the provided cubes around the provided axis. Will rotate pi/2 radians.
    cubes: An array of THREE meshes.
    axis: A string, either 'x', 'y', or 'z', describing the axis around which to rotate.
    direction: 1 or -1, defines the rotation direction.
    stepCount (optional): Describes the number of steps in the animation. Default 8.
    speed (optional): The delay between steps in ms. Default 40.
  */
  rotateCubesOnAxis(cubes, axis, direction, stepCount, speed) {
    this.isRotating = true;
    stepCount = stepCount ? stepCount : 8;
    speed = speed ? speed : 40;
    const newGroup = new THREE.Group();
    cubes.forEach((cube) => {
      scene.remove(cube);
      newGroup.add(cube);
    });
    scene.add(newGroup);
    let counter = 0;
    const interval = setInterval(() => {
      switch (axis) {
        case 'x':
          newGroup.rotateX(direction * (Math.PI / 2) / stepCount);
          break;
        case 'y':
          newGroup.rotateY(direction * (Math.PI / 2) / stepCount);
          break;
        case 'z':
          newGroup.rotateZ(direction * (Math.PI / 2) / stepCount);
          break;
      }
      counter++;
      if (counter === stepCount) {
        scene.remove(newGroup);
        cubes.forEach((cube) => {
          scene.add(cube);
        });
        clearInterval(interval);
        roundPositions();
        this.isRotating = false;
        this.colorFaces();
      }
    }, speed);
  }

  rotateRightRight() {
    if (this.isRotating) {
      return;
    }
    const right = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
    const top = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

    right[2][0] = this.right[2][0].colorValue
    right[1][0] = this.right[1][0].colorValue
    right[0][0] = this.right[0][0].colorValue
    right[2][1] = this.right[2][1].colorValue
    right[1][1] = this.right[1][1].colorValue
    right[0][1] = this.right[0][1].colorValue
    right[2][2] = this.right[2][2].colorValue
    right[1][2] = this.right[1][2].colorValue
    right[0][2] = this.right[0][2].colorValue

    this.right[0][0].colorValue = right[2][0]
    this.right[0][1].colorValue = right[1][0]
    this.right[0][2].colorValue = right[0][0]

    this.right[1][0].colorValue = right[2][1]
    this.right[1][1].colorValue = right[1][1]
    this.right[1][2].colorValue = right[0][1]

    this.right[2][0].colorValue = right[2][2]
    this.right[2][1].colorValue = right[1][2]
    this.right[2][2].colorValue = right[0][2]

    top[0][2] = this.top[0][2].colorValue;
    top[1][2] = this.top[1][2].colorValue;
    top[2][2] = this.top[2][2].colorValue;
    this.top[0][2].colorValue = this.front[0][2].colorValue
    this.top[1][2].colorValue = this.front[1][2].colorValue
    this.top[2][2].colorValue = this.front[2][2].colorValue


    this.front[0][2].colorValue = this.bottom[0][2].colorValue
    this.front[1][2].colorValue = this.bottom[1][2].colorValue
    this.front[2][2].colorValue = this.bottom[2][2].colorValue

    this.bottom[0][2].colorValue = this.back[0][2].colorValue
    this.bottom[1][2].colorValue = this.back[1][2].colorValue
    this.bottom[2][2].colorValue = this.back[2][2].colorValue
    
    this.back[0][2].colorValue = top[0][2]
    this.back[1][2].colorValue = top[1][2]
    this.back[2][2].colorValue = top[2][2]

    this.rotateCubesOnAxis(this.getCubeArrayFromFace(this.right), 'x', -1);
  }

  rotateRightLeft() {
    if (this.isRotating) {
      return;
    }
    const right = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
    const front = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

    right[2][0] = this.right[2][0].colorValue
    right[1][0] = this.right[1][0].colorValue
    right[0][0] = this.right[0][0].colorValue
    right[2][1] = this.right[2][1].colorValue
    right[1][1] = this.right[1][1].colorValue
    right[0][1] = this.right[0][1].colorValue
    right[2][2] = this.right[2][2].colorValue
    right[1][2] = this.right[1][2].colorValue
    right[0][2] = this.right[0][2].colorValue

    this.right[2][0].colorValue = right[0][0]
    this.right[1][0].colorValue = right[0][1]
    this.right[0][0].colorValue = right[0][2]

    this.right[2][1].colorValue = right[1][0]
    this.right[1][1].colorValue = right[1][1]
    this.right[0][1].colorValue = right[1][2]

    this.right[2][2].colorValue = right[2][0]
    this.right[1][2].colorValue = right[2][1]
    this.right[0][2].colorValue = right[2][2]

    front[0][2] = this.front[0][2].colorValue;
    front[1][2] = this.front[1][2].colorValue;
    front[2][2] = this.front[2][2].colorValue;
    this.front[0][2].colorValue = this.top[0][2].colorValue
    this.front[1][2].colorValue = this.top[1][2].colorValue
    this.front[2][2].colorValue = this.top[2][2].colorValue

    this.top[0][2].colorValue = this.back[0][2].colorValue
    this.top[1][2].colorValue = this.back[1][2].colorValue
    this.top[2][2].colorValue = this.back[2][2].colorValue

    this.back[0][2].colorValue = this.bottom[0][2].colorValue
    this.back[1][2].colorValue = this.bottom[1][2].colorValue
    this.back[2][2].colorValue = this.bottom[2][2].colorValue
    
    this.bottom[0][2].colorValue = front[0][2]
    this.bottom[1][2].colorValue = front[1][2]
    this.bottom[2][2].colorValue = front[2][2]
  
    this.rotateCubesOnAxis(this.getCubeArrayFromFace(this.right), 'x', 1);
  }
}

const cd = new CubeData(cubes);
cd.colorFaces();

document.querySelector('#right-right-button').addEventListener('click', () => cd.rotateRightRight());
document.querySelector('#right-left-button').addEventListener('click', () => cd.rotateRightLeft());