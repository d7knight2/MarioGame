import { test, expect } from '@playwright/test';

/**
 * Tests for core gameplay mechanics
 * These tests verify that game mechanics exist and can be interacted with
 */

/**
 * Helper function to start a single-player game as guest
 */
async function startSinglePlayerGame(page) {
  await page.goto('/');
  await page.waitForTimeout(2000);
  
  const canvas = page.locator('canvas');
  const canvasBox = await canvas.boundingBox();
  
  // Click "Play as Guest" button (y=510)
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + 510);
  }
  
  await page.waitForTimeout(2000);
  
  // Press space to start from StartScene
  await page.keyboard.press('Space');
  
  // Wait for mode selection
  await page.waitForTimeout(2000);
  
  // Click on "1 PLAYER" button (y=height/2, approximately 300)
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + 300);
  }
  
  await page.waitForTimeout(2000);
  
  // Click on Mario character (first character, left side, approximately x=width/2 - 150, y=height/2)
  if (canvasBox) {
    await page.mouse.click(canvasBox.x + canvasBox.width / 2 - 150, canvasBox.y + 300);
  }
  
  // Wait for game to start
  await page.waitForTimeout(3000);
}

test.describe('Gameplay Mechanics - Jump on Enemies', () => {
  test('should support enemy defeat tracking', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    // Verify game has enemy tracking mechanism
    const hasEnemyTracking = await page.evaluate(() => {
      const game = window.Phaser?.GAMES?.[0];
      if (game) {
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
          // Check if enemy defeat tracking exists
          return typeof gameScene.enemiesDefeated === 'number';
        }
      }
      return false;
    });
    
    expect(hasEnemyTracking).toBe(true);
  });
});

test.describe('Gameplay Mechanics - Boss Defeat', () => {
  test('should support boss battles in level 3', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    // Set to level 3 and check if boss exists
    const bossInfo = await page.evaluate(() => {
      const game = window.Phaser?.GAMES?.[0];
      if (game) {
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
          // Set to level 3 which has a boss
          game.registry.set('currentLevel', 3);
          // Give player fire power
          game.registry.set('hasFirePower', true);
          // Restart the scene
          gameScene.scene.restart();
          
          return {
            hasBossTracking: typeof gameScene.bossHealth === 'number',
            canSetLevel: true
          };
        }
      }
      return { hasBossTracking: false, canSetLevel: false };
    });
    
    // Wait for restart
    await page.waitForTimeout(3000);
    
    // Verify boss mechanics exist
    const bossExists = await page.evaluate(() => {
      const game = window.Phaser?.GAMES?.[0];
      if (game) {
        const gameScene = game.scene.getScene('GameScene');
        return gameScene && gameScene.boss && typeof gameScene.bossHealth === 'number';
      }
      return false;
    });
    
    expect(bossInfo.hasBossTracking).toBe(true);
    expect(bossExists).toBe(true);
  });
});

test.describe('Gameplay Mechanics - Player Death', () => {
  test('should have game over state mechanism', async ({ page }) => {
    await startSinglePlayerGame(page);
    
    // Wait for game to fully load
    await page.waitForTimeout(2000);
    
    // Verify game over mechanism exists
    const hasGameOverMechanism = await page.evaluate(() => {
      const game = window.Phaser?.GAMES?.[0];
      if (game) {
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
          // Check if gameOver property exists
          return typeof gameScene.gameOver === 'boolean';
        }
      }
      return false;
    });
    
    expect(hasGameOverMechanism).toBe(true);
  });
});
