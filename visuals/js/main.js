// Main entry point - ties all modules together
import { config } from './config.js';
import { CanvasManager } from './canvas.js';
import { drawKaleidoscope } from './renderer.js';
import { InteractionManager } from './interaction.js';
import { AnimationLoop } from './animation.js';

class KaleidoscopeApp {
  constructor() {
    this.canvasManager = null;
    this.interactionManager = null;
    this.animationLoop = null;
  }
  
  init() {
    // Initialize canvas
    this.canvasManager = new CanvasManager('c');
    
    // Initialize interaction handling
    this.interactionManager = new InteractionManager(this.canvasManager.canvas);
    
    // Initialize animation loop
    this.animationLoop = new AnimationLoop((time) => {
      drawKaleidoscope(this.canvasManager, time);
    });
    
    // Update info text if it exists
    const infoElement = document.getElementById('info');
    if (infoElement) {
      infoElement.textContent = config.infoText;
    }
    
    // Start the animation
    this.animationLoop.start();
    
    // Set up visibility change handling
    this.setupVisibilityHandling();
  }
  
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.animationLoop.pause();
      } else {
        this.animationLoop.resume();
      }
    });
  }
  
  destroy() {
    if (this.animationLoop) {
      this.animationLoop.stop();
    }
    if (this.interactionManager) {
      this.interactionManager.destroy();
    }
  }
}

// Initialize app when DOM is ready
const app = new KaleidoscopeApp();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export app instance for debugging/testing
export default app;