import * as THREE from 'https://cdn.skypack.dev/three@0.135.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import * as dat from './node_modules/dat.gui/build/dat.gui.module.js';
import { gsap } from '../node_modules/gsap/index.js';


// gui for the control
const gui = new dat.GUI();

// this world uses for default value
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  }
}

// this gui is the controls on the top right
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

// generate the plane
function generatePlane() {
  planeMesh.geometry.dispose()

  // make plane with world.plane values
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments)

  // vertice the position randomize
  const { array } = planeMesh.geometry.attributes.position;
  const randomValues = [];

  // looping the randomize of plane shape
  // to make it looks like a mountain
  for (let i = 0; i < array.length; i++) {

    // cuz its x y z, so just do it while the counter reach 3
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      // array[i] is x
      array[i] = x + (Math.random() - 0.5) * 3;

      // array[i+1] is y
      array[i + 1] = y + (Math.random() - 0.5) * 3;

      // and array [i+2] is z
      array[i + 2] = z + (Math.random() - 0.5) * 3;
    }

    // push randomValues while looping
    randomValues.push(Math.random() * Math.PI * 2)
  }

  planeMesh.geometry.attributes.position.randomValues =
    randomValues;

  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;

  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, .19, 0.4)
  }

  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();

// this one same as document.innerWidth
// this make renderer size same as windows height and width
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

// append the renderer
document.body.appendChild(renderer.domElement);

// add orbit controls (THREE provides this)
new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;

// add plane with width, height, widthSegments, and heightSegments
// from world plane 
const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments);

// add texture phong
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

generatePlane()

const light = new THREE.DirectionalLight(0xffffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const mouse = {
  x: undefined,
  y: undefined
}

let frame = 0;

function animate() {
  requestAnimationFrame(animate)
  frame += 0.01;
  renderer.render(scene, camera);
  // hover 
  raycaster.setFromCamera(mouse, camera)

  // this is = planeMesh.geometry.attributes.position.array
  // && planeMesh.geometry.attributes.position.originalPosition
  // && planeMesh.geometry.attributes.position.randomValues
  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] +
      Math.cos(frame + randomValues[i]) * 0.005;
    // y
    array[i + 1] = originalPosition[i + 1] +
      Math.sin(frame + randomValues[i + 1]) * 0.005;
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;

  // is it intercept with the object or nah
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate = true
      }
    })
  }
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // planeMesh.rotation.x += 0.01;
}

animate()

addEventListener('mousemove', (event) => {

  // left is negative, right is positive
  mouse.x = (event.clientX / innerWidth) * 2 - 1;

  // up is positive, down is negative
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})

addEventListener('resize', function () {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
})