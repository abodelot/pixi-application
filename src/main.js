import * as PIXI from 'pixi.js';

import { game } from '@src/core/Game';
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

game.initialize(app);
const assets = [
  'box9.png',
  'box-shadow.png',
  'tileset.png',
  'cursor.png',
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
};
