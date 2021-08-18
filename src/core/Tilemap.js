import * as PIXI from 'pixi.js';
import { game } from './Game';
import { Tileset } from './Tileset';

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
        this.updateHoveredTile(this.#selectedTileId);
      }
    }
  }

  onMouseDown() {
    this.#isMousePressed = true;
    this.updateHoveredTile(this.#selectedTileId);
  }

  onMouseUp() {
    this.#isMousePressed = false;
  }

  setScale(ratio) {
    this.width = this.pixelWidth * ratio;
    this.height = this.pixelHeight * ratio;
  }

  setTileAt(i, j, tileId) {
    if (i >= 0 && i < this.mapWidth && j >= 0 && j < this.mapHeight) {
      const index = j * this.mapWidth + i;
      const sprite = this.#tiles[index];
      sprite.texture = this.#tileset.getTileTexture(tileId);
      sprite.tileId = tileId;
      this.saveToLocalStorage();
    }
  }

  getTileAt(i, j) {
    if (i >= 0 && i < this.mapWidth && j >= 0 && j < this.mapHeight) {
      return this.#tiles[j * this.mapWidth + i].tileId;
    }
    return null;
  }

  /**
   * Put a Road tile at given coords
   */
  setRoadAt(i, j) {
    // Check the 4 surrounding tiles: Up, Down, Left, Right
    const neighbors = [
      this.isRoad(i, j - 1),
      this.isRoad(i, j + 1),
      this.isRoad(i - 1, j),
      this.isRoad(i + 1, j),
    ];

    // [True, False, False, True] => '1001'
    const key = neighbors.map((flag) => (flag ? 1 : 0)).join('');

    // Select tile connecting with neighbor tiles
    const tileId = Tileset.RoadNeighbors[key];
    this.setTileAt(i, j, tileId);
  }

  /**
   * Check if tile at coords is a road
   */
  isRoad(i, j) {
    const tileId = this.getTileAt(i, j);
    return tileId !== null && Tileset.isRoad(tileId);
  }

  /**
   * Update the texture of the tile under cursor
   * @param tileId: tile id in tileset for texture source
   */
  updateHoveredTile(tileId) {
    if (this.#hoveredTile) {
      const { i, j } = this.#hoveredTile;
      const previousTileId = this.getTileAt(i, j);
      if (Tileset.isRoad(tileId)) {
        // When tileId is a road, use smart selection instead of tileId argument
        this.setRoadAt(i, j);
      } else {
        this.setTileAt(i, j, tileId);
      }

      // When adding or removing a road tile: check road neighbors for update
      if (Tileset.isRoad(tileId) || Tileset.isRoad(previousTileId)) {
        if (this.isRoad(i - 1, j)) {
          this.setRoadAt(i - 1, j);
        }
        if (this.isRoad(i + 1, j)) {
          this.setRoadAt(i + 1, j);
        }
        if (this.isRoad(i, j - 1)) {
          this.setRoadAt(i, j - 1);
        }
        if (this.isRoad(i, j + 1)) {
          this.setRoadAt(i, j + 1);
        }
      }
    }
  }
}
