import * as PIXI from 'pixi.js';

class StyleDef {
  padding = 5;
  margin = 5;
  nineBoxBorder = 3;
  bgColorSelected = 0x000080;
  fontFamily = 'Sans-Serif';
  fontSize = 12;
  textColor = 0x111111;
  textColorDisabled = 0x666666;
  textColorSelected = 0xffffff;
  buttonWidth = 100;
  buttonHeight = 24;
  boxPadding = 12;
  shadowRadius = 12;
  baseHeight = 22;
  tabBorder = 2;
  tabContentPadding = 15;
  dialogHeaderHeight = 18;
  textures: Record<string, Record<string, PIXI.Texture>> = {};

  /**
   * Define textures used for style
   * @param textures: dict<string, PIXI.Texture>
   */
  setTextures(textures: Record<string, PIXI.Texture>) {
    const tex = textures.atlas.baseTexture;

    this.textures = {
      button: {
        normal: new PIXI.Texture(tex, new PIXI.Rectangle(0, 0, 9, 9)),
        hover: new PIXI.Texture(tex, new PIXI.Rectangle(9, 0, 9, 9)),
        focus: new PIXI.Texture(tex, new PIXI.Rectangle(18, 0, 9, 9)),
      },
      tab: {
        normal: new PIXI.Texture(tex, new PIXI.Rectangle(0, 9, 9, 9)),
        hover: new PIXI.Texture(tex, new PIXI.Rectangle(9, 9, 9, 9)),
        focus: new PIXI.Texture(tex, new PIXI.Rectangle(18, 9, 9, 9)),
      },
      radioButton: {
        default: new PIXI.Texture(tex, new PIXI.Rectangle(0, 18, 12, 12)),
        enabled: new PIXI.Texture(tex, new PIXI.Rectangle(12, 18, 12, 12)),
        bgDefault: new PIXI.Texture(tex, new PIXI.Rectangle(24, 18, 12, 12)),
        bgEnabled: new PIXI.Texture(tex, new PIXI.Rectangle(36, 18, 12, 12)),
      },
      misc: {
        shadow: textures.shadow,
      },
    };
  }

  /**
   * Text with default settings
   * @return PIXI.Text
   */
  createText(text: string) {
    return new PIXI.Text(text, {
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fill: this.textColor,
    });
  }

  /**
   * PIXI.NineSlicePlane with default settings
   * @return PIXI.NineSlicePlane
   */
  createNineSlicePane(texture: PIXI.Texture, r = this.nineBoxBorder) {
    return new PIXI.NineSlicePlane(texture, r, r, r, r);
  }

  /**
   * Create a box shadow element from the shadow texture
   * @return PIXI.NineSlicePlane
   */
  createShadow(width: number, height: number) {
    const r = this.shadowRadius;
    const shadow = new PIXI.NineSlicePlane(this.textures.misc.shadow, r, r, r, r);
    shadow.width = width + r * 2;
    shadow.height = height + r * 2;
    shadow.position.set(-r, -r);
    return shadow;
  }
}

// Export as a singleton instance
export const Style = new StyleDef();
