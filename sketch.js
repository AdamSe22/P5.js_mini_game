let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
let bullets = [];
let enemies = [];
let mode = false;
let sliders = [];
let enemyImage;
let controlledVehicle = null;
const flock = [];
let gameOver = false;
let gameStarted = false;

// Variables pour les statistiques
let score = 0;
let bulletCount = bullets.length;
let killedEnemies = 0;

function preload() {
  enemyImage = loadImage('assets/ennemies2.png');
}

function createRandomEnemy() {
  let x = random(width);
  let y = random(height);
  enemies.push(new Vehicle(x, y, enemyImage));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pursuer1 = new Vehicle(100, 100);
  pursuer2 = new Vehicle(random(width), random(height));
  
  for (let i = 0; i < 200; i++) {
    flock.push(new Boid());
  }

  vehicules.push(pursuer1);
  //vehicules.push(pursuer2);

  // On cree un obstacle au milieu de l'écran
  obstacles.push(new Obstacle(random(width / 2), random(height / 2), 100, "green"));

  // Créer des curseurs pour régler les paramètres
  sliders.push(creerUnSlider('Max Speed', 1, 10, 6, 1, 10, 10, 'maxSpeed'));
  sliders.push(creerUnSlider('Max Force', 0.1, 2, 0.6, 0.1, 10, 50, 'maxForce'));
  
  
  // Ajouter des ennemis aléatoirement à des intervalles de temps aléatoires
  setInterval(() => {
    createRandomEnemy();
  }, random(1000, 5000));
  setTimeout(() => {
    gameOver = true;
  }, 60000);
}
function drawBackground() {
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(100, 100, 90), color(50, 50, 150), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  // Ajouter des étoiles scintillantes
  for (let i = 0; i < 50; i++) {
    let x = random(width);
    let y = random(height);
    let starSize = random(2, 5);
    fill(255, 255, random(150, 255), random(150, 255));
    noStroke();
    ellipse(x, y, starSize, starSize);
  }
}function showStartScreen() {
  background(0); // Fond noir
  fill(255);  // Texte blanc
  textAlign(CENTER);
  textSize(50);
  text("WELCOME TO THE ADAM SERGHINI MINI", width / 2, height / 3);
  textSize(30);
  text("Press <ENTER> to Start", width / 2, height / 2);
  textSize(20);
  text("How to play :", width / 2, height / 2 + 60);
  text("Use arrow keys to move\n<a> :to switch control\n <space> to shoot\n <s> mode snack\n<v> add new vehicule\n <w> add new vehicule with arrow state ", width / 2, height / 2 + 100);

}

function draw() {
  drawBackground();
  if (gameOver) {
    showGameOverPage(); // Afficher la page de fin de jeu
    return; // Arrêter l'exécution du jeu
  }
  if (!gameStarted) {
    showStartScreen(); // Afficher le message de démarrage
  }
  // changer le dernier param (< 100) pour effets de trainée
  background(0, 0, 0, 100);
  
  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }  
  target = createVector(mouseX, mouseY);

  // Dessin de la cible qui suit la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);

  // dessin des obstacles
  obstacles.forEach(o => {
    o.show();
  });

  vehicules.forEach((v, index) => {
    if (v === controlledVehicle) {
      // Contrôler la voiture avec les touches du clavier
      if (keyIsDown(LEFT_ARROW)) {
        v.applyForce(createVector(-0.1, 0));
      }
      if (keyIsDown(RIGHT_ARROW)) {
        v.applyForce(createVector(0.1, 0));
      }
      if (keyIsDown(UP_ARROW)) {
        v.applyForce(createVector(0, -0.1));
      }
      if (keyIsDown(DOWN_ARROW)) {
        v.applyForce(createVector(0, 0.1));
      }
      v.update();
      v.wrapAround();
      v.show();
    } else if (mode == false) {
      v.applyBehaviors(target, obstacles, vehicules);
      v.update();
      v.wrapAround();
      v.show();
    } else if (mode == true) {
      if (index === 0) {
        v.applyBehaviors(target, obstacles, vehicules);
      } else {
        let vehiculePrecedent = vehicules[index - 1];
        let distanceTresProche = 10; // Distance très proche
        let direction = p5.Vector.sub(vehiculePrecedent.pos, v.pos);
        direction.setMag(distanceTresProche);
        let positionSuivi = p5.Vector.sub(vehiculePrecedent.pos, direction);
        v.applyBehaviors(positionSuivi, obstacles, vehicules);
      }
      v.update();
      v.wrapAround();
      v.show();
    }

    // Appliquer les comportements wander, éviter les obstacles et boundaries
    if (v.isWanderer) {
      v.wander();
      v.boundaries();
    }
  });

  // Gestion des balles
  bullets.forEach(bullet => {
    bullet.update();
    bullet.draw();
  });

  // Gestion des ennemis
  enemies.forEach((enemy, enemyIndex) => {
    bullets.forEach(bullet => {
      let d = dist(bullet.position.x, bullet.position.y, enemy.pos.x, enemy.pos.y);
      if (d < bullet.radius + enemy.r) {
        enemies.splice(enemyIndex, 1); // Ennemi touché, le supprimer
        bullet.isAlive = false; // Supprimer la balle
        killedEnemies++; // Incrémenter le nombre d'ennemis tués
        score += 100; // Ajouter des points pour l'ennemi tué
      }
    });

    // Dessiner l'ennemi
    enemy.show();
  });

  // Supprimer les balles qui ne sont plus en vie
  bullets = bullets.filter(bullet => bullet.isAlive);

  // Afficher les statistiques en bas de la page
  displayStats();
}

