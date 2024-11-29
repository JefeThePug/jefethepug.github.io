function Message(pos, txt, canvas) {
   this.pos = pos;
   this.txt = txt;
   if (this.txt.substring(0, 1) === "t") {
      this.halflife = 500;
      this.fontsize = 40;
   } else {
      this.halflife = 5000;
      this.fontsize = 50;
   }
   const URL = "https://raw.githubusercontent.com/JefeThePug/LetterConstellations/main/";
   this.fontStars = canvas.loadFont(`${URL}assets/_ABCBULLE.TTF`);
}

Message.prototype.update = function() {
   this.halflife--;
   return this.halflife <= 0
};

Message.prototype.draw = function(canvas) {
   canvas.push();
   canvas.fill(255);
   canvas.textSize(this.fontsize);
   canvas.noStroke();
   if (this.txt.substring(0, 1) !== "W") {
      canvas.textFont(this.fontStars);
   } else {
      canvas.textSize(25);
   }
   const tint = canvas.noise(this.pos.x, this.pos.y, canvas.millis() / 1000.0);
   canvas.fill(255, 255, tint * 255);
   canvas.text(this.txt, this.pos.x, this.pos.y);
   canvas.pop();
};

function Letter(position, letter, canvas) {
   this.pos = position;
   this.val = letter;
   this.s = 40;
   this.w = 40;
   if (this.val.length > 1) {
      this.pos.x += this.s;
      this.w = 120;
   }
   const URL = "https://raw.githubusercontent.com/JefeThePug/LetterConstellations/main/";
   this.fontShown = canvas.loadFont(`${URL}assets/_ABCPRINT.TTF`);

   this.isClicked = function () {
      const xRange = canvas.abs(canvas.mouseX - this.pos.x) <= this.w / 2;
      const yRange = canvas.abs(canvas.mouseY - this.pos.y) <= this.s / 2;
      return xRange && yRange;
   };
}

Letter.prototype.draw = function (canvas) {
   canvas.push();
   canvas.strokeWeight(5);
   canvas.textFont(this.fontShown);
   canvas.fill(255);
   canvas.textSize(25);
   if (this.isClicked()) {
      canvas.stroke(255, 255, 0);
   } else {
      canvas.stroke(85, 0, 190);
   }
   canvas.rect(this.pos.x, this.pos.y, this.w, this.s, 20);
   canvas.fill(0);
   canvas.noStroke();
   canvas.text(this.val, this.pos.x, this.pos.y - 3.5);
   canvas.pop();
};

function Star(position, target, tint, canvas) {
   this.position = position;
   this.target = target;
   this.diameter = canvas.random(1, 8);
   this.canvas = canvas
   if (tint) {
      this.tint = 110;
      yellowStars++;
   } else {
      this.tint = 255;
   }
}

Star.prototype.update = function() {
   this.position = p5.Vector.lerp(this.position, this.target, 0.04);
};

Star.prototype.draw = function() {
   const alpha = this.canvas.noise(this.target.x, this.target.y, this.canvas.millis() / 1000.0);
   this.canvas.noStroke();
   this.canvas.fill(255, 255, this.tint, alpha * 255);
   this.canvas.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
};
