import * as PIXI from 'pixi.js';

/**
 * Base class for Scene system
 * See Game.selectScene for creating scene objects
 */
export abstract class BaseScene {
  readonly container: PIXI.Container;

  constructor() {
    // All scene content must added in this container
    this.container = new PIXI.Container();
  }

  // These callbacks are meant to be overriden by child classes

  /**
   * Callback: before destroying the scene
   */
  abstract onExit(): void;

  /**
   * Callback: window is resized
   */
  abstract onResize(width: number, height: number): void;
}
