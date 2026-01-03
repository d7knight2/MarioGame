/**
 * Power-up and physics utilities
 */

/**
 * Power-up spawn delay in milliseconds
 */
export const POWER_UP_SPAWN_DELAY_MS = 300;

/**
 * Power-up types
 */
export const POWER_UP_TYPES = {
  MUSHROOM: 'mushroom',
  FLOWER: 'flower',
  STAR: 'star'
};

/**
 * Power-up speeds (horizontal velocity)
 */
export const POWER_UP_SPEEDS = {
  [POWER_UP_TYPES.MUSHROOM]: 80,
  [POWER_UP_TYPES.FLOWER]: 50,
  [POWER_UP_TYPES.STAR]: 100
};

/**
 * Calculate power-up direction based on player position
 * Power-ups move away from the player
 * @param {number} playerX - Player's x position
 * @param {number} powerUpX - Power-up's x position
 * @returns {number} Direction multiplier (-1 for left, 1 for right)
 */
export function calculatePowerUpDirection(playerX, powerUpX) {
  return playerX < powerUpX ? -1 : 1;
}

/**
 * Get speed for a power-up type
 * @param {string} type - Power-up type
 * @returns {number} Speed value
 */
export function getPowerUpSpeed(type) {
  return POWER_UP_SPEEDS[type] || POWER_UP_SPEEDS[POWER_UP_TYPES.MUSHROOM];
}

/**
 * Check if a power-up type is valid
 * @param {string} type - Power-up type to check
 * @returns {boolean} Whether the type is valid
 */
export function isValidPowerUpType(type) {
  return Object.values(POWER_UP_TYPES).includes(type);
}

/**
 * Calculate initial spawn velocity for power-ups (upward pop)
 * @returns {number} Initial Y velocity (negative = upward)
 */
export function calculateInitialSpawnVelocity() {
  return -150; // Pop out upward
}

/**
 * Check if power-up should have gravity enabled
 * After fixes, all power-ups should have gravity
 * @param {string} type - Power-up type
 * @returns {boolean} Whether gravity should be enabled
 */
export function shouldEnableGravity(type) {
  return isValidPowerUpType(type); // All valid power-ups have gravity
}
