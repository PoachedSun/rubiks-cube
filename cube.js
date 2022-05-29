import * as THREE from './node_modules/three/build/three.module.js';

export default class Cube {
  faces = {
    front: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'z',
      directionMultiplier: -1,
    },
    back: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'z',
      directionMultiplier: 1,
    },
    top: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'y',
      directionMultiplier: -1,
    },
    bottom: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'y',
      directionMultiplier: 1,
    },
    left: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'x',
      directionMultiplier: 1,
    },
    right: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'x',
      directionMultiplier: -1,
    },
  }
  rotationMethodParams = [
    [this.faces.left, -1],
    [this.faces.left, 1],
    [this.faces.right, -1],
    [this.faces.right, 1],
    [this.faces.front, -1],
    [this.faces.front, 1],
    [this.faces.back, -1],
    [this.faces.back, 1],
    [this.faces.top, -1],
    [this.faces.top, 1],
    [this.faces.bottom, -1],
    [this.faces.bottom, 1],
  ];
  rotationMethodParamsOpposites = [
    [this.faces.left, 1],
    [this.faces.left, -1],
    [this.faces.right, 1],
    [this.faces.right, -1],
    [this.faces.front, 1],
    [this.faces.front, -1],
    [this.faces.back, 1],
    [this.faces.back, -1],
    [this.faces.top, 1],
    [this.faces.top, -1],
    [this.faces.bottom, 1],
    [this.faces.bottom, -1],
  ];
  stepsSinceLastSolved = [];
  isRotating = false;
  materials = [];

  constructor(scene) {
    this.scene = scene;
    this.generateMaterials();
    const cubes = this.generateCubes();
    cubes.forEach((cube) => {
      if (cube.position.y < 0) {
        this.faces.bottom.cubeData[-cube.position.z + 1][cube.position.x + 1] = { cube, colorValue: 0 };
      } else if (cube.position.y > 0) {
        this.faces.top.cubeData[cube.position.z + 1][cube.position.x + 1] = { cube, colorValue: 1 };
      }

      if (cube.position.z < 0) {
        this.faces.back.cubeData[cube.position.y + 1][cube.position.x + 1] = { cube, colorValue: 2 };
      } else if (cube.position.z > 0) {
        this.faces.front.cubeData[-cube.position.y + 1][cube.position.x + 1] = { cube, colorValue: 3 };
      }

      if (cube.position.x < 0) {
        this.faces.left.cubeData[-cube.position.y + 1][cube.position.z + 1] = { cube, colorValue: 4 };
      } else if (cube.position.x > 0) {
        this.faces.right.cubeData[-cube.position.y + 1][-cube.position.z + 1] = { cube, colorValue: 5 };
      }
    });
    this.addCubesToRotate();
    this.attachListeners();
    this.colorFaces();
  }

  generateCubes() {
    const cubes = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          const boxWidth = 1;
          const boxHeight = 1;
          const boxDepth = 1;
          const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
          const blackMat = this.materials[this.materials.length - 1];
          const defaultMaterials = [blackMat, blackMat, blackMat, blackMat, blackMat, blackMat];
          const cube = new THREE.Mesh(geometry, defaultMaterials);
          cube.position.y = (1 - i) * boxHeight;
          cube.position.z = (1 - j) * boxDepth;
          cube.position.x = (1 - k) * boxWidth;
    
          const geo = new THREE.EdgesGeometry(cube.geometry);
          const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
          const wireframe = new THREE.LineSegments(geo, mat);
          cube.add(wireframe);
    
          this.scene.add(cube);
          cubes.push(cube);
        }
      }
    }
    return cubes;
  }

  generateMaterials() {
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
      color: 0xeeeeee,
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
    this.materials.push(...[
      orangeMat,
      redMat,
      blueMat,
      greenMat,
      yellowMat,
      whiteMat,
      blackMat,
    ]);
  }

  addCubesToRotate() {
    this.faces.front.cubesToRotate = [
      [this.faces.top.cubeData[2][0], this.faces.top.cubeData[2][1], this.faces.top.cubeData[2][2]],
      [this.faces.right.cubeData[0][0], this.faces.right.cubeData[1][0], this.faces.right.cubeData[2][0]],
      [this.faces.bottom.cubeData[0][2], this.faces.bottom.cubeData[0][1], this.faces.bottom.cubeData[0][0]],
      [this.faces.left.cubeData[2][2], this.faces.left.cubeData[1][2], this.faces.left.cubeData[0][2]],
    ];
    this.faces.back.cubesToRotate = [
      [this.faces.top.cubeData[0][2], this.faces.top.cubeData[0][1], this.faces.top.cubeData[0][0]],
      [this.faces.left.cubeData[0][0], this.faces.left.cubeData[1][0], this.faces.left.cubeData[2][0]],
      [this.faces.bottom.cubeData[2][0], this.faces.bottom.cubeData[2][1], this.faces.bottom.cubeData[2][2]],
      [this.faces.right.cubeData[2][2], this.faces.right.cubeData[1][2], this.faces.right.cubeData[0][2]],
    ];

    this.faces.left.cubesToRotate = [
      [this.faces.top.cubeData[0][0], this.faces.top.cubeData[1][0], this.faces.top.cubeData[2][0]],
      [this.faces.front.cubeData[0][0], this.faces.front.cubeData[1][0], this.faces.front.cubeData[2][0]],
      [this.faces.bottom.cubeData[0][0], this.faces.bottom.cubeData[1][0], this.faces.bottom.cubeData[2][0]],
      [this.faces.back.cubeData[0][0], this.faces.back.cubeData[1][0], this.faces.back.cubeData[2][0]],
    ];
    this.faces.right.cubesToRotate = [
      [this.faces.top.cubeData[0][2], this.faces.top.cubeData[1][2], this.faces.top.cubeData[2][2]],
      [this.faces.back.cubeData[0][2], this.faces.back.cubeData[1][2], this.faces.back.cubeData[2][2]],
      [this.faces.bottom.cubeData[0][2], this.faces.bottom.cubeData[1][2], this.faces.bottom.cubeData[2][2]],
      [this.faces.front.cubeData[0][2], this.faces.front.cubeData[1][2], this.faces.front.cubeData[2][2]],
    ]

    this.faces.top.cubesToRotate = [
      [this.faces.front.cubeData[0][2], this.faces.front.cubeData[0][1], this.faces.front.cubeData[0][0]],
      [this.faces.left.cubeData[0][2], this.faces.left.cubeData[0][1], this.faces.left.cubeData[0][0]],
      [this.faces.back.cubeData[2][0], this.faces.back.cubeData[2][1], this.faces.back.cubeData[2][2]],
      [this.faces.right.cubeData[0][2], this.faces.right.cubeData[0][1], this.faces.right.cubeData[0][0]],
    ]
    this.faces.bottom.cubesToRotate = [
      [this.faces.front.cubeData[2][0], this.faces.front.cubeData[2][1], this.faces.front.cubeData[2][2]],
      [this.faces.right.cubeData[2][0], this.faces.right.cubeData[2][1], this.faces.right.cubeData[2][2]],
      [this.faces.back.cubeData[0][2], this.faces.back.cubeData[0][1], this.faces.back.cubeData[0][0]],
      [this.faces.left.cubeData[2][0], this.faces.left.cubeData[2][1], this.faces.left.cubeData[2][2]],
    ]
  }
  
  attachListeners() {
    document.querySelector('#left-left-button').addEventListener('click', () => this.rotateFace(this.faces.left, -1));
    document.querySelector('#left-right-button').addEventListener('click', () => this.rotateFace(this.faces.left, 1));

    document.querySelector('#right-left-button').addEventListener('click', () => this.rotateFace(this.faces.right, -1));
    document.querySelector('#right-right-button').addEventListener('click', () => this.rotateFace(this.faces.right, 1));

    document.querySelector('#front-left-button').addEventListener('click', () => this.rotateFace(this.faces.front, -1));
    document.querySelector('#front-right-button').addEventListener('click', () => this.rotateFace(this.faces.front, 1));

    document.querySelector('#back-left-button').addEventListener('click', () => this.rotateFace(this.faces.back, -1));
    document.querySelector('#back-right-button').addEventListener('click', () => this.rotateFace(this.faces.back, 1));

    document.querySelector('#top-left-button').addEventListener('click', () => this.rotateFace(this.faces.top, -1));
    document.querySelector('#top-right-button').addEventListener('click', () => this.rotateFace(this.faces.top, 1));

    document.querySelector('#bottom-left-button').addEventListener('click', () => this.rotateFace(this.faces.bottom, -1));
    document.querySelector('#bottom-right-button').addEventListener('click', () => this.rotateFace(this.faces.bottom, 1));

    document.querySelector('#scramble-button').addEventListener('click', () => this.scramble());
    document.querySelector('#solve-button').addEventListener('click', () => this.undoToPreviousSolve());
  }

  removeFace(face) {
    face.forEach((row) => {
      row.forEach((cubeData) => {
        this.scene.remove(cubeData.cube);
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
    const MaterialOrder = {
      RIGHT: 0,
      LEFT: 1,
      TOP: 2,
      BOTTOM: 3,
      FRONT: 4,
      BACK: 5,
    }
    this.faces.front.cubeData.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.FRONT] = this.materials[cubeData.colorValue];
      });
    });
    this.faces.back.cubeData.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.BACK] = this.materials[cubeData.colorValue];
      });
    });
    this.faces.left.cubeData.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.LEFT] = this.materials[cubeData.colorValue];
      });
    });
    this.faces.right.cubeData.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.RIGHT] = this.materials[cubeData.colorValue];
      });
    });
    this.faces.top.cubeData.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.TOP] = this.materials[cubeData.colorValue];
      });
    });
    this.faces.bottom.cubeData.forEach((row) => {
      row.forEach((cubeData) => {
        cubeData.cube.material[MaterialOrder.BOTTOM] = this.materials[cubeData.colorValue];
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
  rotateCubesOnAxis(cubes, axis, direction, stepCount, speed, cb) {
    this.isRotating = true;
    stepCount = stepCount ? stepCount : 8;
    speed = speed ? speed : 40;
    const newGroup = new THREE.Group();
    cubes.forEach((cube) => {
      this.scene.remove(cube);
      newGroup.add(cube);
    });
    this.scene.add(newGroup);
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
        this.scene.remove(newGroup);
        cubes.forEach((cube) => {
          this.scene.add(cube);
        });
        clearInterval(interval);
        this.isRotating = false;
        this.colorFaces();
        if (cb) {
          cb();
        }
      }
    }, speed);
  }

  rotateFaceRight(face) {
    const colorValues = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

    colorValues[2][0] = face[2][0].colorValue;
    colorValues[1][0] = face[1][0].colorValue;
    colorValues[0][0] = face[0][0].colorValue;
    colorValues[2][1] = face[2][1].colorValue;
    colorValues[1][1] = face[1][1].colorValue;
    colorValues[0][1] = face[0][1].colorValue;
    colorValues[2][2] = face[2][2].colorValue;
    colorValues[1][2] = face[1][2].colorValue;
    colorValues[0][2] = face[0][2].colorValue;

    face[0][0].colorValue = colorValues[2][0];
    face[0][1].colorValue = colorValues[1][0];
    face[0][2].colorValue = colorValues[0][0];
    face[1][0].colorValue = colorValues[2][1];
    face[1][1].colorValue = colorValues[1][1];
    face[1][2].colorValue = colorValues[0][1];
    face[2][0].colorValue = colorValues[2][2];
    face[2][1].colorValue = colorValues[1][2];
    face[2][2].colorValue = colorValues[0][2];
  }

  /*
    Takes a 4x3 array of cube data. The color values in each will be shuffled down (values in row 0 -> row 1, row 1 -> row 2, ..., row 4 -> row 1).
  */
  rotateColorValues(cubeArray) {
    let previousRow = cubeArray[cubeArray.length - 1].map((cubeData) => cubeData.colorValue);
    let currentRow;
    for (let i = 0; i < cubeArray.length; i++) {
      currentRow = cubeArray[i];
      const temp = previousRow;
      previousRow = currentRow.map((cubeData) => cubeData.colorValue);
      for (let j = 0; j < cubeArray[i].length; j++) {
        cubeArray[i][j].colorValue = temp[j];
      }
    }
  }

  rotateFaceLeft(face) { 
    const colorValues = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

    colorValues[2][0] = face[2][0].colorValue;
    colorValues[1][0] = face[1][0].colorValue;
    colorValues[0][0] = face[0][0].colorValue;
    colorValues[2][1] = face[2][1].colorValue;
    colorValues[1][1] = face[1][1].colorValue;
    colorValues[0][1] = face[0][1].colorValue;
    colorValues[2][2] = face[2][2].colorValue;
    colorValues[1][2] = face[1][2].colorValue;
    colorValues[0][2] = face[0][2].colorValue;

    face[2][0].colorValue = colorValues[0][0];
    face[1][0].colorValue = colorValues[0][1];
    face[0][0].colorValue = colorValues[0][2];
    face[2][1].colorValue = colorValues[1][0];
    face[1][1].colorValue = colorValues[1][1];
    face[0][1].colorValue = colorValues[1][2];
    face[2][2].colorValue = colorValues[2][0];
    face[1][2].colorValue = colorValues[2][1];
    face[0][2].colorValue = colorValues[2][2];
  }

  rotateFace(face, direction, stepCount, speed, cb) {
    if (this.isRotating) {
      return;
    }

    if (direction === 1) {
      this.rotateFaceRight(face.cubeData);
      this.rotateColorValues(face.cubesToRotate.slice());
      this.rotateCubesOnAxis(this.getCubeArrayFromFace(face.cubeData), face.rotationAxis, direction * face.directionMultiplier, stepCount, speed, cb);
    } else if (direction === -1) {
      this.rotateFaceLeft(face.cubeData);
      this.rotateColorValues(face.cubesToRotate.slice().reverse());
      this.rotateCubesOnAxis(this.getCubeArrayFromFace(face.cubeData), face.rotationAxis, direction * face.directionMultiplier, stepCount, speed, cb);
    }

    if (this.isSolved()) {
      document.querySelector('h5').hidden = false;
      this.stepsSinceLastSolved = [];
    } else {
      document.querySelector('h5').hidden = true;
      this.stepsSinceLastSolved.push(this.rotationMethodParams.findIndex((params) => params[0] === face && params[1] === direction));
    }
  }

  getRandomRotationParams() {
    return this.rotationMethodParams[Math.floor(Math.random() * this.rotationMethodParams.length)];
  }

  rotateRandomFace(stepCount, speed, cb) {
    const rotationParams = this.getRandomRotationParams();
    this.rotateFace(rotationParams[0], rotationParams[1], stepCount, speed, cb);
  }

  scramble() {
    const speed = 20;
    const stepCount = 8;
    const turns = Math.floor(Math.random() * 20) + 30;

    let counter = 0;
    const cb = () => {
      counter++;
      if (counter < turns) {
        this.rotateRandomFace(stepCount, speed, cb);
      }
    }
    const rotationParams = this.getRandomRotationParams();
    this.rotateFace(rotationParams[0], rotationParams[1], stepCount, speed, cb);
  }

  /* Checks if each cube on each face has the same color. */
  isSolved() {
    for (const prop in this.faces) {
      let colorVal = this.faces[prop].cubeData[0][0].colorValue;
      for (let i = 0; i < this.faces[prop].cubeData.length; i++) {
        for (let j = 0; j < this.faces[prop].cubeData[i].length; j++) {
          if (this.faces[prop].cubeData[i][j].colorValue !== colorVal) {
            return false;
          }
        }
      }
    }
    return true;
  }

  undoToPreviousSolve() {
    const speed = 20;
    const stepCount = 8;
    const turnParams = this.stepsSinceLastSolved.slice().reverse().map((index) => this.rotationMethodParamsOpposites[index]);

    let counter = 0;
    const cb = () => {
      if (counter < turnParams.length) {
        this.rotateFace(turnParams[counter][0], turnParams[counter][1], stepCount, speed, cb);
      }
      counter++;
    }
    cb();
  }

  pick(normalizedPosition, scene, camera) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(normalizedPosition, camera);
    const intersectedObjects = raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      pickedObject = intersectedObjects[0].object;
    }
  }
}