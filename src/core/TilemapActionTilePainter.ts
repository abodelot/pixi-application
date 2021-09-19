import * as PIXI from 'pixi.js';
import { sound } from '@pixi/sound';

import { Tilemap } from './Tilemap';
import { TilemapActionBase } from './TilemapActionBase';
import { Coords } from './Types';

/**
 * Action for replacing all tiles in the selected rectangle area with selected tile id
 */
export class TilemapActionTilePainter extends TilemapActionBase {
  #graphics: PIXI.Graphics;
  #start: Coords = { i: 0, j: 0 };
  #end: Coords = { i: 0, j: 0 };
  #tileId: number;

  constructor(tilemap: Tilemap, tileId: number) {
    super(tilemap);
    this.#tileId = tileId;
    this.#graphics = new PIXI.Graphics();
  }

  onTilePressed(i: number, j: number): void {
    this.#start = { i, j };
    this.#end = this.#start;
    this.tilemap.addChild(this.#graphics);
  }

  onTileDragged(i: number, j: number): void {
    this.#end = { i, j };
    this.buildPreview(Coords.min(this.#start, this.#end), Coords.max(this.#start, this.#end));
  }

  onTileReleased(): void {
    this.tilemap.removeChild(this.#graphics);
    this.#graphics.clear();
    this.applyTileId(Coords.min(this.#start, this.#end), Coords.max(this.#start, this.#end));
  }

  /**
   * @param si, sj: start i, j coords
   * @param ei, ej: end i, j coords
   */
  buildPreview(start: Coords, end: Coords): void {
    this.#graphics.clear();
    for (let i = start.i; i <= end.i; ++i) {
      for (let j = start.j; j <= end.j; ++j) {
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
   * @param start: start point (rectangle top-left)
   * @param end: end point (rectangle bottom-right)
   */
  applyTileId(start: Coords, end: Coords): void {
    for (let i = start.i; i <= end.i; ++i) {
      for (let j = start.j; j <= end.j; ++j) {
        this.tilemap.setTileAt(i, j, this.#tileId);
      }
    }
    sound.play('tilemap-tile');
    this.tilemap.putSpecialTiles(start.i - 1, start.j - 1, end.i + 1, end.j + 1);
    this.tilemap.redrawTilemap();
  }
}
