/**
 * Unit tests for MultiplayerSync
 * Tests state synchronization, interpolation, and lag compensation
 */

import MultiplayerSync from '../utils/MultiplayerSync.js';

describe('MultiplayerSync', () => {
    let sync;

    beforeEach(() => {
        sync = new MultiplayerSync();
    });

    describe('State History Management', () => {
        test('should add state snapshot to history', () => {
            const state = { x: 100, y: 200, velocityX: 50, velocityY: 0 };
            sync.addStateSnapshot('player1', state);

            expect(sync.stateHistory.player1).toHaveLength(1);
            expect(sync.stateHistory.player1[0].x).toBe(100);
        });

        test('should maintain maximum history size', () => {
            // Add more than max history size
            for (let i = 0; i < 15; i++) {
                sync.addStateSnapshot('player1', { x: i, y: 0, velocityX: 0, velocityY: 0 });
            }

            expect(sync.stateHistory.player1.length).toBeLessThanOrEqual(sync.maxHistorySize);
        });

        test('should add timestamp if not provided', () => {
            const state = { x: 100, y: 200, velocityX: 50, velocityY: 0 };
            sync.addStateSnapshot('player1', state);

            expect(sync.stateHistory.player1[0].timestamp).toBeDefined();
            expect(typeof sync.stateHistory.player1[0].timestamp).toBe('number');
        });

        test('should clear history for specific player', () => {
            sync.addStateSnapshot('player1', { x: 100, y: 200, velocityX: 0, velocityY: 0 });
            sync.addStateSnapshot('player2', { x: 150, y: 250, velocityX: 0, velocityY: 0 });

            sync.clearHistory('player1');

            expect(sync.stateHistory.player1).toHaveLength(0);
            expect(sync.stateHistory.player2).toHaveLength(1);
        });
    });

    describe('State Interpolation', () => {
        test('should return null with insufficient history', () => {
            sync.addStateSnapshot('player1', { x: 100, y: 200, velocityX: 0, velocityY: 0 });
            
            const result = sync.getInterpolatedState('player1');
            expect(result).toBeNull();
        });

        test('should return most recent state with sufficient history', () => {
            const state1 = { x: 100, y: 200, velocityX: 0, velocityY: 0, timestamp: Date.now() - 200 };
            const state2 = { x: 150, y: 220, velocityX: 50, velocityY: 10, timestamp: Date.now() - 100 };
            
            sync.addStateSnapshot('player1', state1);
            sync.addStateSnapshot('player1', state2);

            const result = sync.getInterpolatedState('player1');
            expect(result).not.toBeNull();
            expect(result.x).toBeDefined();
        });

        test('should interpolate between two states', () => {
            const now = Date.now();
            const state1 = { x: 100, y: 200, velocityX: 0, velocityY: 0, timestamp: now - 200, scaleX: 1, scaleY: 1 };
            const state2 = { x: 200, y: 200, velocityX: 0, velocityY: 0, timestamp: now, scaleX: 1, scaleY: 1 };
            
            sync.addStateSnapshot('player1', state1);
            sync.addStateSnapshot('player1', state2);

            const result = sync.getInterpolatedState('player1');
            
            // Result should be between the two states
            expect(result.x).toBeGreaterThan(100);
            expect(result.x).toBeLessThanOrEqual(200);
        });
    });

    describe('Linear Interpolation', () => {
        test('should interpolate correctly at factor 0', () => {
            const result = sync.lerp(100, 200, 0);
            expect(result).toBe(100);
        });

        test('should interpolate correctly at factor 1', () => {
            const result = sync.lerp(100, 200, 1);
            expect(result).toBe(200);
        });

        test('should interpolate correctly at factor 0.5', () => {
            const result = sync.lerp(100, 200, 0.5);
            expect(result).toBe(150);
        });

        test('should clamp factor below 0', () => {
            const result = sync.lerp(100, 200, -0.5);
            expect(result).toBe(100);
        });

        test('should clamp factor above 1', () => {
            const result = sync.lerp(100, 200, 1.5);
            expect(result).toBe(200);
        });
    });

    describe('State Prediction', () => {
        test('should predict state with left movement', () => {
            const currentState = { x: 100, y: 200, velocityX: 0, velocityY: 0 };
            const input = { left: true, right: false, jump: false, deltaTime: 16 };

            const predicted = sync.predictState(currentState, input);

            expect(predicted.velocityX).toBe(-200);
            expect(predicted.x).toBeLessThan(currentState.x);
        });

        test('should predict state with right movement', () => {
            const currentState = { x: 100, y: 200, velocityX: 0, velocityY: 0 };
            const input = { left: false, right: true, jump: false, deltaTime: 16 };

            const predicted = sync.predictState(currentState, input);

            expect(predicted.velocityX).toBe(200);
            expect(predicted.x).toBeGreaterThan(currentState.x);
        });

        test('should apply gravity in prediction', () => {
            const currentState = { x: 100, y: 200, velocityX: 0, velocityY: 0 };
            const input = { left: false, right: false, jump: false, deltaTime: 16 };

            const predicted = sync.predictState(currentState, input);

            expect(predicted.velocityY).toBeGreaterThan(0);
            expect(predicted.y).toBeGreaterThan(currentState.y);
        });

        test('should default to 16ms deltaTime if not provided', () => {
            const currentState = { x: 100, y: 200, velocityX: 0, velocityY: 0 };
            const input = { left: false, right: false, jump: false };

            const predicted = sync.predictState(currentState, input);

            expect(predicted.y).toBeGreaterThan(currentState.y);
        });
    });

    describe('State Reconciliation', () => {
        test('should trust client prediction when difference is small', () => {
            const clientState = { x: 100, y: 200, velocityX: 50, velocityY: 0 };
            const serverState = { x: 105, y: 205, velocityX: 50, velocityY: 0 };

            const reconciled = sync.reconcileState(clientState, serverState);

            expect(reconciled.x).toBe(clientState.x);
            expect(reconciled.y).toBe(clientState.y);
        });

        test('should apply server correction when difference is large', () => {
            const clientState = { x: 100, y: 200, velocityX: 50, velocityY: 0, scaleX: 1, scaleY: 1, timestamp: Date.now() };
            const serverState = { x: 150, y: 250, velocityX: 50, velocityY: 0, scaleX: 1, scaleY: 1, timestamp: Date.now() };

            const reconciled = sync.reconcileState(clientState, serverState);

            // Should be between client and server (smoothed)
            expect(reconciled.x).toBeGreaterThan(clientState.x);
            expect(reconciled.x).toBeLessThan(serverState.x);
        });

        test('should respect custom threshold', () => {
            const clientState = { x: 100, y: 200, velocityX: 50, velocityY: 0 };
            const serverState = { x: 115, y: 200, velocityX: 50, velocityY: 0 };

            const reconciledLow = sync.reconcileState(clientState, serverState, 10);
            const reconciledHigh = sync.reconcileState(clientState, serverState, 20);

            // With lower threshold, should correct
            expect(reconciledLow.x).not.toBe(clientState.x);
            
            // With higher threshold, should trust client
            expect(reconciledHigh.x).toBe(clientState.x);
        });
    });

    describe('Network Statistics', () => {
        test('should update latency with smoothing', () => {
            sync.updateNetworkStats(100);
            expect(sync.stats.latency).toBeCloseTo(20, 0); // 0.8 * 0 + 0.2 * 100

            sync.updateNetworkStats(100);
            expect(sync.stats.latency).toBeGreaterThan(20);
        });

        test('should calculate jitter', () => {
            sync.updateNetworkStats(100);
            sync.updateNetworkStats(150);

            expect(sync.stats.jitter).toBeGreaterThan(0);
        });

        test('should update last update time', () => {
            const before = sync.stats.lastUpdateTime;
            sync.updateNetworkStats(100);
            const after = sync.stats.lastUpdateTime;

            expect(after).toBeGreaterThanOrEqual(before);
        });
    });

    describe('Connection Quality', () => {
        test('should return excellent for low latency', () => {
            sync.stats.latency = 30;
            expect(sync.getConnectionQuality()).toBe('excellent');
        });

        test('should return good for moderate latency', () => {
            sync.stats.latency = 80;
            expect(sync.getConnectionQuality()).toBe('good');
        });

        test('should return fair for higher latency', () => {
            sync.stats.latency = 150;
            expect(sync.getConnectionQuality()).toBe('fair');
        });

        test('should return poor for high latency', () => {
            sync.stats.latency = 250;
            expect(sync.getConnectionQuality()).toBe('poor');
        });
    });

    describe('State Serialization', () => {
        test('should serialize player state correctly', () => {
            const player = {
                x: 123.456789,
                y: 234.567890,
                body: {
                    velocity: { x: 50.123, y: -100.456 }
                },
                scaleX: 1.3,
                scaleY: 1.3
            };

            const serialized = sync.serializeState(player);

            expect(serialized.x).toBe(123.46);
            expect(serialized.y).toBe(234.57);
            expect(serialized.velocityX).toBe(50.12);
            expect(serialized.velocityY).toBe(-100.46);
            expect(serialized.scaleX).toBe(1.3);
            expect(serialized.timestamp).toBeDefined();
        });
    });

    describe('State Application', () => {
        test('should apply state with interpolation', () => {
            const mockSetVelocity = (vx, vy) => {
                // Mock function
            };
            const player = { x: 100, y: 200, scaleX: 1, scaleY: 1, body: { setVelocity: mockSetVelocity } };
            const state = { x: 150, y: 250, velocityX: 50, velocityY: 0, scaleX: 1.3, scaleY: 1.3 };

            sync.applyState(player, state, true);

            expect(player.x).toBeGreaterThan(100);
            expect(player.x).toBeLessThan(150);
            expect(player.scaleX).toBe(1.3);
        });

        test('should apply state without interpolation', () => {
            const mockSetVelocity = (vx, vy) => {
                // Mock function
            };
            const player = { x: 100, y: 200, scaleX: 1, scaleY: 1, body: { setVelocity: mockSetVelocity } };
            const state = { x: 150, y: 250, velocityX: 50, velocityY: 0, scaleX: 1.3, scaleY: 1.3 };

            sync.applyState(player, state, false);

            expect(player.x).toBe(150);
            expect(player.y).toBe(250);
        });
    });

    describe('Reset', () => {
        test('should clear all state on reset', () => {
            sync.addStateSnapshot('player1', { x: 100, y: 200, velocityX: 0, velocityY: 0 });
            sync.updateNetworkStats(100);

            sync.reset();

            expect(sync.stateHistory.player1).toHaveLength(0);
            expect(sync.stateHistory.player2).toHaveLength(0);
            expect(sync.pendingInputs).toHaveLength(0);
            expect(sync.stats.latency).toBe(0);
        });
    });
});
