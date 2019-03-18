import Phaser from 'phaser';
import Field from '../game-objects/field';
import Player from '../game-objects/player';
import Enemies from '../game-objects/enemies';
import Bomb from '../game-objects/bomb';
import Explosion from '../game-objects/explosion';
import BCell, { BCELL_TYPE } from '../game-objects/bcell';
import { BOMB_TIMER } from '../consts/gameplay';
import Bonus, { BONUS_TYPE } from '../game-objects/bonus';

class Game extends Phaser.State {
  init() {}

  preload() {}

  create() {
    const color = Phaser.Color.getRandomColor(255, 255, 255);
    this.game.stage.backgroundColor = color;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    window.game = this;

    this.grassGroup = this.game.add.group();
    this.stoneGroup = this.game.add.group();
    this.enemyGroup = this.game.add.group();
    this.playerGroup = this.game.add.group();
    this.bombGroup = this.game.add.group();
    this.bonusGroup = this.game.add.group();
    this.explosionGroup = this.game.add.group();
    this.game.forceSingleUpdate = false;
    this.allGroup = this.game.add.group();
    this.allGroup.add(this.grassGroup);
    this.allGroup.add(this.playerGroup);
    this.allGroup.add(this.enemyGroup);
    this.allGroup.add(this.bombGroup);
    this.allGroup.add(this.bonusGroup);
    this.allGroup.add(this.explosionGroup);
    this.allGroup.add(this.stoneGroup);

    this.game.field = new Field({
      scene: this,
      rows: 40,
      columns: 40,
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
        } else {
          this.grassGroup.add(this.game.field.cells[i][j].image);
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

    window.addEnemies(10);

    this.enemykilled = 0;

    const textX = (this.game.camera.x + this.game.camera.width) * 0.5;
    const textY = (this.game.camera.y + this.game.camera.height) * 0.5;

    this.gameOverText = this.game.add.bitmapText(textX, textY, 'desyrel', 'Game Over', 64);
    this.gameOverText.anchor.setTo(0.5);
    this.gameOverText.alpha = 0;

    this.enemyKilledText = this.game.add.bitmapText(textX, textY + 100, 'desyrel', `Enemy killed: ${this.enemykilled}`, 64);
    this.enemyKilledText.anchor.setTo(0.5);
    this.enemyKilledText.alpha = 0;
  }

  dropBomb(cell) {
    const bomb = new Bomb({ scene: this, cell });
    this.bombGroup.add(bomb.image);
  }

  destroyStone(cell) {
    if (cell.isDestroying) return;
    const { row, column, image } = cell;

    const chance = Math.round(Math.random() * 100);

    if (chance <= 25) {
      let bonusType = BONUS_TYPE.SCORE;

      if (chance > 0 && chance < 5) {
        bonusType = BONUS_TYPE.EXPLOSION_RADIUS;
      } else if (chance > 5 && chance <= 10) {
        bonusType = BONUS_TYPE.SPEED;
      } else if (chance > 10 && chance <= 15) {
        bonusType = BONUS_TYPE.SCORE_BRONZE;
      } else if (chance > 15 && chance <= 20) {
        bonusType = BONUS_TYPE.SCORE_SILVER;
      } else if (chance > 20 && chance <= 25) {
        bonusType = BONUS_TYPE.SCORE_GOLD;
      }

      const bonus = new Bonus({
        scene: this,
        type: bonusType,
        cell
      });
      this.bonusGroup.add(bonus.image);
      cell.isDestroying = true;

      const { player: { explosionRadius, maxExplosionRadius, speedBooster, maxSpeedBooster } } = this.game;

      if ((bonus.type === BONUS_TYPE.EXPLOSION_RADIUS && explosionRadius === maxExplosionRadius) || (bonus.type === BONUS_TYPE.SPEED && speedBooster >= maxSpeedBooster)) {
        bonus.image.alpha = 0.5;
      }
    }

    const grassCell = new BCell({
      scene: this,
      x: image.x - image.width * 0.5,
      y: image.y - image.height * 0.5,
      type: BCELL_TYPE.GRASS,
      row,
      column
    });
    this.game.field.add(grassCell);
    this.grassGroup.add(grassCell);

    const destroyStoneTween = this.game.add.tween(cell.image).to({ alpha: 0 }, 500, 'Linear', true);
    destroyStoneTween.onComplete.add(() => {
      cell.image.destroy();
      cell.destroy();
      cell.isDestroying = false;
      this.game.field.cells[row][column] = grassCell;
      this.game.field.computeSuccessors();
    });
  }

  destroyPlayer(playerSprite) {
    playerSprite.player.destroy(() => {
      const textX = (this.game.camera.x + this.game.camera.width) * 0.5;
      const textY = (this.game.camera.y + this.game.camera.height) * 0.5;
      this.gameOverText.x = textX;
      this.enemyKilledText.x = textX;
      const gameOverTextTween = this.game.add.tween(this.gameOverText).from({ y: 0 }).to({alpha: 1, y: textY}, 500, 'Linear', true);
      gameOverTextTween.onComplete.add(() => {
        this.game.add.tween(this.enemyKilledText).from({ y: window.innerHeight }).to({alpha: 1, y: textY + 100}, 500, 'Linear', true);
      });
    });
  }

  createExplosion(cell) {
    const explosion = new Explosion({ scene: this, cell, radius: this.game.player.explosionRadius });
    this.explosionGroup.add(explosion);
    setTimeout(() => {
      const explosionTween = this.game.add.tween(explosion).to({ alpha: 0 }, 100, 'Linear', true);
      explosionTween.onComplete.add(() => { explosion.destroy(); });
    }, 400);
  }

  takeBonus(bonus) {
    if (bonus.cell.hasBonus) {
      bonus.cell.hasBonus = false;
      switch (bonus.type) {
      case BONUS_TYPE.EXPLOSION_RADIUS:
        if (this.game.player.explosionRadius < this.game.player.maxExplosionRadius) {
          this.game.player.explosionRadius++;
          bonus.destroy();
        }
        break;
      case BONUS_TYPE.SPEED:
        if (this.game.player.speedBooster < this.game.player.maxSpeedBooster) {
          this.game.player.speedBooster++;
          bonus.destroy();
        }
        break;
      default: bonus.destroy();
      }
    }
  }

  checkBonuses() {
    const { player: { explosionRadius, maxExplosionRadius, speedBooster, maxSpeedBooster } } = this.game;
    this.bonusGroup.children.forEach(({ bonus }) => {
      if ((bonus.type === BONUS_TYPE.EXPLOSION_RADIUS && explosionRadius === maxExplosionRadius) || (bonus.type === BONUS_TYPE.SPEED && speedBooster >= maxSpeedBooster)) {
        bonus.image.alpha = 0.5;
      }
    });
  }

  update() {
    this.game.physics.arcade.collide(this.stoneGroup, this.playerGroup);
    this.game.physics.arcade.overlap(this.playerGroup, this.enemyGroup, (playerSprite, enemySprite) => {
      this.destroyPlayer(playerSprite);
    });
    this.game.physics.arcade.collide(this.playerGroup, this.bombGroup);
    this.game.physics.arcade.collide(this.explosionGroup, this.playerGroup, (sprite1, sprite2) => {
      this.destroyPlayer(sprite2);
    });
    this.game.physics.arcade.collide(this.explosionGroup, this.enemyGroup, (sprite1, sprite2) => {
      sprite2.enemy.destroy(() => {
        this.enemyKilledText.text = `Enemy killed: ${++this.enemykilled}`;
      });
    });
    this.game.physics.arcade.collide(this.explosionGroup, this.bombGroup, (sprite1, sprite2) => {
      setTimeout(() => {
        sprite2.bomb.explode();
      }, 20);
    });
    this.game.physics.arcade.overlap(this.playerGroup, this.bonusGroup, (playerSprite, bonusSprite) => {
      this.takeBonus(bonusSprite.bonus);
    });

    this.game.player.move();
    this.checkBonuses();

    const player = this.game.player;
    if (!player.isDead) {
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

        if (!blockingStone) {
          const playerRow = Math.floor(playerY / this.stoneGroup.children[0].height);
          const playerColumn = Math.floor(playerX / this.stoneGroup.children[0].width);
          const cell = this.game.field.cells[playerRow][playerColumn];
          enemy.playerTarget = cell;
        }
      });
    }
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
