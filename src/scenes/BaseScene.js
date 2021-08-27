import * as PIXI from 'pixi.js';

/**
 * Base class for Scene system
 * See Game.selectScene for creating scene objects
 */
export class BaseScene {
  #game;
  #container;

  constructor(game) {
    this.#game = game;
    // All scene content must added in this container
    this.#container = new PIXI.Container();
  }

  get container() { return this.#container; }
  get game() { return this.#game; }

  // These callbacks are meant to be overriden by child classes

  /**
   * Callback: before destroying the scene
   */
  onExit() { return this; }

  /**
   * Callback: window is resized
   */
  onResize(/* width, height */) { return this; }
}
