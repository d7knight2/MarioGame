/**
 * Unit tests for visual effects utilities
 * Tests the new graphics enhancement modules added for improved gameplay feel
 */

import ParticleEffects from '../utils/ParticleEffects.js';
import AnimationManager from '../utils/AnimationManager.js';
import BackgroundGenerator from '../utils/BackgroundGenerator.js';
import SpriteFactory from '../utils/SpriteFactory.js';

describe('Visual Effects Utilities', () => {
  describe('ParticleEffects module', () => {
    test('should export ParticleEffects class', () => {
      expect(ParticleEffects).toBeDefined();
      expect(typeof ParticleEffects).toBe('function');
    });

    test('should have coinCollect method', () => {
      expect(ParticleEffects.coinCollect).toBeDefined();
      expect(typeof ParticleEffects.coinCollect).toBe('function');
    });

    test('should have enemyDefeat method', () => {
      expect(ParticleEffects.enemyDefeat).toBeDefined();
      expect(typeof ParticleEffects.enemyDefeat).toBe('function');
    });

    test('should have powerUpCollect method', () => {
      expect(ParticleEffects.powerUpCollect).toBeDefined();
      expect(typeof ParticleEffects.powerUpCollect).toBe('function');
    });

    test('should have starTrail method', () => {
      expect(ParticleEffects.starTrail).toBeDefined();
      expect(typeof ParticleEffects.starTrail).toBe('function');
    });

    test('should have jumpDust method', () => {
      expect(ParticleEffects.jumpDust).toBeDefined();
      expect(typeof ParticleEffects.jumpDust).toBe('function');
    });

    test('should have landingDust method', () => {
      expect(ParticleEffects.landingDust).toBeDefined();
      expect(typeof ParticleEffects.landingDust).toBe('function');
    });

    test('should have blockHit method', () => {
      expect(ParticleEffects.blockHit).toBeDefined();
      expect(typeof ParticleEffects.blockHit).toBe('function');
    });

    test('should have fireballImpact method', () => {
      expect(ParticleEffects.fireballImpact).toBeDefined();
      expect(typeof ParticleEffects.fireballImpact).toBe('function');
    });

    test('should have screenShake method', () => {
      expect(ParticleEffects.screenShake).toBeDefined();
      expect(typeof ParticleEffects.screenShake).toBe('function');
    });

    test('should have screenFlash method', () => {
      expect(ParticleEffects.screenFlash).toBeDefined();
      expect(typeof ParticleEffects.screenFlash).toBe('function');
    });

    test('should have scorePopup method', () => {
      expect(ParticleEffects.scorePopup).toBeDefined();
      expect(typeof ParticleEffects.scorePopup).toBe('function');
    });
  });

  describe('AnimationManager module', () => {
    test('should export AnimationManager class', () => {
      expect(AnimationManager).toBeDefined();
      expect(typeof AnimationManager).toBe('function');
    });

    test('should have createCharacterAnimations method', () => {
      expect(AnimationManager.createCharacterAnimations).toBeDefined();
      expect(typeof AnimationManager.createCharacterAnimations).toBe('function');
    });

    test('should have createEnemyAnimations method', () => {
      expect(AnimationManager.createEnemyAnimations).toBeDefined();
      expect(typeof AnimationManager.createEnemyAnimations).toBe('function');
    });

    test('should have createBossAnimations method', () => {
      expect(AnimationManager.createBossAnimations).toBeDefined();
      expect(typeof AnimationManager.createBossAnimations).toBe('function');
    });

    test('should have createPowerUpAnimations method', () => {
      expect(AnimationManager.createPowerUpAnimations).toBeDefined();
      expect(typeof AnimationManager.createPowerUpAnimations).toBe('function');
    });

    test('should have createCoinAnimations method', () => {
      expect(AnimationManager.createCoinAnimations).toBeDefined();
      expect(typeof AnimationManager.createCoinAnimations).toBe('function');
    });

    test('should have createBlockAnimations method', () => {
      expect(AnimationManager.createBlockAnimations).toBeDefined();
      expect(typeof AnimationManager.createBlockAnimations).toBe('function');
    });
  });

  describe('BackgroundGenerator module', () => {
    test('should export BackgroundGenerator class', () => {
      expect(BackgroundGenerator).toBeDefined();
      expect(typeof BackgroundGenerator).toBe('function');
    });

    test('should have createParallaxBackground method', () => {
      expect(BackgroundGenerator.createParallaxBackground).toBeDefined();
      expect(typeof BackgroundGenerator.createParallaxBackground).toBe('function');
    });

    test('should have createCloudLayer method', () => {
      expect(BackgroundGenerator.createCloudLayer).toBeDefined();
      expect(typeof BackgroundGenerator.createCloudLayer).toBe('function');
    });

    test('should have createCloud method', () => {
      expect(BackgroundGenerator.createCloud).toBeDefined();
      expect(typeof BackgroundGenerator.createCloud).toBe('function');
    });

    test('should have createMountainLayer method', () => {
      expect(BackgroundGenerator.createMountainLayer).toBeDefined();
      expect(typeof BackgroundGenerator.createMountainLayer).toBe('function');
    });

    test('should have createHillLayer method', () => {
      expect(BackgroundGenerator.createHillLayer).toBeDefined();
      expect(typeof BackgroundGenerator.createHillLayer).toBe('function');
    });

    test('should have createBushLayer method', () => {
      expect(BackgroundGenerator.createBushLayer).toBeDefined();
      expect(typeof BackgroundGenerator.createBushLayer).toBe('function');
    });

    test('should have createBush method', () => {
      expect(BackgroundGenerator.createBush).toBeDefined();
      expect(typeof BackgroundGenerator.createBush).toBe('function');
    });

    test('should have createPipe method', () => {
      expect(BackgroundGenerator.createPipe).toBeDefined();
      expect(typeof BackgroundGenerator.createPipe).toBe('function');
    });

    test('should have addPipes method', () => {
      expect(BackgroundGenerator.addPipes).toBeDefined();
      expect(typeof BackgroundGenerator.addPipes).toBe('function');
    });
  });

  describe('SpriteFactory module', () => {
    test('should export SpriteFactory class', () => {
      expect(SpriteFactory).toBeDefined();
      expect(typeof SpriteFactory).toBe('function');
    });

    test('should have createCharacterSprite method', () => {
      expect(SpriteFactory.createCharacterSprite).toBeDefined();
      expect(typeof SpriteFactory.createCharacterSprite).toBe('function');
    });

    test('should have createEnemySprite method', () => {
      expect(SpriteFactory.createEnemySprite).toBeDefined();
      expect(typeof SpriteFactory.createEnemySprite).toBe('function');
    });

    test('should have createCoinSprite method', () => {
      expect(SpriteFactory.createCoinSprite).toBeDefined();
      expect(typeof SpriteFactory.createCoinSprite).toBe('function');
    });

    test('should have createPowerUpSprite method', () => {
      expect(SpriteFactory.createPowerUpSprite).toBeDefined();
      expect(typeof SpriteFactory.createPowerUpSprite).toBe('function');
    });

    test('should have createBlockSprite method', () => {
      expect(SpriteFactory.createBlockSprite).toBeDefined();
      expect(typeof SpriteFactory.createBlockSprite).toBe('function');
    });

    test('should have createBossSprite method', () => {
      expect(SpriteFactory.createBossSprite).toBeDefined();
      expect(typeof SpriteFactory.createBossSprite).toBe('function');
    });
  });

  describe('Module Integration', () => {
    test('all modules should be importable without errors', () => {
      expect(ParticleEffects).toBeDefined();
      expect(AnimationManager).toBeDefined();
      expect(BackgroundGenerator).toBeDefined();
      expect(SpriteFactory).toBeDefined();
    });

    test('modules should have correct number of static methods', () => {
      // ParticleEffects should have at least 11 methods
      const particleEffectsMethods = Object.getOwnPropertyNames(ParticleEffects)
        .filter(name => typeof ParticleEffects[name] === 'function' && name !== 'length' && name !== 'name' && name !== 'prototype');
      expect(particleEffectsMethods.length).toBeGreaterThanOrEqual(11);

      // AnimationManager should have at least 6 methods
      const animationManagerMethods = Object.getOwnPropertyNames(AnimationManager)
        .filter(name => typeof AnimationManager[name] === 'function' && name !== 'length' && name !== 'name' && name !== 'prototype');
      expect(animationManagerMethods.length).toBeGreaterThanOrEqual(6);

      // BackgroundGenerator should have at least 9 methods
      const backgroundGeneratorMethods = Object.getOwnPropertyNames(BackgroundGenerator)
        .filter(name => typeof BackgroundGenerator[name] === 'function' && name !== 'length' && name !== 'name' && name !== 'prototype');
      expect(backgroundGeneratorMethods.length).toBeGreaterThanOrEqual(9);

      // SpriteFactory should have at least 6 methods
      const spriteFactoryMethods = Object.getOwnPropertyNames(SpriteFactory)
        .filter(name => typeof SpriteFactory[name] === 'function' && name !== 'length' && name !== 'name' && name !== 'prototype');
      expect(spriteFactoryMethods.length).toBeGreaterThanOrEqual(6);
    });
  });
});
