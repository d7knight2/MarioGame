/**
 * CheckpointManager
 * 
 * Manages checkpoint state for the game, allowing players to restart from
 * the last checkpoint rather than the start of the level.
 * Stores player position, score, power-ups, and game stats.
 */

export default class CheckpointManager {
    constructor() {
        this.checkpoints = {};
    }

    /**
     * Save checkpoint state for a level
     * @param {number} level - Current level number
     * @param {object} state - State to save
     * @param {number} state.x - Player x position
     * @param {number} state.y - Player y position
     * @param {number} state.score - Current score
     * @param {boolean} state.isPoweredUp - Player 1 powered up state
     * @param {boolean} state.hasFirePower - Player 1 fire power state
     * @param {boolean} state.isPoweredUp2 - Player 2 powered up state (optional)
     * @param {boolean} state.hasFirePower2 - Player 2 fire power state (optional)
     * @param {number} state.coinsCollected - Total coins collected
     * @param {number} state.enemiesDefeated - Total enemies defeated
     */
    saveCheckpoint(level, state) {
        this.checkpoints[level] = {
            x: state.x,
            y: state.y,
            score: state.score,
            isPoweredUp: state.isPoweredUp,
            hasFirePower: state.hasFirePower,
            isPoweredUp2: state.isPoweredUp2 || false,
            hasFirePower2: state.hasFirePower2 || false,
            coinsCollected: state.coinsCollected,
            enemiesDefeated: state.enemiesDefeated,
            timestamp: Date.now()
        };
    }

    /**
     * Get checkpoint state for a level
     * @param {number} level - Level number
     * @returns {object|null} Checkpoint state or null if no checkpoint exists
     */
    getCheckpoint(level) {
        return this.checkpoints[level] || null;
    }

    /**
     * Check if a checkpoint exists for a level
     * @param {number} level - Level number
     * @returns {boolean} True if checkpoint exists
     */
    hasCheckpoint(level) {
        return !!this.checkpoints[level];
    }

    /**
     * Clear checkpoint for a specific level
     * @param {number} level - Level number
     */
    clearCheckpoint(level) {
        delete this.checkpoints[level];
    }

    /**
     * Clear all checkpoints
     */
    clearAllCheckpoints() {
        this.checkpoints = {};
    }

    /**
     * Get all checkpoints (for debugging/testing)
     * @returns {object} All checkpoints
     */
    getAllCheckpoints() {
        // Return deep copy to prevent external modification
        return JSON.parse(JSON.stringify(this.checkpoints));
    }
}
