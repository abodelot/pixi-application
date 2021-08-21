import * as PIXI from 'pixi.js';

/**
 * Application-wide class, used as a singleton. Handle the application state:
 * - Wrapper around PIXI application
 * - Resource manager: Game.loadAssets, Game.getTexture
 * - Scene system: Game.selectScene
 * - Event bus: Game.on, Game.emit
 */
class Game {
  #app;
  #currentScene;
  #loader;
  #listeners;

  initialize(app) {
    this.#app = app;
    this.#currentScene = null;
    this.#loader = new PIXI.Loader();
    this.#listeners = {};

    app.ticker.add((_delta) => {
    });
  }

  get app() {
    return this.#app;
  }

  /**
   * Create a new instance of given scene, and display it
   */
  selectScene(SceneClass) {
    if (this.#currentScene != null) {
      this.#currentScene.onExit();
      // Remove display container from previous scene
      this.#app.stage.removeChild(this.#currentScene.container);
    }

    this.#currentScene = new SceneClass(this);
    this.#app.stage.addChild(this.#currentScene.container);
  }

  /**
   * Load assets in the 'assets' directory
   * @param assets: array of paths
   * @param callback: on complete callback function
   */
  loadAssets(assets, callback) {
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
  getTexture(name) {
    const resource = this.#loader.resources[name];
    if (resource === undefined) {
      throw Error(`Resource ${name} is not loaded.`);
    }
    return resource.texture;
  }

  /**
   * Trigger an event
   */
  emit(eventName, argument) {
    console.log(`Event ${eventName} -> ${argument}`);
    if (this.#listeners[eventName]) {
      this.#listeners[eventName].forEach((callback) => {
        callback(argument);
      });
    }
  }

  /**
   * Register an event listener
   */
  on(eventName, callback) {
    if (this.#listeners[eventName] === undefined) {
      this.#listeners[eventName] = [];
    }
    this.#listeners[eventName].push(callback);
  }
}

export const game = new Game();
