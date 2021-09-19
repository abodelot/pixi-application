import { Tilemap } from './Tilemap';

/**
 * Base class for tilemap actions.
 * A TilemapAction is a tool triggered by the pointer on the tilemap
 */
export abstract class TilemapActionBase {
  readonly tilemap: Tilemap;

  constructor(tilemap: Tilemap) {
    this.tilemap = tilemap;
  }

  /**
   * Pointer clicked on tile at i, j
   */
  abstract onTilePressed(i: number, j: number): void;

  /**
   * Pointer moved to tile at i, j while being pressed
   */
  abstract onTileDragged(i: number, j: number): void;

  /**
   * Pointer released
   */
  abstract onTileReleased(): void;
}
