class GameManager {
    constructor() {
        this.games = {
            none: new Game("Blank"),
            phonics: new PhonicsGame("Phonics"),
            letter: new LetterGame("Letter"),
            plinko: new PlinkoGame("Plinko")
        };
        this.currentGame = null;
        this.setupGlobalMouseListeners();
        this.setupGlobalKeyboardListeners();
    }

    start(gameName) {
        // if (this.currentGame) {
        //     this.currentGame.pause();
        // }
        if (!(gameName in this.games)) gameName = "none";
        this.currentGame = this.games[gameName];
        this.currentGame.resume();
    }

    pause() {
        if (this.currentGame) {
            this.currentGame.pause();
        }
    }

    resume() {
        if (this.currentGame) {
            this.currentGame.resume();
        }
    }

    setupGlobalMouseListeners() {
        document.addEventListener('mousedown', (event) => {
            if (this.currentGame) {
                this.currentGame.mousePressed(event, this.currentGame.canvas);
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (this.currentGame) {
                this.currentGame.mouseMoved(event, this.currentGame.canvas);
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (this.currentGame) {
                this.currentGame.mouseReleased(event, this.currentGame.canvas);
            }
        });
    }

    setupGlobalKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.currentGame) {
                this.currentGame.keyPressed(event, this.currentGame.canvas);
            }
        });

        document.addEventListener('keyup', (event) => {
            if (this.currentGame) {
                this.currentGame.keyReleased(event, this.currentGame.canvas);
            }
        });
    }
}

class Game {
    constructor(name) {
        this.canvas = null;
        this.isPaused = true;
        this.name = name
        this.init()
    }

    init() {
        if (this.canvas) {
            console.log(`${this.name} Game Already Setup`);
            return;
        }
        this.canvas = new p5((p) => {
            p.preload = () => this.preload(p);
            p.setup = () => this.setup(p);
            p.draw = () => this.draw(p);
        });
    }

    preload(p) {
        p.createCanvas(1, 1);
        p.clear()
    }

    setup(p) {
    }

    draw(p) {
        p.noLoop()
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    mousePressed(event, p) {
    }

    mouseMoved(event, p) {
    }

    mouseReleased(event, p) {
    }

    keyPressed(event, p) {
    }

    keyReleased(event, p) {
    }
}

class PhonicsGame extends Game {
    draw(p) {
        if (!this.isPaused) {
            console.log(`${this.name} Game Drawing`);
        }
    }
}

class LetterGame extends Game {
    constructor(name) {
        super(name);
        this.URL = "https://raw.githubusercontent.com/JefeThePug/LetterConstellations/main/"
        this.splash = null;
        this.instruc = null;
        this.musicnote = null;
        this.constellationImages = [];
        this.messageImages = [];
        this.scoreStarImages = [];
        this.constellationAnswer = null;
        this.wrongGuess = null;
        this.visibleScoreImage = null;
        this.ref = ["_bg", "a", "e", "i", "o", "u", "k", "z", "r", "s", "d", "h", "f", "v", "j", "t", "c", "p", "g", "y", "x", "q", "n", "l", "m", "b", "w"];
        this.stars = [];
        this.letters = [];
        this.messages = [];
        this.guessing = null;
        this.homeScreen = null;
        this.instrucScreen = null;
        this.settingsScreen = null;
        this.doneGame = null;
        this.inImage = null;
        this.BGMon = null;
        this.BGM = null;
        this.guessMusic = null;
        this.sfChime = null;
        this.soundSave = [];
    }

    preload(p) {
        for (let i = 0; i < this.ref.length; i++) {
            this.constellationImages[i] = p.loadImage(`${this.URL}assets/${this.ref[i]}.jpg`);
        }
        for (let j = 0; j <= 6; j++) {
            this.scoreStarImages[j] = p.loadImage(`${this.URL}assets/${j}.png`);
        }
        this.splash = p.loadImage(`${this.URL}assets/_title.jpg`);
        this.instruc = p.loadImage(`${this.URL}assets/_instruc.jpg`);
        this.messageImages[0] = p.loadImage(`${this.URL}assets/_tryagain.jpg`);
        this.messageImages[1] = p.loadImage(`${this.URL}assets/_welldone.jpg`);
        this.musicnote = p.loadImage(`${this.URL}assets/_music.png`);
        this.BGM = p.loadSound(`${this.URL}assets/_music/bgm.mp3`);
        this.guessMusic = p.loadSound(`${this.URL}assets/_music/guess.mp3`);
        this.sfChime = p.loadSound(`${this.URL}assets/_music/sfChime.mp3`);
    }

