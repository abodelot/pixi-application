import { Tileset } from '@src/core/Tileset';
import { Tilemap } from '@src/core/Tilemap';
import { TileSelector } from '@src/core/TileSelector';
import { Toolbar } from '@src/core/Toolbar';

import { ContextMenu } from '@src/ui/ContextMenu';
import { ScrollContainer } from '@src/ui/ScrollContainer';

import { BaseScene } from './BaseScene';
import { MainMenuScene } from './MainMenuScene';

export class EditorScene extends BaseScene {
  #tilemap;

  constructor(game) {
    super(game);

    const tileset = new Tileset(game.getTexture('tileset.png'), 32, 16);
    const tileSelector = new TileSelector(tileset);
    this.container.addChild(tileSelector);

    const toolbarHeight = 200;

    const scrollContainer = new ScrollContainer({
      width: window.innerWidth - 256,
      height: window.innerHeight - toolbarHeight,
    });
    scrollContainer.x = 256;

    this.container.addChild(scrollContainer);
    this.#tilemap = new Tilemap(tileset);
    if (!this.#tilemap.loadFromLocalStorage()) {
      this.createNewMap();
    }

    scrollContainer.setContent(this.#tilemap);

    // Toolbar at screen bottom
    const toolbar = new Toolbar({
      width: window.innerWidth,
      height: toolbarHeight,
      tilemap: this.#tilemap,
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
