class Bullet {
    constructor(position, velocity, radius = 5, color = 'cyan') {
        this.position = position.copy();
        this.velocity = velocity.copy();
        this.radius = radius;
        this.color = color;
        this.isAlive = true;
    }

    update() {
        if (!this.isAlive) return;

        // Mettre à jour la position en fonction de la vélocité
        this.position.add(this.velocity);

        // Vérifier si la balle est hors des limites de l'écran
        if (this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height) {
            this.isAlive = false;
        }
    }

    draw() {
        if (!this.isAlive) return;

        fill(this.color);
        noStroke();
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}