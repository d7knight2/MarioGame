/**
 * AnimationManager - Manages character and entity animations
 * Handles animation state transitions and sprite frame generation
 */

export default class AnimationManager {
    /**
     * Create character animation frames (idle, running, jumping)
     * @param {Phaser.Scene} scene - The scene to create animations in
     * @param {string} character - Character type: 'mario', 'luigi', or 'toad'
     */
    static createCharacterAnimations(scene, character) {
        // For now, we'll use simple scale/position tweens to simulate animation
        // In a full implementation, you'd create sprite sheets with multiple frames
        
        // Store animation states
        return {
            idle: (sprite) => {
                // Gentle bobbing animation
                scene.tweens.add({
                    targets: sprite,
                    y: sprite.y - 2,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            },
            
            running: (sprite, direction) => {
                // Running animation - faster bobbing
                if (sprite.runningTween) {
                    sprite.runningTween.remove();
                }
                
                sprite.runningTween = scene.tweens.add({
                    targets: sprite,
                    y: sprite.y - 3,
                    duration: 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Flip sprite based on direction
                if (direction < 0) {
                    sprite.setScale(-Math.abs(sprite.scaleX), sprite.scaleY);
                } else if (direction > 0) {
                    sprite.setScale(Math.abs(sprite.scaleX), sprite.scaleY);
                }
            },
            
            jumping: (sprite) => {
                // Stop other animations
                if (sprite.runningTween) {
                    sprite.runningTween.remove();
                    sprite.runningTween = null;
                }
                
                // Slight squash and stretch
                scene.tweens.add({
                    targets: sprite,
                    scaleY: sprite.scaleY * 1.1,
                    scaleX: sprite.scaleX * 0.9,
                    duration: 100,
                    yoyo: true
                });
            },
            
            landing: (sprite) => {
                // Squash on landing
                const originalScaleX = Math.abs(sprite.scaleX);
                const originalScaleY = sprite.scaleY;
                const sign = sprite.scaleX < 0 ? -1 : 1;
                
                sprite.setScale(sign * originalScaleX * 1.2, originalScaleY * 0.8);
                
                scene.tweens.add({
                    targets: sprite,
                    scaleX: sign * originalScaleX,
                    scaleY: originalScaleY,
                    duration: 150,
                    ease: 'Back.easeOut'
                });
            },
            
            powerUp: (sprite) => {
                // Power-up transformation animation
                scene.tweens.add({
                    targets: sprite,
                    scaleX: sprite.scaleX * 1.3,
                    scaleY: sprite.scaleY * 1.3,
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Cubic.easeInOut'
                });
            },
            
            damage: (sprite) => {
                // Damage flash effect
                const timeline = scene.tweens.createTimeline();
                
                for (let i = 0; i < 5; i++) {
                    timeline.add({
                        targets: sprite,
                        alpha: 0.3,
                        duration: 100
                    });
                    timeline.add({
                        targets: sprite,
                        alpha: 1,
                        duration: 100
                    });
                }
                
                timeline.play();
            }
        };
    }
    
    /**
     * Create enemy animations (walking, defeated)
     * @param {Phaser.Scene} scene - The scene to create animations in
     */
    static createEnemyAnimations(scene) {
        return {
            walking: (sprite) => {
                // Waddle animation
                if (!sprite.waddleTween) {
                    sprite.waddleTween = scene.tweens.add({
                        targets: sprite,
                        scaleX: sprite.scaleX * 1.1,
                        duration: 300,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            },
            
            defeated: (sprite) => {
                // Stop walking animation
                if (sprite.waddleTween) {
                    sprite.waddleTween.remove();
                    sprite.waddleTween = null;
                }
                
                // Flip and fade out
                scene.tweens.add({
                    targets: sprite,
                    angle: 180,
                    y: sprite.y + 100,
                    alpha: 0,
                    duration: 500,
                    ease: 'Cubic.easeIn'
                });
            }
        };
    }
    
    /**
     * Create boss animations (idle, attack, hurt)
     * @param {Phaser.Scene} scene - The scene to create animations in
     */
    static createBossAnimations(scene) {
        return {
            idle: (sprite) => {
                // Breathing animation
                if (!sprite.breathTween) {
                    sprite.breathTween = scene.tweens.add({
                        targets: sprite,
                        scaleX: sprite.scaleX * 1.05,
                        scaleY: sprite.scaleY * 1.05,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            },
            
            attack: (sprite) => {
                // Attack lunge animation
                const originalX = sprite.x;
                
                scene.tweens.add({
                    targets: sprite,
                    x: originalX - 30,
                    scaleX: sprite.scaleX * 1.2,
                    duration: 200,
                    yoyo: true,
                    ease: 'Cubic.easeOut'
                });
            },
            
            hurt: (sprite) => {
                // Flash red and shake
                const timeline = scene.tweens.createTimeline();
                
                // Change tint to red
                sprite.setTint(0xff0000);
                
                timeline.add({
                    targets: sprite,
                    x: sprite.x + 5,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
                
                timeline.add({
                    targets: sprite,
                    alpha: 1,
                    duration: 100,
                    onComplete: () => {
                        sprite.clearTint();
                    }
                });
                
                timeline.play();
            },
            
            defeated: (sprite) => {
                // Stop idle animation
                if (sprite.breathTween) {
                    sprite.breathTween.remove();
                    sprite.breathTween = null;
                }
                
                // Dramatic defeat animation
                const timeline = scene.tweens.createTimeline();
                
                timeline.add({
                    targets: sprite,
                    scaleX: sprite.scaleX * 1.3,
                    scaleY: sprite.scaleY * 1.3,
                    duration: 300,
                    ease: 'Cubic.easeOut'
                });
                
                timeline.add({
                    targets: sprite,
                    angle: 90,
                    y: sprite.y + 200,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Cubic.easeIn'
                });
                
                timeline.play();
            },
            
            charging: (sprite) => {
                // Charging attack indicator
                if (sprite.chargeTween) {
                    sprite.chargeTween.remove();
                }
                
                sprite.setTint(0xff8800);
                
                sprite.chargeTween = scene.tweens.add({
                    targets: sprite,
                    scaleX: sprite.scaleX * 1.15,
                    scaleY: sprite.scaleY * 1.15,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Cubic.easeInOut'
                });
            },
            
            stopCharging: (sprite) => {
                if (sprite.chargeTween) {
                    sprite.chargeTween.remove();
                    sprite.chargeTween = null;
                }
                sprite.clearTint();
            }
        };
    }
    
    /**
     * Create power-up animations (floating, collected)
     * @param {Phaser.Scene} scene - The scene to create animations in
     */
    static createPowerUpAnimations(scene) {
        return {
            floating: (sprite, baseY) => {
                // Gentle floating animation
                scene.tweens.add({
                    targets: sprite,
                    y: baseY - 8,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Rotation for star
                if (sprite.texture.key.includes('star')) {
                    scene.tweens.add({
                        targets: sprite,
                        angle: 360,
                        duration: 2000,
                        repeat: -1,
                        ease: 'Linear'
                    });
                }
            },
            
            collected: (sprite) => {
                // Rise up and fade
                scene.tweens.add({
                    targets: sprite,
                    y: sprite.y - 100,
                    alpha: 0,
                    scale: 0.5,
                    duration: 500,
                    ease: 'Cubic.easeOut'
                });
            }
        };
    }
    
    /**
     * Create coin animations (spinning, collected)
     * @param {Phaser.Scene} scene - The scene to create animations in
     */
    static createCoinAnimations(scene) {
        return {
            spinning: (sprite, baseY) => {
                // Spinning animation (scale X for 3D effect)
                scene.tweens.add({
                    targets: sprite,
                    scaleX: 0.3,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Bobbing animation
                scene.tweens.add({
                    targets: sprite,
                    y: baseY - 8,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            },
            
            collected: (sprite) => {
                // Jump up and fade
                scene.tweens.add({
                    targets: sprite,
                    y: sprite.y - 60,
                    alpha: 0,
                    scale: 1.5,
                    duration: 400,
                    ease: 'Cubic.easeOut'
                });
            }
        };
    }
    
    /**
     * Create block animations (idle, hit, used)
     * @param {Phaser.Scene} scene - The scene to create animations in
     */
    static createBlockAnimations(scene) {
        return {
            idle: (sprite, baseY) => {
                // Gentle bouncing
                scene.tweens.add({
                    targets: sprite,
                    y: baseY - 5,
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            },
            
            hit: (sprite, baseY) => {
                // Bounce up when hit
                scene.tweens.add({
                    targets: sprite,
                    y: baseY - 20,
                    duration: 100,
                    yoyo: true,
                    ease: 'Cubic.easeOut'
                });
            },
            
            used: (sprite) => {
                // Change to used block appearance
                sprite.setTint(0x888888);
            }
        };
    }
}
