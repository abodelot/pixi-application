import * as PIXI from 'pixi.js';
import Style from './Style';

const WIDTH = 100;

export default class Button extends PIXI.Container {
  constructor(name) {
    super();

    this._text = new PIXI.Text(name, {
      fontFamily: 'monospace',
      fontSize: Style.FONT_SIZE,
      fill: Style.TEXT_COLOR,
    });

    this._text.position.x = (WIDTH - this._text.width) / 2;
    this._text.position.y = Style.PADDING;

    this._bg = new PIXI.NineSlicePlane(Style.textureNormal, 3, 3, 3, 3);
    this._bg.width = WIDTH;
    this._bg.height = this._text.height + Style.PADDING * 2;

    this.addChild(this._bg, this._text);

    this.interactive = true;
    this.buttonMode = true;

    // Events
    this.mouseout = this.defaultStyle;
    this.mouseover = this.hoverStyle;
    this.mouseup = this.defaultStyle;
    this.mousedown = this.focusStyle;
  }

  defaultStyle() {
    this._bg.texture = Style.textureNormal;
    this._text.position.y = Style.PADDING;
  }

  hoverStyle() {
    this._bg.texture = Style.textureHover;
    this._text.position.y = Style.PADDING;
  }

  focusStyle() {
    this._bg.texture = Style.textureFocus;
    this._text.position.y = Style.PADDING + 1;
  }
}
