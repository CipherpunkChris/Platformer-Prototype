var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;

const ENTER = 13;
const SPACEBAR = 32;
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;
var mouseX;
var mouseY;
var mouseClickX;
var mouseClickY;
var mouseLeftHeld = false;
var confirmKeyHeld = false;
var jumpKeyHeld = false;
var leftKeyHeld = false;
var upKeyHeld = false;
var rightKeyHeld = false;
var downKeyHeld = false;

var backgroundColor = 'dimGrey';

var _GRAVITY = 0.20;
var _AIR_RESISTANCE = 0.90;
var _FRICTION = 0.92;

var heroX;
var heroY;
var heroWidth = 64;
var heroHeight = 64;
var heroVelocityX = 0;
var heroVelocityY = 0;
var heroMaxVelocityX = 20;
var heroMaxVelocityY = 10;
var heroMoveSpeed = 1;
var heroJumpSpeed = 10;
var heroIsJumping = false;
var heroCanJump = true;
var heroColor = 'lightGray';

window.onload = function()
{
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');

	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);
	document.addEventListener('mousemove', mousePosHandler);
	document.addEventListener('mousedown', mousePressed);
	document.addEventListener('mouseup', mouseReleased);

	heroX = canvas.width/2;
	heroY = canvas.height - heroHeight;

	setInterval(function()
	{
		update();
		draw();
	}, 1000/FRAMES_PER_SECOND);
}

function update()
{

	if (!heroIsJumping && !jumpKeyHeld)
	{
		heroCanJump = true;
	}
	if (jumpKeyHeld && heroCanJump)
	{
		heroIsJumping = true;
		heroCanJump = false
		heroVelocityY = -heroJumpSpeed;
	}

	if (leftKeyHeld)
	{
		heroVelocityX += -heroMoveSpeed;
	}
	else if (rightKeyHeld)
	{
		heroVelocityX += heroMoveSpeed;
	}

	if (heroIsJumping)
	{
		heroVelocityX *= _AIR_RESISTANCE;
	}
	else
	{
		heroVelocityX *= _FRICTION;
	}

	if (heroVelocityX > heroMaxVelocityX)
	{
		heroVelocityX = heroMaxVelocityX;
	}
	else if	(heroVelocityX < -heroMaxVelocityX)
	{
			heroVelocityX = -heroMaxVelocityX;
	}

	heroVelocityY += _GRAVITY;
	heroY += heroVelocityY;
	heroX += heroVelocityX;

	if (heroY > canvas.height - heroHeight)
	{
		heroY = canvas.height - heroHeight;
		heroVelocityY = 0;
		heroIsJumping = false;
	}

	panelUpdate(debugPanel);
}

function draw()
{
	colorRect(0, 0, canvas.width, canvas.height, backgroundColor);
	drawPanelWithButtons(debugPanel, PRECISION);
	colorRect(heroX, heroY, heroWidth, heroHeight, heroColor);
	// drawText(mouseX + ":" + mouseY, mouseX+20, mouseY+20, '10px Consolas', 'yellow');
}

function keyPressed(evt)
{
	keyEventHandler(evt.keyCode, true);
	panelKeyCapture(debugPanel, evt);
}

function keyReleased(evt)
{
	keyEventHandler(evt.keyCode, false);
}

function keyEventHandler(key, state)
{
	console.log(key + ": " + state);
	switch (key)
	{
		case SPACEBAR:
			jumpKeyHeld = state;
			break;
		case ENTER:
			confirmKeyHeld = state;
			break;
		case ARROW_LEFT:
			leftKeyHeld = state;
			break;
		case ARROW_UP:
			upKeyHeld = state;
			break;
		case ARROW_RIGHT:
			rightKeyHeld = state;
			break;
		case ARROW_DOWN:
			downKeyHeld = state;
			break;
		default:
			break;
	}
}

function mousePosHandler(evt)
{
	var mousePos = calculateMousePos(evt);
	mouseX = mousePos.x;
	mouseY = mousePos.y;
}

function mousePressed(evt)
{
	var result = calculateMousePos(evt);
	mouseClickX = result.x;
	mouseClickY = result.y;
	console.log(mouseClickX + " " + mouseClickY);
	mouseLeftHeld = true;
}

function mouseReleased(evt)
{
	mouseLeftHeld = false;
}

function calculateMousePos(evt)
{
  var rect = canvas.getBoundingClientRect(), root = document.documentElement;

  // account for the margins, canvas position on page, scroll amount, etc.
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
	x: mouseX,
	y: mouseY
  };
}
