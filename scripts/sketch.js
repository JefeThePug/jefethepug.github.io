let setupCount = 0;

let textBlocks;
let blaster;
let Points = [];
let character = [];
let spaceCode = 0;
let spaceLetter = '';
let SCORE = 0;

function phonicsGame(p) {
    const URL = "https://raw.githubusercontent.com/JefeThePug/PhonicsBlast/main/"
    let Stars;
    let bg;
    let logo;
    let instruc;
    let highscorebg;
    let characterSet = [];
    let isOver = false;
    let StartScreenDisplay = true;
    let instructionScreen = false;
    let HallOfFame = false;
    let emptyCartridge = false;
    let checkingScores = true;
    const ref = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'W', 'Z'];
    let famerName = '';
    let BGM_p;
    let sfCharClear;
    let sfGameOver;
    let sfLetterPress;


    p.preload = () => {
        const phonicsContainer = document.querySelector('.phonics-container');
        p.createCanvas(800, 569).parent(phonicsContainer);
        textBlocks = new Buttons(p);
        blaster = new Blaster(p);
        bg = p.loadImage(`${URL}assets/bg.jpg`);
        logo = p.loadImage(`${URL}assets/logo.jpg`);
        instruc = p.loadImage(`${URL}assets/instruc.jpg`);
        highscorebg = p.loadImage(`${URL}assets/highscore.jpg`);
        for (let i = 0; i < ref.length; i++) {
            characterSet[i] = p.loadImage(`${URL}assets/${ref[i]}.png`);
        }
        BGM_p = p.loadSound(`${URL}assets/sounds/BGM.mp3`);
        sfCharClear = p.loadSound(`${URL}assets/sounds/CharClear.wav`);
        sfGameOver = p.loadSound(`${URL}assets/sounds/GameOver.wav`);
        sfLetterPress = p.loadSound(`${URL}assets/sounds/LetterPress.wav`);
    }

    p.setup = () => {
        p.canvas.style.display = "none";
        checkAllSetupsComplete();
    }

    function startDisplay() {
        BGM_p.pause();
        p.push();
        p.background(logo);
        p.strokeWeight(5);
        p.fill(162, 244, 86);
        p.rect(p.width / 2 - 80, p.height - 100, 200, 80, 20);

        p.strokeWeight(3);
        p.fill(255, 244, 86);
        p.rect(p.width / 4 - 140, p.height - 50, 200, 40, 20);
        p.fill(162, 244, 255);
        p.rect((3 * p.width) / 4 - 30, p.height - 50, 200, 40, 20);

        p.textAlign(p.CENTER);
        p.textSize(70);
        p.noStroke();
        p.fill(1);
        p.text("PLAY", p.width / 2 - 72.5, p.height - 100, 200, 80);
        p.textSize(30);
        p.text("Instructions", p.width / 4 - 135, p.height - 48, 200, 50);
        p.text("Top 10", (3 * p.width) / 4 - 25, p.height - 48, 200, 50);
        p.pop();
        return false;
    }

    function instructionsDisplay() {
        p.push();
        p.translate(0, 0);
        p.background(instruc);
        p.textSize(20);
        p.textAlign(p.CENTER);
        p.fill(0);
        p.rect(0, p.height - 30, 800, 40);
        p.fill(255);
        p.text("Click anywhere to go back.", 0, p.height - 25, 800, 40);
        return false;
    }

    function pGamePlay() {
        if (!BGM_p.isPlaying()) {
            BGM_p.loop();
        }
        p.background(bg);
        if (p.keyIsDown(p.LEFT_ARROW) === true) {
            blaster.setRotation(-0.02);
        } else if (p.keyIsDown(p.RIGHT_ARROW) === true) {
            blaster.setRotation(0.02);
        } else {
            blaster.setRotation(0);
        }
        blaster.render();
        blaster.turn();
        blaster.update();
        if (!character.length) {
            let n = p.floor(p.random(0, characterSet.length));
            let c = new Character(characterSet[n], ref[n], p);
            textBlocks.inputLetters(n);
            character.push(c);
            textBlocks.unHighlight();
        }
        p.fill(255, 255, 0);
        p.strokeWeight(5);
        p.ellipse(p.width / 2, p.height - 30, 80, 100);
        p.fill(1);
        const offsets = [2, 1, 0, 2, 6, 2, 0, 1, 2, 3, 4, 4, 0, 4, 4, 3];
        p.push();
        p.noStroke();
        p.translate(p.width / 2, p.height - 65);
        p.rotate(p.PI);
        p.beginShape();
        for (let i = 0; i <= 16; i++) {
            let angle = p.map(i, 0, 16, 0, p.TWO_PI);
            let r = 10 - offsets[i];
            let x = r * p.cos(angle);
            let y = r * p.sin(angle);
            p.vertex(x, y);
        }
        p.endShape(close);
        p.pop();
        p.rect(0, p.height - 50, p.width, 50);
        if (SCORE >= 0) {
            p.fill(0, 101, 12);
        } else {
            p.fill(101, 0, 12);
        }
        if (Stars) {
            Stars.run();
        }
        p.textSize(40);
        let theScore = 'score:\xA0' + SCORE.toString();
        p.text(theScore, p.width / 2 + 120, p.height - 100, 100, 100);
        textBlocks.render();
        for (let j = character.length - 1; j >= 0; j--) {
            character[j].render();
            character[j].update();
            if (character[j].s > 200) {
                textBlocks.unHighlight();
                gameOver();
            } else if (character[j].s < 100) {
                Stars = new ParticleSystem(character[j].pos, p);
                Points.push(new Point(character[j].pos, '+10', character[j].s, p));
                character.splice(j, 1);
                SCORE += 10;
                sfCharClear.play();
                blaster.hearts = [];
                textBlocks.letterClear();
            }
        }
        if (emptyCartridge) {
            p.push();
            p.textSize(30);
            p.fill(255, 0, 0);
            p.text("No letter selected", 80, p.height - 100, p.width - 80, 100);
            p.pop();
        }
        for (let point = Points.length - 1; point >= 0; point--) {
            Points[point].run();
            if (Points[point].isDead()) {
                Points.splice(point, 1);
            }
        }
        return false;
    }

    function highScoreMenu() {
        p.background(highscorebg);
        if (!checkingScores) {
            p.textSize(30);
            p.fill(0);
            p.text('Enter your name:', 50, 35, 300, 60);
            p.textSize(40);
            p.fill(21, 47, 245);
            p.text(famerName, 60, 85, 300, 60);
            p.text(SCORE, 325, 85, 300, 60);
            p.push();
            p.strokeWeight(3);
            p.textAlign(p.CENTER);
            p.textSize(36);
            p.translate(12, 90);
            for (let i = 0; i < 4; i++) {
                p.translate(0, 70);
                for (let j = 0; j < 7; j++) {
                    if (i == 3 && j == 5) {
                        break;
                    }
                    p.translate(50, 0);
                    p.stroke(200, 170, 0);
                    p.fill(255);
                    p.rect(0, 0, 40, 60, 20);
                    p.noStroke();
                    p.fill(0);
                    p.text(ref[(7 * i) + j], 5, 10, 40, 60);
                }
                p.translate(-350, 0);
            }
            p.translate(150, 100);
            p.textSize(26);
            p.fill(255);
            p.stroke(200, 170, 0);
            p.rect(0, 0, 90, 60, 20);
            p.fill(0);
            p.noStroke();
            p.text('BACK', 4, 15, 90, 60);
            p.translate(100, 0);
            p.fill(0, 255, 0);
            p.stroke(200, 170, 0);
            p.rect(0, 0, 110, 60, 20);
            p.fill(0);
            p.noStroke();
            p.text('SUBMIT', 4, 15, 110, 60);
            p.pop();
        } else {
            p.push();
            p.stroke(0);
            p.strokeWeight(8);
            p.fill(162, 244, 86);
            p.rect(50, 100, 370, 100, 20);
            p.fill(0);
            p.beginShape();
            p.vertex(80, 150);
            p.vertex(95, 130);
            p.vertex(95, 140);
            p.vertex(135, 140);
            p.vertex(135, 160);
            p.vertex(95, 160);
            p.vertex(95, 170);
            p.endShape(p.CLOSE);
            p.noStroke();
            p.textSize(60);
            p.textAlign(p.CENTER);
            p.text("Go Back", 95, 115, 360, 100);
            p.pop();
        }
        return false;
    }

    p.draw = () => {
        if (StartScreenDisplay) {
            startDisplay();
        } else if (instructionScreen) {
            instructionsDisplay();
        } else if (HallOfFame) {
            highScoreMenu();
        } else {
            pGamePlay();
        }
    }

    p.keyTyped = () => {
        if ((p.keyCode > 64 && p.keyCode < 91) || (p.keyCode > 96 && p.keyCode < 123)) {
            textBlocks.unHighlight();
            let fixedKey = p.keyCode < 91 ? p.keyCode : p.keyCode - 32
            blaster.firing(true, p.key.toUpperCase(), fixedKey);
            let keySpot = textBlocks.outputLog().indexOf(p.key.toUpperCase());
            if (keySpot >= 0) {
                textBlocks.setHighlight(keySpot);
                spaceLetter = p.key.toUpperCase();
                spaceCode = fixedKey;
                emptyCartridge = false;
            }
        } else if (p.keyCode === 32) {
            if (spaceCode === 0) {
                emptyCartridge = true;
            } else {
                blaster.firing(true, spaceLetter, spaceCode);
                emptyCartridge = false;
            }
        }
    }

    p.keyReleased = () => {
        if (p.keyCode === p.RIGHT_ARROW || p.keyCode === p.LEFT_ARROW) {
            blaster.setRotation(0);
        } else if ((p.keyCode > 64 && p.keyCode < 91) || (p.keyCode > 96 && p.keyCode < 123) || p.keyCode === 32) {
            blaster.firing(false);
        }
        return false;
    }

    p.mousePressed = () => {
        if (p.canvas.style.display !== 'none') {
            if (StartScreenDisplay) {
                if (p.mouseX >= p.width / 2 - 80 && p.mouseX <= p.width / 2 + 120 && p.mouseY >= p.height - 100 && p.mouseY <= p.height - 20) {
                    StartScreenDisplay = false;
                } else if (p.mouseX >= p.width / 4 - 140 && p.mouseX <= p.width / 4 + 60 && p.mouseY >= p.height - 50 && p.mouseY <= p.height - 10) {
                    StartScreenDisplay = false;
                    instructionScreen = true;
                } else if (p.mouseX >= (3 * p.width) / 4 - 30 && p.mouseX <= (3 * p.width) / 4 + 170 && p.mouseY >= p.height - 50 && p.mouseY <= p.height - 10) {
                    StartScreenDisplay = false;
                    HallOfFame = true;
                }
                return false;
            } else if (instructionScreen) {
                instructionScreen = false;
                StartScreenDisplay = true;
                return false;
            } else if (isOver) {
                restartGame();
                return false;
            } else if (HallOfFame) {
                if (checkingScores) {
                    if (p.mouseX >= 50 && p.mouseX <= 420 && p.mouseY >= 100 && p.mouseY <= 200) {
                        StartScreenDisplay = true;
                        HallOfFame = false;
                    }
                }
            } else { //game play
                if (p.mouseY >= p.height - textBlocks.height - 2 && p.mouseY < p.height) {
                    let z = p.ceil(p.mouseX / (p.width / 4)) - 1;
                    let mKey = textBlocks.getLetter(z);
                    textBlocks.setHighlight(z);
                    if (mKey) {
                        mKey = mKey.toUpperCase();
                        let mCode = ref.indexOf(mKey) + 65;
                        spaceLetter = mKey;
                        spaceCode = mCode;
                        emptyCartridge = false;
                    }
                } else {
                    if (spaceCode === 0) {
                        emptyCartridge = true;
                    } else {
                        blaster.firing(true, spaceLetter, spaceCode);
                        emptyCartridge = false;
                    }
                }
            }
        }
        return false;
    }

    p.mouseMoved = () => {
        if (p.mouseY < p.height - textBlocks.height - 2 && p.mouseY > 0) {
            blaster.turn(p.atan2(p.mouseY - (p.height - 50), p.mouseX - (p.width / 2)));
        }
        return false;
    }

    p.mouseReleased = () => {
        blaster.setRotation(0);
        blaster.firing(false);
        return false;
    }

    function gameOver() {
        BGM_p.pause();
        sfGameOver.play();
        p.noLoop();
        p.push();
        p.background(134, 0, 0, 95);
        p.fill(0);
        p.textAlign(p.CENTER);
        p.textSize(60);
        p.stroke(255);
        p.strokeWeight(5);
        p.text('GAME OVER', 0, p.height / 4, p.width, 100);
        p.text('FINAL SCORE\xA0' + SCORE.toString(), 0, p.height / 4 + 130, p.width, 100);

        let nextText = "RESTART";
        p.fill(0, 255, 255);
        p.stroke(70);
        p.strokeWeight(5);
        p.rect(p.width / 2 - 100, (3 * p.height) / 4, 200, 70, 20);
        p.fill(125);
        p.stroke(70);
        p.strokeWeight(5);
        p.rect(p.width / 2 - 100, (3 * p.height) / 4 + 80, 200, 45, 20);
        p.fill(0);
        p.textSize(20);
        p.noStroke();
        p.text('HOME', p.width / 2 - 90, (3 * p.height) / 4 + 92.5, 190, 45);
        p.textSize(26);
        p.text(nextText, p.width / 2 - 90, (3 * p.height) / 4 + 15, 190, 45);
        isOver = true;
        p.pop();
        return false;
    }

    function restartGame() {
        if (p.canvas.style.display !== 'none') {
            if (p.mouseX >= p.width / 2 - 100 && p.mouseX <= p.width / 2 + 100) {
                character = [];
                textBlocks.letterClear();
                blaster.hearts = [];
                Points = [];
                let n = p.floor(p.random(0, characterSet.length));
                textBlocks.inputLetters(n);
                character.push(new Character(characterSet[n], ref[n], p));
                textBlocks.unHighlight();
                isOver = false;
                if (p.mouseY >= (3 * p.height) / 4 && p.mouseY <= (3 * p.height) / 4 + 70) {
                    if (!checkingScores) {
                        HallOfFame = true;
                    } else {
                        SCORE = 0;
                    }
                } else if (p.mouseY >= (3 * p.height) / 4 + 80 && p.mouseY <= (3 * p.height) / 4 + 147.5) {
                    StartScreenDisplay = true;
                }
                p.loop();
                p.redraw();
                return false;
            }
        }
    }
}

