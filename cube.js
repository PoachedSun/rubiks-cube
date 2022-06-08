import ComponentCube from './component-cube.js';
import * as THREE from './node_modules/three/build/three.module.js';

export default class Cube {
  faces = {};

  stepsSinceLastSolved = [];
  isRotating = false;
  materials = [];

  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.cubes = [];
    this.cubeSize = 3;
    this.positions = [];
    for (let i = this.cubeSize - 1; i >= 0; i--) {
      this.positions.push(((this.cubeSize - 1) * 0.5) - i)
    }
    for (let i = 0; i < this.cubeSize; i++) {
      for (let j = 0; j < this.cubeSize; j++) {
        for (let k = 0; k < this.cubeSize; k++) {
          const cube = new ComponentCube(this.positions[k], this.positions[i], this.positions[j]);
          scene.add(cube.cube);
          this.cubes.push(cube);
        }
      }
    }

    this.xFaces = [];
    this.yFaces = [];
    this.zFaces = [];
    for (let i = 0; i < this.positions.length; i++) {
      this.xFaces.push(this.cubes.filter((cube) => cube.cube.position.x === this.positions[i]));
      this.yFaces.push(this.cubes.filter((cube) => cube.cube.position.y === this.positions[i]));
      this.zFaces.push(this.cubes.filter((cube) => cube.cube.position.z === this.positions[i]));
    }
    this.faces = [...this.xFaces, ...this.yFaces, ...this.zFaces];
    this.namedFaces = {
      left: this.xFaces[0],
      right: this.xFaces[this.xFaces.length - 1],
      bottom: this.yFaces[0],
      top: this.yFaces[this.yFaces.length - 1],
      back: this.zFaces[0],
      front: this.zFaces[this.zFaces.length - 1],
    }

    for (const key in this.namedFaces) {
      this.namedFaces[key].forEach((cube) => cube.showFace(key));
    }

    this.attachListeners();
  }
  
  attachListeners() {
    document.querySelector('#scramble-button').addEventListener('click', () => this.scramble());
    document.querySelector('#solve-button').addEventListener('click', () => this.undoToPreviousSolve());

    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();

    canvas.addEventListener('mousedown', (event) => {
      if (event.buttons === 1) {
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
        this.faces.forEach((face) => {
          if (this.isCubeInFace(this.pickedObject.parent, face)) {
            faces.push(face);
          }
          if (this.isTileInFace(this.pickedObject, face)) {
            tileFace = face;
          }
        });

        const max = Math.max(Math.abs(change.x), Math.abs(change.y), Math.abs(change.z));
        for (const key in change) {
          if (max === Math.abs(change[key])) {
            faces.forEach((face) => {
              if (this.getAxisFromFace(face) !== key && this.getAxisFromFace(face) !== this.getAxisFromFace(tileFace)) {
                let direction = change[key] / Math.abs(change[key]);
                if (
                  (key === 'x' && (tileFace === this.namedFaces.front || tileFace === this.namedFaces.bottom)) ||
                  (key === 'y' && (tileFace === this.namedFaces.back || tileFace === this.namedFaces.right)) ||
                  (key === 'z' && (tileFace === this.namedFaces.top || tileFace === this.namedFaces.left))
                ) {
                  direction *= -1;
                }
                this.rotateFace(face, direction);
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
    return !!face.find((cube) => cube.containsTile(tile, this.getFaceName(face)));
  }
  isCubeInFace(cube, face) {
    return !!face.find((c) => c.cube === cube);
  }

  getFaceName(face) {
    for (const key in this.namedFaces) {
      if (this.namedFaces[key] === face) {
        return key;
      } 
    }
  }

  removeFace(face) {
    face.forEach((cube) => {
      this.scene.remove(cube.cube);
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
      this.scene.remove(cube.cube);
      newGroup.add(cube.cube);
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
          this.scene.add(cube.cube);
        });
        clearInterval(interval);
        this.isRotating = false;
        if (cb) {
          cb();
        }
      }
    }, speed);
  }

  rotateFace(face, direction, stepCount, speed, cb) {
    if (this.rotating) return;
    this.rotating = true;

    const axis = this.getAxisFromFace(face);

    const callback = () => {
      this.rotating = false;
      let axis2, axis3
      switch (axis) {
        case 'x':
          axis2 = 'z';
          axis3 = 'y';
          break;
        case 'y':
          axis2 = 'x';
          axis3 = 'z';
          break;
        case 'z':
          axis2 = 'y';
          axis3 = 'x';
          break;
      }
      const colors = [];
      for (let i = 0; i < this.cubeSize; i++) {
        const row = [];
        for (let j = 0; j < this.cubeSize; j++) {
          row.push(undefined);
        }
        colors.push(row);
      }
      face.forEach((cube) => {
        colors[cube.cube.position[axis2] + (this.positions[0] * -1)][cube.cube.position[axis3] + (this.positions[0] * -1)] = cube.getColors();
      });
      face.forEach((cube) => {
        cube.assignColors(colors[(cube.cube.position[axis3] * -1 * direction) + (this.positions[0] * -1)][(cube.cube.position[axis2] * direction) + (this.positions[0] * -1)]);
        cube.rotate(axis, direction);
      });

      if (this.isSolved()) {
        document.querySelector('h5').hidden = false;
        this.stepsSinceLastSolved = [];
      } else {
        document.querySelector('h5').hidden = true;
        this.stepsSinceLastSolved.push({ face, direction });
      }

      if (cb !== undefined) {
        cb();
      }
    }
    this.rotateCubesOnAxis(face, axis, direction, stepCount, speed, callback);
    
  }

  rotateRandomFace(stepCount, speed, cb) {
    const direction = Math.floor(Math.random() * 2) ? 1 : -1;
    const face = this.faces[Math.floor(Math.random() * this.faces.length)];

    this.rotateFace(face, direction, stepCount, speed, cb);
  }

  getAxisFromFace(face) {
    if (this.xFaces.includes(face)) {
      return 'x';
    } else if (this.yFaces.includes(face)) {
      return 'y';
    } else if (this.zFaces.includes(face)) {
      return 'z';
    }
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
    this.rotateRandomFace(stepCount, speed, cb);
  }

  /* Checks if each cube on each face has the same color. */
  isSolved() {
    const colors = JSON.stringify(this.cubes[0].getColors());
    for (let i = 0; i < this.cubes.length; i++) {
      if (JSON.stringify(this.cubes[i].getColors()) !== colors) {
        return false;
      }
    }
    return true;
  }

  undoToPreviousSolve() {
    const speed = 20;
    const stepCount = 8;
    const turnParams = this.stepsSinceLastSolved.slice().reverse();

    let counter = 0;
    const cb = () => {
      if (counter < turnParams.length) {
        this.rotateFace(turnParams[counter].face, turnParams[counter].direction * -1, stepCount, speed, cb);
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