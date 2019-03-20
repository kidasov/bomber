import Phaser from 'phaser';

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

  loadAssets(assets) {
    assets.forEach(asset => {
      this.load[asset.type](asset.cache, asset.path, asset.path2);
    });
  }
}

(function() {
  let windowWidth = window.innerWidth * window.devicePixelRatio;
  let windowHeight = window.innerHeight * window.devicePixelRatio;

  let game = new Bombermine(windowWidth, windowHeight);
})();
