import * as PIXI from 'pixi.js';

import { RadioButton } from './RadioButton';
import { Style } from './Style';

export class RadioGroup extends PIXI.Container {
  private radioButtons: RadioButton[] = [];

  addButton(label: string, icon: PIXI.Texture = null): RadioButton {
    const button = new RadioButton(this, label, icon);
    if (this.radioButtons.length > 0) {
      button.y = this.radioButtons[this.radioButtons.length - 1].y + Style.buttonHeight;
    }
    this.radioButtons.push(button);
    this.addChild(button);
    return button;
  }

  uncheckAll(): void {
    this.radioButtons.forEach((button) => {
      button.uncheck();
    });
  }
}
