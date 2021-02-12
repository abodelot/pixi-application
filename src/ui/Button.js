import * as PIXI from 'pixi.js';

import Style from './Style';

export default class Button extends PIXI.Container {
  constructor(name) {
    super();

    this._text = new PIXI.Text(name, {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textCcolor,
    });

    this._text.position.x = (Style.buttonWidth - this._text.width) / 2;
    this._text.position.y = Style.padding;

    this._bg = new PIXI.NineSlicePlane(Style.textures.normal, 3, 3, 3, 3);
    this._bg.width = Style.buttonWidth;
    this._bg.height = this._text.height + Style.padding * 2;

    this.addChild(this._bg, this._text);

    this.enable(true);
  }

  defaultStyle() {
    this._bg.texture = Style.textures.normal;
    this._text.position.y = Style.padding;
  }

  hoverStyle() {
    this._bg.texture = Style.textures.hover;
    this._text.position.y = Style.padding;
  }

  focusStyle() {
    this._bg.texture = Style.textures.focus;
    this._text.position.y = Style.padding + 1;
  }

  enable(enabled) {
    this.interactive = enabled;

    if (enabled) {
      this._text.style.fill = Style.textColor;
      this._text.style.dropShadow = false;

      // Events
      this.mouseout = this.defaultStyle;
      this.mouseover = this.hoverStyle;
      this.mouseup = this.defaultStyle;
      this.mousedown = this.focusStyle;
    } else {
      this._text.style.fill = Style.textColorDisabled;
      this._text.style.dropShadow = true;
      this._text.style.dropShadowDistance = 1;
      this._text.style.dropShadowColor = 0xffffff;

      // Events
      this.mouseout = null;
      this.mouseover = null;
      this.mouseup = null;
      this.mousedown = null;
    }
  }
}