    setup(p) {
        const letterContainer = document.querySelector('.letter-container');
        p.createCanvas(800, 500, {willReadFrequently: true}).parent(letterContainer);
        p.noCursor();
        this.resetGame()
        this.soundSave = [0, 0, 0];
        this.BGMon = true;
        p.textAlign(p.CENTER, p.CENTER);
        p.rectMode(p.CENTER);
        this.guessMusic.loop();
        this.guessMusic.fade(0, 0);
        this.BGM.loop();
        this.BGM.fade(0, 0);
        let buffer = 80;
        for (let i = 1; i <= this.ref.length; i++) {
            let i1div = p.floor((i - 1) / 7);
            let i1mod = (i - 1) % 7;
            let pos = p.createVector(i1div * 50 + buffer, i1mod * 50 + buffer);
            if (i === this.ref.length) {
                let idiv = p.floor(i / 7);
                let imod = i % 7;
                let newPos = p.createVector(idiv * 50 + buffer, imod * 50 + buffer);
                this.letters[i - 1] = new Letter(newPos, "BACK", p);
            } else {
                this.letters[i - 1] = new Letter(pos, this.ref[i], p);
            }
        }
        checkAllSetupsComplete()
    }

    draw(p) {
        if (this.isPaused) return;

        if (this.homeScreen) {
            this.homeDisplay(p);
        } else if (this.instrucScreen) {
            p.image(this.instruc, 0, 0);
            p.fill(0);
            p.rect(p.width / 2, p.height - 15, p.width, 30);
            p.fill(255);
            p.text("CLICK ANYWHERE TO GO BACK", p.width / 2, p.height - 15);
        } else if (this.settingsScreen) {
            this.settingsWindow(p);
        } else { // game play
            this.gamePlay(p);
        }
        this.drawStar(p);
    }

    drawGear(p) {
        p.stroke(0);
        p.strokeWeight(2);
        p.fill(210);
        p.ellipse(0, 0, 45);
        let offsets = [18, 18, 12, 12, 18, 18, 12, 12, 18, 18, 12, 12, 18, 18, 12, 12, 18, 18, 12, 12, 18, 18, 12, 12, 18, 18, 12, 12, 18, 18, 12, 12];
        p.fill(120);
        p.beginShape();
        for (let i = 0; i <= 32; i++) {
            let angle = p.map(i, 0, 32, 0, p.TWO_PI);
            p.vertex(offsets[i] * p.cos(angle), offsets[i] * p.sin(angle));
        }
        p.endShape(p.CLOSE);
        p.fill(210);
        p.ellipse(0, 0, 10);
        p.pop();
    }

    homeDisplay(p) {
        p.image(this.splash, 0, 0);
        p.strokeWeight(5);
        p.stroke(255, 255, 117, 100);
        p.fill(255, 255, 0, 100);
        p.rect(620, 250, 180, 80, 20);
        p.stroke(174, 0, 255, 100);
        p.fill(108, 0, 159, 100);
        p.rect(620, 350, 180, 60, 20);
        p.fill(255);
        p.noStroke();
        p.textStyle(p.BOLD);
        p.textSize(50);
        p.text("PLAY", 620, 250);
        p.textSize(20);
        p.text("INSTRUCTIONS", 620, 350);
        p.push();
        p.translate(p.width - 35, 35);
        this.drawGear(p);
    }

