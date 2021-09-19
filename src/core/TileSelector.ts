import * as PIXI from 'pixi.js';

import { Button } from '@src/ui/Button';
import { EditorScene } from '@src/scenes/EditorScene';
import { EventBus } from './EventBus';
import { Tileset } from './Tileset';
import { IconToggleButton } from './IconToggleButton';
import { Context } from './Context';

/**
 * Display a toggle button for each kind of tile
 */
export class TileSelector extends PIXI.Container {
  static TILES: Record<string, number> = {
    'Grass': Tileset.GrassBase,
    'Dirt': Tileset.DirtBase,
    'Sand': Tileset.SandBase,
    'Water': Tileset.WaterBase,
  };

  #selectedButton?: IconToggleButton;

  constructor(tileset: Tileset) {
    super();
    const pos = { x: 16, y: 16 };
    Object.entries(TileSelector.TILES).forEach(([name, tileId]) => {
      const button = new IconToggleButton(tileset.getTileTexture(tileId), name);
      button.position.set(pos.x, pos.y);
      // Stack buttons vertically
      pos.y += button.height;
      this.addChild(button);
      button.on('pointertap', () => {
        this.onButtonClicked(button, 'set_tile', tileId);
      });
    });

    const tools = Context.game.getTexture('tools.png').baseTexture;
    const buttonMinus = new IconToggleButton(
      new PIXI.Texture(tools, new PIXI.Rectangle(0, 0, 32, 20)), 'Dig',
    );
    pos.y += 30;
    buttonMinus.position.set(pos.x, pos.y);
    buttonMinus.on('pointertap', () => { this.onButtonClicked(buttonMinus, 'dig'); });
    this.addChild(buttonMinus);

    const buttonPlus = new IconToggleButton(
      new PIXI.Texture(tools, new PIXI.Rectangle(32, 0, 32, 20)), 'Raise',
    );
    pos.y += buttonMinus.height;
    buttonPlus.position.set(pos.x, pos.y);
    buttonPlus.on('pointertap', () => { this.onButtonClicked(buttonPlus, 'raise'); });
    this.addChild(buttonPlus);

    const buttonRoad = new IconToggleButton(tileset.getTileTexture(64), 'Road');
    pos.y += 60;
    buttonRoad.position.set(pos.x, pos.y);
    buttonRoad.on('pointertap', () => { this.onButtonClicked(buttonRoad, 'set_road'); });
    this.addChild(buttonRoad);

    const button = new Button('Random map');
    button.on('pointertap', () => {
      fetch('assets/html/map_popup.html')
        .then((response) => response.text())
        .then((html) => {
          document.querySelector('#popup-wrapper').innerHTML = html;
        });
    });
    document.addEventListener('map_popup_submit', ((event: CustomEvent) => {
      EditorScene.createNewMap(event.detail);
    }) as EventListener);
    pos.y += 60;
    button.position.set(pos.x, pos.y);
    this.addChild(button);
  }

  onButtonClicked(button: IconToggleButton, action: string, metadata: unknown = null): void {
    if (this.#selectedButton) {
      this.#selectedButton.release();
    }
    button.press();
    this.#selectedButton = button;

    switch (action) {
      case 'raise':
        EventBus.emit('elevation_selected', 'raise');
        break;
      case 'dig':
        EventBus.emit('elevation_selected', 'dig');
        break;
      case 'set_tile':
        EventBus.emit('tile_id_selected', metadata);
        break;
      case 'set_road':
        EventBus.emit('road_selected');
        break;
      default:
        console.error('Unsupported button metadata:', metadata);
    }
  }
}
