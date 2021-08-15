import * as PIXI from 'pixi.js';

import { BaseScene } from './BaseScene';

export class EditorScene extends BaseScene {
  constructor(game) {
    super(game);

    this.container.addChild(new PIXI.Text('Editor!'));
  }
}
