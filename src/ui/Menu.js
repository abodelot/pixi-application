import * as PIXI from 'pixi.js';

import Button from './Button';
import Style from './Style';

export default class Menu extends PIXI.Container {
  addOption(name) {
    let y = 0;
    if (this.children.length > 0) {
      const lastItem = this.children[this.children.length - 1];
      y = lastItem.position.y + lastItem.height + Style.MARGIN;
    }

    const button = new Button(name);
    button.position.y = y;
    this.addChild(button);
  }
}
