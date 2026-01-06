/**
 * ConnectionMonitor - Monitors network connection quality and handles reconnection
 * Tracks latency, packet loss, and connection stability for multiplayer games
 */

// Connection stability threshold - jitter as percentage of average latency
const JITTER_STABILITY_THRESHOLD = 0.3;

export default class ConnectionMonitor {
    constructor() {
        // Connection state
        this.isConnected = false;
        this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'reconnecting'
        
        // Ping/latency tracking
        this.pingHistory = [];
        this.maxPingHistory = 20;
        this.currentLatency = 0;
        this.averageLatency = 0;
        
        // Packet loss tracking
        this.sentPackets = 0;
        this.receivedPackets = 0;
        this.packetLossRate = 0;
        
        // Heartbeat/keepalive
        this.lastHeartbeat = Date.now();
        this.heartbeatInterval = 5000; // Send heartbeat every 5 seconds
        this.heartbeatTimeout = 15000; // Consider disconnected after 15 seconds without response
        
        // Reconnection settings
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000; // Start with 2 second delay
        this.maxReconnectDelay = 30000; // Max 30 second delay
        
        // Connection quality thresholds
        this.qualityThresholds = {
            excellent: { latency: 50, packetLoss: 0.01 },
            good: { latency: 100, packetLoss: 0.05 },
            fair: { latency: 200, packetLoss: 0.15 },
            poor: { latency: Infinity, packetLoss: 1.0 }
        };
        
        // Event callbacks
        this.onConnectionChange = null;
        this.onQualityChange = null;
        this.onReconnectFailed = null;
        
        // Timers
        this.heartbeatTimer = null;
        this.reconnectTimer = null;
    }

    /**
     * Initialize connection monitoring
     */
    start() {
        this.startHeartbeat();
    }

    /**
     * Stop connection monitoring
     */
    stop() {
        this.stopHeartbeat();
        this.clearReconnectTimer();
    }

    /**
     * Record a ping/latency measurement
     * @param {number} latency - Round-trip time in milliseconds
     */
    recordPing(latency) {
        this.currentLatency = latency;
        this.pingHistory.push(latency);
        
        // Maintain history size
        if (this.pingHistory.length > this.maxPingHistory) {
            this.pingHistory.shift();
        }
        
        // Calculate average
        this.averageLatency = this.pingHistory.reduce((a, b) => a + b, 0) / this.pingHistory.length;
    }

    /**
     * Record packet transmission
     */
    recordPacketSent() {
        this.sentPackets++;
    }

    /**
     * Record packet receipt
     */
    recordPacketReceived() {
        this.receivedPackets++;
        this.lastHeartbeat = Date.now();
        
        // Update packet loss rate (ensure received never exceeds sent)
        if (this.sentPackets > 0) {
            const effectiveReceived = Math.min(this.receivedPackets, this.sentPackets);
            this.packetLossRate = 1 - (effectiveReceived / this.sentPackets);
        }
    }

    /**
     * Get current connection quality
     * @returns {Object} Quality info with rating and metrics
     */
    getConnectionQuality() {
        const latency = this.averageLatency || this.currentLatency;
        const packetLoss = this.packetLossRate;
        
        let rating = 'poor';
        if (latency <= this.qualityThresholds.excellent.latency && 
            packetLoss <= this.qualityThresholds.excellent.packetLoss) {
            rating = 'excellent';
        } else if (latency <= this.qualityThresholds.good.latency && 
                   packetLoss <= this.qualityThresholds.good.packetLoss) {
            rating = 'good';
        } else if (latency <= this.qualityThresholds.fair.latency && 
                   packetLoss <= this.qualityThresholds.fair.packetLoss) {
            rating = 'fair';
        }
        
        return {
            rating,
            latency: Math.round(latency),
            packetLoss: Math.round(packetLoss * 100),
            isStable: this.isConnectionStable()
        };
    }

