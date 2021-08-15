import * as PIXI from 'pixi.js';

class StyleDef {
  constructor() {
    this.padding = 4;
    this.margin = 4;
    this.bgColor = 0xb8b8b8;
    this.bgColorSelected = 0x000080;
    this.fontFamily = 'Sans-Serif';
    this.fontSize = 12;
    this.textColor = 0x111111;
    this.textColorDisabled = 0x666666;
    this.textColorSelected = 0xffffff;
    this.buttonWidth = 100;
    this.boxPadding = 12;
    this.shadowRadius = 12;
    this.baseHeight = 22;
    this.textures = {};
  }

  /**
   * Define textures used for style
   * @param textures: dict<string, PIXI.Texture>
   */
  setTextures(textures) {
    const buttonTexture = textures.button.baseTexture;

    this.textures.normal = new PIXI.Texture(
      buttonTexture, new PIXI.Rectangle(0, 0, 12, 12),
    );
    this.textures.hover = new PIXI.Texture(
      buttonTexture, new PIXI.Rectangle(0, 12, 12, 12),
    );
    this.textures.focus = new PIXI.Texture(
      buttonTexture, new PIXI.Rectangle(0, 24, 12, 12),
    );
    this.textures.panel = new PIXI.Texture(
      buttonTexture, new PIXI.Rectangle(0, 36, 12, 12),
    );
    this.textures.shadow = textures.shadow;
  }

  /**
   * Create a box shadow element from the shadow texture
   * @return PIXI.NineSlicePlane
   */
  createShadow(width, height) {
    const r = this.shadowRadius;
    const shadow = new PIXI.NineSlicePlane(this.textures.shadow, r, r, r, r);
    shadow.width = width + r * 2;
    shadow.height = height + r * 2;
    shadow.position.set(-r, -r);
    return shadow;
  }
}

// Export as a singleton instance
export const Style = new StyleDef();
