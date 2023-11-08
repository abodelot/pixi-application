import { sound } from '@pixi/sound';

import { MAX_ELEVATION } from './Tileset';
import { Tilemap } from './Tilemap';
import { TilemapActionBase } from './TilemapActionBase';

/**
 * Action for modifying the tiles' elevation
 */
export class TilemapActionElevation extends TilemapActionBase {
  #direction: number;

  /**
   * @param tilemap: tilemap instance
   * @param direction: 1 = raise, -1 = dig
   */
  constructor(tilemap: Tilemap, direction: number) {
    super(tilemap);
    this.#direction = direction;
  }

  onTilePressed(i: number, j: number): void {
    this.updateTileElevationAt(i, j);
  }

  onTileDragged(i: number, j: number): void {
    this.updateTileElevationAt(i, j);
  }

  onTileReleased(): void { /* no op */ }

  updateTileElevationAt(i: number, j: number): void {
    if (this.#direction === 1) {
      const elevation = this.tilemap.getElevationAt(i, j, Math.min);
      if (elevation < MAX_ELEVATION) {
        this.tilemap.increaseZ(i, j);
      }
    } else if (this.#direction === -1) {
      const elevation = this.tilemap.getElevationAt(i, j, Math.max);
      if (elevation > 0) {
        this.tilemap.decreaseZ(i, j);
      }
    } else {
      sound.play('tilemap-no-op');
      return;
    }
    sound.play('tilemap-tile');

    // Refresh cursor selection: map geometry has changed and cursor could be
    // now hovering a different tile than before!
    this.tilemap.refreshPointerSelection();
  }
}
