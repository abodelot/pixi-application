import * as PIXI from 'pixi.js';

import { TilemapUpdatedEvent } from './Tilemap';
import { Context } from './Context';
import { EventBus } from './EventBus';
import { Point } from './Types';

/**
 * Display a replica of the tilemap in a small image
 * Each tile in the Tilemap is a pixel in the MiniMap texture
 */
export class MiniMap extends PIXI.Container {
  #texture: PIXI.Texture;
  #colors: Uint8Array;
  #screenView: PIXI.NineSlicePlane;
  #ratio: number;
  #isPressed = false;

  constructor(width: number, height: number) {
    super();
    // Compute size factor between minimap and tilemap
    this.#ratio = width / Context.tilemap.width;

    this.createMiniMap(width, height);

    // Create screenView from viewPort dimensions
    const texture = Context.game.getTexture('screenview-9box.png');
    this.#screenView = new PIXI.NineSlicePlane(texture, 3, 3, 3, 3);
    this.#screenView.width = Context.viewPort.width * this.#ratio;
    this.#screenView.height = Context.viewPort.height * this.#ratio;
    this.addChild(this.#screenView);

    // Initialize screenView position from tilemap
    this.moveScreenView(Context.tilemap.position);

    // Update the minimap texture when the tilemap is updated
    EventBus.on('tilemap_updated', (event: TilemapUpdatedEvent) => {
      console.log('tilemap_updated', event);
      this.writePixel(event.i, event.j, event.tid);
      this.#texture.update();
    });

    // Drag'n'drop screenView
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointermove', this.onPointerMove.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUp.bind(this));

    EventBus.on('viewport_moved', (position: Point) => {
      this.moveScreenView(position);
    });
  }

  onPointerDown(event: PIXI.InteractionEvent): void {
    // Left click
    if (event.data.button === 0) {
      this.#isPressed = true;
      this.moveTilemap(event.data.getLocalPosition(this));
    }
  }

  onPointerMove(event: PIXI.InteractionEvent): void {
    if (this.#isPressed) {
      this.moveTilemap(event.data.getLocalPosition(this));
    }
  }

  onPointerUp(event: PIXI.InteractionEvent): void {
    if (event.data.button === 0) {
      this.#isPressed = false;
    }
  }

  createMiniMap(width: number, height: number): void {
    const { tileIds, nbCols, nbRows } = Context.tilemap;
    const size = nbCols * nbRows;

    // Each tile is a pixel. Each pixel is 4 uint8 (r, g, b a)
    this.#colors = new Uint8Array(4 * size);

    // Fill pixel array from tileIds (both are 1D array)
    for (let i = 0; i < nbCols; ++i) {
      for (let j = 0; j < nbRows; ++j) {
        this.writePixel(i, j, tileIds[i][j]);
      }
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

  rebuildMiniMap(): void {
    const { tileIds, nbCols, nbRows } = Context.tilemap;
    for (let i = 0; i < nbCols; ++i) {
      for (let j = 0; j < nbRows; ++j) {
        this.writePixel(i, j, tileIds[i][j]);
      }
    }
    this.#texture.update();
  }

  /**
   * Recompute ratio to tilemap and rebuild screen view.
   * Called when window is resized.
   */
  rebuildScreenView(): void {
    this.#ratio = this.width / Context.tilemap.width;
    this.#screenView.width = Context.viewPort.width * this.#ratio;
    this.#screenView.height = Context.viewPort.height * this.#ratio;
  }

  /**
   * Write a pixel in the minimap
   */
  writePixel(i: number, j: number, tid: number): void {
    // Convert 2D pos to index (* 4 bytes)
    const index = (j * Context.tilemap.nbCols + i) * 4;

    // Map tile ID to a color
    const color = Context.tilemap.tileset.getTileColor(tid);

    // Write pixel
    this.#colors[index] = color.r;
    this.#colors[index + 1] = color.g;
    this.#colors[index + 2] = color.b;
    this.#colors[index + 3] = 255; // No transparency
  }

  /**
   * Sync the screenView in the minimap with the tilemap position
   * @param position: tilemap position in the viewport
   */
  moveScreenView(position: PIXI.IPoint | Point): void {
    // Convert tilemap position to screenView dimensions
    this.#screenView.x = -position.x * this.#ratio;
    this.#screenView.y = -position.y * this.#ratio;
  }

  /**
   * Sync the tilemap with the minimap screenView position
   * @param position: screenView position in the minimap
   */
  moveTilemap(position: PIXI.IPoint): void {
    // Offset to make click at the center of screenView
    position.x -= this.#screenView.width / 2;
    position.y -= this.#screenView.height / 2;

    // Convert position to tilemap coords system
    position.x /= -this.#ratio;
    position.y /= -this.#ratio;
    EventBus.emit('minimap_clicked', position);
  }
}
