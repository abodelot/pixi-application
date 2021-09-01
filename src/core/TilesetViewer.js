import * as PIXI from 'pixi.js';
import { Tileset } from './Tileset';
import { game } from './Game';

/**
 * Display the tileset image, and provide a tile cursor for selecting a tile
 */
export class TilesetViewer extends PIXI.Container {
  #tileset;
  #label;
  #cursorTile;
  #selectedTile;

  constructor(tileset) {
    super();
    this.#tileset = tileset;
    this.#label = new PIXI.Text('Selected tile: 0', { fontSize: 16 });
    this.addChild(this.#label);

    // Use a sprite to display the tileset texture
    this.sprite = new PIXI.Sprite(tileset.texture);
    this.sprite.y = this.#label.height + 10;
    this.addChild(this.sprite);

    const transparentTile = new PIXI.Texture(
      game.getTexture('cursor.png'),
      new PIXI.Rectangle(0, 0, 32, 17),
    );
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
    const th = this.#tileset.tileHeight + this.#tileset.tileThickness;
    const position = event.data.getLocalPosition(this.sprite);
    const x = Math.floor(position.x / this.#tileset.tileWidth) * this.#tileset.tileWidth;
    const y = Math.floor(position.y / th) * th;

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
    const j = Math.floor(position.y / (this.#tileset.tileHeight + this.#tileset.tileThickness));

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
