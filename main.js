import * as THREE from './js/three.module.min.js';
import { OrbitControls } from './js/OrbitControls.js';
import * as dat from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

// === Basic Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);

// === Lighting ===
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(10, 10, 10);
scene.add(light);

// === Relativistic Time Dilation ===
const c = 1; // speed of light (in arbitrary units)

function lorentzFactor(v) {
  return 1 / Math.sqrt(1 - (v * v) / (c * c));
}

// === Observers with Clocks ===
function createObserver(color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );

  const handGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  const handMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const hand = new THREE.Mesh(handGeometry, handMaterial);
  hand.position.y = 1;
  mesh.add(hand);

  scene.add(mesh);

  return {
    mesh,
    hand,
    time: 0,
    velocity: 0,
  };
}

const observer1 = createObserver(0x00ffff);
const observer2 = createObserver(0xff00ff);
observer2.mesh.position.x = 5;

// === Planets ===
function addPlanet(x, y, z, radius = 2, color = 0x888888) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(x, y, z);
  scene.add(planet);
}

// === GUI Controls ===
const gui = new dat.GUI({ width: 300 });

const settings = {
  observer1Velocity: 0.0,
  observer2Velocity: 0.0,
  addPlanet: () => {
    const x = Math.random() * 20 - 10;
    const z = Math.random() * 20 - 10;
    const y = Math.random() * 4 - 2;
    addPlanet(x, y, z, Math.random() * 2 + 1, Math.random() * 0xffffff);
  },
};

gui.add(settings, 'observer1Velocity', 0, 0.99, 0.01).onChange(v => {
  observer1.velocity = v;
});
gui.add(settings, 'observer2Velocity', 0, 0.99, 0.01).onChange(v => {
  observer2.velocity = v;
});
gui.add(settings, 'addPlanet').name('Add Random Planet');

// === Animate Loop ===
function animate() {
  requestAnimationFrame(animate);

  const gamma1 = lorentzFactor(observer1.velocity);
  const gamma2 = lorentzFactor(observer2.velocity);

  observer1.time += 0.01 / gamma1;
  observer2.time += 0.01 / gamma2;

  observer1.hand.rotation.z = -observer1.time;
  observer2.hand.rotation.z = -observer2.time;

  controls.update();
  renderer.render(scene, camera);
}

animate();

// === Resize Handler ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
