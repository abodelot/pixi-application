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
  #screenView;
  #ratio;

  /**
   * @param viewPort: dimensions of view port (ScrollContainer)
   * @param ratio: size factor between minimap and tilemap
   */
  constructor(width, height, tilemap, viewPort, ratio) {
    super();
    this.#ratio = ratio;

    this.createMiniMap(width, height, tilemap.tileIds, tilemap.nbCols, tilemap.nbRows);

    // Create screenView from viewPort dimensions
    this.#screenView = new PIXI.NineSlicePlane(game.getTexture('screenview-9box.png'), 3, 3, 3, 3);
    this.#screenView.width = viewPort.width * this.#ratio;
    this.#screenView.height = viewPort.height * this.#ratio;
    this.addChild(this.#screenView);

    // Initialize screenView position from tilemap
    this.moveScreenView(tilemap.position);

    // Update the minimap texture when the tilemap is updated
    game.on('tilemap_updated', (args) => {
      this.writeTile(args.index, args.tileId);
      this.#texture.update();
    });

    this.interactive = true;
    this.pointertap = (event) => {
      const position = event.data.getLocalPosition(this);
      // Offset to make click at the center of screenView
      position.x -= this.#screenView.width / 2;
      position.y -= this.#screenView.height / 2;

      // Convert position to tilemap coords system
      position.x /= -ratio;
      position.y /= -ratio;
      game.emit('minimap_clicked', position);
    };

    game.on('viewport_moved', (position) => {
      this.moveScreenView(position);
    });
  }

  /**
   * @param tileIds: tileIds from tilemap (as 1D array)
   */
  createMiniMap(width, height, tileIds, nbCols, nbRows) {
    // Each tile is a pixel. Each pixel is 4 uint8 (r, g, b a)
    this.#colors = new Uint8Array(4 * nbCols * nbRows);

    // Fill pixel array
    for (let i = 0; i < nbCols * nbRows; ++i) {
      this.writeTile(i, tileIds[i]);
    }

    // Create a texture from pixels
    this.#texture = PIXI.Texture.fromBuffer(this.#colors, nbCols, nbRows);
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

    // Wrap in another sprite to apply scale transformation and make the minimap
    // fits the given width/height
    const wrapper = new PIXI.Container();
    wrapper.addChild(sprite);
    wrapper.width = width;
    wrapper.height = height;

    this.addChild(wrapper);
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

  /**
   * Sync the screenView in the minimap with the tilemap position
   * @param position: tilemap position in the viewport
   */
  moveScreenView(position) {
    // Convert tilemap position to screenView dimensions
    this.#screenView.x = -position.x * this.#ratio;
    this.#screenView.y = -position.y * this.#ratio;
  }
}
