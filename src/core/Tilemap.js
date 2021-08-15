import * as PIXI from 'pixi.js';
import { game } from './Game';

export class Tilemap extends PIXI.Container {
  #background;
  #tiles = [];
  #tileset;
  #hoveredTile;
  #selectedTileId;
  #cursor;
  #isMousePressed;

  constructor(tileset) {
    super();
    this.#tileset = tileset;
    this.#background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#background.tint = 0x000000;
    this.#background.width = 120;
    this.#background.height = 200;
    this.addChild(this.#background);

    // Allow mouse interaction
    this.interactive = true;
    this.on('mousemove', this.onMouseMove.bind(this));
    this.on('mousedown', this.onMouseDown.bind(this));
    this.on('mouseup', this.onMouseUp.bind(this));

    this.#hoveredTile = null;
    this.#selectedTileId = 0;
    this.#isMousePressed = false;

    game.on('tile_id_selected', (tileId) => {
      this.#selectedTileId = tileId;
    });
  }

  /**
   * Load a tilemap from an array of tile ids
   */
  load(tiles, mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.#tiles = [];

    for (let j = 0; j < mapHeight; ++j) {
      for (let i = 0; i < mapWidth; ++i) {
        const index = j * mapWidth + i;
        const id = tiles[index];
        const sprite = new PIXI.Sprite(this.#tileset.getTileTexture(id));

        sprite.position = this.coordsToPixels(i, j);
        sprite.tileId = id;
        this.#tiles.push(sprite);

        this.addChild(sprite);
      }
    }

    // Compute size of the bounding box
    this.pixelWidth = (mapWidth + mapHeight) * this.#tileset.tileWidth / 2;
    this.pixelHeight = (mapWidth + mapHeight) * this.#tileset.tileHeight / 2;

    // Resize the tilemap background sprite
    this.#background.width = this.pixelWidth;
    this.#background.height = this.pixelHeight;

    this.setScale(2);

    const cursorTexture = game.getTexture('cursor.png');
    cursorTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.#cursor = new PIXI.Sprite(cursorTexture);
    this.addChild(this.#cursor);
    this.#cursor.position = this.coordsToPixels(0, 0);
  }

  /**
   * Load the tilemap from the browser localStorage
   * @return true if map loaded, otherwise false
   */
  loadFromLocalStorage() {
    if (localStorage.map) {
      try {
        const data = JSON.parse(localStorage.map);
        this.load(data.tiles, data.width, data.height);
      } catch (e) {
        console.log(e);
        return false;
      }
      return true;
    }
    return false;
  }

  saveToLocalStorage() {
    const data = {
      width: this.mapWidth,
      height: this.mapHeight,
      tiles: this.#tiles.map((sprite) => (sprite.tileId)),
    };

    localStorage.map = JSON.stringify(data);
    console.log('Tilemap saved');
  }

  /**
   * Convert position in pixels to 2d array index
   * @return {i, j}
   */
  pixelsToCoords(x, y) {
    x -= this.#tileset.tileWidth / 2;
    x -= (this.mapHeight - 1) * this.#tileset.tileWidth * 0.5;

    return {
      i: Math.floor((y + Math.floor(x / 2)) / this.#tileset.tileHeight),
      j: Math.floor((y - Math.floor(x / 2)) / this.#tileset.tileHeight),
    };
  }

  /**
   * Convert 2d array index to position in pixels
   * @return {x, y}
   */
  coordsToPixels(i, j) {
    return {
      x: (i * this.#tileset.tileWidth * 0.5) - (j * this.#tileset.tileWidth * 0.5)
        + ((this.mapHeight - 1) * this.#tileset.tileWidth * 0.5),
      y: (i * this.#tileset.tileHeight * 0.5) + (j * this.#tileset.tileHeight * 0.5),
    };
  }

  onMouseMove(event) {
    const position = event.data.getLocalPosition(this);
    // Check cursor is over tilemap area
    if (position.x >= 0 && position.y >= 0
        && position.x < this.pixelWidth && position.y < this.pixelHeight) {
      const coords = this.pixelsToCoords(position.x, position.y);
      if (coords.i >= 0 && coords.i < this.mapWidth && coords.j >= 0 && coords.j < this.mapHeight) {
        this.#hoveredTile = coords;
        this.#cursor.position = this.coordsToPixels(coords.i, coords.j);
        this.#cursor.visible = true;
      } else {
        this.#hoveredTile = null;
        this.#cursor.visible = false;
      }

      if (this.#isMousePressed) {
        this.updateHoveredTile();
      }
    }
  }

  onMouseDown() {
    this.#isMousePressed = true;
    this.updateHoveredTile();
  }

  onMouseUp() {
    this.#isMousePressed = false;
  }

  setScale(ratio) {
    this.width = this.pixelWidth * ratio;
    this.height = this.pixelHeight * ratio;
  }

  /**
   * Update the texture of the tile under cursor with selectedTileId
   */
  updateHoveredTile() {
    if (this.#hoveredTile
        && this.#hoveredTile.i >= 0 && this.#hoveredTile.i < this.mapWidth
        && this.#hoveredTile.j >= 0 && this.#hoveredTile.j < this.mapHeight) {
      const index = this.#hoveredTile.j * this.mapWidth + this.#hoveredTile.i;
      const sprite = this.#tiles[index];
      sprite.texture = this.#tileset.getTileTexture(this.#selectedTileId);
      sprite.tileId = this.#selectedTileId;
      this.saveToLocalStorage();
    }
  }
}
