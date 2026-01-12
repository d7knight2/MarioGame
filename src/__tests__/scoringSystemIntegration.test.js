/**
 * Integration tests for the complete scoring system
 * Demonstrates Test-Driven Development (TDD) principles
 * 
 * This test suite validates the entire scoring workflow:
 * 1. Individual score calculations (coins, enemies, etc.)
 * 2. Combined score calculations from multiple sources
 * 3. Score validation and bounds checking
 * 4. Real-world game scenarios
 */

import {
  SCORE_VALUES,
  calculateCoinScore,
  calculateEnemyScore,
  calculateTotalScore,
  isValidScore
} from '../utils/scoreCalculator.js';

describe('Score System Integration', () => {
  describe('Game Scenario: Complete Level 1', () => {
    /**
     * Test a realistic game scenario following TDD principles:
     * GIVEN: A player completes level 1
     * WHEN: They collect coins, defeat enemies, get power-ups
     * THEN: Score should be calculated correctly
     */
    test('should calculate correct total score for completing level 1', () => {
      // Arrange: Set up game statistics for a completed level
      const gameStats = {
        coins: 15,           // Collected 15 coins
        enemies: 5,          // Defeated 5 enemies
        powerUps: 2,         // Collected 2 power-ups (mushroom and flower)
        levelsCompleted: 1,  // Completed level 1
        bossesDefeated: 0    // No boss in level 1
      };

      // Act: Calculate the total score
      const totalScore = calculateTotalScore(gameStats);

      // Assert: Verify the calculation
      // Expected: (15 × 10) + (5 × 50) + (2 × 50) + (1 × 100) + (0 × 500)
      //         = 150 + 250 + 100 + 100 + 0 = 600
      expect(totalScore).toBe(600);
      expect(isValidScore(totalScore)).toBe(true);
    });

    test('should handle perfect run with all collectibles', () => {
      // Arrange: Perfect run scenario
      const perfectRunStats = {
        coins: 30,           // Collected all coins
        enemies: 10,         // Defeated all enemies
        powerUps: 3,         // Collected all power-ups
        levelsCompleted: 1,
        bossesDefeated: 0
      };

      // Act
      const totalScore = calculateTotalScore(perfectRunStats);

      // Assert
      // Expected: (30 × 10) + (10 × 50) + (3 × 50) + (1 × 100)
      //         = 300 + 500 + 150 + 100 = 1050
      expect(totalScore).toBe(1050);
    });

    test('should handle minimal completion (no collectibles)', () => {
      // Arrange: Player just reaches the end without collecting anything
      const minimalStats = {
        coins: 0,
        enemies: 0,
        powerUps: 0,
        levelsCompleted: 1,
        bossesDefeated: 0
      };

      // Act
      const totalScore = calculateTotalScore(minimalStats);

      // Assert: Should still get level completion bonus
      expect(totalScore).toBe(100);
    });
  });

  describe('Game Scenario: Boss Battle', () => {
    test('should award bonus points for defeating boss', () => {
      // Arrange: Boss battle scenario
      const bossDefeatStats = {
        coins: 5,
        enemies: 3,          // Regular enemies before boss
        powerUps: 1,
        levelsCompleted: 1,
        bossesDefeated: 1    // Defeated the boss
      };

      // Act
      const totalScore = calculateTotalScore(bossDefeatStats);

      // Assert
      // Expected: (5 × 10) + (3 × 50) + (1 × 50) + (1 × 100) + (1 × 500)
      //         = 50 + 150 + 50 + 100 + 500 = 850
      expect(totalScore).toBe(850);
      
      // Boss defeat should be the largest contributor
      expect(SCORE_VALUES.bossDefeat).toBeGreaterThan(SCORE_VALUES.levelComplete);
    });
  });

  describe('Game Scenario: Multiplayer Co-op', () => {
    test('should combine scores from both players', () => {
      // Arrange: Two players playing together
      const player1Stats = {
        coins: 10,
        enemies: 3,
        powerUps: 1,
        levelsCompleted: 0,  // Only count level completion once
        bossesDefeated: 0
      };

      const player2Stats = {
        coins: 8,
        enemies: 4,
        powerUps: 2,
        levelsCompleted: 0,
        bossesDefeated: 0
      };

      // Act: Calculate individual scores
      const player1Score = calculateTotalScore(player1Stats);
      const player2Score = calculateTotalScore(player2Stats);

      // Calculate combined team score
      const combinedStats = {
        coins: player1Stats.coins + player2Stats.coins,
        enemies: player1Stats.enemies + player2Stats.enemies,
        powerUps: player1Stats.powerUps + player2Stats.powerUps,
        levelsCompleted: 1,  // Team completed the level
        bossesDefeated: 0
      };
      const teamScore = calculateTotalScore(combinedStats);

      // Assert
      expect(player1Score).toBe(300); // (10×10) + (3×50) + (1×50) = 100 + 150 + 50
      expect(player2Score).toBe(380); // (8×10) + (4×50) + (2×50) = 80 + 200 + 100
      expect(teamScore).toBe(780);    // (18×10) + (7×50) + (3×50) + (1×100) = 180 + 350 + 150 + 100
      
      // Team score should be greater than sum of individual scores (due to level completion bonus)
      expect(teamScore).toBeGreaterThan(player1Score + player2Score);
    });
  });

  describe('Score Validation and Edge Cases', () => {
    test('should reject invalid score values', () => {
      // Assert: Various invalid scores
      expect(isValidScore(-100)).toBe(false);
      expect(isValidScore(Infinity)).toBe(false);
      expect(isValidScore(NaN)).toBe(false);
      expect(isValidScore('100')).toBe(false);
    });

    test('should handle negative input gracefully', () => {
      // Arrange: Invalid negative values
      const invalidStats = {
        coins: -5,
        enemies: -3,
        powerUps: 2,
        levelsCompleted: 1,
        bossesDefeated: 0
      };

      // Act: Should treat negatives as zero
      const score = calculateTotalScore(invalidStats);

      // Assert: Only positive values should count
      expect(score).toBe(200); // (2×50) + (1×100)
    });

    test('should handle missing properties with defaults', () => {
      // Arrange: Incomplete stats object
      const partialStats = {
        coins: 10
        // Other properties missing
      };

      // Act
      const score = calculateTotalScore(partialStats);

      // Assert: Should use defaults for missing properties
      expect(score).toBe(100); // Only coins counted
    });
  });

  describe('Score Components', () => {
    test('should verify all score values are positive', () => {
      // Assert: All score values should be positive
      expect(SCORE_VALUES.coin).toBeGreaterThan(0);
      expect(SCORE_VALUES.enemy).toBeGreaterThan(0);
      expect(SCORE_VALUES.powerUp).toBeGreaterThan(0);
      expect(SCORE_VALUES.levelComplete).toBeGreaterThan(0);
      expect(SCORE_VALUES.bossDefeat).toBeGreaterThan(0);
    });

    test('should maintain proper score value hierarchy', () => {
      // Assert: Boss defeats should be worth the most
      expect(SCORE_VALUES.bossDefeat).toBeGreaterThan(SCORE_VALUES.levelComplete);
      expect(SCORE_VALUES.levelComplete).toBeGreaterThan(SCORE_VALUES.enemy);
      expect(SCORE_VALUES.enemy).toBeGreaterThan(SCORE_VALUES.coin);
    });

    test('should calculate individual component scores correctly', () => {
      // Act & Assert: Test each component independently
      expect(calculateCoinScore(10)).toBe(100);
      expect(calculateEnemyScore(5)).toBe(250);
      
      // Verify consistency with SCORE_VALUES
      expect(calculateCoinScore(1)).toBe(SCORE_VALUES.coin);
      expect(calculateEnemyScore(1)).toBe(SCORE_VALUES.enemy);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large score calculations efficiently', () => {
      // Arrange: Massive score scenario
      const largeStats = {
        coins: 1000,
        enemies: 500,
        powerUps: 100,
        levelsCompleted: 50,
        bossesDefeated: 25
      };

      // Act
      const startTime = performance.now();
      const totalScore = calculateTotalScore(largeStats);
      const endTime = performance.now();

      // Assert
      expect(totalScore).toBe(57500); // (1000×10) + (500×50) + (100×50) + (50×100) + (25×500)
      expect(isValidScore(totalScore)).toBe(true);
      
      // Should complete in under 1ms
      expect(endTime - startTime).toBeLessThan(1);
    });
  });

  describe('Real-world Game Flow', () => {
    test('should track progressive score accumulation', () => {
      // Simulate a game session with progressive updates
      let currentStats = {
        coins: 0,
        enemies: 0,
        powerUps: 0,
        levelsCompleted: 0,
        bossesDefeated: 0
      };

      // Start: Player collects 3 coins
      currentStats.coins = 3;
      let currentScore = calculateTotalScore(currentStats);
      expect(currentScore).toBe(30);

      // Action: Player defeats 2 enemies
      currentStats.enemies = 2;
      currentScore = calculateTotalScore(currentStats);
      expect(currentScore).toBe(130);

      // Action: Player gets a power-up
      currentStats.powerUps = 1;
      currentScore = calculateTotalScore(currentStats);
      expect(currentScore).toBe(180);

      // Final: Player completes the level
      currentStats.levelsCompleted = 1;
      currentScore = calculateTotalScore(currentStats);
      expect(currentScore).toBe(280);

      // Verify final score is valid
      expect(isValidScore(currentScore)).toBe(true);
    });
  });
});
