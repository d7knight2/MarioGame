/**
 * Normalize game mode / play mode registry values.
 */

export const PLAY_MODES = {
  ADVENTURE: 'adventure',
  PUZZLE: 'puzzle'
};

/**
 * Convert registry gameMode to player count (1 or 2).
 * Puzzle mode is always single-player.
 * @param {string|number|undefined|null} gameModeValue
 * @param {string} [playMode]
 * @returns {1|2}
 */
export function normalizePlayerCount(gameModeValue, playMode) {
  if (playMode === PLAY_MODES.PUZZLE || gameModeValue === 'puzzle') {
    return 1;
  }
  if (gameModeValue === 'single' || gameModeValue === 1) {
    return 1;
  }
  if (gameModeValue === 'multiplayer' || gameModeValue === 2) {
    return 2;
  }
  // Default single player when unset
  if (gameModeValue == null || gameModeValue === undefined) {
    return 1;
  }
  return 2;
}

/**
 * @param {string|undefined|null} playMode
 * @returns {boolean}
 */
export function isPuzzlePlayMode(playMode) {
  return playMode === PLAY_MODES.PUZZLE;
}

/**
 * Max campaign level for adventure mode.
 */
export const ADVENTURE_MAX_LEVEL = 4;
