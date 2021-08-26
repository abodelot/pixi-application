import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';
import { game } from './Game';

/**
 * A toggle button for selecting a tileId.
 * Display 1 tile and a label inside the button.
 */
export class TileSelectorButton extends PIXI.Container {
  #bg;
  #tileSprite;
  #tileId;
  #text;

  constructor(texture, tileId, label) {
    super();
    this.#tileId = tileId;

    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    this.#bg.width = 100;
    this.#bg.height = Style.padding * 2 + texture.height;
    this.addChild(this.#bg);

    this.#tileSprite = new PIXI.Sprite(texture);
    this.#tileSprite.position = { x: Style.padding, y: Style.padding };
    this.addChild(this.#tileSprite);

    this.#text = Style.createText(label);
    this.#text.x = this.#tileSprite.x + this.#tileSprite.width + Style.padding;
    this.#text.y = Style.padding;
    this.addChild(this.#text);

    this.interactive = true;
  }

  press() {
    this.#bg.texture = Style.textures.button.focus;
    game.emit('tile_id_selected', this.#tileId);
  }

  release() {
    this.#bg.texture = Style.textures.button.normal;
  }
}
