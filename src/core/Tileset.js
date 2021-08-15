import * as PIXI from 'pixi.js';

export class Tileset {
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
}
