import * as PIXI from 'pixi.js';

import Game from '@src/Game';

class Style {
  initialize() {
    this.PADDING = 4;
    this.MARGIN = 4;
    this.FONT_SIZE = 12;
    this.TEXT_COLOR = 0x333333;

    const buttonTexture = Game.getTexture('box9.png');

    this.textureNormal = new PIXI.Texture(
      buttonTexture.baseTexture, new PIXI.Rectangle(0, 0, 12, 12),
    );

    this.textureHover = new PIXI.Texture(
      buttonTexture.baseTexture, new PIXI.Rectangle(0, 12, 12, 12),
    );

    this.textureFocus = new PIXI.Texture(
      buttonTexture.baseTexture, new PIXI.Rectangle(0, 24, 12, 12),
    );
  }
}

// Export as a singleton instance
export default new Style();
