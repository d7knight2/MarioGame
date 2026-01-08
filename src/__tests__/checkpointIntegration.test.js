/**
 * Integration tests for checkpoint system
 * Tests checkpoint functionality with GameScene interactions
 */

import CheckpointManager from '../utils/CheckpointManager.js';

describe('Checkpoint System Integration', () => {
    let checkpointManager;

    beforeEach(() => {
        checkpointManager = new CheckpointManager();
    });

    describe('Checkpoint flow in single-player mode', () => {
        test('should save checkpoint state when player reaches checkpoint', () => {
            // Simulate player reaching checkpoint in level 1
            const level = 1;
            const checkpointState = {
                x: 1100,
                y: 450,
                score: 250,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 8,
                enemiesDefeated: 3
            };

            checkpointManager.saveCheckpoint(level, checkpointState);

            expect(checkpointManager.hasCheckpoint(level)).toBe(true);
            const saved = checkpointManager.getCheckpoint(level);
            expect(saved.x).toBe(1100);
            expect(saved.score).toBe(250);
            expect(saved.isPoweredUp).toBe(true);
        });

        test('should restore player state from checkpoint on respawn', () => {
            // Setup: Player reaches checkpoint with specific state
            const level = 1;
            const checkpointState = {
                x: 1100,
                y: 450,
                score: 300,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 10,
                enemiesDefeated: 5
            };

            checkpointManager.saveCheckpoint(level, checkpointState);

            // Player dies and respawns
            const restoredState = checkpointManager.getCheckpoint(level);

            // Verify state is restored correctly
            expect(restoredState).not.toBeNull();
            expect(restoredState.x).toBe(1100);
            expect(restoredState.y).toBe(450);
            expect(restoredState.score).toBe(300);
            expect(restoredState.isPoweredUp).toBe(true);
            expect(restoredState.hasFirePower).toBe(true);
            expect(restoredState.coinsCollected).toBe(10);
            expect(restoredState.enemiesDefeated).toBe(5);
        });

        test('should maintain power-up state through checkpoint respawn', () => {
            const level = 2;
            
            // Player with fire power reaches checkpoint
            checkpointManager.saveCheckpoint(level, {
                x: 2000,
                y: 400,
                score: 500,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 15,
                enemiesDefeated: 8
            });

            const checkpoint = checkpointManager.getCheckpoint(level);
            expect(checkpoint.hasFirePower).toBe(true);
            expect(checkpoint.isPoweredUp).toBe(true);
        });

        test('should preserve score and stats through checkpoint respawn', () => {
            const level = 1;
            const initialScore = 450;
            const initialCoins = 18;
            const initialEnemies = 7;

            checkpointManager.saveCheckpoint(level, {
                x: 1500,
                y: 400,
                score: initialScore,
                isPoweredUp: false,
                hasFirePower: false,
                coinsCollected: initialCoins,
                enemiesDefeated: initialEnemies
            });

            const checkpoint = checkpointManager.getCheckpoint(level);
            expect(checkpoint.score).toBe(initialScore);
            expect(checkpoint.coinsCollected).toBe(initialCoins);
            expect(checkpoint.enemiesDefeated).toBe(initialEnemies);
        });
    });

    describe('Checkpoint flow in multiplayer mode', () => {
        test('should save both players power-up states', () => {
            const level = 2;
            const checkpointState = {
                x: 1000,
                y: 450,
                score: 600,
                isPoweredUp: true,
                hasFirePower: true,
                isPoweredUp2: false,
                hasFirePower2: true,
                coinsCollected: 20,
                enemiesDefeated: 10
            };

            checkpointManager.saveCheckpoint(level, checkpointState);
            const saved = checkpointManager.getCheckpoint(level);

            expect(saved.isPoweredUp).toBe(true);
            expect(saved.hasFirePower).toBe(true);
            expect(saved.isPoweredUp2).toBe(false);
            expect(saved.hasFirePower2).toBe(true);
        });

        test('should restore both players states on respawn', () => {
            const level = 1;
            checkpointManager.saveCheckpoint(level, {
                x: 1100,
                y: 450,
                score: 400,
                isPoweredUp: true,
                hasFirePower: false,
                isPoweredUp2: true,
                hasFirePower2: true,
                coinsCollected: 12,
                enemiesDefeated: 6
            });

            const checkpoint = checkpointManager.getCheckpoint(level);
            
            // Player 1 state
            expect(checkpoint.isPoweredUp).toBe(true);
            expect(checkpoint.hasFirePower).toBe(false);
            
            // Player 2 state
            expect(checkpoint.isPoweredUp2).toBe(true);
            expect(checkpoint.hasFirePower2).toBe(true);
        });
    });

    describe('Multiple checkpoints per level', () => {
        test('should update checkpoint when player reaches second checkpoint', () => {
            const level = 1;
            
            // First checkpoint
            checkpointManager.saveCheckpoint(level, {
                x: 1100,
                y: 450,
                score: 150,
                isPoweredUp: false,
                hasFirePower: false,
                coinsCollected: 5,
                enemiesDefeated: 2
            });

            // Second checkpoint (further in level with more progress)
            checkpointManager.saveCheckpoint(level, {
                x: 2100,
                y: 450,
                score: 350,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 12,
                enemiesDefeated: 6
            });

            const checkpoint = checkpointManager.getCheckpoint(level);
            expect(checkpoint.x).toBe(2100); // Should have second checkpoint position
            expect(checkpoint.score).toBe(350); // Should have updated score
        });
    });

    describe('Level progression with checkpoints', () => {
        test('should maintain separate checkpoints for different levels', () => {
            // Save checkpoints for multiple levels
            checkpointManager.saveCheckpoint(1, {
                x: 1100,
                y: 450,
                score: 200,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 8,
                enemiesDefeated: 3
            });

            checkpointManager.saveCheckpoint(2, {
                x: 1000,
                y: 450,
                score: 600,
                isPoweredUp: false,
                hasFirePower: true,
                coinsCollected: 20,
                enemiesDefeated: 10
            });

            const level1Checkpoint = checkpointManager.getCheckpoint(1);
            const level2Checkpoint = checkpointManager.getCheckpoint(2);

            expect(level1Checkpoint.x).toBe(1100);
            expect(level2Checkpoint.x).toBe(1000);
            expect(level1Checkpoint.score).toBe(200);
            expect(level2Checkpoint.score).toBe(600);
        });

        test('should clear checkpoint when level is completed', () => {
            const level = 1;
            
            // Save checkpoint
            checkpointManager.saveCheckpoint(level, {
                x: 1500,
                y: 450,
                score: 300,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 10,
                enemiesDefeated: 5
            });

            expect(checkpointManager.hasCheckpoint(level)).toBe(true);

            // Simulate level completion
            checkpointManager.clearCheckpoint(level);

            expect(checkpointManager.hasCheckpoint(level)).toBe(false);
        });

        test('should clear all checkpoints on game reset', () => {
            // Save checkpoints for multiple levels
            checkpointManager.saveCheckpoint(1, {
                x: 1100,
                y: 450,
                score: 200,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 8,
                enemiesDefeated: 3
            });

            checkpointManager.saveCheckpoint(2, {
                x: 1000,
                y: 450,
                score: 500,
                isPoweredUp: false,
                hasFirePower: true,
                coinsCollected: 18,
                enemiesDefeated: 9
            });

            // Reset game (return to start screen)
            checkpointManager.clearAllCheckpoints();

            expect(checkpointManager.hasCheckpoint(1)).toBe(false);
            expect(checkpointManager.hasCheckpoint(2)).toBe(false);
            expect(checkpointManager.hasCheckpoint(3)).toBe(false);
        });
    });

    describe('Death and respawn scenarios', () => {
        test('should handle death before any checkpoint is reached', () => {
            const level = 1;
            const checkpoint = checkpointManager.getCheckpoint(level);
            
            // No checkpoint saved yet
            expect(checkpoint).toBeNull();
        });

        test('should handle death after checkpoint is reached', () => {
            const level = 1;
            
            // Player reaches checkpoint
            checkpointManager.saveCheckpoint(level, {
                x: 1100,
                y: 450,
                score: 250,
                isPoweredUp: true,
                hasFirePower: false,
                coinsCollected: 9,
                enemiesDefeated: 4
            });

            // Player dies later
            const checkpoint = checkpointManager.getCheckpoint(level);
            
            // Should be able to respawn from checkpoint
            expect(checkpoint).not.toBeNull();
            expect(checkpoint.x).toBe(1100);
        });

        test('should maintain checkpoint across multiple deaths', () => {
            const level = 2;
            
            // Save checkpoint
            checkpointManager.saveCheckpoint(level, {
                x: 2000,
                y: 400,
                score: 400,
                isPoweredUp: true,
                hasFirePower: true,
                coinsCollected: 15,
                enemiesDefeated: 7
            });

            // First death and respawn
            let checkpoint = checkpointManager.getCheckpoint(level);
            expect(checkpoint.x).toBe(2000);
            
            // Second death and respawn (checkpoint still available)
            checkpoint = checkpointManager.getCheckpoint(level);
            expect(checkpoint.x).toBe(2000);
            expect(checkpoint.score).toBe(400);
        });
    });

    describe('Edge cases', () => {
        test('should handle respawn when no checkpoint exists', () => {
            const level = 3;
            const checkpoint = checkpointManager.getCheckpoint(level);
            
            expect(checkpoint).toBeNull();
            // In game, this should trigger game over, not respawn
        });

        test('should validate checkpoint state before saving', () => {
            const level = 1;
            
            // Invalid state (missing required properties)
            const invalidState = {
                x: 1000,
                // Missing other required properties
            };
            
            // CheckpointManager should handle invalid state gracefully
            // In updated implementation, this is validated
            checkpointManager.saveCheckpoint(level, invalidState);
            
            // Checkpoint should not be saved due to validation
            expect(checkpointManager.hasCheckpoint(level)).toBe(false);
        });
    });
});
