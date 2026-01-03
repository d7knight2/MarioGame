/**
 * Player name validation and formatting utilities
 */

/**
 * Maximum allowed length for player names
 */
export const MAX_PLAYER_NAME_LENGTH = 15;

/**
 * Minimum allowed length for player names
 */
export const MIN_PLAYER_NAME_LENGTH = 1;

/**
 * Default player names
 */
export const DEFAULT_PLAYER_NAMES = {
  player1: 'Player 1',
  player2: 'Player 2'
};

/**
 * Validate and sanitize a player name
 * @param {string} name - The name to validate
 * @param {number} maxLength - Maximum length (default: MAX_PLAYER_NAME_LENGTH)
 * @returns {string|null} Sanitized name or null if invalid
 */
export function sanitizePlayerName(name, maxLength = MAX_PLAYER_NAME_LENGTH) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < MIN_PLAYER_NAME_LENGTH) {
    return null;
  }
  
  return trimmed.substring(0, maxLength);
}

/**
 * Check if a player name is valid
 * @param {string} name - The name to check
 * @returns {boolean} Whether the name is valid
 */
export function isValidPlayerName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmed = name.trim();
  return trimmed.length >= MIN_PLAYER_NAME_LENGTH && 
         trimmed.length <= MAX_PLAYER_NAME_LENGTH;
}

/**
 * Get a default player name based on player number
 * @param {number} playerNumber - Player number (1 or 2)
 * @returns {string} Default player name
 */
export function getDefaultPlayerName(playerNumber) {
  return playerNumber === 1 ? DEFAULT_PLAYER_NAMES.player1 : DEFAULT_PLAYER_NAMES.player2;
}
