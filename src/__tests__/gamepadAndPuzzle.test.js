/**
 * Unit tests for GamepadManager and game mode / puzzle helpers
 */

import {
  readGamepad,
  createEmptyInput,
  applyGamepadToRegistry,
  BUTTON
} from '../utils/GamepadManager.js';
import {
  normalizePlayerCount,
  isPuzzlePlayMode,
  PLAY_MODES,
  ADVENTURE_MAX_LEVEL
} from '../utils/gameModeUtils.js';
import {
  getPuzzleLevel,
  PUZZLE_LEVELS,
  PUZZLE_MAX_LEVEL
} from '../utils/puzzleLevels.js';

describe('GamepadManager', () => {
  test('createEmptyInput returns disconnected defaults', () => {
    const input = createEmptyInput();
    expect(input.connected).toBe(false);
    expect(input.left).toBe(false);
    expect(input.right).toBe(false);
    expect(input.jump).toBe(false);
    expect(input.fire).toBe(false);
  });

  test('readGamepad maps stick and buttons', () => {
    const pad = {
      connected: true,
      id: 'Test Pad',
      axes: [0.8, 0],
      buttons: Array.from({ length: 16 }, (_, i) => ({
        pressed: i === BUTTON.A || i === BUTTON.X,
        value: i === BUTTON.A || i === BUTTON.X ? 1 : 0
      }))
    };

    const input = readGamepad(pad);
    expect(input.connected).toBe(true);
    expect(input.right).toBe(true);
    expect(input.left).toBe(false);
    expect(input.jump).toBe(true);
    expect(input.fire).toBe(true);
  });

  test('readGamepad respects deadzone on axes', () => {
    const pad = {
      connected: true,
      id: 'Quiet Stick',
      axes: [0.1, 0],
      buttons: []
    };
    const input = readGamepad(pad);
    expect(input.left).toBe(false);
    expect(input.right).toBe(false);
  });

  test('applyGamepadToRegistry ORs into existing flags', () => {
    const registry = {
      data: { moveLeft: false, moveRight: false, jump: false, fire: false },
      get(key) { return this.data[key]; },
      set(key, value) { this.data[key] = value; }
    };

    applyGamepadToRegistry(registry, {
      connected: true,
      left: true,
      right: false,
      jump: true,
      fire: false,
      id: 'pad'
    });

    expect(registry.get('moveLeft')).toBe(true);
    expect(registry.get('jump')).toBe(true);
    expect(registry.get('moveRight')).toBe(false);
  });
});

describe('Game Mode Utils', () => {
  test('puzzle play mode forces single player', () => {
    expect(normalizePlayerCount('multiplayer', PLAY_MODES.PUZZLE)).toBe(1);
    expect(normalizePlayerCount('puzzle')).toBe(1);
  });

  test('single and multiplayer convert correctly', () => {
    expect(normalizePlayerCount('single')).toBe(1);
    expect(normalizePlayerCount(1)).toBe(1);
    expect(normalizePlayerCount('multiplayer')).toBe(2);
    expect(normalizePlayerCount(2)).toBe(2);
  });

  test('isPuzzlePlayMode detects puzzle', () => {
    expect(isPuzzlePlayMode(PLAY_MODES.PUZZLE)).toBe(true);
    expect(isPuzzlePlayMode(PLAY_MODES.ADVENTURE)).toBe(false);
  });

  test('adventure max level is 4', () => {
    expect(ADVENTURE_MAX_LEVEL).toBe(4);
  });
});

describe('Puzzle Levels', () => {
  test('has expected number of puzzle levels', () => {
    expect(PUZZLE_LEVELS).toHaveLength(PUZZLE_MAX_LEVEL);
    expect(PUZZLE_MAX_LEVEL).toBe(2);
  });

  test('getPuzzleLevel returns level 1 switch puzzle', () => {
    const level = getPuzzleLevel(1);
    expect(level).not.toBeNull();
    expect(level.puzzleType).toBe('switches');
    expect(level.switches.length).toBeGreaterThanOrEqual(2);
    expect(level.gate).toBeDefined();
    expect(level.flag).toBeDefined();
  });

  test('getPuzzleLevel returns level 2 key puzzle', () => {
    const level = getPuzzleLevel(2);
    expect(level).not.toBeNull();
    expect(level.puzzleType).toBe('key');
    expect(level.keys.length).toBeGreaterThanOrEqual(1);
  });

  test('getPuzzleLevel returns null for out of range', () => {
    expect(getPuzzleLevel(0)).toBeNull();
    expect(getPuzzleLevel(99)).toBeNull();
  });
});

describe('Mode Selection Puzzle Option', () => {
  test('should expose three game mode options including puzzle', () => {
    const modes = [
      { key: 'single', label: '1 PLAYER', playMode: 'adventure' },
      { key: 'multiplayer', label: '2 PLAYERS', playMode: 'adventure' },
      { key: 'puzzle', label: 'PUZZLE MODE', playMode: 'puzzle' }
    ];

    expect(modes).toHaveLength(3);
    expect(modes[2].playMode).toBe('puzzle');
  });

  test('selecting puzzle sets single player + puzzle playMode', () => {
    const registry = {};
    registry.gameMode = 'single';
    registry.playMode = 'puzzle';

    expect(registry.gameMode).toBe('single');
    expect(registry.playMode).toBe('puzzle');
    expect(normalizePlayerCount(registry.gameMode, registry.playMode)).toBe(1);
  });
});
