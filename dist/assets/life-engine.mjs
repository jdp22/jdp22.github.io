// Conway's Life on a toroidal board. The four sides wrap around.
export const PATTERNS = {
  glider: [[1,0],[2,1],[0,2],[1,2],[2,2]],
  blinker: [[0,0],[1,0],[2,0]],
  gun: [[24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],[11,3],[15,3],[20,3],[21,3],[34,3],[35,3],[0,4],[1,4],[10,4],[16,4],[20,4],[21,4],[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],[10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8]],
  pulsar: (() => {
    const cells = [];
    for (const a of [2,3,4,8,9,10]) for (const b of [0,5,7,12]) {
      cells.push([a,b], [b,a]);
    }
    return cells;
  })(),
};

export class LifeBoard {
  constructor(cols, rows) {
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 3 || rows < 3) {
      throw new RangeError('A Life board needs at least 3 × 3 cells.');
    }
    this.cols = cols;
    this.rows = rows;
    this.cells = new Uint8Array(cols * rows);
    this.ages = new Uint16Array(cols * rows);
    this.trails = new Uint8Array(cols * rows);
    this.generation = 0;
  }
  index(x,y) { return ((y % this.rows + this.rows) % this.rows) * this.cols + ((x % this.cols + this.cols) % this.cols); }
  get(x,y) { return this.cells[this.index(x,y)]; }
  set(x,y,alive) {
    const i = this.index(x,y);
    this.cells[i] = alive ? 1 : 0;
    this.ages[i] = alive ? Math.max(1, this.ages[i]) : 0;
    this.trails[i] = 0;
  }
  clear() { this.cells.fill(0); this.ages.fill(0); this.trails.fill(0); this.generation = 0; }
  plant(pattern, x, y) {
    for (const [px,py] of pattern) this.set(x+px, y+py, true);
  }
  get population() { return this.cells.reduce((sum,cell) => sum + cell, 0); }
  step() {
    const next = new Uint8Array(this.cells.length);
    for (let y=0; y<this.rows; y++) for (let x=0; x<this.cols; x++) {
      const i = y*this.cols+x;
      let neighbors = 0;
      for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
        if (dx || dy) neighbors += this.get(x+dx,y+dy);
      }
      const alive = neighbors === 3 || (this.cells[i] === 1 && neighbors === 2);
      next[i] = alive ? 1 : 0;
      this.trails[i] = this.cells[i] && !alive ? 5 : Math.max(0,this.trails[i]-1);
      this.ages[i] = alive ? Math.min(65535,this.ages[i]+1) : 0;
    }
    this.cells = next;
    this.generation++;
  }
  resize(cols,rows) {
    const resized = new LifeBoard(cols,rows);
    const offsetX = Math.floor((cols-this.cols)/2);
    const offsetY = Math.floor((rows-this.rows)/2);
    for (let y=0; y<this.rows; y++) for (let x=0; x<this.cols; x++) {
      const nx=x+offsetX, ny=y+offsetY;
      if (nx>=0 && nx<cols && ny>=0 && ny<rows) {
        const old=y*this.cols+x, fresh=ny*cols+nx;
        resized.cells[fresh]=this.cells[old];
        resized.ages[fresh]=this.ages[old];
        resized.trails[fresh]=this.trails[old];
      }
    }
    resized.generation = this.generation;
    return resized;
  }
}
