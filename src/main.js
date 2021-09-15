import * as PIXI from 'pixi.js';

import { game } from '@src/core/Game';
import { Style } from '@src/ui/Style';

import { MainMenuScene } from '@src/scenes/MainMenuScene';

// Disable smoothing for pixel-perfect rendering
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const assets = [
  'cursor.png',
  'screenview-9box.png',
  'shadow-9box.png',
  'tileset.png',
  'tools.png',
  'ui-9box.png',
];

window.onload = () => {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    backgroundColor: 0xb8b8b8,
  });

  game.initialize(app);
  game.loadAssets(assets, () => {
    console.log('assets loaded');

    Style.setTextures({
      button: game.getTexture('ui-9box.png'),
      shadow: game.getTexture('shadow-9box.png'),
    });

    game.selectScene(MainMenuScene);
  });
  document.body.appendChild(app.view);
};

window.onresize = () => {
  game.resizeScreen(window.innerWidth, window.innerHeight);
};