    settingsWindow(p) {
        p.image(this.constellationImages[0], 0, 0);
        if (this.BGM.getVolume() === 0 && this.BGMon && !this.guessing) {
            this.BGM.fade(1, 2);
        }
        let windowW = p.width / 2;
        let windowH = (p.height - 100) / 2;
        let posX = windowW - windowW / 2;
        let posY = windowH - windowH / 2;
        p.push();
        p.rectMode(p.CORNER);
        p.strokeCap(p.PROJECT);
        p.strokeWeight(6);
        p.noFill();
        p.stroke(205, 205, 50);
        p.line(posX - 6, posY - 6, posX + windowW + 6, posY - 6);
        p.line(posX + windowW + 6, posY - 6, posX + windowW + 6, posY + windowH);
        p.stroke(255, 255, 120);
        p.line(posX - 6, posY, posX - 6, posY + windowH + 6);
        p.line(posX - 6, posY + windowH + 6, posX + windowW + 6, posY + windowH + 6);
        p.noStroke();
        p.fill(255, 255, 175, 90);
        p.rect(posX - 3, posY - 3, windowW + 6, windowH + 6);
        let iconsize = 75;
        p.textAlign(p.CENTER);
        p.imageMode(p.CENTER);
        p.image(this.musicnote, windowW, windowH - 35, iconsize, iconsize);
        p.textSize(40);
        p.textStyle(p.BOLD);
        p.fill(0, 88, 163, 100);
        p.stroke(255, 255, 120);
        p.strokeWeight(2);
        p.text("BGM", windowW, windowH - iconsize / 2);
        p.noFill();
        p.stroke(0, 195, 0);
        p.strokeWeight(10);
        if (!this.BGMon) {
            p.stroke(255, 0, 0);
            let degX = (iconsize / 2 + 10) * p.cos(p.PI / 4);
            let degY = (iconsize / 2 + 10) * p.sin(p.PI / 4);
            p.line(windowW - degX, windowH - iconsize / 2 + degY, windowW + degX, windowH - iconsize / 2 - degY);
        }
        p.ellipse(windowW, windowH - iconsize / 2, iconsize * 1.5);
        p.textSize(25);
        p.stroke(0);
        p.strokeWeight(5);
        p.fill(162, 244, 255);
        p.rectMode(p.CENTER);
        p.rect(windowW, windowH + 50, 150, 36, 20);
        p.fill(0);
        p.noStroke();
        p.text("OK", windowW, windowH + 51.5);
        p.translate(p.width / 2 + windowW / 2 - 28.5, p.height / 2 - windowH / 2 - 20);
        this.drawGear(p);
    }

    gamePlay(p) {
        if (this.BGM.getVolume() === 0 && this.BGMon && !this.guessing) {
            this.BGM.fade(1, 2);
        }
        p.image(this.constellationImages[0], 0, 0);
        if (this.constellationAnswer === 0) {
            this.constellationAnswer = p.floor(p.random(1, 26));
        }

        if (!this.guessing && p.mouseIsPressed && p.mouseX <= p.width && p.mouseY <= p.height - 100) {
            this.inImage = false;
            let target = this.findPixel(p);
            let position = p.createVector(p.mouseX, p.mouseY);
            let star = new Star(position, target, this.inImage, p);
            this.stars.push(star);
            if (this.stars.length > 2000) {
                this.stars.shift();
            }
        }

        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].update();
            this.stars[i].draw();
        }
        for (let m = 0; m < this.messages.length; m++) {
            this.messages[m].draw(p);
            if (this.messages[m].update()) {
                this.messages.splice(m, 1);
            }
        }
        if (this.visibleScoreImage !== -1) {
            p.image(this.scoreStarImages[this.visibleScoreImage], p.width - 310, 50);
        }
        p.stroke(255);
        p.strokeWeight(2);

        const xdis = p.abs(p.mouseX - p.width / 2);
        const h2 = p.height - 25;
        const ydis = p.abs(p.mouseY - h2);
        p.fill(85, 0, 190);
        if (p.mouseIsPressed && xdis <= 70 && ydis <= 15) {
            p.mouseIsPressed = false;
            if (this.doneGame) {
                this.resetGame();
            } else {
                p.fill(255, 255, 0);
                this.guessing = true;
                this.BGM.fade(0, 2);
                if (this.BGMon && this.guessMusic.getVolume() === 0) {
                    this.guessMusic.fade(1, 2);
                }
            }
        } else {
            p.fill(85, 0, 190);
        }

