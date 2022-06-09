import * as PIXI from 'pixi.js';

import { Color } from './Types';

export const MAX_ELEVATION = 15;

export class Tileset {
  // Key: 4 booleans, encoded as 0|1 string. Each bool value indicates if the tile
  // connects to another road tile, for each direction: Up, Down, Left, Right
  // Value: The road tile ID

  static RoadNeighbors = {
  // ↑→↓← (clockwise)
    '0101': 64,
    '1010': 65,
    '0000': 66,
    '1111': 67,
    '0110': 68,
    '1001': 69,
    '0011': 70,
    '1100': 71,
    '0111': 72,
    '1110': 73,
    '1101': 74,
    '1011': 75,
    '0001': 76,
    '1000': 77,
    '0100': 78,
    '0010': 79,
  };

  static WaterNeighbors = {
    '1111': 48,
    '0000': 49,
    '0101': 50,
    '1010': 51,
    '1110': 52,
    '0111': 53,
    '1101': 54,
    '1011': 55,
    '1100': 56,
    '0011': 57,
    '0110': 58,
    '1001': 59,
    '0100': 60,
    '0010': 61,
    '1000': 62,
    '0001': 63,
  };

  static GrassBase = 0;
  static DirtBase = 16;
  static SandBase = 32;
  static WaterBase = 48;

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
  }

  /**
   * @return tileId
   */
  static getElevatedTileId(tileId: number, elevation: number): number {
    // Switch to another tile ID, representing the same base with elevation
    if (tileId <= (Tileset.GrassBase + MAX_ELEVATION)) {
      return Tileset.GrassBase + elevation;
    }
    if (tileId <= (Tileset.DirtBase + MAX_ELEVATION)) {
      return Tileset.DirtBase + elevation;
    }
    if (tileId <= (Tileset.SandBase + MAX_ELEVATION)) {
      return Tileset.SandBase + elevation;
    }
    // Otherwise, tileId has no elevated version in the tileset
    return tileId;
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
   * Get color of given tile, by reading 1 pixel
   * @return { r, g, b }
   */
  getTileColor(tileId: number): Color {
    const rect = this.getTileRect(tileId);
    // Extract 1 pixel at the center of the tile
    const x = rect.x + this.tileWidth / 2;
    const y = rect.y + this.tileHeight / 2;
    const pixel = this.#canvasCtx.getImageData(x, y, 1, 1);
    return {
      r: pixel.data[0],
      g: pixel.data[1],
      b: pixel.data[2],
    };
  }

  static isRoad(tileId: number): boolean {
    return Object.values(Tileset.RoadNeighbors).includes(tileId);
  }

  static isWater(tileId: number): boolean {
    return Object.values(Tileset.WaterNeighbors).includes(tileId);
  }

  static tileDesc(tileId: number): string {
    if (Tileset.isRoad(tileId)) return 'road';
    if (Tileset.isWater(tileId)) return 'water';
    if (tileId >= Tileset.GrassBase && tileId <= Tileset.GrassBase + MAX_ELEVATION) return 'grass';
    if (tileId >= Tileset.DirtBase && tileId <= Tileset.DirtBase + MAX_ELEVATION) return 'dirt';
    if (tileId >= Tileset.SandBase && tileId <= Tileset.SandBase + MAX_ELEVATION) return 'sand';
    return '?';
  }

  static isConstructible(tileId: number): boolean {
    return !Tileset.isRoad(tileId) && !Tileset.isWater(tileId);
  }
}
