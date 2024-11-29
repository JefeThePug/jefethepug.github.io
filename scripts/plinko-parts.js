function PlinkoParts(x, y, r, sound, canvas) {
   let options = {
      isStatic: true,
      restitution: 0.5,
      friction: 0
   };
   this.body = Bodies.circle(x, y, r, options);
   this.body.label = "peg";
   this.body.sound = sound;
   this.body.c = 220;
   World.add(world, this.body);
   this.r = r;
   this.reset = 0;
}

PlinkoParts.prototype.show = function(canvas) {
   canvas.fill(this.body.c, 100, 100);
   canvas.stroke(0, 0, 10);
   let pos = this.body.position;
   canvas.push();
   canvas.strokeWeight(2);
   canvas.translate(pos.x, pos.y);
   canvas.ellipse(0, 0, this.r * 2);
   canvas.pop();
   this.reset++;
   if (this.reset === 10) {
      this.reset = 0;
      this.body.c = 220;
   }
}

function Score() {
   this.score = [];
   this.value = [];
   this.bonusIndex = -1;
}

Score.prototype.setScores = function() {
   this.score = [];
   this.value = [];
   var array = [
      [2, 3, 1, 5, 2],
      [1, 5, 2, 4, 1],
      [2, 3, 5, 3, 2],
      [2, 4, 5, 3, 1],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [2, 4, 3, 5, 2]
   ]
   var n = Math.floor(Math.random(6));
   this.score = array[n];
   this.setValues();
}

Score.prototype.setValues = function() {
   for (var i = 0; i < this.score.length; i++) {
      switch (this.score[i]) {
         case 1:
            this.value[i] = 50;
            break;
         case 2:
            this.value[i] = 100;
            this.bonusIndex = i;
            break;
         case 3:
            this.value[i] = 200;
            break;
         case 4:
            this.value[i] = 500;
            break;
         case 5:
            this.value[i] = 1000;
            break;
      }
   }
}

Score.prototype.getImage = function(Nth) {
   return this.score[Nth];
}
Score.prototype.getValue = function(Nth) {
   return this.value[Nth];
}

Score.prototype.return100 = function() {
   return this.bonusIndex;
}

function Ball(x, y, r, sleeping, canvas) {
   var options = {
      restitution: .8,
      friction: 0.1,
      density: 1
   };
   this.canvas = canvas;
   this.body = Bodies.circle(x, y, r, options);
   this.body.label = "particle";
   Sleeping.set(this.body, sleeping);
   World.add(world, this.body);
   this.r = r;
   this.hue = canvas.random(255);
   URL = "https://raw.githubusercontent.com/JefeThePug/plinko/main/";
   this.ball = canvas.loadImage(`${URL}assets/ball.png`);
}

Ball.prototype.isOffScreen = function() {
   x = this.body.position.x;
   width = this.canvas.width;
   return (x < -50 || x > width + 50);
}

Ball.prototype.show = function(canvas) {
   canvas.fill(this.hue, 255, 255);
   canvas.stroke(this.hue, 60, 60);
   let pos = this.body.position;
   if (pos.y < this.r) {
      Body.setPosition(this.body, { x: pos.x, y: this.r });
   }
   if (pos.x < this.r) {
      Body.setPosition(this.body, { x: this.r, y: pos.y });
   }
   if (pos.x > this.canvas.width - this.r) {
      Body.setPosition(this.body, { x: this.canvas.width - this.r, y: pos.y });
   }
   canvas.push();
   canvas.translate(pos.x, pos.y);
   canvas.image(this.ball, 0, 0, this.r * 2, this.r * 2)
   canvas.pop();
}

Ball.prototype.wake = function() {
   Sleeping.set(this.body, false);
}

function Boundary(x, y, w, h, label) {
   let options = {
      isStatic: true,
      restitution: (label === "side") * 1,
   };
   this.body = Bodies.rectangle(x, y, w, h, options);
   this.body.label = label;
   World.add(world, this.body);
   this.w = w;
   this.h = h;
}

Boundary.prototype.show = function(canvas) {
   canvas.fill(210, 100, 100);
   canvas.stroke(0, 0, 20);
   let pos = this.body.position;
   canvas.push();
   canvas.translate(pos.x, pos.y);
   canvas.rectMode(canvas.CENTER);
   canvas.strokeWeight(2);
   canvas.rect(0, 0, this.w, this.h);
   canvas.pop();
}