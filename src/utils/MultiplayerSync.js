/**
 * MultiplayerSync - Handles player state synchronization for multiplayer gameplay
 * Provides state interpolation, lag compensation, and network update handling
 */

// Constants for prediction and interpolation
const MOVE_SPEED = 200;
const GRAVITY = 600;
const JUMP_VELOCITY = -400;
const FRICTION = 800;
const RECONCILIATION_SMOOTHING = 0.3;
const POSITION_INTERPOLATION_SMOOTHING = 0.3;
const LATENCY_SMOOTHING_WEIGHT = 0.2; // Exponential moving average: new weight
const JITTER_SMOOTHING_WEIGHT = 0.2; // Exponential moving average: new weight

export default class MultiplayerSync {
    constructor() {
        // Player state history for interpolation (stores last N states)
        this.stateHistory = {
            player1: [],
            player2: []
        };
        
        // Maximum history size (for interpolation buffer)
        this.maxHistorySize = 10;
        
        // Interpolation delay (in ms) - buffer for smooth playback
        this.interpolationDelay = 100;
        
        // Network statistics
        this.stats = {
            latency: 0,
            jitter: 0,
            packetLoss: 0,
            lastUpdateTime: Date.now()
        };
    }

    /**
     * Add a player state snapshot to history
     * @param {string} player - 'player1' or 'player2'
     * @param {Object} state - Player state object {x, y, velocityX, velocityY, timestamp}
     */
    addStateSnapshot(player, state) {
        if (!this.stateHistory[player]) {
            this.stateHistory[player] = [];
        }
        
        // Add timestamp if not provided
        if (!state.timestamp) {
            state.timestamp = Date.now();
        }
        
        this.stateHistory[player].push(state);
        
        // Keep history size manageable
        if (this.stateHistory[player].length > this.maxHistorySize) {
            this.stateHistory[player].shift();
        }
    }

    /**
     * Get interpolated state for a player at current render time
     * @param {string} player - 'player1' or 'player2'
     * @returns {Object|null} Interpolated state or null if insufficient data
     */
    getInterpolatedState(player) {
        const history = this.stateHistory[player];
        
        if (!history || history.length < 2) {
            return null; // Need at least 2 states to interpolate
        }
        
        // Calculate render time (current time minus interpolation delay)
        const renderTime = Date.now() - this.interpolationDelay;
        
        // Find the two states to interpolate between
        let olderState = null;
        let newerState = null;
        
        for (let i = 0; i < history.length - 1; i++) {
            if (history[i].timestamp <= renderTime && history[i + 1].timestamp >= renderTime) {
                olderState = history[i];
                newerState = history[i + 1];
                break;
            }
        }
        
        // If we can't find suitable states, use the most recent
        if (!olderState || !newerState) {
            return history[history.length - 1];
        }
        
        // Calculate interpolation factor (0 to 1)
        const timeDiff = newerState.timestamp - olderState.timestamp;
        const factor = timeDiff > 0 ? (renderTime - olderState.timestamp) / timeDiff : 0;
        
        // Interpolate position and velocity
        return {
            x: this.lerp(olderState.x, newerState.x, factor),
            y: this.lerp(olderState.y, newerState.y, factor),
            velocityX: this.lerp(olderState.velocityX, newerState.velocityX, factor),
            velocityY: this.lerp(olderState.velocityY, newerState.velocityY, factor),
            scaleX: olderState.scaleX, // Don't interpolate scale
            scaleY: olderState.scaleY,
            timestamp: renderTime
        };
    }

    /**
     * Linear interpolation helper
     */
    lerp(start, end, factor) {
        return start + (end - start) * Math.max(0, Math.min(1, factor));
    }

    /**
     * Predict future player position based on current input
     * Client-side prediction for local player
     * @param {Object} currentState - Current player state
     * @param {Object} input - Input data {left, right, jump, deltaTime, isOnGround}
     * @returns {Object} Predicted state
     */
    predictState(currentState, input) {
        const predicted = { ...currentState };
        const deltaTime = input.deltaTime || 16; // Default to ~60fps
        const deltaSeconds = deltaTime / 1000;
        
        // Apply movement input with friction
        if (input.left) {
            predicted.velocityX = -MOVE_SPEED;
        } else if (input.right) {
            predicted.velocityX = MOVE_SPEED;
        } else {
            // Apply friction to gradually reduce horizontal velocity
            if (predicted.velocityX !== 0) {
                const sign = Math.sign(predicted.velocityX);
                const decel = FRICTION * deltaSeconds;
                const newSpeed = Math.abs(predicted.velocityX) - decel;
                predicted.velocityX = newSpeed > 0 ? sign * newSpeed : 0;
            }
        }
        
        // Handle jumping
        if (input.jump && input.isOnGround) {
            predicted.velocityY = JUMP_VELOCITY;
        }
        
        // Apply gravity
        predicted.velocityY += GRAVITY * deltaSeconds;
        
        // Update position
        predicted.x += predicted.velocityX * deltaSeconds;
        predicted.y += predicted.velocityY * deltaSeconds;
        
        return predicted;
    }

