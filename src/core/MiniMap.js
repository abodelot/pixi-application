import * as PIXI from 'pixi.js';

import { game } from './Game';
import { Tileset } from './Tileset';

/**
 * Display a replica of the tilemap in a small image
 * Each tile in the Tilemap is a pixel in the MiniMap texture
 */
export class MiniMap extends PIXI.Container {
  #texture;
  #colors;

  constructor(tilemap) {
    super();

    this.createMiniMap(tilemap.tileIds, tilemap.mapWidth, tilemap.mapHeight);

    // Update the minimap texture when the tilemap is updated
    game.on('tilemap_updated', (args) => {
      this.writeTile(args.index, args.tileId);
      this.#texture.update();
    });
  }

  /**
   * @param tileIds: tileIds from tilemap (as 1D array)
   */
  createMiniMap(tileIds, width, height) {
    // Each tile is a pixel. Each pixel is 4 uint8 (r, g, b a)
    this.#colors = new Uint8Array(4 * width * height);

    // Fill pixel array
    for (let i = 0; i < width * height; ++i) {
      this.writeTile(i, tileIds[i]);
    }

    // Create a texture from pixels
    this.#texture = PIXI.Texture.fromBuffer(this.#colors, width, height);
    this.#texture.update();

    // Use a sprite to rotate and render the texture
    const sprite = new PIXI.Sprite(this.#texture);
    sprite.pivot.x = sprite.width / 2;
    sprite.pivot.y = sprite.height / 2;
    sprite.angle = 45;

    // Move the sprite to make the new top-left looks like (0, 0)
    const bounds = sprite.getBounds();
    sprite.x = bounds.width / 2;
    sprite.y = bounds.height / 2;

    this.addChild(sprite);
  }

  /**
   * @param index: tile index in the tilemap (as 1D array)
   */
  writeTile(index, tileId) {
    index *= 4;
    // Map tileId to a color
    if (tileId === 1) {
      this.writePixel(index, 76, 172, 134);
    } else if (tileId === 2) {
      this.writePixel(index, 231, 224, 136);
    } else if (tileId === 3) {
      this.writePixel(index, 154, 134, 69);
    } else if (Tileset.isWater(tileId)) {
      this.writePixel(index, 74, 120, 218);
    } else if (Tileset.isRoad(tileId)) {
      this.writePixel(index, 51, 51, 51);
    } else {
      this.writePixel(index, 0, 0, 0);
    }
  }

  writePixel(offset, r, g, b) {
    this.#colors[offset] = r;
    this.#colors[offset + 1] = g;
    this.#colors[offset + 2] = b;
    this.#colors[offset + 3] = 255; // No transparency
  }
}
