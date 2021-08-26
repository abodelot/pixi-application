import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class Tab extends PIXI.Container {
  #text;
  #bg;
  #pressed;

  constructor(name) {
    super();

    this.#text = Style.createText(name);
    this.#bg = Style.createNineSlicePane(Style.textures.tab.normal);
    const padx = Style.padding * 2; // inner horizontal padding
    this.#bg.width = padx * 2 + this.#text.width;
    this.#bg.height = Style.buttonHeight;

    this.#text.x = padx;
    this.#text.y = (Style.buttonHeight - this.#text.height) / 2;

    // Events
    this.#pressed = false;
    this.interactive = true;
    this.pointerout = this.onPointerOut;
    this.pointerover = this.onPointerOver;
    this.pointerup = this.onPointerUp;
    this.addChild(this.#bg, this.#text);
  }

  press() {
    this.#pressed = true;
    this.#bg.texture = Style.textures.tab.focus;
  }

  release() {
    this.#pressed = false;
    this.#bg.texture = Style.textures.tab.normal;
  }

  onPointerOver() {
    if (!this.#pressed) {
      this.#bg.texture = Style.textures.tab.hover;
    } else {
      this.#bg.texture = Style.textures.tab.focus;
    }
  }

  onPointerOut() {
    if (!this.#pressed) {
      this.#bg.texture = Style.textures.tab.normal;
    } else {
      this.#bg.texture = Style.textures.tab.focus;
    }
  }
}