function mousePressed() {
  let isClickOnSlider = sliders.some(slider => {
    let sliderX = slider.position().x;
    let sliderY = slider.position().y;
    let sliderWidth = slider.width;
    let sliderHeight = 20;

    return mouseX > sliderX && mouseX < sliderX + sliderWidth &&
           mouseY > sliderY && mouseY < sliderY + sliderHeight;
  });

  if (!isClickOnSlider) {
    obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), "green"));
  }
}

function keyPressed() {
  if (key === 'Enter' && !gameStarted) {
    gameStarted = true;  
    startGame();         
  }
  if (key == "v") {
    vehicules.push(new Vehicle(random(width), random(height)));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  } else if (key == "w") {
    let v = new Vehicle(random(width), random(height));
    v.wanderTheta = 0;
    v.isWanderer = true;
    vehicules.push(v);
  } else if (key == "f") {
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(20, 300);
      v.vel = new p5.Vector(random(1, 5), random(1, 5));
      vehicules.push(v);
    }
  } else if (key == "s") {
    mode = !mode;
  } else if (key == " ") {
    if (controlledVehicle) {
      let bulletDirection = controlledVehicle.vel.copy().normalize().mult(5);
      let bullet = new Bullet(controlledVehicle.pos.copy(), bulletDirection);
      bullets.push(bullet);
      bulletCount++;
    } else {
      let bullet = new Bullet(
        createVector(pursuer1.pos.x, pursuer1.pos.y),
        createVector(mouseX - pursuer1.pos.x, mouseY - pursuer1.pos.y).normalize().mult(5)
      );
      bullets.push(bullet);
      bulletCount++;
    }
  } else if (key == "a") {
    if (controlledVehicle) {
      controlledVehicle = null;
    } else {
      controlledVehicle = vehicules[0];
    }
  }
}
let y = 0; 

function showGameOverPage() {
  // On augmente la valeur de y pour faire défiler l'animation
  y += 5; 
  if (y > height) y = height; // Empêcher y de dépasser la hauteur de l'écran

  // Dégradé de couleur pour la ligne
  let c = lerpColor(color(255,255, 90), color(0, 0, 255), y / height);
  stroke(c);
  line(0, y, width, y);

  // Affichage du texte de fin de jeu
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Jeu Terminé", width / 2, height / 3);

  // Affichage des statistiques
  textSize(24);
  text(`Score: ${score}`, width / 2, height / 2);
  text(`Balles tirées: ${bulletCount}`, width / 2, height / 2 + 40);
  text(`Ennemis tués: ${killedEnemies}`, width / 2, height / 2 + 80);
}

function keyReleased() {
  if (controlledVehicle) {
    controlledVehicle.vel.set(0, 0);
  }
}

function creerUnSlider(label, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY + 17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    vehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });

  return slider;
}

// Fonction pour afficher les statistiques en bas de la page
function displayStats() {
  fill(0, 255, 0); // Couleur verte
  textSize(24);
  textAlign(RIGHT);
  text(`Score: ${score}`, width - 20, height - 40);
  text(`Balles: ${bulletCount}`, width - 20, height - 70);
  text(`Ennemis tués: ${killedEnemies}`, width - 20, height - 100);
}
