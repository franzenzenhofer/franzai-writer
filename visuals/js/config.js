// Configuration module - all parameters in one place
export const config = {
  // Visual parameters
  slices: 12,
  circles: 8,
  baseRadius: 0.35,
  swirlSpeed: 0.25,
  hueSpeed: 40,
  sizeMod: 0.18,
  
  // Constraints
  minSlices: 6,
  maxSlices: 24,
  minSwirlSpeed: 0.05,
  maxSwirlSpeed: 0.65,
  
  // Canvas settings
  backgroundColor: '#000',
  infoText: '🌀 Dream‑Kaleido‑Flow – swipe/drag to interact'
};

// Parameter update functions
export const updateParams = {
  setSwirlSpeed: (normalizedX) => {
    config.swirlSpeed = config.minSwirlSpeed + Math.abs(normalizedX) * (config.maxSwirlSpeed - config.minSwirlSpeed);
  },
  
  setSlices: (normalizedY) => {
    config.slices = config.minSlices + Math.floor(Math.abs(normalizedY) * (config.maxSlices - config.minSlices));
  }
};