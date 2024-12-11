function Blaster(canvas) {
    this.r = 25;
    this.pos = canvas.createVector(canvas.width / 2, canvas.height - (2 * this.r));
    this.rotation = 0;
    this.heading = -canvas.PI / 2;
    this.isFiring = false;
    this.cartridge = 10;
    this.hearts = [];
    this.keyDown = null;
    this.keyColor = null;
    this.canvas = canvas

    this.firing = function (b, hKey, hColor) {
        this.isFiring = b;
        if (!b) {
            this.cartridge = 10;
            this.keyDown = '';
            this.keyColor = '';
        } else {
            this.keyDown = hKey;
            this.keyColor = hColor;
        }
    }

    this.fire = function () {
        this.hearts.push(new Heart(this.pos, this.heading, this.keyDown, this.keyColor, this.canvas))
    }

    this.setRotation = function (a) {
        this.rotation = a;
    }

    this.getRotation = function () {
        return this.rotation;
    }

    this.turn = function (angle) {
        const pi = this.canvas.PI
        if (angle) {
            this.heading = angle;
        } else {
            this.heading += this.rotation;
        }
        this.heading = this.canvas.constrain(this.heading, pi / 8 - (pi), -(pi / 8));
    }

    this.update = function () {
        if (this.isFiring) {
            this.cartridge++;
            if (this.cartridge > 10) {
                this.cartridge = 1;
            }
            if (this.cartridge === 1) {
                this.fire();
            }
        }
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            this.hearts[i].render();
            this.hearts[i].update();
            if (this.hearts[i].edges()) {
                this.hearts.splice(i, 1);
            } else if (character.length) {
                for (let j = character.length - 1; j >= 0; j--) {
                    if (character[j].isHit(this.hearts[i])) {
                        this.hearts.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    this.render = function () {
        this.canvas.push();
        this.canvas.translate(this.pos.x, this.pos.y);
        this.canvas.rotate(this.heading + this.canvas.PI / 2);
        this.canvas.translate(0, -25);
        this.canvas.translate(0, 10);
        this.canvas.fill(255, 255, 0);
        this.canvas.stroke(1);
        this.canvas.strokeWeight(5);
        this.canvas.triangle(0, -this.r - 10, -this.r, this.r, this.r, this.r);
        this.canvas.pop();
    }
}

function Buttons(canvas) {
    this.buttons = [];
    this.highlighted = -1;
    this.height = 45;
    this.canvas = canvas;
    this.selections = [
        ['a', 'o', 'g', 'p'],
        ['b', 'd', 'p', 'v'],
        ['c', 'k', 's', 'o'],
        ['d', 'b', 'g', 's'],
        ['e', 'i', 'l', 'w'],
        ['f', 'h', 'a', 'o'],
        ['g', 'd', 'n', 's'],
        ['h', 'x', 'f', 'u'],
        ['j', 'g', 'i', 'f'],
        ['l', 'i', 'r', 't'],
        ['m', 'n', 'w', 'e'],
        ['n', 'm', 'u', 'i'],
        ['o', 'u', 'c', 'z'],
        ['p', 'q', 'a', 'f'],
        ['r', 'u', 'l', 'n'],
        ['s', 'c', 'i', 'z'],
        ['t', 'k', 'e', 'l'],
        ['w', 'm', 'v', 'a'],
        ['z', 't', 'v', 'o']
    ];

    this.render = function () {
        this.canvas.push();
        this.canvas.textAlign(this.canvas.CENTER);
        this.canvas.textSize(30);
        for (let x = 0; x < 4; x++) {
            if (this.highlighted === x) {
                this.canvas.fill(0, 255, 255);
            } else {
                this.canvas.fill(220);
            }
            this.canvas.stroke(70);
            this.canvas.strokeWeight(2);
            this.canvas.rect(
                x * (this.canvas.width / 4),
                this.canvas.height - this.height - 2,
                this.canvas.width / 4,
                this.height,
                20
            );
            this.canvas.fill(0);
            this.canvas.noStroke();
            if (this.buttons[x]) {
                this.canvas.text(
                    this.buttons[x],
                    x * (this.canvas.width / 4),
                    this.canvas.height - this.height - 2,
                    this.canvas.width / 4,
                    this.height,
                    20
                );
            } else {
                this.canvas.text(
                    '',
                    x * (this.canvas.width / 4),
                    this.canvas.height - this.height - 2,
                    this.canvas.width / 4,
                    this.height,
                    20
                )
            }
        }
        this.canvas.pop();
    }

    this.getLetter = function (num) {
        if (this.buttons[num]) {
            return (this.buttons[num]);
        } else {
            return false;
        }
    }

    this.letterClear = function () {
        this.buttons = [];
    }

    this.inputLetters = function (ref) {
        let letters = [];
        for (let i = 0; i < 4; i++) {
            letters.push(this.selections[ref][i]);
        }
        let r;
        for (let j = 0; j < 4; j++) {
            r = this.canvas.floor(this.canvas.random(0, letters.length));
            this.buttons.push(letters[r]);
            letters.splice(r, 1);
        }
    }

    this.outputLog = function () {
        let s = '';
        for (let i = 0; i < this.buttons.length; i++) {
            s += this.buttons[i];
        }
        return s;
    }

    this.setHighlight = function (n) {
        this.highlighted = n;
    }
    this.unHighlight = function () {
        this.highlighted = -1;
        spaceLetter = '';
        spaceCode = 0;
    }
}

function Character(img, hKey, canvas) {
    this.pos = canvas.createVector(
        canvas.floor(canvas.random(0, canvas.width - 151)),
        canvas.floor(canvas.random(0, canvas.height / 2))
    );
    this.img = img;
    this.keySet = hKey;
    this.s = 150;
    this.xDirection = -1;
    this.yDirection = -1;
    const URL = "https://raw.githubusercontent.com/JefeThePug/PhonicsBlast/main/"
    this.sfPointUp = canvas.loadSound(`${URL}assets/sounds/PointUp.mp3`);
    this.sfPointDown = canvas.loadSound(`${URL}assets/sounds/PointDown.wav`);
    this.canvas = canvas;

    this.render = function () {
        this.canvas.image(this.img, this.pos.x, this.pos.y, this.s, this.s);
    }

    this.update = function () {
        this.pos.x = this.pos.x + 1.0 * this.xDirection;
        this.pos.y = this.pos.y + 0.8 * this.yDirection;
        if (this.pos.x > (this.canvas.width - 150) || this.pos.x < 0) {
            this.xDirection *= -1;
        }
        if (this.pos.y > this.canvas.height / 2 || this.pos.y < 0) {
            this.yDirection *= -1;
        }
    }

    this.isHit = function (heart) {
        const distance = this.canvas.dist(this.pos.x, this.pos.y, heart.pos.x, heart.pos.y)
        if (distance <= this.s + heart.r) {
            if (heart.keyDown !== this.keySet) {
                this.s += 10;
                SCORE -= 5;
                Points.push(new Point(this.pos, '-5', this.s, this.canvas));
                this.sfPointDown.play();
            } else {
                this.s -= 10;
                SCORE += 2;
                Points.push(new Point(this.pos, '+2', this.s, this.canvas));
                this.sfPointUp.play();
            }
            return true;
        }
        return false;
    }

}

function Heart(sPos, angle, hKey, hColor, canvas) {
    this.r = 10;
    this.pos = canvas.createVector(sPos.x, sPos.y);
    this.vel = p5.Vector.fromAngle(angle);
    this.vel.mult(8);
    this.keyDown = hKey;
    this.keyColor = hColor;
    const URL = "https://raw.githubusercontent.com/JefeThePug/PhonicsBlast/main/"
    this.sfMiss = canvas.loadSound(`${URL}assets/sounds/Miss.wav`);
    this.canvas = canvas;

    this.update = function () {
        this.pos.add(this.vel);
    }

    this.render = function () {
        const offsets = [2, 1, 0, 2, 6, 2, 0, 1, 2, 3, 4, 4, 0, 4, 4, 3];
        this.canvas.push();
        this.canvas.colorMode(this.canvas.HSB, 100);
        this.canvas.stroke(1);
        this.canvas.strokeWeight(2);
        const c = this.canvas.map(this.keyColor, 65, 91, 1, 100);
        this.canvas.fill(c, 100, 100);
        this.canvas.translate(this.pos.x, this.pos.y - 20);
        this.canvas.rotate(this.canvas.PI);
        this.canvas.beginShape();
        let angle, r, x, y;
        for (let i = 0; i <= 16; i++) {
            angle = this.canvas.map(i, 0, 16, 0, this.canvas.TWO_PI);
            r = this.r - offsets[i];
            x = r * this.canvas.cos(angle);
            y = r * this.canvas.sin(angle);
            this.canvas.vertex(x, y);
        }
        this.canvas.endShape(this.canvas.CLOSE);
        this.canvas.pop();
    }

    this.edges = function () {
        if (this.pos.x > this.canvas.width || this.pos.x < 0 || this.pos.y < 0) {
            let newpos;
            for (let j = 0; j < character.length; j++) {
                character[j].s += 5;
                newpos = this.canvas.createVector(
                    this.canvas.constrain(this.pos.x, 50, this.canvas.width - 50),
                    this.canvas.constrain(this.pos.y, 150, this.canvas.height - 50)
                );
                Points.push(new Point(newpos, '-2', 0, this.canvas));
                SCORE -= 2;
                this.sfMiss.play();
            }
            return true;
        }
        return false;
    }

}

let Particle = function (position, canvas) {
    this.acceleration = canvas.createVector(0, 0.1);
    this.velocity = canvas.createVector(canvas.random(-5, 1), canvas.random(-5, 0));
    this.position = position.copy();
    this.lifespan = 100.0;
    this.canvas = canvas;
};

Particle.prototype.run = function () {
    this.update();
    this.display();
};

Particle.prototype.update = function () {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 1.4;
};

Particle.prototype.display = function () {
    this.canvas.push();
    this.canvas.colorMode(this.canvas.HSB, 100);
    this.canvas.stroke(16, 100, 50, this.lifespan);
    this.canvas.strokeWeight(2);
    this.canvas.fill(16, 100, 100, this.lifespan);
    const offsets = [1, -8, 1, -8, 1, -8, 1, -8, 1, -8];
    this.canvas.translate(this.position.x + (150 / 2), this.position.y + (150 / 2));
    this.canvas.rotate(this.canvas.PI);
    this.canvas.beginShape();
    let angle, r, x, y;
    for (let i = 0; i <= 10; i++) {
        angle = this.canvas.map(i, 0, 10, 0, this.canvas.TWO_PI);
        r = 12 - offsets[i];
        x = r * this.canvas.cos(angle);
        y = r * this.canvas.sin(angle);
        this.canvas.vertex(x, y);
    }
    this.canvas.endShape(this.canvas.CLOSE);
    this.canvas.pop();
};

Particle.prototype.isDead = function () {
    return (this.lifespan < 0);
};

let ParticleSystem = function (position, canvas) {
    this.origin = position.copy();
    this.particles = [];
    for (let i = 0; i < 60; i++) {
        this.particles.push(new Particle(this.origin, canvas));
    }
};

ParticleSystem.prototype.run = function () {
    let p;
    for (let i = this.particles.length - 1; i >= 0; i--) {
        p = this.particles[i];
        p.run();
        if (p.isDead()) {
            this.particles.splice(i, 1);
        }
    }
};

let Point = function (position, t, s, canvas) {
    this.acceleration = canvas.createVector(0, 0.01);
    this.velocity = canvas.createVector(0, -5);
    this.position = position.copy();
    this.lifespan = 100.0;
    this.t = t;
    this.neg = ((t.substring(0, 1) === '-'));
    this.offset = s;
    this.canvas = canvas;


    this.run = function () {
        this.update();
        this.display();
    }

    this.update = function () {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.lifespan -= .4;
    }

    this.display = function () {
        this.canvas.push();
        this.canvas.noStroke();
        if (this.t.length === 3) {
            this.canvas.stroke(0);
            this.canvas.strokeWeight(5);
            this.canvas.fill(0, 225, 228);
            this.canvas.textSize(40);
        } else {
            this.canvas.textSize(34);
            this.canvas.noStroke();
            if (this.neg) {
                this.canvas.fill(255, 0, 0, 99);
            } else {
                this.canvas.fill(19, 141, 0, 99);
            }
        }
        this.canvas.translate(this.position.x + this.offset, this.position.y + this.offset);
        this.canvas.text(this.t, 0, 0, 50, 50);
        this.canvas.pop();
    };

    this.isDead = function () {
        return (this.lifespan < 0);
    }
}
