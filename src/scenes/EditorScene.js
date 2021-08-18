import { Tileset } from '@src/core/Tileset';
import { Tilemap } from '@src/core/Tilemap';
import { TileSelector } from '@src/core/TileSelector';

import { BaseScene } from './BaseScene';

export class EditorScene extends BaseScene {
  constructor(game) {
    super(game);

    const tileset = new Tileset(game.getTexture('tileset.png'), 32, 16);
    const tileSelector = new TileSelector(tileset);
    this.container.addChild(tileSelector);

    const tilemap = new Tilemap(tileset);
    tilemap.x = 256;
    this.container.addChild(tilemap);
    if (!tilemap.loadFromLocalStorage()) {
      // Create a default empty map
      const defaultMap = [];
      const width = 25;
      const height = 25;
      defaultMap.length = width * height;
      defaultMap.fill(2); // Water
      tilemap.load(defaultMap, width, height);
    }
    // Zoom 2x
    tilemap.setScale(2);
  }
}
