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
    this.game.physics.enable(this.centerImage, Phaser.Physics.ARCADE);
    this.centerImage.body.immovable = true;
    this.centerImage.body.setSize(0.6 * this.centerImage.width, 0.6 * this.centerImage.height, 0.2 * this.centerImage.width, 0.2 * this.centerImage.height);
    this.centerImage.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
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
        this.game.physics.enable(leftMiddle, Phaser.Physics.ARCADE);
        leftMiddle.body.immovable = true;
        leftMiddle.body.setSize(0.6 * leftMiddle.width, 0.6 * leftMiddle.height, 0.2 * leftMiddle.width, 0.2 * leftMiddle.height);
        leftMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
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
        this.game.physics.enable(rightMiddle, Phaser.Physics.ARCADE);
        rightMiddle.body.immovable = true;
        rightMiddle.body.setSize(0.6 * rightMiddle.width, 0.6 * rightMiddle.height, 0.2 * rightMiddle.width, 0.2 * rightMiddle.height);
        rightMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
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
        this.game.physics.enable(topMiddle, Phaser.Physics.ARCADE);
        topMiddle.body.immovable = true;
        topMiddle.body.setSize(0.6 * topMiddle.width, 0.6 * topMiddle.height, 0.2 * topMiddle.width, 0.2 * topMiddle.height);
        topMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
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
        this.game.physics.enable(bottomMiddle, Phaser.Physics.ARCADE);
        bottomMiddle.body.immovable = true;
        bottomMiddle.body.setSize(0.6 * bottomMiddle.width, 0.6 * bottomMiddle.height, 0.2 * bottomMiddle.width, 0.2 * bottomMiddle.height);
        bottomMiddle.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
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
