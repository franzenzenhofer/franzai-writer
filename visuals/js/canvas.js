// Canvas management module
export class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.midX = 0;
    this.midY = 0;
    
    this.setupResizeHandler();
    this.resize();
  }
  
  setupResizeHandler() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }
  
  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = this.canvas.clientWidth * this.dpr;
    this.height = this.canvas.clientHeight * this.dpr;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Reset transform to handle device pixel ratio
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    
    this.midX = this.width / (2 * this.dpr);
    this.midY = this.height / (2 * this.dpr);
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  getMinDimension() {
    return Math.min(this.width, this.height) / this.dpr;
  }
  
  save() {
    this.ctx.save();
  }
  
  restore() {
    this.ctx.restore();
  }
  
  translate(x, y) {
    this.ctx.translate(x, y);
  }
  
  rotate(angle) {
    this.ctx.rotate(angle);
  }
  
  scale(x, y) {
    this.ctx.scale(x, y);
  }
}