    /**
     * Reconcile client prediction with server state
     * Applies server correction if difference is significant
     * @param {Object} clientState - Client's predicted state
     * @param {Object} serverState - Authoritative server state
     * @param {number} threshold - Distance threshold for correction (pixels)
     * @returns {Object} Corrected state
     */
    reconcileState(clientState, serverState, threshold = 10) {
        const distance = Math.sqrt(
            Math.pow(clientState.x - serverState.x, 2) +
            Math.pow(clientState.y - serverState.y, 2)
        );
        
        // If difference is small, trust client prediction
        if (distance < threshold) {
            return clientState;
        }
        
        // Apply server correction with smoothing
        return {
            x: this.lerp(clientState.x, serverState.x, RECONCILIATION_SMOOTHING),
            y: this.lerp(clientState.y, serverState.y, RECONCILIATION_SMOOTHING),
            velocityX: serverState.velocityX,
            velocityY: serverState.velocityY,
            scaleX: serverState.scaleX,
            scaleY: serverState.scaleY,
            timestamp: serverState.timestamp
        };
    }

    /**
     * Update network statistics
     * @param {number} latency - Round-trip time in ms
     */
    updateNetworkStats(latency) {
        const currentTime = Date.now();
        
        // Update latency with exponential moving average
        this.stats.latency = this.stats.latency * (1 - LATENCY_SMOOTHING_WEIGHT) + latency * LATENCY_SMOOTHING_WEIGHT;
        
        // Calculate jitter (variance in latency) with exponential moving average
        const latencyDiff = Math.abs(latency - this.stats.latency);
        this.stats.jitter = this.stats.jitter * (1 - JITTER_SMOOTHING_WEIGHT) + latencyDiff * JITTER_SMOOTHING_WEIGHT;
        
        this.stats.lastUpdateTime = currentTime;
    }

    /**
     * Get connection quality rating
     * @returns {string} 'excellent', 'good', 'fair', or 'poor'
     */
    getConnectionQuality() {
        const latency = this.stats.latency;
        
        if (latency < 50) return 'excellent';
        if (latency < 100) return 'good';
        if (latency < 200) return 'fair';
        return 'poor';
    }

    /**
     * Clear state history for a player
     * @param {string} player - 'player1' or 'player2'
     */
    clearHistory(player) {
        if (this.stateHistory[player]) {
            this.stateHistory[player] = [];
        }
    }

    /**
     * Reset all synchronization state
     */
    reset() {
        this.stateHistory = {
            player1: [],
            player2: []
        };
        this.pendingInputs = [];
        this.stats = {
            latency: 0,
            jitter: 0,
            packetLoss: 0,
            lastUpdateTime: Date.now()
        };
    }

    /**
     * Serialize player state for network transmission
     * @param {Object} player - Phaser player object
     * @returns {Object} Serialized state
     */
    serializeState(player) {
        return {
            x: Math.round(player.x * 100) / 100, // Round to 2 decimals
            y: Math.round(player.y * 100) / 100,
            velocityX: Math.round(player.body.velocity.x * 100) / 100,
            velocityY: Math.round(player.body.velocity.y * 100) / 100,
            scaleX: player.scaleX,
            scaleY: player.scaleY,
            timestamp: Date.now()
        };
    }

    /**
     * Apply received state to player object
     * @param {Object} player - Phaser player object
     * @param {Object} state - State to apply
     * @param {boolean} useInterpolation - Whether to use interpolated state
     */
    applyState(player, state, useInterpolation = true) {
        if (useInterpolation) {
            // Smooth transition to new state using defined constant
            player.x = this.lerp(player.x, state.x, POSITION_INTERPOLATION_SMOOTHING);
            player.y = this.lerp(player.y, state.y, POSITION_INTERPOLATION_SMOOTHING);
        } else {
            // Direct application (no smoothing)
            player.x = state.x;
            player.y = state.y;
        }
        
        if (state.scaleX !== undefined) player.scaleX = state.scaleX;
        if (state.scaleY !== undefined) player.scaleY = state.scaleY;
        
        // Update velocities if body exists
        if (player.body) {
            player.body.setVelocity(state.velocityX, state.velocityY);
        }
    }
}
