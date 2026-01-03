/**
 * Utility for generating and validating game codes
 */

/**
 * Generate a robust 6-character game code
 * Avoids confusing characters like O, 0, I, 1
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} Generated game code
 */
export function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
  return Array.from({ length }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/**
 * Validate a game code
 * @param {string} code - The code to validate
 * @param {number} expectedLength - Expected length (default: 6)
 * @returns {boolean} Whether the code is valid
 */
export function isValidGameCode(code, expectedLength = 6) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
  return code.length === expectedLength && validChars.test(code);
}

/**
 * Format a game code for display (e.g., "ABC123" -> "ABC-123")
 * @param {string} code - The code to format
 * @returns {string} Formatted code
 */
export function formatGameCode(code) {
  if (!code || code.length < 3) {
    return code;
  }
  const mid = Math.floor(code.length / 2);
  return `${code.substring(0, mid)}-${code.substring(mid)}`;
}
