import Phaser from 'phaser';

export default class Bomb extends Phaser.Group {
  constructor({ scene, cell }) {
    const { game } = scene;
    super(game);
    const { image, row, column } = cell;
    Object.assign(this, {
      game,
      scene,
      row,
      column,
      cell
    });

    this.image = this.game.add.sprite(image.x, image.y, 'spritesheet', 'bomb1.png');
    this.image.anchor.setTo(0.5);
    this.image.animations.add('bomb', [1, 2, 3, 4].map(i => `bomb${i}.png`));
    this.game.physics.enable(this.image, Phaser.Physics.ARCADE);
    this.image.body.immovable = true;
    this.image.body.setSize(0.6 * this.image.width, 0.6 * this.image.height, 0.2 * this.image.width, 0.2 * this.image.height);
    this.image.scale.setTo(0.6 * window.devicePixelRatio);
    this.image.bomb = this;
    this.add(this.image);
    this.game.add.existing(this);
    this.image.animations.play('bomb', 10, true);

    this.cell.hasBomb = true;

    this.bombTimer = setTimeout(() => {
      this.explode();
    }, window.bombTimer);
    this.game.field.computeSuccessors();
    this.startScale();

    this.triggered = false;
  }

  explode() {
    clearTimeout(this.bombTimer);
    this.scene.createExplosion(this.cell);
    this.cell.hasBomb = false;
    this.game.field.computeSuccessors();
    this.image.destroy();
    this.destroy();
  }

  startScale() {
    if (this.cell.hasBomb) {
      const downScaleTween = this.game.add.tween(this.image.scale).to({ x: 0.4 * window.devicePixelRatio, y: 0.4 * window.devicePixelRatio }, 400, 'Linear', true);
      downScaleTween.onComplete.add(() => {
        if (this.cell.hasBomb) {
          const upScaleTween = this.game.add.tween(this.image.scale).to({ x: 0.6 * window.devicePixelRatio, y: 0.6 * window.devicePixelRatio }, 400, 'Linear', true);
          upScaleTween.onComplete.add(() => { this.startScale(); });
        }
      });
    }
  }
}