let yellowStars;
let fontShown, fontStars;

function letterGame(p) {
    const URL = "https://raw.githubusercontent.com/JefeThePug/LetterConstellations/main/"
    let splash, instruc, musicnote, constellationImages = [],
        messageImages = [],
        scoreStarImages = [];
    let constellationAnswer, wrongGuess, visibleScoreImage;
    const ref = ["_bg", "a", "e", "i", "o", "u", "k", "z", "r", "s", "d", "h", "f", "v", "j", "t", "c", "p", "g", "y", "x", "q", "n", "l", "m", "b", "w"];
    let stars = [],
        letters = [],
        messages = [];
    let guessing, homeScreen, instrucScreen, settingsScreen, doneGame, inImage, BGMon;
    let BGM, guessMusic, sfChime;

    p.preload = () => {
        for (let i = 0; i < ref.length; i++) {
            constellationImages[i] = p.loadImage(`${URL}assets/${ref[i]}.jpg`);
        }
        for (let j = 0; j <= 6; j++) {
            scoreStarImages[j] = p.loadImage(`${URL}assets/${j}.png`);
        }
        splash = p.loadImage(`${URL}assets/_title.jpg`);
        instruc = p.loadImage(`${URL}assets/_instruc.jpg`);
        messageImages[0] = p.loadImage(`${URL}assets/_tryagain.jpg`);
        messageImages[1] = p.loadImage(`${URL}assets/_welldone.jpg`);
        musicnote = p.loadImage(`${URL}assets/_music.png`);
        fontStars = p.loadFont(`${URL}assets/_ABCBULLE.TTF`);
        fontShown = p.loadFont(`${URL}assets/_ABCPRINT.TTF`);
        BGM = p.loadSound(`${URL}assets/_music/bgm.mp3`);
        guessMusic = p.loadSound(`${URL}assets/_music/guess.mp3`);
        sfChime = p.loadSound(`${URL}assets/_music/sfChime.mp3`);
    }

    p.setup = () => {
        const letterContainer = document.querySelector('.letter-container');
        p.createCanvas(800, 500, {willReadFrequently: true}).parent(letterContainer);
        p.noCursor();
        guessing = false;
        BGMon = true;
        homeScreen = true;
        instrucScreen = false;
        settingsScreen = false;
        doneGame = false;
        constellationAnswer = 0;
        yellowStars = 0;
        wrongGuess = 0;
        visibleScoreImage = -1;
        p.textAlign(p.CENTER, p.CENTER);
        p.rectMode(p.CENTER);
        guessMusic.loop();
        guessMusic.fade(0, 0);
        BGM.loop();
        BGM.fade(0, 0);
        let buffer = 80;
        for (let i = 1; i <= ref.length; i++) {
            let i1div = p.floor((i - 1) / 7);
            let i1mod = (i - 1) % 7;
            let pos = p.createVector(i1div * 50 + buffer, i1mod * 50 + buffer);
            if (i === ref.length) {
                let idiv = p.floor(i / 7);
                let imod = i % 7;
                let newPos = p.createVector(idiv * 50 + buffer, imod * 50 + buffer);
                letters[i - 1] = new Letter(newPos, "BACK", p);
            } else {
                letters[i - 1] = new Letter(pos, ref[i], p);
            }
        }
        p.canvas.style.display = "none";
        checkAllSetupsComplete()
    }

    function gamePlay(position) {
        if (BGM.getVolume() === 0 && BGMon && !guessing) {
            BGM.fade(1, 2);
        }
        p.image(constellationImages[0], 0, 0);
        if (constellationAnswer === 0) {
            constellationAnswer = p.floor(p.random(1, 26));
        }
        if (p.canvas.style.display !== 'none') {
            if (!guessing && p.mouseIsPressed && p.mouseX <= p.width && p.mouseY <= p.height - 100) {
                inImage = false;
                let target = findPixel();
                let star = new Star(position, target, inImage, p);
                stars.push(star);
                if (stars.length > 2000) {
                    stars.shift();
                }
            }
        }
        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw();
        }
        for (let m = 0; m < messages.length; m++) {
            messages[m].draw(p);
            if (messages[m].update()) {
                messages.splice(m, 1);
            }
        }
        if (visibleScoreImage !== -1) {
            p.image(scoreStarImages[visibleScoreImage], p.width - 310, 50);
        }
        p.stroke(255);
        p.strokeWeight(2);
        let xdis = p.abs(p.mouseX - p.width / 2);
        let h2 = p.height - 25;
        let ydis = p.abs(p.mouseY - h2);
        if (p.canvas.style.display !== 'none') {
            if (p.mouseIsPressed && xdis <= 70 && ydis <= 15) {
                p.mouseIsPressed = false;
                if (doneGame) {
                    resetGame();
                } else {
                    p.fill(255, 255, 0);
                    guessing = true;
                    BGM.fade(0, 2);
                    if (BGMon && guessMusic.getVolume() === 0) {
                        guessMusic.fade(1, 2);
                    }
                }
            } else {
                p.fill(85, 0, 190);
            }
        }
        let buttonText = "GUESS";
        if (doneGame) {
            buttonText = "AGAIN";
        }
        if (guessing) {
            showGuesses();
        } else {
            p.rect(p.width / 2, p.height - 25, 140, 30, 20);
            p.noStroke();
            p.textSize(24);
            p.fill(255);
            p.text(buttonText, p.width / 2, p.height - 25);
        }
        if (p.canvas.style.display !== 'none') {
            if (p.mouseIsPressed) {
                let intriangle = inTriangle(p.width - 70, p.width - 40, p.height - 70, p.width - 10, p.height - 40);
                let w2 = p.width - 40;
                h2 = p.height - 20;
                xdis = p.abs(p.mouseX - w2);
                ydis = p.abs(p.mouseY - h2);
                let insquare = xdis <= 30 && ydis <= 20;
                if (insquare || intriangle) {
                    resetGame();
                    BGM.fade(0, 1);
                    guessMusic.fade(0, 1);
                    homeScreen = true;
                }
            }
        }
    }

    function homeDisplay() {
        p.image(splash, 0, 0);
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
        if (p.canvas.style.display !== 'none') {
            if (p.mouseIsPressed) {
                if (p.abs(p.mouseX - 620) <= 90 && p.abs(p.mouseY - 250) <= 40) {
                    if (BGMon) {
                        sfChime.play();
                        sfChime.fade(2, 0);
                    }
                    p.mouseIsPressed = false;
                    homeScreen = false;
                } else if (p.abs(p.mouseX - 620) <= 90 && p.abs(p.mouseY - 350) <= 30) {
                    if (BGMon) {
                        sfChime.play();
                        sfChime.fade(2, 0);
                    }
                    p.mouseIsPressed = false;
                    homeScreen = false;
                    instrucScreen = true;
                } else if (p.dist(p.mouseX, p.mouseY, p.width - 35, 35) <= 23) {
                    homeScreen = false;
                    settingsScreen = true;
                }
            }
        }
    }

    p.draw = () => {
        let position = p.createVector(p.mouseX, p.mouseY);
        if (homeScreen) {
            homeDisplay();
        } else if (instrucScreen) {
            p.image(instruc, 0, 0);
            p.fill(0);
            p.rect(p.width / 2, p.height - 15, p.width, 30);
            p.fill(255);
            p.text("CLICK ANYWHERE TO GO BACK", p.width / 2, p.height - 15);
        } else if (settingsScreen) {
            settingsWindow();
        } else { // game play
            gamePlay(position);
        }
        drawStar(position);
    }

    function settingsWindow() {
        p.image(constellationImages[0], 0, 0);
        if (BGM.getVolume() === 0 && BGMon && !guessing) {
            BGM.fade(1, 2);
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
        p.image(musicnote, windowW, windowH - 35, iconsize, iconsize);
        p.textSize(40);
        p.textStyle(p.BOLD);
        p.fill(0, 88, 163, 100);
        p.stroke(255, 255, 120);
        p.strokeWeight(2);
        p.text("BGM", windowW, windowH - iconsize / 2);
        p.noFill();
        p.stroke(0, 195, 0);
        p.strokeWeight(10);
        if (!BGMon) {
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
        let disx = p.abs(p.mouseX - windowW);
        let h2 = windowH + 50;
        let disy = p.abs(p.mouseY - h2);
        if (p.canvas.style.display !== 'none') {
            if (p.mouseIsPressed) {
                if (p.dist(p.mouseX, p.mouseY, windowW, windowH - iconsize / 2) <= iconsize * 0.8) {
                    p.mouseIsPressed = false;
                    BGMon = !BGMon;
                    if (!BGMon) {
                        BGM.fade(0, 0);
                    }
                } else if (disx <= 75 && disy <= 18) {
                    settingsScreen = false;
                    homeScreen = true;
                    BGM.fade(0, 0);
                }
            }
        }
    }

    function showGuesses() {
        messages = [];
        for (let i = 0; i < letters.length; i++) {
            letters[i].draw(p);
        }
    }

    function resetGame() {
        doneGame = false;
        constellationAnswer = 0;
        stars = [];
        messages = [];
        visibleScoreImage = -1;
        yellowStars = 0;
        wrongGuess = 0;
        guessing = false;
        p.mouseIsPressed = false;
    }

    function result(letter) {
        guessing = false;
        guessMusic.fade(0, 2);
        if (letter === ref[constellationAnswer]) {
            BGM.fade(0, 1);
            if (BGMon) {
                sfChime.play();
                sfChime.fade(2, 0);
            }
            messages.push(new Message(p.createVector(100, 100), "good\njob"));
            stars = [];
            let tempYellow = yellowStars;
            for (let x = 0; x < p.width; x += 8) {
                for (let y = 0; y < p.height - 100; y += 8) {
                    let pos = p.createVector(x, y);
                    if (p.red(constellationImages[constellationAnswer].get(x, y)) < 200) {
                        stars.push(new Star(pos, pos, true, p));
                    }
                }
            }
            let Score = p.floor(100 - tempYellow / stars.length * 100);
            if (Score > 25) {
                Score = p.constrain(3 - wrongGuess / 2, 0, 3);
            } else if (Score > 15) {
                Score = p.constrain(2 - wrongGuess / 2, 0, 3);
            } else if (Score > 5) {
                Score = p.constrain(1 - wrongGuess / 2, 0, 3);
            } else {
                Score = 0;
            }
            Score *= 2;
            let missMessage = "WRONG TRIES: \n" + wrongGuess;
            visibleScoreImage = Score;
            let w2 = 3 * p.width;
            messages.push(new Message(p.createVector(w2 / 4 + 40, p.height / 2), missMessage));
            doneGame = true;
        } else {
            messages.push(new Message(p.createVector(p.width - 100, p.height - 140), "try\nagain"));
            wrongGuess++;
        }
    }

    function findPixel() {
        let x, y;
        let l = constellationAnswer;
        for (let i = 0; i < 8; i++) {
            x = p.floor(p.random(constellationImages[l].width));
            y = p.floor(p.random(constellationImages[l].height));
            if (p.red(constellationImages[l].get(x, y)) < 200) {
                inImage = true;
                break;
            }
        }
        return p.createVector(x, y);
    }

    function drawStar(position) {
        p.noStroke();
        p.fill(255, 255, 0);
        p.beginShape();
        p.vertex(position.x, position.y - 10);
        p.vertex(position.x + 2, position.y - 2);
        p.vertex(position.x + 10, position.y - 2);
        p.vertex(position.x + 4, position.y + 3);
        p.vertex(position.x + 6, position.y + 10);
        p.vertex(position.x, position.y + 6);
        p.vertex(position.x - 6, position.y + 10);
        p.vertex(position.x - 4, position.y + 3);
        p.vertex(position.x - 10, position.y - 2);
        p.vertex(position.x - 2, position.y - 2);
        p.endShape(p.CLOSE);
    }

    p.mousePressed = () => {
        if (p.canvas.style.display !== 'none') {
            if (guessing) {
                let letterGuess;
                for (let i = 0; i < letters.length; i++) {
                    if (letters[i].isClicked()) {
                        letterGuess = letters[i].val;
                        break;
                    }
                }
                if (letterGuess === "BACK") {
                    guessing = false;
                    guessMusic.fade(0, 2);
                } else if (letterGuess) {
                    p.mouseIsPressed = false;
                    result(letterGuess);
                }
            } else if (instrucScreen) {
                instrucScreen = false;
                homeScreen = true;
            }
        }
    }

    function inTriangle(p1x, p2x, p2y, p3x, p3y) {
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
}

const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Sleeping = Matter.Sleeping;
let engine = Engine.create()
Matter.Runner.run(engine);
let world = engine.world;
world.gravity.y = 0.6;
let ball;

function plinkoGame(p) {
    const URL = "https://raw.githubusercontent.com/JefeThePug/plinko/main/"
    let board;
    let scoreballs = [];
    let dings = [];
    let particles = [];
    let plinkos = [];
    let bounds = [];
    let score;
    let goals = [];
    let cols = 10;
    let rows = 8;
    let spacing;
    let finished = false;
    let tilted = false;
    let tiltreset = 0;

    function reset() {
        score.setScores();
        for (let i = particles.length - 1; i >= 0; i--) {
            World.remove(world, particles[i].body);
            particles.splice(i, 1);
        }
        goals = [];
        finished = false;
    }

    p.preload = () => {
        for (let i = 1; i < 9; i++) {
            dings[i] = p.loadSound(`${URL}assets/${i}.wav`);
        }
        ball = p.loadImage(`${URL}assets/ball.png`);
        board = p.loadImage(`${URL}assets/bg.jpg`);
        for (let sb = 0; sb < 6; sb++) {
            scoreballs[sb] = p.loadImage(`${URL}assets/${sb}.png`);
        }
    }

    p.setup = () => {
        const plinkoContainer = document.querySelector('.plinko-container');
        p.createCanvas(400, 600).parent(plinkoContainer);
        p.colorMode(p.HSB);
        p.imageMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        spacing = p.width / cols;
        let margin = 2 * spacing;
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < ((j % 2 === 0) ? cols : cols + 1); i++) {
                let plinkoX = ((j % 2 === 0) ? spacing / 2 : 0) + i * spacing;
                let plinkoY = (spacing + j * spacing) + margin;
                plinkos.push(new PlinkoParts(plinkoX, plinkoY, 4, p.constrain(j + 1, 1, 8), p));
            }
        }
        bounds.push(new Boundary(p.width / 2, p.height + 50, p.width, 100, "floor"));
        bounds.push(new Boundary(-45, p.height / 2, 100, p.height, "side"));
        bounds.push(new Boundary(p.width + 45, p.height / 2, 100, p.height, "side"));
        for (let b = 1; b < cols / 2; b++) {
            let w = 10;
            let h = 180;
            let x = b * (2 * spacing);
            let y = p.height - h / 2;
            bounds.push(new Boundary(x, y, w, h, "bucket"));
        }
        Events.on(engine, 'collisionStart', collision);
        score = new Score();
        score.setScores();
        p.canvas.style.display = "none";
        checkAllSetupsComplete()
    }

    p.draw = () => {
        if (p.keyIsDown(p.SHIFT) === true && particles.length > 0 && !tilted) {
            tilt();
        }
        p.image(board, p.width / 2, p.height / 2);
        for (let x = 0; x < plinkos.length; x++) {
            plinkos[x].show(p);
        }
        for (let b = 0; b < bounds.length; b++) {
            bounds[b].show(p);
            for (let i = 0; i < 5; i++) {
                if (finished) {
                    let x = score.getImage(i);
                    p.image(scoreballs[x], i * spacing * 2 + spacing, p.height - spacing * 3);
                } else {
                    p.image(scoreballs[0], i * spacing * 2 + spacing, p.height - spacing * 3);
                }
            }
            p.push();
            p.fill(0, 0, 0);
            p.stroke(60, 100, 100);
            p.strokeWeight(3);
            p.textSize(50);
            if (finished) {
                let SCORE = 0;
                for (let s = 0; s < goals.length; s++) {
                    SCORE += score.getValue(goals[s] - 1);
                }
                p.text("YOUR SCORE", p.width / 2, p.height / 2 - 100);
                p.strokeWeight(6);
                p.textSize(150);
                p.text(SCORE, p.width / 2, p.height / 2);
            } else {
                if (particles.length < 5) {
                    p.text("Place 5 balls", p.width / 2, p.height / 2 - 100);
                    p.text("at the top", p.width / 2, p.height / 2 - 50);
                } else {
                    for (let i = 0; i < particles.length; i++) {
                        particles[i].wake();
                    }
                }
            }
            p.pop();
            let activecount = 0;
            for (let _ = particles.length - 1; _ >= 0; _--) {
                particles[_].show(p);
                if (particles[_].isOffScreen()) {
                    World.remove(world, particles[_].body);
                    particles.splice(_, 1);
                }
                if (particles[_].body.label === "particle") {
                    activecount++;
                }
            }
            if (activecount === 0 && particles.length !== 0) {
                finished = true;
            }
            if (tilted) {
                p.push();
                p.textSize(150);
                p.fill(0, 100, 100);
                p.textStyle(p.ITALIC);
                if (tiltreset % 2 === 1) {
                    p.text("TILT", p.width / 2 - 10, p.height / 2);
                }
                p.pop();
                tiltreset++;
                if (tiltreset === 10) {
                    tiltreset = 0;
                    tilted = false;
                }
            }
        }
    }

    function newBall(_x, _y, sleeping, atStart) {
        let x = _x;
        let y = _y;
        if (atStart) {
            x = p.constrain(x, 25, p.width - 25);
            y = p.constrain(y, 0, spacing * 2);
        }
        particles.push(new Ball(x, y, 0.5 * spacing - 5, sleeping, p));
    }

    p.mouseClicked = () => {
        if (p.canvas.style.display !== 'none') {
            if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                if (particles.length < 5) {
                    newBall(p.mouseX, p.mouseY, true, true);
                }
                if (finished === true) {
                    reset();
                }
            }
        }
    };


    p.keyTyped = () => {
        if (p.canvas.style.display !== 'none') {
            if (p.key == " " && particles.length < 5) {
                newBall(p.mouseX, p.mouseY, true, true);
            } else if (p.key == "B" || p.key == "b") {
                giveBonus();
            } //else if ((p.key == "T" || p.key == "t") && particles.length > 0) {
             //   tilt();
            //}
        }
    }

    function collision(event) {
        let pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            let bodyA = pairs[i].bodyA;
            let bodyB = pairs[i].bodyB;
            let C = bodyA.label + bodyB.label;
            if (C === "particlepeg" || C === "pegparticle") {
                pegHit(bodyA, bodyB);
            } else if (C === "particlefloor" || C === "floorparticle") {
                goalHit(bodyA, bodyB);
            }
        }
    }

    function pegHit(A, B) {
        if (A.label === "peg") {
            dings[A.sound].play(0, 1, 1, 0.5, 0.5);
            A.c = 60;
        } else {
            dings[B.sound].play(0, 1, 1, 0.5, 0.5);
            B.c = 60;
        }
    }

    function goalHit(A, B) {
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
        goals.push(p.ceil(pos / (spacing * 2)));
        goals.sort(function (a, b) {
            return a - b
        });
    }

    function giveBonus() {
        let x = score.return100() * spacing * 2 + spacing;
        for (let i = 0; i < 5; i++) {
            newBall(x, p.height, false, false);
            newBall(p.width / 2, 0, false, false);
        }
    }

    function tilt() {
        let forcemag = 0.005 * particles[0].body.mass;
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].body.label === "particle") {
                Matter.Body.applyForce(particles[i].body, particles[i].body.position, {
                    x: (forcemag + p.random() * forcemag) * Matter.Common.choose([1, -1]),
                    y: -forcemag + p.random() * -forcemag
                });
                tilted = true;
                tiltreset = 0;
            }
        }
    }
}


function checkAllSetupsComplete() {
    setupCount++;
    if (setupCount === 3) {
        console.log('All p5.js instances have completed setup!');
        document.dispatchEvent(new Event('p5SetupComplete'));
    }
}

let canvas1 = new p5(plinkoGame);
let canvas2 = new p5(letterGame);
let canvas3 = new p5(phonicsGame);
