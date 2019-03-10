import Phaser from 'phaser';
import PIXI from 'pixi';

import Boot from './states/boot';
import Preload from './states/preload';
import Game from './states/game';

class Bombermine extends Phaser.Game {
  constructor(width, height, suffix, strSuffix) {
    super(width, height, Phaser.CANVAS, '', null);

    this.state.add('boot', Boot);
    this.state.add('preload', Preload);
    this.state.add('game', Game);

    this.state.start('boot');

    this.displaySuffix = suffix;
    this.strDisplaySuffix = strSuffix;
  }

  getImagePathWithSuffix(path, extension) {
    return path + this.strDisplaySuffix + extension;
  }

  loadAssets(assets) {
    for (let asset of assets) {
      this.load[asset.type](asset.cache, asset.path, asset.path2);
    }
  }

  loadScripts(scripts) {
    for (let script of scripts) {
      this.load.script(script.key, script.path);
    }
  }

  getExactValue(value) {
    return this.displaySuffix === 2 ? value * 2 : value;
  }
}

(function() {
  let windowWidth = window.innerWidth * window.devicePixelRatio;
  let windowHeight = window.innerHeight * window.devicePixelRatio;

  const DIMENSION = {
    HEIGHT: 480,
    WIDTH: 320
  };

  let displaySuffix = 1;
  let strDisplaySuffix = '';

  if (windowWidth > DIMENSION.WIDTH || windowHeight > DIMENSION.HEIGHT) {
    displaySuffix = 2;
    strDisplaySuffix = '@2x';
  }

  let gameWidth = DIMENSION.WIDTH * displaySuffix;
  let gameHeight = DIMENSION.HEIGHT * displaySuffix;

  PIXI.DisplayObject.prototype.setPosition = function(x, y) {
    this.x = game.displaySuffix === 2 ? x * 2 : x;
    this.y = game.displaySuffix === 2 ? y * 2 : y;
  };

  PIXI.DisplayObject.prototype.tryDrag = function() {
    if (this.game.dragMode === true) {
      this.inputEnabled = true;
      this.input.enableDrag();
      this.events.onDragStop.add(function(sprite, pointer) {
        let x = game.displaySuffix === 2 ? sprite.x * 0.5 : sprite.x;
        let y = game.displaySuffix === 2 ? sprite.y * 0.5 : sprite.y;
      }, this);
    }
  };

  let game = new Bombermine(windowWidth, windowHeight, displaySuffix, strDisplaySuffix);
})();
