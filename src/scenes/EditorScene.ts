import * as PIXI from 'pixi.js';

import { ContextMenu } from '@src/ui/ContextMenu';
import { ScrollContainer } from '@src/ui/ScrollContainer';
import { Style } from '@src/ui/Style';
import { TabContainer } from '@src/ui/TabContainer';

import { Tileset, TileType, MAX_ELEVATION } from '@src/core/Tileset';
import { Tilemap } from '@src/core/Tilemap';
import { TileSelector } from '@src/core/TileSelector';
import { DebugBox } from '@src/core/DebugBox';
import { Context } from '@src/core/Context';
import { Toolbar } from '@src/core/Toolbar';
import { clamp, normalize } from '@src/core/Utils';
import { Perlin } from '../vendor/PerlinNoise';

import { BaseScene } from './BaseScene';
import { MainMenuScene } from './MainMenuScene';

const TOOLBAR_HEIGHT = 200;
const SIDEBAR_WIDTH = 260 + Style.padding * 2 + Style.tabContentPadding * 2;

export class EditorScene extends BaseScene {
  #tabs: TabContainer;
  #toolbar: Toolbar;
  #scrollContainer: ScrollContainer;

  constructor() {
    super();

    this.#tabs = new TabContainer(SIDEBAR_WIDTH - 16, window.innerHeight - TOOLBAR_HEIGHT - 16);
    this.#tabs.position.set(8, 8);
    this.container.addChild(this.#tabs);

    const tileset = new Tileset(Context.game.getTexture('tileset2.png'), 32, 16, 8);
    this.#tabs.addTab('Terrain', new TileSelector());
    this.#tabs.addTab('Items', new PIXI.Text('Tab content'));

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

    const debugBox = new DebugBox();
    debugBox.x = window.innerWidth - debugBox.width - 10;
    debugBox.y = 10;
    this.container.addChild(debugBox);

    let contextMenu: ContextMenu = null;
    // Replace native right click with custom menu
    Context.game.app.view.oncontextmenu = (e) => {
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
        Context.game.selectScene(MainMenuScene);
      });
      contextMenu.position.set(e.pageX, e.pageY);
      Context.game.app.stage.addChild(contextMenu);
    };

    Context.game.app.view.onclick = (_event) => {
      if (contextMenu) {
        contextMenu.close();
      }
    };
  }

  /**
   * Create a new random map
   * @param size: map size (nb tiles = size*size)
   * @param scale: Noise scale (= size of variations in elevations)
   * @param minNoise: generated noise < minNoise will be converted to minNoise
   * @param maxNoise: generated noise > maxNoise will be converted to maxNoise
   * @param functionName: simplex|perlin
   */
  static createNewMap({
    size = 100,
    scale = 90,
    minNoise = 0,
    maxNoise = 1,
    functionName = 'simplex',
  } = {}): void {
    // Empty map
    const tileIds: TileType[][] = new Array(size).fill(0)
      .map(() => new Array(size).fill(TileType.Grass));

    // Generate elevation map for each tile corner
    const zWidth = size + 1;
    const zHeight = size + 1;
    const zVertices: number[][] = new Array(zWidth).fill(0).map(() => new Array(zHeight).fill(0));

    const perlin = new Perlin(functionName);

    for (let x = 0; x < zWidth; ++x) {
      for (let y = 0; y < zHeight; ++y) {
        // Generate noise
        let n = perlin.noise(x / scale, y / scale, 0);
        n = clamp(n, minNoise, maxNoise);

        // Transform to elevation value
        const tz = Math.floor(normalize(n, 0, 1, 0, MAX_ELEVATION));
        zVertices[x][y] = tz;
      }
    }

    Context.tilemap.load(tileIds, zVertices, size, size);
    if (Context.miniMap) {
      Context.miniMap.rebuildMiniMap();
    }
  }

  onExit(): void {
    // Restore native context menu
    Context.game.app.view.oncontextmenu = null;
  }

  // override
  onResize(width: number, height: number): void {
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
