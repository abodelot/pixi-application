import { BaseScene } from '@src/scenes/BaseScene';
import { EditorScene } from '@src/scenes/EditorScene';

import { Layout } from '@src/ui/Layout';
import { MessageBox } from '@src/ui/MessageBox';

export class MainMenuScene extends BaseScene {
  constructor(game) {
    super(game);

    // Create application menu
    const menu = new Layout();
    menu.addOption('Editor', () => {
      game.selectScene(EditorScene);
    });
    menu.addOption('Dialog', () => {
      const box = new MessageBox('Hello, world');
      box.position.set(30, 30);
      box.onOk(() => {
        console.log('ok');
      });
      box.onCancel(() => {
        this.container.removeChild(box);
      });
      this.container.addChild(box);
    });
    menu.addOption('Options').enable(false);

    menu.position.set(20, 20);
    this.container.addChild(menu);
  }
}
