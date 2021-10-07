import * as PIXI from 'pixi.js';
import { sound } from '@pixi/sound';

import { Tilemap } from './Tilemap';
import { TilemapActionBase } from './TilemapActionBase';
import { BuildingFactory } from './BuildingFactory';
import { Building } from './Building';
import { Tileset } from './Tileset';

/**
 * Action for replacing all tiles in the selected rectangle area with selected tile id
 */
export class TilemapActionBuilding extends TilemapActionBase {
  #building: Building;

  constructor(tilemap: Tilemap, buildingKey: string) {
    super(tilemap);
    this.#building = BuildingFactory.make(buildingKey);
    this.#building.sprite.alpha = 0.5;
    tilemap.addChild(this.#building.sprite);
  }

  onTilePressed(i: number, j: number): void {
    if (this.checkIsConstructible(i, j)) {
      this.tilemap.putBuilding(this.#building.template, i, j);
      sound.play('tilemap-road');
    } else {
      sound.play('tilemap-no-op');
    }
  }

  onTileHovered(i: number, j: number): void {
    const pos = this.tilemap.coordsToPixels(i, j);
    this.#building.moveTo(pos.x, pos.y);

    const valid = this.checkIsConstructible(i, j);
    if (valid) {
      this.#building.sprite.tint = 0xffffff;
    } else {
      this.#building.sprite.tint = 0xff0000;
    }
  }

  onTileDragged(): void {
    // no op
  }

  onTileReleased(): void {
  }

  onActionDestroyed(): void {
    this.tilemap.removeChild(this.#building.sprite);
  }

  /**
   * Ensure all tiles covered by the building are constructible, and are on the same elevation level
   */
  checkIsConstructible(si: number, sj: number): boolean {
    const elevation = this.tilemap.getElevationAt(si, sj);
    for (let i = si; i < si + this.#building.template.th; ++i) {
      for (let j = sj; j < sj + this.#building.template.tw; ++j) {
        if (!Tileset.isConstructible(this.tilemap.getTileAt(i, j))) {
          return false;
        }
        if (this.tilemap.getElevationAt(i, j) !== elevation) {
          return false;
        }
      }
    }
    return true;
  }
}
