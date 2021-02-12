import * as PIXI from 'pixi.js';

class Game {
  initialize(app) {
    this._app = app;
    this._loader = new PIXI.Loader();
  }

  /**
   * Load assets in the 'assets' directory
   * @param assets: array of paths
   * @param callback: on complete callback function
   */
  loadAssets(assets, callback) {
    assets.forEach((path) => {
      this._loader.add(path, `assets/${path}`);
    });
    this._loader.load(callback);
  }

  /**
   * Get a texture from the assets directory
   * @param name: image filename
   * @return PIXI.Texture
   */
  getTexture(name) {
    const resource = this._loader.resources[name];
    if (resource === undefined) {
      throw Error(`Resource ${name} is not loaded.`);
    }
    return resource.texture;
  }
}

// Export as a singleton instance
export default new Game();
