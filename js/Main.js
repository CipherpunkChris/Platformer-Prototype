var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;

const ENTER = 13;
const SPACEBAR = 32;
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;
var confirmKeyHeld = false;
var jumpKeyHeld = false;
var leftKeyHeld = false;
var upKeyHeld = false;
var rightKeyHeld = false;
var downKeyHeld = false;

var backgroundColor = 'dimGrey';

var _GRAVITY = 0.20;
var _FRICTION = 0.92;
var _AIR_RESISTANCE = 0.90;

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

var debugBuffer = "";
var debugFields = [
		{ name: "PositionX:  ", value: heroX },
		{ name: "PositionY:  ", value: heroY },
		{ name: "SpeedX:     ", value: heroVelocityX },
		{ name: "SpeedY:     ", value: heroVelocityY },
		{ name: "Max SpeedX: ", value: heroMaxVelocityX },
		{ name: "Max SpeedY: ", value: heroMaxVelocityY },
		{ name: "Move Speed: ", value: heroMoveSpeed },
		{ name: "Jump Speed: ", value: heroJumpSpeed },
		{ name: "Gravity:    ", value: _GRAVITY },
		{ name: "Friction:   ", value: _FRICTION },
		{ name: "Air Drag:   ", value: _AIR_RESISTANCE }
];

window.onload = function()
{
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');
	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);
	document.addEventListener('mousepos', keyReleased);

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
}

function draw()
{
	colorRect(0, 0, canvas.width, canvas.height, backgroundColor);

	drawDebugInfo(10, 20, 20, 100, debugFields, '15px Consolas', 'lime', 'yellow');

	colorRect(heroX, heroY, heroWidth, heroHeight, heroColor);
}

function keyPressed(evt)
{
	keyEventHandler(evt.keyCode, true);
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

function drawDebugInfo(x, y, offsetY, precision, debugFields, font, color1, color2)
{
	var highlightColor;

	for (var i = 0; i < debugFields.length; i++)
	{
		if (false)
		{
			debugFields[i].isHighlighted = true;
		}
		else
		{
			debugFields[i].isHighlighted = false;
		}
		if (confirmKeyHeld && debugFields[i].isHighlighted)
		{
			debugFields[i].isHighlighted = false;
			// TOOD: push buffer value to appropriate variable
			debugBuffer = "";
		}

		if (debugFields[i].isHighlighted == undefined || !debugFields[i].isHighlighted)
		{
			highlightColor = color1;
			drawDebugInfoLine(debugFields[i].name, debugFields[i].value);
		}
		else
		{
			highlightColor = color2;
			drawDebugInfoLine(debugFields[i].name, debugBuffer);
		}
	}

	function drawDebugInfoLine(text, value)
	{
		drawText(text + Math.round(value*precision)/precision, x, y, font, highlightColor);
		// drawText(text + value, x, y, font, highlightColor);
		y += offsetY;
	}
}

for (var i = 0; i < debugFields.length; i++)
{

}
