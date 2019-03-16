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

    const radius = 14;

    this.image.body.setCircle(
      radius,
      -radius + (0.5 * this.image.width) / this.image.scale.x,
      -radius + (0.5 * this.image.height) / this.image.scale.y
    );
    this.image.anchor.setTo(0.5);

    this.image.body.fixedRotation = true;
    this.collisionGroup.add(this.image);

    this.cursors = this.game.input.keyboard.createCursorKeys();
    game.input.keyboard.addCallbacks(this, null, ({ keyCode }) => {
      if (keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) {
        this.image.body.velocity.x = 0;
        this.image.body.velocity.y = 0;
        this.image.animations.stop('walk-left');
        this.image.animations.stop('walk-right');
        this.image.animations.stop('walk-up');
        this.image.animations.stop('walk-down');
      }
    });

    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }

  get currentCell() {
    const cell = this.game.field.cells[0][0];
    const row = Math.floor(this.image.y / cell.image.height);
    const column = Math.floor(this.image.x / cell.image.width);
    return this.game.field.cells[row][column];
  }

  addAnimations() {
    this.image.animations.add('walk-right', [1, 2, 3, 4].map(i => `walk-right${i}.png`));
    this.image.animations.add('walk-left', [1, 2, 3, 4].map(i => `walk-left${i}.png`));
    this.image.animations.add('walk-up', [1, 2, 3, 4].map(i => `walk-up${i}.png`));
    this.image.animations.add('walk-down', [1, 2, 3, 4].map(i => `walk-down${i}.png`));
  }

  move() {
    if (this.cursors.left.isDown) {
      this.image.body.velocity.x = -100 * window.devicePixelRatio;
      this.image.body.velocity.y = 0;
      this.image.animations.play('walk-left', 30, true);
    } else if (this.cursors.right.isDown) {
      this.image.body.velocity.x = 100 * window.devicePixelRatio;
      this.image.body.velocity.y = 0;
      this.image.animations.play('walk-right', 30, true);
    } else if (this.cursors.up.isDown) {
      this.image.body.velocity.y = -100 * window.devicePixelRatio;
      this.image.body.velocity.x = 0;
      this.image.animations.play('walk-up', 30, true);
    } else if (this.cursors.down.isDown) {
      this.image.body.velocity.y = 100 * window.devicePixelRatio;
      this.image.body.velocity.x = 0;
      this.image.animations.play('walk-down', 30, true);
    }

    if (this.spaceKey.isDown && !this.currentCell.hasBomb) {
      this.scene.dropBomb(this.currentCell);
    }
  }
}
