/**
 * Unit tests for score calculator utilities
 */

import {
  SCORE_VALUES,
  calculateCoinScore,
  calculateEnemyScore,
  calculateTotalScore,
  isValidScore
} from '../utils/scoreCalculator.js';

describe('Score Calculator', () => {
  describe('SCORE_VALUES', () => {
    test('should have correct score values', () => {
      expect(SCORE_VALUES.coin).toBe(10);
      expect(SCORE_VALUES.enemy).toBe(50);
      expect(SCORE_VALUES.powerUp).toBe(50);
      expect(SCORE_VALUES.levelComplete).toBe(100);
      expect(SCORE_VALUES.bossDefeat).toBe(500);
    });
  });

  describe('calculateCoinScore', () => {
    test('should calculate score for single coin', () => {
      expect(calculateCoinScore(1)).toBe(10);
    });

    test('should calculate score for multiple coins', () => {
      expect(calculateCoinScore(5)).toBe(50);
      expect(calculateCoinScore(10)).toBe(100);
      expect(calculateCoinScore(25)).toBe(250);
    });

    test('should return 0 for zero coins', () => {
      expect(calculateCoinScore(0)).toBe(0);
    });

    test('should return 0 for negative numbers', () => {
      expect(calculateCoinScore(-5)).toBe(0);
      expect(calculateCoinScore(-1)).toBe(0);
    });
  });

  describe('calculateEnemyScore', () => {
    test('should calculate score for single enemy', () => {
      expect(calculateEnemyScore(1)).toBe(50);
    });

    test('should calculate score for multiple enemies', () => {
      expect(calculateEnemyScore(2)).toBe(100);
      expect(calculateEnemyScore(5)).toBe(250);
      expect(calculateEnemyScore(10)).toBe(500);
    });

    test('should return 0 for zero enemies', () => {
      expect(calculateEnemyScore(0)).toBe(0);
    });

    test('should return 0 for negative numbers', () => {
      expect(calculateEnemyScore(-5)).toBe(0);
      expect(calculateEnemyScore(-1)).toBe(0);
    });
  });

  describe('calculateTotalScore', () => {
    test('should calculate total score from all statistics', () => {
      const stats = {
        coins: 10,
        enemies: 3,
        powerUps: 2,
        levelsCompleted: 1,
        bossesDefeated: 1
      };
      
      // 10*10 + 3*50 + 2*50 + 1*100 + 1*500 = 100 + 150 + 100 + 100 + 500 = 950
      expect(calculateTotalScore(stats)).toBe(950);
    });

    test('should handle zero statistics', () => {
      const stats = {
        coins: 0,
        enemies: 0,
        powerUps: 0,
        levelsCompleted: 0,
        bossesDefeated: 0
      };
      
      expect(calculateTotalScore(stats)).toBe(0);
    });

    test('should handle partial statistics', () => {
      const stats = {
        coins: 5,
        enemies: 2
      };
      
      // 5*10 + 2*50 = 50 + 100 = 150
      expect(calculateTotalScore(stats)).toBe(150);
    });

    test('should use default values for missing properties', () => {
      const stats = {};
      expect(calculateTotalScore(stats)).toBe(0);
    });

    test('should handle null stats parameter', () => {
      expect(calculateTotalScore(null)).toBe(0);
    });

    test('should handle undefined stats parameter', () => {
      expect(calculateTotalScore(undefined)).toBe(0);
    });

    test('should handle non-object stats parameter', () => {
      expect(calculateTotalScore('invalid')).toBe(0);
      expect(calculateTotalScore(123)).toBe(0);
      expect(calculateTotalScore([])).toBe(0);
    });

    test('should handle negative values in stats', () => {
      const stats = {
        coins: -5,
        enemies: -2,
        powerUps: 3
      };
      
      // Negative values should be treated as 0
      // 0*10 + 0*50 + 3*50 = 0 + 0 + 150 = 150
      expect(calculateTotalScore(stats)).toBe(150);
    });

    test('should calculate score matching game logic test', () => {
      // From original test: collect 3 coins, defeat 2 enemies, collect 1 power-up, complete level
      const stats = {
        coins: 3,
        enemies: 2,
        powerUps: 1,
        levelsCompleted: 1,
        bossesDefeated: 0
      };
      
      // 3*10 + 2*50 + 1*50 + 1*100 = 30 + 100 + 50 + 100 = 280
      expect(calculateTotalScore(stats)).toBe(280);
    });

    test('should calculate score for boss defeat', () => {
      const stats = {
        coins: 0,
        enemies: 0,
        powerUps: 0,
        levelsCompleted: 0,
        bossesDefeated: 1
      };
      
      expect(calculateTotalScore(stats)).toBe(500);
    });

    test('should handle large numbers', () => {
      const stats = {
        coins: 100,
        enemies: 50,
        powerUps: 20,
        levelsCompleted: 10,
        bossesDefeated: 5
      };
      
      // 100*10 + 50*50 + 20*50 + 10*100 + 5*500 = 1000 + 2500 + 1000 + 1000 + 2500 = 8000
      expect(calculateTotalScore(stats)).toBe(8000);
    });
  });

  describe('isValidScore', () => {
    test('should return true for valid positive scores', () => {
      expect(isValidScore(0)).toBe(true);
      expect(isValidScore(100)).toBe(true);
      expect(isValidScore(9999)).toBe(true);
    });

    test('should return false for negative scores', () => {
      expect(isValidScore(-1)).toBe(false);
      expect(isValidScore(-100)).toBe(false);
    });

    test('should return false for non-number inputs', () => {
      expect(isValidScore('100')).toBe(false);
      expect(isValidScore(null)).toBe(false);
      expect(isValidScore(undefined)).toBe(false);
      expect(isValidScore({})).toBe(false);
      expect(isValidScore([])).toBe(false);
    });

    test('should return false for non-finite values', () => {
      expect(isValidScore(Infinity)).toBe(false);
      expect(isValidScore(-Infinity)).toBe(false);
      expect(isValidScore(NaN)).toBe(false);
    });

    test('should return true for decimal scores', () => {
      expect(isValidScore(10.5)).toBe(true);
      expect(isValidScore(0.1)).toBe(true);
    });
  });
});
