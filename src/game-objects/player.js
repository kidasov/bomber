import { PLAYER_SETTINGS } from '../consts/gameplay';

export default class Player extends Phaser.Group {
  constructor({ scene, cell, collisionGroup }) {
    const { game } = scene;
    super(game);
    Object.assign(this, { game, scene, cell, collisionGroup });

    this.game.add.existing(this);
    this.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARCADE;

    this.image = this.game.add.sprite(cell.image.x, cell.image.y, 'spritesheet', 'walk-right1.png');
    this.image.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
    this.add(this.image);
    this.game.physics.enable(this.image, Phaser.Physics.ARCADE);
    this.addAnimations();
    this.image.body.collideWorldBounds = true;
    this.image.player = this;

    const radius = 14;

    this.image.body.setCircle(
      radius,
      -radius + (0.5 * this.image.width) / this.image.scale.x,
      -radius + (0.5 * this.image.height) / this.image.scale.y
    );
    this.image.anchor.setTo(0.5);

    this.image.body.fixedRotation = true;

    this.cursors = this.game.input.keyboard.createCursorKeys();
    game.input.keyboard.addCallbacks(this, ({ keyCode }) => {
      if (keyCode === Phaser.Keyboard.SPACEBAR) {
        if (!this.currentCell.hasBomb) {
          this.scene.dropBomb(this.currentCell);
        }
      }
    });

    this.isDead = false;
    this.invincible = true;

    this.speed = PLAYER_SETTINGS.BASE_SPEED;
    this.speedBooster = PLAYER_SETTINGS.BASE_SPEED_MULTIPLIER;
    this.explosionRadius = PLAYER_SETTINGS.BASE_EXPLOSION_MULTIPLIER;
    this.maxSpeedBooster = PLAYER_SETTINGS.MAX_SPEED_MULTIPLIER;
    this.maxExplosionRadius = PLAYER_SETTINGS.MAX_EXPLOSION_MULTIPLIER;
    this.startScale();
    setTimeout(() => {
      this.invincible = false;
    }, PLAYER_SETTINGS.SPAWN_TIME);
  }

  get currentCell() {
    const cell = this.game.field.cells[0][0];
    const row = Math.floor(this.image.y / cell.image.height);
    const column = Math.floor(this.image.x / cell.image.width);
    return this.game.field.cells[row][column];
  }

  addAnimations() {
    this.animationsName = ['walk-right', 'walk-left', 'walk-up', 'walk-down'];
    this.image.animations.add('walk-right', [1, 2, 3, 4].map(i => `walk-right${i}.png`));
    this.image.animations.add('walk-left', [1, 2, 3, 4].map(i => `walk-left${i}.png`));
    this.image.animations.add('walk-up', [1, 2, 3, 4].map(i => `walk-up${i}.png`));
    this.image.animations.add('walk-down', [1, 2, 3, 4].map(i => `walk-down${i}.png`));
  }

  startScale() {
    if (this.invincible) {
      const fadeOutTween = this.game.add.tween(this.image).to({ alpha: 0.5 }, 400, 'Linear', true);
      fadeOutTween.onComplete.add(() => {
        if (this.invincible) {
          const fadeInTween = this.game.add.tween(this.image).to({ alpha: 1 }, 400, 'Linear', true);
          fadeInTween.onComplete.add(() => { this.startScale(); });
        } else {
          this.image.alpha = 1;
        }
      });
    } else {
      this.image.alpha = 1;
    }
  }

  move() {
    if (this.isDead === false) {
      let horizontalSpeed = 0;
      let verticalSpeed = 0;
      let animation = null;
      if (this.cursors.left.isDown) {
        horizontalSpeed -= this.speed + (PLAYER_SETTINGS.SPEED_BOOSTER * this.speedBooster);
        animation = 'walk-left';
      }

      if (this.cursors.right.isDown) {
        horizontalSpeed += this.speed + (PLAYER_SETTINGS.SPEED_BOOSTER * this.speedBooster);
        animation = 'walk-right';
      }

      if (this.cursors.up.isDown) {
        verticalSpeed -= this.speed + (PLAYER_SETTINGS.SPEED_BOOSTER * this.speedBooster);
        animation = 'walk-up';
      }

      if (this.cursors.down.isDown) {
        verticalSpeed += this.speed + (PLAYER_SETTINGS.SPEED_BOOSTER * this.speedBooster);
        animation = 'walk-down';
      }

      if (horizontalSpeed && verticalSpeed) {
        horizontalSpeed /= Math.sqrt(2);
        verticalSpeed /= Math.sqrt(2);
      }

      this.image.body.velocity.x = horizontalSpeed * window.devicePixelRatio;
      this.image.body.velocity.y = verticalSpeed * window.devicePixelRatio;
      this.image.animations.play(animation, 10, true);

      this.animationsName.forEach(name => {
        if (name !== animation) {
          this.image.animations.stop(name);
        }
      });
    }
  }

  destroy(cb) {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.image.body.velocity.x = 0;
    this.image.body.velocity.y = 0;
    if (this.tween) {
      this.tween.stop();
    }
    cb && cb();
    this.image.animations.stop();
    this.tween = this.game.add.tween(this.image).to({ alpha: 0 }, 400, 'Linear', true);
    this.tween.onComplete.add(() => {
      this.image.destroy();
      super.destroy();
    });
  }
}
