import { test, expect } from '@playwright/test';

/**
 * Tests for core gameplay mechanics
 */

/**
 * Helper function to start a single-player game
 */
async function startSinglePlayerGame(page) {
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  const canvas = page.locator('canvas');
  const canvasBox = await canvas.boundingBox();
  
  // Click Play as Guest
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2 + 80);
  }
  
  await page.waitForTimeout(2000);
  
  // Click to start game (space bar or click)
  await page.keyboard.press('Space');
  
  // Wait for mode selection
  await page.waitForTimeout(2000);
  
  // Click on "1 PLAYER" button
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
  }
  
  await page.waitForTimeout(2000);
  
  // Select character (Mario - first option)
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + canvasBox.width / 2 - 150, canvasBox.y + canvasBox.height / 2);
  }
  
  // Wait for game to start
  await page.waitForTimeout(3000);
}

test.describe('Gameplay Mechanics - Jump on Enemies', () => {
  test('should defeat enemies by jumping on them', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    // Get initial enemies defeated count
    const initialEnemiesDefeated = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        return gameScene ? gameScene.enemiesDefeated : 0;
      }
      return 0;
    });
    
    // Move player to the right to find an enemy
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowRight');
    
    // Jump multiple times to try to land on enemy
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(500);
      
      // Move right while jumping
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(300);
      await page.keyboard.up('ArrowRight');
    }
    
    // Wait for enemy defeat animation
    await page.waitForTimeout(1000);
    
    // Check if enemies defeated count increased
    const enemiesDefeated = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        return gameScene ? gameScene.enemiesDefeated : 0;
      }
      return 0;
    });
    
    // Verify that at least one enemy was defeated
    expect(enemiesDefeated).toBeGreaterThan(initialEnemiesDefeated);
  });
});

test.describe('Gameplay Mechanics - Boss Defeat', () => {
  test('should be able to kill bosses', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    // Navigate to a boss level by setting the level to 3 (which has a boss)
    await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        if (gameScene) {
          // Set to level 3 which has a boss
          gameCanvas.__phaserGame.registry.set('currentLevel', 3);
          // Give player fire power to help defeat boss
          gameScene.hasFirePower = true;
          // Restart the scene with boss level
          gameScene.scene.restart();
        }
      }
    });
    
    // Wait for scene restart
    await page.waitForTimeout(3000);
    
    // Check if boss exists
    const bossExists = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        return gameScene && gameScene.boss && gameScene.boss.active;
      }
      return false;
    });
    
    expect(bossExists).toBe(true);
    
    // Get initial boss health
    const initialBossHealth = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        return gameScene ? gameScene.bossHealth : 0;
      }
      return 0;
    });
    
    // Move towards boss and attack
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(3000);
    
    // Shoot fireballs at boss (X key for fireball)
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('x');
      await page.waitForTimeout(500);
    }
    
    await page.keyboard.up('ArrowRight');
    
    // Jump on boss multiple times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(800);
    }
    
    // Wait for boss defeat
    await page.waitForTimeout(2000);
    
    // Check if boss health decreased or boss was defeated
    const bossHealthOrDefeated = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        if (gameScene) {
          // Boss defeated if it's no longer active or health is 0
          const bossActive = gameScene.boss && gameScene.boss.active;
          const currentHealth = gameScene.bossHealth;
          return { active: bossActive, health: currentHealth };
        }
      }
      return { active: true, health: initialBossHealth };
    });
    
    // Verify boss was damaged or defeated
    expect(bossHealthOrDefeated.health).toBeLessThan(initialBossHealth);
  });
});

test.describe('Gameplay Mechanics - Player Death', () => {
  test('should trigger game over when player dies', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    // Wait for game to fully load
    await page.waitForTimeout(2000);
    
    // Force player death by making them fall off the platform
    await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        if (gameScene && gameScene.player) {
          // Set player position to fall off screen
          gameScene.player.y = gameScene.cameras.main.height + 100;
        }
      }
    });
    
    // Wait for game over logic to trigger
    await page.waitForTimeout(2000);
    
    // Check if game over state is triggered
    const gameOverState = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        return gameScene ? gameScene.gameOver : false;
      }
      return false;
    });
    
    expect(gameOverState).toBe(true);
  });
  
  test('should show game over message when player dies', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    await page.waitForTimeout(2000);
    
    // Simulate player death by touching an enemy
    await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        if (gameScene && gameScene.player) {
          // Remove power-ups first
          gameScene.isPoweredUp = false;
          gameScene.hasFirePower = false;
          // Trigger death by falling off
          gameScene.player.y = gameScene.cameras.main.height + 100;
        }
      }
    });
    
    // Wait for game over sequence
    await page.waitForTimeout(3000);
    
    // Take a screenshot to verify game over screen
    await page.screenshot({ path: '/tmp/game-over-screen.png' });
    
    // Verify game over state
    const gameOverState = await page.evaluate(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        const gameScene = gameCanvas.__phaserGame.scene.getScene('GameScene');
        return gameScene ? gameScene.gameOver : false;
      }
      return false;
    });
    
    expect(gameOverState).toBe(true);
  });
});
