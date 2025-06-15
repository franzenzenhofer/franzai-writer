import { resize, canvas, setupOrientationHandler } from './canvas.js';
import { setupPointerInteraction, setupHammerGestures } from './interaction.js';
import { draw } from './renderer.js';
import { applyMobileDefaults } from './config.js';

// Apply mobile defaults if needed
applyMobileDefaults();

// Initialize canvas
window.addEventListener('resize', resize, {passive:true});
setupOrientationHandler();
resize();

// Setup interactions
setupPointerInteraction();
setupHammerGestures(canvas);

// Prevent iOS bounce
document.body.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Could pause animation here if needed
  } else {
    // Could resume animation here if needed
  }
});

// Start animation
requestAnimationFrame(draw);