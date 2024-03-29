import { Layout } from '@src/ui/Layout';
import { MessageBox } from '@src/ui/MessageBox';

import { Context } from '@src/core/Context';
import { BaseScene } from './BaseScene';
import { EditorScene } from './EditorScene';

export class MainMenuScene extends BaseScene {
  constructor() {
    super();

    // Create application menu
    const menu = new Layout();
    menu.addOption('Editor', () => {
      Context.game.selectScene(EditorScene);
    });
    menu.addOption('Help', () => {
      const box = new MessageBox(
        'Left click: put tile\n'
        + 'Middle click: center view on cursor\n'
        + 'Right click: show editor menu\n'
        + 'Mouse wheel: zoom in/zoom out map',
      );
      box.position.set(30, 30);
      box.onOk(() => {
        this.container.removeChild(box);
      });
      this.container.addChild(box);
    });
    menu.addOption('Options').enable(false);

    menu.position.set(20, 20);
    this.container.addChild(menu);
  }

  // eslint-disable-next-line
  onExit() {}

  // eslint-disable-next-line
  onResize() {}
}
