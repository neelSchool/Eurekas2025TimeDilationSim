// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera1.position.z = 15;
camera2.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls1 = new THREE.OrbitControls(camera1, renderer.domElement);
const controls2 = new THREE.OrbitControls(camera2, renderer.domElement);

// Lights
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Observers (with clocks)
function createObserver(color) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );

  const handGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
  const handMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const hand = new THREE.Mesh(handGeometry, handMaterial);
  hand.position.y = 1;
  sphere.add(hand);
  scene.add(sphere);
  return { body: sphere, hand, time: 0, velocity: 0.0 };
}

const observer1 = createObserver(0x00ffff);
const observer2 = createObserver(0xff00ff);
observer2.body.position.x = 5;

// Lorentz Factor
const c = 1;
function lorentzFactor(v) {
  return 1 / Math.sqrt(1 - (v * v) / (c * c));
}

// Add a Planet
function addPlanet(x, y, z, size = 2, color = 0x888888) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(x, y, z);
  scene.add(planet);
}

// GUI
const gui = new dat.GUI({ width: 300 });
const settings = {
  observer1Velocity: 0.0,
  observer2Velocity: 0.0,
  addPlanet: () => addPlanet(Math.random() * 10 - 5, 0, Math.random() * 10 - 5)
};

gui.add(settings, "observer1Velocity", 0, 0.99).onChange(v => (observer1.velocity = v));
gui.add(settings, "observer2Velocity", 0, 0.99).onChange(v => (observer2.velocity = v));
gui.add(settings, "addPlanet");

// Animate
function animate() {
  requestAnimationFrame(animate);

  controls1.update();
  controls2.update();

  const gamma1 = lorentzFactor(observer1.velocity);
  const gamma2 = lorentzFactor(observer2.velocity);

  observer1.time += 0.01 / gamma1;
  observer2.time += 0.01 / gamma2;

  observer1.hand.rotation.z = -observer1.time;
  observer2.hand.rotation.z = -observer2.time;

  renderer.render(scene, camera1); // or use camera2 to compare views
}

animate();

// Responsive canvas
window.addEventListener("resize", () => {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera2.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
  camera2.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
