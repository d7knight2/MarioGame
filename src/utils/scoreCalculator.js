/**
 * Score calculation utilities
 */

/**
 * Score values for different actions
 */
export const SCORE_VALUES = {
  coin: 10,
  enemy: 50,
  powerUp: 50,
  levelComplete: 100,
  bossDefeat: 500
};

/**
 * Calculate score for collecting multiple coins
 * @param {number} count - Number of coins collected (must be non-negative)
 * @returns {number} Total score
 */
export function calculateCoinScore(count) {
  if (count < 0) {
    return 0; // Don't allow negative scores
  }
  return count * SCORE_VALUES.coin;
}

/**
 * Calculate score for defeating multiple enemies
 * @param {number} count - Number of enemies defeated (must be non-negative)
 * @returns {number} Total score
 */
export function calculateEnemyScore(count) {
  if (count < 0) {
    return 0; // Don't allow negative scores
  }
  return count * SCORE_VALUES.enemy;
}

/**
 * Calculate total score from game statistics
 * @param {Object} stats - Game statistics
 * @param {number} stats.coins - Coins collected
 * @param {number} stats.enemies - Enemies defeated
 * @param {number} stats.powerUps - Power-ups collected
 * @param {number} stats.levelsCompleted - Levels completed
 * @param {number} stats.bossesDefeated - Bosses defeated
 * @returns {number} Total score
 */
export function calculateTotalScore(stats) {
  if (!stats || typeof stats !== 'object') {
    return 0;
  }
  
  const {
    coins = 0,
    enemies = 0,
    powerUps = 0,
    levelsCompleted = 0,
    bossesDefeated = 0
  } = stats;
  
  // Ensure all values are non-negative
  return (
    Math.max(0, coins) * SCORE_VALUES.coin +
    Math.max(0, enemies) * SCORE_VALUES.enemy +
    Math.max(0, powerUps) * SCORE_VALUES.powerUp +
    Math.max(0, levelsCompleted) * SCORE_VALUES.levelComplete +
    Math.max(0, bossesDefeated) * SCORE_VALUES.bossDefeat
  );
}

/**
 * Validate that score is within acceptable bounds
 * @param {number} score - Score to validate
 * @returns {boolean} Whether score is valid
 */
export function isValidScore(score) {
  return typeof score === 'number' && score >= 0 && Number.isFinite(score);
}
