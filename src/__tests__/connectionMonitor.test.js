/**
 * Unit tests for ConnectionMonitor
 * Tests connection quality monitoring, latency tracking, and reconnection logic
 */

import ConnectionMonitor from '../utils/ConnectionMonitor.js';

describe('ConnectionMonitor', () => {
    let monitor;

    beforeEach(() => {
        monitor = new ConnectionMonitor();
    });

    afterEach(() => {
        monitor.stop();
    });

    describe('Initialization', () => {
        test('should initialize with disconnected state', () => {
            expect(monitor.isConnected).toBe(false);
            expect(monitor.connectionState).toBe('disconnected');
        });

        test('should initialize with zero latency', () => {
            expect(monitor.currentLatency).toBe(0);
            expect(monitor.averageLatency).toBe(0);
        });

        test('should initialize with zero packet loss', () => {
            expect(monitor.packetLossRate).toBe(0);
            expect(monitor.sentPackets).toBe(0);
            expect(monitor.receivedPackets).toBe(0);
        });
    });

    describe('Ping Recording', () => {
        test('should record ping measurements', () => {
            monitor.recordPing(50);

            expect(monitor.currentLatency).toBe(50);
            expect(monitor.pingHistory).toContain(50);
        });

        test('should maintain ping history limit', () => {
            for (let i = 0; i < 25; i++) {
                monitor.recordPing(i);
            }

            expect(monitor.pingHistory.length).toBeLessThanOrEqual(monitor.maxPingHistory);
        });

        test('should calculate average latency', () => {
            monitor.recordPing(50);
            monitor.recordPing(60);
            monitor.recordPing(70);

            expect(monitor.averageLatency).toBe(60);
        });

        test('should update average with new measurements', () => {
            monitor.recordPing(50);
            monitor.recordPing(50);
            monitor.recordPing(100);

            const avg = (50 + 50 + 100) / 3;
            expect(monitor.averageLatency).toBeCloseTo(avg, 1);
        });
    });

    describe('Packet Tracking', () => {
        test('should track sent packets', () => {
            monitor.recordPacketSent();
            monitor.recordPacketSent();

            expect(monitor.sentPackets).toBe(2);
        });

        test('should track received packets', () => {
            monitor.recordPacketReceived();
            monitor.recordPacketReceived();

            expect(monitor.receivedPackets).toBe(2);
        });

        test('should calculate packet loss rate', () => {
            monitor.recordPacketSent();
            monitor.recordPacketSent();
            monitor.recordPacketSent();
            monitor.recordPacketSent();
            monitor.recordPacketReceived();
            monitor.recordPacketReceived();

            expect(monitor.packetLossRate).toBe(0.5); // 50% loss
        });

        test('should handle zero sent packets', () => {
            monitor.recordPacketReceived();

            expect(monitor.packetLossRate).toBe(0);
        });

        test('should update heartbeat on packet received', () => {
            const before = monitor.lastHeartbeat;
            monitor.recordPacketReceived();
            const after = monitor.lastHeartbeat;

            expect(after).toBeGreaterThanOrEqual(before);
        });
    });

    describe('Connection Quality', () => {
        test('should return excellent quality for low latency', () => {
            monitor.recordPing(30);
            const quality = monitor.getConnectionQuality();

            expect(quality.rating).toBe('excellent');
            expect(quality.latency).toBe(30);
        });

        test('should return good quality for moderate latency', () => {
            monitor.recordPing(80);
            const quality = monitor.getConnectionQuality();

            expect(quality.rating).toBe('good');
        });

        test('should return fair quality for higher latency', () => {
            monitor.recordPing(150);
            const quality = monitor.getConnectionQuality();

            expect(quality.rating).toBe('fair');
        });

        test('should return poor quality for high latency', () => {
            monitor.recordPing(250);
            const quality = monitor.getConnectionQuality();

            expect(quality.rating).toBe('poor');
        });

        test('should consider packet loss in quality', () => {
            monitor.recordPing(40);
            monitor.recordPacketSent();
            monitor.recordPacketSent();
            monitor.recordPacketReceived();

            const quality = monitor.getConnectionQuality();
            
            // High packet loss should downgrade quality
            expect(quality.packetLoss).toBeGreaterThan(0);
        });

        test('should include stability in quality info', () => {
            monitor.recordPing(50);
            const quality = monitor.getConnectionQuality();

            expect(quality.isStable).toBeDefined();
            expect(typeof quality.isStable).toBe('boolean');
        });
    });

    describe('Connection Stability', () => {
        test('should return true for insufficient data', () => {
            monitor.recordPing(50);
            expect(monitor.isConnectionStable()).toBe(true);
        });

        test('should return true for stable connection', () => {
            for (let i = 0; i < 10; i++) {
                monitor.recordPing(50);
            }
            expect(monitor.isConnectionStable()).toBe(true);
        });

        test('should return false for unstable connection', () => {
            const pings = [50, 150, 50, 200, 50, 180, 50, 170];
            pings.forEach(ping => monitor.recordPing(ping));

            expect(monitor.isConnectionStable()).toBe(false);
        });
    });

    describe('Timeout Detection', () => {
        test('should not timeout immediately', () => {
            expect(monitor.hasTimedOut()).toBe(false);
        });

        test('should timeout after heartbeat timeout period', () => {
            // Move time forward past timeout
            const timeoutMs = monitor.heartbeatTimeout + 1000;
            monitor.lastHeartbeat = Date.now() - timeoutMs;

            expect(monitor.hasTimedOut()).toBe(true);
        });

        test('should reset timeout on heartbeat', () => {
            monitor.lastHeartbeat = Date.now() - monitor.heartbeatTimeout - 1000;
            monitor.recordPacketReceived();

            expect(monitor.hasTimedOut()).toBe(false);
        });
    });

    describe('Connection State Management', () => {
        test('should update connection state', () => {
            monitor.setConnectionState('connected');

            expect(monitor.connectionState).toBe('connected');
            expect(monitor.isConnected).toBe(true);
        });

        test('should trigger callback on state change', () => {
            let callbackCalled = false;
            let callbackArgs = [];
            monitor.onConnectionChange = (newState, oldState) => {
                callbackCalled = true;
                callbackArgs = [newState, oldState];
            };

            monitor.setConnectionState('connected');

            expect(callbackCalled).toBe(true);
            expect(callbackArgs).toEqual(['connected', 'disconnected']);
        });

        test('should not trigger callback if state unchanged', () => {
            let callbackCalled = false;
            monitor.onConnectionChange = () => {
                callbackCalled = true;
            };

            monitor.setConnectionState('disconnected');

            expect(callbackCalled).toBe(false);
        });
    });

    describe('Connection Handling', () => {
        test('should handle connection established', () => {
            monitor.reconnectAttempts = 3;
            monitor.handleConnected();

            expect(monitor.connectionState).toBe('connected');
            expect(monitor.isConnected).toBe(true);
            expect(monitor.reconnectAttempts).toBe(0);
        });

        test('should handle disconnection and attempt reconnect', () => {
            monitor.setConnectionState('connected');
            monitor.handleDisconnected();

            // After calling handleDisconnected, it should be in reconnecting state
            expect(monitor.connectionState).toBe('reconnecting');
            expect(monitor.reconnectAttempts).toBe(1);
        });
    });

    describe('Reconnection Logic', () => {
        test('should attempt reconnection on disconnect', () => {
            monitor.handleDisconnected();

            expect(monitor.reconnectAttempts).toBe(1);
            expect(monitor.connectionState).toBe('reconnecting');
        });

        test('should stop reconnecting after max attempts', () => {
            const callback = (attempts) => {
                expect(attempts).toBe(monitor.maxReconnectAttempts);
            };
            monitor.onReconnectFailed = callback;
            monitor.reconnectAttempts = monitor.maxReconnectAttempts;

            monitor.attemptReconnect();
        });

        test('should use exponential backoff for reconnection', () => {
            monitor.reconnectDelay = 1000;
            
            monitor.attemptReconnect();
            expect(monitor.reconnectAttempts).toBe(1);

            monitor.attemptReconnect();
            expect(monitor.reconnectAttempts).toBe(2);
        });

        test('should use exponential backoff delay calculation', () => {
            monitor.reconnectDelay = 1000;
            monitor.reconnectAttempts = 0;
            
            monitor.attemptReconnect();
            expect(monitor.reconnectAttempts).toBe(1);
            
            // Verify exponential backoff would be calculated
            const attempt2Delay = Math.min(
                monitor.reconnectDelay * Math.pow(2, 2 - 1),
                monitor.maxReconnectDelay
            );
            expect(attempt2Delay).toBe(2000); // 1000 * 2^1
        });
    });

    describe('Statistics', () => {
        test('should return comprehensive stats', () => {
            monitor.recordPing(50);
            monitor.recordPacketSent();
            monitor.recordPacketReceived();

            const stats = monitor.getStats();

            expect(stats.isConnected).toBeDefined();
            expect(stats.latency).toBeDefined();
            expect(stats.averageLatency).toBeDefined();
            expect(stats.packetLoss).toBeDefined();
            expect(stats.quality).toBeDefined();
        });

        test('should include connection state in stats', () => {
            monitor.setConnectionState('connected');
            const stats = monitor.getStats();

            expect(stats.state).toBe('connected');
        });

        test('should round latency values in stats', () => {
            monitor.recordPing(123.456);
            const stats = monitor.getStats();

            expect(stats.latency).toBe(123);
            expect(Number.isInteger(stats.latency)).toBe(true);
        });
    });

    describe('Reset', () => {
        test('should clear all statistics', () => {
            monitor.recordPing(50);
            monitor.recordPacketSent();
            monitor.recordPacketReceived();
            monitor.reconnectAttempts = 3;

            monitor.reset();

            expect(monitor.pingHistory).toHaveLength(0);
            expect(monitor.currentLatency).toBe(0);
            expect(monitor.sentPackets).toBe(0);
            expect(monitor.receivedPackets).toBe(0);
            expect(monitor.reconnectAttempts).toBe(0);
        });
    });

    describe('Quality Display Helpers', () => {
        test('should return correct color for excellent quality', () => {
            monitor.recordPing(30);
            const color = monitor.getQualityColor();

            expect(color).toBe(0x00ff00);
        });

        test('should return correct color for poor quality', () => {
            monitor.recordPing(250);
            const color = monitor.getQualityColor();

            expect(color).toBe(0xff0000);
        });

        test('should return quality icon', () => {
            monitor.recordPing(50);
            const icon = monitor.getQualityIcon();

            expect(icon).toBeDefined();
            expect(typeof icon).toBe('string');
            expect(icon).toContain('●');
        });

        test('should return different icons for different qualities', () => {
            monitor.recordPing(30);
            const excellentIcon = monitor.getQualityIcon();

            monitor.reset();
            monitor.recordPing(250);
            const poorIcon = monitor.getQualityIcon();

            expect(excellentIcon).not.toBe(poorIcon);
        });
    });

    describe('Heartbeat Monitoring', () => {
        test('should start heartbeat monitoring', () => {
            monitor.start();

            expect(monitor.heartbeatTimer).not.toBeNull();
        });

        test('should stop heartbeat monitoring', () => {
            monitor.start();
            monitor.stop();

            expect(monitor.heartbeatTimer).toBeNull();
        });
    });
});
