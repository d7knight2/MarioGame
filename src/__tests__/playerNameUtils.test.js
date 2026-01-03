/**
 * Unit tests for player name utilities
 */

import {
  MAX_PLAYER_NAME_LENGTH,
  MIN_PLAYER_NAME_LENGTH,
  DEFAULT_PLAYER_NAMES,
  sanitizePlayerName,
  isValidPlayerName,
  getDefaultPlayerName
} from '../utils/playerNameUtils.js';

describe('Player Name Utils', () => {
  describe('Constants', () => {
    test('should have correct max player name length', () => {
      expect(MAX_PLAYER_NAME_LENGTH).toBe(15);
    });

    test('should have correct min player name length', () => {
      expect(MIN_PLAYER_NAME_LENGTH).toBe(1);
    });

    test('should have default player names', () => {
      expect(DEFAULT_PLAYER_NAMES.player1).toBe('Player 1');
      expect(DEFAULT_PLAYER_NAMES.player2).toBe('Player 2');
    });
  });

  describe('sanitizePlayerName', () => {
    test('should trim whitespace', () => {
      expect(sanitizePlayerName('  Mario  ')).toBe('Mario');
      expect(sanitizePlayerName('Luigi   ')).toBe('Luigi');
      expect(sanitizePlayerName('   Toad')).toBe('Toad');
    });

    test('should truncate names longer than max length', () => {
      const longName = 'VeryLongPlayerNameThatExceedsMaxLength';
      const sanitized = sanitizePlayerName(longName);
      expect(sanitized).toHaveLength(MAX_PLAYER_NAME_LENGTH);
      expect(sanitized).toBe('VeryLongPlayerN');
    });

    test('should accept names within valid length', () => {
      expect(sanitizePlayerName('Mario')).toBe('Mario');
      expect(sanitizePlayerName('A')).toBe('A');
      expect(sanitizePlayerName('Player123456789')).toBe('Player123456789');
    });

    test('should return null for empty strings', () => {
      expect(sanitizePlayerName('')).toBe(null);
      expect(sanitizePlayerName('   ')).toBe(null);
    });

    test('should return null for invalid inputs', () => {
      expect(sanitizePlayerName(null)).toBe(null);
      expect(sanitizePlayerName(undefined)).toBe(null);
      expect(sanitizePlayerName(123)).toBe(null);
      expect(sanitizePlayerName({})).toBe(null);
    });

    test('should respect custom max length', () => {
      const name = 'VeryLongName';
      expect(sanitizePlayerName(name, 5)).toBe('VeryL');
      expect(sanitizePlayerName(name, 10)).toBe('VeryLongNa');
    });

    test('should handle special characters', () => {
      expect(sanitizePlayerName('Player-1')).toBe('Player-1');
      expect(sanitizePlayerName('Mario_Luigi')).toBe('Mario_Luigi');
      expect(sanitizePlayerName('Player#123')).toBe('Player#123');
    });
  });

  describe('isValidPlayerName', () => {
    test('should return true for valid names', () => {
      expect(isValidPlayerName('Mario')).toBe(true);
      expect(isValidPlayerName('Luigi')).toBe(true);
      expect(isValidPlayerName('A')).toBe(true);
      expect(isValidPlayerName('Player 1')).toBe(true);
    });

    test('should return false for empty strings', () => {
      expect(isValidPlayerName('')).toBe(false);
      expect(isValidPlayerName('   ')).toBe(false);
    });

    test('should return false for names too long', () => {
      const tooLong = 'A'.repeat(MAX_PLAYER_NAME_LENGTH + 1);
      expect(isValidPlayerName(tooLong)).toBe(false);
    });

    test('should return true for names at max length', () => {
      const maxLength = 'A'.repeat(MAX_PLAYER_NAME_LENGTH);
      expect(isValidPlayerName(maxLength)).toBe(true);
    });

    test('should return false for invalid inputs', () => {
      expect(isValidPlayerName(null)).toBe(false);
      expect(isValidPlayerName(undefined)).toBe(false);
      expect(isValidPlayerName(123)).toBe(false);
      expect(isValidPlayerName({})).toBe(false);
      expect(isValidPlayerName([])).toBe(false);
    });

    test('should handle names with whitespace correctly', () => {
      expect(isValidPlayerName('  Mario  ')).toBe(true); // Valid after trim
      expect(isValidPlayerName('     ')).toBe(false); // Empty after trim
    });
  });

  describe('getDefaultPlayerName', () => {
    test('should return correct default name for player 1', () => {
      expect(getDefaultPlayerName(1)).toBe('Player 1');
    });

    test('should return correct default name for player 2', () => {
      expect(getDefaultPlayerName(2)).toBe('Player 2');
    });

    test('should return player 2 name for other numbers', () => {
      expect(getDefaultPlayerName(3)).toBe('Player 2');
      expect(getDefaultPlayerName(0)).toBe('Player 2');
      expect(getDefaultPlayerName(-1)).toBe('Player 2');
    });
  });
});
