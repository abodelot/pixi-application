import * as PIXI from 'pixi.js';

import Game from '@src/Game';
import ContextMenu from '@src/ui/ContextMenu';
import MessageBox from '@src/ui/MessageBox';
import Layout from '@src/ui/Layout';
import Style from '@src/ui/Style';

// Disable smoothing for pixel-perfect rendering
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const screenWidth = 480;
const screenHeight = 360;

const app = new PIXI.Application({
  width: screenWidth,
  height: screenHeight,
  resolution: window.devicePixelRatio,
  backgroundColor: 0xb8b8b8,
});

Game.initialize(app);
const assets = [
  'box9.png',
  'box-shadow.png',
];
Game.loadAssets(assets, () => {
  console.log('assets loaded');

  Style.setTextures({
    button: Game.getTexture('box9.png'),
    shadow: Game.getTexture('box-shadow.png'),
  });

  // Create application menu
  const menu = new Layout();
  menu.addOption('Play', () => {
    const box = new MessageBox('Hello, world');
    box.position.set(30, 30);
    box.onOk(() => {
      console.log('ok');
    });
    box.onCancel(() => {
      app.stage.removeChild(box);
    });
    app.stage.addChild(box);
  });
  menu.addOption('Options').enable(false);
  menu.addOption('Quit');

  menu.position.set(10, 10);
  app.stage.addChild(menu);
});

window.onload = () => {
  document.body.appendChild(app.view);

  // Disable right click on canvas
  app.view.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenu = new ContextMenu();
    contextMenu.addItem('New');
    contextMenu.addItem('Edit');
    contextMenu.addItem('Save and quit');
    contextMenu.position.set(e.pageX, e.pageY);
    app.stage.addChild(contextMenu);
  };
};
