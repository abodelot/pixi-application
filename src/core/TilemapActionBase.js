/**
 * Base class for tilemap actions.
 * A TilemapAction is a tool triggered by the pointer on the tilemap
 */
export class TilemapActionBase {
  constructor(tilemap) {
    this.tilemap = tilemap;
  }

  /**
   * Pointer clicked on tile at i, j
   */
  onTilePressed() {
    return this;
  }

  /**
   * Pointer moved to tile at i, j while being pressed
   */
  onTileDragged() {
    return this;
  }

  /**
   * Pointer released
   */
  onTileReleased() {
    return this;
  }
}
