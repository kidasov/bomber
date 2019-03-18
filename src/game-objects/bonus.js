import Phaser from 'phaser';

export const BONUS_TYPE = {
  SPEED: 1,
  EXPLOSION_RADIUS: 2,
  SCORE: 3
};

export default class Bonus extends Phaser.Group {
  constructor({ scene, cell, type }) {
    const { game } = scene;
    super(game);
    const { image, row, column } = cell;
    Object.assign(this, {
      game,
      scene,
      row,
      column,
      cell,
      type
    });

    let bonusImg = 'bonus-score1.png';

    switch (this.type) {
    case BONUS_TYPE.SPEED: bonusImg = 'bonus-speed.png'; break;
    case BONUS_TYPE.EXPLOSION_RADIUS: bonusImg = 'bonus-radius.png'; break;
    case BONUS_TYPE.SCORE: bonusImg = 'bonus-score3.png'; break;
    }

    this.image = this.game.add.sprite(image.x, image.y, 'spritesheet', bonusImg);
    this.image.anchor.setTo(0.5);
    this.game.physics.enable(this.image, Phaser.Physics.ARCADE);
    this.image.body.immovable = true;
    this.image.scale.setTo(window.devicePixelRatio);
    this.image.body.setSize(0.5 * this.image.width, 0.5 * this.image.height, 0.25 * this.image.width, 0.25 * this.image.height);
    this.image.bonus = this;
    this.add(this.image);
    this.game.add.existing(this);

    this.cell.hasBonus = true;
  }

  destroy(cb) {
    if (this.tween) {
      this.tween.stop();
    }
    this.image.body.immovable = true;
    this.tween = this.game.add.tween(this.image).to({ alpha: 0 }, 400, 'Linear', true);
    this.tween.onComplete.add(() => {
      this.image.destroy();
      super.destroy();
      cb && cb();
    });
    this.tween.start();
  }
}
