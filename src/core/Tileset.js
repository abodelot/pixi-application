import * as PIXI from 'pixi.js';

export class Tileset {
  // Key: 4 booleans, encoded as 0|1 string. Each bool value indicates if the tile
  // connects to another road tile, for each direction: Up, Down, Left, Right
  // Value: The road tile ID
  static RoadNeighbors = {
    '0010': 64,
    '1000': 65,
    '0001': 66,
    '0100': 67,
    '0011': 40,
    '1100': 41,
    '0000': 42,
    '1111': 43,
    '0101': 48,
    '1010': 49,
    '0110': 50,
    '1001': 51,
    '0111': 56,
    '1101': 57,
    '1011': 58,
    '1110': 59,
  };

  static WaterNeighbors = {
  // ↑↓←→
    '1111': 8,
    '0000': 9,
    '0011': 10,
    '1100': 11,
    '0001': 32,
    '0100': 33,
    '1000': 34,
    '0010': 35,
    '1001': 24,
    '0110': 25,
    '0101': 26,
    '1010': 27,
    '1101': 16,
    '0111': 17,
    '1011': 18,
    '1110': 19,
  };

  #texture;
  #tileWidth;
  #tileHeight;
  #cols;
  #rows;

  constructor(texture, tileWidth, tileHeight) {
    this.#texture = texture;
    this.#tileWidth = tileWidth;
    this.#tileHeight = tileHeight;

    // Compute number of tile rows and cols in the tileset
    this.#cols = texture.baseTexture.width / tileWidth;
    this.#rows = texture.baseTexture.height / tileHeight;
  }

  get texture() { return this.#texture; }
  get tileWidth() { return this.#tileWidth; }
  get tileHeight() { return this.#tileHeight; }

  /**
   * Get a PIXI Texture with the bounding rect for the given tileId
   */
  getTileTexture(tileId) {
    if (tileId >= 0 && tileId < (this.#cols * this.#rows)) {
      const i = tileId % this.#cols;
      const j = Math.floor(tileId / this.#cols);
      return new PIXI.Texture(
        this.#texture.baseTexture,
        new PIXI.Rectangle(
          i * this.#tileWidth, j * this.#tileHeight,
          this.#tileWidth, this.#tileHeight,
        ),
      );
    }
    throw Error(`unsupported tileId: ${tileId}`);
  }

  /**
   * Convert (i, j) coords in the tileset to tile id
   */
  coordsToTileId(i, j) {
    return j * this.#cols + i;
  }

  static isRoad(tileId) {
    return Object.values(Tileset.RoadNeighbors).includes(tileId);
  }

  static isWater(tileId) {
    return Object.values(Tileset.WaterNeighbors).includes(tileId);
  }
}
