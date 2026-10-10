import { LifeBoard, PATTERNS } from './life-engine.mjs';
import { initCuriosityMap } from './curiosity-map.mjs';

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const numberFormat = new Intl.NumberFormat('en');

class LifeView {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.surface = root.querySelector('.life-surface');
    this.board = null;
    this.running = !motion.matches;
    this.speed = 7;
    this.pattern = root.dataset.pattern || 'garden';
    this.expanded = root.classList.contains('is-expanded');
    this.cursor = [0,0];
    this.pointer = null;
    this.wasRunning = false;
    this.lastTime = 0;
    this.elapsed = 0;
    this.lastStatus = 0;
    this.playButton = root.querySelector('[data-action="play"]');
    this.tools = root.querySelector('.life-tools');
    this.genLabel = root.querySelector('[data-generation]');
    this.liveLabel = root.querySelector('[data-population]');
    this.status = root.querySelector('[data-status]');
    this.resize();
    this.attach();
    this.updatePlay();
    this.updateStats();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.surface);
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  resize() {
    const rect = this.surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.width = rect.width;
    this.height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width*dpr);
    this.canvas.height = Math.round(rect.height*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    const cols = Math.max(40, Math.round(rect.width/7));
    const rows = Math.max(13, Math.round(rect.height/7));
    if (this.board) this.board = this.board.resize(cols,rows);
    else { this.board = new LifeBoard(cols,rows); this.seed(); }
    this.cursor = [Math.min(this.cursor[0],cols-1),Math.min(this.cursor[1],rows-1)];
    this.draw();
    this.updateStats();
  }
  seed() {
    this.board.clear();
    const {cols,rows} = this.board;
    if (this.pattern === 'random') {
      for (let y=0; y<rows; y++) for(let x=0; x<cols; x++) if(Math.random()<.23) this.board.set(x,y,true);
    } else if (this.pattern === 'garden') {
      this.board.plant(PATTERNS.gun, 2, Math.max(1,Math.floor((rows-9)/2)));
      if (cols>60) {
        this.board.plant(PATTERNS.glider,Math.floor(cols*.65),2);
        this.board.plant(PATTERNS.blinker,Math.floor(cols*.85),Math.floor(rows/2));
      }
      if(rows>24) this.board.plant(PATTERNS.pulsar,Math.floor(cols*.62),Math.floor(rows*.52));
    } else {
      const cells=PATTERNS[this.pattern] || PATTERNS.glider;
      const width=Math.max(...cells.map(([x])=>x))+1;
      const height=Math.max(...cells.map(([,y])=>y))+1;
      this.board.plant(cells,Math.floor((cols-width)/2),Math.floor((rows-height)/2));
    }
    this.elapsed=0;
    this.draw();
    this.updateStats();
  }
  announce(message) { if(this.status) this.status.textContent=message; }
  updateStats() {
    if(!this.board) return;
    if(this.genLabel) this.genLabel.textContent=numberFormat.format(this.board.generation);
    if(this.liveLabel) this.liveLabel.textContent=numberFormat.format(this.board.population);
  }
  updatePlay() {
    this.playButton.textContent=this.running ? '[pause]' : '[play]';
    this.playButton.setAttribute('aria-label',this.running ? 'Pause the Game of Life' : 'Play the Game of Life');
    this.playButton.setAttribute('aria-pressed',String(this.running));
  }
  togglePlay() {
    this.running=!this.running;
    this.elapsed=0;
    this.updatePlay();
    this.announce(this.running ? 'Simulation playing.' : 'Simulation paused.');
  }
  point(event) {
    const rect=this.canvas.getBoundingClientRect();
    return [Math.min(this.board.cols-1,Math.max(0,Math.floor((event.clientX-rect.left)/rect.width*this.board.cols))),
      Math.min(this.board.rows-1,Math.max(0,Math.floor((event.clientY-rect.top)/rect.height*this.board.rows)))];
  }
  paint(point) {
    const key=point.join(',');
    if(key===this.lastPaint) return;
    this.lastPaint=key;
    this.board.set(...point,this.paintValue);
    this.cursor=point;
    this.draw(); this.updateStats();
  }
  finishPointer() {
    if(this.pointer===null) return;
    this.pointer=null;
    this.lastPaint=null;
    this.running=this.wasRunning;
    this.elapsed=0;
    this.updatePlay();
    this.announce('Cells updated. '+(this.running?'Simulation playing.':'Simulation paused.'));
  }
  attach() {
    this.playButton.addEventListener('click',()=>this.togglePlay());
    this.root.querySelector('[data-action="reset"]').addEventListener('click',()=>{this.seed();this.announce('Pattern reset.');});
    const expand=this.root.querySelector('[data-action="expand"]');
    if(expand) expand.addEventListener('click',()=>{
      this.expanded=!this.expanded;
      this.root.classList.toggle('is-expanded',this.expanded);
      this.tools.hidden=!this.expanded;
      expand.textContent=this.expanded ? '[close playground ↙]' : '[open playground ↗]';
      expand.setAttribute('aria-expanded',String(this.expanded));
      this.announce(this.expanded?'Playground expanded.':'Playground collapsed.');
    });
    this.root.querySelector('[data-action="step"]').addEventListener('click',()=>{
      this.running=false;this.updatePlay();this.board.step();this.draw();this.updateStats();
      this.announce('Generation '+this.board.generation+'. '+this.board.population+' living cells.');
    });
    this.root.querySelector('[data-action="clear"]').addEventListener('click',()=>{
      this.running=false;this.updatePlay();this.board.clear();this.draw();this.updateStats();this.announce('Board cleared. Click a cell to start.');
    });
    const selector=this.root.querySelector('[data-pattern]');
    selector.value=this.pattern;
    selector.addEventListener('change',()=>{this.pattern=selector.value;this.seed();this.announce('New pattern loaded.');});
    const speed=this.root.querySelector('[data-speed]');
    speed.addEventListener('input',()=>{this.speed=Number(speed.value);this.root.querySelector('[data-speed-label]').textContent=this.speed+'×';});
    this.canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0 || this.pointer!==null) return;
      this.canvas.focus({preventScroll:true});
      this.pointer=event.pointerId;
      this.wasRunning=this.running;
      this.running=false;
      this.paintValue=!this.board.get(...this.point(event));
      this.lastPaint=null;
      this.paint(this.point(event));
      this.canvas.setPointerCapture(event.pointerId);
      this.updatePlay();
    });
    this.canvas.addEventListener('pointermove',event=>{
      if(event.pointerId===this.pointer) this.paint(this.point(event));
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture']) this.canvas.addEventListener(type,()=>this.finishPointer());
    this.canvas.addEventListener('focus',()=>this.draw());
    this.canvas.addEventListener('blur',()=>this.draw());
    this.canvas.addEventListener('keydown',event=>{
      if([' ','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) event.preventDefault();
      if(event.key===' ') this.togglePlay();
      else if(event.key==='Enter') {
        this.running=false;this.updatePlay();this.board.set(...this.cursor,!this.board.get(...this.cursor));this.draw();this.updateStats();
        this.announce('Cell '+(this.cursor[0]+1)+', '+(this.cursor[1]+1)+' updated.');
      } else if(event.key.startsWith('Arrow')) {
        const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
        const delta=dirs[event.key];
        if(!delta) return;
        this.cursor=[(this.cursor[0]+delta[0]+this.board.cols)%this.board.cols,(this.cursor[1]+delta[1]+this.board.rows)%this.board.rows];
        this.draw();
      }
    });
    motion.addEventListener('change',event=>{if(event.matches){this.running=false;this.updatePlay();}});
  }
  draw() {
    if(!this.board) return;
    const ctx=this.ctx, {cols,rows}=this.board;
    const cw=this.width/cols, ch=this.height/rows;
    ctx.clearRect(0,0,this.width,this.height);
    ctx.fillStyle='#f9fbfb';ctx.fillRect(0,0,this.width,this.height);
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
      const i=y*cols+x;
      if(this.board.cells[i]) ctx.fillStyle=this.board.ages[i]>4?'#517e9e':'#80a9c5';
      else if(this.board.trails[i]) ctx.fillStyle=['','#edf3f7','#e7eff4','#e0eaf1','#d9e6ef','#d1e1ec'][this.board.trails[i]];
      else if(this.expanded) {ctx.fillStyle='#dfE9ef';ctx.fillRect(x*cw+cw/2,y*ch+ch/2,.8,.8);continue;}
      else continue;
      ctx.fillRect(x*cw+1,y*ch+1,Math.max(1,cw-1.8),Math.max(1,ch-1.8));
    }
    if(document.activeElement===this.canvas) {
      ctx.strokeStyle='#20527c';ctx.lineWidth=1.3;
      ctx.strokeRect(this.cursor[0]*cw+.4,this.cursor[1]*ch+.4,cw-.8,ch-.8);
    }
  }
  animate(time) {
    if(!document.hidden && this.running && this.pointer===null) {
      this.elapsed+=Math.min(time-(this.lastTime || time),100);
      const interval=1000/this.speed;
      if(this.elapsed>=interval) {
        this.board.step();this.elapsed%=interval;this.draw();
        if(time-this.lastStatus>160){this.updateStats();this.lastStatus=time;}
      }
    }
    this.lastTime=time;
    requestAnimationFrame(this.animate);
  }
}

for(const root of document.querySelectorAll('[data-life]')) new LifeView(root);

for(const root of document.querySelectorAll('[data-curiosity]')) initCuriosityMap(root);
