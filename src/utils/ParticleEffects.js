/**
 * ParticleEffects - Handles particle effects and visual feedback
 * Provides common particle effects for platformer games
 */

export default class ParticleEffects {
    /**
     * Create a coin collection particle effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static coinCollect(scene, x, y) {
        // Create sparkle particles
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const speed = 100 + Math.random() * 50;
            
            const particle = scene.add.circle(x, y, 3, 0xffff00);
            scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 50
            );
            particle.body.setGravity(0, 300);
            
            // Fade out and destroy
            scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
        
        // Create a "poof" circle that expands
        const poof = scene.add.circle(x, y, 5, 0xffff00, 0.6);
        scene.tweens.add({
            targets: poof,
            scale: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => poof.destroy()
        });
    }
    
    /**
     * Create an enemy defeat particle effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static enemyDefeat(scene, x, y) {
        // Create brown particles (enemy parts)
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 100;
            
            const particle = scene.add.circle(x, y, 4 + Math.random() * 3, 0x8B4513);
            scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 100
            );
            particle.body.setGravity(0, 600);
            particle.body.setBounce(0.3);
            
            // Fade out and destroy
            scene.tweens.add({
                targets: particle,
                alpha: 0,
                duration: 800,
                delay: 200,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Create a power-up collection particle effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Power-up type: 'mushroom', 'flower', or 'star'
     */
    static powerUpCollect(scene, x, y, type) {
        const colors = {
            mushroom: 0xff0000,
            flower: 0xff4500,
            star: 0xffff00
        };
        const color = colors[type] || 0xffffff;
        
        // Create radiating particles
        for (let i = 0; i < 16; i++) {
            const angle = (i * Math.PI * 2) / 16;
            const speed = 120 + Math.random() * 60;
            
            const particle = scene.add.circle(x, y, 4, color);
            scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            particle.body.setGravity(0, 200);
            
            // Fade out and destroy
            scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0.5,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        // Create expanding ring
        const ring = scene.add.circle(x, y, 10, color, 0);
        ring.setStrokeStyle(3, color, 0.8);
        scene.tweens.add({
            targets: ring,
            scale: 4,
            alpha: 0,
            duration: 500,
            onComplete: () => ring.destroy()
        });
    }
    
    /**
     * Create a star trail effect for invincibility
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static starTrail(scene, x, y) {
        // Create a small star that fades
        const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const star = scene.add.star(x, y, 5, 3, 6, color);
        scene.tweens.add({
            targets: star,
            alpha: 0,
            scale: 0,
            duration: 400,
            onComplete: () => star.destroy()
        });
    }
    
    /**
     * Create a jump dust effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static jumpDust(scene, x, y) {
        // Create small dust clouds
        for (let i = 0; i < 4; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const particle = scene.add.circle(x + offsetX, y, 3, 0xcccccc, 0.6);
            
            scene.tweens.add({
                targets: particle,
                y: y - 10,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Create a landing dust effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static landingDust(scene, x, y) {
        // Create dust particles spreading outward
        for (let i = 0; i < 6; i++) {
            const offsetX = (i - 2.5) * 8;
            const particle = scene.add.circle(x + offsetX, y, 4, 0xcccccc, 0.5);
            
            scene.tweens.add({
                targets: particle,
                y: y - 5,
                x: x + offsetX * 1.5,
                alpha: 0,
                scale: 0.5,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Create a block hit effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static blockHit(scene, x, y) {
        // Create small block fragments
        const colors = [0xffaa00, 0xff8800, 0xffcc00];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const speed = 80 + Math.random() * 40;
            
            const particle = scene.add.rectangle(
                x, y,
                4 + Math.random() * 3,
                4 + Math.random() * 3,
                colors[Math.floor(Math.random() * colors.length)]
            );
            scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 80
            );
            particle.body.setGravity(0, 500);
            
            scene.tweens.add({
                targets: particle,
                alpha: 0,
                angle: 360,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Create a fireball impact effect
     * @param {Phaser.Scene} scene - The scene to create particles in
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static fireballImpact(scene, x, y) {
        // Create fire particles
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 40;
            const color = Math.random() > 0.5 ? 0xff4500 : 0xffaa00;
            
            const particle = scene.add.circle(x, y, 3 + Math.random() * 2, color);
            scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Screen shake effect
     * @param {Phaser.Scene} scene - The scene to apply shake to
     * @param {number} intensity - Shake intensity (default: 5)
     * @param {number} duration - Shake duration in ms (default: 200)
     */
    static screenShake(scene, intensity = 5, duration = 200) {
        scene.cameras.main.shake(duration, intensity / 1000);
    }
    
    /**
     * Screen flash effect
     * @param {Phaser.Scene} scene - The scene to apply flash to
     * @param {number} color - Flash color (default: white)
     * @param {number} duration - Flash duration in ms (default: 100)
     */
    static screenFlash(scene, color = 0xffffff, duration = 100) {
        scene.cameras.main.flash(duration, 
            (color >> 16) & 255,
            (color >> 8) & 255,
            color & 255
        );
    }
    
    /**
     * Create a floating score text
     * @param {Phaser.Scene} scene - The scene to create text in
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} score - Score value to display
     */
    static scorePopup(scene, x, y, score) {
        const text = scene.add.text(x, y, `+${score}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        text.setOrigin(0.5);
        text.setScrollFactor(1);
        
        scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => text.destroy()
        });
    }
}
