import Phaser from 'phaser';

export default class Bomb extends Phaser.Group {
  constructor({ game, x, y }) {
    super(game);
    Object.assign(this, {
      game
    });

    this.image = this.game.add.sprite(x, y, 'spritesheet', 'bomb1.png');
    this.image.scale.setTo(0.5 * window.devicePixelRatio);
    this.image.anchor.setTo(0.5 * window.devicePixelRatio);
    this.image.animations.add('bomb', [1, 2, 3, 4].map(i => `bomb${i}.png`));
    this.game.physics.enable(this.image, Phaser.Physics.ARCADE);
    this.add(this.image);
    this.game.add.existing(this);
  }

  play() {
    this.image.animations.play('bomb', 30, true);
  }
}
