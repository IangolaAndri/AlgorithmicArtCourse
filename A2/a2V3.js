let nodes = [];
let edges = [];
let agents = [];
let numNodes = 40;
let numAgents = 120;
let numClusters = 4; // more clusters for color variety
let clusterColors = [];
let w;
let h;

function setup() {
  w = 900;
  h = 900;
  cnv = createCanvas(w, h);
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 10, 95);
  centerCanvas();

  // define distinct color ranges for clusters
  for (let i = 0; i < numClusters; i++) {
    clusterColors.push(random(0, 360));
  }

  // create nodes
  for (let i = 0; i < numNodes; i++) {
    let cluster = floor(random(numClusters));
    nodes.push({
      x: width/2 + random(-350, 350),
      y: height/2 + random(-350, 350),
      cluster: cluster,
      phase: random(TWO_PI),
      hue: clusterColors[cluster] + random(-20, 20)
    });
  }

  // create edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (random() < 0.9) { // dense connectivity
        let cluster = nodes[i].cluster;
        edges.push({
          a: i,
          b: j,
          weight: random(0.05, 0.5),
          phase: random(TWO_PI),
          cluster: cluster,
          hue: clusterColors[cluster] + random(-30, 30)
        });
      }
    }
  }

  // create agents
  for (let i = 0; i < numAgents; i++) {
    let e = random(edges);
    agents.push({
      edge: e,
      t: random(),
      speed: random(0.002, 0.006),
      offset: random(1000)
    });
  }
}

function centerCanvas() {
  let x = (windowWidth - w) / 2;
  let y = (windowHeight - h) / 2;
  cnv.position(x, y);
}

function draw() {
  // painterly background fade
  noStroke();
  fill(220, 10, 95, 4);
  rect(0, 0, width, height);

  // draw flowing edges
  for (let e of edges) {
    let a = nodes[e.a];
    let b = nodes[e.b];

    stroke(e.hue % 360, random(60, 90), random(80, 100), 25);
    strokeWeight(e.weight * 2);
    noFill();

    let midX = (a.x + b.x)/2 + sin(frameCount*0.008 + e.phase) * 50;
    let midY = (a.y + b.y)/2 + cos(frameCount*0.008 + e.phase) * 50;

    bezier(a.x, a.y, midX, midY, midX, midY, b.x, b.y);
  }

  // move agents along edges
  for (let p of agents) {
    p.t += p.speed;
    if (p.t > 1) p.t = 0;

    let a = nodes[p.edge.a];
    let b = nodes[p.edge.b];

    let midX = (a.x + b.x)/2 + sin(frameCount*0.008 + p.edge.phase + p.offset) * 50;
    let midY = (a.y + b.y)/2 + cos(frameCount*0.008 + p.edge.phase + p.offset) * 50;

    let x = bezierPoint(a.x, midX, midX, b.x, p.t);
    let y = bezierPoint(a.y, midY, midY, b.y, p.t);

    x += noise(frameCount*0.005 + p.offset) * 4 - 2;
    y += noise(frameCount*0.005 + p.offset + 5000) * 4 - 2;

    stroke(p.edge.hue % 360, random(70, 90), 100, 70);
    strokeWeight(1.5);
    point(x, y);
  }

  // draw pulsing nodes
  for (let n of nodes) {
    let pulse = (sin(frameCount * 0.03 + n.phase) + 1) / 2;
    noStroke();
    fill(n.hue % 360, random(70, 90), 100, 50 + pulse*40);
    ellipse(n.x, n.y, 6 + pulse*4, 6 + pulse*4);
  }
}
