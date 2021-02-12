import * as PIXI from 'pixi.js';

import Style from '@src/ui/Style';
import Button from '@src/ui/Button';

export default class MessageBox extends PIXI.Container {
  constructor(message) {
    super();

    let y = 0;
    this._header = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._header.height = Style.baseHeight;
    this._header.tint = Style.bgColorSelected;
    this._header.position.set(2, 2);

    this._headerText = new PIXI.Text('Message', {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColorSelected,
    });

    this._headerText.position.set(Style.padding, Style.padding);
    this._header.addChild(this._headerText);

    this._text = new PIXI.Text(message, {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColor,
    });

    y = this._header.height + Style.boxPadding;
    this._text.position.set(Style.boxPadding, y);

    const totalWidth = Math.max(
      this._text.width + Style.boxPadding * 2,
      Style.buttonWidth * 2 + Style.margin + Style.boxPadding * 2,
    );
    this._header.width = totalWidth - 4;

    this._buttonOk = new Button('OK');
    y += this._text.height + Style.margin;
    this._buttonOk.position.set(
      totalWidth - Style.buttonWidth - Style.boxPadding,
      y,
    );

    this._buttonCancel = new Button('Cancel');
    this._buttonCancel.position.set(
      totalWidth - Style.buttonWidth * 2 - Style.margin - Style.boxPadding,
      y,
    );

    this._bg = new PIXI.NineSlicePlane(Style.textures.panel, 3, 3, 3, 3);
    this._bg.width = totalWidth;
    this._bg.height = y + this._buttonOk.height + Style.boxPadding;

    this._shadow = Style.createShadow(totalWidth, this._bg.height);

    this.addChild(this._shadow, this._bg, this._header, this._headerText,
      this._text, this._buttonOk, this._buttonCancel);

    // Prevent from triggering click events on element behind the MessageBox
    this.interactive = true;
  }

  onOk(callback) {
    this._buttonOk.click = callback;
  }

  onCancel(callback) {
    this._buttonCancel.click = callback;
  }
}
