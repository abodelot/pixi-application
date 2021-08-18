import * as PIXI from 'pixi.js';

export class Tileset {
  static Roads = {
    HORIZONTAL: 40,
    VERTICAL: 41,
    CROSSROADS: 43,
    NONE: 42,
    TURN_UP_LEFT: 49,
    TURN_DOWN_RIGHT: 48,
    TURN_UP_RIGHT: 51,
    TURN_DOWN_LEFT: 50,
    T_DOWN: 56,
    T_RIGHT: 57,
    T_UP: 58,
    T_LEFT: 59,
    END_UP: 67,
    END_DOWN: 65,
    END_LEFT: 66,
    END_RIGHT: 64,
  };

  // Key: 4 booleans, encoded as 0|1 string. Each bool value indicates if the tile
  // connects to another road tile, for each direction: Up, Down, Left, Right
  // Value: The road tile ID
  static RoadNeighbors = {
    '0000': Tileset.Roads.NONE,
    '1000': Tileset.Roads.END_DOWN,
    '0100': Tileset.Roads.END_UP,
    '1100': Tileset.Roads.VERTICAL,
    '0010': Tileset.Roads.END_RIGHT,
    '0001': Tileset.Roads.END_LEFT,
    '0011': Tileset.Roads.HORIZONTAL,
    '1010': Tileset.Roads.TURN_UP_LEFT,
    '1001': Tileset.Roads.TURN_UP_RIGHT,
    '0110': Tileset.Roads.TURN_DOWN_LEFT,
    '0101': Tileset.Roads.TURN_DOWN_RIGHT,
    '1011': Tileset.Roads.T_UP,
    '0111': Tileset.Roads.T_DOWN,
    '1110': Tileset.Roads.T_LEFT,
    '1101': Tileset.Roads.T_RIGHT,
    '1111': Tileset.Roads.CROSSROADS,
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
    return Object.values(Tileset.Roads).includes(tileId);
  }
}
