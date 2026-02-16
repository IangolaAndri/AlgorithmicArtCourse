let nodes = [];
let edges = [];
let agents = [];
let numNodes = 40;
let numAgents = 500;
let numClusters = 6; 
let clusterColors = [];
let w;
let h;

function setup() {
  w = windowWidth;
  h = windowHeight;
  cnv = createCanvas(w, h);
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 10, 95);
  centerCanvas();
  defineColors();
  createNodes();
  createEdges();
  createAgents();
}

function defineColors(){
  for (let i = 0; i < numClusters; i++) {
    clusterColors.push(random(0, 360));
  }
}

function createNodes(){
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
}

function createEdges(){
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (random() < 0.9) { 
        let cluster = nodes[i].cluster;
        edges.push({
          a: i,
          b: j,
          weight: random(0.05, 0.5),
          phase: random(TWO_PI),
          cluster: cluster,
          hue: clusterColors[cluster] + random(-30, 30),
          flow: 0 
        });
      }
    }
  }
}

function createAgents(){
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
  // background fade
  noStroke();
  fill(220, 10, 95, 4);
  rect(0, 0, width, height);

  // reset flow for Physarum
  for (let e of edges) e.flow = 0;

  // move agents and compute flow
  for (let p of agents) {
    p.t += p.speed;
    if (p.t > 1) p.t = 0;

    let a = nodes[p.edge.a];
    let b = nodes[p.edge.b];

    // create curves  
    let midX = (a.x + b.x)/2 + sin(frameCount*0.008 + p.edge.phase + p.offset) * 50;
    let midY = (a.y + b.y)/2 + cos(frameCount*0.008 + p.edge.phase + p.offset) * 50;

    // Bézier motion (smooth travel)
    let x = bezierPoint(a.x, midX, midX, b.x, p.t);
    let y = bezierPoint(a.y, midY, midY, b.y, p.t);

    stroke(p.edge.hue % 360, random(70, 90), 100, 70);
    strokeWeight(1.5);
    point(x, y);

    // increment flow (stronger flow)
    p.edge.flow += 20; 
  }

  // update edge weights based on flow (Physarum + decay)
  for (let e of edges) {
    // compute target weight based on flow
    let target = constrain(0.05 + e.flow * 0.005, 0.05, 1.2);

    // smooth adaptation toward target
    e.weight += (target - e.weight) * 0.15;

    // decay for edges with little or no flow
    if (e.flow < 1) {
      e.weight *= 0.995;       // slow decay
      e.weight = max(e.weight, 0.05); // prevent disappearing completely
    }
  }

  // draw flowing edges
  for (let e of edges) {
    let a = nodes[e.a];
    let b = nodes[e.b];

    let midX = (a.x + b.x)/2 + sin(frameCount*0.008 + e.phase) * 50;
    let midY = (a.y + b.y)/2 + cos(frameCount*0.008 + e.phase) * 50;

    stroke(e.hue % 360, random(60, 90), random(80, 100), 25);
    strokeWeight(e.weight * 3); 
    noFill();
    bezier(a.x, a.y, midX, midY, midX, midY, b.x, b.y);
  }

  // draw nodes
  for (let n of nodes) {
    noStroke();
    fill(n.hue % 360, 80, 100, 80); // fixed saturation + alpha
    ellipse(n.x, n.y, 6, 6);       // fixed size
  }
}