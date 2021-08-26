import * as PIXI from 'pixi.js';

import { Tileset } from '@src/core/Tileset';
import { Tilemap } from '@src/core/Tilemap';
import { TileSelector } from '@src/core/TileSelector';
import { TilesetViewer } from '@src/core/TilesetViewer';
import { Toolbar } from '@src/core/Toolbar';

import { ContextMenu } from '@src/ui/ContextMenu';
import { ScrollContainer } from '@src/ui/ScrollContainer';

import { TabContainer } from '@src/ui/TabContainer';

import { BaseScene } from './BaseScene';
import { MainMenuScene } from './MainMenuScene';

export class EditorScene extends BaseScene {
  #tilemap;

  constructor(game) {
    super(game);

    const toolbarHeight = 200;
    const sidebarWidth = 260;

    const tabs = new TabContainer(sidebarWidth, window.innerHeight - toolbarHeight);
    this.container.addChild(tabs);

    const tileset = new Tileset(game.getTexture('tileset.png'), 32, 16);
    tabs.addTab('Terrain', new TileSelector(tileset));
    tabs.addTab('Tileset', new TilesetViewer(tileset));
    tabs.addTab('Items', new PIXI.Text('Content of tab 3'));

    const viewPort = {
      width: window.innerWidth - sidebarWidth,
      height: window.innerHeight - toolbarHeight,
    };

    const scrollContainer = new ScrollContainer(viewPort.width, viewPort.height);
    scrollContainer.x = sidebarWidth;

    this.container.addChild(scrollContainer);
    this.#tilemap = new Tilemap(tileset);
    if (!this.#tilemap.loadFromLocalStorage()) {
      this.createNewMap();
    }

    scrollContainer.setContent(this.#tilemap);

    // Toolbar at screen bottom
    const toolbar = new Toolbar(window.innerWidth, toolbarHeight, {
      tilemap: this.#tilemap,
      viewPort,
    });
    toolbar.y = window.innerHeight - toolbarHeight;
    this.container.addChild(toolbar);

    let contextMenu = null;
    // Replace native right click with custom menu
    game.app.view.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (contextMenu) {
        contextMenu.close();
      }
      contextMenu = new ContextMenu();
      contextMenu.addItem('New map', this.createNewMap.bind(this));
      contextMenu.addItem('Save', () => {
        this.#tilemap.saveToLocalStorage();
      });
      contextMenu.addItem('Save and quit', () => {
        this.#tilemap.saveToLocalStorage();
        game.selectScene(MainMenuScene);
      });
      contextMenu.position.set(e.pageX, e.pageY);
      game.app.stage.addChild(contextMenu);
    };
  }

  /**
   * Create a new empty map
   */
  createNewMap(size = 100) {
    const emptyMap = [];
    emptyMap.length = size * size;
    emptyMap.fill(1); // Default tile: grass
    this.#tilemap.load(emptyMap, size, size);
  }

  onExit() { // override
    // Restore native context menu
    this.game.app.view.oncontextmenu = null;
  }
}
