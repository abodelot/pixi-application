import * as PIXI from 'pixi.js';
import { TileSelectorButton } from './TileSelectorButton';

/**
 * Display a toggle button for each kind of tile
 */
export class TileSelector extends PIXI.Container {
  static TILES = [
    ['Null', 0],
    ['Grass', 1],
    ['Sand', 2],
    ['Dirt', 3],
    ['Water', 8],
    ['Road', 40],
  ];

  #selectedButton;

  constructor(tileset) {
    super();
    const pos = { x: 16, y: 16 };
    TileSelector.TILES.forEach(([name, tileId]) => {
      const button = new TileSelectorButton(tileset.getTileTexture(tileId), tileId, name);
      button.position = pos;
      // Stack buttons vertically
      pos.y += button.height;
      this.addChild(button);
      button.pointertap = () => { this.onButtonClicked(button); };
    });

    // Select first
    this.#selectedButton = this.children[0];
    this.#selectedButton.press();
  }

  onButtonClicked(button) {
    this.#selectedButton.release();
    button.press();
    this.#selectedButton = button;
  }
}
