import Phaser from 'phaser';

class Preload extends Phaser.State {
  init() {}

  preload() {
    let assets = [
      {
        type: 'image',
        cache: 'game_bg',
        path: `assets/backgrounds/game_bg${this.game.strDisplaySuffix}.jpg`
      },
      {
        type: 'atlasJSONHash',
        cache: 'spritesheet',
        path: `assets/spritesheets/spritesheet${
          this.game.strDisplaySuffix
        }.png`,
        path2: `assets/spritesheets/spritesheet${
          this.game.strDisplaySuffix
        }.json`
      },
      {
        type: 'bitmapFont',
        cache: 'desyrel',
        path: 'assets/fonts/desyrel-pink.png',
        path2: 'assets/fonts/desyrel-pink.xml'
      }
    ];
    // this.game.load.bitmapFont('shortStack', 'assets/fonts/shortStack.png', 'assets/fonts/shortStack.xml');
    this.game.loadAssets(assets);
  }

  create() {
    this.game.state.start('game');
  }
}

export default Preload;
