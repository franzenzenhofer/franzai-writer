/**
 * Configuration module for kaleidoscope parameters
 * Manages all configurable values and parameter constraints
 */

export const config = {
  // Visual parameters
  slices: 12,           // Number of radial symmetry slices (6-24)
  circles: 8,           // Number of base motifs per slice
  baseRadius: 0.35,     // Base radius as fraction of min(width, height)
  swirlSpeed: 0.25,     // Rotation speed factor
  hueSpeed: 40,         // Hue rotation speed
  sizeMod: 0.18,        // Size modulation factor
  
  // Circle rendering
  minSize: 30,          // Minimum circle size
  maxSize: 50,          // Maximum circle size (before modulation)
  radiusVariation: 40,  // Radius variation amount
  
  // Animation
  timeScale: 0.001,     // Convert milliseconds to seconds
  angleSpeed: 0.7,      // Circle arrangement rotation speed
  sizeWaveSpeed: 1.2,   // Size oscillation speed
  
  // Interaction
  swirlSpeedMin: 0.05,
  swirlSpeedMax: 0.65,
  slicesMin: 6,
  slicesMax: 24,
  
  // Colors
  saturation: 100,
  lightness: 65,
  centerAlpha: 0.95,
  edgeAlpha: 0,
  edgeLightness: 15,
  hueOffset: 180,       // Complementary color offset
  
  // Canvas
  backgroundColor: '#000',
  clearAlpha: 1.0       // Full clear each frame
};

// Parameter constraints and validators
export const constraints = {
  slices: { min: 3, max: 36 },
  circles: { min: 1, max: 20 },
  baseRadius: { min: 0.1, max: 0.8 },
  swirlSpeed: { min: -2, max: 2 },
  hueSpeed: { min: 0, max: 200 },
  sizeMod: { min: 0, max: 1 }
};

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validate and constrain a parameter value
 */
export function validateParameter(param, value) {
  if (!constraints[param]) return value;
  const { min, max } = constraints[param];
  return clamp(value, min, max);
}

/**
 * Update multiple parameters with validation
 */
export function updateConfig(updates) {
  Object.entries(updates).forEach(([key, value]) => {
    if (config.hasOwnProperty(key)) {
      config[key] = validateParameter(key, value);
    }
  });
}

/**
 * Get normalized value (0-1) for a parameter based on its constraints
 */
export function getNormalizedValue(param) {
  if (!constraints[param]) return 0.5;
  const { min, max } = constraints[param];
  return (config[param] - min) / (max - min);
}

/**
 * Set parameter from normalized value (0-1)
 */
export function setFromNormalized(param, normalizedValue) {
  if (!constraints[param]) return;
  const { min, max } = constraints[param];
  config[param] = min + normalizedValue * (max - min);
}