import * as PIXI from 'pixi.js';

import { Game } from '@src/Game';
import { ContextMenu } from '@src/ui/ContextMenu';
import { Style } from '@src/ui/Style';

import { MainMenuScene } from '@src/scenes/MainMenuScene';

// Disable smoothing for pixel-perfect rendering
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.devicePixelRatio,
  backgroundColor: 0xb8b8b8,
});

const game = new Game(app);
const assets = [
  'box9.png',
  'box-shadow.png',
];
game.loadAssets(assets, () => {
  console.log('assets loaded');

  Style.setTextures({
    button: game.getTexture('box9.png'),
    shadow: game.getTexture('box-shadow.png'),
  });

  game.selectScene(MainMenuScene);
});

window.onload = () => {
  document.body.appendChild(app.view);

  // Disable native right click on canvas
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
