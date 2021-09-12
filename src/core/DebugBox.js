import * as PIXI from 'pixi.js';
import { game } from '@src/core/Game';

/**
 * Display information on hovered tile
 * Listen to 'tile_pointed' event
 */
export class DebugBox extends PIXI.Container {
  #bg;
  #labelCoords;
  #labelTileId;
  #labelElevation;

  constructor() {
    super();

    this.#bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#bg.alpha = 0.5;
    this.#bg.width = 150;
    this.#bg.height = 76;
    this.addChild(this.#bg);

    this.#labelCoords = new PIXI.Text('', { fontSize: 14 });
    this.#labelCoords.position = { x: 10, y: 10 };
    this.#labelTileId = new PIXI.Text('', { fontSize: 14 });
    this.#labelTileId.position = { x: 10, y: 30 };
    this.#labelElevation = new PIXI.Text('', { fontSize: 14 });
    this.#labelElevation.position = { x: 10, y: 50 };
    this.addChild(this.#labelCoords, this.#labelTileId, this.#labelElevation);
    this.visible = false;

    game.on('tile_pointed', (info) => {
      if (info) {
        this.visible = true;
        this.#labelCoords.text = `Coords: i:${info.i}; j:${info.j}`;
        this.#labelTileId.text = `Tile ID: ${info.tileId} (${info.tileDesc})`;
        this.#labelElevation.text = `Tile Elevation: ${info.elevation}`;
      } else {
        this.visible = false;
      }
    });
  }
}
