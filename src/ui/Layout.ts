import * as PIXI from 'pixi.js';

import { ListenerFn } from '@src/core/Types';

import { Button } from './Button';
import { Style } from './Style';

export class Layout extends PIXI.Container {
  addOption(name: string, callback?: ListenerFn): Button {
    // Stack items on Y axis
    let y = 0;
    if (this.children.length > 0) {
      const lastItem = this.children[this.children.length - 1] as Button;
      y = lastItem.position.y + lastItem.height + Style.margin;
    }

    const button = new Button(name);
    button.position.y = y;
    this.addChild(button);
    if (callback) {
      button.on('pointertap', callback);
    }
    return button;
  }
}
