import * as THREE from './node_modules/three/build/three.module.js';

export default class Cube {
  faces = {
    front: {
      cubeData: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
      rotationAxis: 'z',
      directionMultiplier: -1,
    },
    middleFrontBack: {
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
    middleTopBottom: {
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
    middleLeftRight: {
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
    [this.faces.middleLeftRight, -1],
    [this.faces.middleLeftRight, 1],
    [this.faces.middleTopBottom, -1],
    [this.faces.middleTopBottom, 1],
    [this.faces.middleFrontBack, -1],
    [this.faces.middleFrontBack, 1],
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
    [this.faces.middleLeftRight, 1],
    [this.faces.middleLeftRight, -1],
    [this.faces.middleTopBottom, 1],
    [this.faces.middleTopBottom, -1],
    [this.faces.middleFrontBack, 1],
    [this.faces.middleFrontBack, -1],
  ];
  stepsSinceLastSolved = [];
  isRotating = false;
  materials = [];

  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.generateMaterials();
    const cubes = this.generateCubes();
    cubes.forEach((cube) => {
      if (cube.position.y < 0) {
        this.faces.bottom.cubeData[-cube.position.z + 1][cube.position.x + 1] = { cube, colorValue: 0, tile: this.createTile(0, -0.15, 0, cube) };
      } else if (cube.position.y > 0) {
        this.faces.top.cubeData[cube.position.z + 1][cube.position.x + 1] = { cube, colorValue: 1, tile: this.createTile(0, 0.15, 0, cube) };
      } else {
        this.faces.middleTopBottom.cubeData[cube.position.z + 1][cube.position.x + 1] = { cube };
      }

      if (cube.position.z < 0) {
        this.faces.back.cubeData[cube.position.y + 1][cube.position.x + 1] = { cube, colorValue: 2, tile: this.createTile(0, 0, -0.15, cube) };
      } else if (cube.position.z > 0) {
        this.faces.front.cubeData[-cube.position.y + 1][cube.position.x + 1] = { cube, colorValue: 3, tile: this.createTile(0, 0, 0.15, cube)};
      } else {
        this.faces.middleFrontBack.cubeData[-cube.position.y + 1][cube.position.x + 1] = { cube }
      }

      if (cube.position.x < 0) {
        this.faces.left.cubeData[-cube.position.y + 1][cube.position.z + 1] = { cube, colorValue: 4, tile: this.createTile(-0.15, 0, 0, cube) };
      } else if (cube.position.x > 0) {
        this.faces.right.cubeData[-cube.position.y + 1][-cube.position.z + 1] = { cube, colorValue: 5, tile: this.createTile(0.15, 0, 0, cube) };
      } else {
        this.faces.middleLeftRight.cubeData[-cube.position.y + 1][-cube.position.z + 1] = { cube };
      }
    });
    this.addCubesToRotate();
    this.attachListeners();
    this.colorFaces();
  }

  createTile(x, y, z, cube) {
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const tile = new THREE.Mesh(geometry, this.materials[this.materials.length - 1]);
    tile.position.x = x;
    tile.position.y = y;
    tile.position.z = z;
    cube.add(tile);
    return tile;
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
    
          this.scene.add(cube);
          cubes.push(cube);
        }
      }
    }
    return cubes;
  }

  generateMaterials() {
    const redMat = new THREE.MeshToonMaterial({ color: 0xfc0f03  });
    const orangeMat = new THREE.MeshToonMaterial({ color: 0xff6200 });
    const greenMat = new THREE.MeshToonMaterial({ color: 0x0ba313 });
    const blueMat = new THREE.MeshToonMaterial({ color: 0x0a0dbf });
    const yellowMat = new THREE.MeshToonMaterial({ color: 0xf8fc03 });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xeeeeee });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x000000 });
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
    this.faces.middleFrontBack.cubesToRotate = [
      [this.faces.top.cubeData[1][0], this.faces.top.cubeData[1][1], this.faces.top.cubeData[1][2]],
      [this.faces.right.cubeData[0][1], this.faces.right.cubeData[1][1], this.faces.right.cubeData[2][1]],
      [this.faces.bottom.cubeData[1][2], this.faces.bottom.cubeData[1][1], this.faces.bottom.cubeData[1][0]],
      [this.faces.left.cubeData[2][1], this.faces.left.cubeData[1][1], this.faces.left.cubeData[0][1]],
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
    this.faces.middleLeftRight.cubesToRotate = [
      [this.faces.top.cubeData[2][1], this.faces.top.cubeData[1][1], this.faces.top.cubeData[0][1]],
      [this.faces.front.cubeData[2][1], this.faces.front.cubeData[1][1], this.faces.front.cubeData[0][1]],
      [this.faces.bottom.cubeData[2][1], this.faces.bottom.cubeData[1][1], this.faces.bottom.cubeData[0][1]],
      [this.faces.back.cubeData[2][1], this.faces.back.cubeData[1][1], this.faces.back.cubeData[0][1]],
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
    this.faces.middleTopBottom.cubesToRotate = [
      [this.faces.front.cubeData[1][0], this.faces.front.cubeData[1][1], this.faces.front.cubeData[1][2]],
      [this.faces.left.cubeData[1][0], this.faces.left.cubeData[1][1], this.faces.left.cubeData[1][2]],
      [this.faces.back.cubeData[1][2], this.faces.back.cubeData[1][1], this.faces.back.cubeData[1][0]],
      [this.faces.right.cubeData[1][0], this.faces.right.cubeData[1][1], this.faces.right.cubeData[1][2]],
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

    document.querySelector('#middle-left-right-left-button').addEventListener('click', () => this.rotateFace(this.faces.middleLeftRight, -1));
    document.querySelector('#middle-left-right-right-button').addEventListener('click', () => this.rotateFace(this.faces.middleLeftRight, 1));

    document.querySelector('#right-left-button').addEventListener('click', () => this.rotateFace(this.faces.right, -1));
    document.querySelector('#right-right-button').addEventListener('click', () => this.rotateFace(this.faces.right, 1));

    document.querySelector('#front-left-button').addEventListener('click', () => this.rotateFace(this.faces.front, -1));
    document.querySelector('#front-right-button').addEventListener('click', () => this.rotateFace(this.faces.front, 1));

    document.querySelector('#middle-front-back-left-button').addEventListener('click', () => this.rotateFace(this.faces.middleFrontBack, -1));
    document.querySelector('#middle-front-back-right-button').addEventListener('click', () => this.rotateFace(this.faces.middleFrontBack, 1));

    document.querySelector('#back-left-button').addEventListener('click', () => this.rotateFace(this.faces.back, -1));
    document.querySelector('#back-right-button').addEventListener('click', () => this.rotateFace(this.faces.back, 1));

    document.querySelector('#top-left-button').addEventListener('click', () => this.rotateFace(this.faces.top, -1));
    document.querySelector('#top-right-button').addEventListener('click', () => this.rotateFace(this.faces.top, 1));

    document.querySelector('#middle-top-bottom-left-button').addEventListener('click', () => this.rotateFace(this.faces.middleTopBottom, -1));
    document.querySelector('#middle-top-bottom-right-button').addEventListener('click', () => this.rotateFace(this.faces.middleTopBottom, 1));

    document.querySelector('#bottom-left-button').addEventListener('click', () => this.rotateFace(this.faces.bottom, -1));
    document.querySelector('#bottom-right-button').addEventListener('click', () => this.rotateFace(this.faces.bottom, 1));

    document.querySelector('#scramble-button').addEventListener('click', () => this.scramble());
    document.querySelector('#solve-button').addEventListener('click', () => this.undoToPreviousSolve());

    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();

    canvas.addEventListener('mousedown', (event) => {
     const obj = this.pick(
        {
          x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((event.clientY - rect.top) / rect.height) * -2 + 1,
        },
        this.scene,
        this.camera,
      );
      if (obj) {
        this.originalPoint = obj.point;
        this.pickedObject = obj.object;
      }
    });
    canvas.addEventListener('mouseup', () => {
      if (this.originalPoint && this.currentPoint) {
        const change = {
          x: this.originalPoint.x - this.currentPoint.x,
          y: this.originalPoint.y - this.currentPoint.y,
          z: this.originalPoint.z - this.currentPoint.z,
        }
        const faces = [];
        let tileFace;
        for (const key in this.faces) {
          if (this.isCubeInFace(this.pickedObject.parent, this.faces[key])) {
            faces.push({ face: this.faces[key], key });
          }
          if (this.isTileInFace(this.pickedObject, this.faces[key])) {
            tileFace = this.faces[key];
          }
        }

        const max = Math.max(Math.abs(change.x), Math.abs(change.y), Math.abs(change.z));
        for (const key in change) {
          if (max === Math.abs(change[key])) {
            faces.forEach((face) => {
              if (face.face.rotationAxis !== key && face.face.rotationAxis !== tileFace.rotationAxis) {
                let direction = change[key] / Math.abs(change[key]);
                if (
                  (key === 'x' && (tileFace === this.faces.front || tileFace === this.faces.bottom)) ||
                  (key === 'y' && (tileFace === this.faces.back || tileFace === this.faces.right)) ||
                  (key === 'z' && (tileFace === this.faces.top || tileFace === this.faces.left))
                ) {
                  direction *= -1;
                }
                this.rotateFace(face.face, direction * face.face.directionMultiplier);
              }
            });
          }
        }

      }
      this.pickedObject = undefined;
      this.originalPoint = undefined;
      this.currentPoint = undefined;
    });
    canvas.addEventListener('mousemove', (event) => {
      if (!this.originalPoint) {
        return;
      }
      const obj = this.pick(
        {
          x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((event.clientY - rect.top) / rect.height) * -2 + 1,
        },
        this.scene,
        this.camera,
      );
      if (obj !== undefined) {
        this.currentPoint = obj.point
      }
    });
  }

  isTileInFace(tile, face) {
    return !!face.cubeData.find((row) => !!row.find((data) => data.tile === tile));
  }
  isCubeInFace(cube, face) {
    return !!face.cubeData.find((row) => !!row.find((data) => data.cube === cube));
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
    for (const key in this.faces) {
      this.faces[key].cubeData.forEach((row) => {
        row.forEach((cubeData) => {
          if (cubeData.tile) {
            cubeData.tile.material = this.materials[cubeData.colorValue];
          }
        });
      });
    }
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

    const cubesToRotate = face.cubesToRotate.slice();
    if (direction === 1) {
      // If no color is specified, it's one of the middle rows.
      if (face.cubeData[0][0].colorValue !== undefined) this.rotateFaceRight(face.cubeData);
    } else if (direction === -1) {
      if (face.cubeData[0][0].colorValue !== undefined) this.rotateFaceLeft(face.cubeData);
      cubesToRotate.reverse();
    }

    this.rotateColorValues(cubesToRotate);
    this.rotateCubesOnAxis(this.getCubeArrayFromFace(face.cubeData), face.rotationAxis, direction * face.directionMultiplier, stepCount, speed, cb);


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
      return intersectedObjects[0];
    }
  }
}