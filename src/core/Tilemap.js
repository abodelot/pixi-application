import * as PIXI from 'pixi.js';
import { game } from './Game';
import { Tileset } from './Tileset';

export class Tilemap extends PIXI.Container {
  #background;
  #cols;
  #rows;
  #tileIds;
  #tileGraphics;
  #tileset;
  #hoveredTile;
  #selectedTileId;
  #cursor;

  constructor(tileset) {
    super();
    this.#tileset = tileset;
    this.#background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#background.tint = 0x000000;
    this.addChild(this.#background);

    this.#tileGraphics = new PIXI.Graphics();
    this.addChild(this.#tileGraphics);

    const cursorTexture = game.getTexture('cursor.png');
    this.#cursor = new PIXI.Sprite(cursorTexture);
    this.addChild(this.#cursor);

    // Allow mouse interaction
    this.interactive = true;
    this.on('pointermove', this.onMouseMove.bind(this));
    this.on('pointerdown', this.onMouseDown.bind(this));

    this.#hoveredTile = null;
    this.#selectedTileId = 0;

    game.on('tile_id_selected', (tileId) => {
      this.#selectedTileId = tileId;
    });
  }

  get tileIds() { return this.#tileIds; }
  get nbCols() { return this.#cols; }
  get nbRows() { return this.#rows; }

  /**
   * Load a tilemap from an array of tile ids
   */
  load(tileIds, cols, rows) {
    this.#cols = cols;
    this.#rows = rows;
    this.#tileIds = tileIds;

    // Compute size of the bounding box
    this.pixelWidth = (cols + rows) * this.#tileset.tileWidth / 2;
    this.pixelHeight = (cols + rows) * this.#tileset.tileHeight / 2;

    // Resize the tilemap background sprite
    this.#background.width = this.pixelWidth;
    this.#background.height = this.pixelHeight;

    // Draw all the tiles inside tileGraphics object
    this.#tileGraphics.clear();
    for (let j = 0; j < rows; ++j) {
      for (let i = 0; i < cols; ++i) {
        const index = j * cols + i;
        this.drawTile(i, j, tileIds[index]);
      }
    }

    this.setScale(2);
    this.#cursor.position = this.coordsToPixels(0, 0);
  }

  drawTile(i, j, tileId) {
    // Tile position
    const { x, y } = this.coordsToPixels(i, j);
    this.#tileGraphics.beginTextureFill({
      texture: this.#tileset.getTileTexture(tileId),
      matrix: new PIXI.Matrix().translate(x, y),
    });
    this.#tileGraphics.drawRect(x, y, this.#tileset.tileWidth, this.#tileset.tileHeight);
    this.#tileGraphics.endFill();
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
      width: this.#cols,
      height: this.#rows,
      tiles: this.#tileIds,
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
    x -= (this.#rows - 1) * this.#tileset.tileWidth * 0.5;

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
        + ((this.#rows - 1) * this.#tileset.tileWidth * 0.5),
      y: (i * this.#tileset.tileHeight * 0.5) + (j * this.#tileset.tileHeight * 0.5),
    };
  }

  onMouseMove(event) {
    const position = event.data.getLocalPosition(this);
    // Check cursor is over tilemap area
    if (position.x >= 0 && position.y >= 0
        && position.x < this.pixelWidth && position.y < this.pixelHeight) {
      const coords = this.pixelsToCoords(position.x, position.y);
      if (coords.i >= 0 && coords.i < this.#cols && coords.j >= 0 && coords.j < this.#rows) {
        this.#hoveredTile = coords;
        this.#cursor.position = this.coordsToPixels(coords.i, coords.j);
        this.#cursor.visible = true;
      } else {
        this.#hoveredTile = null;
        this.#cursor.visible = false;
      }

      if (event.data.pressure > 0) {
        this.updateHoveredTile(this.#selectedTileId);
      }
    }
  }

  onMouseDown(event) {
    // Left click
    if (event.data.button === 0) {
      this.updateHoveredTile(this.#selectedTileId);
    }
  }

  setScale(ratio) {
    this.width = this.pixelWidth * ratio;
    this.height = this.pixelHeight * ratio;
  }

  setTileAt(i, j, tileId) {
    if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
      const index = j * this.#cols + i;
      if (this.#tileIds[index] !== tileId) {
        // Redraw tile and update tileIds array
        this.drawTile(i, j, tileId);
        this.#tileIds[index] = tileId;

        game.emit('tilemap_updated', { index, tileId });
      }
    }
  }

  getTileAt(i, j) {
    if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
      return this.#tileIds[j * this.#cols + i];
    }
    return null;
  }

  /**
   * Put a Road tile at given coords
   */
  setRoadAt(i, j) {
    this.setSmartTileAt(i, j, this.isRoad.bind(this), Tileset.RoadNeighbors);
  }

  setWaterAt(i, j) {
    this.setSmartTileAt(i, j, this.isWater.bind(this), Tileset.WaterNeighbors);
  }

  /**
   * Put a tile connecting with the 4 surrounding tiles
   * @param i, j: tile cords
   * @param checkTypeFn: callback function that check if tile matches the expected type
   * @param neighborAtlas: list of neighbor tile ids, defined in Tileset
   */
  setSmartTileAt(i, j, checkTypeFn, neighborAtlas) {
    // Check the 4 surrounding tiles: Up, Down, Left, Right
    const neighbors = [
      checkTypeFn(i, j - 1),
      checkTypeFn(i, j + 1),
      checkTypeFn(i - 1, j),
      checkTypeFn(i + 1, j),
    ];

    // [True, False, False, True] => '1001'
    const key = neighbors.map((flag) => (flag ? 1 : 0)).join('');

    // Select tile connecting with neighbor tiles
    const tileId = neighborAtlas[key];
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
   * Check if tile at coords is water
   */
  isWater(i, j) {
    const tileId = this.getTileAt(i, j);
    // Water is supposed to continue over map limits: null is considered as water
    return tileId == null || Tileset.isWater(tileId);
  }

  /**
   * Update the texture of the tile under cursor
   * @param tileId: tile id in tileset for texture source
   */
  updateHoveredTile(tileId) {
    if (this.#hoveredTile) {
      const { i, j } = this.#hoveredTile;
      const previousTileId = this.getTileAt(i, j);
      // If tileId is a special type, use smart selection instead of tileId argument
      if (Tileset.isRoad(tileId)) {
        this.setRoadAt(i, j);
      } else if (Tileset.isWater(tileId)) {
        this.setWaterAt(i, j);
      } else {
        this.setTileAt(i, j, tileId);
      }

      // When adding or removing a special tile: check same-type neighbors for update
      if (Tileset.isRoad(tileId) || Tileset.isRoad(previousTileId)) {
        if (this.isRoad(i - 1, j)) this.setRoadAt(i - 1, j);
        if (this.isRoad(i + 1, j)) this.setRoadAt(i + 1, j);
        if (this.isRoad(i, j - 1)) this.setRoadAt(i, j - 1);
        if (this.isRoad(i, j + 1)) this.setRoadAt(i, j + 1);
      }
      if (Tileset.isWater(tileId) || Tileset.isWater(previousTileId)) {
        if (this.isWater(i - 1, j)) this.setWaterAt(i - 1, j);
        if (this.isWater(i + 1, j)) this.setWaterAt(i + 1, j);
        if (this.isWater(i, j - 1)) this.setWaterAt(i, j - 1);
        if (this.isWater(i, j + 1)) this.setWaterAt(i, j + 1);
      }
    }
  }
}
