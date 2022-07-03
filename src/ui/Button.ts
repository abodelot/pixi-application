import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class Button extends PIXI.Container {
  #text;
  #bg;

  constructor(name: string) {
    super();

    this.#text = Style.createText(name);
    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    this.#bg.width = Style.buttonWidth;
    this.#bg.height = Style.buttonHeight;

    // Text alignment
    this.#text.x = (Style.buttonWidth - this.#text.width) / 2;
    this.#text.y = Style.padding;

    this.addChild(this.#bg, this.#text);
    // Events
    this.enable(true);
    this.on('pointerout', this.defaultStyle.bind(this));
    this.on('pointerover', this.hoverStyle.bind(this));
    this.on('pointerup', this.defaultStyle.bind(this));
    this.on('pointerdown', this.focusStyle.bind(this));
  }

  defaultStyle(): void {
    if (this.interactive) {
      this.#bg.texture = Style.textures.button.normal;
      this.#text.position.y = Style.padding;
    }
  }

  hoverStyle(): void {
    if (this.interactive) {
      this.#bg.texture = Style.textures.button.hover;
      this.#text.position.y = Style.padding;
    }
  }

  focusStyle(): void {
    if (this.interactive) {
      this.#bg.texture = Style.textures.button.focus;
      this.#text.position.y = Style.padding + 1;
    }
  }

  enable(enabled: boolean): void {
    this.interactive = enabled;

    if (enabled) {
      this.#text.style.fill = Style.textColor;
      this.#text.style.dropShadow = false;
    } else {
      this.#text.style.fill = Style.textColorDisabled;
      this.#text.style.dropShadow = true;
      this.#text.style.dropShadowDistance = 1;
      this.#text.style.dropShadowColor = 0xffffff;
    }
  }
}
