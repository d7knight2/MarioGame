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
 * @param {number} count - Number of coins collected
 * @returns {number} Total score
 */
export function calculateCoinScore(count) {
  return count * SCORE_VALUES.coin;
}

/**
 * Calculate score for defeating multiple enemies
 * @param {number} count - Number of enemies defeated
 * @returns {number} Total score
 */
export function calculateEnemyScore(count) {
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
  const {
    coins = 0,
    enemies = 0,
    powerUps = 0,
    levelsCompleted = 0,
    bossesDefeated = 0
  } = stats;
  
  return (
    coins * SCORE_VALUES.coin +
    enemies * SCORE_VALUES.enemy +
    powerUps * SCORE_VALUES.powerUp +
    levelsCompleted * SCORE_VALUES.levelComplete +
    bossesDefeated * SCORE_VALUES.bossDefeat
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
