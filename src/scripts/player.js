import { screenToMapCoords } from './helpers';
import controls from './controls';

class Player {
  constructor() {
    this.x = 750;
    this.y = 750;
    this.destination = null;
    this.facing = 0;
    this.facingTarget = null;
    this.skill = null;
  }

  setDestination(isClick) {
    this.skill = null;

    // todo: face cursor even if destination is different

    let mapCoords = screenToMapCoords(controls.mouseX, controls.mouseY);

    const delta_x = mapCoords.x - this.x;
    const delta_y = mapCoords.y - this.y;
    const theta_radians = Math.atan2(delta_y, delta_x);

    this.facingTarget = theta_radians;

    this.destination = {
      x: mapCoords.x,
      y: mapCoords.y,
      time: isClick ? Date.now() : this.destination && this.destination.time,
    };
  };
}

export default new Player();
