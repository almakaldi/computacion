let AMP_MIN = 0.0017;
let HIGH_VOLUME_THRESHOLD = 0.01;
let TREBLE_THRESHOLD = 160;
let INVERT_FRAMES = 30;
let ALM = 0.0045;

let mic, fft;
let vertices = [];
let invertCountdown = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  regenerarFigura(); //  forma inicial
}

function regenerarFigura() {
  vertices = [];
  for (let i = 0; i < 30; i++) {
    let v = createVector(random(-200, width+100), random(-200, height+100));
    v.dx = random(-1.5, 1.5);
    v.dy = random(-1.5, 1.5);
    vertices.push(v);
  }
}

function draw() {
  let level = mic.getLevel();
  fft.analyze();
  let trebleEnergy = fft.getEnergy(3000, 8000);
  let highVolume = level > HIGH_VOLUME_THRESHOLD;

  // aplauso detectado → regenerar 
  if (trebleEnergy > TREBLE_THRESHOLD && highVolume) {
    invertCountdown = INVERT_FRAMES;
    regenerarFigura();
  }

  let invertColors = invertCountdown > 0;
  if (invertCountdown > 0) invertCountdown--;

  let estadoRojo = level > ALM;

  
  if (estadoRojo) {
    background(invertColors ? 0 : color(255, 0, 0));
    noStroke();
    fill(invertColors ? 255 : 255);
  } else {
    background(invertColors ? color(255, 0, 0) : 255);
    stroke(invertColors ? color(255, 0, 0) : 0);
    strokeWeight(invertColors ? 1 : 20);
    noFill();
  }

  let centro = createVector(width / 2, height / 2);

  for (let v of vertices) {
    if (level < AMP_MIN) {
      // silencio →  al centro
      let dir = p5.Vector.sub(centro, v).mult(0.002);
      v.x += dir.x;
      v.y += dir.y;
    } else {
      
      v.x += v.dx;
      v.y += v.dy;
    }

    let margen = 100; // cantidad de "espacio extra" fuera del canvas

if (v.x < -margen) v.x = width + margen;
if (v.x > width + margen) v.x = -margen;
if (v.y < -margen) v.y = height + margen;
if (v.y > height + margen) v.y = -margen;

  }

  //  figura
  beginShape();
  for (let v of vertices) {
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
}
