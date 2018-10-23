console.log('Main.js loaded');

//Settings
let fps = 60;
let engineTick = 20;
let gravity = 5;
let spacing = 20;
let h = null;
let w = null;
let bounciness = 0.5;
let drawPoints = false;
let pointSize = 5;
let connectionThickness = 2;

function test(){console.log('Main.js linked successfully');}

/**=========================================================================================================================**/

//MAIN
//Main function to act as
//foundation for the rest
function Main($canvasId){

	console.log('Setting up main class with Id: ' + $canvasId);

	//Set up a reference to the main object
	let main = this;

	//Main variables required to set up class
	this.canvas = document.getElementById($canvasId);
	this.canvasX = this.canvas.width;
	this.canvasY = this.canvas.height;
	this.canvasContext = this.canvas.getContext("2d");

	//Variables to store dimensions of canvas for physics calculations
	h = this.canvasY
	w = this.canvasX

	//Background colour for the canvas
	this.backColour = 'black';

	//Getters and Setters for the CanvasId
	this.getCanvasId = function() {return this.canvasId;}
	this.setCanvasId = function($object) {this.canvasId = $object;}

	//Create a new inputHandler within main
	//this.inputHandler = new inputHandler();

	//Create a new controller within main
	this.controller = new controller();

	//Draws background
	this.drawBack = function(){
		main.canvasContext.fillStyle = "black";
		main.canvasContext.fillRect(0, 0, main.canvasX, main.canvasY);
	}

	//Checks for any user input and
	//forces a reDraw on the object and all
	//dependant objects below it, thus redrawing
	//the whole screen
	this.reDraw = function(){

		//Clear the window before redrawing it
		main.canvasContext.clearRect(0, 0, main.canvasX, main.canvasY);

		//Draw background
		main.drawBack();

		//Draw connections
		main.controller.drawConnections(main.canvasContext);

		//Check if user wants to draw points and if so, start drawing them
		if(drawPoints == true){
			main.controller.drawPoints(main.canvasContext);
		}

		//Wait until the next frame and call this function again
		setTimeout(function () {main.reDraw();}, 1000/fps);

	}

	//Set all the requesite variables and jumpstart the recursive
	//functions
	this.initialise = function(){

		console.log('Initializing...');

		//Setup listeners to react to mouse movement and clicks
		//main.canvas.addEventListener('mousedown',main.inputHandler.mouseDown);
	  //main.canvas.addEventListener('mouseup',main.inputHandler.mouseUp);
		//main.canvas.addEventListener('mousemove',main.inputHandler.mouseMove);
		console.log('Created listeners');

		//Create points
		main.controller.createRope(100,50,90,10);

		//Draw the initial frame
		main.drawBack();

		//Start drawing everything on screen
		main.reDraw();
		console.log('Started drawing frames at ' + fps + ' fps');

		//Start the physics calculations
		main.controller.update();
		console.log('Kickstarted the physics engine');

		console.log('Initialized');

	}
	return main;
}

/**=========================================================================================================================**/

/*
*INPUT HANDLER
*Object that interprets all user input and executes the corresponding functions
*/
function inputHandler(){

	//Store mouse coordinates
	this.mx = null;
	this.my = null;

	//Create a reference to the current object
	let self = this;

	//Flag to track when drawing should be done
	this.canvasContext = null;;

	//Flag to track when the mouse is held down
	this.mDown = false;

	//Getters and setters
	this.getDraw = function(){return self.drawing;}

  //Detect if user is giving active input
	this.mouseDown = function(){
		self.mDown = true;
		self.checkSlider();
	}

	//Detect if user stops giving active input
	this.mouseUp = function(){
		self.mDown = false;
	}

  //Get mouse position and update coordinates
  this.mouseMove = function(eventObject){
    self.mx = eventObject.clientX;
    self.my = eventObject.clientY;
  }

	return self;
}

/**=========================================================================================================================**/

/*
*CONTROLLER
*Controller that tells every point to update itself
*Also
*/
function controller(){

	//Create a self reference
	let self = this;

	//All points handled by the object
	this.points = [];

	//All connections handled by the object
	this.connections = [];

	//Create a one dimensional array of points to act as a rope and connect them together
	this.createRope = function($x,$y,$angle,$length){
		let xdiff = spacing * Math.sin(Math.PI * ($angle / 180));
		let ydiff = spacing * Math.cos(Math.PI * ($angle / 180));
		let x = null;
		let y = null;
		self.createPoint($x,$y,true);
		for(let i = 0; i < $length; i++){
			x = (i + 1) * xdiff + $x;
			y = (i + 1) * ydiff + $y;
			self.createPoint(x,y,false);
			self.connectPoints(self.points[i],self.points[i + 1]);
		}
		console.log(self.points);
	}

	//Create a new point
	this.createPoint = function($x,$y,$isStatic){
		self.points.push(new point($x,$y,$isStatic));
	}

	//Connect two points together
	this.connectPoints = function($point1,$point2){
		self.connections.push(new connection($point1,$point2));
		$point1.addPoint($point2);
		$point2.addPoint($point1);
	}

	//Update all point's physics data and perform connection calculations
	this.update = function(){
		self.points.forEach(function($point){
			$point.update();
			//console.log($point.x,$point.y);
		});
		self.connections.forEach(function($connection){
			$connection.update();
		});
		setTimeout(function () {self.update();}, 1000/engineTick);
	}

	//Draw all connections
	this.drawConnections = function($canvasContext){
		self.connections.forEach(function($connection){
			$connection.reDraw($canvasContext);
		});
	}

	//Draw all points
	this.drawPoints = function($canvasContext){
		self.points.forEach(function($point){
			$point.draw($canvasContext);
		});
	}

}

