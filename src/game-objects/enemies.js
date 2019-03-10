import Enemy from "./enemy";

export default class Enemies extends Phaser.Group {
  constructor({ game, amount }) {
    super(game);
    Object.assign(this, { game, amount });
    this.data = [];
    this.game.add.existing(this);
  }

  addEnemy(grassCell) {
    const enemy = new Enemy({
      game: this.game,
      cell: grassCell
    });

    this.data.push(enemy);
  }
}
