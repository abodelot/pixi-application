import * as PIXI from 'pixi.js';

import { Tileset } from './Tileset';
import { TilemapActionBase } from './TilemapActionBase';

/**
 * Action for setting a path of road tiles
 */
export class TilemapActionRoad extends TilemapActionBase {
  #graphics;
  #start;
  #end;

  onTilePressed(i, j) {
    this.#start = { i, j };
    this.#end = this.#start;
    this.#graphics = new PIXI.Graphics();
    this.tilemap.addChild(this.#graphics);
  }

  onTileDragged(ei, ej) {
    this.#end = { i: ei, j: ej };
    this.#graphics.clear();
    // Draw cursor tiles to make a preview of the road
    this.getPath().forEach(({ i, j }) => {
      this.drawPreviewTile(i, j);
    });
  }

  onTileReleased() {
    // Put road tiles on tilemap
    this.getPath().forEach(({ i, j }) => {
      if (Tileset.isConstructible(this.tilemap.getTileAt(i, j))) {
        this.tilemap.setRoadAt(i, j);
      }
    });
    // Refresh all tiles surrounding the road
    this.tilemap.putSpecialTiles(
      Math.min(this.#start.i, this.#end.i) - 1,
      Math.min(this.#start.j, this.#end.j) - 1,
      Math.max(this.#start.i, this.#end.i) + 1,
      Math.max(this.#start.j, this.#end.j) + 1,
    );
    this.tilemap.redrawTilemap();
    this.tilemap.removeChild(this.#graphics);
  }

  /**
   * Get list of coords from #start to #end
   * @return Array of { i, j } coords
   */
  getPath() {
    let { i, j } = this.#start;
    const di = i < this.#end.i ? 1 : -1;
    const dj = j < this.#end.j ? 1 : -1;
    const path = [];
    for (; i !== this.#end.i; i += di) {
      path.push({ i, j });
    }
    for (; j !== this.#end.j; j += dj) {
      path.push({ i, j });
    }
    path.push({ i, j });
    return path;
  }

  drawPreviewTile(i, j) {
    const texture = this.tilemap.getTileCursorTexture(i, j);
    const color = Tileset.isConstructible(this.tilemap.getTileAt(i, j)) ? 0xffffff : 0xff0000;
    const pos = this.tilemap.coordsToPixels(i, j);
    this.#graphics.beginTextureFill({
      texture,
      color,
      matrix: new PIXI.Matrix().translate(pos.x, pos.y),
    });
    this.#graphics.drawRect(pos.x, pos.y, texture.width, texture.height);
    this.#graphics.endFill();
  }
}
