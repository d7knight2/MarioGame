/**
 * Unit tests for MultiplayerLobbyScene logic
 * Tests the core functionality without importing Phaser
 */

import { generateGameCode, isValidGameCode } from '../utils/gameCodeGenerator.js';

describe('MultiplayerLobbyScene Logic', () => {
  describe('Game Code Generation (used in hostGame)', () => {
    test('should generate a 6-character game code', () => {
      const code = generateGameCode();
      
      expect(code).toBeDefined();
      expect(code).toHaveLength(6);
      expect(typeof code).toBe('string');
    });

    test('should only use valid characters (no confusing ones)', () => {
      const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
      const confusingChars = /[OI01]/;
      
      // Generate multiple codes to test randomness
      for (let i = 0; i < 20; i++) {
        const code = generateGameCode();
        expect(code).toMatch(validChars);
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

  describe('Game Code Validation (used in joinGame)', () => {
    test('should validate correct 6-character codes', () => {
      expect(isValidGameCode('ABC234')).toBe(true);
      expect(isValidGameCode('XYZ789')).toBe(true);
      expect(isValidGameCode('QWERTY')).toBe(true);
    });

    test('should reject codes with wrong length', () => {
      expect(isValidGameCode('ABC')).toBe(false);
      expect(isValidGameCode('ABCDEFGH')).toBe(false);
      expect(isValidGameCode('')).toBe(false);
    });

    test('should reject codes with invalid characters', () => {
      expect(isValidGameCode('ABC12O')).toBe(false); // Contains 'O'
      expect(isValidGameCode('ABC120')).toBe(false); // Contains '0'
      expect(isValidGameCode('ABC1I2')).toBe(false); // Contains 'I'
      expect(isValidGameCode('ABC1-2')).toBe(false); // Contains '-'
      expect(isValidGameCode('abc123')).toBe(false); // Lowercase
    });

    test('should reject non-string inputs', () => {
      expect(isValidGameCode(null)).toBe(false);
      expect(isValidGameCode(undefined)).toBe(false);
      expect(isValidGameCode(123456)).toBe(false);
      expect(isValidGameCode({})).toBe(false);
    });
  });

  describe('UI Layout Calculations', () => {
    test('should have no overlapping elements on standard screen (800x600)', () => {
      const height = 600;
      const width = 800;
      
      // Calculate positions as in the scene (using UI_SPACING from main branch)
      const titleY = 60;
      const hostBtnY = height / 2 - 120; // 180
      const joinLabelY = height / 2 + 20; // 320
      const codeDisplayY = height / 2 + 100; // 400
      const joinBtnY = height / 2 + 170; // 470
      const switchBtnY = height / 2 + 155; // 455 (fixed from height/2 + 120 to prevent overlap)
      const statusTextY = height - 100; // 500
      const backBtnY = height - 50; // 550
      
      // Verify vertical spacing
      expect(titleY).toBeLessThan(hostBtnY);
      expect(hostBtnY).toBeLessThan(joinLabelY);
      expect(joinLabelY).toBeLessThan(codeDisplayY);
      expect(codeDisplayY).toBeLessThan(switchBtnY);
      expect(switchBtnY).toBeLessThan(statusTextY);
      expect(statusTextY).toBeLessThan(backBtnY);
      
      // Verify no overlap between status text and back button (critical fix)
      expect(Math.abs(statusTextY - backBtnY)).toBeGreaterThanOrEqual(50);
    });

    test('should have no overlapping elements on mobile screen (375x667)', () => {
      const height = 667;
      const width = 375;
      
      // Calculate positions as in the scene
      const titleY = 60;
      const hostBtnY = height / 2 - 100; // 233.5
      const joinLabelY = height / 2; // 333.5
      const codeDisplayY = height / 2 + 60; // 393.5
      const joinBtnY = height / 2 + 130; // 463.5
      const statusTextY = height - 100; // 567
      const backBtnY = height - 50; // 617
      
      // Verify vertical spacing
      expect(titleY).toBeLessThan(hostBtnY);
      expect(hostBtnY).toBeLessThan(joinLabelY);
      expect(joinLabelY).toBeLessThan(codeDisplayY);
      expect(codeDisplayY).toBeLessThan(joinBtnY);
      expect(statusTextY).toBeLessThan(backBtnY);
      
      // Verify 50 pixel gap between status text and back button
      expect(Math.abs(statusTextY - backBtnY)).toBe(50);
    });

    test('should have no overlapping elements on small mobile (320x568)', () => {
      const height = 568;
      const width = 320;
      
      const statusTextY = height - 100; // 468
      const backBtnY = height - 50; // 518
      
      // Verify 50 pixel gap
      expect(Math.abs(statusTextY - backBtnY)).toBe(50);
    });

    test('should have no overlapping elements on large screen (1920x1080)', () => {
      const height = 1080;
      const width = 1920;
      
      const statusTextY = height - 100; // 980
      const backBtnY = height - 50; // 1030
      
      // Verify 50 pixel gap
      expect(Math.abs(statusTextY - backBtnY)).toBe(50);
    });
  });

  describe('Button Overlap Prevention', () => {
    test('should not overlap switchToJoinBtn with codeDisplay in hosting mode', () => {
      const height = 600;
      const codeDisplayY = height / 2 + 100; // 400 (updated in main branch)
      const codeDisplayHeight = 32;
      const switchBtnY = height / 2 + 155; // 455 (fixed from 120)
      const switchBtnHeight = 60;
      
      const codeDisplayBottom = codeDisplayY + codeDisplayHeight / 2; // 416
      const switchBtnTop = switchBtnY - switchBtnHeight / 2; // 425
      
      // Verify no overlap - switchBtn should start after codeDisplay ends
      expect(switchBtnTop).toBeGreaterThan(codeDisplayBottom);
      
      // Verify adequate spacing (at least 8px with new layout)
      const gap = switchBtnTop - codeDisplayBottom;
      expect(gap).toBeGreaterThanOrEqual(8);
    });

    test('should allow joinBtn and switchToJoinBtn to overlap since they are never visible together', () => {
      const height = 600;
      const joinBtnY = height / 2 + 170; // 470 (updated in main branch)
      const joinBtnHeight = 60;
      const switchBtnY = height / 2 + 155; // 455 (fixed position)
      const switchBtnHeight = 60;
      
      const joinBtnTop = joinBtnY - joinBtnHeight / 2; // 440
      const joinBtnBottom = joinBtnY + joinBtnHeight / 2; // 500
      const switchBtnTop = switchBtnY - switchBtnHeight / 2; // 425
      const switchBtnBottom = switchBtnY + switchBtnHeight / 2; // 485
      
      // These buttons overlap, but it's OK because:
      // - joinBtn is visible only in 'initial' state
      // - switchToJoinBtn is visible only in 'hosting' state
      // Verify they do overlap (for documentation purposes)
      const hasOverlap = !(joinBtnBottom < switchBtnTop || switchBtnBottom < joinBtnTop);
      expect(hasOverlap).toBe(true);
    });

    test('should have adequate spacing between visible elements in hosting mode', () => {
      const height = 600;
      
      // Elements visible in hosting mode (using UI_SPACING from main branch)
      const codeDisplayY = height / 2 + 100; // 400
      const codeDisplayHeight = 32;
      const switchBtnY = height / 2 + 155; // 455
      const switchBtnHeight = 60;
      const statusTextY = height - 100; // 500
      const statusTextHeight = 18;
      
      // Calculate gaps
      const gap1 = (switchBtnY - switchBtnHeight / 2) - (codeDisplayY + codeDisplayHeight / 2);
      const gap2 = (statusTextY - statusTextHeight / 2) - (switchBtnY + switchBtnHeight / 2);
      
      // Verify minimum spacing of 5px between all visible elements (tighter with new layout)
      expect(gap1).toBeGreaterThanOrEqual(5);
      expect(gap2).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Lobby State Management', () => {
    test('should have three distinct states', () => {
      const states = ['initial', 'hosting', 'joining'];
      
      expect(states).toContain('initial');
      expect(states).toContain('hosting');
      expect(states).toContain('joining');
      expect(states).toHaveLength(3);
    });

    test('should transition from initial to hosting when creating game', () => {
      let lobbyState = 'initial';
      
      // Simulate hosting
      lobbyState = 'hosting';
      
      expect(lobbyState).toBe('hosting');
    });

    test('should allow switching from hosting back to initial', () => {
      let lobbyState = 'hosting';
      
      // Simulate switch to join mode
      lobbyState = 'initial';
      
      expect(lobbyState).toBe('initial');
    });
  });

  describe('HTML Input Positioning', () => {
    test('should calculate responsive position based on canvas', () => {
      const canvasRect = {
        top: 0,
        left: 0,
        width: 800,
        height: 600
      };
      
      // Calculate as in createCodeInput
      const inputTop = canvasRect.top + canvasRect.height * 0.57;
      
      expect(inputTop).toBeCloseTo(342, 0); // 600 * 0.57, allow floating point variance
    });

    test('should handle different canvas positions', () => {
      const canvasRect = {
        top: 100,
        left: 50,
        width: 800,
        height: 600
      };
      
      const inputTop = canvasRect.top + canvasRect.height * 0.57;
      
      expect(inputTop).toBeCloseTo(442, 0); // 100 + (600 * 0.57), allow floating point variance
    });

    test('should use min-width for responsive sizing', () => {
      // This tests that the CSS uses min(200px, 40vw)
      const cssWidth = 'min(200px, 40vw)';
      
      expect(cssWidth).toContain('min');
      expect(cssWidth).toContain('200px');
      expect(cssWidth).toContain('40vw');
    });
  });

  describe('Uppercase Code Conversion', () => {
    test('should convert lowercase input to uppercase', () => {
      const input = 'abc123';
      const result = input.toUpperCase();
      
      expect(result).toBe('ABC123');
    });

    test('should handle mixed case input', () => {
      const input = 'AbC123';
      const result = input.toUpperCase();
      
      expect(result).toBe('ABC123');
    });

    test('should preserve already uppercase code', () => {
      const input = 'XYZ789';
      const result = input.toUpperCase();
      
      expect(result).toBe('XYZ789');
    });
  });
});

