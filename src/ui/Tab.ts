import * as PIXI from 'pixi.js';

import { Style } from './Style';

export class Tab extends PIXI.Container {
  readonly #text: PIXI.Text;
  readonly #bg: PIXI.NineSlicePlane;
  #pressed: boolean;

  constructor(name: string) {
    super();

    this.#text = Style.createText(name);
    this.#text.x = Style.padding;
    this.#bg = Style.createNineSlicePane(Style.textures.tab.normal);
    this.unselect();

    // Events
    this.interactive = true;
    this.on('pointerout', this.onPointerOut.bind(this));
    this.on('pointerover', this.onPointerOver.bind(this));
    this.addChild(this.#bg, this.#text);
  }

  getBaseWidth(): number {
    return this.#text.width + Style.padding * 2;
  }

  select(): void {
    this.#pressed = true;
    this.#bg.texture = Style.textures.tab.focus;
    // When selected, the tab grows horizontally (tabBorder * 2), expanding over the neighbor tabs
    // and vertically (tabBorder), pulling the text higher
    this.#bg.x = -Style.tabBorder;
    this.#bg.y = -Style.tabBorder;
    this.#bg.width = this.getBaseWidth() + Style.tabBorder * 2;
    this.#bg.height = Style.buttonHeight + Style.tabBorder;
    this.#text.y = (Style.buttonHeight - this.#text.height) / 2 - Style.tabBorder;

    this.zIndex = 1;
  }

  unselect(): void {
    this.#pressed = false;
    this.#bg.texture = Style.textures.tab.normal;
    // Restore the tab original position and size
    this.#bg.width = this.getBaseWidth();
    this.#bg.height = Style.buttonHeight;
    this.#bg.x = 0;
    this.#bg.y = 0;
    this.#text.y = (Style.buttonHeight - this.#text.height) / 2;

    this.zIndex = 0;
  }

  onPointerOver(): void {
    if (!this.#pressed) {
      this.#bg.texture = Style.textures.tab.hover;
    } else {
      this.#bg.texture = Style.textures.tab.focus;
    }
  }

  onPointerOut(): void {
    if (!this.#pressed) {
      this.#bg.texture = Style.textures.tab.normal;
    } else {
      this.#bg.texture = Style.textures.tab.focus;
    }
  }
}
