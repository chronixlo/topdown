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
  skill: null,
};

const controls = {
  mouseX: 0,
  mouseY: 0,
  mouse2: false,
};

const halfWidth = viewWidth / 2;
const halfHeight = viewHeight / 2;

canvas.width = viewWidth;
canvas.height = viewHeight;

const setDestination = () => {
  if (!controls.mouse2) {
    return;
  }

  player.skill = null;

  let x = controls.mouseX + player.x - halfWidth;
  let y = controls.mouseY + player.y - halfHeight;

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

function updatePointerPosition(e) {
  controls.mouseX = e.offsetX;
  controls.mouseY = e.offsetY;
}

const pointerUp = (e) => {
  if (e.which === 3) {
    controls.mouse2 = false;
  }
};

canvas.addEventListener('mousemove', updatePointerPosition);

canvas.addEventListener('mousedown', (e) => {
  if (e.which === 3) {
    controls.mouse2 = true;
  }
});

document.addEventListener('mouseup', pointerUp);

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

function keyPress(e) {
  if (e.key === 'q') {
    player.skill = 'q';
  }
}

document.addEventListener('keypress', keyPress);

let lastFrameTime = Date.now();

// draw

function loop() {
  let time = Date.now();
  let frameTime = time - lastFrameTime;

  ctx.clearRect(0, 0, viewWidth, viewHeight);

  setDestination();

  if (player.destination) {
    let distance = Math.hypot(player.x - player.destination.x, player.y - player.destination.y);

    if (distance > 1) {
      let p = MOVEMENT_SPEED * (frameTime / 1000) / distance;

      let x = player.x + p * (player.destination.x - player.x);
      let y = player.y + p * (player.destination.y - player.y);

      player.x = x;
      player.y = y;
    } else {
      player.destination = null;
    }
  }

  // play area
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


  // out of bounds
  // todo: optimize
  ctx.fillStyle = '#111';
  // left
  if (halfWidth - player.x > 0) {
    ctx.fillRect(0, 0, halfWidth - player.x, viewHeight);
  }
  // top
  if (halfHeight - player.y > 0) {
    ctx.fillRect(0, 0, viewWidth, halfHeight - player.y);
  }
  // right
  if (mapSize - player.x + halfWidth < viewWidth) {
    ctx.fillRect(mapSize - player.x + halfWidth, 0, viewWidth - (mapSize - player.x + halfWidth), viewHeight);
  }
  // bottom
  if (mapSize - player.y + halfHeight < viewHeight) {
    ctx.fillRect(0, mapSize - player.y + halfHeight, viewWidth, viewHeight - (mapSize - player.y + halfHeight));
  }

  // ctx.fillRect(
  //   Math.max(0, halfWidth - player.x),
  //   Math.max(0, halfHeight - player.y),
  //   Math.min(viewWidth, mapSize - player.x + halfWidth),
  //   Math.min(viewHeight, mapSize - player.y + halfHeight)
  // );

  // skill targeting
  if (player.skill) {
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#222';
    ctx.arc(controls.mouseX, controls.mouseY, 15, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  lastFrameTime = time;

  requestAnimationFrame(loop);
}

loop();
