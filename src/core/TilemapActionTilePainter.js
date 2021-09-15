import * as PIXI from 'pixi.js';

import { TilemapActionBase } from './TilemapActionBase';

/**
 * Action for replacing all tiles in the selected rectangle area with selected tile id
 */
export class TilemapActionTilePainter extends TilemapActionBase {
  #graphics;
  #start;
  #end;
  #tileId;

  constructor(tilemap, tileId) {
    super(tilemap);
    this.#tileId = tileId;
  }

  onTilePressed(i, j) {
    this.#start = { i, j };
    this.#end = this.#start;
    this.#graphics = new PIXI.Graphics();
    this.tilemap.addChild(this.#graphics);
  }

  onTileDragged(i, j) {
    this.#end = { i, j };

    this.buildPreview(
      Math.min(this.#start.i, this.#end.i),
      Math.min(this.#start.j, this.#end.j),
      Math.max(this.#start.i, this.#end.i),
      Math.max(this.#start.j, this.#end.j),
    );
  }

  onTileReleased() {
    this.tilemap.removeChild(this.#graphics);
    this.applyTileId(
      Math.min(this.#start.i, this.#end.i),
      Math.min(this.#start.j, this.#end.j),
      Math.max(this.#start.i, this.#end.i),
      Math.max(this.#start.j, this.#end.j),
    );
  }

  /**
   * @param si, sj: start i, j coords
   * @param ei, ej: end i, j coords
   */
  buildPreview(si, sj, ei, ej) {
    this.#graphics.clear();
    for (let i = si; i <= ei; ++i) {
      for (let j = sj; j <= ej; ++j) {
        const texture = this.tilemap.getTileCursorTexture(i, j);
        const pos = this.tilemap.coordsToPixels(i, j);
        this.#graphics.beginTextureFill({
          texture,
          matrix: new PIXI.Matrix().translate(pos.x, pos.y),
        });
        this.#graphics.drawRect(pos.x, pos.y, texture.width, texture.height);
        this.#graphics.endFill();
      }
    }
  }

  /**
   * Paint rectangle area with selected tile id
   * @param si, sj: start point (rectangle top-left)
   * @param ei, ej: end point (rectangle bottom-right)
   */
  applyTileId(si, sj, ei, ej) {
    for (let i = si; i <= ei; ++i) {
      for (let j = sj; j <= ej; ++j) {
        this.tilemap.setTileAt(i, j, this.#tileId);
      }
    }
    this.tilemap.putSpecialTiles(si - 1, sj - 1, ei + 1, ej + 1);
    this.tilemap.redrawTilemap();
  }
}