    /**
     * Check if connection is stable
     * @returns {boolean} True if connection is stable
     */
    isConnectionStable() {
        if (this.pingHistory.length < 5) {
            return true; // Not enough data yet
        }
        
        // Calculate jitter (standard deviation of ping)
        const avg = this.averageLatency;
        const variance = this.pingHistory.reduce((sum, ping) => {
            return sum + Math.pow(ping - avg, 2);
        }, 0) / this.pingHistory.length;
        const jitter = Math.sqrt(variance);
        
        // Connection is unstable if jitter is too high relative to average (using constant)
        return jitter < avg * JITTER_STABILITY_THRESHOLD;
    }

    /**
     * Check if connection is timed out
     * @returns {boolean} True if connection has timed out
     */
    hasTimedOut() {
        const timeSinceHeartbeat = Date.now() - this.lastHeartbeat;
        return timeSinceHeartbeat > this.heartbeatTimeout;
    }

    /**
     * Update connection state
     * @param {string} state - New connection state
     */
    setConnectionState(state) {
        const oldState = this.connectionState;
        this.connectionState = state;
        
        this.isConnected = state === 'connected';
        
        // Trigger callback if state changed
        if (oldState !== state && this.onConnectionChange) {
            this.onConnectionChange(state, oldState);
        }
    }

    /**
     * Handle connection established
     */
    handleConnected() {
        this.setConnectionState('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 2000; // Reset reconnect delay
        this.lastHeartbeat = Date.now();
    }

    /**
     * Handle connection lost
     */
    handleDisconnected() {
        this.setConnectionState('disconnected');
        this.stopHeartbeat();
        
        // Attempt to reconnect
        this.attemptReconnect();
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (this.onReconnectFailed) {
                this.onReconnectFailed(this.reconnectAttempts);
            }
            return;
        }
        
        this.reconnectAttempts++;
        this.setConnectionState('reconnecting');
        
        // Clear any existing reconnection timer before setting a new one
        this.clearReconnectTimer();
        
        // Calculate exponential backoff delay
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );
        
        this.reconnectTimer = setTimeout(() => {
            // Trigger reconnect attempt (will be handled by external code)
            if (this.onConnectionChange) {
                this.onConnectionChange('reconnecting', 'disconnected');
            }
        }, delay);
    }

    /**
     * Clear reconnect timer
     */
    clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * Start heartbeat monitoring
     */
    startHeartbeat() {
        this.stopHeartbeat(); // Clear any existing timer
        
        this.heartbeatTimer = setInterval(() => {
            if (this.hasTimedOut() && this.isConnected) {
                this.handleDisconnected();
            }
        }, this.heartbeatInterval);
    }

    /**
     * Stop heartbeat monitoring
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * Get connection statistics
     * @returns {Object} Connection stats
     */
    getStats() {
        return {
            isConnected: this.isConnected,
            state: this.connectionState,
            latency: Math.round(this.currentLatency),
            averageLatency: Math.round(this.averageLatency),
            packetLoss: Math.round(this.packetLossRate * 100) / 100,
            sentPackets: this.sentPackets,
            receivedPackets: this.receivedPackets,
            reconnectAttempts: this.reconnectAttempts,
            quality: this.getConnectionQuality()
        };
    }

    /**
     * Reset all statistics
     */
    reset() {
        this.pingHistory = [];
        this.currentLatency = 0;
        this.averageLatency = 0;
        this.sentPackets = 0;
        this.receivedPackets = 0;
        this.packetLossRate = 0;
        this.reconnectAttempts = 0;
    }

    /**
     * Get color code for connection quality display
     * @returns {number} Hex color code
     */
    getQualityColor() {
        const quality = this.getConnectionQuality().rating;
        
        switch (quality) {
            case 'excellent': return 0x00ff00; // Green
            case 'good': return 0x88ff00; // Light green
            case 'fair': return 0xffaa00; // Orange
            case 'poor': return 0xff0000; // Red
            default: return 0x888888; // Gray
        }
    }

    /**
     * Get icon/symbol for connection quality
     * @returns {string} Unicode symbol
     */
    getQualityIcon() {
        const quality = this.getConnectionQuality().rating;
        
        switch (quality) {
            case 'excellent': return '●●●●'; // Four bars
            case 'good': return '●●●○'; // Three bars
            case 'fair': return '●●○○'; // Two bars
            case 'poor': return '●○○○'; // One bar
            default: return '○○○○'; // No bars
        }
    }
}
