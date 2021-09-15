import * as PIXI from 'pixi.js';

import { Style } from './Style';
import { ContextMenuItem } from './ContextMenuItem';

export class ContextMenu extends PIXI.Container {
  #itemContainer;
  #shadow;

  constructor() {
    super();
    this.#itemContainer = new PIXI.Container();
    this.#shadow = Style.createShadow(0, 0);

    this.addChild(this.#shadow, this.#itemContainer);
  }

  addItem(label, callback) {
    const count = this.#itemContainer.children.length;
    const offsetY = count * Style.baseHeight;

    const item = new ContextMenuItem(label, callback);
    item.pointertap = () => {
      this.close();
      if (callback) {
        callback();
      }
    };

    item.position.y = offsetY;
    this.#itemContainer.addChild(item);

    // Resize shadow sprite
    this.#shadow.width = this.#itemContainer.width + Style.shadowRadius * 2;
    this.#shadow.height = this.#itemContainer.height + Style.shadowRadius * 2;
  }

  /**
   * Remove context menu from parent
   */
  close() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }
}
