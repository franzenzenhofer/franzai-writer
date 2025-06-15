/**
 * Canvas management module
 * Handles canvas setup, resizing, and coordinate systems
 */

export class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    
    // Bind resize handler
    this.handleResize = this.handleResize.bind(this);
    this.setupResizeListener();
    
    // Initial resize
    this.handleResize();
  }
  
  /**
   * Setup resize event listener with debouncing
   */
  setupResizeListener() {
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize, { passive: true });
  }
  
  /**
   * Handle canvas resize to maintain crisp rendering on HiDPI displays
   */
  handleResize() {
    this.dpr = window.devicePixelRatio || 1;
    
    // Get CSS size
    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    
    // Set actual canvas size accounting for device pixel ratio
    this.width = cssWidth * this.dpr;
    this.height = cssHeight * this.dpr;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Scale context to match device pixel ratio
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    
    // Calculate center in CSS pixels
    this.centerX = cssWidth / 2;
    this.centerY = cssHeight / 2;
    
    // Enable image smoothing for better gradients
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }
  
  /**
   * Clear the entire canvas
   */
  clear(color = '#000') {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }
  
  /**
   * Get the minimum dimension (for scaling calculations)
   */
  getMinDimension() {
    return Math.min(this.centerX * 2, this.centerY * 2);
  }
  
  /**
   * Convert normalized coordinates (0-1) to canvas coordinates
   */
  normalizedToCanvas(x, y) {
    return {
      x: x * this.centerX * 2,
      y: y * this.centerY * 2
    };
  }
  
  /**
   * Convert canvas coordinates to normalized (0-1)
   */
  canvasToNormalized(x, y) {
    return {
      x: x / (this.centerX * 2),
      y: y / (this.centerY * 2)
    };
  }
  
  /**
   * Save current canvas state
   */
  save() {
    this.ctx.save();
  }
  
  /**
   * Restore canvas state
   */
  restore() {
    this.ctx.restore();
  }
  
  /**
   * Translate to canvas center
   */
  translateToCenter() {
    this.ctx.translate(this.centerX, this.centerY);
  }
  
  /**
   * Get canvas info for debugging
   */
  getInfo() {
    return {
      cssWidth: this.centerX * 2,
      cssHeight: this.centerY * 2,
      actualWidth: this.width,
      actualHeight: this.height,
      dpr: this.dpr,
      minDimension: this.getMinDimension()
    };
  }
}