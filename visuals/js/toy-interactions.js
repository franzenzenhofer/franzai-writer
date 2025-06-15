import Hammer from 'hammerjs';
import { parms, defaultParms } from './config.js';
import { PhysicsEngine } from './physics.js';

// Global physics engine
export const physics = new PhysicsEngine();

// Gesture state tracking
let gestureState = {
  rotating: false,
  pinching: false,
  panning: false,
  startRotation: 0,
  startScale: 1,
  lastVelocityX: 0,
  lastVelocityY: 0,
  lastRotation: 0,
  multiTouchDistance: 0
};

// Setup rich toy-like interactions
export function setupToyInteractions(element) {
  const hammer = new Hammer.Manager(element, {
    touchAction: 'none',
    recognizers: [
      [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 0 }],
      [Hammer.Pinch, { enable: true }],
      [Hammer.Rotate, { enable: true }],
      [Hammer.Swipe, { direction: Hammer.DIRECTION_ALL, velocity: 0.3 }],
      [Hammer.Press, { time: 500 }],
      [Hammer.Tap, { taps: 1 }],
      [Hammer.Tap, { event: 'doubletap', taps: 2 }]
    ]
  });
  
  // Allow simultaneous recognition
  hammer.get('pinch').recognizeWith(['rotate', 'pan']);
  hammer.get('rotate').recognizeWith(['pinch', 'pan']);
  
  // ROTATE - Change swirl speed
  hammer.on('rotatestart', (e) => {
    gestureState.rotating = true;
    gestureState.startRotation = parms.swirlSpeed;
    physics.lastInteractionTime = Date.now();
  });
  
  hammer.on('rotate', (e) => {
    const rotationNorm = e.rotation / 180; // -1 to 1
    parms.swirlSpeed = Math.max(-0.5, Math.min(0.5, gestureState.startRotation + rotationNorm * 0.3));
  });
  
  hammer.on('rotateend', (e) => {
    gestureState.rotating = false;
    physics.lastInteractionTime = Date.now();
  });
  
  // PINCH - Zoom in/out changes pattern density
  hammer.on('pinchstart', (e) => {
    gestureState.pinching = true;
    gestureState.startScale = physics.scale;
    physics.startInteraction();
  });
  
  hammer.on('pinch', (e) => {
    physics.setScale(gestureState.startScale * e.scale);
    physics.setSpread(e.scale);
    
    // Pinch also affects slice count dynamically
    parms.slices = Math.round(defaultParms.slices * (2 - e.scale));
  });
  
  hammer.on('pinchend', () => {
    gestureState.pinching = false;
    physics.endInteraction();
  });
  
  // PAN - Drag to temporarily change parameters
  hammer.on('panstart', () => {
    gestureState.panning = true;
    physics.startInteraction();
  });
  
  hammer.on('pan', (e) => {
    // Horizontal pan affects swirl speed
    const normX = e.deltaX / window.innerWidth;
    parms.swirlSpeed = defaultParms.swirlSpeed + normX * 0.5;
    
    // Vertical pan affects pattern complexity
    const normY = e.deltaY / window.innerHeight;
    parms.circles = Math.round(defaultParms.circles + normY * 4);
    
    // Store velocity for momentum
    gestureState.lastVelocityX = e.velocityX;
    gestureState.lastVelocityY = e.velocityY;
  });
  
  hammer.on('panend', () => {
    gestureState.panning = false;
    physics.endInteraction();
    
    // Add momentum to rotation based on pan velocity
    physics.addRotationImpulse(gestureState.lastVelocityX * 0.05);
  });
  
  // SWIPE - Quick flick to spin
  hammer.on('swipe', (e) => {
    const power = Math.sqrt(e.velocityX * e.velocityX + e.velocityY * e.velocityY);
    
    // Stronger swipes create more spin
    if (e.direction === Hammer.DIRECTION_LEFT || e.direction === Hammer.DIRECTION_RIGHT) {
      physics.addRotationImpulse(e.velocityX * power * 0.2);
    }
    
    // Vertical swipes affect scale
    if (e.direction === Hammer.DIRECTION_UP) {
      physics.addScaleImpulse(0.3);
      parms.circles = Math.min(12, parms.circles + 2);
    } else if (e.direction === Hammer.DIRECTION_DOWN) {
      physics.addScaleImpulse(-0.3);
      parms.circles = Math.max(3, parms.circles - 2);
    }
    
    // Swipe also creates a temporary burst effect
    parms.hueSpeed = defaultParms.hueSpeed * 3;
    setTimeout(() => {
      parms.hueSpeed = defaultParms.hueSpeed;
      parms.circles = defaultParms.circles;
    }, 1000);
  });
  
  // PRESS - Hold to see inside (changes pattern)
  hammer.on('press', () => {
    parms.baseRadius = defaultParms.baseRadius * 0.5;
    parms.sizeMod = defaultParms.sizeMod * 2;
    physics.setTwist(Math.PI / 4);
  });
  
  hammer.on('pressup', () => {
    // Spring back
    physics.setTwist(0);
  });
  
  // TAP - Change hue speed temporarily
  hammer.on('tap', (e) => {
    parms.hueSpeed = defaultParms.hueSpeed * 2;
    physics.lastInteractionTime = Date.now();
    
    setTimeout(() => {
      parms.hueSpeed = defaultParms.hueSpeed;
    }, 1000);
  });
  
  // DOUBLE TAP - Reset with a spin
  hammer.on('doubletap', () => {
    physics.addRotationImpulse(2);
    setTimeout(() => {
      Object.assign(parms, defaultParms);
    }, 1000);
  });
  
  // Multi-touch for complex interactions
  element.addEventListener('touchstart', (e) => {
    if (e.touches.length >= 3) {
      // 3+ fingers creates rainbow burst
      parms.hueSpeed = defaultParms.hueSpeed * 5;
      parms.slices = 24;
    }
  }, { passive: false });
  
  element.addEventListener('touchend', (e) => {
    if (e.touches.length < 3) {
      // Return to normal after multi-touch
      setTimeout(() => {
        parms.hueSpeed = defaultParms.hueSpeed;
        parms.slices = defaultParms.slices;
      }, 2000);
    }
  }, { passive: false });
  
  // Prevent defaults
  element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

