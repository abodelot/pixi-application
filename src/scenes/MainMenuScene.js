import { Layout } from '@src/ui/Layout';
import { MessageBox } from '@src/ui/MessageBox';

import { BaseScene } from './BaseScene';
import { EditorScene } from './EditorScene';

export class MainMenuScene extends BaseScene {
  constructor(game) {
    super(game);

    // Create application menu
    const menu = new Layout();
    menu.addOption('Editor', () => {
      game.selectScene(EditorScene);
    });
    menu.addOption('Help', () => {
      const box = new MessageBox(
        'Left click: put tile\n'
        + 'Middle click: center view on cursor\n'
        + 'Right click: show editor menu',
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
}
