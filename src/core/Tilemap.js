import * as PIXI from 'pixi.js';
import { game } from './Game';
import { Tileset, MAX_ELEVATION } from './Tileset';

import { TilemapActionElevation } from './TilemapActionElevation';
import { TilemapActionRoad } from './TilemapActionRoad';
import { TilemapActionTilePainter } from './TilemapActionTilePainter';

export class Tilemap extends PIXI.Container {
  #background;
  #cols;
  #rows;
  #tileIds;
  #tileElevations;
  #terrainGraphics;
  #tileset;
  #action;
  #hoveredTile;
  #cursor;
  #cursorTextures;
  #isPressed;

  constructor(tileset) {
    super();
    this.#tileset = tileset;
    this.#background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#background.tint = 0x000000;
    this.addChild(this.#background);

    this.#terrainGraphics = new PIXI.Graphics();
    this.addChild(this.#terrainGraphics);

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
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointermove', this.onPointerMove.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUp.bind(this));

    this.#hoveredTile = null;

    this.#action = null;
    game.on('tile_id_selected', (tileId) => {
      this.#action = new TilemapActionTilePainter(this, tileId);
    });
    game.on('elevation_selected', (direction) => {
      this.#action = new TilemapActionElevation(this, direction === 'raise' ? 1 : -1);
    });
    game.on('road_selected', () => {
      this.#action = new TilemapActionRoad(this);
    });
  }

  get tileIds() { return this.#tileIds; }
  get nbCols() { return this.#cols; }
  get nbRows() { return this.#rows; }
  get tileset() { return this.#tileset; }

  onPointerDown(event) {
    // Left click
    if (event.data.button === 0 && this.#hoveredTile && this.#action) {
      this.#action.onTilePressed(this.#hoveredTile.i, this.#hoveredTile.j);
      this.#isPressed = true;
    }
  }

  onPointerMove(event) {
    const position = event.data.getLocalPosition(this);
    const newTileSelected = this.selectTileAtPosition(position.x, position.y);
    if (newTileSelected && this.#isPressed && this.#action) {
      this.#action.onTileDragged(this.#hoveredTile.i, this.#hoveredTile.j);
    }
  }

  onPointerUp(event) {
    if (event.data.button === 0) {
      if (this.#action && this.#isPressed) {
        this.#action.onTileReleased();
      }
      this.#isPressed = false;
    }
  }

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
    this.#terrainGraphics.clear();
    for (let j = 0; j < this.#rows; ++j) {
      for (let i = 0; i < this.#cols; ++i) {
        const index = j * this.#cols + i;
        this.drawTile(i, j, this.#tileIds[index]);
      }
    }
  }

  drawTile(i, j, tileId) {
    // Tile position in the tilemap
    const pos = this.coordsToPixels(i, j);
    const tileTexture = this.#tileset.getTileTexture(tileId);
    this.#terrainGraphics.beginTextureFill({
      texture: tileTexture,
      matrix: new PIXI.Matrix().translate(pos.x, pos.y),
    });
    this.#terrainGraphics.drawRect(pos.x, pos.y, tileTexture.width, tileTexture.height + 0.5);
    this.#terrainGraphics.endFill();
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
      y: (i * this.#tileset.tileHeight * 0.5) + (j * this.#tileset.tileHeight * 0.5)
        // Move upwards on y-axis to apply elevation
        - this.#tileset.tileThickness * this.getElevationAt(i, j),
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
        game.emit('tile_pointed', null);
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
        this.#cursor.texture = this.getTileCursorTexture(i, j);
        this.#cursor.visible = true;

        const tileId = this.tileIds[this.coordsToIndex(i, j)];
        game.emit('tile_pointed', {
          tileId, tileDesc: Tileset.tileDesc(tileId), elevation, i, j,
        });
        return true;
      }
      this.#hoveredTile = null;
      this.#cursor.visible = false;
    }
    game.emit('tile_pointed', null);
    return false;
  }

  refreshPointerSelection() {
    // Fetch mouse position, and recompute which tile is hovered
    const pos = this.toLocal(game.app.renderer.plugins.interaction.mouse.global);
    this.selectTileAtPosition(pos.x, pos.y, true);
  }

  /**
   * Get the texture for cursor when hovering a tile
   * @return PIXI.Texture
   */
  getTileCursorTexture(i, j) {
    const elevation = this.getElevationAt(i, j);
    // Adapt cursor image according to elevation neighbors
    let z;
    const hideWest = (z = this.getElevationAt(i, j + 1)) && z && z > elevation;
    const hideEast = (z = this.getElevationAt(i + 1, j)) && z && z > elevation;
    const hideSouth = (z = this.getElevationAt(i + 1, j + 1)) && z && z > elevation;
    // South2: check if higher by at least 2 units of elevation
    const hideSouth2 = (z = this.getElevationAt(i + 1, j + 1)) && z && z > elevation + 1;

    if (hideSouth2) return this.#cursorTextures.SS;
    if (hideEast && hideWest) return this.#cursorTextures.EW;
    if (hideEast && hideSouth) return this.#cursorTextures.ES;
    if (hideWest && hideSouth) return this.#cursorTextures.SW;
    if (hideEast) return this.#cursorTextures.E;
    if (hideSouth) return this.#cursorTextures.S;
    if (hideWest) return this.#cursorTextures.W;
    return this.#cursorTextures.FULL;
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

  digAt(index) {
    this.#tileElevations[index]--;
  }

  raiseAt(index) {
    this.#tileElevations[index]++;
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
   * Select the tileId connecting with the 4 surrounding tiles of same kind.
   * The 4 surrounding neighbors will also be updated if needed.
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

  /**
   * Look for basic tiles and replace them with specific tiles of same kind (texture
   * transition, etc.)
   * @param si, sj: top-left of search&replace area
   * @param ei, ej: bottom-right of search&replace area
   */
  putSpecialTiles(si = 0, sj = 0, ei = this.#cols - 1, ej = this.#rows - 1) {
    si = Math.max(0, si);
    sj = Math.max(0, sj);
    ei = Math.min(ei, this.#cols - 1);
    ej = Math.min(ej, this.#rows - 1);
    for (let j = sj; j <= ej; ++j) {
      for (let i = si; i <= ei; ++i) {
        const tileId = this.#tileIds[this.coordsToIndex(i, j)];
        if (Tileset.isWater(tileId)) {
          this.setWaterAt(i, j);
        } else if (Tileset.isRoad(tileId)) {
          this.setRoadAt(i, j);
        }
      }
    }
  }
}
