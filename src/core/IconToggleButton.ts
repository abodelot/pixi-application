import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';

/**
 * Toggle button
 * Display a sprite and a label inside the button.
 */
export class IconToggleButton extends PIXI.Container {
  readonly #bg: PIXI.NineSlicePlane;
  readonly #icon: PIXI.Sprite;
  readonly #text: PIXI.Text;

  /**
   * @param metadata: any metadata to attach to the button
   */
  constructor(texture: PIXI.Texture, label: string) {
    super();

    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    this.#bg.width = Style.buttonWidth;
    this.addChild(this.#bg);

    this.#icon = new PIXI.Sprite(texture);
    this.#icon.position.set(Style.padding, Style.padding);
    this.addChild(this.#icon);

    this.#text = Style.createText(label);
    this.#bg.height = Style.padding * 2 + texture.height;
    this.#text.x = this.#icon.x + this.#icon.width + Style.padding;
    this.#text.y = Style.padding;
    this.addChild(this.#text);

    this.interactive = true;
  }

  press(): void {
    this.#bg.texture = Style.textures.button.focus;
  }

  release(): void {
    this.#bg.texture = Style.textures.button.normal;
  }
}
