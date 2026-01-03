/**
 * Unit tests for game code generator utilities
 */

import {
  generateGameCode,
  isValidGameCode,
  formatGameCode
} from '../utils/gameCodeGenerator.js';

describe('Game Code Generator', () => {
  describe('generateGameCode', () => {
    test('should generate code of default length 6', () => {
      const code = generateGameCode();
      expect(code).toHaveLength(6);
    });

    test('should generate code of specified length', () => {
      const code = generateGameCode(8);
      expect(code).toHaveLength(8);
    });

    test('should only use valid characters (no confusing ones)', () => {
      const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
      
      // Generate multiple codes to test randomness
      for (let i = 0; i < 10; i++) {
        const code = generateGameCode();
        expect(code).toMatch(validChars);
      }
    });

    test('should not contain confusing characters (O, 0, I, 1)', () => {
      const confusingChars = /[OI01]/;
      
      // Generate multiple codes to test
      for (let i = 0; i < 20; i++) {
        const code = generateGameCode();
        expect(code).not.toMatch(confusingChars);
      }
    });

    test('should generate different codes on each call', () => {
      const codes = new Set();
      
      // Generate 10 codes
      for (let i = 0; i < 10; i++) {
        codes.add(generateGameCode());
      }
      
      // Should have at least 8 unique codes (allowing for rare collisions)
      expect(codes.size).toBeGreaterThanOrEqual(8);
    });
  });

  describe('isValidGameCode', () => {
    test('should return true for valid 6-character codes', () => {
      expect(isValidGameCode('ABC234')).toBe(true);
      expect(isValidGameCode('XYZ789')).toBe(true);
      expect(isValidGameCode('QWERTY')).toBe(true);
    });

    test('should return false for codes with wrong length', () => {
      expect(isValidGameCode('ABC')).toBe(false);
      expect(isValidGameCode('ABCDEFGH')).toBe(false);
      expect(isValidGameCode('')).toBe(false);
    });

    test('should return false for codes with invalid characters', () => {
      expect(isValidGameCode('ABC12O')).toBe(false); // Contains 'O'
      expect(isValidGameCode('ABC120')).toBe(false); // Contains '0'
      expect(isValidGameCode('ABC1I2')).toBe(false); // Contains 'I'
      expect(isValidGameCode('ABC1-2')).toBe(false); // Contains '-'
      expect(isValidGameCode('abc123')).toBe(false); // Lowercase
    });

    test('should return false for non-string inputs', () => {
      expect(isValidGameCode(null)).toBe(false);
      expect(isValidGameCode(undefined)).toBe(false);
      expect(isValidGameCode(123456)).toBe(false);
      expect(isValidGameCode({})).toBe(false);
    });

    test('should support custom expected length', () => {
      expect(isValidGameCode('ABCD', 4)).toBe(true);
      expect(isValidGameCode('ABCDEFGH', 8)).toBe(true);
      expect(isValidGameCode('ABCD', 6)).toBe(false);
    });
  });

  describe('formatGameCode', () => {
    test('should format 6-character code with hyphen', () => {
      expect(formatGameCode('ABC123')).toBe('ABC-123');
      expect(formatGameCode('XYZ789')).toBe('XYZ-789');
    });

    test('should format 8-character code with hyphen', () => {
      expect(formatGameCode('ABCD1234')).toBe('ABCD-1234');
    });

    test('should handle odd-length codes', () => {
      expect(formatGameCode('ABCDE')).toBe('AB-CDE');
    });

    test('should return short codes unchanged', () => {
      expect(formatGameCode('AB')).toBe('AB');
      expect(formatGameCode('A')).toBe('A');
    });

    test('should handle empty or null inputs', () => {
      expect(formatGameCode('')).toBe('');
      expect(formatGameCode(null)).toBe(null);
      expect(formatGameCode(undefined)).toBe(undefined);
    });
  });
});
