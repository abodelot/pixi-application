import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';

import { MiniMap } from './MiniMap';

export class Toolbar extends PIXI.Container {
  #bg;
  #miniMap;

  /**
   * @param width: content width (pixels)
   * @param height: content height (pixels)
   * @param options.tilemap
   * @param options.viewPort
   */
  constructor(width, height, options) {
    super();

    this.#bg = new PIXI.NineSlicePlane(Style.textures.panel, 3, 3, 3, 3);
    this.#bg.width = width;
    this.#bg.height = height;

    // Compute minimap size
    const miniMapHeight = height - 6;
    // Same aspect ratio that real tilemap
    const miniMapWidth = options.tilemap.width * miniMapHeight / options.tilemap.height;
    const ratio = miniMapWidth / options.tilemap.width;
    this.#miniMap = new MiniMap(
      miniMapWidth,
      miniMapHeight,
      options.tilemap,
      options.viewPort,
      ratio,
    );

    // Align on right
    this.#miniMap.x = this.#bg.width - miniMapWidth - 3;
    this.#miniMap.y = 3;

    this.addChild(this.#bg, this.#miniMap);
  }
}
