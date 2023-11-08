import * as PIXI from 'pixi.js';

import { Color } from './Types';

export const MAX_ELEVATION = 15;

export enum TileType {
  Grass = 0,
  Dirt = 16,
  Road = 80,
}

export class Tileset {
  static TypeColors: Record<number, number> = {
    [TileType.Grass]: 0x5db262,
    [TileType.Dirt]: 0xcd683d,
    [TileType.Road]: 0x4e4e4e,
  };

  static Slopes: Record<string, [number, number]> = {
  // ↑→↓← (clockwise), value = [tileId, roadId]
    '0110': [0, 64], 
    '0010': [1, -1], 
    '0011': [2, 66], 
    '0100': [3, -1], 
    '0000': [4, 68], 
    '0001': [5, -1], 
    '1100': [6, 70], 
    '1000': [7, -1], 
    '1001': [8, 72], 
    '1011': [9, -1], 
    '1101': [10, -1],
    '1110': [11, -1],
    '0111': [12, -1],
    '0101': [13, -1],
    '1010': [14, -1],
  };

  static TILE_GRASS = 0 + Tileset.Slopes['0000'][0];
  static TILE_DIRT = 16 + Tileset.Slopes['0000'][0];

  static Cursor: Record<string, number> = {
    '0110': 32,
    '0010': 33,
    '0011': 34,
    '0100': 35,
    '0000': 36,
    '0001': 37,
    '1100': 38,
    '1000': 39,
    '1001': 40,
    '1011': 41,
    '1101': 42,
    '1110': 43,
    '0111': 44,
    '0101': 45,
    '1010': 46,
  };

  // 4 booleans, encoded as 0|1 string. Each bool value indicates if the tile
  // connects to another road tile, for each direction: Up, Down, Left, Right
  // Array order is tile order in the tileset
  static Roads = [
    // ↑→↓← (clockwise)
    '0101',
    '1010',
    '0000',
    '1111',
    '0110',
    '1001',
    '0011',
    '1100',
    '0111',
    '1110',
    '1101',
    '1011',
    '0001',
    '1000',
    '0100',
    '0010',
  ];

  // Describe the shade of each tile in a tileset row [0-15]
  static SlopesShades = [
    'dark',
    'dark',
    'light',
    'dark',
    'base',
    'light',
    'dark',
    'light',
    'light',
    'light',
    'light',
    'dark',
    'dark',
    'base',
    'base',
  ];

  readonly texture: PIXI.Texture;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly tileThickness: number;
  readonly #cols: number;
  readonly #rows: number;
  readonly #textureCache: Record<string, PIXI.Texture>;
  // Use an internal canvas for extracting pixel values
  readonly #canvasElem: HTMLCanvasElement;
  readonly #canvasCtx;

  roadNeighbors: Record<string, number> = {};

  constructor(texture: PIXI.Texture, tileWidth: number, tileHeight: number, tileThickness: number) {
    this.texture = texture;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tileThickness = tileThickness;

    // Compute number of tile rows and cols in the tileset
    this.#cols = texture.baseTexture.width / tileWidth;
    this.#rows = texture.baseTexture.height / tileHeight;

    this.#textureCache = {};

    // Build an internal canvas object, which contains the tileset image
    this.#canvasElem = document.createElement('canvas');
    this.#canvasCtx = this.#canvasElem.getContext('2d');
    const img = (this.texture.baseTexture as PIXI.BaseTexture<PIXI.ImageResource>).resource.source;
    this.#canvasCtx.drawImage(img, 0, 0);

    for (let i = 0; i < Tileset.Roads.length; ++i) {
      this.roadNeighbors[Tileset.Roads[i]] = TileType.Road + i;
    }
  }

  /**
   * Get a PIXI Texture with the bounding rect for the given tileId
   * @return PIXI.Texture
   */
  getTileTexture(tileId: number): PIXI.Texture {
    if (this.#textureCache[tileId]) {
      // Cache hit
      return this.#textureCache[tileId];
    }
    // Cache miss
    const texture = new PIXI.Texture(this.texture.baseTexture, this.getTileRect(tileId));
    this.#textureCache[tileId] = texture;
    return texture;
  }

  /**
   * Get texture of a Road tile, to use it as an icon
   */
  getRoadIconTexture(): PIXI.Texture {
    const roadId = this.roadNeighbors['0000'];
    return this.getTileTexture(roadId);
  }

  /**
   * Compute sloped tile id
   * @return offset to be added to the base tile id
   */
  getTileSlopeOffset(top: number, right: number, bottom: number, left: number): number {
    const key = this.getKey(top, right, bottom, left);
    return Tileset.Slopes[key][0];
  }

  getSlopedRoadTileId(top: number, right: number, bottom: number, left: number): number {
    const key = this.getKey(top, right, bottom, left);
    if (key === '0000') {
      return -1;
    }
    return Tileset.Slopes[key][1];
  }

  canBuildRoadOnSlope(top: number, right: number, bottom: number, left: number): boolean {
    const key = this.getKey(top, right, bottom, left);
    return Tileset.Slopes[key][1] !== -1;
  }

  getCursorTexture(top: number, right: number, bottom: number, left: number): PIXI.Texture {
    const key = this.getKey(top, right, bottom, left);
    return this.getTileTexture(Tileset.Cursor[key]);
  }

  private getKey(top: number, right: number, bottom: number, left: number): string {
    const min = Math.min(top, right, bottom, left);
    return [top, right, bottom, left].map((z) => (z === min ? 0 : 1)).join('');
  }

  /**
   * Convert (i, j) coords in the tileset to tile id
   * @return int
   */
  coordsToTileId(i: number, j: number): number {
    return j * this.#cols + i;
  }

  /**
   * Get the bounding rect in the tileset image
   * @return PIXI.Rectangle
   */
  getTileRect(tileId: number): PIXI.Rectangle {
    if (tileId >= 0 && tileId < (this.#cols * this.#rows)) {
      const i = tileId % this.#cols;
      const j = Math.floor(tileId / this.#cols);
      const fullHeight = this.tileHeight + this.tileThickness;
      return new PIXI.Rectangle(
        i * this.tileWidth,
        j * fullHeight,
        this.tileWidth,
        fullHeight,
      );
    }
    throw Error(`tileId out of tileset range: ${tileId}`);
  }

  /**
   * Get color of given tile id
   * @return { r, g, b }
   */
  getTileColor(tileId: number): Color {
    const baseId = Math.floor(tileId / 16) * 16;
    const slopeOffset = tileId - baseId;
    console.log("getTileColor", tileId, baseId, slopeOffset);

    if (Tileset.TypeColors.hasOwnProperty(baseId)) {
      const color = Color.fromInt(Tileset.TypeColors[baseId]);
      switch (Tileset.SlopesShades[slopeOffset]) {
        case 'base': return color;
        case 'light': return color.lighten(0.2);
        case 'dark': return color.darken(0.2);
        default: return new Color(255, 0, 0);
      }
    }
    return new Color(255, 0, 0);
  }

  isRoad(tileId: number): boolean {
    return Object.values(this.roadNeighbors).includes(tileId)
      || Object.values(Tileset.Slopes).map((value) => value[1]).includes(tileId);
  }

  tileDesc(tileId: number): string {
    if (tileId >= TileType.Grass && tileId < TileType.Dirt) return 'grass';
    if (tileId >= TileType.Dirt && tileId < TileType.Road) return 'dirt';

    if (this.isRoad(tileId)) return 'road';
    return 'empty';
  }

  isConstructible(tileId: number): boolean {
    if (this.isRoad(tileId)) return false;
    return true;
  }
}
