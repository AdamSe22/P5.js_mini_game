class Obstacle {
  constructor(x, y, r, couleur) {
    this.pos = createVector(x, y);
    this.r = r;
    this.color = couleur;
    this.image = loadImage("assets/Moon.png");
  }

  show() {
    push();
    /*
    fill(this.color);
    stroke(0)
    strokeWeight(3);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
    fill(0);
    ellipse(this.pos.x, this.pos.y, 10);
    */
   translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      image(this.image, 0, 0, this.r * 2, this.r * 2);
    pop();
  }
}