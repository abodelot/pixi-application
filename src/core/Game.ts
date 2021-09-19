import * as PIXI from 'pixi.js';
import { BaseScene } from '@src/scenes/BaseScene';

/**
 * Application-wide class, used as a singleton. Handle the application state:
 * - Wrapper around PIXI application
 * - Resource manager: Game.loadAssets, Game.getTexture
 * - Scene system: Game.selectScene
 */
export class Game {
  readonly app: PIXI.Application;
  readonly #loader: PIXI.Loader;
  #currentScene: BaseScene | null;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.#loader = new PIXI.Loader();
    this.#currentScene = null;
  }

  /**
   * Create a new instance of given scene, and display it
   */
  selectScene(SceneClass: new (game: Game) => BaseScene): void {
    if (this.#currentScene != null) {
      this.#currentScene.onExit();
      // Remove display container from previous scene
      this.app.stage.removeChild(this.#currentScene.container);
    }

    this.#currentScene = new SceneClass(this);
    this.app.stage.addChild(this.#currentScene.container);
  }

  resizeScreen(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.#currentScene.onResize(width, height);
  }

  /**
   * Load assets in the 'assets' directory
   * @param assets: array of paths
   * @param callback: on complete callback function
   */
  loadAssets(assets: string[], callback: (loader: PIXI.Loader) => void): void {
    assets.forEach((path) => {
      this.#loader.add(path, `assets/${path}`);
    });
    this.#loader.load(callback);
  }

  /**
   * Get a texture from the assets directory
   * @param name: image filename
   * @return PIXI.Texture
   */
  getTexture(name: string): PIXI.Texture {
    const resource = this.#loader.resources[name];
    if (resource === undefined) {
      throw Error(`Resource ${name} is not loaded.`);
    }
    return resource.texture;
  }
}
