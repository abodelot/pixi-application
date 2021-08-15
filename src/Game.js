import * as PIXI from 'pixi.js';

export class Game {
  #app;
  #currentScene;
  #loader;

  constructor(app) {
    this.#app = app;
    this.#currentScene = null;
    this.#loader = new PIXI.Loader();
  }

  get app() {
    return this.#app;
  }

  /**
   * Create a new instance of given scene, and display it
   */
  selectScene(SceneClass) {
    if (this.#currentScene != null) {
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
}
