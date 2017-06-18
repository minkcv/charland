var divcols = 32;
var divrows = 32;
var worldData = [];
var worldDivs = [];
var walls = [];
var tileWidth = 8;
var tileHeight = 13;
for (k = 0; k < worldLines.length / divrows; k++) {
	worldData[k] = [];
	for (i = 0; i < worldLines[k].length / divcols; i++) {
		var chunk = "";
		for (j = 0; j < divrows; j++) {
			chunk += worldLines[(k * divrows) + j].substring(i * divcols, (i + 1) * divcols) + "\n";
		}
		worldData[k][i] = chunk;
	}
}
for (j = 0; j < worldData.length; j++) {
	worldDivs[j] = [];
	for (i = 0; i < worldData[j].length; i++) {
		var d = document.createElement("pre");
		d.style.position = "absolute";
		d.style.position = "absolute";
		d.style.lineHeight = 1;
		d.style.fontFamily = "monospace";
		d.style.color = "white";
		d.style.margin = 0;
		d.style.left = i * divcols * 8;
		d.style.top = j * divrows * 13;
		var txt = document.createTextNode(worldData[j][i]);
		d.appendChild(txt);
		document.body.appendChild(d);
		worldDivs[j][i] = d;
	}
}

for (i = 0; i < worldLines.length; i++) {
	walls[i] = [];
	for (j = 0; j < worldLines[i].length; j++) {
		if (worldLines[i][j] != ' ')
			walls[i][j] = { 
				left: j * tileWidth,
				right: (j + 1) * tileWidth,
				top: i * tileHeight,
				bottom: (i + 1) * tileHeight };
	}
}

document.body.style.backgroundColor = "black";
document.body.style.overflow = "hidden";

var you = document.createElement("div");
you.style.position = "absolute";
you.style.left = "50%";
you.style.top = "50%";
you.style.fontFamily = "monospace";
you.style.color = "white";
var a = document.createTextNode("@");
you.appendChild(a);
document.body.appendChild(you);

var keysDown = {};
var playerxv = 0;
var playeryv = 0;
var playerw = tileWidth;
var playerh = tileHeight - 1;
var playerx = Math.floor(window.innerWidth / 2);
var playery = Math.floor(window.innerHeight / 2) + 3;
var movespeed = 3;

// Rectangle intersection check.
function intersects(r1, r2) {
	return !(r2.left >= r1.right ||
		 r2.right <= r1.left ||
		 r2.top >= r1.bottom ||
		 r2.bottom <= r1.top);
}

function collisionDetection() {
	// Player collision rectangles.
	var leftRect = { left: playerx + playerxv, 
			 right: playerx + playerw + playerxv, 
			 top: playery, 
			 bottom: playery + playerh };
	var rightRect = { left: playerx + playerw, 
			 right: playerx + playerw + playerxv, 
			 top: playery, 	
			 bottom: playery + playerh };
	var topRect = { left: playerx, 
			right: playerx + playerw, 
			top: playery + playeryv, 
			bottom: playery };
	var botRect = { left: playerx, 
			right: playerx + playerw, 
			top: playery + playerh, 
			bottom: playery + playerh + playeryv };

	// Player corner rectangles. TODO
	var topleftRect = { left: 0, right: 0, top: 0, bottom: 0 };
	var botleftRect = { left: 0, right: 0, top: 0, bottom: 0 };
	var toprightRect = { left: 0, right: 0, top: 0, bottom: 0 };
	var botrightRect = { left: 0, right: 0, top: 0, bottom: 0 };

	for (i = 0; i < walls.length; i++) {
		for (j = 0; j < walls[i].length; j++) {
			if (walls[i][j]) {
				if (intersects(leftRect, walls[i][j]) && playerxv < 0)
                {
                    var leftRem = playerx - walls[i][j].right;
                    playerxv = -leftRem;
                }
				if (intersects(rightRect, walls[i][j]) && playerxv > 0)
                {
                    var rightRem = walls[i][j].left - (playerx + playerw);
					playerxv = rightRem;
                }
				if (intersects(topRect, walls[i][j]) && playeryv < 0)
                {
                    var topRem = playery - walls[i][j].bottom;
					playeryv = -topRem;
                }
				if (intersects(botRect, walls[i][j]) && playeryv > 0)
                {
                    var botRem = walls[i][j].top - (playery + playerh);
					playeryv = botRem;
                }
			}
		}
	}
}

addEventListener("keydown", function(e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
	delete keysDown[e.keyCode];
}, false);

// This has gotten so hacky but it's beautiful how well this handles resize.
addEventListener("resize", function() {
    you.style.left = playerx + parseInt(worldDivs[0][0].style.left);
    you.style.top = playery + parseInt(worldDivs[0][0].style.top) - 3;
});

setInterval(function() {
	if (38 in keysDown) { // UP
		playeryv = -movespeed;
	}
	else if (40 in keysDown) { // DOWN
		playeryv = movespeed;
	}
	else
		playeryv = 0;
	if (39 in keysDown) { // RIGHT
		playerxv = movespeed;
	}
	else if (37 in keysDown) { // LEFT
		playerxv = -movespeed;
	}
	else
		playerxv = 0;

	// Yay, side effects on global variables.
	collisionDetection();

	playerx += playerxv;
	playery += playeryv;
	for (j = 0; j < worldDivs.length; j++) {
		for (i = 0; i < worldDivs[j].length; i++) {
			var d = worldDivs[j][i];
			d.style.left = -playerxv + parseInt(d.style.left);
			d.style.top = -playeryv + parseInt(d.style.top);
		}
	}
}, 20);