/**=========================================================================================================================**/

/*
*POINT
*Object that represents a point, can be connected to other points
*/
function point($x,$y,$isStatic){

	//Create a self reference
	let self = this;

	//x and y variables of the point
	this.x = $x;
	this.y = $y;

	//x and y variables for the previous frame to be used for Vertlet Integration
	this.lx = $x;
	this.ly = $y;

	//x and y variables for the next frame to be used for Vertlet Integration
	this.nx = null;
	this.ny = null;

	//Other points this point is connected to
	this.points = [];

	//X and Y velocities
	this.xv = 0;
	this.yv = 0;

	//Track whether or not the point is static, in which case it is unaffected by physics
	//and does not move
	this.isStatic = $isStatic;

	//Setters and getters
	this.setX = function($val){self.x = $val;}
	this.setY = function($val){self.y = $val;}
	this.setStatic = function($val){self.static = $val;}

	//Add a new point
	this.addPoint = function($point){
		self.points.push($point);
	}

	//Update the point's physics data
	this.update = function(){
		if(self.isStatic == false){
			self.xv = self.x - self.lx;
			self.yv = self.y - self.ly;

			if(self.y > h - 10){
				self.y = h - 10;
				if(self.yv > 0){
					self.yv *= -bounciness
				}
			}

			self.nx = self.x + self.xv;
			self.ny = self.y + self.yv + gravity;

			self.lx = self.x;
			self.ly = self.y;

			self.x = self.nx;
			self.y = self.ny;
		}
	}

	this.draw = function($canvasContext){
		$canvasContext.fillStyle = 'white';
		$canvasContext.fillRect(self.x - pointSize / 2, self.y - pointSize / 2, pointSize, pointSize);
	}

}

/**=========================================================================================================================**/

/*
*POINT
*Object that represents a connection between two points, is the actual visible part
*/
function connection($point1,$point2){

	//Create a self reference
	let self = this;

	//Points this connection connects
	this.p1 = $point1;
	this.p2 = $point2;

	//Temporary values used in physics calcualations
	this.dx = null;
	this.dy = null;
	this.dist = null;
	this.diff = null;
	this.transx = null;
	this.transy = null;

	//Length of connection
	this.length = spacing;

	//X and Y values of points
	this.x1 = $point1.x;
	this.y1 = $point1.y;
	this.x2 = $point2.x;
	this.y2 = $point2.y;

	//Colour of connection
	this.colour = 'white';

	//Setters and getters
	this.setPoint1 = function($point1){
		self.p1 = $point1;
		self.x1 = $point1.x;
		self.y1 = $point1.y;
	}
	this.setPoint2 = function($point2){
		self.p2 = $point2;
		self.x2 = $point2.x;
		self.y2 = $point2.y;
	}
	this.setColour = function($val){self.colour = $val;}

	//Perform link physics updates
	this.update = function(){
		self.dx = self.p1.x - self.p2.x;
		self.dy = self.p1.y - self.p2.y;
		self.dist = Math.sqrt(self.dx * self.dx + self.dy * self.dy);

		self.diff = (self.length - self.dist) / self.dist

		self.transx = self.dx * self.diff;
		self.transy = self.dy * self.diff;

		//self.p1.x += self.transx;
		//self.p1.y += self.transy;

		self.p2.x -= self.transx;
		self.p2.y -= self.transy;
	}

	//Draw the connection between both points
	this.reDraw = function($canvasContext){
		self.drawLine($canvasContext,[self.p1.x,self.p1.y],[self.p2.x,self.p2.y]);
	}

	//Draw a line between two points
  this.drawLine = function($canvasContext, $point1, $point2){
    $canvasContext.strokeStyle = self.colour;
		$canvasContext.lineWidth = connectionThickness;
    $canvasContext.beginPath();
    $canvasContext.moveTo($point1[0],$point1[1]);
    $canvasContext.lineTo($point2[0],$point2[1]);
    $canvasContext.stroke();
  }

}