// Device orientation for subtle movement (if available)
export function setupOrientationInteraction() {
  if (window.DeviceOrientationEvent) {
    let initialAlpha = null;
    
    window.addEventListener('deviceorientation', (e) => {
      if (e.alpha === null) return;
      
      if (initialAlpha === null) {
        initialAlpha = e.alpha;
      }
      
      // Subtle rotation based on device tilt
      const alphaDelta = (e.alpha - initialAlpha) / 360;
      physics.targetRotation = alphaDelta * Math.PI * 0.5;
      
      // Beta (front-back tilt) affects spread
      if (e.beta !== null) {
        const betaNorm = Math.max(-1, Math.min(1, e.beta / 90));
        physics.targetSpread = 1 + betaNorm * 0.2;
      }
    });
  }
  
  // Shake detection
  if (window.DeviceMotionEvent) {
    let lastShake = 0;
    const shakeThreshold = 15;
    
    window.addEventListener('devicemotion', (e) => {
      if (!e.accelerationIncludingGravity) return;
      
      const acc = e.accelerationIncludingGravity;
      const totalAcceleration = Math.sqrt(
        acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
      );
      
      const now = Date.now();
      if (totalAcceleration > shakeThreshold && now - lastShake > 500) {
        lastShake = now;
        
        // Shake creates chaos!
        physics.addRotationImpulse((Math.random() - 0.5) * 5);
        parms.slices = Math.floor(Math.random() * 16) + 8;
        parms.hueSpeed = defaultParms.hueSpeed * (Math.random() * 3 + 1);
        
        // Return to normal after shake
        setTimeout(() => {
          parms.slices = defaultParms.slices;
          parms.hueSpeed = defaultParms.hueSpeed;
        }, 3000);
      }
    });
  }
}

// Update loop for physics integration
export function updateToyPhysics() {
  physics.update();
  
  // Only update parameters based on physics, not visualization
  const time = Date.now() * 0.001;
  
  // Return parameters to defaults gradually
  const timeSinceInteraction = Date.now() - physics.lastInteractionTime;
  if (timeSinceInteraction > 2000) {
    const returnSpeed = 0.05;
    parms.swirlSpeed += (defaultParms.swirlSpeed - parms.swirlSpeed) * returnSpeed;
    parms.hueSpeed += (defaultParms.hueSpeed - parms.hueSpeed) * returnSpeed;
    parms.circles += (defaultParms.circles - parms.circles) * returnSpeed;
    parms.slices = Math.round(parms.slices + (defaultParms.slices - parms.slices) * returnSpeed);
    parms.baseRadius += (defaultParms.baseRadius - parms.baseRadius) * returnSpeed;
    parms.sizeMod += (defaultParms.sizeMod - parms.sizeMod) * returnSpeed;
  }
}