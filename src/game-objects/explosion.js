import { BCELL_TYPE } from './bcell';

export default class Explosion extends Phaser.Group {
  constructor({ scene, cell, radius }) {
    const { game } = scene;
    super(game);
    Object.assign(this, {
      game,
      cell,
      radius
    });

    this.centerImage = this.game.add.sprite(cell.image.x, cell.image.y, 'spritesheet', 'explosion-center.png');
    this.centerImage.anchor.setTo(0.5);
    this.centerImage.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
    this.game.physics.enable(this.centerImage, Phaser.Physics.ARCADE);
    this.centerImage.body.immovable = true;
    this.add(this.centerImage);

    let hasLeft = true;
    let hasRight = true;
    let hasTop = true;
    let hasBottom = true;

    for (let i = 1; i <= radius; i++) {
      if (cell.column - i >= 0 && hasLeft) {
        const leftCell = this.game.field.cells[cell.row][cell.column - i];
        const leftMiddle = this.game.add.sprite(cell.image.x - cell.image.width * i, cell.image.y, 'spritesheet', i === radius ? 'explosion-end.png' : 'explosion-middle.png');
        leftMiddle.anchor.setTo(0.5);
        leftMiddle.angle = 180;
        leftMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
        this.game.physics.enable(leftMiddle, Phaser.Physics.ARCADE);
        leftMiddle.body.immovable = true;
        this.add(leftMiddle);

        if (leftCell.type !== BCELL_TYPE.GRASS) {
          hasLeft = false;
          scene.destroyStone(leftCell);
        }
      }

      if (cell.column + i < this.game.field.columns && hasRight) {
        const rightCell = this.game.field.cells[cell.row][cell.column + i];
        const rightMiddle = this.game.add.sprite(cell.image.x + cell.image.width * i, cell.image.y, 'spritesheet', i === radius ? 'explosion-end.png' : 'explosion-middle.png');
        rightMiddle.anchor.setTo(0.5);
        rightMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
        this.game.physics.enable(rightMiddle, Phaser.Physics.ARCADE);
        rightMiddle.body.immovable = true;
        this.add(rightMiddle);

        if (rightCell.type !== BCELL_TYPE.GRASS) {
          hasRight = false;
          scene.destroyStone(rightCell);
        }
      }

      if (cell.row - i >= 0 && hasTop) {
        const topCell = this.game.field.cells[cell.row - i][cell.column];
        const topMiddle = this.game.add.sprite(cell.image.x, cell.image.y - cell.image.height * i, 'spritesheet', i === radius ? 'explosion-end.png' : 'explosion-middle.png');
        topMiddle.anchor.setTo(0.5);
        topMiddle.angle = -90;
        topMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
        this.game.physics.enable(topMiddle, Phaser.Physics.ARCADE);
        topMiddle.body.immovable = true;
        this.add(topMiddle);

        if (topCell.type !== BCELL_TYPE.GRASS) {
          hasTop = false;
          scene.destroyStone(topCell);
        }
      }

      if (cell.row + i < this.game.field.rows && hasBottom) {
        const bottomCell = this.game.field.cells[cell.row + i][cell.column];
        const bottomMiddle = this.game.add.sprite(cell.image.x, cell.image.y + cell.image.height * i, 'spritesheet', i === radius ? 'explosion-end.png' : 'explosion-middle.png');
        bottomMiddle.anchor.setTo(0.5);
        bottomMiddle.angle = 90;
        bottomMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
        this.game.physics.enable(bottomMiddle, Phaser.Physics.ARCADE);
        bottomMiddle.body.immovable = true;
        this.add(bottomMiddle);

        if (bottomCell.type !== BCELL_TYPE.GRASS) {
          hasBottom = false;
          scene.destroyStone(bottomCell);
        }
      }
    }

    this.game.add.existing(this);
  }
}
