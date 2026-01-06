/**
 * WaterEffects - Handles water-related visual effects including ripples and reflections
 * Provides performance-optimized water effects for platformer games
 */

export default class WaterEffects {
    /**
     * Create a water surface area with animated ripples
     * @param {Phaser.Scene} scene - The scene to create water in
     * @param {number} x - X position
     * @param {number} y - Y position (surface level)
     * @param {number} width - Width of water surface
     * @param {number} height - Depth of water
     * @param {object} options - Configuration options
     * @returns {object} Water surface object with ripple methods
     */
    static createWaterSurface(scene, x, y, width, height, options = {}) {
        const config = {
            color: options.color || 0x4a90e2,
            alpha: options.alpha || 0.6,
            waveSpeed: options.waveSpeed || 2000,
            waveHeight: options.waveHeight || 5,
            rippleEnabled: options.rippleEnabled !== false,
            ...options
        };
        
        // Create water body
        const water = scene.add.graphics();
        water.setScrollFactor(options.scrollFactor || 1);
        water.setDepth(options.depth || 0);
        
        // Draw water with gradient effect
        water.fillStyle(config.color, config.alpha);
        water.fillRect(x, y, width, height);
        
        // Add lighter surface layer
        water.fillStyle(config.color + 0x202020, config.alpha * 0.5);
        water.fillRect(x, y, width, Math.min(10, height * 0.1));
        
        // Store water properties
        const waterData = {
            graphics: water,
            x, y, width, height,
            config,
            activeRipples: [],
            waveTween: null,
            surfacePoints: [],
            updateEvent: null
        };
        
        // Create animated surface points for wave effect
        if (config.rippleEnabled) {
            const pointCount = Math.min(Math.floor(width / 20), 50); // Cap for performance
            for (let i = 0; i <= pointCount; i++) {
                waterData.surfacePoints.push({
                    x: x + (i * width / pointCount),
                    y: y,
                    baseY: y,
                    offset: Math.random() * Math.PI * 2
                });
            }
            
            // Animate surface waves and store the event for cleanup
            waterData.updateEvent = scene.time.addEvent({
                delay: 50,
                loop: true,
                callback: () => {
                    if (!water.active) return;
                    this._updateWaterSurface(scene, waterData);
                }
            });
        }
        
        return waterData;
    }
    
    /**
     * Update water surface animation
     * @private
     */
    static _updateWaterSurface(scene, waterData) {
        const time = scene.time.now;
        const { surfacePoints, config, x, y, width, height } = waterData;
        
        // Update surface point positions
        surfacePoints.forEach((point, i) => {
            const wavePhase = (time / config.waveSpeed) + point.offset;
            point.y = point.baseY + Math.sin(wavePhase) * config.waveHeight;
        });
        
        // Redraw water with animated surface
        waterData.graphics.clear();
        waterData.graphics.fillStyle(config.color, config.alpha);
        
        // Draw wavy surface
        waterData.graphics.beginPath();
        waterData.graphics.moveTo(x, y + height);
        waterData.graphics.lineTo(x, surfacePoints[0].y);
        
        surfacePoints.forEach(point => {
            waterData.graphics.lineTo(point.x, point.y);
        });
        
        waterData.graphics.lineTo(x + width, y + height);
        waterData.graphics.closePath();
        waterData.graphics.fillPath();
        
        // Add surface highlight
        waterData.graphics.fillStyle(config.color + 0x303030, config.alpha * 0.4);
        waterData.graphics.beginPath();
        waterData.graphics.moveTo(x, surfacePoints[0].y);
        
        surfacePoints.forEach(point => {
            waterData.graphics.lineTo(point.x, point.y);
        });
        
        waterData.graphics.lineTo(x + width, surfacePoints[0].y);
        waterData.graphics.closePath();
        waterData.graphics.fillPath();
        
        // Update active ripples
        this._updateRipples(scene, waterData);
    }
    
    /**
     * Create a ripple effect at a specific position
     * @param {Phaser.Scene} scene - The scene
     * @param {object} waterData - Water surface data
     * @param {number} rippleX - X position of ripple
     * @param {number} rippleY - Y position of ripple (optional, defaults to surface)
     */
    static createRipple(scene, waterData, rippleX, rippleY = null) {
        const y = rippleY || waterData.y;
        
        // Check if position is within water bounds
        if (rippleX < waterData.x || rippleX > waterData.x + waterData.width) {
            return;
        }
        
        // Create ripple object
        const ripple = {
            x: rippleX,
            y: y,
            radius: 5,
            maxRadius: 40,
            alpha: 0.8,
            speed: 1.2,
            active: true
        };
        
        waterData.activeRipples.push(ripple);
        
        // Limit number of active ripples for performance
        if (waterData.activeRipples.length > 10) {
            waterData.activeRipples.shift();
        }
    }
    
