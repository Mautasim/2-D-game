function randint(n){ return Math.floor(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas){
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.obstacles = []; // all obstacles in the stage.
		this.botAi = [];
		this.player=null; // a special actor, the player
		// the logical width and height of the stage
		this.width=canvas.width;
		this.height=canvas.height;
		this.worldX = 2400;
		this.worldY = 1500;
		this.canvasMidX = Math.floor(this.width/2);
		this.canvasMidY = Math.floor(this.height/2);
		this.obstacleSize = 100;
		this.staus = "play";

		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var radius = 20;
		var colour= 'rgba(0,128,0)';
		var position = new Pair(Math.floor(this.worldX/2), Math.floor(this.worldY/2));
		this.addPlayer(new Player(this, position, velocity, colour, radius));
		// add botAi
		var total = 25;
		while(total>0){
			var x = randint(this.worldX);
			var y = randint(this.worldY);
			if(this.getActor(x,y)===null){
				var velocity = new Pair(0, 0);
				var radius = 10;
				var color= 'rgba('+255+','+0+','+0+','+0+')';
				var position = new Pair(x,y);
				var b = new botAi(this, position, velocity, color, radius);
				this.botAi.push(b);
				total--;
			}
		}
		// add obstacles
		var total=25;
		while(total>0){
			var x = randint(this.worldX - this.obstacleSize);
			var y = randint(this.worldY - this.obstacleSize);
			if(this.getActor(x,y)===null){
				var red=randint(255), green=randint(255), blue=randint(255);
				var alpha = Math.random();
				var color= 'rgba('+red+','+green+','+blue+','+alpha+')';
				var position = new Pair(x,y);
				var b = new Obstacle(this, position, color);
				this.obstacles.push(b);
				total--;
			}
		}
	}
	getPositionOnCanvas(position) {
		var diffX = position.x - this.player.x;
		var diffY = position.y - this.player.y;
		var canvasX = this.player.canvasPositionX + diffX;
		var canvasY = this.player.canvasPositionY + diffY;
		return new Pair(canvasX, canvasY);
	}
	onCanvas(position) {
		var playerPositionX = this.player.x;
		var playerPositionY = this.player.y;
		var midWidth = this.width / 2;
		var midHeight = this.height / 2;
		if (playerPositionX - midWidth < position.x && position.x < playerPositionX + midWidth) {
			if (playerPositionY - midHeight < position.y && position.y < playerPositionY + midHeight) {
				return true;
			}
		}
		return false;
	}
	addHealthLoadout(context) {
		context.fillStyle = "black";
		context.font = "15px Arial";
		context.fillText("Health:" + this.player.health + "/100", 1, 12);
		context.fillText("Weapon A: " + this.player.guns.a + "/100", 1, 25);
		context.fillText("Weapon B: " + this.player.guns.b + "/100", 1, 40);
		context.fillText("Weapon C: " + this.player.guns.c + "/100", 1, 55);
	}
	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}
	removeBot(bot) {
		var index=this.botAi.indexOf(bot);
		if(index!=-1){
			this.botAi.splice(index,1);
		}
	}
	removeObstacle(obstacle) {
		var index=this.obstacles.indexOf(obstacle);
		if(index!=-1){
			this.obstacles.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step.
	// NOTE: Careful if an actor died, this may break!
	step(){
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
		for (var i = 0; i < this.botAi.length; i++) {
			this.botAi[i].step();
		}
	}

	draw(){
		var context = this.context;
		context.clearRect(0, 0, this.width, this.height);
		this.checkBoundaries();
		this.addHealthLoadout(context);
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}
		for (var i = 0; i < this.botAi.length; i++) {
			this.botAi[i].draw(context);
		}
		for (var i = 0; i < this.obstacles.length; i++) {
			this.obstacles[i].draw(context);
		}
	}
	checkBoundaries() {
		if (this.player.y - this.canvasMidY < 0) {
				 this.context.fillStyle = "#FFE4E1";
				 this.context.fillRect(0, 0, this.width, this.canvasMidY - this.player.y);
		}
		if (this.player.y + this.canvasMidY > this.worldY) {
			var diffY = this.worldY - this.player.y;
			this.context.fillStyle = "#FFE4E1";
			this.context.fillRect(0, this.canvasMidY + diffY, this.width, this.canvasMidY - diffY);
		}
		if (this.player.x - this.canvasMidX < 0) {
			var width = this.canvasMidX - this.player.x;
			this.context.fillStyle = "#FFE4E1";
			this.context.fillRect(0, 0, width, this.height);
		}
		if (this.player.x + this.canvasMidX > this.worldX) {
			var diffX = this.worldX - this.player.x
			this.context.fillStyle = "#FFE4E1";
			this.context.fillRect(this.canvasMidX + diffX, 0, this.canvasMidX - diffX, this.height);
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
} // End Class Stage
class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=(this.x/magnitude);
		this.y=(this.y/magnitude);
	}
}
class Ball {
	constructor(stage, position, velocity, colour, radius, initalPosition){
		this.stage = stage;
		this.position=position;
		this.initalPosition = initalPosition;
		this.farthestDistance = 300;
		this.intPosition(); // this.x, this.y are int version of this.position
		this.shoot = {
			coordinates: new Pair(0, 0),
			on: false
		}
		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
	}

