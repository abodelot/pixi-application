import * as PIXI from 'pixi.js';

import { Point } from '@src/core/Types';
import { Context } from '@src/core/Context';
import { EventBus } from '@src/core/EventBus';
import { clamp } from '@src/core/Utils';
import { Tilemap } from '@src/core/Tilemap';

const ZOOM_MIN = 1;
const ZOOM_MAX = 10;

/**
 * Container with a clipping mask for scolling content
 */
export class ScrollContainer extends PIXI.Container {
  #box;
  #content: Tilemap;
  #zoomFactor: number; // Size multiplicator applied to content

  /**
   * @param viewWidth: viewport width (pixels)
   * @param viewHeight: viewport height (pixels)
   */
  constructor(viewWidth: number, viewHeight: number) {
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
    this.on('pointerdown', this.onPointerDown.bind(this));

    // Use a mask to crop content outside of the bounding box
    const mask = new PIXI.Graphics();
    mask.beginFill();
    mask.drawRect(0, 0, viewWidth, viewHeight);
    mask.endFill();
    this.addChild(mask);
    this.mask = mask;

    this.#zoomFactor = 1;

    EventBus.on('minimap_clicked', (pos: Point) => {
      this.moveContentTo(pos.x, pos.y);
    });

    Context.game.app.view.addEventListener('wheel', this.onMouseWheel.bind(this), {
      passive: false,
    });
  }

  setContent(element: Tilemap): void {
    this.#content = element;
    // Center inside view
    this.#content.x = -((this.#content.width - this.#box.width) / 2);
    this.#content.y = -((this.#content.height - this.#box.height) / 2);

    this.addChild(this.#content);
  }

  resize(width: number, height: number): void {
    this.#box.width = width;
    this.#box.height = height;

    this.removeChild(this.mask as PIXI.Graphics);
    const mask = new PIXI.Graphics();
    mask.beginFill();
    mask.drawRect(0, 0, width, height);
    mask.endFill();
    this.addChild(mask);
    this.mask = mask;
  }

  onPointerDown(event: PIXI.InteractionEvent): void {
    // Middle click
    if (event.data.button === 1) {
      event.stopPropagation();
      const position = event.data.getLocalPosition(this);

      // Delta movement vector to center content (position is the new center)
      const dx = position.x - (this.#box.width / 2);
      const dy = position.y - (this.#box.height / 2);

      // Apply delta and move content
      this.moveContentTo(this.#content.x - dx, this.#content.y - dy);
    }
  }

  onMouseWheel(event: WheelEvent): void {
    const pos = { x: event.offsetX, y: event.offsetY };
    // Check that pointer is still over container
    const target = Context.game.app.renderer.plugins.interaction.hitTest(pos);
    if (target === this.#content) {
      const pointer = this.toLocal(pos);
      if (event.deltaY > 0 && this.#zoomFactor > ZOOM_MIN) {
        this.#zoomFactor--;
      } else if (event.deltaY < 0 && this.#zoomFactor < ZOOM_MAX) {
        this.#zoomFactor++;
      } else {
        return;
      }

      // Pointer position, relative to the content
      const dx = pointer.x - this.#content.x;
      const dy = pointer.y - this.#content.y;
      const oldSize = this.#content.width;

      // Resize content
      this.#content.width = this.#content.pixelWidth * this.#zoomFactor;
      this.#content.height = this.#content.pixelHeight * this.#zoomFactor;

      // Adjust content position, so pointer is still hovering the same place
      const newSize = this.#content.width;
      const ratio = newSize / oldSize;
      this.#content.x = -(dx * ratio) + pointer.x;
      this.#content.y = -(dy * ratio) + pointer.y;

      // Refresh minimap
      Context.miniMap.rebuildScreenView();
      Context.miniMap.moveScreenView(this.#content.position);
    }
  }

  moveContentTo(x: number, y: number): void {
    // Ensure content remains inside the box boundaries
    x = Math.floor(clamp(x, -this.#content.width + this.#box.width, 0));
    y = Math.floor(clamp(y, -this.#content.height + this.#box.height, 0));

    this.#content.position.set(x, y);
    EventBus.emit('viewport_moved', { x, y });
  }
}
