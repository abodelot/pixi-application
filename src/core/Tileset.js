import * as PIXI from 'pixi.js';

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

  #texture;
  #tileWidth;
  #tileHeight;
  #tileThickness;
  #cols;
  #rows;
  #textureCache;
  // Use an internal canvas for extracting pixel values
  #canvasElem;
  #canvasCtx;

  constructor(texture, tileWidth, tileHeight, tileThickness) {
    this.#texture = texture;
    this.#tileWidth = tileWidth;
    this.#tileHeight = tileHeight;
    this.#tileThickness = tileThickness;

    // Compute number of tile rows and cols in the tileset
    this.#cols = texture.baseTexture.width / tileWidth;
    this.#rows = texture.baseTexture.height / tileHeight;

    this.#textureCache = {};
    this.buildCanvas();
  }

  get texture() { return this.#texture; }
  get tileWidth() { return this.#tileWidth; }
  get tileHeight() { return this.#tileHeight; }
  get tileThickness() { return this.#tileThickness; }

  /**
   * Build an internal canvas object, which contains the tileset image
   */
  buildCanvas() {
    const img = this.#texture.baseTexture.resource.source;
    this.#canvasElem = document.createElement('canvas');
    this.#canvasCtx = this.#canvasElem.getContext('2d');
    this.#canvasCtx.drawImage(img, 0, 0);
  }

  /**
   * @return {int} tileId
   */
  static getElevatedTileId(tileId, elevation) {
    // Switch to another tile ID, representing the same base with elevation
    if (tileId < (Tileset.GrassBase + 16)) {
      return Tileset.GrassBase + elevation;
    }
    if (tileId < (Tileset.DirtBase + 16)) {
      return Tileset.DirtBase + elevation;
    }
    if (tileId < (Tileset.SandBase + 16)) {
      return Tileset.SandBase + elevation;
    }
    // Otherwise, tileId has no elevated version in the tileset
    return tileId;
  }

  /**
   * Get a PIXI Texture with the bounding rect for the given tileId
   * @return PIXI.Texture
   */
  getTileTexture(tileId) {
    if (this.#textureCache[tileId]) {
      // Cache hit
      return this.#textureCache[tileId];
    }
    // Cache miss
    const texture = new PIXI.Texture(this.#texture.baseTexture, this.getTileRect(tileId));
    this.#textureCache[tileId] = texture;
    return texture;
  }

  /**
   * Convert (i, j) coords in the tileset to tile id
   * @return int
   */
  coordsToTileId(i, j) {
    return j * this.#cols + i;
  }

  /**
   * Get the bounding rect in the tileset image
   * @return PIXI.Rectangle
   */
  getTileRect(tileId) {
    if (tileId >= 0 && tileId < (this.#cols * this.#rows)) {
      const i = tileId % this.#cols;
      const j = Math.floor(tileId / this.#cols);
      const fullHeight = this.#tileHeight + this.#tileThickness;
      return new PIXI.Rectangle(
        i * this.#tileWidth, j * fullHeight,
        this.#tileWidth, fullHeight,
      );
    }
    throw Error(`tileId out of tileset range: ${tileId}`);
  }

  /**
   * Get color of given tile, by reading 1 pixel
   * @return { r, g, b }
   */
  getTileColor(tileId) {
    const rect = this.getTileRect(tileId);
    // Extract 1 pixel at the center of the tile
    const x = rect.x + this.#tileWidth / 2;
    const y = rect.y + this.#tileHeight / 2;
    const pixel = this.#canvasCtx.getImageData(x, y, 1, 1);
    return {
      r: pixel.data[0],
      g: pixel.data[1],
      b: pixel.data[2],
    };
  }

  static isRoad(tileId) {
    return Object.values(Tileset.RoadNeighbors).includes(tileId);
  }

  static isWater(tileId) {
    return Object.values(Tileset.WaterNeighbors).includes(tileId);
  }
}
