import Phaser from 'phaser';
import BCell, { BCELL_TYPE } from './bcell';

export default class Field extends Phaser.Group {
  constructor({ game, rows, columns, collisionGroup }) {
    super(game);
    Object.assign(this, {
      game,
      rows,
      columns,
      collisionGroup
    });
    this.game.add.existing(this);

    this.cells = [];
    this.gap = this.game.getExactValue(0);
    this.draw();
  }

  get randomGrassCell() {
    const grassCells = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.cells[i][j].type === BCELL_TYPE.GRASS) {
          grassCells.push(this.cells[i][j]);
        }
      }
    }

    return grassCells[Math.floor(Math.random() * grassCells.length)];
  }

  draw() {
    const stoneMap = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }, () => 1));

    for (let k = 0; k < 16 * 8; k++) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const x = Math.floor(Math.random() * (this.columns - pattern[0].length + 1));
      const y = Math.floor(Math.random() * (this.rows - pattern.length + 1));
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          const x1 = x + j;
          const y1 = y + i;
          if (stoneMap[y1][x1] === BCELL_TYPE.STONE) {
            stoneMap[y1][x1] = pattern[i][j];
          }
        }
      }
    }

    let x = 0;
    let y = 0;
    let cell = null;
    for (let i = 0; i < this.rows; i++) {
      this.cells[i] = [];
      for (let j = 0; j < this.columns; j++) {
        cell = new BCell({
          game: this.game,
          x,
          y,
          type: stoneMap[i][j],
          row: i,
          column: j
        });

        this.cells[i][j] = cell;
        this.add(cell);

        x += cell.width;
      }
      x = 0;
      y += cell.height;
    }

    this.computeSuccessors();
  }

  checkCell(row, column) {
    if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
      const cell = this.cells[row][column];
      return cell.type !== BCELL_TYPE.STONE && !cell.hasBomb;
    }
    return false;
  }

  computeSuccessors() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.initSuccessors(this.cells[i][j]);
      }
    }
  }

  initSuccessors(cell) {
    const { row, column } = cell;
    const canGoDown = this.checkCell(row + 1, column);
    const canGoUp = this.checkCell(row - 1, column);
    const canGoRight = this.checkCell(row, column + 1);
    const canGoLeft = this.checkCell(row, column - 1);

    cell.successors = [];

    if (canGoDown) {
      cell.successors.push(this.cells[row + 1][column]);
    }

    if (canGoUp) {
      cell.successors.push(this.cells[row - 1][column]);
    }

    if (canGoRight) {
      cell.successors.push(this.cells[row][column + 1]);
    }

    if (canGoLeft) {
      cell.successors.push(this.cells[row][column - 1]);
    }

    if (canGoDown && canGoLeft && this.checkCell(row + 1, column - 1)) {
      cell.successors.push(this.cells[row + 1][column - 1]);
    }

    if (canGoDown && canGoRight && this.checkCell(row + 1, column + 1)) {
      cell.successors.push(this.cells[row + 1][column + 1]);
    }

    if (canGoUp && canGoLeft && this.checkCell(row - 1, column - 1)) {
      cell.successors.push(this.cells[row - 1][column - 1]);
    }

    if (canGoUp && canGoRight && this.checkCell(row - 1, column + 1)) {
      cell.successors.push(this.cells[row - 1][column + 1]);
    }
  }

  getReachableCells(cell) {
    const visited = Array.from({ length: this.rows * this.columns }, () => false);

    const search = cell => {
      if (visited[cell.row * this.rows + cell.column]) {
        return [];
      }

      visited[cell.row * this.rows + cell.column] = true;

      return cell.successors.map(neighbour => search(neighbour)).reduce((acc, item) => acc.concat(item), [cell]);
    };

    return search(cell).slice(1);
  }

  dfs(start, finish) {
    const visited = Array.from({ length: this.rows * this.columns }, () => false);

    const search = cell => {
      if (visited[cell.row * this.rows + cell.column]) {
        return null;
      }

      if (cell.row === finish.row && cell.column === finish.column) {
        return [cell];
      }

      visited[cell.row * this.rows + cell.column] = true;

      for (let i = 0; i < cell.successors.length; i++) {
        const subPath = search(cell.successors[i]);
        if (subPath) {
          return [cell].concat(subPath);
        }
      }

      return null;
    };

    const path = search(start);
    return path ? path.slice(1) : null;
  }

  aStar(start, finish) {
    const infoMap = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => ({
        f: Number.MAX_VALUE,
        g: Number.MAX_VALUE,
        h: Number.MAX_VALUE,
        closed: false,
        parent: null
      }))
    );
    infoMap[start.row][start.column].f = 0;
    infoMap[start.row][start.column].g = 0;
    infoMap[start.row][start.column].h = 0;
    infoMap[start.row][start.column].parent = start;

    const openList = [start];

    while (openList.length > 0) {
      const p = openList.shift();
      const pInfo = infoMap[p.row][p.column];
      pInfo.closed = true;

      const { successors } = p;

      for (let j = 0; j < successors.length; j++) {
        const successor = successors[j];
        const { row, column } = successor;
        const sInfo = infoMap[row][column];
        if (row === finish.row && column === finish.column) {
          const path = [finish];

          for (let cell = p; cell !== start; cell = infoMap[cell.row][cell.column].parent) {
            path.push(cell);
          }

          path.reverse();
          return path;
        }

        if (sInfo.closed) {
          continue;
        }

        const gNew = pInfo.g + 1;
        const hNew = Math.abs(row - finish.row) + Math.abs(column - finish.column);
        const fNew = gNew + hNew;

        if (sInfo.f > fNew) {
          openList.push(successor);
          sInfo.f = fNew;
          sInfo.g = gNew;
          sInfo.h = hNew;
          sInfo.parent = p;
        }
        // debugger;
      }
    }

    return null;
  }
}

/* prettier-ignore */
const patterns = [
  [
    [2, 2],
    [2, 2]
  ],
  [
    [2, 1],
    [2, 2]
  ],
  [
    [2, 2],
    [1, 2]
  ],
  [
    [2, 2],
    [2, 1]
  ],
  [
    [1, 2],
    [2, 2]
  ]
];
