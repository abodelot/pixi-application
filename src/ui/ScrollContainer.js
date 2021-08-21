import * as PIXI from 'pixi.js';

import { clamp } from '@src/core/Utils';

/**
 * Container with a clipping mask for scolling content
 */
export class ScrollContainer extends PIXI.Container {
  #box;
  #content;

  /**
   * @param options.width: view width (pixels)
   * @param options.height: view height (pixels)
   */
  constructor(options) {
    super();

    // Container bounding box. It's not visible, because it's always overlaped
    // by the content, but a black sprite is used to trigger mouse interaction.
    this.#box = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#box.width = options.width;
    this.#box.height = options.height;
    this.#box.tint = 0x000000;
    this.addChild(this.#box);

    // Allow mouse interaction
    this.interactive = true;
    this.on('pointerdown', this.onMouseDown.bind(this));

    // Use a mask to crop content outside of the bounding box
    const mask = new PIXI.Graphics();
    mask.beginFill();
    mask.drawRect(0, 0, options.width, options.height);
    mask.endFill();
    this.addChild(mask);
    this.mask = mask;
  }

  setContent(element) {
    this.#content = element;
    // Center inside view
    this.#content.x = -((this.#content.width - this.#box.width) / 2);
    this.#content.y = -((this.#content.height - this.#box.height) / 2);

    this.addChild(this.#content);
  }

  onMouseDown(event) {
    // Middle click
    if (event.data.originalEvent.button === 1) {
      event.stopPropagation();
      const position = event.data.getLocalPosition(this);
      this.centerContent(position);
    }
  }

  centerContent(position) {
    // Delta movement vector: position becomes the new center
    const dx = position.x - (this.#box.width / 2);
    const dy = position.y - (this.#box.height / 2);

    // Apply delta, ensure content remains inside the box boundaries
    this.#content.x = clamp(
      this.#content.x - dx,
      -this.#content.width + this.#box.width,
      0,
    );

    this.#content.y = clamp(
      this.#content.y - dy,
      -this.#content.height + this.#box.height,
      0,
    );
  }
}
