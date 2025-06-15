// Interaction module with Hammer.js integration
import Hammer from 'hammerjs';
import { updateParams } from './config.js';

export class InteractionManager {
  constructor(element) {
    this.element = element;
    this.hammer = new Hammer.Manager(element);
    this.setupGestures();
  }
  
  setupGestures() {
    // Add pan gesture recognizer
    this.hammer.add(new Hammer.Pan({ 
      direction: Hammer.DIRECTION_ALL,
      threshold: 5
    }));
    
    // Add pinch gesture for potential future scaling
    this.hammer.add(new Hammer.Pinch());
    
    // Add tap gesture
    this.hammer.add(new Hammer.Tap());
    
    // Handle pan/drag gestures
    this.hammer.on('pan', (event) => {
      this.handlePan(event);
    });
    
    // Handle pinch gestures (for future enhancements)
    this.hammer.on('pinch', (event) => {
      this.handlePinch(event);
    });
    
    // Handle tap gestures
    this.hammer.on('tap', (event) => {
      this.handleTap(event);
    });
    
    // Also support traditional pointer events for desktop
    this.setupPointerEvents();
  }
  
  setupPointerEvents() {
    this.element.addEventListener('pointermove', (event) => {
      const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2;
      const normalizedY = (event.clientY / window.innerHeight - 0.5) * 2;
      this.updateParameters(normalizedX, normalizedY);
    }, { passive: true });
  }
  
  handlePan(event) {
    // Normalize pan delta to -1 to 1 range
    const normalizedX = event.deltaX / (window.innerWidth / 2);
    const normalizedY = event.deltaY / (window.innerHeight / 2);
    this.updateParameters(normalizedX, normalizedY);
  }
  
  handlePinch(event) {
    // Reserved for future scaling functionality
    console.log('Pinch scale:', event.scale);
  }
  
  handleTap(event) {
    // Could be used to reset parameters or toggle modes
    console.log('Tap at:', event.center);
  }
  
  updateParameters(normalizedX, normalizedY) {
    updateParams.setSwirlSpeed(normalizedX);
    updateParams.setSlices(normalizedY);
  }
  
  destroy() {
    this.hammer.destroy();
  }
}