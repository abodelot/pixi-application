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
    this.tilemap.redrawTilemap();
  }

  onTileDragged(i: number, j: number): void {
    this.updateTileElevationAt(i, j);
    this.tilemap.redrawTilemap();
  }

  // eslint-disable-next-line class-methods-use-this
  onTileReleased(): void { /* no op */ }

  updateTileElevationAt(i: number, j: number): void {
    const visited = new Set<number>();
    const elevation = this.tilemap.getElevationAt(i, j);
    if (this.#direction === 1 && elevation < MAX_ELEVATION) {
      this.normalizeElevation(i, j, elevation + 1, visited);
    } else if (this.#direction === -1 && elevation > 0) {
      this.normalizeElevation(i, j, elevation - 1, visited);
    } else {
      sound.play('tilemap-no-op');
      return;
    }
    sound.play('tilemap-tile');

    // Refresh cursor selection: map geometry has changed and cursor could be
    // now hovering a different tile than before!
    this.tilemap.refreshPointerSelection();
  }

  /**
   * Recursive function for handling elevation gradually. Ensure each tile
   * neighbor has an elevation of +/- 1 (no "cliff")
   * @param i, j: tile coords
   * @param zLimit: min (raising) or max (digging) allowed elevation for tile
   * @param visited: Set of already visited tile index
   */
  normalizeElevation(i: number, j: number, zLimit: number, visited: Set<number>): void {
    const index = this.tilemap.coordsToIndex(i, j);
    if (index !== -1 && !visited.has(index)) {
      const elevation = this.tilemap.getElevationAt(i, j);
      if (this.#direction === 1 && elevation < zLimit) {
        visited.add(index);
        // Raising terrain, tile is too low
        this.tilemap.raiseAt(index);
        this.normalizeElevation(i - 1, j, elevation, visited);
        this.normalizeElevation(i + 1, j, elevation, visited);
        this.normalizeElevation(i, j - 1, elevation, visited);
        this.normalizeElevation(i, j + 1, elevation, visited);
      } else if (this.#direction === -1 && elevation > zLimit) {
        visited.add(index);
        // Lowering terrain, tile is too high
        this.tilemap.digAt(index);
        this.normalizeElevation(i - 1, j, elevation, visited);
        this.normalizeElevation(i + 1, j, elevation, visited);
        this.normalizeElevation(i, j - 1, elevation, visited);
        this.normalizeElevation(i, j + 1, elevation, visited);
      } else {
        return;
      }
      // Rewrite the tile, so elevation can be applied (the tileId may be different)
      this.tilemap.setTileAt(i, j, this.tilemap.getTileAt(i, j));
    }
  }
}
