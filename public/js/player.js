function Player(genome, v){
  this.x = START_X;
  this.y = START_Y;

  this.vx = 0;
  this.vy = 0;
  this.r = 6;


  this.brain = genome;
  this.brain.genomeIdx = v;
  this.brain.score = 0;
  this.brain.lastAngle = 0;
  this.brain.physicallyStuckCount = 0

  players.push(this);
}

/*
setInterval(function(){
  console.log('resetting highscore')
  //drawGraph(neat.population[0].graph($('.best').width()/2, $('.best').height()/2), '.best');
  for(var v=0;v< neat.population.length;v++) neat.population[v].score = 0  
  highestScore = 0  
},1000)
*/

Player.prototype = {
  /** Update the stats */
  update: function(){
    var input = this.detect();
    var output = this.brain.activate(input);

    var moveangle = output[0] * 2 * PI;

    // Calculate next position
    this.ax = Math.cos(moveangle)
    this.ay = Math.sin(moveangle)
    this.vx += this.ax * output[1] * .8
    this.vy += this.ay * output[1] * .8

    // Limit speeds to maximum speed
    this.vx = this.vx > MAX_SPEED ? MAX_SPEED : this.vx < -MAX_SPEED ? -MAX_SPEED : this.vx;
    this.vy = this.vy > MAX_SPEED ? MAX_SPEED : this.vy < -MAX_SPEED ? -MAX_SPEED : this.vy;

    var newX = this.x + this.vx;
    var newY = this.y + this.vy;
    if(onTrack(newX,newY) == true){
      this.brain.physicallyStuckCount = 0
      this.x = newX
      this.y = newY;
    } else {
      this.brain.physicallyStuckCount = this.brain.physicallyStuckCount + 1
      this.vx = 0
      this.vy = 0
    }

    var isOnTrack = onTrack(this.x,this.y)
    //console.log(isOnTrack, this.x,this.y)
    if(isOnTrack == false || isNaN(this.x) || isNaN(this.y)){
      //console.log('we are not on the track right now')
      var that = this
      findRandomOnTrackPosition(function(result){
        // Limit position to width and height
        //this.x = this.x >= WIDTH  ? WIDTH  : this.x <= 0 ? 0 : this.x;
        //this.y = this.y >= HEIGHT ? HEIGHT : this.y <= 0 ? 0 : this.y;
        this.vx = 0
        that.vx = 0
        that.x = result.x
        that.y = result.y
        that.score();  
      })
      
    } else {
      if(this.brain.physicallyStuckCount >= 15){
        var that = this
        findRandomOnTrackPosition(function(result){
          // Limit position to width and height
          //this.x = this.x >= WIDTH  ? WIDTH  : this.x <= 0 ? 0 : this.x;
          //this.y = this.y >= HEIGHT ? HEIGHT : this.y <= 0 ? 0 : this.y;
          this.vx = 0
          that.vx = 0
          that.x = result.x
          that.y = result.y
          that.score();  
        })
      } else {
        //console.log('we are on track right now')
        // Limit position to width and height
        //this.x = this.x >= WIDTH  ? WIDTH  : this.x <= 0 ? 0 : this.x;
        //this.y = this.y >= HEIGHT ? HEIGHT : this.y <= 0 ? 0 : this.y;
        this.x = this.x >= WIDTH  ? (this.x - WIDTH)  : this.x <= 0 ? (WIDTH - this.x) : this.x;
        this.y = this.y >= HEIGHT  ? (this.y - HEIGHT)  : this.y <= 0 ? (HEIGHT - this.y) : this.y;

        if(this.x == 0 || this.x == WIDTH) this.vx = -this.vx;
        if(this.y == 0 || this.y == HEIGHT) this.vy = -this.vy;

        this.score();

      }

    }
  },
  exit: function(){
    return;
  },
  getPos: function(){
    return({"x": this.x, "y": this.y, "vx" : this.vx, "vy":this.vy})
  },
  setPos: function(newPos){
    this.x = newPos.x
    this.y = newPos.y
    this.vx = newPos.vx
    this.vy = newPos.vy
    this.ax = newPos.ax
    this.ay = newPos.ay
  },
  getScore: function(){
    return this.brain.score
  },
  setScore: function(newScore){
    this.brain.score = newScore
  },

  /** Calculate fitness of this players genome **/
  score: function(){
    var angle = angleToPoint(this.x, this.y, $('#field').width()/2, $('#field').height()/2) / TWO_PI;

    //var dist = distance(this.x, this.y, walker.x, walker.y);
    //console.log(angle, this.brain.lastAngle)
    if(!isNaN(this.brain.lastAngle) && !isNaN(angle)){
      var scoreDelta = (angle - this.brain.lastAngle)
      //console.log(scoreDelta)
      if(scoreDelta > 0){
        this.brain.score += scoreDelta
      }
      this.brain.lastAngle = angle

      //if(this.brain.score <= 0) this.brain.score = 0
    }

    // Replace highest score to visualise
    //console.log(this.brain.score, highestScore)
    if(this.brain.score >= highestScore){
      highestScore = this.brain.score;
      $('#topScore').html(Math.floor(highestScore * 100)/100)
    } 
     
  },

  /** Display the player on the field, parts borrowed from the CodingTrain */
  show: function(){
    // Draw a triangle rotated in the direction of velocity
    var angle = angleToPoint(this.x, this.y, this.x + this.vx, this.y + this.vy) + HALF_PI;
    var color = activationColor(this.brain.score, highestScore);

    push();
    translate(this.x, this.y);
    rotate(angle);

    stroke(color);
    //console.log(color)
    fill([0,0,0]);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);

    pop();
  },

  /** Detect and normalize inputs */
  detect: function(){
    //var dist = Math.sqrt(this.x, this.y, walker.x, walker.y) / Math.sqrt(WIDTH**2 + HEIGHT**2);
    var heading = angleToPoint(this.x, this.y, this.vx, this.vy) / TWO_PI;
    var thisX = this.x / $(window).width()
    var thisY = this.y / $(window).width()
    //var vx = (this.vx + MAX_SPEED) / MAX_SPEED;
    var vx = this.vx / MAX_SPEED
    //var vy = (this.vy + MAX_SPEED) / MAX_SPEED;
    var vy = this.vy / MAX_SPEED
    //var tvx = (walker.vx + MAX_SPEED) / MAX_SPEED;
    //var tvy = (walker.vy + MAX_SPEED) / MAX_SPEED;

    // NaN checking
    //targetAngle = isNaN(targetAngle) ? 0 : targetAngle;
    //dist = isNaN(dist) ? 0 : dist;

    return [vx, vy, heading, thisX, thisY];
  },
};
