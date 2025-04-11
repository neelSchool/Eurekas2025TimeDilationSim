const canvas = document.getElementById('sim');
const ctx = canvas.getContext('2d');

const SPEED_OF_LIGHT = 300;
const G = 6.674e-11;

const traveler = {
  x: 100,
  y: 300,
  vx: 0,
  vy: 0,
  radius: 10,
  properTime: 0
};

let planets = [
  { x: 450, y: 300, mass: 1e6, radius: 30 }
];

let quoteTimer = 0;
let currentQuote = "";

const quotes = [
  "Time is an illusion. – Einstein",
  "The only reason for time is so that everything doesn’t happen at once.",
  "Time flies over us, but leaves its shadow behind. – Nathaniel Hawthorne",
  "We are travelers in a universe of relativity.",
  "Your now may not be my now."
];

function getDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function velocityDilation(v) {
  return 1 / Math.sqrt(1 - (v ** 2) / (SPEED_OF_LIGHT ** 2));
}

function gravityDilation(mass, r) {
  const val = 1 - (2 * G * mass) / (r * SPEED_OF_LIGHT ** 2);
  return val > 0 ? Math.sqrt(val) : 1;
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawClock(x, y, radius, angle, color) {
  drawCircle(x, y, radius, color);
  const handLength = radius * 0.8;
  const hx = x + handLength * Math.cos(angle);
  const hy = y + handLength * Math.sin(angle);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = "white";
  ctx.stroke();
}

function drawText(text, x, y) {
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y);
}

let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Add planet on click
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  planets.push({
    x, y,
    mass: 5e5 + Math.random() * 1e6,
    radius: 20 + Math.random() * 20
  });
});

function handleInput(dt) {
  if (keys["ArrowRight"]) traveler.vx += 50 * dt;
  if (keys["ArrowLeft"]) traveler.vx -= 50 * dt;
  if (keys["ArrowUp"]) traveler.vy -= 50 * dt;
  if (keys["ArrowDown"]) traveler.vy += 50 * dt;
}

let lastTime = null;
let clockAngle = 0;

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleInput(dt);

  // Update traveler
  traveler.x += traveler.vx * dt;
  traveler.y += traveler.vy * dt;

  const speed = Math.sqrt(traveler.vx ** 2 + traveler.vy ** 2);
  const velDilation = velocityDilation(speed);

  // Combined gravitational time dilation
  let gravDilation = 1;
  for (let p of planets) {
    const dist = getDistance(traveler, p);
    gravDilation *= gravityDilation(p.mass, dist);
  }

  const combinedDilation = velDilation * gravDilation;
  traveler.properTime += dt / combinedDilation;

  // Update clock angle (scaled by dilation)
  clockAngle += dt * 2 * combinedDilation;

  // Draw planets
  for (let p of planets) {
    drawCircle(p.x, p.y, p.radius, "yellow");
  }

  // Draw traveler
  drawClock(traveler.x, traveler.y, traveler.radius, clockAngle, "cyan");

  // Display info
  ctx.font = "16px monospace";
  drawText(`Speed: ${speed.toFixed(2)} u/s`, 20, 30);
  drawText(`Velocity dilation: ${velDilation.toFixed(6)}`, 20, 50);
  drawText(`Gravitational dilation: ${gravDilation.toFixed(6)}`, 20, 70);
  drawText(`Combined factor: ${combinedDilation.toFixed(6)}`, 20, 90);
  drawText(`Traveler proper time: ${traveler.properTime.toFixed(2)} s`, 20, 110);

  // Simulated sound pitch (visual text)
  drawText(`Sound Pitch: ${(combinedDilation).toFixed(2)}x`, 20, 140);

  // Rotate quotes
  quoteTimer += dt;
  if (quoteTimer > 10) {
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteTimer = 0;
  }
  drawText(`“${currentQuote}”`, 20, canvas.height - 30);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
