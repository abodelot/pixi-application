import * as PIXI from 'pixi.js';

import { Button } from '@src/ui/Button';
import { RadioGroup } from '@src/ui/RadioGroup';
import { Style } from '@src/ui/Style';

import { EditorScene } from '@src/scenes/EditorScene';
import { EventBus } from './EventBus';
import { Tileset } from './Tileset';
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

  constructor(tileset: Tileset) {
    super();

    const tools = Context.game.getTexture('tools.png').baseTexture;
    const iconDig = new PIXI.Texture(tools, new PIXI.Rectangle(0, 0, 32, 20));
    const iconRaise = new PIXI.Texture(tools, new PIXI.Rectangle(32, 0, 32, 20));
    const iconRoad = tileset.getTileTexture(64);

    const group = new RadioGroup();
    Object.entries(TileSelector.TILES).forEach(([name, tileId]) => {
      group.addButton(name, tileset.getTileTexture(tileId))
        .onChecked(() => EventBus.emit('tile_id_selected', tileId));
    });

    group.addButton('Road', iconRoad)
      .onChecked(() => EventBus.emit('road_selected'));
    group.addButton('Dig', iconDig)
      .onChecked(() => EventBus.emit('elevation_selected', 'dig'));
    group.addButton('Raise', iconRaise)
      .onChecked(() => EventBus.emit('elevation_selected', 'raise'));

    this.addChild(group);

    const btnNewMap = new Button('Random map');
    btnNewMap.on('pointertap', () => {
      fetch('assets/html/map_popup.html')
        .then((response) => response.text())
        .then((html) => {
          document.querySelector('#popup-wrapper').innerHTML = html;
        });
    });

    document.addEventListener('map_popup_submit', ((event: CustomEvent) => {
      EditorScene.createNewMap(event.detail);
    }) as EventListener);

    btnNewMap.position.y = group.y + group.height + Style.tabContentPadding;
    this.addChild(btnNewMap);
  }
}
