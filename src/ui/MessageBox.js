import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';
import { Button } from '@src/ui/Button';

export class MessageBox extends PIXI.Container {
  #header;
  #headerText;
  #text;
  #bg;
  #shadow;
  #buttonOk;
  #buttonCancel;

  constructor(message) {
    super();

    let y = 0;
    this.#header = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#header.height = Style.baseHeight;
    this.#header.tint = Style.bgColorSelected;
    this.#header.position.set(2, 2);

    this.#headerText = new PIXI.Text('Message', {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColorSelected,
    });

    this.#headerText.position.set(Style.padding, Style.padding);
    this.#header.addChild(this.#headerText);

    this.#text = new PIXI.Text(message, {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColor,
    });

    y = this.#header.height + Style.boxPadding;
    this.#text.position.set(Style.boxPadding, y);

    const totalWidth = Math.max(
      this.#text.width + Style.boxPadding * 2,
      Style.buttonWidth * 2 + Style.margin + Style.boxPadding * 2,
    );
    this.#header.width = totalWidth - 4;

    this.#buttonOk = new Button('OK');
    y += this.#text.height + Style.margin;
    this.#buttonOk.position.set(
      totalWidth - Style.buttonWidth - Style.boxPadding,
      y,
    );

    this.#buttonCancel = new Button('Cancel');
    this.#buttonCancel.position.set(
      totalWidth - Style.buttonWidth * 2 - Style.margin - Style.boxPadding,
      y,
    );

    this.#bg = new PIXI.NineSlicePlane(Style.textures.panel, 3, 3, 3, 3);
    this.#bg.width = totalWidth;
    this.#bg.height = y + this.#buttonOk.height + Style.boxPadding;

    this.#shadow = Style.createShadow(totalWidth, this.#bg.height);

    this.addChild(this.#shadow, this.#bg, this.#header, this.#headerText,
      this.#text, this.#buttonOk, this.#buttonCancel);

    // Prevent from triggering click events on element behind the MessageBox
    this.interactive = true;
  }

  onOk(callback) {
    this.#buttonOk.click = callback;
  }

  onCancel(callback) {
    this.#buttonCancel.click = callback;
  }
}
