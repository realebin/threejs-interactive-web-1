import * as THREE from "https://cdn.skypack.dev/three@0.135.0/build/three.module.js";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
console.log(scene);
console.log(camera);
console.log(renderer);

// this one same as document.innerWidth
// this make renderer size same as windows height and width
renderer.setSize(innerWidth, innerHeight);

// append the renderer
document.body.appendChild(renderer.domElement);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(boxGeometry, material);

scene.add(mesh);

camera.position.z = 5;

renderer.render(scene, camera);
