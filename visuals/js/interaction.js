import { parms } from './config.js';
import Hammer from 'hammerjs';

let lastX = 0;
let lastY = 0;

// Pointer tweaks: drag horizontally to change swirl, vertically to change slice count.
export function setupPointerInteraction() {
  // Only use pointer events on desktop
  if (!('ontouchstart' in window)) {
    window.addEventListener('pointermove', e => {
      const normX = (e.clientX / window.innerWidth  - .5) * 2;
      const normY = (e.clientY / window.innerHeight - .5) * 2;
      parms.swirlSpeed = 0.05 + Math.abs(normX) * 0.6;
      parms.slices     = 6 + Math.floor(Math.abs(normY) * 18); // 6–24 slices
    }, {passive:true});
  }
}

// Setup Hammer.js for touch gestures
export function setupHammerGestures(element) {
  const hammer = new Hammer.Manager(element, {
    touchAction: 'none',
    recognizers: [
      [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 0 }],
      [Hammer.Pinch, { enable: true }],
      [Hammer.Rotate, { enable: true }]
    ]
  });
  
  // Handle pan gestures
  hammer.on('panstart', (event) => {
    lastX = event.center.x;
    lastY = event.center.y;
  });
  
  hammer.on('panmove', (event) => {
    const deltaX = event.center.x - lastX;
    const deltaY = event.center.y - lastY;
    
    // More sensitive on mobile
    const sensitivity = window.matchMedia('(max-width: 768px)').matches ? 1.5 : 1;
    
    const normX = (deltaX / window.innerWidth) * sensitivity;
    const normY = (deltaY / window.innerHeight) * sensitivity;
    
    parms.swirlSpeed = Math.max(0.05, Math.min(0.65, parms.swirlSpeed + normX));
    parms.slices = Math.max(6, Math.min(24, Math.round(parms.slices + normY * 10)));
    
    lastX = event.center.x;
    lastY = event.center.y;
  });
  
  // Handle pinch for sizing
  hammer.on('pinch', (event) => {
    parms.sizeMod = Math.max(0.1, Math.min(0.5, 0.18 * event.scale));
  });
  
  // Handle rotate for hue speed
  hammer.on('rotate', (event) => {
    parms.hueSpeed = Math.max(10, Math.min(100, 40 + event.rotation / 2));
  });
  
  // Prevent default touch behavior
  element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}