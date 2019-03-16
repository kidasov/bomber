import Phaser from 'phaser';
import Field from '../game-objects/field';
import Player from '../game-objects/player';
import Enemies from '../game-objects/enemies';
import Bomb from '../game-objects/bomb';
import Explosion from '../game-objects/explosion';
import BCell, { BCELL_TYPE } from '../game-objects/bcell';
import { BOMB_TIMER } from '../consts/gameplay';

class Game extends Phaser.State {
  init() {}

  preload() {}

  create() {
    const color = Phaser.Color.getRandomColor(255, 255, 255);
    this.game.stage.backgroundColor = color;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    window.game = this;

    this.stoneGroup = this.game.add.group();
    this.enemyGroup = this.game.add.group();
    this.playerGroup = this.game.add.group();
    this.bombGroup = this.game.add.group();
    this.explosionGroup = this.game.add.group();

    this.game.field = new Field({
      game: this.game,
      rows: 64,
      columns: 64,
      collisionGroup: this.stoneGroup
    });
    this.game.world.setBounds(0, 0, this.game.field.width, this.game.field.height);

    const grassCell = this.game.field.randomGrassCell;

    this.game.player = new Player({
      scene: this,
      cell: grassCell,
      collisionGroup: this.playerGroup
    });

    this.game.camera.follow(this.game.player.image);

    for (let i = 0; i < this.game.field.cells.length; i++) {
      for (let j = 0; j < this.game.field.cells[i].length; j++) {
        if (this.game.field.cells[i][j].image.body) {
          this.stoneGroup.add(this.game.field.cells[i][j].image);
        }
      }
    }

    this.game.enemies = new Enemies({
      game: this.game
    });

    window.addEnemies = count => {
      for (let i = 0; i < count; i++) {
        this.game.enemies.addEnemy(this.game.field.randomGrassCell);
        const index = this.game.enemies.data.length - 1;
        this.enemyGroup.add(this.game.enemies.data[index].image);
      }
    };

    window.explosionRadius = 2;
    window.bombTimer = BOMB_TIMER;

    window.addEnemies(3);

    this.game.world.bringToTop(this.playerGroup);
    this.game.world.bringToTop(this.enemyGroup);
    this.game.world.bringToTop(this.stoneGroup);
    this.game.world.bringToTop(this.bombGroup);
    this.game.world.bringToTop(this.explosionGroup);
  }

  dropBomb(cell) {
    const bomb = new Bomb({ scene: this, cell });
    this.bombGroup.add(bomb.image);
  }

  destroyStone(cell) {
    cell.image.destroy();
    cell.destroy();

    const { row, column, image } = cell;
    const grassCell = new BCell({
      game: this.game,
      x: image.x - image.width * 0.5,
      y: image.y - image.height * 0.5,
      type: BCELL_TYPE.GRASS,
      row,
      column
    });
    this.game.field.cells[row][column] = grassCell;
    this.game.field.add(grassCell);
    this.game.field.computeSuccessors();
  }

  createExplosion(cell) {
    const explosion = new Explosion({ scene: this, cell, radius: window.explosionRadius });
    this.explosionGroup.add(explosion);
    setTimeout(() => {
      const explosionTween = this.game.add.tween(explosion).to({ alpha: 0 }, 100, 'Linear', true);
      explosionTween.onComplete.add(() => { explosion.destroy(); });
    }, 400);
  }

  update() {
    this.game.physics.arcade.collide(this.stoneGroup, this.playerGroup);
    this.game.physics.arcade.collide(this.playerGroup, this.enemyGroup);
    this.game.physics.arcade.collide(this.playerGroup, this.bombGroup);
    this.game.physics.arcade.collide(this.explosionGroup, this.enemyGroup, (sprite1, sprite2) => {
      sprite2.enemy.destroy();
    });
    this.game.physics.arcade.collide(this.explosionGroup, this.bombGroup, (sprite1, sprite2) => {
      sprite2.bomb.explode();
    });
    this.game.player.move();

    // this.bombGroup.children.forEach(ch => {
    //   this.game.debug.body(ch);
    // });

    // for (let i = 0; i < this.explosionGroup.children.length; i++) {
    //   this.explosionGroup.children[i].forEach(ch => {
    //     this.game.debug.body(ch);
    //   });
    // }

    const player = this.game.player;
    const playerX = player.image.x;
    const playerY = player.image.y;
    this.game.enemies.data.forEach(enemy => {
      const enemyX = enemy.image.x;
      const enemyY = enemy.image.y;
      const dx = playerX - enemyX;
      const dy = playerY - enemyY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(-dy, dx);

      const computeAngle = (x, y) => this.normalizeAngle(Math.atan2(-y + enemyY, x - enemyX) - angle);
      const computeDistance = (x, y) => Math.sqrt((x - enemyX) * (x - enemyX) + (y - enemyY) * (y - enemyY));

      const blockingStone = this.stoneGroup.children.find(stone => {
        const stoneDistance = computeDistance(stone.x, stone.y);
        if (stoneDistance > distance) {
          return false;
        }

        const stoneAngle = computeAngle(stone.x, stone.y);

        if (Math.abs(stoneAngle) > Math.PI / 2) {
          return false;
        }

        const sum =
          Math.sign(computeAngle(stone.x - stone.width * 0.5, stone.y - stone.height * 0.5)) +
          Math.sign(computeAngle(stone.x - stone.width * 0.5, stone.y + stone.height * 0.5)) +
          Math.sign(computeAngle(stone.x + stone.width * 0.5, stone.y + stone.height * 0.5)) +
          Math.sign(computeAngle(stone.x + stone.width * 0.5, stone.y - stone.height * 0.5));

        return Math.abs(sum) !== 4;
      });

      if (blockingStone) {
        // this.game.debug.geom(new Phaser.Line(enemy.image.x, enemy.image.y, blockingStone.x, blockingStone.y));
      } else {
        const playerRow = Math.floor(playerY / this.stoneGroup.children[0].height);
        const playerColumn = Math.floor(playerX / this.stoneGroup.children[0].width);
        const cell = this.game.field.cells[playerRow][playerColumn];
        // this.game.debug.geom(new Phaser.Rectangle(cell.image.x - 0.5 * cell.image.width, cell.image.y - 0.5 * cell.image.height, cell.image.width, cell.image.height));
        enemy.playerTarget = cell;
        // this.game.debug.geom(new Phaser.Line(enemy.image.x, enemy.image.y, player.image.x, player.image.y));
      }
    });
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) {
      angle -= 2 * Math.PI;
    }

    while (angle < -Math.PI) {
      angle += 2 * Math.PI;
    }

    return angle;
  }
}

export default Game;
