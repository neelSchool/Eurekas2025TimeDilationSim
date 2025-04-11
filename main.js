import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Scene Setup
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Observer Setup
const observer1Camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const observer2Camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
observer1Camera.position.set(0, 0, 5);
observer2Camera.position.set(5, 0, 5);

// Observer Clocks
const observer1Clock = { time: 0, speed: 1 };
const observer2Clock = { time: 0, speed: 0.9 };

// UI Controls
const controlsDiv = document.getElementById('controls');

// Observer Switch
const observerSwitch = document.createElement('button');
observerSwitch.innerText = "Switch Observer";
controlsDiv.appendChild(observerSwitch);

let activeCamera = observer1Camera;
observerSwitch.addEventListener('click', () => {
  activeCamera = (activeCamera === observer1Camera) ? observer2Camera : observer1Camera;
});

// Sliders for Dynamic Adjustment
const curvatureSlider = document.createElement('input');
curvatureSlider.type = "range";
curvatureSlider.min = 0.1;
curvatureSlider.max = 2;
curvatureSlider.step = 0.1;
curvatureSlider.value = 0.2;
controlsDiv.appendChild(curvatureSlider);

const massSlider = document.createElement('input');
massSlider.type = "range";
massSlider.min = 0.5;
massSlider.max = 5;
massSlider.step = 0.1;
massSlider.value = 1.0;
controlsDiv.appendChild(massSlider);

// Spacetime Sphere
const geometry = new THREE.SphereGeometry(1, 64, 64);
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    curvatureIntensity: { value: parseFloat(curvatureSlider.value) },
    mass: { value: parseFloat(massSlider.value) },
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float curvatureIntensity;
    uniform float mass;
    varying vec3 vPosition;
    void main() {
      float distance = length(vPosition);
      float gravitationalEffect = mass / (distance * distance);
      float curvature = curvatureIntensity * gravitationalEffect;
      gl_FragColor = vec4(curvature, curvature, curvature, 1.0);
    }
  `
});
const spacetimeSphere = new THREE.Mesh(geometry, shaderMaterial);
scene.add(spacetimeSphere);

// Event Listeners for Sliders
curvatureSlider.addEventListener('input', () => {
  shaderMaterial.uniforms.curvatureIntensity.value = parseFloat(curvatureSlider.value);
});

massSlider.addEventListener('input', () => {
  shaderMaterial.uniforms.mass.value = parseFloat(massSlider.value);
});

// Gravitational Lens Effect
function createGravitationalLensingEffect(mass, position) {
  const lensGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const lensShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      mass: { value: mass },
      lensPosition: { value: position },
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float mass;
      uniform vec3 lensPosition;
      varying vec3 vPosition;
      void main() {
        vec3 offset = vPosition - lensPosition;
        float lensingEffect = mass / length(offset);
        gl_FragColor = vec4(lensingEffect, lensingEffect, lensingEffect, 1.0);
      }
    `
  });
  const lens = new THREE.Mesh(lensGeometry, lensShaderMaterial);
  scene.add(lens);
}

// Add Gravitational Lens Effect for Massive Object
createGravitationalLensingEffect(2.0, new THREE.Vector3(0, 0, 0));

// Animation Loop
function animate(time) {
  requestAnimationFrame(animate);

  // Update Spacetime Visualization
  shaderMaterial.uniforms.time.value = time * 0.001;

  // Update Observer Clocks
  observer1Clock.time += 0.01 * observer1Clock.speed;
  observer2Clock.time += 0.01 * observer2Clock.speed;

  console.log(`Observer 1 Clock: ${observer1Clock.time.toFixed(2)} | Observer 2 Clock: ${observer2Clock.time.toFixed(2)}`);

  // Render Scene
  renderer.render(scene, activeCamera);
}
animate();