	headTo(position){
		var posCanvas = this.stage.getPositionOnCanvas(this.position);
		this.velocity.x=(position.x-posCanvas.x);
		this.velocity.y=(position.y-posCanvas.y);
		this.velocity.normalize();
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}
	calculateDistance(position, position2) {
		var x1 = position.x;
		var x2 = position2.x;
		var y1 = position.y;
		var y2 = position2.y;
		return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
	}
	step(){
		var newX = this.position.x+this.velocity.x;
		var newY = this.position.y+this.velocity.y;
		var newPos = new Pair(newX, newY);
		var hitObstacle = false;
		var maxLimit = false;
		var hitBot = false;
		for (var i = 0; i < this.stage.obstacles.length; i++) {
			if ((this.stage.obstacles[i].position.x <= newX && newX <= this.stage.obstacles[i].position.x + this.stage.obstacleSize &&
			this.stage.obstacles[i].position.y <= newY && newY <= this.stage.obstacles[i].position.y + this.stage.obstacleSize)) {
				hitObstacle = true;
				this.stage.removeActor(this);
				this.stage.obstacles[i].health -= 1;
				if (this.stage.obstacles[i].health <= 0) {
					this.stage.removeObstacle(this.stage.obstacles[i]);
				}
			}
		}
		for (var i = 0; i < this.stage.botAi.length; i++) {
			var distance = this.calculateDistance(newPos, this.stage.botAi[i].position);
			if (distance < this.stage.botAi[i].radius) {
				hitBot = true;
				this.stage.removeActor(this);
				this.stage.botAi[i].health -= 1;
				if (this.stage.botAi[i].health <= 0) {
					this.stage.removeBot(this.stage.botAi[i]);
					if (this.stage.botAi.length === 0) {
						this.stage.status = "won";
					}
				}
			}
		}
		if (this.calculateDistance(newPos, this.initalPosition) > this.farthestDistance) {
			maxLimit = true;
			this.stage.removeActor(this);
		}
		if (hitObstacle === false && maxLimit === false && hitBot === false) {
			this.position.x = newX;
			this.position.y = newY;
		}
		// this.stage.player.updateBalls();
		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.worldX){
			this.position.x=this.stage.worldX;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.worldY){
			this.position.y=this.stage.worldY;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		if (this.stage.onCanvas(this.position)) {
			var canvasPosition = this.stage.getPositionOnCanvas(this.position);
			context.fillStyle = this.colour;
	   		// context.fillRect(this.x, this.y, this.radius,this.radius);
			context.beginPath();
			context.arc(canvasPosition.x, canvasPosition.y, this.radius, 0, 2 * Math.PI, false);
			context.fill();
		}
	}
}
class Obstacle{
	constructor(stage, position, color) {
		this.stage = stage;
		this.position = position;
		this.color = color;
		this.health = 5;
	}
	draw(context) {
		if (this.onCanvas(this.position)) {
			var canvasPosition = this.stage.getPositionOnCanvas(this.position);
			context.fillStyle = this.color;
	   		// context.fillRect(this.x, this.y, this.radius,this.radius);
			context.fillRect(canvasPosition.x, canvasPosition.y, this.stage.obstacleSize, this.stage.obstacleSize);
		}
	}
	onCanvas(position) {
		var playerPositionX = this.stage.player.x;
		var playerPositionY = this.stage.player.y;
		var obstacleSize = this.stage.obstacleSize;
		var midWidth = this.stage.width / 2;
		var midHeight = this.stage.height / 2;
		if (playerPositionX - midWidth - obstacleSize < position.x && position.x < playerPositionX + midWidth) {
			if (playerPositionY - midHeight - obstacleSize < position.y && position.y < playerPositionY + midHeight) {
				return true;
			}
		}
		return false;
	}
}
class Player extends Ball {
	constructor(stage, position, velocity, colour, radius) {
		super(stage, position, velocity, colour, radius);
		this.mouse = {
		    x : 0,
		    y : 0,
				isChanged: false,
				previous: 0
		};
		this.health = 100;
		this.currentGun = "a";
		this.guns = {
			a: 100,
			b: 0,
			c: 0
		}
		this.canvasPositionX = this.stage.canvasMidX;
		this.canvasPositionY = this.stage.canvasMidY;
		this.onObstacle = false;
	}
	checkObstacleInTheWay(position, velocity) {
		var newX = position.x + velocity.x;
		var newY = position.y + velocity.y;
		var count = true;
		for (var i = 0; i < this.stage.obstacles.length; i++) {
			if ((this.stage.obstacles[i].position.x <= newX && newX <= this.stage.obstacles[i].position.x + this.stage.obstacleSize &&
			this.stage.obstacles[i].position.y <= newY && newY <= this.stage.obstacles[i].position.y + this.stage.obstacleSize)) {
				count = false;
			}
		}
		return count;
	}
	checkBotInTheWay() {
		var newX = this.position.x + this.velocity.x;
		var newY = this.position.y + this.velocity.y;
		var newPos = new Pair(newX, newY);
		for (var i = 0; i < this.stage.botAi.length; i++) {
			if (this.position != this.stage.botAi[i].position) {
				var distance = this.calculateDistance(newPos, this.stage.botAi[i].position);
				if (distance < this.stage.botAi[i].radius) {
					return false;
				}
			}
		}
		return true;
	}

