import * as PIXI from 'pixi.js';
import { sound } from '@pixi/sound';

import { Context } from './core/Context';
import { Game } from './core/Game';
import { Style } from './ui/Style';

import { MainMenuScene } from './scenes/MainMenuScene';

// Disable smoothing for pixel-perfect rendering
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const images = [
  'cursor.png',
  'screenview-9box.png',
  'shadow-9box.png',
  'tileset2.png',
  'tools.png',
  'win95.png',
];

const sounds = [
  'tilemap-road',
  'tilemap-tile',
  'tilemap-no-op',
];

window.onload = () => {
  sounds.forEach((name) => sound.add(name, `assets/sounds/${name}.ogg`));

  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    backgroundColor: 0xc0c0c0,
  });

  Context.game = new Game(app);
  Context.game.loadAssets(images, () => {
    Style.setTextures({
      atlas: Context.game.getTexture('win95.png'),
      shadow: Context.game.getTexture('shadow-9box.png'),
    });

    Context.game.selectScene(MainMenuScene);
  });
  document.body.appendChild(app.view);
};

window.onresize = () => {
  Context.game.resizeScreen(window.innerWidth, window.innerHeight);
};
