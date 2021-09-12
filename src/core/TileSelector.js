import * as PIXI from 'pixi.js';

import { Button } from '@src/ui/Button';
import { EditorScene } from '@src/scenes/EditorScene';
import { Tileset } from './Tileset';
import { game } from './Game';
import { IconToggleButton } from './IconToggleButton';

/**
 * Display a toggle button for each kind of tile
 */
export class TileSelector extends PIXI.Container {
  static TILES = [
    ['Grass', Tileset.GrassBase],
    ['Dirt', Tileset.DirtBase],
    ['Sand', Tileset.SandBase],
    ['Water', Tileset.WaterBase],
    ['Road', 64],
  ];

  #selectedButton;

  constructor(tileset) {
    super();
    const pos = { x: 16, y: 16 };
    TileSelector.TILES.forEach(([name, tileId]) => {
      const button = new IconToggleButton(
        tileset.getTileTexture(tileId),
        name,
        { action: 'set_tile', tileId },
      );
      button.position = pos;
      // Stack buttons vertically
      pos.y += button.height;
      this.addChild(button);
      button.pointertap = () => { this.onButtonClicked(button); };
    });

    // Select first
    this.#selectedButton = this.children[0];
    this.#selectedButton.press();

    const tools = game.getTexture('tools.png');
    const buttonMinus = new IconToggleButton(
      new PIXI.Texture(tools, new PIXI.Rectangle(0, 0, 32, 20)),
      'Dig',
      { action: 'dig' },
    );
    buttonMinus.x = pos.x;
    buttonMinus.y = pos.y + buttonMinus.height;
    buttonMinus.pointertap = () => { this.onButtonClicked(buttonMinus); };
    this.addChild(buttonMinus);

    const buttonPlus = new IconToggleButton(
      new PIXI.Texture(tools, new PIXI.Rectangle(32, 0, 32, 20)),
      'Raise',
      { action: 'raise' },
    );
    buttonPlus.x = pos.x;
    buttonPlus.y = buttonMinus.y + buttonMinus.height;
    buttonPlus.pointertap = () => { this.onButtonClicked(buttonPlus); };
    this.addChild(buttonPlus);

    const button = new Button('Random map');
    button.pointertap = () => {
      fetch('assets/html/map_popup.html')
        .then((response) => response.text())
        .then((html) => {
          document.querySelector('#popup-wrapper').innerHTML = html;
        });
    };
    document.addEventListener('map_popup_submit', (event) => {
      EditorScene.createNewMap(event.detail);
    });
    button.x = pos.x;
    button.y = pos.y + 100;
    this.addChild(button);
  }

  onButtonClicked(button) {
    this.#selectedButton.release();
    button.press();
    this.#selectedButton = button;

    switch (button.metadata.action) {
      case 'raise':
        game.emit('elevation_selected', 'raise');
        break;
      case 'dig':
        game.emit('elevation_selected', 'dig');
        break;
      case 'set_tile':
        game.emit('tile_id_selected', button.metadata.tileId);
        break;
      default:
        console.error('Unsupported button metadata:', button.metadata);
    }
  }
}