        let buttonText = "GUESS";
        if (this.doneGame) {
            buttonText = "AGAIN";
        }
        if (this.guessing) {
            this.showGuesses(p);
        } else {
            p.rect(p.width / 2, p.height - 25, 140, 30, 20);
            p.noStroke();
            p.textSize(24);
            p.fill(255);
            p.text(buttonText, p.width / 2, p.height - 25);
        }
    }

    showGuesses(p) {
        this.messages = [];
        for (let i = 0; i < this.letters.length; i++) {
            this.letters[i].draw(p);
        }
    }

    drawStar(p) {
        p.noStroke();
        p.fill(255, 255, 0);
        p.beginShape();
        p.vertex(p.mouseX, p.mouseY - 10);
        p.vertex(p.mouseX + 2, p.mouseY - 2);
        p.vertex(p.mouseX + 10, p.mouseY - 2);
        p.vertex(p.mouseX + 4, p.mouseY + 3);
        p.vertex(p.mouseX + 6, p.mouseY + 10);
        p.vertex(p.mouseX, p.mouseY + 6);
        p.vertex(p.mouseX - 6, p.mouseY + 10);
        p.vertex(p.mouseX - 4, p.mouseY + 3);
        p.vertex(p.mouseX - 10, p.mouseY - 2);
        p.vertex(p.mouseX - 2, p.mouseY - 2);
        p.endShape(p.CLOSE);
    }

    resetGame() {
        this.constellationAnswer = 0;
        this.wrongGuess = 0;
        this.visibleScoreImage = -1;
        this.stars = [];
        this.messages = [];
        this.guessing = false;
        this.homeScreen = true;
        this.instrucScreen = false;
        this.settingsScreen = false;
        this.doneGame = false;
        this.inImage = false;

        yellowStars = 0;
    }

    result(letter, p) {
        this.guessing = false;
        this.guessMusic.fade(0, 2);
        if (letter === this.ref[this.constellationAnswer]) {
            this.BGM.fade(0, 1);
            if (this.BGMon) {
                this.sfChime.play();
                this.sfChime.fade(2, 0);
            }
            this.messages.push(new Message(p.createVector(100, 100), "good\njob", p));
            this.stars = [];
            let tempYellow = yellowStars;
            for (let x = 0; x < p.width; x += 8) {
                for (let y = 0; y < p.height - 100; y += 8) {
                    let pos = p.createVector(x, y);
                    if (p.red(this.constellationImages[this.constellationAnswer].get(x, y)) < 200) {
                        this.stars.push(new Star(pos, pos, true, p));
                    }
                }
            }
            let Score = p.floor(100 - tempYellow / this.stars.length * 100);
            if (Score > 25) {
                Score = p.constrain(3 - this.wrongGuess / 2, 0, 3);
            } else if (Score > 15) {
                Score = p.constrain(2 - this.wrongGuess / 2, 0, 3);
            } else if (Score > 5) {
                Score = p.constrain(1 - this.wrongGuess / 2, 0, 3);
            } else {
                Score = 0;
            }
            Score *= 2;
            let missMessage = "WRONG TRIES: \n" + this.wrongGuess;
            this.visibleScoreImage = Score;
            let w2 = 3 * p.width;
            this.messages.push(new Message(p.createVector(w2 / 4 + 40, p.height / 2), missMessage, p));
            this.doneGame = true;
        } else {
            this.messages.push(new Message(p.createVector(p.width - 100, p.height - 140), "try\nagain", p));
            this.wrongGuess++;
        }
    }

    findPixel(p) {
        let x, y;
        let l = this.constellationAnswer;
        for (let i = 0; i < 8; i++) {
            x = p.floor(p.random(this.constellationImages[l].width));
            y = p.floor(p.random(this.constellationImages[l].height));
            if (p.red(this.constellationImages[l].get(x, y)) < 200) {
                this.inImage = true;
                break;
            }
        }
        return p.createVector(x, y);
    }

    inTriangle(p1x, p2x, p2y, p3x, p3y, p) {
        let y2MINy3 = p2y - p3y;
        let x3MINx2 = p3x - p2x;
        let x1MINx3 = p1x - p3x;
        let xmouseMINx3 = p.mouseX - p3x;
        let ymouseMINy3 = p.mouseY - p3y;
        let y23Xxm3 = y2MINy3 * xmouseMINx3;
        let x23Xym3 = x3MINx2 * ymouseMINy3;
        let y23Xx13 = y2MINy3 * x1MINx3;
        let x12Xym3 = x1MINx3 * ymouseMINy3;
        let y23Xxm3ANDx23Xym3 = y23Xxm3 + x23Xym3;
        let a = y23Xxm3ANDx23Xym3 / y23Xx13;
        let b = x12Xym3 / y23Xx13;
        let c = 1.0 - a - b;
        return a > 0 && b > 0 && c > 0;
    }

    mousePressed(event, p) {
        if (this.isPaused) return;

        let w2, h2;
        let xdis, ydis;

        if (this.instrucScreen) {
            this.instrucScreen = false;
            this.homeScreen = true;
        } else if (this.settingsScreen) {


            let iconSize = 75;
            let windowW = p.width / 2;
            let windowH = (p.height - 100) / 2;
            xdis = p.abs(p.mouseX - windowW);
            ydis = p.abs(p.mouseY - (windowH + 50));
            if (p.dist(p.mouseX, p.mouseY, windowW, windowH - iconSize / 2) <= iconSize * 0.8) {
                p.mouseIsPressed = false;
                this.BGMon = !this.BGMon;
                if (!this.BGMon) {
                    this.BGM.fade(0, 0);
                }
            } else if (xdis <= 75 && ydis <= 18) {
                this.settingsScreen = false;
                this.homeScreen = true;
                this.BGM.fade(0, 0);
            }


        } else if (this.homeScreen) {
            if (p.dist(p.mouseX, p.mouseY, p.width - 35, 35) <= 23) {
                this.homeScreen = false;
                this.settingsScreen = true;
            } else if (p.abs(p.mouseX - 620) <= 90) {
                if (p.abs(p.mouseY - 250) <= 40 || p.abs(p.mouseY - 350) <= 30) {
                    if (this.BGMon) {
                        this.sfChime.play();
                        this.sfChime.fade(2, 0);
                    }
                    p.mouseIsPressed = false;
                    this.homeScreen = false;
                    if (p.abs(p.mouseY - 350) <= 30) {
                        this.instrucScreen = true;
                    }
                }
            }
        } else if (this.guessing) {
            let letterGuess;
            for (let i = 0; i < this.letters.length; i++) {
                if (this.letters[i].isClicked()) {
                    letterGuess = this.letters[i].val;
                    break;
                }
            }
            if (letterGuess === "BACK") {
                this.guessing = false;
                this.guessMusic.fade(0, 2);
            } else if (letterGuess) {
                p.mouseIsPressed = false;
                this.result(letterGuess, p);
            }
        }

        w2 = p.width - 40;
        h2 = p.height - 20;
        xdis = p.abs(p.mouseX - w2);
        ydis = p.abs(p.mouseY - h2);
        let inSquare = xdis <= 30 && ydis <= 20;
        if (inSquare || this.inTriangle(p.width - 70, p.width - 40, p.height - 70, p.width - 10, p.height - 40, p)) {
            this.resetGame();
            this.BGM.fade(0, 1);
            this.guessMusic.fade(0, 1);
            this.settingsScreen = false;
            this.homeScreen = true;

        }
    }

    pause() {
        super.pause();
        this.soundSave = [this.BGM.getVolume(), this.guessMusic.getVolume(), this.sfChime.getVolume()];
        this.BGM.setVolume(0);
        this.guessMusic.setVolume(0);
        this.sfChime.setVolume(0);
    }

    resume() {
        super.resume();
        this.BGM.setVolume(this.soundSave[0]);
        this.guessMusic.setVolume(this.soundSave[1]);
        this.sfChime.setVolume(this.soundSave[2]);
    }

}

