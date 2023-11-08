import * as PIXI from 'pixi.js';
import { Context } from './Context';
import { Coords, Point, Rect } from './Types';
import { Tileset, MAX_ELEVATION } from './Tileset';
import { EventBus } from './EventBus';
import { TilemapActionBase } from './TilemapActionBase';
import { TilemapActionElevation } from './TilemapActionElevation';
import { TilemapActionRoad } from './TilemapActionRoad';
import { TilemapActionTilePainter } from './TilemapActionTilePainter';

export interface TilemapUpdatedEvent {
  i: number;
  j: number;
  tid: number;
}

export interface TilePointedEvent {
  i: number;
  j: number;
  tileId: number;
  elevation: number;
  tileDesc: string;
}

export class Tilemap extends PIXI.Container {
  #background: PIXI.Sprite;
  #cols = 0;
  #rows = 0;
  #tileIds: number[][] = [];
  readonly #terrainGraphics: PIXI.Graphics;
  readonly #tileset: Tileset;
  // Click behavior
  #action: TilemapActionBase = new TilemapActionTilePainter(this, Tileset.TILE_GRASS);
  #hoveredTile: Record<string, number> = {};
  #cursor;
  #isPressed = false;
  pixelWidth = 0;
  pixelHeight = 0;
  #zVertices: number[][] = [];

