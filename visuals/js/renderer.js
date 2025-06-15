/**
 * Rendering module for kaleidoscope visualization
 * Handles all drawing operations and visual effects
 */

import { config } from './config.js';

export class Renderer {
  constructor(canvasManager) {
    this.canvas = canvasManager;
    this.ctx = canvasManager.ctx;
  }
  
  /**
   * Create a radial gradient for a circle
   */
  createCircleGradient(x, y, size, hue) {
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
    
    // Center color
    gradient.addColorStop(0, `hsla(${hue}, ${config.saturation}%, ${config.lightness}%, ${config.centerAlpha})`);
    
    // Edge color (complementary)
    const edgeHue = (hue + config.hueOffset) % 360;
    gradient.addColorStop(1, `hsla(${edgeHue}, ${config.saturation}%, ${config.edgeLightness}%, ${config.edgeAlpha})`);
    
    return gradient;
  }
  
  /**
   * Draw a single circle with gradient
   */
  drawCircle(x, y, size, hue) {
    this.ctx.fillStyle = this.createCircleGradient(x, y, size, hue);
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * Draw one motif (pattern that will be repeated)
   */
  drawMotif(time) {
    const minDim = this.canvas.getMinDimension();
    const baseR = config.baseRadius * minDim;
    
    for (let i = 0; i < config.circles; i++) {
      // Calculate circle position
      const angle = (i / config.circles) * Math.PI * 2 + time * config.angleSpeed;
      const radiusOffset = Math.sin(time + i) * config.radiusVariation;
      const radius = baseR + radiusOffset;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Calculate circle size with modulation
      const sizeBase = config.minSize + Math.sin(time * config.sizeWaveSpeed + i * 0.7) * (config.maxSize - config.minSize);
      const sizeModulation = 1 + config.sizeMod * Math.sin(time * 0.3 + i);
      const size = sizeBase * sizeModulation;
      
      // Calculate hue
      const hue = (time * config.hueSpeed + i * 50) % 360;
      
      this.drawCircle(x, y, size, hue);
    }
  }
  
  /**
   * Apply rotation and optional mirroring transformation
   */
  applySliceTransform(sliceIndex, time) {
    const sliceAngle = (Math.PI * 2) / config.slices;
    this.ctx.rotate(sliceAngle * sliceIndex + time * config.swirlSpeed);
    
    // Mirror every second slice for enhanced symmetry
    if (sliceIndex & 1) {
      this.ctx.scale(-1, 1);
    }
  }
  
  /**
   * Render the complete kaleidoscope
   */
  render(time) {
    // Clear canvas
    this.canvas.clear(config.backgroundColor);
    
    // Save state and translate to center
    this.canvas.save();
    this.canvas.translateToCenter();
    
    // Draw each slice
    for (let i = 0; i < config.slices; i++) {
      this.ctx.save();
      this.applySliceTransform(i, time);
      this.drawMotif(time);
      this.ctx.restore();
    }
    
    // Restore original state
    this.canvas.restore();
  }
  
  /**
   * Draw debug information
   */
  drawDebugInfo(info) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '12px monospace';
    
    const lines = [
      `FPS: ${info.fps.toFixed(1)}`,
      `Slices: ${config.slices}`,
      `Circles: ${config.circles}`,
      `Swirl: ${config.swirlSpeed.toFixed(2)}`,
      `Canvas: ${info.canvasInfo.cssWidth}x${info.canvasInfo.cssHeight} (${info.canvasInfo.dpr}x)`
    ];
    
    lines.forEach((line, i) => {
      this.ctx.fillText(line, 10, 20 + i * 15);
    });
    
    this.ctx.restore();
  }
}