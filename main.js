const canvas = document.getElementById('spacetimeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Setup observers and planets
const planets = [];
const observers = [
  { x: canvas.width / 4, y: canvas.height / 2, clock: 0 },
  { x: (3 * canvas.width) / 4, y: canvas.height / 2, clock: 0 }
];

// Gravitational lensing effect
function drawLens(x, y, radius, intensity) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// Add a new planet
function addPlanet() {
  planets.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 30 + 10,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2
  });
}

// Draw the simulation
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw planets
  planets.forEach((planet) => {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fill();

    // Update planet positions (simple motion simulation)
    planet.x += planet.dx;
    planet.y += planet.dy;

    // Wrap around edges
    if (planet.x < 0) planet.x = canvas.width;
    if (planet.x > canvas.width) planet.x = 0;
    if (planet.y < 0) planet.y = canvas.height;
    if (planet.y > canvas.height) planet.y = 0;

    // Gravitational lensing effect
    drawLens(planet.x, planet.y, planet.radius * 2, 0.5);
  });

  // Draw observers and clocks
  observers.forEach((observer, index) => {
    ctx.fillStyle = index === 0 ? 'blue' : 'red';
    ctx.beginPath();
    ctx.arc(observer.x, observer.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Clock display
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Clock: ${observer.clock.toFixed(2)}`, observer.x - 30, observer.y - 15);
  });
}

// Animation loop
let lastTime = 0;
function animate(time) {
  const deltaTime = (time - lastTime) / 1000; // In seconds
  lastTime = time;

  // Update clocks (simulate relativistic time dilation)
  observers[0].clock += deltaTime;
  observers[1].clock += deltaTime * 0.9; // Observer 2 experiences slower time

  draw();
  requestAnimationFrame(animate);
}

// Event Listeners
document.getElementById('addPlanet').addEventListener('click', addPlanet);

animate(0);
