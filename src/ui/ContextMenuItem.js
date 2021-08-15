import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class ContextMenuItem extends PIXI.Container {
  #text;
  #bg;

  constructor(label) {
    super();

    this.#bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#bg.tint = 0xffffff;
    this.#bg.height = Style.baseHeight;
    this.#bg.width = 120;

    this.#text = new PIXI.Text(label, {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColor,
    });
    this.#text.position.set(Style.padding, Style.padding);

    this.addChild(this.#bg, this.#text);

    this.interactive = true;
    this.mouseout = this.defaultStyle;
    this.mouseover = this.hoverStyle;
  }

  defaultStyle() {
    this.#bg.tint = 0xffffff;
    this.#text.style.fill = Style.textColor;
  }

  hoverStyle() {
    this.#bg.tint = Style.bgColorSelected;
    this.#text.style.fill = Style.textColorSelected;
  }
}
