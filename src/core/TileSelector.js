import * as PIXI from 'pixi.js';
import { Tileset } from './Tileset';
import { game } from './Game';

export class TileSelector extends PIXI.Container {
  #tileset;
  #label;
  #cursorTile;
  #selectedTile;

  constructor(tileset) {
    super();
    this.#tileset = tileset;
    this.#label = new PIXI.Text('Selected tile: 0', { fontSize: 16 });
    this.addChild(this.#label);

    // Use a sprite to directly display the tileset texture
    this.sprite = new PIXI.Sprite(tileset.texture);
    this.sprite.y = this.#label.height;
    // Zoom 2x
    this.sprite.width = tileset.texture.width * 2;
    this.sprite.height = tileset.texture.height * 2;
    this.addChild(this.sprite);

    const transparentTile = game.getTexture('cursor.png');
    this.#cursorTile = new PIXI.Sprite(transparentTile);
    this.sprite.addChild(this.#cursorTile);

    this.#selectedTile = new PIXI.Sprite(transparentTile);
    this.#selectedTile.tint = 0xff0000;
    this.sprite.addChild(this.#selectedTile);

    this.sprite.interactive = true;
    this.sprite.on('pointermove', this.onMouseMove.bind(this));
    this.sprite.on('pointerdown', this.onMouseDown.bind(this));
  }

  onMouseMove(event) {
    // Constraint (x, y) to be a multiple of (tileWidth, tileHeight),
    // so 'cursorTile' sprite is positioned exactly over a tile
    const position = event.data.getLocalPosition(this.sprite);
    const x = Math.floor(position.x / this.#tileset.tileWidth) * this.#tileset.tileWidth;
    const y = Math.floor(position.y / this.#tileset.tileHeight) * this.#tileset.tileHeight;

    // Check position is over spritesheet
    if (x >= 0 && y >= 0 && x < this.sprite.width && y < this.sprite.height) {
      this.#cursorTile.x = x;
      this.#cursorTile.y = y;
    }
  }

  onMouseDown(event) {
    // Convert mouse position to tile coords
    const position = event.data.getLocalPosition(this.sprite);
    const i = Math.floor(position.x / this.#tileset.tileWidth);
    const j = Math.floor(position.y / this.#tileset.tileHeight);

    const tileId = this.#tileset.coordsToTileId(i, j);
    this.#label.text = `Selected tile: ${tileId}`;
    if (Tileset.isWater(tileId)) {
      this.#label.text += ' (Water)';
    } else if (Tileset.isRoad(tileId)) {
      this.#label.text += ' (Road)';
    }
    this.#selectedTile.position = this.#cursorTile.position;

    game.emit('tile_id_selected', tileId);
  }
}
