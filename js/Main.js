var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;
var time = 0;
var clock = {
	hours: 0,
	minutes: 0,
	seconds: 0
};

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
var undoKeyHeld = false;
var jumpKeyHeld = false;
var leftKeyHeld = false;
var upKeyHeld = false;
var rightKeyHeld = false;
var downKeyHeld = false;

var backgroundColor = 'dimGrey';

var _REWIND_MULTIPLIER = 2;
var _GRAVITY = 0.60;
var _AIR_RESISTANCE = 0.90;
var _FRICTION = 0.92;
var commands = [];

var hero = {
	x: undefined,
	y: undefined,
	width: 64,
	height: 64,
	velocityX: 0,
	velocityY: 0,
	moveSpeed: 1,
	jumpSpeed: 16,
	isJumping: false,
	canJump: true,
	color: 'lightGrey',

	moveTo: function(x, y)
	{
		this.x = x;
		this.y = y;
	},
	rewind: function(velocityX, velocityY,
					 isJumping, canJump)
	{
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.isJumping = isJumping;
		this.canJump = canJump;
	}
};

function makeMoveUnitCommand(unit, x, y)
{
	var xBefore, yBefore;
	var velocityXBefore, velocityYBefore;
	var isJumpingBefore, canJumpBefore;
	return {
		execute: function()
		{
			xBefore = unit.x;
			yBefore = unit.y;
			velocityXBefore = unit.velocityX;
			velocityYBefore = unit.velocityY;
			isJumpingBefore = unit.isJumping;
			canJumpBefore = unit.canJump;
			unit.moveTo(x, y);
		},
		undo: function()
		{
			unit.moveTo(xBefore, yBefore);
			unit.rewind(velocityXBefore, velocityYBefore,
						isJumpingBefore, canJumpBefore);
		}
	};
}

window.onload = function()
{
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');

	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);
	document.addEventListener('mousemove', mousePosHandler);
	document.addEventListener('mousedown', mousePressed);
	document.addEventListener('mouseup', mouseReleased);

	hero.x = canvas.width/2;
	hero.y = canvas.height - hero.height;

	setInterval(function()
	{
		update();
		draw();
	}, 1000/FRAMES_PER_SECOND);
}

function update()
{
	if (!hero.isJumping && !jumpKeyHeld)
	{
		hero.canJump = true;
	}
	if (jumpKeyHeld && hero.canJump)
	{
		hero.isJumping = true;
		hero.canJump = false
		hero.velocityY = -hero.jumpSpeed;
	}

	if (leftKeyHeld)
	{
		hero.velocityX += -hero.moveSpeed;
	}
	else if (rightKeyHeld)
	{
		hero.velocityX += hero.moveSpeed;
	}

	if (hero.isJumping)
	{
		hero.velocityX *= _AIR_RESISTANCE;
	}
	else
	{
		hero.velocityX *= _FRICTION;
	}

	hero.velocityY += _GRAVITY;

	var targetX = hero.x + hero.velocityX;
	var targetY = hero.y + hero.velocityY;

	if (targetY > canvas.height - hero.height)
	{
		targetY = canvas.height - hero.height;
		hero.velocityY = 0;
		hero.isJumping = false;
	}

	panelUpdate(debugPanel);

	if (undoKeyHeld)
	{
		for (var i = 0; i < _REWIND_MULTIPLIER; i++)
		{
			if (commands.length == 0)
			{
				break;
			}
			commands[commands.length-1].undo();
			commands.splice(-1, 1);
			time -= TIME_PER_TICK;
			if (time < 0)
			{
				time = 0;
			}
		}
	}
	else
	{
		var command = makeMoveUnitCommand(hero, targetX, targetY);
		commands.push(command);
		commands[commands.length-1].execute();
		time += TIME_PER_TICK;
	}

	// update clock display
	clock.seconds = Math.floor(time%60);
	clock.minutes = Math.floor(time/60);
	clock.hours = Math.floor(time/3600);
	for (var segment in clock)
	{
		if (clock[segment] < 10)
		{
			clock[segment] = "0"+clock[segment];
		}
	}
}

function draw()
{
	colorRect(0, 0, canvas.width, canvas.height, backgroundColor);
	drawPanelWithButtons(debugPanel, PRECISION);
	colorRect(hero.x, hero.y, hero.width, hero.height, hero.color);
	drawText(clock.hours+":"+clock.minutes+":"+clock.seconds, 10, 25, '20pt consolas', 'lime');

	if (undoKeyHeld)
	{
		drawText("REWIND", 10, 60, '26pt consolas', 'lime');
	}
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
			undoKeyHeld = state;
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