	step() {
		var check = this.checkObstacleInTheWay(this.position, this.velocity);
		var check2 = this.checkBotInTheWay();
		if (check === false) {
			this.onObstacle = true;
		}
		else if (this.onObstacle === true && this.velocity.x == 0 && this.velocity.y === 0) {
			this.onObstacle = true;
		}
		else {
			this.onObstacle = false;
		}
		if (check === true && check2 === true) {
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
		}
		// this.stage.player.updateBalls();
		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
		}
		if(this.position.x>this.stage.worldX){
			this.position.x=this.stage.worldX;
		}
		if(this.position.y<0){
			this.position.y=0;
		}
		if(this.position.y>this.stage.worldY){
			this.position.y=this.stage.worldY;
		}
		this.intPosition();
	}

	draw(context){
		context.save();
		context.fillStyle = "green";
		context.translate(this.canvasPositionX, this.canvasPositionY);
		if (this.mouse.isChanged === true) {
			this.mouse.previous = 0;
			this.mouse.previous += 1.57;
			var angle = Math.atan2(this.mouse.y, this.mouse.x);
			this.mouse.previous -= angle;
			this.drawAt(context, this.mouse.previous);
			this.mouse.isChanged = false;
		} else {
			this.drawAt(context, this.mouse.previous);
		}
		if (this.shoot.on === true && this.guns[this.currentGun] > 0) {
			this.shootBall(context);
			this.guns[this.currentGun] -= 1;
		}
	}
	shootBall (context) {
		var radius = 5;
		var colour= 'rgba('+0+','+128+','+0+')';
		var velocity = new Pair(0, 0);
		var position = new Pair(this.x, this.y);
		var b = new Ball(this.stage, position, velocity, colour, radius, new Pair(this.x, this.y));
		b.headTo(this.shoot.coordinates);
		b.velocity.x *= 20;
		b.velocity.y *= 20;
		this.stage.addActor(b);
	}
	drawAt(context, angle) {
		context.rotate(angle);
		context.fillRect(-(this.radius/2), -(this.radius *2), this.radius, this.radius * 2);
		context.beginPath();
		context.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
		context.fill();
		context.restore();
	}
}
class botAiBall extends Ball {
	constructor(stage, position, velocity, colour, radius, initalPosition) {
		super(stage, position, velocity, colour, radius);
		this.initalPosition = initalPosition;
		this.farthestDistance = 800;
	}
	step() {
		var newX = this.position.x + this.velocity.x;
		var newY = this.position.y + this.velocity.y;
		var newPos = new Pair(newX, newY);
		var check = this.checkPlayerInTheWay();
		var hitObstacle = false;
		var maxLimit = false;
		for (var i = 0; i < this.stage.obstacles.length; i++) {
			if ((this.stage.obstacles[i].position.x <= newX && newX <= this.stage.obstacles[i].position.x + this.stage.obstacleSize &&
			this.stage.obstacles[i].position.y <= newY && newY <= this.stage.obstacles[i].position.y + this.stage.obstacleSize)) {
				hitObstacle = true;
				this.stage.removeActor(this);
				this.stage.obstacles[i].health -= 1;
				if (this.stage.obstacles[i].health <= 0) {
					this.stage.removeObstacle(this.stage.obstacles[i]);
				}
			}
		}
		if (check === true) {
			this.stage.removeActor(this);
			this.stage.player.health -= 1;
			if (this.stage.player.health <= 0) {
				this.stage.status = "lost";
			}
		}
		if (this.calculateDistance(newPos, this.initalPosition) > this.farthestDistance) {
			maxLimit = true;
			this.stage.removeActor(this);
		}
		if (hitObstacle === false && check === false && maxLimit === false) {
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
		}
		// bounce off walls.
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.worldX){
			this.position.x=this.stage.worldX;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.worldY){
			this.position.y=this.stage.worldY;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
	}
	checkPlayerInTheWay() {
		var newX = this.position.x + this.velocity.x;
		var newY = this.position.y + this.velocity.y;
		var newPos = new Pair(newX, newY);
		var distance = this.calculateDistance(newPos, this.stage.player.position);
		if (distance < this.stage.player.radius) {
			return true;
		}
		return false;
	}
	headTo(position) {
		var posCanvas = this.stage.getPositionOnCanvas(this.position);
		this.velocity.x=(position.x-posCanvas.x);
		this.velocity.y=(position.y-posCanvas.y);
		this.velocity.normalize();
	}
}
class botAi extends Player {
	constructor(stage, position, velocity, colour, radius) {
		super(stage, position, velocity, colour, radius);
		this.health = 5;
	}
	shootBall() {
		if (this.stage.onCanvas(this.position)) {
			var radius = 5;
			var colour= 'rgba('+255+','+0+','+0+')';
			var velocity = new Pair(0, 0);
			var position = new Pair(this.position.x, this.position.y);
			var initalPosition = new Pair(this.position.x, this.position.y);
			var b = new botAiBall(this.stage, position, velocity, colour, radius, initalPosition);
			b.headTo(new Pair(this.stage.canvasMidX, this.stage.canvasMidY));
			b.velocity.x *= 10;
			b.velocity.y *= 10;
			this.stage.addActor(b);
		}
	}
	draw(context) {
		if (this.stage.onCanvas(this.position)) {
			var totalAngle = 1.57;
			var canvasPosition = this.stage.getPositionOnCanvas(this.position);
			var angle = this.calculateAngle(canvasPosition, new Pair(this.stage.canvasMidX, this.stage.canvasMidY));
			context.save();
			context.translate(canvasPosition.x, canvasPosition.y);
			totalAngle += angle;
			context.rotate(totalAngle);
			context.fillStyle = "red";
			context.fillRect(-(this.radius/2), -(this.radius *2), this.radius, this.radius * 2);
			context.beginPath();
			context.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
			context.fill();
			context.restore();
		}
	}
	calculateAngle(position, playerPosition) {
		var xValue = playerPosition.x - position.x;
		var yValue = position.y - playerPosition.y;
		var angle = Math.atan2(yValue, xValue);
		return -angle;
	}
	headTo(position){
		var aiX = this.position.x;
		var aiY = this.position.y;
		this.velocity.x = (position.x - aiX);
		this.velocity.y = (position.y - aiY);
		this.velocity.normalize();
	}
	checkBotInTheWay() {
		var newX = this.position.x + this.velocity.x;
		var newY = this.position.y + this.velocity.y;
		var newPos = new Pair(newX, newY);
		for (var i = 0; i < this.stage.botAi.length; i++) {
			if (this.position != this.stage.botAi[i].position) {
				var distance = this.calculateDistance(newPos, this.stage.botAi[i].position);
				if (distance < this.stage.botAi[i].radius) {
					return false;
				}
			}
		}
		return true;
	}
	checkPlayerInTheWay() {
		var newX = this.position.x + this.velocity.x;
		var newY = this.position.y + this.velocity.y;
		var newPos = new Pair(newX, newY);
		var distance = this.calculateDistance(newPos, this.stage.player.position);
		if (distance < this.stage.player.radius) {
			return false;
		}
		return true;
	}
	step() {
		this.headTo(this.stage.player.position);
		this.velocity.x *= 5;
		this.velocity.y *= 5;
		var check = this.checkObstacleInTheWay(this.position, this.velocity);
		var check2 = this.checkBotInTheWay();
		var check3 = this.checkPlayerInTheWay();
		if (check === true && check2 === true && check3 === true) {
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
		}
		// this.stage.player.updateBalls();
		// watch for the walls
		if(this.position.x<0){
			this.position.x=0;
		}
		if(this.position.x>this.stage.worldX){
			this.position.x=this.stage.worldX;
		}
		if(this.position.y<0){
			this.position.y=0;
		}
		if(this.position.y>this.stage.worldY){
			this.position.y=this.stage.worldY;
		}
		this.intPosition();
	}
}
