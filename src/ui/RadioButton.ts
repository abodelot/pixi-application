import * as PIXI from 'pixi.js';

import { RadioGroup } from './RadioGroup';
import { Style } from './Style';

export class RadioButton extends PIXI.Container {
  private radioGroup: RadioGroup;
  private background: PIXI.NineSlicePlane;
  private button: PIXI.Sprite;
  private text: PIXI.Text;
  private icon: PIXI.Sprite;
  private enabled = false;
  private callback: () => void = null;

  constructor(radioGroup: RadioGroup, label: string, icon: PIXI.Texture = null) {
    super();

    this.radioGroup = radioGroup;
    this.button = new PIXI.Sprite(Style.textures.radioButton.default);
    this.button.position.set(Style.padding, (Style.buttonHeight - this.button.height) / 2);

    if (icon) {
      this.icon = new PIXI.Sprite(icon);
      this.icon.position.set(this.button.width + 10, (Style.buttonHeight - this.icon.height) / 2);
    }

    this.text = Style.createText(label);
    const iconOffset = icon ? this.icon.width + 10 : 0;
    this.text.position
      .set(this.button.width + iconOffset + 10, (Style.buttonHeight - this.text.height) / 2);

    this.background = Style.createNineSlicePane(Style.textures.radioButton.bgDefault);
    this.background.width = this.text.x + this.text.width + Style.padding;
    this.background.height = Style.buttonHeight;
    this.addChild(this.background, this.button, this.icon, this.text);

    // Events
    this.interactive = true;
    this.on('pointerup', this.check.bind(this));
  }

  check(): void {
    if (!this.enabled) {
      this.radioGroup.uncheckAll();
      this.enabled = true;
      this.background.texture = Style.textures.radioButton.bgEnabled;
      this.button.texture = Style.textures.radioButton.enabled;

      if (this.callback) {
        this.callback();
      }
    }
  }

  uncheck(): void {
    this.enabled = false;
    this.background.texture = Style.textures.radioButton.bgDefault;
    this.button.texture = Style.textures.radioButton.default;
  }

  onChecked(callback: () => void): void {
    this.callback = callback;
  }
}
