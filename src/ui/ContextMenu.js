import * as PIXI from 'pixi.js';

import Style from './Style';
import ContextMenuItem from './ContextMenuItem';

export default class ContextMenu extends PIXI.Container {
  constructor() {
    super();
    this._itemContainer = new PIXI.Container();

    this._shadow = Style.createShadow(0, 0);

    this.addChild(this._shadow, this._itemContainer);
  }

  addItem(label, callback) {
    const count = this._itemContainer.children.length;
    const offsetY = count * Style.baseHeight;

    const item = new ContextMenuItem(label, callback);
    item.mousedown = () => {
      this.close();
      if (callback) {
        callback();
      }
    };

    item.position.y = offsetY;
    this._itemContainer.addChild(item);

    // Resize shadow sprite
    this._shadow.width = this._itemContainer.width + Style.shadowRadius * 2;
    this._shadow.height = this._itemContainer.height + Style.shadowRadius * 2;
  }

  close() {
    this.parent.removeChild(this);
  }
}
