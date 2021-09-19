import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class ContextMenuItem extends PIXI.Container {
  #text;
  #bg;

  constructor(label: string) {
    super();

    this.#bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#bg.tint = 0xffffff;
    this.#bg.height = Style.baseHeight;
    this.#bg.width = 120;

    this.#text = Style.createText(label);
    this.#text.position.set(Style.padding, Style.padding);

    this.addChild(this.#bg, this.#text);

    this.interactive = true;
    this.on('mouseout', this.defaultStyle.bind(this));
    this.on('mouseover', this.hoverStyle.bind(this));
  }

  defaultStyle(): void {
    this.#bg.tint = 0xffffff;
    this.#text.style.fill = Style.textColor;
  }

  hoverStyle(): void {
    this.#bg.tint = Style.bgColorSelected;
    this.#text.style.fill = Style.textColorSelected;
  }
}
