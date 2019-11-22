import '../styles/index.scss';

// pixels per second
const MOVEMENT_SPEED = 100;

const VIEW_DISTANCE = 70;
const FOV = 40;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const viewWidth = 400;
const viewHeight = 300;

const mapSize = 1000;

const player = {
  x: 75,
  y: 75,
  destination: null,
  facing: 0,
};

const pointer = {
  x: 0,
  y: 0,
  isDown: false,
};

const halfWidth = viewWidth / 2;
const halfHeight = viewHeight / 2;

canvas.width = viewWidth;
canvas.height = viewHeight;

const setDestination = () => {
  if (!pointer.isDown) {
    return;
  }
  let x = pointer.x + player.x - halfWidth;
  let y = pointer.y + player.y - halfHeight;

  if (x < 0) {
    x = 0;
  } else if (x > mapSize) {
    x = mapSize;
  }

  if (y < 0) {
    y = 0;
  } else if (y > mapSize) {
    y = mapSize;
  }

  const delta_x = x - player.x;
  const delta_y = y - player.y;
  const theta_radians = Math.atan2(delta_y, delta_x);

  player.facing = theta_radians;

  player.destination = {
    x: x,
    y: y,
  };
};

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

function updatePointerPosition(e) {
  pointer.x = e.offsetX;
  pointer.y = e.offsetY;

  let x = pointer.x + player.x - halfWidth;
  let y = pointer.y + player.y - halfHeight;

  const delta_x = x - player.x;
  const delta_y = y - player.y;
  const theta_radians = Math.atan2(delta_y, delta_x);

  player.facing = theta_radians;
}

canvas.addEventListener('mousemove', updatePointerPosition);

function keyDown(e) {
  switch (e.key) {
    case 'w': {
      keys.w = true;
      break;
    }
    case 'a': {
      keys.a = true;
      break;
    }
    case 's': {
      keys.s = true;
      break;
    }
    case 'd': {
      keys.d = true;
      break;
    }
  }
}

function keyUp(e) {
  switch (e.key) {
    case 'w': {
      keys.w = false;
      break;
    }
    case 'a': {
      keys.a = false;
      break;
    }
    case 's': {
      keys.s = false;
      break;
    }
    case 'd': {
      keys.d = false;
      break;
    }
  }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

let lastFrameTime = Date.now();

// draw

function loop() {
  let time = Date.now();
  let frameTime = time - lastFrameTime;

  ctx.clearRect(0, 0, viewWidth, viewHeight);

  let p = MOVEMENT_SPEED * (frameTime / 1000);

  // let x = player.x + p * Math.cos(player.facing * Math.PI / 180);
  // let y = player.y + p * Math.sin(player.facing * Math.PI / 180);

  let x = player.x;
  let y = player.y;
console.log(keys)
  if (keys.w) {
    y = player.y - p;
  }
  if (keys.a) {
    x = player.x - p;
  }
  if (keys.s) {
    y = player.y + p;
  }
  if (keys.d) {
    x = player.x + p;
  }

  player.x = x;
  player.y = y;

  ctx.fillStyle = '#ccc';
  ctx.fillRect(
    Math.max(0, halfWidth - player.x),
    Math.max(0, halfHeight - player.y),
    Math.min(viewWidth, mapSize - player.x + halfWidth),
    Math.min(viewHeight, mapSize - player.y + halfHeight)
  );

  // fov
  // const fovStartX = halfWidth + VIEW_DISTANCE * Math.cos(player.facing - FOV / 2 * Math.PI / 180);
  // const fovStartY = halfHeight + VIEW_DISTANCE * Math.sin(player.facing - FOV / 2 * Math.PI / 180);
  // const fovEndX = halfWidth + VIEW_DISTANCE * Math.cos(player.facing + FOV / 2 * Math.PI / 180);
  // const fovEndY = halfHeight + VIEW_DISTANCE * Math.sin(player.facing + FOV / 2 * Math.PI / 180);
  ctx.fillStyle = '#ddd';
  ctx.beginPath();
  ctx.moveTo(halfWidth, halfHeight);
  ctx.arc(halfWidth, halfHeight, VIEW_DISTANCE, player.facing - FOV / 2 * Math.PI / 180, player.facing + FOV / 2 * Math.PI / 180);
  ctx.lineTo(halfWidth, halfHeight);
  ctx.closePath();
  ctx.fill();

  if (player.destination) {
    ctx.beginPath();
    ctx.strokeStyle = '#f00';
    ctx.arc(player.destination.x - player.x + halfWidth, player.destination.y - player.y + halfHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
  }

  // player

  ctx.beginPath();
  ctx.fillStyle = '#000';
  ctx.arc(halfWidth, halfHeight, 5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();


  lastFrameTime = time;

  requestAnimationFrame(loop);
}

loop();
