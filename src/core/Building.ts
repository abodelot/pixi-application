import * as PIXI from 'pixi.js';
import { Context } from './Context';
import { BuildingTemplate } from './BuildingFactory';

export class Building {
  readonly sprite: PIXI.Sprite;
  readonly template: BuildingTemplate;

  constructor(template: BuildingTemplate) {
    this.template = template;
    this.sprite = new PIXI.Sprite(this.getTexture());
  }

  moveTo(x: number, y: number): void {
    this.sprite.position.y = y - (this.template.rect.height - (this.template.th * 16));
    this.sprite.position.x = x - (this.template.tw / 2 - 0.5) * 32;
  }

  getTexture(): PIXI.Texture {
    return new PIXI.Texture(
      Context.game.getTexture('buildings.png').baseTexture,
      this.template.rect,
    );
  }
}
