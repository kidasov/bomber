const DIRECTIONS = {
  UP: 1,
  DOWN: -1,
  LEFT: 2,
  RIGHT: -2
};

export default class Enemy extends Phaser.Group {
  constructor({ game, cell, collisionGroup }) {
    super(game);
    Object.assign(this, { game, cell, collisionGroup });

    this.game.add.existing(this);

    this.image = this.game.add.sprite(cell.image.x, cell.image.y, 'spritesheet', 'nyan-right1.png');
    this.image.scale.setTo(window.devicePixelRatio, window.devicePixelRatio);
    this.add(this.image);
    this.game.physics.enable(this.image, Phaser.Physics.ARCADE);
    this.addAnimations();
    this.image.body.collideWorldBounds = true;
    this.image.body.fixedRotation = true;
    this.image.enemy = this;
    this.image.body.onWorldBounds = new Phaser.Signal();

    const radius = 12;

    this.image.body.setCircle(
      radius,
      -radius + (0.5 * this.image.width) / this.image.scale.x,
      -radius + (0.5 * this.image.height) / this.image.scale.y
    );
    this.image.anchor.setTo(0.5);

    this.target = null;
    this.playerTarget = null;

    this.chooseTarget(cell);
  }

  addAnimations() {
    this.image.animations.add('nyan-right', [1, 2, 3, 4].map(i => `nyan-right${i}.png`));
    this.image.animations.add('nyan-left', [1, 2, 3, 4].map(i => `nyan-left${i}.png`));
    this.image.animations.add('nyan-up', [1, 2, 3, 4].map(i => `nyan-up${i}.png`));
    this.image.animations.add('nyan-down', [1, 2, 3, 4].map(i => `nyan-down${i}.png`));
  }

  isSameCoordinate(obj, obj2) {
    return obj.x === obj2.x && obj.y === obj2.y;
  }

  chooseTarget(origin) {
    let path = null;
    let speed = null;
    if (this.playerTarget && !this.isSameCoordinate(origin.image, this.playerTarget.image)) {
      this.target = this.playerTarget;
      speed = 500;
      path = this.game.field.aStar(origin, this.target);
    }

    if (path === null) {
      this.playerTarget = null;
      speed = 1000;
      const reachableCells = this.game.field.getReachableCells(origin);
      this.target = reachableCells[Math.floor(Math.random() * reachableCells.length)];
      path = this.game.field.dfs(origin, this.target);
    }

    let i = 0;

    const next = () => {
      if (
        i >= path.length ||
        (this.playerTarget !== null && !this.isSameCoordinate(this.playerTarget.image, this.target.image))
      ) {
        console.log('Choose new direction');
        this.chooseTarget(path[i - 1]);
        return;
      }

      const nextTarget = path[i++];
      const prevTarget = i > 1 ? path[i - 2] : origin;
      if (nextTarget.row - prevTarget.row === 1) {
        this.image.animations.play('nyan-down', 30, true);
      } else if (nextTarget.row - prevTarget.row === -1) {
        this.image.animations.play('nyan-up', 30, true);
      } else if (nextTarget.column - prevTarget.column === 1) {
        this.image.animations.play('nyan-right', 30, true);
      } else if (nextTarget.column - prevTarget.column === -1) {
        this.image.animations.play('nyan-left', 30, true);
      }

      this.tween = this.game.add.tween(this.image).to({ x: nextTarget.image.x, y: nextTarget.image.y }, speed);

      this.tween.onComplete.add(next);
      this.tween.start();
    };

    next();
  }

  destroy() {
    console.log('destroy here');
    if (this.tween) {
      this.tween.stop();
    }
    this.image.animations.stop();
    this.tween = this.game.add.tween(this.image).to({ alpha: 0 }, 400, 'Linear', true);
    this.tween.onComplete.add(() => {
      this.image.destroy();
      super.destroy();
    });
    this.tween.start();
  }
}
