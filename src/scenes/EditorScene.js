import * as PIXI from 'pixi.js';

import { Tileset } from '@src/core/Tileset';
import { Tilemap } from '@src/core/Tilemap';
import { TileSelector } from '@src/core/TileSelector';
import { TilesetViewer } from '@src/core/TilesetViewer';
import { Context } from '@src/core/Context';
import { Toolbar } from '@src/core/Toolbar';

import { ContextMenu } from '@src/ui/ContextMenu';
import { ScrollContainer } from '@src/ui/ScrollContainer';
import { TabContainer } from '@src/ui/TabContainer';

import { BaseScene } from './BaseScene';
import { MainMenuScene } from './MainMenuScene';

const TOOLBAR_HEIGHT = 200;
const SIDEBAR_WIDTH = 260;

export class EditorScene extends BaseScene {
  #tabs;
  #toolbar;
  #scrollContainer;

  constructor(game) {
    super(game);

    this.#tabs = new TabContainer(SIDEBAR_WIDTH, window.innerHeight - TOOLBAR_HEIGHT);
    this.container.addChild(this.#tabs);

    const tileset = new Tileset(game.getTexture('tileset.png'), 32, 16, 4);
    this.#tabs.addTab('Terrain', new TileSelector(tileset));
    this.#tabs.addTab('Tileset', new TilesetViewer(tileset));
    this.#tabs.addTab('Items', new PIXI.Text('Content of tab 3'));

    Context.viewPort = {
      width: window.innerWidth - SIDEBAR_WIDTH,
      height: window.innerHeight - TOOLBAR_HEIGHT,
    };

    this.#scrollContainer = new ScrollContainer(Context.viewPort.width, Context.viewPort.height);
    this.#scrollContainer.x = SIDEBAR_WIDTH;

    this.container.addChild(this.#scrollContainer);
    Context.tilemap = new Tilemap(tileset);
    if (!Context.tilemap.loadFromLocalStorage()) {
      EditorScene.createNewMap();
    }

    this.#scrollContainer.setContent(Context.tilemap);

    // Toolbar at screen bottom
    this.#toolbar = new Toolbar(window.innerWidth, TOOLBAR_HEIGHT);
    this.#toolbar.y = window.innerHeight - TOOLBAR_HEIGHT;
    this.container.addChild(this.#toolbar);

    let contextMenu = null;
    // Replace native right click with custom menu
    game.app.view.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (contextMenu) {
        contextMenu.close();
      }
      contextMenu = new ContextMenu();
      contextMenu.addItem('New map', EditorScene.createNewMap);
      contextMenu.addItem('Save', () => {
        Context.tilemap.saveToLocalStorage();
      });
      contextMenu.addItem('Save and quit', () => {
        Context.tilemap.saveToLocalStorage();
        game.selectScene(MainMenuScene);
      });
      contextMenu.position.set(e.pageX, e.pageY);
      game.app.stage.addChild(contextMenu);
    };
  }

  /**
   * Create a new empty map
   */
  static createNewMap(size = 100) {
    const emptyMap = [];
    emptyMap.length = size * size;
    emptyMap.fill(0); // Default tile: grass
    const elevations = [];
    elevations.length = size * size;
    elevations.fill(0);
    Context.tilemap.load(emptyMap, elevations, size, size);
  }

  // override
  onExit() {
    // Restore native context menu
    this.game.app.view.oncontextmenu = null;
  }

  // override
  onResize(width, height) {
    Context.viewPort = {
      width: width - SIDEBAR_WIDTH,
      height: height - TOOLBAR_HEIGHT,
    };

    this.#tabs.resize(SIDEBAR_WIDTH, height - TOOLBAR_HEIGHT);
    this.#toolbar.resize(width, TOOLBAR_HEIGHT);
    this.#toolbar.y = height - TOOLBAR_HEIGHT;
    this.#scrollContainer.resize(Context.viewPort.width, Context.viewPort.height);
  }
}
