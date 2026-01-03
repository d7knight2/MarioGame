/**
 * Unit tests for power-up utilities
 */

import {
  POWER_UP_SPAWN_DELAY_MS,
  POWER_UP_TYPES,
  POWER_UP_SPEEDS,
  calculatePowerUpDirection,
  getPowerUpSpeed,
  isValidPowerUpType,
  calculateInitialSpawnVelocity,
  shouldEnableGravity
} from '../utils/powerUpUtils.js';

describe('Power-up Utils', () => {
  describe('Constants', () => {
    test('should have correct spawn delay', () => {
      expect(POWER_UP_SPAWN_DELAY_MS).toBe(300);
    });

    test('should have correct power-up types', () => {
      expect(POWER_UP_TYPES.MUSHROOM).toBe('mushroom');
      expect(POWER_UP_TYPES.FLOWER).toBe('flower');
      expect(POWER_UP_TYPES.STAR).toBe('star');
    });

    test('should have correct power-up speeds', () => {
      expect(POWER_UP_SPEEDS.mushroom).toBe(80);
      expect(POWER_UP_SPEEDS.flower).toBe(50);
      expect(POWER_UP_SPEEDS.star).toBe(100);
    });

    test('star should be fastest, flower slowest', () => {
      expect(POWER_UP_SPEEDS.star).toBeGreaterThan(POWER_UP_SPEEDS.mushroom);
      expect(POWER_UP_SPEEDS.mushroom).toBeGreaterThan(POWER_UP_SPEEDS.flower);
    });
  });

  describe('calculatePowerUpDirection', () => {
    test('should move left when player is left of power-up', () => {
      const playerX = 100;
      const powerUpX = 200;
      expect(calculatePowerUpDirection(playerX, powerUpX)).toBe(-1);
    });

    test('should move right when player is right of power-up', () => {
      const playerX = 300;
      const powerUpX = 200;
      expect(calculatePowerUpDirection(playerX, powerUpX)).toBe(1);
    });

    test('should move right when player is at same position', () => {
      const playerX = 200;
      const powerUpX = 200;
      expect(calculatePowerUpDirection(playerX, powerUpX)).toBe(1);
    });

    test('should handle edge cases', () => {
      expect(calculatePowerUpDirection(0, 100)).toBe(-1);
      expect(calculatePowerUpDirection(100, 0)).toBe(1);
      expect(calculatePowerUpDirection(0, 0)).toBe(1);
    });
  });

  describe('getPowerUpSpeed', () => {
    test('should return correct speed for mushroom', () => {
      expect(getPowerUpSpeed('mushroom')).toBe(80);
    });

    test('should return correct speed for flower', () => {
      expect(getPowerUpSpeed('flower')).toBe(50);
    });

    test('should return correct speed for star', () => {
      expect(getPowerUpSpeed('star')).toBe(100);
    });

    test('should return mushroom speed for invalid type', () => {
      expect(getPowerUpSpeed('invalid')).toBe(80);
      expect(getPowerUpSpeed('')).toBe(80);
      expect(getPowerUpSpeed(null)).toBe(80);
    });
  });

  describe('isValidPowerUpType', () => {
    test('should return true for valid types', () => {
      expect(isValidPowerUpType('mushroom')).toBe(true);
      expect(isValidPowerUpType('flower')).toBe(true);
      expect(isValidPowerUpType('star')).toBe(true);
    });

    test('should return false for invalid types', () => {
      expect(isValidPowerUpType('invalid')).toBe(false);
      expect(isValidPowerUpType('')).toBe(false);
      expect(isValidPowerUpType('coin')).toBe(false);
      expect(isValidPowerUpType('MUSHROOM')).toBe(false); // Case sensitive
    });

    test('should return false for non-string inputs', () => {
      expect(isValidPowerUpType(null)).toBe(false);
      expect(isValidPowerUpType(undefined)).toBe(false);
      expect(isValidPowerUpType(123)).toBe(false);
      expect(isValidPowerUpType({})).toBe(false);
    });
  });

  describe('calculateInitialSpawnVelocity', () => {
    test('should return negative velocity (upward)', () => {
      const velocity = calculateInitialSpawnVelocity();
      expect(velocity).toBe(-150);
    });

    test('should be less than zero (upward direction)', () => {
      expect(calculateInitialSpawnVelocity()).toBeLessThan(0);
    });

    test('should have magnitude greater than zero', () => {
      expect(Math.abs(calculateInitialSpawnVelocity())).toBeGreaterThan(0);
    });
  });

  describe('shouldEnableGravity', () => {
    test('should enable gravity for all valid power-up types', () => {
      expect(shouldEnableGravity('mushroom')).toBe(true);
      expect(shouldEnableGravity('flower')).toBe(true);
      expect(shouldEnableGravity('star')).toBe(true);
    });

    test('should return false for invalid types', () => {
      expect(shouldEnableGravity('invalid')).toBe(false);
      expect(shouldEnableGravity('')).toBe(false);
      expect(shouldEnableGravity(null)).toBe(false);
    });
  });

  describe('Power-up behavior integration', () => {
    test('should match behavior described in game logic tests', () => {
      // Initial velocity should be upward
      expect(calculateInitialSpawnVelocity()).toBeLessThan(0);
      
      // All speeds should be positive
      expect(getPowerUpSpeed('mushroom')).toBeGreaterThan(0);
      expect(getPowerUpSpeed('star')).toBeGreaterThan(0);
      expect(getPowerUpSpeed('flower')).toBeGreaterThan(0);
      
      // Star should be fastest, flower slowest
      expect(getPowerUpSpeed('star')).toBeGreaterThan(getPowerUpSpeed('mushroom'));
      expect(getPowerUpSpeed('mushroom')).toBeGreaterThan(getPowerUpSpeed('flower'));
    });

    test('spawn delay should be reasonable', () => {
      expect(POWER_UP_SPAWN_DELAY_MS).toBeGreaterThan(0);
      expect(POWER_UP_SPAWN_DELAY_MS).toBeLessThan(1000);
    });
  });
});
