import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class Button extends PIXI.Container {
  #text;
  #bg;

  constructor(name) {
    super();

    this.#text = Style.createText(name);
    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    this.#bg.width = Style.buttonWidth;
    this.#bg.height = Style.buttonHeight;

    // Text alignment
    this.#text.x = (Style.buttonWidth - this.#text.width) / 2;
    this.#text.y = (Style.buttonHeight - this.#text.height) / 2;

    this.addChild(this.#bg, this.#text);
    this.enable(true);
  }

  defaultStyle() {
    this.#bg.texture = Style.textures.button.normal;
    this.#text.position.y = Style.padding;
  }

  hoverStyle() {
    this.#bg.texture = Style.textures.button.hover;
    this.#text.position.y = Style.padding;
  }

  focusStyle() {
    this.#bg.texture = Style.textures.button.focus;
    this.#text.position.y = Style.padding + 1;
  }

  enable(enabled) {
    this.interactive = enabled;

    if (enabled) {
      this.#text.style.fill = Style.textColor;
      this.#text.style.dropShadow = false;

      // Events
      this.pointerout = this.defaultStyle;
      this.pointerover = this.hoverStyle;
      this.pointerup = this.defaultStyle;
      this.pointerdown = this.focusStyle;
    } else {
      this.#text.style.fill = Style.textColorDisabled;
      this.#text.style.dropShadow = true;
      this.#text.style.dropShadowDistance = 1;
      this.#text.style.dropShadowColor = 0xffffff;

      // Events
      this.pointerout = null;
      this.pointerover = null;
      this.pointerup = null;
      this.pointerdown = null;
    }
  }
}
