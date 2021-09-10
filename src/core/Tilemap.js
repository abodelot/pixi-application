import * as PIXI from 'pixi.js';
import { game } from './Game';
import { Tileset } from './Tileset';

export const MAX_ELEVATION = 15;

export class Tilemap extends PIXI.Container {
  #background;
  #cols;
  #rows;
  #tileIds;
  #tileElevations;
  #tileGraphics;
  #tileset;
  #hoveredTile;
  #cursor;
  #currentTool; // { type: terrain|elevation }
  #cursorTextures;

  constructor(tileset) {
    super();
    this.#tileset = tileset;
    this.#background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#background.tint = 0x000000;
    this.addChild(this.#background);

    this.#tileGraphics = new PIXI.Graphics();
    this.addChild(this.#tileGraphics);

    const tw = this.#tileset.tileWidth;
    this.#cursorTextures = {};
    const cursorTexture = game.getTexture('cursor.png');
    // Extract cursors from the cursor spritesheet.
    // Cursors are 'precut' to fit the hovered tile, even when the tile is
    // partially hidden by neighbor tiles with a higher elevation:
    // - East (i+1, with z+1)
    // - West (j+1, with z+1),
    // - South (i+1, j+1 with z+1)
    // - any combination of those three directions
    // - South x2 (i+1, j+1, with z+2)
    // The cursor can then be drawn on top of the tilemap, without hidding
    // the neighbor tiles which are supposed to look in front of the cursor.
    ['FULL', 'E', 'W', 'ES', 'SW', 'S', 'EW', 'SS'].forEach((key, index) => {
      this.#cursorTextures[key] = new PIXI.Texture(
        cursorTexture,
        new PIXI.Rectangle(tw * index, 0, tw, cursorTexture.height),
      );
    });
    this.#cursor = new PIXI.Sprite(this.#cursorTextures.FULL);
    this.addChild(this.#cursor);

    // Allow mouse interaction
    this.interactive = true;
    this.on('pointermove', this.onMouseMove.bind(this));
    this.on('pointerdown', this.onMouseDown.bind(this));

    this.#hoveredTile = null;
    this.#currentTool = { type: 'terrain', tileId: 0 };

    game.on('tile_id_selected', (tileId) => {
      this.#currentTool = { type: 'terrain', tileId };
    });
    game.on('elevation_selected', (direction) => {
      this.#currentTool = { type: 'elevation', direction };
    });
  }

  get tileIds() { return this.#tileIds; }
  get nbCols() { return this.#cols; }
  get nbRows() { return this.#rows; }
  get tileset() { return this.#tileset; }

  /**
   * Load a tilemap
   * @param {array} tileIds: Array of ids, sized cols*rows
   * @param {array} tileElevations: Array of elevations, sized cols*rows
   * @param {int} cols: number of cols
   * @param {int} rows: number of rows
   */
  load(tileIds, tileElevations, cols, rows) {
    this.#cols = cols;
    this.#rows = rows;
    this.#tileIds = tileIds;
    this.#tileElevations = tileElevations;

    // Compute size of the bounding box
    this.pixelWidth = (cols + rows) * this.#tileset.tileWidth / 2;
    this.pixelHeight = (cols + rows) * this.#tileset.tileHeight / 2;

    // Resize the tilemap background sprite
    this.#background.width = this.pixelWidth;
    this.#background.height = this.pixelHeight;

    this.putSpecialTiles();
    this.redrawTilemap();
    this.refreshPointerSelection();
  }

  /**
   * Redraw all tiles. This clear and repopulate the Graphics object.
   */
  redrawTilemap() {
    this.#tileGraphics.clear();
    for (let j = 0; j < this.#rows; ++j) {
      for (let i = 0; i < this.#cols; ++i) {
        const index = j * this.#cols + i;
        this.drawTile(i, j, this.#tileIds[index], this.#tileElevations[index]);
      }
    }
  }

  drawTile(i, j, tileId, elevation) {
    // Tile position in the tilemap
    const pos = this.coordsToPixels(i, j);

    // Move tile 'upwards' to apply elevation
    pos.y -= this.#tileset.tileThickness * elevation;

    const tileTexture = this.#tileset.getTileTexture(tileId);
    this.#tileGraphics.beginTextureFill({
      texture: tileTexture,
      matrix: new PIXI.Matrix().translate(pos.x, pos.y),
    });
    this.#tileGraphics.drawRect(pos.x, pos.y, tileTexture.width, tileTexture.height + 0.5);
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
        this.load(data.tiles, data.elevations, data.width, data.height);
      } catch (e) {
        console.error('Cannot load map from localStorage');
        console.error(e);
        return false;
      }
      console.log(`loaded map ${this.#rows}x${this.#cols}`);
      return true;
    }

    return false;
  }

  saveToLocalStorage() {
    const data = {
      width: this.#cols,
      height: this.#rows,
      elevations: this.#tileElevations,
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
    x -= this.#rows * this.#tileset.tileWidth * 0.5;

    return {
      i: Math.floor((y + Math.floor(x / 2)) / this.#tileset.tileHeight),
      j: Math.floor((y - Math.floor(x / 2)) / this.#tileset.tileHeight),
    };
  }

  /**
   * Convert position in pixels to 2d array index
   * @return {i, j}
   */
  pixelsToCoordsWithElevation(x, y) {
    const thickness = this.#tileset.tileThickness;

    for (let layer = MAX_ELEVATION; layer > 0; --layer) {
      // Tile at elevation N can hide tiles at elevation N-1
      // Start with the highest elevation, and check if a tile is hovered.
      // The mouse y position is adjusted according to the elevation.
      const y2 = y + (layer * thickness);
      const { i, j } = this.pixelsToCoords(x, y2);
      const index = this.coordsToIndex(i, j);
      const elevation = this.#tileElevations[index];
      if (elevation === layer) {
        return { i, j, elevation };
      }
    }

    // Now scanning at elevation 0
    const { i, j } = this.pixelsToCoords(x, y);
    const elevation = this.getElevationAt(i, j);
    if (elevation > 0) {
      // The tile located at the mouse position is above elevation 0, but we did not
      // match any when scanning the elevation layers above!
      // This happens when mouse is hovering the "thick" side of a tile.
      // That's because pixelsToCoords only works with the "top" side of the tile.
      return null;
    }
    return { i, j, elevation: 0 };
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

  /**
   * Convert 2D coords to 1D index
   */
  coordsToIndex(i, j) {
    if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
      return j * this.#cols + i;
    }
    return -1;
  }

  onMouseMove(event) {
    const position = event.data.getLocalPosition(this);
    const isSelected = this.selectTileAtPosition(position.x, position.y);
    if (isSelected && event.data.pressure > 0) {
      this.applyToolOnHoveredTile();
    }
  }

  /**
   * Display tile cursor on the tile under the mouse
   * @param x, y: mouse position
   * @param forceRefresh: recompute selected tile, even if mouse didn't move
   * @return true if a tile is selected, otherwise false
   */
  selectTileAtPosition(x, y, forceRefresh = false) {
    // Check cursor is over tilemap area
    if (x >= 0 && y >= 0 && x < this.pixelWidth && y < this.pixelHeight) {
      const res = this.pixelsToCoordsWithElevation(x, y);
      if (res == null) {
        this.#hoveredTile = null;
        this.#cursor.visible = false;
        return false;
      }
      const { i, j, elevation } = res;

      if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
        // Early return: same tile
        if (!forceRefresh && this.#hoveredTile
            && i === this.#hoveredTile.i && j === this.#hoveredTile.j) {
          return false;
        }
        this.#hoveredTile = { i, j };

        this.#cursor.position = this.coordsToPixels(i, j);
        // Cursor tiles don't have a thickness. Adjust position to make them fit
        // tiles from the tileset.
        this.#cursor.position.y -= elevation * this.#tileset.tileThickness;

        // Adapt cursor image according to elevation neighbors
        let z;
        const hideWest = (z = this.getElevationAt(i, j + 1)) && z && z > elevation;
        const hideEast = (z = this.getElevationAt(i + 1, j)) && z && z > elevation;
        const hideSouth = (z = this.getElevationAt(i + 1, j + 1)) && z && z > elevation;
        // South2: check if higher by at least 2 units of elevation
        const hideSouth2 = (z = this.getElevationAt(i + 1, j + 1)) && z && z > elevation + 1;

        if (hideSouth2) {
          this.#cursor.texture = this.#cursorTextures.SS;
        } else if (hideEast && hideWest) {
          this.#cursor.texture = this.#cursorTextures.EW;
        } else if (hideEast && hideSouth) {
          this.#cursor.texture = this.#cursorTextures.ES;
        } else if (hideWest && hideSouth) {
          this.#cursor.texture = this.#cursorTextures.SW;
        } else if (hideEast) {
          this.#cursor.texture = this.#cursorTextures.E;
        } else if (hideSouth) {
          this.#cursor.texture = this.#cursorTextures.S;
        } else if (hideWest) {
          this.#cursor.texture = this.#cursorTextures.W;
        } else {
          this.#cursor.texture = this.#cursorTextures.FULL;
        }

        this.#cursor.visible = true;
        return true;
      }
      this.#hoveredTile = null;
      this.#cursor.visible = false;
    }
    return false;
  }

  refreshPointerSelection() {
    // Fetch mouse position, and recompute which tile is hovered
    const pos = this.toLocal(game.app.renderer.plugins.interaction.mouse.global);
    this.selectTileAtPosition(pos.x, pos.y, true);
  }

  onMouseDown(event) {
    // Left click
    if (event.data.button === 0) {
      this.applyToolOnHoveredTile();
    }
  }

  setTileAt(i, j, tileId) {
    const index = this.coordsToIndex(i, j);
    if (index !== -1) {
      tileId = Tileset.getElevatedTileId(tileId, this.#tileElevations[index]);
      if (this.#tileIds[index] !== tileId) {
        this.#tileIds[index] = tileId;
        game.emit('tilemap_updated', { index, tileId });
      }
    }
  }

  getTileAt(i, j) {
    const index = this.coordsToIndex(i, j);
    if (index !== -1) {
      return this.#tileIds[index];
    }
    return null;
  }

  getElevationAt(i, j) {
    const index = this.coordsToIndex(i, j);
    if (index !== -1) {
      return this.#tileElevations[index];
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
   * @param i, j: tile coords
   * @param checkTypeFn: callback function that check if tile matches the expected type
   * @param neighborAtlas: list of neighbor tile ids, defined in Tileset
   */
  setSmartTileAt(i, j, checkTypeFn, neighborAtlas) {
    // Check the 4 surrounding tiles: Up, Right, Down, Left
    const neighbors = [
      checkTypeFn(i, j - 1),
      checkTypeFn(i + 1, j),
      checkTypeFn(i, j + 1),
      checkTypeFn(i - 1, j),
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

  updateTileElevationAt(i, j, direction) {
    const index = this.coordsToIndex(i, j);
    const visited = new Set();
    const elevation = this.#tileElevations[index];
    if (direction === 'raise' && elevation < MAX_ELEVATION) {
      this.normalizeElevation(i, j, elevation + 1, 1, visited);
    } else if (direction === 'dig' && elevation > 0) {
      this.normalizeElevation(i, j, elevation - 1, -1, visited);
    }

    // Refresh cursor selection: map geometry has changed and cursor could be
    // now hovering a different tile than before!
    this.refreshPointerSelection();
  }

  /**
   * Recursive function for handling elevation gradually. Ensure each tile
   * neighbor has an elevation of +/- 1 (no "cliff")
   * @param i, j: tile coords
   * @param zLimit: min (raising) or max (digging) allowed elevation for tile
   * @param dir: 1 for raising, -1 for digging
   * @param visited: Set of already visited tile index
   */
  normalizeElevation(i, j, zLimit, dir, visited) {
    const index = this.coordsToIndex(i, j);
    if (index !== -1 && !visited.has(index)) {
      const elevation = this.#tileElevations[index];
      if (dir === 1 && elevation < zLimit) {
        visited.add(index);
        // Raising terrain, tile is too low
        zLimit = this.#tileElevations[index]++;
        this.normalizeElevation(i - 1, j, zLimit, dir, visited);
        this.normalizeElevation(i + 1, j, zLimit, dir, visited);
        this.normalizeElevation(i, j - 1, zLimit, dir, visited);
        this.normalizeElevation(i, j + 1, zLimit, dir, visited);
      } else if (dir === -1 && elevation > zLimit) {
        visited.add(index);
        // Lowering terrain, tile is too high
        zLimit = this.#tileElevations[index]--;
        this.normalizeElevation(i - 1, j, zLimit, dir, visited);
        this.normalizeElevation(i + 1, j, zLimit, dir, visited);
        this.normalizeElevation(i, j - 1, zLimit, dir, visited);
        this.normalizeElevation(i, j + 1, zLimit, dir, visited);
      } else {
        return;
      }
      // Rewrite the tile, so elevation can be applied (different tileId)
      this.setTileAt(i, j, this.#tileIds[index]);
    }
  }

  /**
   * Apply current editor tool on the tile under cursor
   */
  applyToolOnHoveredTile() {
    if (this.#hoveredTile) {
      const { i, j } = this.#hoveredTile;

      if (this.#currentTool.type === 'terrain') {
        const { tileId } = this.#currentTool;
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
      } else if (this.#currentTool.type === 'elevation') {
        this.updateTileElevationAt(i, j, this.#currentTool.direction);
      }
      this.redrawTilemap();
    }
  }

  /**
   * Look for basic tiles and replace them with specific tiles of same kind (texture
   * transition, etc.)
   */
  putSpecialTiles() {
    for (let j = 0; j < this.#rows; ++j) {
      for (let i = 0; i < this.#cols; ++i) {
        const index = this.coordsToIndex(i, j);
        if (this.#tileIds[index] === Tileset.WaterBase) {
          this.setWaterAt(i, j);
        }
      }
    }
  }
}
