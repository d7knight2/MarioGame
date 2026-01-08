/**
 * Unit tests for CheckpointManager
 * Tests checkpoint state management functionality
 */

import CheckpointManager from '../utils/CheckpointManager.js';

describe('CheckpointManager', () => {
    let checkpointManager;

    beforeEach(() => {
        checkpointManager = new CheckpointManager();
    });

    describe('saveCheckpoint', () => {
        test('should save checkpoint state for a level', () => {
            const state = {
                x: 500,
                y: 400,
                score: 150,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 5,
                enemiesDefeated: 2
            };

            checkpointManager.saveCheckpoint(1, state);
            const checkpoint = checkpointManager.getCheckpoint(1);

            expect(checkpoint).toBeDefined();
            expect(checkpoint.x).toBe(500);
            expect(checkpoint.y).toBe(400);
            expect(checkpoint.score).toBe(150);
            expect(checkpoint.isPoweredUp).toBe(true);
            expect(checkpoint.hasFirePower).toBe(false);
            expect(checkpoint.coinsCollected).toBe(5);
            expect(checkpoint.enemiesDefeated).toBe(2);
        });

        test('should save checkpoint with player 2 state', () => {
            const state = {
                x: 600,
                y: 350,
                score: 200,
                isPoweredUp: true,
                hasFirePower: true,
                isPoweredUp2: false,
                hasFirePower2: true,
                coinsCollected: 8,
                enemiesDefeated: 4
            };

            checkpointManager.saveCheckpoint(2, state);
            const checkpoint = checkpointManager.getCheckpoint(2);

            expect(checkpoint.isPoweredUp2).toBe(false);
            expect(checkpoint.hasFirePower2).toBe(true);
        });

        test('should include timestamp in saved checkpoint', () => {
            const state = {
                x: 300,
                y: 450,
                score: 50,
                isPoweredUp: false,
                hasFirePower: false,
                coinsCollected: 2,
                enemiesDefeated: 1
            };

            const beforeTime = Date.now();
            checkpointManager.saveCheckpoint(1, state);
            const afterTime = Date.now();

            const checkpoint = checkpointManager.getCheckpoint(1);
            expect(checkpoint.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(checkpoint.timestamp).toBeLessThanOrEqual(afterTime);
        });

        test('should overwrite existing checkpoint for same level', () => {
            const state1 = {
                x: 100,
                y: 400,
                score: 50,
                isPoweredUp: false,
                hasFirePower: false,
                coinsCollected: 1,
                enemiesDefeated: 0
            };

            const state2 = {
                x: 500,
                y: 350,
                score: 150,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 5,
                enemiesDefeated: 3
            };

            checkpointManager.saveCheckpoint(1, state1);
            checkpointManager.saveCheckpoint(1, state2);

            const checkpoint = checkpointManager.getCheckpoint(1);
            expect(checkpoint.x).toBe(500);
            expect(checkpoint.score).toBe(150);
        });
    });

    describe('getCheckpoint', () => {
        test('should return null when no checkpoint exists', () => {
            const checkpoint = checkpointManager.getCheckpoint(1);
            expect(checkpoint).toBeNull();
        });

        test('should return saved checkpoint state', () => {
            const state = {
                x: 700,
                y: 300,
                score: 250,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 10,
                enemiesDefeated: 5
            };

            checkpointManager.saveCheckpoint(2, state);
            const checkpoint = checkpointManager.getCheckpoint(2);

            expect(checkpoint).not.toBeNull();
            expect(checkpoint.x).toBe(700);
            expect(checkpoint.score).toBe(250);
        });

        test('should handle multiple levels independently', () => {
            const state1 = {
                x: 300,
                y: 400,
                score: 100,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 3,
                enemiesDefeated: 1
            };

            const state2 = {
                x: 800,
                y: 350,
                score: 300,
                isPoweredUp: false,
                hasFirePower: true,
                coinsCollected: 12,
                enemiesDefeated: 7
            };

            checkpointManager.saveCheckpoint(1, state1);
            checkpointManager.saveCheckpoint(2, state2);

            const checkpoint1 = checkpointManager.getCheckpoint(1);
            const checkpoint2 = checkpointManager.getCheckpoint(2);

            expect(checkpoint1.x).toBe(300);
            expect(checkpoint2.x).toBe(800);
            expect(checkpoint1.score).toBe(100);
            expect(checkpoint2.score).toBe(300);
        });
    });

    describe('hasCheckpoint', () => {
        test('should return false when no checkpoint exists', () => {
            expect(checkpointManager.hasCheckpoint(1)).toBe(false);
        });

        test('should return true when checkpoint exists', () => {
            const state = {
                x: 400,
                y: 350,
                score: 120,
                isPoweredUp: false,
                hasFirePower: false,
                coinsCollected: 4,
                enemiesDefeated: 2
            };

            checkpointManager.saveCheckpoint(1, state);
            expect(checkpointManager.hasCheckpoint(1)).toBe(true);
        });

        test('should handle multiple levels correctly', () => {
            const state = {
                x: 500,
                y: 300,
                score: 200,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 8,
                enemiesDefeated: 4
            };

            checkpointManager.saveCheckpoint(2, state);
            expect(checkpointManager.hasCheckpoint(1)).toBe(false);
            expect(checkpointManager.hasCheckpoint(2)).toBe(true);
            expect(checkpointManager.hasCheckpoint(3)).toBe(false);
        });
    });

    describe('clearCheckpoint', () => {
        test('should clear checkpoint for specific level', () => {
            const state = {
                x: 600,
                y: 400,
                score: 180,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 6,
                enemiesDefeated: 3
            };

            checkpointManager.saveCheckpoint(1, state);
            expect(checkpointManager.hasCheckpoint(1)).toBe(true);

            checkpointManager.clearCheckpoint(1);
            expect(checkpointManager.hasCheckpoint(1)).toBe(false);
        });

        test('should not affect other levels when clearing', () => {
            const state1 = {
                x: 300,
                y: 400,
                score: 100,
                isPoweredUp: false,
                hasFirePower: false,
                coinsCollected: 3,
                enemiesDefeated: 1
            };

            const state2 = {
                x: 700,
                y: 350,
                score: 250,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 9,
                enemiesDefeated: 5
            };

            checkpointManager.saveCheckpoint(1, state1);
            checkpointManager.saveCheckpoint(2, state2);

            checkpointManager.clearCheckpoint(1);

            expect(checkpointManager.hasCheckpoint(1)).toBe(false);
            expect(checkpointManager.hasCheckpoint(2)).toBe(true);
        });
    });

    describe('clearAllCheckpoints', () => {
        test('should clear all checkpoints', () => {
            const state1 = {
                x: 300,
                y: 400,
                score: 100,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 3,
                enemiesDefeated: 1
            };

            const state2 = {
                x: 600,
                y: 350,
                score: 200,
                isPoweredUp: false,
                hasFirePower: true,
                coinsCollected: 7,
                enemiesDefeated: 4
            };

            const state3 = {
                x: 900,
                y: 300,
                score: 350,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 15,
                enemiesDefeated: 8
            };

            checkpointManager.saveCheckpoint(1, state1);
            checkpointManager.saveCheckpoint(2, state2);
            checkpointManager.saveCheckpoint(3, state3);

            checkpointManager.clearAllCheckpoints();

            expect(checkpointManager.hasCheckpoint(1)).toBe(false);
            expect(checkpointManager.hasCheckpoint(2)).toBe(false);
            expect(checkpointManager.hasCheckpoint(3)).toBe(false);
        });
    });

    describe('getAllCheckpoints', () => {
        test('should return empty object when no checkpoints exist', () => {
            const allCheckpoints = checkpointManager.getAllCheckpoints();
            expect(allCheckpoints).toEqual({});
        });

        test('should return all saved checkpoints', () => {
            const state1 = {
                x: 400,
                y: 380,
                score: 120,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 4,
                enemiesDefeated: 2
            };

            const state2 = {
                x: 800,
                y: 320,
                score: 280,
                isPoweredUp: false,
                hasFirePower: true,
                coinsCollected: 11,
                enemiesDefeated: 6
            };

            checkpointManager.saveCheckpoint(1, state1);
            checkpointManager.saveCheckpoint(2, state2);

            const allCheckpoints = checkpointManager.getAllCheckpoints();

            expect(Object.keys(allCheckpoints).length).toBe(2);
            expect(allCheckpoints[1]).toBeDefined();
            expect(allCheckpoints[2]).toBeDefined();
            expect(allCheckpoints[1].x).toBe(400);
            expect(allCheckpoints[2].x).toBe(800);
        });

        test('should return a copy, not reference to internal state', () => {
            const state = {
                x: 500,
                y: 350,
                score: 150,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 5,
                enemiesDefeated: 3
            };

            checkpointManager.saveCheckpoint(1, state);
            const allCheckpoints = checkpointManager.getAllCheckpoints();
            
            // Modify the returned object
            allCheckpoints[1].x = 999;
            
            // Original should not be affected
            const checkpoint = checkpointManager.getCheckpoint(1);
            expect(checkpoint.x).toBe(500);
        });
    });

    describe('edge cases', () => {
        test('should handle saving checkpoint without optional player 2 state', () => {
            const state = {
                x: 450,
                y: 390,
                score: 130,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 4,
                enemiesDefeated: 2
            };

            checkpointManager.saveCheckpoint(1, state);
            const checkpoint = checkpointManager.getCheckpoint(1);

            expect(checkpoint.isPoweredUp2).toBe(false);
            expect(checkpoint.hasFirePower2).toBe(false);
        });

        test('should handle clearing non-existent checkpoint', () => {
            expect(() => {
                checkpointManager.clearCheckpoint(99);
            }).not.toThrow();
        });

        test('should handle getting checkpoint for non-existent level', () => {
            const checkpoint = checkpointManager.getCheckpoint(999);
            expect(checkpoint).toBeNull();
        });
    });
});
