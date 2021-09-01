import * as PIXI from 'pixi.js';

import { game } from './Game';
import { Context } from './Context';

/**
 * Display a replica of the tilemap in a small image
 * Each tile in the Tilemap is a pixel in the MiniMap texture
 */
export class MiniMap extends PIXI.Container {
  #texture;
  #colors;
  #screenView;
  #ratio;

  constructor(width, height) {
    super();
    // Compute size factor between minimap and tilemap
    this.#ratio = width / Context.tilemap.width;

    this.createMiniMap(width, height);

    // Create screenView from viewPort dimensions
    this.#screenView = new PIXI.NineSlicePlane(game.getTexture('screenview-9box.png'), 3, 3, 3, 3);
    this.#screenView.width = Context.viewPort.width * this.#ratio;
    this.#screenView.height = Context.viewPort.height * this.#ratio;
    this.addChild(this.#screenView);

    // Initialize screenView position from tilemap
    this.moveScreenView(Context.tilemap.position);

    // Update the minimap texture when the tilemap is updated
    game.on('tilemap_updated', (args) => {
      this.writeTile(args.index, args.tileId);
      this.#texture.update();
    });

    // Drag'n'drop screenView
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.on('pointermove', this.onMouseMove.bind(this));
    this.on('pointerdown', this.onMouseDown.bind(this));

    game.on('viewport_moved', (position) => {
      this.moveScreenView(position);
    });
  }

  createMiniMap(width, height) {
    const { tileIds, nbCols, nbRows } = Context.tilemap;

    // Each tile is a pixel. Each pixel is 4 uint8 (r, g, b a)
    this.#colors = new Uint8Array(4 * nbCols * nbRows);

    // Fill pixel array from tileIds (both are 1D array)
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
    const color = Context.tilemap.tileset.getTileColor(tileId);
    this.writePixel(index, color.r, color.g, color.b);
  }

  /**
   * Recompute ratio to tilemap and rebuild screen view.
   * Called when window is resized.
   */
  rebuildScreenView() {
    this.#ratio = this.hitArea.width / Context.tilemap.width;
    this.#screenView.width = Context.viewPort.width * this.#ratio;
    this.#screenView.height = Context.viewPort.height * this.#ratio;
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

  /**
   * Sync the tilemap with the minimap screenView position
   * @param position: screenView position in the minimap
   */
  moveTilemap(position) {
    // Offset to make click at the center of screenView
    position.x -= this.#screenView.width / 2;
    position.y -= this.#screenView.height / 2;

    // Convert position to tilemap coords system
    position.x /= -this.#ratio;
    position.y /= -this.#ratio;
    game.emit('minimap_clicked', position);
  }

  onMouseDown(event) {
    // Left click
    if (event.data.button === 0) {
      this.moveTilemap(event.data.getLocalPosition(this));
    }
  }

  onMouseMove(event) {
    if (event.data.pressure > 0) {
      this.moveTilemap(event.data.getLocalPosition(this));
    }
  }
}
