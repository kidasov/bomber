import Phaser from 'phaser';

class Preload extends Phaser.State {
  init() {}

  preload() {
    let assets = [
      {
        type: 'atlasJSONHash',
        cache: 'spritesheet',
        path: `assets/spritesheets/spritesheet@2x.png`,
        path2: `assets/spritesheets/spritesheet@2x.json`
      },
      {
        type: 'bitmapFont',
        cache: 'desyrel',
        path: 'assets/fonts/desyrel-pink.png',
        path2: 'assets/fonts/desyrel-pink.xml'
      }
    ];
    this.game.loadAssets(assets);
  }

  create() {
    this.game.state.start('game');
  }
}

export default Preload;
