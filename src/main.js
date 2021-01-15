import * as PIXI from 'pixi.js';

import Game from '@src/Game';
import Menu from '@src/ui/Menu';
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
];
Game.loadAssets(assets, () => {
  console.log('assets loaded');
  Style.initialize();

  // Create application menu
  const menu = new Menu();
  menu.addOption('Play');
  menu.addOption('Options');
  menu.addOption('Quit');

  menu.position.y = 10;
  menu.position.x = 10;
  Game.add(menu);
});

window.onload = () => {
  document.body.appendChild(app.view);
};
