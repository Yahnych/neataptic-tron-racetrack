/* Global vars */
var players = [];
//var walker = new Walker();
var iteration = 0;
var highestScore = 0;
var trackImg;
var field
var trackImageCanvas;

/** Setup the canvas */
function setup(){
  //$('#defaultCanvas0').attr("width", $(window).width())
  //$('#defaultCanvas0').attr("height", $(window).height())
  //$('#track').attr('width', WIDTH)
  //$('#track').attr('height', HEIGHT)
  trackImg = document.getElementById('thisTrack');
  trackImg.setAttribute('src','tracks/track2.png')
  
  trackImageCanvas = createCanvas($(window).width(),$(window).height());
  trackImageCanvas.id("canvas1");
  trackImageCanvas.parent('track');
  //trackImageCanvas.drawingContext.drawImage(trackImg, 0, 0, WIDTH, HEIGHT);
  trackImageCanvas.drawingContext.drawImage(trackImg, 0, 0, $(window).width(), $(window).height());

  field = createCanvas($(window).width(),$(window).height());
  
  //$('#defaultCanvas0').attr('width',WIDTH)
  //$('#defaultCanvas0').attr('height',HEIGHT)
  
  field.parent('field');


  initNeat();

  // Do some initial mutation
  if(!USE_TRAINED_POP){
    for(var i = 0; i < 1; i++) neat.mutate();
  }
  findRandomOnTrackPosition(function(pos){
    START_X = pos.x
    START_Y = pos.y
  })

  startEvaluation();
}

function draw(){
  if(players.length > 0){
  // Check if evaluation is done
  if(iteration == ITERATIONS){
    endEvaluation();
    iteration = 0;
  }

  clear();

  squareGrid();
  renderTrack();
  

  // Update and visualise players
  for(var i = players.length - 1; i >= 0; i--){
    var player = players[i];

    // Some players are eaten during the iteration
    player.update();
    player.show();
  }

  //walker.update();
  //walker.show();
  }
  iteration++;
}

/** Draw a square grid with grey lines */
function squareGrid(){
  stroke(54, 54, 54, 160);
  strokeWeight(1);
  fill(255);
  for(var x = 0; x < WIDTH/40; x++){
    line(x * 40, 0, x * 40, HEIGHT);    
  }
  for(var y = 0; y < HEIGHT/40; y++){
    line(0, y * 40, WIDTH, y * 40);
  }

  stroke(38, 70, 234, 40);
  var offset = 4
  
  for(var x = 0; x < WIDTH/40; x++){
    line((x * 40)+offset, 0, (x * 40) + offset, HEIGHT);    
  }
  for(var y = 0; y < HEIGHT/40; y++){
    line(0, (y * 40) + offset, WIDTH, (y * 40)+offset);
  }


  noStroke();
}

function renderTrack(){
  field.drawingContext.drawImage(trackImg, 0, 0,  $(window).width(), $(window).height());
  
}

/** Calculate distance between two points */
function distance(x1, y1, x2, y2){
  var dx = x1 - x2;
  var dy = y1 - y2;

  return Math.sqrt(dx * dx + dy * dy);
}

/** Get a relative color between red and green */
var activationColor = function(value, max){
  var power = 1 - Math.min(value/max, 1);
  var color = [255, 255, 0]

  if(power < 0.5){
    color[0] = 2 * power * 255;
  } else {
    color[1] = (1.0 - 2 * (power - 0.5)) * 255;
  }
  //console.log(color)
  //console.log(color[1])
  if(isNaN(color[1])) {
    //console.log('was NaN')
    color[1] = 0
  }
  if(isNaN(color[0])) {
    //console.log('was NaN')
    color[0] = 0
  }

  return color;
}

/** Get the angle from one point to another */
function angleToPoint(x1, y1, x2, y2){
  d = distance(x1, y1, x2, y2);
  dx = (x2-x1) / d;
  dy = (y2-y1) / d;

  a = Math.acos(dx);
  a = dy < 0 ? 2 * Math.PI - a : a;
  return a;
}

/** Set the walker to a new location */
function mouseClicked(){
  if(mouseX >= 0 && mouseX <= WIDTH && mouseY >= 0 && mouseY <= HEIGHT){
    //walker.x = mouseX;
    //walker.y = mouseY;
  }
}

function onTrack(thisX,thisY){
  var pixelData = trackImageCanvas.drawingContext.getImageData(thisX, thisY, 1, 1).data;

  //console.log(pixelData[3])
  if(pixelData[0] == 0 && pixelData[1] == 0 && pixelData[2] == 0 && pixelData[3] == 255){
    return true
  } else {
    return false
  }
}

function findRandomOnTrackPosition(callback){
  var thisX = Math.floor(Math.random() *  $(window).width())
  var thisY = Math.floor(Math.random() * $(window).height())
  if(onTrack(thisX, thisY) == true){
    callback({"x": thisX, "y":thisY})
  } else {
    setTimeout(function(){
      findRandomOnTrackPosition(callback)  
    },1)
    
  }
}