// Rendering module - pure functions for drawing
import { config } from './config.js';

// Create gradient for a single circle
const createGradient = (ctx, x, y, size, hue) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.95)`);
  gradient.addColorStop(1, `hsla(${(hue + 180) % 360}, 100%, 15%, 0)`);
  return gradient;
};

// Draw a single circle
const drawCircle = (ctx, x, y, size, gradient) => {
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
};

// Calculate circle properties
const getCircleProps = (index, time, minDimension) => {
  const angle = (index / config.circles) * Math.PI * 2 + time * 0.7;
  const radius = config.baseRadius * minDimension + Math.sin(time + index) * 40;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const sizeBase = 30 + Math.sin(time * 1.2 + index * 0.7) * 20;
  const size = sizeBase * (1 + config.sizeMod * Math.sin(time * 0.3 + index));
  const hue = (time * config.hueSpeed + index * 50) % 360;
  
  return { x, y, size, hue };
};

// Draw one motif (set of circles)
export const drawMotif = (ctx, time, minDimension) => {
  for (let i = 0; i < config.circles; i++) {
    const { x, y, size, hue } = getCircleProps(i, time, minDimension);
    const gradient = createGradient(ctx, x, y, size, hue);
    drawCircle(ctx, x, y, size, gradient);
  }
};

// Draw complete kaleidoscope
export const drawKaleidoscope = (canvasManager, time) => {
  canvasManager.clear();
  canvasManager.save();
  canvasManager.translate(canvasManager.midX, canvasManager.midY);
  
  const sliceAngle = (Math.PI * 2) / config.slices;
  const minDimension = canvasManager.getMinDimension();
  
  for (let slice = 0; slice < config.slices; slice++) {
    canvasManager.save();
    canvasManager.rotate(sliceAngle * slice + time * config.swirlSpeed);
    
    // Mirror every second slice for enhanced symmetry
    if (slice & 1) {
      canvasManager.scale(-1, 1);
    }
    
    drawMotif(canvasManager.ctx, time, minDimension);
    canvasManager.restore();
  }
  
  canvasManager.restore();
};