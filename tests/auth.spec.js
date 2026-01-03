import { test, expect } from '@playwright/test';

/**
 * Tests for user authentication and sign-in flows
 */

test.describe('Single-Player Sign-In', () => {
  test('should allow user to sign in as a single player', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for the login scene to load
    await page.waitForTimeout(1000);
    
    // Look for the username input field
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Click on the canvas to focus it (simulate clicking on username input area)
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      // Click on the username input area (center of screen, roughly where input is)
      await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2 - 50);
    }
    
    // Type username
    await page.keyboard.type('SinglePlayer123');
    
    // Wait a bit for the input to register
    await page.waitForTimeout(500);
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Wait for navigation to menu scene
    await page.waitForTimeout(2000);
    
    // Verify we're in the menu by checking localStorage
    const currentUser = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(currentUser).toBe('SinglePlayer123');
  });

  test('should allow guest user to play without signing in', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for the login scene to load
    await page.waitForTimeout(1000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Click on "Play as Guest" button (lower part of screen)
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      // Click where the guest button should be
      await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2 + 80);
    }
    
    // Wait for navigation to start scene
    await page.waitForTimeout(2000);
    
    // Verify localStorage doesn't have a currentUser for guest
    const currentUser = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(currentUser).toBeNull();
  });
});

test.describe('Multiplayer Sign-In', () => {
  test('should allow user to sign in and access multiplayer mode', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for the login scene to load
    await page.waitForTimeout(1000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Login as a user
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2 - 50);
    }
    
    await page.keyboard.type('MultiplayerUser');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    // Wait for menu scene
    await page.waitForTimeout(2000);
    
    // Verify we're logged in
    const currentUser = await page.evaluate(() => localStorage.getItem('currentUser'));
    expect(currentUser).toBe('MultiplayerUser');
    
    // Click on "Play" button to go to mode selection
    if (canvasBox) {
      // Click on Play button (upper-center area)
      await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2 - 100);
    }
    
    // Wait for mode selection scene
    await page.waitForTimeout(2000);
    
    // Click on "2 PLAYERS" button (lower button)
    if (canvasBox) {
      await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2 + 100);
    }
    
    // Wait for multiplayer lobby scene
    await page.waitForTimeout(2000);
    
    // Verify we're in multiplayer mode by checking registry
    const gameMode = await page.evaluate(() => {
      // Access Phaser game instance
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && gameCanvas.__phaserGame) {
        return gameCanvas.__phaserGame.registry.get('gameMode');
      }
      return null;
    });
    
    // The game mode should be set to 'multiplayer'
    expect(gameMode).toBe('multiplayer');
  });
});
