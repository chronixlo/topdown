import player from './player';
import { halfWidth, halfHeight, mapSize } from './index';

export function screenToMapCoords(x, y) {
  x += player.x - halfWidth;
  y += player.y - halfHeight;

  // fit to map
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

  return { x, y };
}

export function mapToScreenCoords(x, y) {
  x = x - player.x + halfWidth;
  y = y - player.y + halfHeight;

  return { x, y };
}
