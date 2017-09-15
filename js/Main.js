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
var mouseLeftHeld = false;
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

var debugPanel = {

	buffer: "",
	fields: [
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
	],

	x: 10,
	y: 20,
	offsetY: 20
};

var y = debugPanel.y;
for (var i = 0; i < debugPanel.fields.length; i++)
{
	var field = debugPanel.fields[i];
	field.x = debugPanel.x;
	field.y = y;
	y += debugPanel.offsetY;
}

window.onload = function()
{
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');
	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);
	document.addEventListener('mousemove', mousePosHandler);

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
	drawDebugInfo(debugPanel, 100, '15px Consolas', 'lime', 'yellow');
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

function mousePosHandler(evt)
{
	var mousePos = calculateMousePos(evt);
	mouseX = mousePos.x;
	mouseY = mousePos.y;
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

function drawDebugInfo(debugPanel, precision, font, color1, color2)
{
	var highlightColor;

	for (var i = 0; i < debugPanel.fields.length; i++)
	{
		var field = debugPanel.fields[i];
		if (false)
		{
			field.isHighlighted = true;
		}
		else
		{
			field.isHighlighted = false;
		}
		if (confirmKeyHeld && field.isHighlighted)
		{
			field.isHighlighted = false;
			// TOOD: push buffer value to appropriate variable
			debugPanel.buffer = "";
		}

		if (field.isHighlighted == undefined || !field.isHighlighted)
		{
			highlightColor = color1;
			drawDebugInfoLine(field);
		}
		else
		{
			highlightColor = color2;
			drawDebugInfoLine(field);
		}
	}

	function drawDebugInfoLine(field)
	{
		x = field.x;
		y = field.y;
		text = field.name;
		value = field.value;
		drawText(text + Math.round(value*precision)/precision, x, y, font, highlightColor);
		y += debugPanel.offsetY;
	}
}
