import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class Button extends PIXI.Container {
  #text;
  #bg;

  constructor(name) {
    super();

    this.#text = new PIXI.Text(name, {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textCcolor,
    });

    this.#text.position.x = (Style.buttonWidth - this.#text.width) / 2;
    this.#text.position.y = Style.padding;

    this.#bg = new PIXI.NineSlicePlane(Style.textures.normal, 3, 3, 3, 3);
    this.#bg.width = Style.buttonWidth;
    this.#bg.height = this.#text.height + Style.padding * 2;

    this.addChild(this.#bg, this.#text);

    this.enable(true);
  }

  defaultStyle() {
    this.#bg.texture = Style.textures.normal;
    this.#text.position.y = Style.padding;
  }

  hoverStyle() {
    this.#bg.texture = Style.textures.hover;
    this.#text.position.y = Style.padding;
  }

  focusStyle() {
    this.#bg.texture = Style.textures.focus;
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