  constructor(tileset: Tileset) {
    super();
    this.#tileset = tileset;
    this.#background = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#background.tint = 0x000000;
    this.addChild(this.#background);

    this.#terrainGraphics = new PIXI.Graphics();
    this.addChild(this.#terrainGraphics);

    this.#cursor = new PIXI.Sprite(this.tileset.getTileTexture(Tileset.Cursor['0000']));
    this.addChild(this.#cursor);

    // Allow mouse interaction
    this.interactive = true;
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointermove', this.onPointerMove.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUp.bind(this));

    this.#hoveredTile = null;

    EventBus.on('tile_id_selected', (tileId: number) => {
      this.#action = new TilemapActionTilePainter(this, tileId);
    });
    EventBus.on('elevation_selected', (direction: string) => {
      this.#action = new TilemapActionElevation(this, direction === 'raise' ? 1 : -1);
    });
    EventBus.on('road_selected', () => {
      this.#action = new TilemapActionRoad(this);
    });
    EventBus.on('grass_selected', () => {
      this.#action = new TilemapActionTilePainter(this, Tileset.TILE_GRASS);
    });
    EventBus.on('dirt_selected', () => {
      this.#action = new TilemapActionTilePainter(this, Tileset.TILE_DIRT);
    });
  }

  get tileIds(): number[][] { return this.#tileIds; }
  get nbCols(): number { return this.#cols; }
  get nbRows(): number { return this.#rows; }
  get tileset(): Tileset { return this.#tileset; }

  onPointerDown(event: PIXI.InteractionEvent): void {
    // Left click: propagate pressed tile to action
    if (event.data.button === 0 && this.#hoveredTile && this.#action) {
      this.#action.onTilePressed(this.#hoveredTile.i, this.#hoveredTile.j);
      this.#isPressed = true;
    }
  }

  onPointerMove(event: PIXI.InteractionEvent): void {
    const position = event.data.getLocalPosition(this);
    const newTileSelected = this.selectTileAtPosition(position.x, position.y);
    if (newTileSelected && this.#isPressed && this.#action) {
      this.#action.onTileDragged(this.#hoveredTile.i, this.#hoveredTile.j);
    }
  }

  onPointerUp(event: PIXI.InteractionEvent): void {
    if (event.data.button === 0) {
      if (this.#action && this.#isPressed) {
        this.#action.onTileReleased();
      }
      this.#isPressed = false;
    }
  }

  /**
   * Load a tilemap
   * @param tileIds: Array of ids, sized cols*rows
   * @param zVertices: Array of elevations, sized (cols+1) * (rows+1)
   * @param cols: number of cols
   * @param rows: number of rows
   */
  load(tileIds: number[][], zVertices: number[][], cols: number, rows: number): void {
    if (tileIds.length !== cols) throw Error('bad tileIds width');
    if (tileIds[0].length !== rows) throw Error('bad tileIds height');
    if (zVertices.length !== cols + 1) throw Error('bad zVertices width');
    if (zVertices[0].length !== rows + 1) throw Error('bad zVertices height');

    this.#cols = cols;
    this.#rows = rows;
    this.#tileIds = tileIds;
    this.#zVertices = zVertices;

    // Compute size of the bounding box
    this.pixelWidth = (cols + rows) * this.tileset.tileWidth / 2;
    this.pixelHeight = (cols + rows) * this.tileset.tileHeight / 2;

    // Resize the tilemap background sprite
    this.#background.width = this.pixelWidth;
    this.#background.height = this.pixelHeight;

    this.redrawTilemap();
    this.refreshPointerSelection();
  }

  /**
   * Get the four surrounding Z values of a tile
   * @return [top, right, bottom, left]
   */
  getZCorners(i: number, j: number): [number, number, number, number] {
    const top = this.#zVertices[i][j];
    const left = this.#zVertices[i][j + 1];
    const bottom = this.#zVertices[i + 1][j + 1];
    const right = this.#zVertices[i + 1][j];
    return [top, right, bottom, left];
  }

  /**
   * Redraw all tiles. This clear and repopulate the Graphics object.
   */
  redrawTilemap(): void {
    this.#terrainGraphics.clear();
    this.drawTilemap({
      x1: 0,
      y1: 0,
      x2: this.#cols,
      y2: this.#rows,
    });
  }

  /**
   * Partial redraw from x1, y1 (top left) to x2, y2 (bottom right)
   */
  drawTilemap(r: Rect) {
    this.putSpecialTiles();

    for (let i = r.x1; i <= r.x2; ++i) {
      for (let j = r.y1; j <= r.y2; ++j) {
        if (i < 0 || i >= this.#cols || j < 0 || j >= this.#rows) {
          continue;
        }
        const tid = this.#tileIds[i][j];
        let tid2 = tid;
        // Update tid with special tile
        if (this.tileset.isRoad(tid)) {
          const sloppedId = this.tileset.getSlopedRoadTileId(...this.getZCorners(i, j));
          if (sloppedId !== -1) {
            tid2 = sloppedId;
          }
        } else {
          tid2 = tid2 - tid2 % 16 + this.tileset.getTileSlopeOffset(...this.getZCorners(i, j));
          if (tid2 === undefined) {
            console.error('key not in Slopes');
            tid2 = Tileset.Slopes['0000'][0];
          }
        }
        if (tid2 !== tid) {
          // redraw minimap
          EventBus.emit('tilemap_updated', { i, j, tid: tid2 });
          this.#tileIds[i][j] = tid2;
        }
        this.drawTile(i, j, tid2);
      }
    }
  }

  drawTile(i: number, j: number, tileId: number): void {
    // Tile position in the tilemap
    const pos = this.coordsToPixels(i, j);
    const tileTexture = this.tileset.getTileTexture(tileId);
    this.#terrainGraphics.beginTextureFill({
      texture: tileTexture,
      matrix: new PIXI.Matrix().translate(pos.x, pos.y),
    });
    this.#terrainGraphics.drawRect(pos.x, pos.y, tileTexture.width, tileTexture.height);
    this.#terrainGraphics.endFill();
  }

  /**
   * Load the tilemap from the browser localStorage
   * @return true if map loaded, otherwise false
   */
  loadFromLocalStorage(): boolean {
    if (localStorage.map) {
      try {
        const data = JSON.parse(localStorage.map);
        this.load(data.tiles, data.zVertices, data.width, data.height);
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

  saveToLocalStorage(): void {
    const data = {
      width: this.#cols,
      height: this.#rows,
      zVertices: this.#zVertices,
      tiles: this.#tileIds,
    };

    localStorage.map = JSON.stringify(data);
    console.log('Tilemap saved');
  }

  /**
   * Convert position in pixels to 2d array index
   * @return {i, j}
   */
  pixelsToCoords(x: number, y: number): Coords {
    x -= this.#rows * this.tileset.tileWidth * 0.5;
    y -= this.tileset.tileHeight * 0.5;

    return {
      i: Math.floor((y + Math.floor(x / 2)) / this.tileset.tileHeight),
      j: Math.floor((y - Math.floor(x / 2)) / this.tileset.tileHeight),
    };
  }

  /**
   * Convert position in pixels to 2d array index
   * @return {i, j}
   */
  pixelsToCoordsWithElevation(x: number, y: number): Coords {
    const thickness = this.tileset.tileThickness;

    for (let layer = MAX_ELEVATION; layer > 0; --layer) {
      // Tile at elevation N can hide tiles at elevation N-1
      // Start with the highest elevation, and check if a tile is hovered.
      // The mouse y position is adjusted according to the elevation.
      const y2 = y + (layer * thickness);
      const { i, j } = this.pixelsToCoords(x, y2);
      const elevation = this.getElevationAt(i, j);
      if (elevation === layer) {
        return { i, j };
      }
    }

    // Now scanning at elevation 0
    const { i, j } = this.pixelsToCoords(x, y);
    const elevation = this.getElevationAt(i, j);
    if (elevation > 0) {
      // The tile located at the mouse position is above elevation 0, but we did not
      // match any when scanning the elevation layers above!
      // That's because pixelsToCoords only works with the "top" side of the tile.
      // console.error(elevation);
      // FIXME
      return null;
    }
    return { i, j };
  }

  /**
   * Convert 2d array index to position in pixels
   * @return {x, y}
   */
  coordsToPixels(i: number, j: number): Point {
    return {
      x: (i * this.tileset.tileWidth * 0.5) - (j * this.tileset.tileWidth * 0.5)
        + ((this.#rows - 1) * this.tileset.tileWidth * 0.5),
      y: (i * this.tileset.tileHeight * 0.5) + (j * this.tileset.tileHeight * 0.5)
        // Move upwards on y-axis to apply elevation
        - this.tileset.tileThickness * this.getElevationAt(i, j),
    };
  }

  /**
   * Display tile cursor on the tile under the mouse
   * @param x, y: mouse position
   * @param forceRefresh: recompute selected tile, even if mouse didn't move
   * @return true if a tile is selected, otherwise false
   */
  selectTileAtPosition(x: number, y: number, forceRefresh = false): boolean {
    // Check cursor is over tilemap area
    if (x >= 0 && y >= 0 && x < this.pixelWidth && y < this.pixelHeight) {
      const res = this.pixelsToCoordsWithElevation(x, y);
      if (res === null) {
        this.#hoveredTile = null;
        this.#cursor.visible = false;
        EventBus.emit('tile_pointed', null);
        return false;
      }
      const { i, j } = res;

      if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
        // Early return: same tile
        if (!forceRefresh && this.#hoveredTile
            && i === this.#hoveredTile.i && j === this.#hoveredTile.j) {
          return false;
        }
        this.#hoveredTile = { i, j };
        const pos = this.coordsToPixels(i, j);
        this.#cursor.position.set(pos.x, pos.y);
        this.#cursor.texture = this.getTileCursorTexture(i, j);
        this.#cursor.visible = true;

        const tileId = this.tileIds[i][j];
        const elevation = this.getElevationAt(i, j);
        EventBus.emit('tile_pointed', {
          tileId, tileDesc: this.tileset.tileDesc(tileId), elevation, i, j,
        });
        return true;
      }
      this.#hoveredTile = null;
      this.#cursor.visible = false;
    }
    EventBus.emit('tile_pointed', null);
    return false;
  }

  refreshPointerSelection(): void {
    // Fetch mouse position, and recompute which tile is hovered
    const pos = this.toLocal(Context.game.app.renderer.plugins.interaction.mouse.global);
    this.selectTileAtPosition(pos.x, pos.y, true);
  }

  /**
   * Get the texture for cursor when hovering a tile
   * @return PIXI.Texture
   */
  getTileCursorTexture(i: number, j: number): PIXI.Texture {
    const [top, right, bottom, left] = this.getZCorners(i, j);
    return this.tileset.getCursorTexture(top, right, bottom, left);
  }

  setTileAt(i: number, j: number, tid: number): void {
    if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
      if (this.#tileIds[i][j] !== tid) {
        this.#tileIds[i][j] = tid;
        EventBus.emit('tilemap_updated', { i, j, tid });
      }
    }
  }

  getElevationAt(i: number, j: number, fn = Math.min): number {
    if (i >= 0 && i < this.#cols && j >= 0 && j < this.#rows) {
      // Tile elevation is the min (defautl) Z value of the 4 corners
      return fn(...this.getZCorners(i, j));
    }
    return -1;
  }

  increaseZ(i: number, j: number) {
    // Tile elevation is the lowest Z value of the 4 corners
    const corners = this.getZCorners(i, j);
    const newZ = Math.min(...corners) + 1;

    // Update Z vertices
    this.#zVertices[i][j] = newZ;
    this.#zVertices[i][j + 1] = newZ;
    this.#zVertices[i + 1][j + 1] = newZ;
    this.#zVertices[i + 1][j] = newZ;

    const r = this.propagateZUp(i - 1, j - 1, i + 2, j + 2, newZ - 1);
    this.drawTilemap(r);
  }

  decreaseZ(i: number, j: number) {
    // Tile elevation is the highest Z value of the 4 corners
    const corners = this.getZCorners(i, j);
    const newZ = Math.max(...corners) - 1;

    this.#zVertices[i][j] = newZ;
    this.#zVertices[i][j + 1] = newZ;
    this.#zVertices[i + 1][j + 1] = newZ;
    this.#zVertices[i + 1][j] = newZ;

    const r = this.propagateZDown(i - 1, j - 1, i + 2, j + 2, newZ + 1);
    this.drawTilemap(r);
  }

  /**
   * Propagate z value to neighbors, ensure z >= z - 1
   */
  propagateZUp(x1: number, y1: number, x2: number, y2: number, z: number): Rect {
    const changed = this.propagateZ(x1, y1, x2, y2, z, (a, b) => a < b);
    if (changed) {
      return this.propagateZUp(x1 - 1, y1 - 1, x2 + 1, y2 + 1, z - 1);
    }
    return {
      x1,
      y1,
      x2,
      y2,
    };
  }

  /**
   * Propagate z value to neighbors, ensure z <= z - 1
   */
  propagateZDown(x1: number, y1: number, x2: number, y2: number, z: number): Rect {
    const changed = this.propagateZ(x1, y1, x2, y2, z, (a, b) => a > b);
    if (changed) {
      return this.propagateZDown(x1 - 1, y1 - 1, x2 + 1, y2 + 1, z + 1);
    }
    return {
      x1,
      y1,
      x2,
      y2,
    };
  }

  propagateZ(
    i1: number,
    j1: number,
    i2: number,
    j2: number,
    z: number,
    cmpFn: (a: number, b: number) => boolean,
  ): boolean {
    let changed = false;
    for (let i = i1; i <= i2; ++i) {
      for (let j = j1; j <= j2; ++j) {
        if (i >= 0 && i <= this.#cols && j >= 0 && j <= this.#rows) {
          const currentZ = this.#zVertices[i][j];
          if (cmpFn(currentZ, z)) {
            this.#zVertices[i][j] = z;
            changed = true;
          }
        }
      }
    }
    return changed;
  }

  /**
   * Put a Road tile at given coords
   */
  setRoadAt(i: number, j: number): void {
    this.setSmartTileAt(i, j, this.isRoad.bind(this), this.tileset.roadNeighbors);
  }

  /**
   * Select the tileId connecting with the 4 surrounding tiles of same kind.
   * The 4 surrounding neighbors will also be updated if needed.
   * @param i, j: tile coords
   * @param checkTypeFn: callback function that check if tile matches the expected type
   * @param neighborAtlas: list of neighbor tile ids, defined in Tileset
   */
  setSmartTileAt(
    i: number,
    j: number,
    checkTypeFn: (i: number, j: number) => boolean,
    neighborAtlas: Record<string, number>,
  ): void {
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
  isRoad(i: number, j: number): boolean {
    const tid = this.#tileIds[i][j];
    return tid !== null && this.tileset.isRoad(tid);
  }

  canBuildRoad(i: number, j: number): boolean {
    const tid = this.#tileIds[i][j];
    return this.tileset.isConstructible(tid)
      && this.tileset.canBuildRoadOnSlope(...this.getZCorners(i, j));
  }

  /**
   * Look for basic tiles and replace them with specific tiles of same kind (texture
   * transition, etc.)
   * @param i0, j0: top-left of search&replace area
   * @param i1, j1: bottom-right of search&replace area
   */
  putSpecialTiles(i0 = 0, j0 = 0, i1 = this.#cols - 1, j1 = this.#rows - 1): void {
    i0 = Math.max(0, i0);
    j0 = Math.max(0, j0);
    i1 = Math.min(i1, this.#cols - 1);
    j1 = Math.min(j1, this.#rows - 1);
    for (let j = j0; j <= j1; ++j) {
      for (let i = i0; i <= i1; ++i) {
        const tileId = this.#tileIds[i][j];
        if (this.tileset.isRoad(tileId)) {
          this.setRoadAt(i, j);
        }
      }
    }
  }
}
