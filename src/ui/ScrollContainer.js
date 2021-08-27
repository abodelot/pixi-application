import * as PIXI from 'pixi.js';

import { game } from '@src/core/Game';
import { clamp } from '@src/core/Utils';

/**
 * Container with a clipping mask for scolling content
 */
export class ScrollContainer extends PIXI.Container {
  #box;
  #content;

  /**
   * @param viewWidth: viewport width (pixels)
   * @param viewHeight: viewport height (pixels)
   */
  constructor(viewWidth, viewHeight) {
    super();

    // Container bounding box. It's not visible, because it's always overlaped
    // by the content, but a black sprite is used to trigger mouse interaction.
    this.#box = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#box.width = viewWidth;
    this.#box.height = viewHeight;
    this.#box.tint = 0x000000;
    this.addChild(this.#box);

    // Allow mouse interaction
    this.interactive = true;
    this.on('pointerdown', this.onMouseDown.bind(this));

    // Use a mask to crop content outside of the bounding box
    const mask = new PIXI.Graphics();
    mask.beginFill();
    mask.drawRect(0, 0, viewWidth, viewHeight);
    mask.endFill();
    this.addChild(mask);
    this.mask = mask;

    game.on('minimap_clicked', (position) => {
      this.moveContentTo(position);
    });
  }

  setContent(element) {
    this.#content = element;
    // Center inside view
    this.#content.x = -((this.#content.width - this.#box.width) / 2);
    this.#content.y = -((this.#content.height - this.#box.height) / 2);

    this.addChild(this.#content);
  }

  resize(width, height) {
    this.#box.width = width;
    this.#box.height = height;

    this.removeChild(this.mask);
    const mask = new PIXI.Graphics();
    mask.beginFill();
    mask.drawRect(0, 0, width, height);
    mask.endFill();
    this.addChild(mask);
    this.mask = mask;
  }

  onMouseDown(event) {
    // Middle click
    if (event.data.originalEvent.button === 1) {
      event.stopPropagation();
      const position = event.data.getLocalPosition(this);

      // Delta movement vector to center content (position is the new center)
      const dx = position.x - (this.#box.width / 2);
      const dy = position.y - (this.#box.height / 2);

      // Apply delta and move content
      this.moveContentTo({ x: this.#content.x - dx, y: this.#content.y - dy });
    }
  }

  moveContentTo(position) {
    // Ensure content remains inside the box boundaries
    const x = clamp(position.x, -this.#content.width + this.#box.width, 0);
    const y = clamp(position.y, -this.#content.height + this.#box.height, 0);

    this.#content.position = { x, y };
    game.emit('viewport_moved', { x, y });
  }
}
