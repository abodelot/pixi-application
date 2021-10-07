import * as PIXI from 'pixi.js';
import { Building } from './Building';

export interface BuildingTemplate {
  tw: number;
  th: number;
  rect: PIXI.Rectangle;
}

export class BuildingFactory {
  static dict: Record<string, BuildingTemplate> = {
    'building_2x2a': { tw: 2, th: 2, rect: new PIXI.Rectangle(0, 0, 64, 64) },
    'building_2x2b': { tw: 2, th: 2, rect: new PIXI.Rectangle(0, 64, 64, 80) },
    'building_1x1a': { tw: 1, th: 1, rect: new PIXI.Rectangle(64, 0, 32, 32) },
    'building_1x1b': { tw: 1, th: 1, rect: new PIXI.Rectangle(96, 0, 32, 32) },
    'building_1x1c': { tw: 1, th: 1, rect: new PIXI.Rectangle(128, 0, 32, 32) },
    'building_3x3': { tw: 3, th: 3, rect: new PIXI.Rectangle(64, 32, 96, 64) },
  };

  static make(key: string): Building {
    return new Building(BuildingFactory.dict[key]);
  }
}
