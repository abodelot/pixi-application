import * as PIXI from 'pixi.js';

import Style from './Style';

export default class ContextMenuItem extends PIXI.Container {
  constructor(label) {
    super();

    this._bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._bg.tint = 0xffffff;
    this._bg.height = Style.baseHeight;
    this._bg.width = 120;

    this._text = new PIXI.Text(label, {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColor,
    });
    this._text.position.set(Style.padding, Style.padding);

    this.addChild(this._bg, this._text);

    this.interactive = true;
    this.mouseout = this.defaultStyle;
    this.mouseover = this.hoverStyle;
  }

  defaultStyle() {
    this._bg.tint = 0xffffff;
    this._text.style.fill = Style.textColor;
  }

  hoverStyle() {
    this._bg.tint = Style.bgColorSelected;
    this._text.style.fill = Style.textColorSelected;
  }
}
