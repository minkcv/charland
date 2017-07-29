var dummyPre = document.createElement("pre");
dummyPre.style.fontFamily = "monospace";
dummyPre.style.position= "absolute";
dummyPre.style.margin = 0;
dummyPre.style.display = "inline-block";
var dummyA = document.createTextNode("A");
dummyPre.appendChild(dummyA);
document.body.appendChild(dummyPre);
// What is 7.1 pixels? You can't render 0.1 pixels,
// but if you have several elements next to each other
// then the fractional amounts start to add up.
// And this is why we can't just use dummyPre.clientWidth,
// or dummyPre.offsetWidth, or dummyPre.scrollWidth.
var tileWidth = dummyPre.getBoundingClientRect().width;
var tileHeight = dummyPre.getBoundingClientRect().height;

var divcols = 64;
var divrows = 64;
if (worldLines.length % divrows != 0)
    console.log("number of lines in the world must be a multiple of divrows (" + divrows + ")");
if (worldLines[0].length % divrows != 0)
    console.log("number of characters in a world line should be a multiple of divcols (" + divcols + ")");
var worldData = [];
var worldDivs = [];
var walls = [];
var gamestart = true;
var playerstartx = 341 * tileWidth;
var playerstarty = 130 * tileHeight;
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
        d.style.fontFamily = "monospace";
        d.style.color = "white";
        d.style.margin = 0;
        d.style.left = i * divcols * tileWidth;
        d.style.top = j * divrows * tileHeight;
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
                bottom: (i + 1) * tileHeight
            };
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

    var topleftRect = { left: playerx + playerxv, 
                        right: playerx + playerw + playerxv, 
                        top: playery + playeryv, 
                        bottom: playery };
    var botleftRect = { left: playerx + playerxv,
                        right: playerx + playerw + playerxv,
                        top: playery + playerh,
                        bottom: playery + playerh + playeryv };
    var toprightRect = { left: playerx + playerw, 
                         right: playerx + playerw + playerxv, 
                         top: playery + playeryv, 
                         bottom: playery };
    var botrightRect = { left: playerx + playerw,
                         right: playerx + playerw + playerxv, 
                         top: playery + playerh, 
                         bottom: playery + playerh + playeryv };

    var leftIntersects = false;
    var rightIntersects = false;
    var topIntersects = false;
    var botIntersects = false;

    for (i = 0; i < walls.length; i++) {
        for (j = 0; j < walls[i].length; j++) {
            if (walls[i][j]) {
                if (intersects(leftRect, walls[i][j]) && playerxv < 0)
                {
                    var leftRem = playerx - walls[i][j].right;
                    playerxv = -Math.floor(leftRem);
                    leftIntersects = true;
                }
                if (intersects(topRect, walls[i][j]) && playeryv < 0)
                {
                    var topRem = playery - walls[i][j].bottom;
                    playeryv = -Math.floor(topRem);
                    topIntersects = true;
                }

                if (intersects(rightRect, walls[i][j]) && playerxv > 0)
                {
                    var rightRem = walls[i][j].left - (playerx + playerw);
                    playerxv = Math.floor(rightRem);
                    rightIntersects = true;
                }
                if (intersects(botRect, walls[i][j]) && playeryv > 0)
                {
                    var botRem = walls[i][j].top - (playery + playerh);
                    playeryv = Math.floor(botRem);
                    botIntersects = true;
                }
            }
        }
    }

    for (i = 0; i < walls.length; i++) {
        for (j = 0; j < walls[i].length; j++) {
            if (walls[i][j]) {
                if (!leftIntersects && !topIntersects)
                {
                    if (intersects(topleftRect, walls[i][j]) && playerxv < 0 && playeryv < 0)
                    {
                        playeryv = 0;
                    }
                }
                if (!leftIntersects && !botIntersects)
                {
                    if (intersects(botleftRect, walls[i][j]) && playerxv < 0 && playeryv > 0)
                    {
                        playeryv = 0;
                    }
                }
                if (!topIntersects && !rightIntersects)
                {
                    if (intersects(toprightRect, walls[i][j]) && playerxv > 0 && playeryv < 0)
                    {
                        playeryv = 0;
                    }
                }
                if (!botIntersects && !rightIntersects)
                {
                    if (intersects(botrightRect, walls[i][j]) && playerxv > 0 && playeryv > 0)
                    {
                        playeryv = 0;
                    }
                }
            }
        }
    }
}

addEventListener("keydown", function(e) {
    e.preventDefault();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    e.preventDefault();
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

    // Yet another hack because I can't just set playerx or playery
    if (gamestart)
    {
        playerxv = playerstartx - Math.floor(window.innerWidth / 2);
        playeryv = playerstarty - Math.floor(window.innerHeight / 2);
        gamestart = false;
    }

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
