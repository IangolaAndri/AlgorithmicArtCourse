let w, h;
let cnv;
let palette;


/* ------------------------ COLORS ------------------------ */ 



/* Creating palette from one random base hue (pure basic color/dominant) 
color family) and its variations and random saturation and random brightness */
function generatePalette(n = 7) {
  let baseHue = random(360);
  let p = [];

  for (let i = 0; i < n; i++) {
    p.push([
      (baseHue + i * random(20, 45)) % 360,
      /* random  saturation */
      random(50, 85),
      // random(20, 40),  // soft, pastel look
      // random(80, 100), // vivid, intense colors
      
      /* random brightness */
      random(30, 70)
      // random(60, 100) // airy, luminous
      // random(10, 40)  // dark, moody
    ]);
  }
  return p;
}

/* Randomly selects a palette color and gives it transparency. */
function pickColor(alphaMin = 100, alphaMax = 300) {
  let c = random(palette);
  // return color(c[0], c[1], c[2], random(alphaMin, alphaMax));
  // return color(c[0], c[1], c[2], 500);
  return color(c[0], c[1], c[2], 75);
}




/* ------------------ SETUP AND DRAWING ------------------ */




function setup() {
  w = 1300;
  h = 700;
  cnv = createCanvas(w, h);
  centerCanvas();

  colorMode(HSB, 360, 100, 100, 255);
  angleMode(DEGREES);
  noStroke();
  frameRate(7);

  palette = generatePalette();
}

function centerCanvas() {
  let x = (windowWidth - w) / 2;
  let y = (windowHeight - h) / 2;
  cnv.position(x, y);
}

function draw() {
  drawBackground();
  drawArt();
  // noLoop();
}




/* ------------------ BACKGROUND ------------------ */



/* Choose two random colors from the same palette and the backgroun
line by line 
*/
function drawBackground() {
  let c1 = pickColor(255, 255);
  // let c2 = pickColor(255, 255);
  let c2 = color(0, 0, 95);

  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerpColor(c1, c2, t));
    line(0, y, width, y);
  }
  noStroke();
}




/* ------------------ MAIN COMPOSITION ------------------ */




function drawArt() {
  let MAX_QUADS = 30;
  // let MAX_QUADS = 10;
  let MAX_CIRCLES = 5;
  // let MAX_CIRCLES = 25;

  let quads = [];
  let circles = [];

  /* Fore each quad: 1. tries random placement 2. checks overlap 
  3. draws only if space is free
*/
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




/* Try random positions until one fits, or give up. */
function placeNonOverlappingQuad(quads, minSize, maxSize, maxAttempts = 120) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let size = random(minSize, maxSize);
    let distortion = random(15, 45);
    // let distortion = random(2, 8);    // clean, geometric
    // let distortion =random(50, 90);  // chaotic, painterly

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




/* ------------------ CIRCLES ------------------ */




function placeNonOverlappingCircle(quads, circles, maxAttempts = 150) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let r = random(30, 80);
    let x = random(80 + r, width - 80 - r);
    let y = random(80 + r, height - 80 - r);

    let collision =
      quads.some(q => circleIntersectsBox(x, y, r, q)) ||
      circles.some(c => circleIntersectsCircle(x, y, r, c));

    if (collision) continue;

    fill(pickColor(120, 200));
    ellipse(x, y, r * 2);

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
    a.x + a.w < b.x || // a is fully left of b
    a.x > b.x + b.w || // a is fully right of b
    a.y + a.h < b.y || // a is fully above b
    a.y > b.y + b.h    // a is fully below b
  );
}