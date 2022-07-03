import * as PIXI from 'pixi.js';

import { Style } from '@src/ui/Style';
import { Button } from '@src/ui/Button';
import { ListenerFn } from '@src/core/Types';

export class MessageBox extends PIXI.Container {
  #header;
  #headerText;
  #text;
  #bg;
  #shadow;
  #buttonOk;
  #buttonCancel;

  constructor(message: string) {
    super();

    let y = 0;
    this.#header = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.#header.height = Style.dialogHeaderHeight;
    this.#header.tint = Style.bgColorSelected;
    this.#header.position.set(Style.nineBoxBorder, Style.nineBoxBorder);

    this.#headerText = new PIXI.Text('Message', {
      fontFamily: Style.fontFamily,
      fontSize: Style.fontSize,
      fill: Style.textColorSelected,
    });

    this.#headerText.position.set(
      Style.nineBoxBorder + Style.padding,
      Style.nineBoxBorder + (Style.dialogHeaderHeight - this.#headerText.height) / 2,
    );
    this.#header.addChild(this.#headerText);

    this.#text = Style.createText(message);
    y = Style.nineBoxBorder + this.#header.height + Style.boxPadding;
    this.#text.position.set(Style.boxPadding, y);

    const totalWidth = Math.max(
      this.#text.width + Style.boxPadding * 2,
      Style.buttonWidth * 2 + Style.margin + Style.boxPadding * 2,
    );
    this.#header.width = totalWidth - Style.nineBoxBorder * 2;

    this.#buttonOk = new Button('OK');
    this.#buttonOk.enable(false);
    y += this.#text.height + Style.margin;
    this.#buttonOk.position.set(
      totalWidth - Style.buttonWidth - Style.boxPadding,
      y,
    );

    this.#buttonCancel = new Button('Cancel');
    this.#buttonCancel.enable(false);
    this.#buttonCancel.position.set(
      totalWidth - Style.buttonWidth * 2 - Style.margin - Style.boxPadding,
      y,
    );

    this.#bg = Style.createNineSlicePane(Style.textures.button.normal);
    this.#bg.width = totalWidth;
    this.#bg.height = y + this.#buttonOk.height + Style.boxPadding;

    this.#shadow = Style.createShadow(totalWidth, this.#bg.height);

    this.addChild(
      this.#shadow,
      this.#bg,
      this.#header,
      this.#headerText,
      this.#text,
      this.#buttonOk,
      this.#buttonCancel,
    );

    // Prevent from triggering click events on element behind the MessageBox
    this.interactive = true;
  }

  onOk(callback: ListenerFn): void {
    console.log('adding ', callback, 'to mEssagebox');

    this.#buttonOk.on('pointertap', callback);
    this.#buttonOk.enable(true);
  }

  onCancel(callback: ListenerFn): void {
    this.#buttonCancel.on('pointertap', callback);
    this.#buttonCancel.enable(true);
  }
}