    /**
     * Update all active ripples
     * @private
     */
    static _updateRipples(scene, waterData) {
        const { graphics, config } = waterData;
        
        // Update and draw ripples
        waterData.activeRipples = waterData.activeRipples.filter(ripple => {
            if (!ripple.active) return false;
            
            // Expand ripple
            ripple.radius += ripple.speed;
            ripple.alpha -= 0.02;
            
            // Remove when fully expanded
            if (ripple.radius >= ripple.maxRadius || ripple.alpha <= 0) {
                ripple.active = false;
                return false;
            }
            
            // Draw ripple
            graphics.lineStyle(2, 0xffffff, ripple.alpha * 0.6);
            graphics.strokeCircle(ripple.x, ripple.y, ripple.radius);
            
            // Draw inner ripple for depth
            graphics.lineStyle(1, config.color + 0x404040, ripple.alpha * 0.4);
            graphics.strokeCircle(ripple.x, ripple.y, ripple.radius * 0.7);
            
            return true;
        });
    }
    
    /**
     * Create splash particles when something enters water
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position (water surface)
     * @param {object} options - Splash configuration
     */
    static createSplash(scene, x, y, options = {}) {
        const config = {
            particleCount: options.particleCount || 8,
            color: options.color || 0x6bb6ff,
            size: options.size || 4,
            ...options
        };
        
        // Create splash particles
        for (let i = 0; i < config.particleCount; i++) {
            const angle = (Math.PI / 6) + (i * Math.PI * 2 / 3) / config.particleCount;
            const speed = 100 + Math.random() * 80;
            
            const particle = scene.add.circle(x, y, config.size, config.color);
            scene.physics.add.existing(particle);
            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 120
            );
            particle.body.setGravity(0, 400);
            particle.body.setBounce(0.3);
            
            // Fade out and destroy
            scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0.3,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        // Create expanding splash ring
        const ring = scene.add.ellipse(x, y, 10, 5, config.color, 0);
        ring.setStrokeStyle(3, config.color, 0.8);
        scene.tweens.add({
            targets: ring,
            scaleX: 4,
            scaleY: 2,
            alpha: 0,
            duration: 400,
            onComplete: () => ring.destroy()
        });
    }
    
    /**
     * Destroy a water surface and clean up resources
     * @param {object} waterData - Water surface data to destroy
     */
    static destroyWaterSurface(waterData) {
        if (!waterData) {
            return;
        }
        if (waterData.graphics && waterData.graphics.active) {
            waterData.graphics.destroy();
        }
        if (waterData.waveTween) {
            waterData.waveTween.remove();
        }
        if (waterData.updateEvent) {
            waterData.updateEvent.remove();
        }
        waterData.activeRipples = [];
        waterData.surfacePoints = [];
    }
    
    /**
     * Create underwater bubbles effect
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position (underwater)
     * @param {number} surfaceY - Y position of water surface
     */
    static createBubbles(scene, x, y, surfaceY) {
        const bubbleCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < bubbleCount; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const size = 2 + Math.random() * 3;
            
            const bubble = scene.add.circle(x + offsetX, y, size, 0x88ccff, 0.6);
            bubble.setStrokeStyle(1, 0xaaddff, 0.8);
            
            // Float to surface
            scene.tweens.add({
                targets: bubble,
                y: surfaceY,
                x: x + offsetX + (Math.random() - 0.5) * 30,
                alpha: 0,
                duration: 1500 + Math.random() * 1000,
                ease: 'Sine.easeOut',
                onComplete: () => bubble.destroy()
            });
        }
    }
    
    /**
     * Create a waterfall effect
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} startY - Top of waterfall
     * @param {number} endY - Bottom of waterfall
     * @param {number} width - Width of waterfall
     * @returns {object} Waterfall effect object
     */
    static createWaterfall(scene, x, startY, endY, width = 20) {
        const container = scene.add.container(x, startY);
        const height = endY - startY;
        
        // Create waterfall stream
        const stream = scene.add.graphics();
        stream.fillStyle(0x6bb6ff, 0.7);
        stream.fillRect(0, 0, width, height);
        
        // Add highlights
        stream.fillStyle(0xaaddff, 0.4);
        stream.fillRect(0, 0, width * 0.3, height);
        
        container.add(stream);
        
        // Animate water droplets falling and store the event for cleanup
        const dropletEvent = scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!container.active) return;
                
                const droplet = scene.add.circle(
                    x + Math.random() * width,
                    startY,
                    2 + Math.random() * 2,
                    0x88ccff,
                    0.8
                );
                
                scene.tweens.add({
                    targets: droplet,
                    y: endY,
                    alpha: 0.3,
                    duration: 800,
                    ease: 'Cubic.easeIn',
                    onComplete: () => {
                        droplet.destroy();
                        // Create splash at bottom
                        this.createSplash(scene, droplet.x, endY, { particleCount: 3, size: 2 });
                    }
                });
            }
        });
        
        return {
            container,
            dropletEvent,
            x, startY, endY, width
        };
    }
}
