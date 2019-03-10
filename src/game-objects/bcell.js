import Phaser from "phaser";

export const BCELL_TYPE = {
  STONE: 1,
  GRASS: 2
};

export default class BCell extends Phaser.Group {
  constructor({ game, x, y, type, row, column }) {
    super(game);
    Object.assign(this, {
      game,
      type,
      row,
      column
    });

    const tile = this.type === BCELL_TYPE.STONE ? "bricks.png" : "grass.png";

    this.image = this.game.add.sprite(x, y, "spritesheet", tile);
    this.image.x += this.image.width * 0.5;
    this.image.y += this.image.height * 0.5;
    this.image.anchor.setTo(0.5);

    if (this.type === BCELL_TYPE.STONE) {
      this.game.physics.enable(this.image, Phaser.Physics.ARCADE);
      this.image.body.immovable = true;
    }
    this.add(this.image);
    this.game.add.existing(this);
  }
}
