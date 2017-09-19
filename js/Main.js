var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;

const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;

const KEY_NUMPAD_0 = 96;
const KEY_NUMPAD_9 = 105;
const KEY_NUMPAD_PLUS = 107;
const KEY_NUMPAD_MINUS = 109;
const KEY_NUMPAD_PERIOD = 110;

const KEY_BACKSPACE = 8
const KEY_ENTER = 13;
const KEY_ESCAPE = 27;
const KEY_SPACEBAR = 32;

const KEY_0 = 48;
const KEY_9 = 57;
const KEY_PLUS = 187;
const KEY_MINUS = 189;
const KEY_PERIOD = 190;
const KEY_TILDE = 192; // cheat console

var mouseX;
var mouseY;
var mouseButtonHeld = false;
var confirmKeyHeld = false;
var jumpKeyHeld = false;
var leftKeyHeld = false;
var upKeyHeld = false;
var rightKeyHeld = false;
var downKeyHeld = false;
var jumpButtonPower = .1;
var jumpButtonHoldAvailable = false;

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
		jumpButtonHoldAvailable = true;
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
		if(jumpKeyHeld && jumpButtonHoldAvailable && heroVelocityY < 0) {
			heroY -= jumpButtonPower;
		}
		else if (heroVelocityY < 0)
		{
			heroVelocityY = 0;
			jumpButtonHoldAvailable = false;
		}
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
	switch (key)
	{
		case KEY_SPACEBAR:
			jumpKeyHeld = state;
			break;
		case KEY_ENTER:
			confirmKeyHeld = state;
			break;
		case KEY_ARROW_LEFT:
			leftKeyHeld = state;
			break;
		case KEY_ARROW_UP:
			upKeyHeld = state;
			break;
		case KEY_ARROW_RIGHT:
			rightKeyHeld = state;
			break;
		case KEY_ARROW_DOWN:
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
	mouseButtonHeld = true;
}

function mouseReleased(evt)
{
	mouseButtonHeld = false;
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
