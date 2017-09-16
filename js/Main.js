var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;
const STRING = "string";

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
	button: [
		{ name: "Move Max: ", value: heroMaxVelocityX },
		{ name: "Jump Max: ", value: heroMaxVelocityY },
		{ name: "Move Vel: ", value: heroMoveSpeed },
		{ name: "Jump Vel: ", value: heroJumpSpeed },
		{ name: "Gravity:  ", value: _GRAVITY },
		{ name: "Friction: ", value: _FRICTION },
		{ name: "Air Drag: ", value: _AIR_RESISTANCE }
	],

	selected: undefined,
	highlighted: undefined,

	x: 10,
	y: 20,
	offsetY: 15,
	width: 150,

	font: '15px Consolas',
	color: 'lime',
	highlightColor: 'yellow'
};

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

	// update debugPanel
	var x = debugPanel.x;
	var y = debugPanel.y;
	for (var i = 0; i < debugPanel.button.length; i++)
	{
		var button = debugPanel.button[i];
		var buttonY = y - debugPanel.offsetY;
		var color = debugPanel.color;

		if (mouseX > debugPanel.x &&
			mouseX < debugPanel.x + debugPanel.width &&
			mouseY > buttonY &&
			mouseY < buttonY + debugPanel.offsetY)
		{
			if (mouseLeftHeld)
			{
				debugPanel.selected = button;
			}
			debugPanel.highlighted = button;
		}
		y += debugPanel.offsetY;
	}
}

function draw()
{
	colorRect(0, 0, canvas.width, canvas.height, backgroundColor);
	drawPanelWithButtons(debugPanel, 100);
	colorRect(heroX, heroY, heroWidth, heroHeight, heroColor);
	// drawText(mouseX + ":" + mouseY, mouseX+20, mouseY+20, '10px Consolas', 'yellow');
}

function keyPressed(evt)
{
	keyEventHandler(evt.keyCode, true);
	if (debugPanel.selected != undefined) {

		var key = evt.keyCode;
		if (key >= 96 && key <= 106)
		{
			var num = key-96;
			debugPanel.buffer += num.toString();
		}
		if (key >= 48 && key <= 58)
		{
			var num = key-48;
			debugPanel.buffer += num.toString();
		}
		if (key == 109 || key == 189)
		{
			debugPanel.buffer += "-";
		}
		if (key == 110 || key == 190)
		{
			debugPanel.buffer += ".";
		}
		if (key == 8)
		{
			debugPanel.buffer = debugPanel.buffer.slice(0, -1);
		}
		if (key == 13) {
			var number = Number(debugPanel.buffer);
			if (!isNaN(number)) {
				debugPanel.selected.value = number;
				debugPanel.selected = undefined;
			}
			else
			{
				debugPanel.selected = undefined;
			}
			debugPanel.buffer = ""
		}
	}
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

function drawPanelWithButtons(panel, precision)
{
	var x = panel.x;
	var y = panel.y;

	for (var i = 0; i < panel.button.length; i++)
	{
		var button = panel.button[i];
		var buttonY = y - panel.offsetY;
		var color = panel.color;

		if (button == panel.highlighted)
		{
			color = panel.highlightColor;
		}

		if (button == panel.selected)
		{
			color = panel.highlightColor;
			drawButton(button.name, panel.buffer);
		}
		else
		{
			drawButton(button.name, button.value);
		}
	}

	function drawButton(text, value)
	{
		var font = panel.font;

		if (!typeof value == STRING)
		{
			value = Math.round(value*precision)/precision;
		}
		drawText(text + value, x, y, font, color);
		y += panel.offsetY;
	}
}
