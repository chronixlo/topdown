import '../styles/index.scss';

// pixels per second
const MOVEMENT_SPEED = 300;

// radians per second
const TURN_SPEED = 6;

const VIEW_DISTANCE = 150;
const FOV = 60;

const BLINK_RANGE = 200;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;

const mapSize = 1000;

const player = {
  x: 750,
  y: 750,
  destination: null,
  facing: 0,
  facingTarget: null,
  skill: null,
};

const controls = {
  mouseX: 0,
  mouseY: 0,
  mouse1: false,
  mouse2: false,
};

const halfWidth = viewWidth / 2;
const halfHeight = viewHeight / 2;

canvas.width = viewWidth;
canvas.height = viewHeight;

const setDestination = (isClick) => {
  player.skill = null;

  // todo: face cursor even if destination is different
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

  player.facingTarget = theta_radians;

  player.destination = {
    x: x,
    y: y,
    time: isClick ? Date.now() : player.destination && player.destination.time,
  };
};

function updatePointerPosition(e) {
  controls.mouseX = e.offsetX;
  controls.mouseY = e.offsetY;
}

const pointerUp = (e) => {
  if (e.which === 1) {
    controls.mouse1 = false;

    if (player.skill === 'q') {
      let distance = Math.hypot(controls.mouseX - halfWidth, controls.mouseY - halfHeight);

      let skillTargetCoords = {
        x: controls.mouseX,
        y: controls.mouseY
      };

      if (distance > BLINK_RANGE) {
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

        skillTargetCoords.x = halfWidth + BLINK_RANGE * Math.cos(theta_radians);
        skillTargetCoords.y = halfHeight + BLINK_RANGE * Math.sin(theta_radians);
      }

      player.x = skillTargetCoords.x + player.x - halfWidth;
      player.y = skillTargetCoords.y + player.y - halfHeight;

      player.destination = null;
      player.skill = null;
    }
  }
  if (e.which === 3) {
    controls.mouse2 = false;
  }
};

canvas.addEventListener('mousemove', updatePointerPosition);

canvas.addEventListener('mousedown', (e) => {
  if (e.which === 1) {
    controls.mouse1 = true;
  }
  if (e.which === 3) {
    controls.mouse2 = true;
    setDestination(true);
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

  if (controls.mouse2) {
    setDestination();
  }

  if (player.destination) {
    const distance = Math.hypot(player.x - player.destination.x, player.y - player.destination.y);

    if (distance > 2) {
      let p = MOVEMENT_SPEED * (frameTime / 1000) / distance;

      let x = player.x + p * (player.destination.x - player.x);
      let y = player.y + p * (player.destination.y - player.y);

      player.x = x;
      player.y = y;
    } else {
      player.x = player.destination.x;
      player.y = player.destination.y;
      player.destination = null;
    }
  }

  // turning
  // todo: optimize
  if (player.facingTarget) {
    let turnDistance = Math.abs(player.facingTarget - player.facing);
    let ccw = false;

    if (turnDistance > Math.PI) {
      turnDistance = Math.PI * 2 - turnDistance;
      ccw = true;
    }

    let p = TURN_SPEED * (frameTime / 1000) / turnDistance;

    if (ccw) {
      // todo: fix perpetual rotation
      if (player.facingTarget - player.facing < 0) {
        player.facing = player.facing + p * (Math.PI * 2 - Math.abs(player.facingTarget - player.facing));
      } else {
        player.facing = player.facing - p * (Math.PI * 2 - Math.abs(player.facingTarget - player.facing));
      }
    } else {
      player.facing = player.facing + p * (player.facingTarget - player.facing);
    }

    if (turnDistance < 0.1 && turnDistance > -0.1) {
      player.facing = player.facingTarget;
      player.facingTarget = null;
    }
  }

  // console.log(player.facing)

  // play area
  ctx.fillStyle = '#ccc';
  ctx.fillRect(
    Math.max(0, halfWidth - player.x),
    Math.max(0, halfHeight - player.y),
    Math.min(viewWidth, mapSize - player.x + halfWidth),
    Math.min(viewHeight, mapSize - player.y + halfHeight)
  );

  // skill range
  if (player.skill) {
    ctx.beginPath();
    ctx.fillStyle = '#fffa';
    ctx.strokeStyle = '#222a';
    ctx.lineWidth = 2;
    ctx.arc(halfWidth, halfHeight, BLINK_RANGE, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    // ctx.fill();
  }

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
    const delta = time - player.destination.time;
    const radius = Math.max(20 - delta / 10, 5);
    ctx.beginPath();
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 1;
    ctx.arc(player.destination.x - player.x + halfWidth, player.destination.y - player.y + halfHeight, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
  }

  // player
  ctx.beginPath();
  ctx.fillStyle = '#666';
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 5;
  ctx.arc(halfWidth, halfHeight, 5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  const x = halfWidth + 5 * Math.cos(player.facing);
  const y = halfHeight + 5 * Math.sin(player.facing);

  ctx.beginPath();
  ctx.fillStyle = '#a34';
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // out of bounds
  // todo: optimize
  ctx.fillStyle = '#222';
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

  // skill targeting
  if (player.skill) {
    let distance = Math.hypot(controls.mouseX - halfWidth, controls.mouseY - halfHeight);

    let skillTargetCoords = {
      x: controls.mouseX,
      y: controls.mouseY
    };

    if (distance > BLINK_RANGE) {
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

      skillTargetCoords.x = halfWidth + BLINK_RANGE * Math.cos(theta_radians);
      skillTargetCoords.y = halfHeight + BLINK_RANGE * Math.sin(theta_radians);
    }

    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#222';
    ctx.arc(skillTargetCoords.x, skillTargetCoords.y, 15, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  lastFrameTime = time;

  requestAnimationFrame(loop);
}

loop();