class PlinkoGame extends Game {
    constructor(name) {
        super(name);
        this.URL = "https://raw.githubusercontent.com/JefeThePug/plinko/main/";
        this.board = null;
        this.scoreballs = [];
        this.dings = [];
        this.particles = [];
        this.plinkos = [];
        this.bounds = [];
        this.score = null;
        this.goals = [];
        this.cols = 10;
        this.rows = 8;
        this.spacing = null;
        this.finished = false;
        this.tilted = false;
        this.tiltreset = 0;
        this.muted = false;
    }

    preload(p) {
        for (let i = 1; i < 9; i++) {
            this.dings[i] = p.loadSound(`${this.URL}assets/${i}.wav`);
        }
        this.board = p.loadImage(`${this.URL}assets/bg.jpg`);
        for (let sb = 0; sb < 6; sb++) {
            this.scoreballs[sb] = p.loadImage(`${this.URL}assets/${sb}.png`);
        }
    }

    setup(p) {
        const plinkoContainer = document.querySelector('.plinko-container');
        p.createCanvas(400, 600).parent(plinkoContainer);
        p.colorMode(p.HSB);
        p.imageMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        this.spacing = p.width / this.cols;
        let margin = 2 * this.spacing;
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < ((j % 2 === 0) ? this.cols : this.cols + 1); i++) {
                let plinkoX = ((j % 2 === 0) ? this.spacing / 2 : 0) + i * this.spacing;
                let plinkoY = (this.spacing + j * this.spacing) + margin;
                this.plinkos.push(new PlinkoParts(plinkoX, plinkoY, 4, p.constrain(j + 1, 1, 8), p));
            }
        }
        this.bounds.push(new Boundary(p.width / 2, p.height + 50, p.width, 100, "floor"));
        this.bounds.push(new Boundary(-45, p.height / 2, 100, p.height, "side"));
        this.bounds.push(new Boundary(p.width + 45, p.height / 2, 100, p.height, "side"));
        for (let b = 1; b < this.cols / 2; b++) {
            let w = 10;
            let h = 180;
            let x = b * (2 * this.spacing);
            let y = p.height - h / 2;
            this.bounds.push(new Boundary(x, y, w, h, "bucket"));
        }
        Events.on(engine, 'collisionStart', this.collision.bind(this));
        this.score = new Score();
        this.score.setScores();
        checkAllSetupsComplete()
    }

    draw(p) {
        if (this.isPaused) return;

        if (p.keyIsDown(p.SHIFT) === true && this.particles.length > 0 && !this.tilted) {
            this.tilt(p);
        }
        p.image(this.board, p.width / 2, p.height / 2);
        for (let x = 0; x < this.plinkos.length; x++) {
            this.plinkos[x].show(p);
        }
        for (let b = 0; b < this.bounds.length; b++) {
            this.bounds[b].show(p);
            for (let i = 0; i < 5; i++) {
                if (this.finished) {
                    let x = this.score.getImage(i);
                    p.image(this.scoreballs[x], i * this.spacing * 2 + this.spacing, p.height - this.spacing * 3);
                } else {
                    p.image(this.scoreballs[0], i * this.spacing * 2 + this.spacing, p.height - this.spacing * 3);
                }
            }
            p.push();
            p.fill(0, 0, 0);
            p.stroke(60, 100, 100);
            p.strokeWeight(3);
            p.textSize(50);
            if (this.finished) {
                let SCORE = 0;
                for (let s = 0; s < this.goals.length; s++) {
                    SCORE += this.score.getValue(this.goals[s] - 1);
                }
                p.text("YOUR SCORE", p.width / 2, p.height / 2 - 100);
                p.strokeWeight(6);
                p.textSize(150);
                p.text(SCORE, p.width / 2, p.height / 2);
            } else {
                if (this.particles.length < 5) {
                    p.text("Place 5 balls", p.width / 2, p.height / 2 - 100);
                    p.text("at the top", p.width / 2, p.height / 2 - 50);
                } else {
                    for (let i = 0; i < this.particles.length; i++) {
                        this.particles[i].wake();
                    }
                }
            }
            p.pop();
            let activeCount = 0;
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].show(p);
                if (this.particles[i].isOffScreen()) {
                    World.remove(world, this.particles[i].body);
                    this.particles.splice(i, 1);
                }
                if (this.particles[i].body.label === "particle") {
                    activeCount++;
                }
            }
            if (activeCount === 0 && this.particles.length !== 0) {
                this.finished = true;
            }
            if (this.tilted) {
                p.push();
                p.textSize(150);
                p.fill(0, 100, 100);
                p.textStyle(p.ITALIC);
                if (this.tiltreset % 2 === 1) {
                    p.text("TILT", p.width / 2 - 10, p.height / 2);
                }
                p.pop();
                this.tiltreset++;
                if (this.tiltreset === 10) {
                    this.tiltreset = 0;
                    this.tilted = false;
                }
            }
        }
    }

    tilt(p) {
        let forceMag = 0.005 * this.particles[0].body.mass;
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].body.label === "particle") {
                Matter.Body.applyForce(this.particles[i].body, this.particles[i].body.position, {
                    x: (forceMag + p.random() * forceMag) * Matter.Common.choose([1, -1]),
                    y: -forceMag + p.random() * -forceMag
                });
                this.tilted = true;
                this.tiltreset = 0;
            }
        }
    }

    pegHit(A, B) {
        if (!this.muted) {
            if (A.label === "peg") {
                this.dings[A.sound].play(0, 1, 1, 0.5, 0.5);
                A.c = 60;
            } else {
                this.dings[B.sound].play(0, 1, 1, 0.5, 0.5);
                B.c = 60;
            }
        }
    }

    goalHit(A, B) {
        let pos;
        if (A.label === "particle") {
            pos = A.position.x;
            A.label = "floor";
            A.velocity.x = 0;
        } else {
            pos = B.position.x;
            B.label = "floor";
            B.velocity.x = 0;
        }
        this.goals.push(Math.ceil(pos / (this.spacing * 2)));
        this.goals.sort(function (a, b) {
            return a - b
        });
    }

    collision(event) {
        let pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            let bodyA = pairs[i].bodyA;
            let bodyB = pairs[i].bodyB;
            let C = bodyA.label + bodyB.label;
            if (C === "particlepeg" || C === "pegparticle") {
                this.pegHit(bodyA, bodyB);
            } else if (C === "particlefloor" || C === "floorparticle") {
                this.goalHit(bodyA, bodyB);
            }
        }
    }

    reset() {
        this.score.setScores();
        for (let i = this.particles.length - 1; i >= 0; i--) {
            World.remove(world, this.particles[i].body);
            this.particles.splice(i, 1);
        }
        this.goals = [];
        this.finished = false;
    }

    newBall(_x, _y, sleeping, atStart, p) {
        let x = _x;
        let y = _y;
        if (atStart) {
            x = p.constrain(x, 25, p.width - 25);
            y = p.constrain(y, 0, this.spacing * 2);
        }
        this.particles.push(new Ball(x, y, 0.5 * this.spacing - 5, sleeping, p));
    }

    giveBonus(p) {
        let x = this.score.return100() * this.spacing * 2 + this.spacing;
        for (let i = 0; i < 5; i++) {
            this.newBall(x, p.height, false, false, p);
            this.newBall(p.width / 2, 0, false, false, p);
        }
    }

    mousePressed(event, p) {
        if (this.isPaused) return;

        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            if (this.particles.length < 5) {
                this.newBall(p.mouseX, p.mouseY, true, true, p);
            }
            if (this.finished === true) {
                this.reset();
            }
        }
    }

    keyPressed(event, p) {
        if (this.isPaused) return;

        event.preventDefault();

        if (p.key === " " && this.particles.length < 5) {
            this.newBall(p.mouseX, p.mouseY, true, true, p);
        } else if (p.key === "B" || p.key === "b") {
            this.giveBonus(p);
        }
    }

    pause() {
        super.pause();
        this.muted = true;
    }

    resume() {
        super.resume();
        this.muted = false;
    }

}

let setupCount = 0;

const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Sleeping = Matter.Sleeping;
let engine = Engine.create()
let world = engine.world;
engine.gravity.y = 0.6;
Matter.Runner.run(engine);
let yellowStars;

function checkAllSetupsComplete() {
    setupCount++;
    if (setupCount === 3) {
        console.log('All p5.js instances have completed setup!');
        document.dispatchEvent(new Event('p5SetupComplete'));
    }
}

const gameManager = new GameManager();