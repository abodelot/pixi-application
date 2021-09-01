import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';

/**
 * Toggle button
 * Display a sprite and a label inside the button.
 */
export class IconToggleButton extends PIXI.Container {
  #bg;
  #icon;
  #metadata;
  #text;

  /**
   * @param metadata: any metadata to attach to the button
   */
  constructor(texture, label, metadata) {
    super();
    this.#metadata = metadata;

    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    this.#bg.width = Style.buttonWidth;
    this.#bg.height = Style.padding * 2 + texture.height;
    this.addChild(this.#bg);

    this.#icon = new PIXI.Sprite(texture);
    this.#icon.position = { x: Style.padding, y: Style.padding };
    this.addChild(this.#icon);

    this.#text = Style.createText(label);
    this.#text.x = this.#icon.x + this.#icon.width + Style.padding;
    this.#text.y = Style.padding;
    this.addChild(this.#text);

    this.interactive = true;
  }

  get metadata() { return this.#metadata; }

  press() {
    this.#bg.texture = Style.textures.button.focus;
  }

  release() {
    this.#bg.texture = Style.textures.button.normal;
  }
}
