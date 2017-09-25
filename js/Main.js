var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;
var lastUpdate = Date.now();
var deltaTime = 0;
var gameTimer = { time: 0 };
var clock = {
	milliseconds: 0,
	seconds: 0,
	minutes: 0,
	hours: 0
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

var _REWIND_MULTIPLIER = 4;
var _GRAVITY = 0.60;
var _AIR_RESISTANCE = 0.93;
var _FRICTION = 0.92;
var commands = [[]];

var actors = [];
var actor = {
	x: undefined,
	y: undefined,
	width: 64,
	height: 64,
	velocityX: 0,
	velocityY: 0,
	moveSpeed: 0.85,
	jumpSpeed: 16,
	isJumping: false,
	canJump: true,
	color: 'lightGrey',

	moveTo: function(x, y)
	{
		this.x = x;
		this.y = y;
	},
	rewindState: function(velocityX, velocityY,
					 isJumping, canJump)
	{
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.isJumping = isJumping;
		this.canJump = canJump;
	}
};

var hero = {...actor};
var enemy = {...actor};
enemy.width = 32;
enemy.height = 32;
enemy.color = 'red';

actors = [hero, enemy];

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
			unit.rewindState(velocityXBefore, velocityYBefore,
						isJumpingBefore, canJumpBefore);
		}
	};
}

function makeAdvanceTimerCommand(timer, dt)
{
	var timeBefore;
	return {
		execute: function()
		{
			timeBefore = timer.time;
			timer.time += dt;
		},
		undo: function()
		{
			timer.time = timeBefore;
		}
	}
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

	hero.x = canvas.width*0.5;
	hero.y = canvas.height - hero.height;

	enemy.x = canvas.width-enemy.width;
	enemy.y = canvas.height-enemy.height;

	setInterval(function()
	{
		update();
		draw();
	}, 1000/FRAMES_PER_SECOND);
}

function update()
{
	var command; // commands are created and added to commands array

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

	command = makeMoveUnitCommand(hero, targetX, targetY);
	commands[commands.length-1].push(command);

	targetX = enemy.x - 1;
	targetY = enemy.y;
	command = makeMoveUnitCommand(enemy, targetX, targetY);
	commands[commands.length-1].push(command);

	now = Date.now();
	deltaTime = now - lastUpdate;
	lastUpdate = now;
	command = makeAdvanceTimerCommand(gameTimer, deltaTime);
	commands[commands.length-1].push(command);

	panelUpdate(debugPanel);

	// update clock display

	clock.milliseconds = Math.floor((gameTimer.time%1000)/10);
	clock.seconds = Math.floor(gameTimer.time/1000)%60;
	clock.minutes = Math.floor(gameTimer.time/60000)%60;
	clock.hours = Math.floor(gameTimer.time/3600000)%60;
	for (var segment in clock)
	{
		if (clock[segment] < 0)
		{
			clock[segment] = "00";
		}
		else if (clock[segment] < 10)
		{
			clock[segment] = "0"+clock[segment];
		}
	}

	// handle all commands in queue for this tick or undo all commands from the previous tick`
	// this should always be the end of update
	if (undoKeyHeld)
	{
		commands.splice(-1, 1);
		for (var tick = 0; tick < _REWIND_MULTIPLIER; tick++)
		{
			if (commands.length <= 0)
			{
				break;
			}
			var commandsThisTick = commands[commands.length-1].length;
			for (var i = commandsThisTick-1; i >= 0; i--)
			{
				commands[commands.length-1][i].undo();
				// commands[commands.length-1].splice(-1, 1);
			}

			commands.splice(-1, 1);
		}
	}
	else
	{
		var commandsThisTick = commands[commands.length-1].length;
		for (var i = 0; i < commandsThisTick; i++)
		{
			commands[commands.length-1][i].execute();
		}
	}
	commands.push([]);
}

function draw()
{
	// draw background
	colorRect(0, 0, canvas.width, canvas.height, backgroundColor);

	// draw hero
	colorRect(hero.x, hero.y, hero.width, hero.height, hero.color);
	colorRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);

	// draw debug console
	drawPanelWithButtons(debugPanel, PRECISION);


	// draw segmented clock
	drawText(clock.hours+":"+clock.minutes+":"+
			 clock.seconds+"."+clock.milliseconds,
			 10, 25, '20pt consolas', 'lime');

	if (undoKeyHeld)
	{
		drawText("REWIND "+_REWIND_MULTIPLIER+"x", 10, 55, '24pt consolas', 'lime');
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
		case KEY_MINUS:
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
