import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';

import { MiniMap } from './MiniMap';

export class Toolbar extends PIXI.Container {
  #bg;
  #miniMap;

  constructor(options) {
    super();

    this.#bg = new PIXI.NineSlicePlane(Style.textures.panel, 3, 3, 3, 3);
    this.#bg.width = options.width;
    this.#bg.height = options.height;

    this.#miniMap = new MiniMap(options.tilemap);

    const h = options.height - 6;
    this.#miniMap.height = h;
    // Same aspect ratio that real tilemap
    const miniMapWidth = options.tilemap.width * h / options.tilemap.height;
    this.#miniMap.width = miniMapWidth;

    // Align on right
    this.#miniMap.x = this.#bg.width - miniMapWidth - 3;
    this.#miniMap.y = 3;

    this.addChild(this.#bg, this.#miniMap);
  }
}
