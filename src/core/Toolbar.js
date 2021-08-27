import * as PIXI from 'pixi.js';

import { Context } from '@src/core/Context';
import { Style } from '@src/ui/Style';
import { MiniMap } from './MiniMap';

const miniMapMargin = 5;

export class Toolbar extends PIXI.Container {
  #bg;
  #miniMap;

  /**
   * @param width: content width (pixels)
   * @param height: content height (pixels)
   */
  constructor(width, height) {
    super();

    this.#bg = Style.createNineSlicePane(Style.textures.tab.panel);
    this.#bg.width = width;
    this.#bg.height = height;

    // Compute minimap size
    const miniMapHeight = height - miniMapMargin * 2;
    // Same aspect ratio that real tilemap
    const miniMapWidth = Context.tilemap.width * miniMapHeight / Context.tilemap.height;
    this.#miniMap = new MiniMap(miniMapWidth, miniMapHeight);

    // Align on right
    this.#miniMap.x = this.#bg.width - miniMapWidth - miniMapMargin;
    this.#miniMap.y = miniMapMargin;

    this.addChild(this.#bg, this.#miniMap);
  }

  resize(width, height) {
    this.#bg.width = width;
    this.#bg.height = height;
    this.#miniMap.x = this.#bg.width - this.#miniMap.width - miniMapMargin;
    this.#miniMap.rebuildScreenView();
  }
}
