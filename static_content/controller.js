var stage=null;
var view = null;
var interval=null;
var interval2 = null;
var credentials={ "username": "", "password":"" };
var currEvents = {};
canvasMid = 400;

function setupGame(){
	stage=new Stage(document.getElementById('stage'));
	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
	document.addEventListener("keyup", keyUp);
	document.getElementById("stage").addEventListener("mousemove", mouseMove);
	document.getElementById("stage").addEventListener("mousedown", mouseDown);
	document.getElementById("stage").addEventListener("mouseup", mouseUp);
}
function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw(); checkStatus();},100);
	interval2 = setInterval(function() {
		for (var i = 0; i < stage.botAi.length; i++) {
			stage.botAi[i].shootBall();
		}
	}, 5000);
}
function checkStatus() {
	if (stage.status === "lost") {
		alert("Game Lost!");
	} else if (stage.status === "won") {
		alert("Game Won!"); 
	}
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}
function mouseUp(event) {
	if (stage.player.shoot.on === true) {
		stage.player.shoot.on = false;
	}
}
function mouseDown(event) {
	if (event.button === 0) {
		stage.player.shoot.on = true;
		var pair = new Pair(event.offsetX, event.offsetY);
		stage.player.shoot.coordinates = pair;
	}
}
function mouseMove(event) {
	stage.player.mouse.x = event.offsetX - canvasMid;
	stage.player.mouse.y = 300 - event.offsetY;
	stage.player.shoot.coordinates = new Pair(event.offsetX, event.offsetY);
	stage.player.mouse.isChanged = true;
}
function keyUp(event) {
	var key = event.key;
	if (key === "a" || key ==="s" || key === "d" || key === "w") {
		if (key in currEvents) delete currEvents[key];
		var dx = 0;
		var dy = 0;
		for (var event in currEvents) {
			dx += currEvents[event].x;
			dy += currEvents[event].y;
		}
		stage.player.velocity = new Pair(dx, dy);
	}
}
function moveByKey(event){
	var key = event.key;
	var moveMap = {
		'a': new Pair(-20,0),
		's': new Pair(0,20),
		'd': new Pair(20,0),
		'w': new Pair(0,-20)
	};
	if(key in moveMap && !(key in currEvents)){
		var dx = 0;
		var dy = 0;
		for (var event in currEvents) {
			dx += currEvents[event].x;
			dy += currEvents[event].y;
		}
		dx += moveMap[key].x;
		dy += moveMap[key].y;
		stage.player.velocity = new Pair(dx, dy);
		currEvents[key] = moveMap[key];
	}
	if (key === "r") {
		if (stage.player.onObstacle === true) {
			stage.player.guns.a = 100;
		}
	}
}
function login(){
	credentials =  {
		"username": $("#username").val(),
		"password": $("#password").val()
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
								$("#main").css({"width": "100px", "float": "left"});
								play();
								setupGame();
								startGame();
        }).fail(function(err){
								alert("Username or password is invalid. Please try again or register with a new account");
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}
// Using the /api/auth/test route, must send authorization header
function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}
function hideErrors() {
	$("#username-error").hide();
	$("#password-error").hide();
	$("#confirm-error").hide();
}
function goRegister() {
	hideEvery();
	$("#ui_register").show();
	$("#user").val("");
	$("#pass").val("");
	$("#confirm").val("");
	hideErrors();
}
function backLogin() {
	hideEvery();
	$("#ui_login").show();
}
function register() {
	hideErrors();
	var noErrors = true;
	var username = $("#user").val();
	var password = $("#pass").val();
	var confirm = $("#confirm").val();
	if (username === "") {
		$("#username-error").show();
		noErrors = false;
	}
	if (password === "") {
		$("#password-error").show();
		noErrors = false;
	}
	if (confirm === "") {
		$("#confirm-error").show();
		noErrors = false;
	}
	if (confirm != password) {
		alert("Password is not the same as re typed password. Please try again.");
		noErrors = false;
	}
	if (noErrors) {
			$.ajax({
				method: "POST",
				url: "/api/register",
				data: JSON.stringify({}),
				headers: { "Authorization": "Basic " + btoa(username + ":" + password) },
				processData:false,
				contentType: "application/json; charset=utf-8",
				dataType:"json"
			}).done(function(data, text_status, jqXHR){
				console.log(jqXHR.status+" "+text_status+" "+JSON.stringify(data));
				hideEvery();
				$("#ui_login").show();
			}).fail(function(err) {
				console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
			});
	}
}
function hideEvery() {
	$("#ui_login").hide();
	$("#ui_play").hide();
	$("#ui_register").hide();
	$(".flex-container").hide();
	$("#ui_instructions").hide();
	$("#ui_stats").hide();
	$("#ui_profile").hide();
}
function goInstructions() {
	hideEvery();
	$("#ui_instructions").show();
	$(".flex-container").show();
	removeDisplay();
	view = "instructions";
	$("#instructions").css({"background-color": "black", "color": "#AFEEEE"});
}
function goStats() {
	hideEvery();
	$("#ui_stats").show();
	$(".flex-container").show();
	removeDisplay();
	view = "stats";
	$("#stats").css({"background-color": "black", "color": "#AFEEEE"});
}
function goProfile() {
	hideEvery();
	$("#ui_profile").show();
	$(".flex-container").show();
	removeDisplay();
	view = "profile";
	$("#profile").css({"background-color": "black", "color": "#AFEEEE"});
}
function logout() {
	hideEvery();
	$("#ui_login").show();
	$("#username").val("");
	$("#password").val("");
	$("#main").css({"width": "", "float": "none"});
}
function play() {
	hideEvery();
	$(".flex-container").show();
	$("#ui_play").show();
	removeDisplay();
	view = "play";
	$("#play").css({"background-color": "black", "color": "#AFEEEE"});
}
function removeDisplay() {
	if (view === "instructions") {
		$("#instructions").css({"background-color": "#AFEEEE", "color": ""});
	}
	if (view === "stats") {
		$("#stats").css({"background-color": "#AFEEEE", "color": ""});
	}
	if (view === "profile") {
		$("#profile").css({"background-color": "#AFEEEE", "color": ""});
	}
	if (view === "play") {
		$("#play").css({"background-color": "#AFEEEE", "color": ""});
	}
}
$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ login(); });
				$("#goRegister").on("click", function(){ goRegister(); });
				$("#goLogin").on("click", function() { backLogin(); });
				$("#register").on("click", function() { register(); });
				$("#instructions").on("click", function() { goInstructions(); });
				$("#stats").on("click", function() { goStats(); });
				$("#profile").on("click", function() { goProfile(); });
				$("#logout").on("click", function() { logout(); });
				$("#play").on("click", function() {play(); });
				hideEvery();
				$("#ui_login").show();
});
