let w, h;
let cnv;
let palette;
let noiseSeedVal;

function generatePalette(n = 7) {
  let baseHue = random(360);
  let p = [];

  for (let i = 0; i < n - 2; i++) {
    p.push([
      (baseHue + i * random(20, 45)) % 360,
      random(50, 85),
      random(70, 100)
    ]);
  }

  p.push([0, 0, 100]);
  p.push([0, 0, 10]);
  return p;
}

function pickColor(alphaMin = 140, alphaMax = 240) {
  let c = random(palette);
  return color(c[0], c[1], c[2], random(alphaMin, alphaMax));
}

function setup() {
  w = 1300;
  h = 700;
  cnv = createCanvas(w, h);
  centerCanvas();

  colorMode(HSB, 360, 100, 100, 255);
  angleMode(DEGREES);
  noStroke();

  palette = generatePalette();
  noiseSeedVal = floor(random(10000));
  noiseSeed(noiseSeedVal);
}

function centerCanvas() {
  let x = (windowWidth - w) / 2;
  let y = (windowHeight - h) / 2;
  cnv.position(x, y);
}

function draw() {
  drawBackground();
  drawArt();
  addGrain(18);
  noLoop();
}



/* ------------------ BACKGROUND ------------------ */

function drawBackground() {
  let c1 = pickColor(255, 255);
  let c2 = pickColor(255, 255);

  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerpColor(c1, c2, t));
    line(0, y, width, y);
  }
  noStroke();
}

/* ------------------ MAIN COMPOSITION ------------------ */

function drawArt() {
  let MAX_QUADS = 65;
  let MAX_CIRCLES = 14;

  let quads = [];
  let circles = [];

  // --- Draw quads first ---
  for (let i = 0; i < MAX_QUADS; i++) {
    let box = placeNonOverlappingQuad(quads, 50, 140);
    if (box) quads.push(box);
  }

  // --- Then place circles independently ---
  for (let i = 0; i < MAX_CIRCLES; i++) {
    placeNonOverlappingCircle(quads, circles);
  }
}

/* ------------------ QUADS ------------------ */

function placeNonOverlappingQuad(quads, minSize, maxSize, maxAttempts = 120) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let size = random(minSize, maxSize);
    let distortion = random(15, 45);
    let x = random(80, width - size - 80);
    let y = random(80, height - size - 80);

    let box = {
      x: x - distortion,
      y: y - distortion,
      w: size + 2 * distortion,
      h: size + 2 * distortion
    };

    if (quads.some(q => overlaps(box, q))) continue;

    push();
    translate(x + size / 2, y + size / 2);
    rotate(random(-6, 6));
    translate(-size / 2, -size / 2);

    fill(pickColor());
    randomQuad(0, 0, size, distortion);

    pop();

    return box;
  }
  return null;
}

function randomQuad(x, y, size, d) {
  quad(
    x + random(-d, d), y + random(-d, d),
    x + size + random(-d, d), y + random(-d, d),
    x + size + random(-d, d), y + size + random(-d, d),
    x + random(-d, d), y + size + random(-d, d)
  );
}

/* ------------------ CIRCLES (NEW SYSTEM) ------------------ */

function placeNonOverlappingCircle(quads, circles, maxAttempts = 150) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let r = random(30, 80);
    let x = random(80 + r, width - 80 - r);
    let y = random(80 + r, height - 80 - r);

    let collision =
      quads.some(q => circleIntersectsBox(x, y, r, q)) ||
      circles.some(c => circleIntersectsCircle(x, y, r, c));

    if (collision) continue;

    blendMode(ADD);
    fill(pickColor(120, 200));
    ellipse(x, y, r * 2);

    fill(pickColor(40, 80));
    ellipse(x, y, r * 2.3);
    blendMode(BLEND);

    circles.push({ x, y, r });
    return;
  }
}

/* ------------------ COLLISION HELPERS ------------------ */

function circleIntersectsBox(cx, cy, r, box) {
  let closestX = constrain(cx, box.x, box.x + box.w);
  let closestY = constrain(cy, box.y, box.y + box.h);
  let dx = cx - closestX;
  let dy = cy - closestY;
  return dx * dx + dy * dy < r * r;
}

function circleIntersectsCircle(x, y, r, c) {
  let dx = x - c.x;
  let dy = y - c.y;
  let distSq = dx * dx + dy * dy;
  let minDist = r + c.r;
  return distSq < minDist * minDist;
}

function overlaps(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

/* ------------------ TEXTURE ------------------ */

function addGrain(amount = 20) {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let g = random(-amount, amount);
    pixels[i] += g;
    pixels[i + 1] += g;
    pixels[i + 2] += g;
  }
  updatePixels();
}
