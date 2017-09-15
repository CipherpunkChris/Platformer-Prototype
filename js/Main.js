var canvas, canvasContext;
const FRAMES_PER_SECOND = 60;
const TIME_PER_TICK = 1/FRAMES_PER_SECOND;
const GRAVITY = 0.20;
const FRICTION = 0.90;
const AIR_RESISTANCE = 0.85;

const SPACEBAR = 32;
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;
var jumpKeyHeld = false;
var leftKeyHeld = false;
var upKeyHeld = false;
var rightKeyHeld = false;
var downKeyHeld = false;

var heroWidth = 64;
var heroHeight = 64;
var heroX;
var heroY;
var heroVelocityX = 0;
var heroVelocityY = 0;
var heroMaxVelocityX = 10;
var heroMaxVelocityY = 10;
var heroMoveSpeed = 0.50;
var heroJumpSpeed = -10;
var heroIsJumping = false;
var heroCanJump = true;

window.onload = function()
{
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');
	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);

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
	heroUpdate();
}

function draw()
{
	// background
	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);

	heroDraw();
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
	// console.log(key + " " + state);
	switch (key)
	{
		case SPACEBAR:
			jumpKeyHeld = state;
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

function heroUpdate()
{
	if (!heroIsJumping && !jumpKeyHeld)
	{
		heroCanJump = true;
	}
	if (jumpKeyHeld && heroCanJump)
	{
		heroIsJumping = true;
		heroCanJump = false
		heroVelocityY = heroJumpSpeed;
	}

	if (leftKeyHeld)
	{
		heroVelocityX += -heroMoveSpeed;
	}
	else if (rightKeyHeld)
	{
		heroVelocityX += heroMoveSpeed;
	}
	else if (!heroIsJumping)
	{
		heroVelocityX *= FRICTION;
	}
	else
	{
		heroVelocityX *= AIR_RESISTANCE;
	}

	if (heroVelocityX > heroMaxVelocityX)
	{
		heroVelocityX = heroMaxVelocityX;
	}
	else if	(heroVelocityX < -heroMaxVelocityX)
	{
			heroVelocityX = -heroMaxVelocityX;
	}

	heroVelocityY += GRAVITY;
	heroY += heroVelocityY;
	heroX += heroVelocityX;

	if (heroY > canvas.height - heroHeight)
	{
		heroY = canvas.height - heroHeight;
		heroVelocityY = 0;
		heroIsJumping = false;
	}
}

function heroDraw()
{
	context.fillStyle = 'white';
	context.fillRect(heroX, heroY, heroWidth, heroHeight);
}
