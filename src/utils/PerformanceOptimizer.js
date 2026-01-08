/**
 * PerformanceOptimizer - Manages performance optimizations for visual effects
 * Provides object pooling, viewport culling, and adaptive quality scaling
 */

// Device capability thresholds for quality scoring
const CAPABILITY_THRESHOLDS = {
    PIXEL_COUNT_HIGH: 2000000,
    PIXEL_COUNT_MEDIUM: 1000000,
    PIXEL_COUNT_LOW: 500000,
    CPU_CORES_HIGH: 8,
    CPU_CORES_MEDIUM: 4,
    CPU_CORES_LOW: 2,
    SCORE_ADJUSTMENTS: {
        SCREEN_LARGE: 20,
        SCREEN_MEDIUM: 10,
        SCREEN_SMALL: -20,
        CPU_HIGH: 15,
        CPU_MEDIUM: 10,
        CPU_LOW: -15,
        MOBILE_PENALTY: -10
    },
    QUALITY_SCORE_HIGH: 75,
    QUALITY_SCORE_MEDIUM: 50
};

export default class PerformanceOptimizer {
    /**
     * Create an object pool for reusable game objects
     * @param {Phaser.Scene} scene - The scene
     * @param {Function} createFn - Function to create a new object
     * @param {number} initialSize - Initial pool size
     * @returns {object} Object pool manager
     */
    static createObjectPool(scene, createFn, initialSize = 10) {
        const pool = {
            available: [],
            active: [],
            createFn: createFn,
            
            acquire: function() {
                let obj;
                if (this.available.length > 0) {
                    obj = this.available.pop();
                    obj.setActive(true);
                    obj.setVisible(true);
                } else {
                    obj = this.createFn();
                }
                this.active.push(obj);
                return obj;
            },
            
            release: function(obj) {
                const index = this.active.indexOf(obj);
                if (index > -1) {
                    this.active.splice(index, 1);
                    obj.setActive(false);
                    obj.setVisible(false);
                    this.available.push(obj);
                }
            },
            
            releaseAll: function() {
                while (this.active.length > 0) {
                    this.release(this.active[0]);
                }
            },
            
            destroy: function() {
                this.releaseAll();
                this.available.forEach(obj => {
                    if (obj.destroy) obj.destroy();
                });
                this.available = [];
                this.active = [];
            }
        };
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            pool.available.push(createFn());
        }
        
        return pool;
    }
    
    /**
     * Create a particle pool for effects
     * @param {Phaser.Scene} scene - The scene
     * @param {object} config - Particle configuration
     * @returns {object} Particle pool
     */
    static createParticlePool(scene, config = {}) {
        const particleConfig = {
            type: config.type || 'circle',
            size: config.size || 5,
            color: config.color || 0xffffff,
            alpha: config.alpha || 1,
            poolSize: config.poolSize || 50,
            ...config
        };
        
        const createParticle = () => {
            let particle;
            
            if (particleConfig.type === 'circle') {
                particle = scene.add.circle(0, 0, particleConfig.size, particleConfig.color);
            } else if (particleConfig.type === 'rectangle') {
                particle = scene.add.rectangle(0, 0, particleConfig.size, particleConfig.size, particleConfig.color);
            } else if (particleConfig.type === 'star') {
                particle = scene.add.star(0, 0, 5, 3, 6, particleConfig.color);
            }
            
            particle.setActive(false);
            particle.setVisible(false);
            particle.setAlpha(particleConfig.alpha);
            
            if (config.physics) {
                scene.physics.add.existing(particle);
            }
            
            return particle;
        };
        
        return this.createObjectPool(scene, createParticle, particleConfig.poolSize);
    }
    
    /**
     * Check if an object is visible in the camera viewport
     * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera
     * @param {Phaser.GameObjects.GameObject} obj - The object to check
     * @param {number} margin - Extra margin around viewport (default: 100)
     * @returns {boolean} True if object is in viewport
     */
    static isInViewport(camera, obj, margin = 100) {
        const bounds = obj.getBounds ? obj.getBounds() : {
            x: obj.x,
            y: obj.y,
            width: obj.width || 0,
            height: obj.height || 0
        };
        
        return (
            bounds.x + bounds.width >= camera.scrollX - margin &&
            bounds.x <= camera.scrollX + camera.width + margin &&
            bounds.y + bounds.height >= camera.scrollY - margin &&
            bounds.y <= camera.scrollY + camera.height + margin
        );
    }
    
    /**
     * Create a viewport culler that manages object visibility
     * @param {Phaser.Scene} scene - The scene
     * @param {Array|Phaser.GameObjects.Group} objects - Objects to cull
     * @param {object} options - Configuration options
     * @returns {object} Culler manager
     */
    static createViewportCuller(scene, objects, options = {}) {
        const config = {
            margin: options.margin || 100,
            updateInterval: options.updateInterval || 100,
            onCull: options.onCull || null,
            onUncull: options.onUncull || null,
            ...options
        };
        
        const culler = {
            objects: Array.isArray(objects) ? objects : objects.getChildren(),
            config: config,
            updateEvent: null,
            
            update: function() {
                const camera = scene.cameras.main;
                
                this.objects.forEach(obj => {
                    if (!obj || !obj.active) return;
                    
                    const wasVisible = obj.visible;
                    const inViewport = PerformanceOptimizer.isInViewport(camera, obj, this.config.margin);
                    
                    obj.setVisible(inViewport);
                    
                    // Call callbacks if visibility changed
                    if (wasVisible && !inViewport && this.config.onCull) {
                        this.config.onCull(obj);
                    } else if (!wasVisible && inViewport && this.config.onUncull) {
                        this.config.onUncull(obj);
                    }
                });
            },
            
            start: function() {
                if (!this.updateEvent) {
                    this.updateEvent = scene.time.addEvent({
                        delay: this.config.updateInterval,
                        loop: true,
                        callback: () => this.update()
                    });
                }
            },
            
            stop: function() {
                if (this.updateEvent) {
                    this.updateEvent.remove();
                    this.updateEvent = null;
                }
            },
            
            destroy: function() {
                this.stop();
                this.objects = [];
            }
        };
        
        return culler;
    }
    
    /**
     * Detect device capabilities and return recommended quality settings
     * @param {Phaser.Scene} scene - The scene
     * @returns {object} Quality settings
     */
    static detectDeviceCapabilities(scene) {
        // Get screen resolution
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const pixelCount = screenWidth * screenHeight;
        
        // Detect mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Detect hardware concurrency (CPU cores)
        const cpuCores = navigator.hardwareConcurrency || 2;
        
        // Calculate quality score (0-100)
        let qualityScore = 50;
        
        // Adjust for screen size
        if (pixelCount > CAPABILITY_THRESHOLDS.PIXEL_COUNT_HIGH) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.SCREEN_LARGE;
        } else if (pixelCount > CAPABILITY_THRESHOLDS.PIXEL_COUNT_MEDIUM) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.SCREEN_MEDIUM;
        } else if (pixelCount < CAPABILITY_THRESHOLDS.PIXEL_COUNT_LOW) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.SCREEN_SMALL;
        }
        
        // Adjust for CPU
        if (cpuCores >= CAPABILITY_THRESHOLDS.CPU_CORES_HIGH) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.CPU_HIGH;
        } else if (cpuCores >= CAPABILITY_THRESHOLDS.CPU_CORES_MEDIUM) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.CPU_MEDIUM;
        } else if (cpuCores <= CAPABILITY_THRESHOLDS.CPU_CORES_LOW) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.CPU_LOW;
        }
        
        // Adjust for mobile
        if (isMobile) {
            qualityScore += CAPABILITY_THRESHOLDS.SCORE_ADJUSTMENTS.MOBILE_PENALTY;
        }
        
        // Clamp score
        qualityScore = Math.max(0, Math.min(100, qualityScore));
        
        // Determine quality level
        let qualityLevel;
        if (qualityScore >= CAPABILITY_THRESHOLDS.QUALITY_SCORE_HIGH) {
            qualityLevel = 'high';
        } else if (qualityScore >= CAPABILITY_THRESHOLDS.QUALITY_SCORE_MEDIUM) {
            qualityLevel = 'medium';
        } else {
            qualityLevel = 'low';
        }
        
        return {
            qualityScore,
            qualityLevel,
            isMobile,
            screenWidth,
            screenHeight,
            pixelCount,
            cpuCores,
            settings: {
                particleDensity: qualityLevel === 'high' ? 1.0 : qualityLevel === 'medium' ? 0.6 : 0.3,
                effectIntensity: qualityLevel === 'high' ? 1.0 : qualityLevel === 'medium' ? 0.7 : 0.5,
                animationFrameRate: qualityLevel === 'high' ? 60 : qualityLevel === 'medium' ? 30 : 20,
                enableParallax: qualityLevel !== 'low',
                enableShadows: qualityLevel === 'high',
                maxParticles: qualityLevel === 'high' ? 200 : qualityLevel === 'medium' ? 100 : 50,
                viewportCulling: true,
                objectPooling: true
            }
        };
    }
    
    /**
     * Create an adaptive effect manager that scales effects based on performance
     * @param {Phaser.Scene} scene - The scene
     * @param {object} options - Configuration options
     * @returns {object} Adaptive effect manager
     */
    static createAdaptiveEffectManager(scene, options = {}) {
        const capabilities = this.detectDeviceCapabilities(scene);
        
        const manager = {
            capabilities,
            settings: capabilities.settings,
            fpsHistory: [],
            fpsCheckInterval: options.fpsCheckInterval || 2000,
            
            shouldEnableEffect: function(effectCost = 'low') {
                const costs = {
                    low: 0.2,
                    medium: 0.5,
                    high: 1.0
                };
                
                const costValue = costs[effectCost] || costs.medium;
                return this.capabilities.qualityScore / 100 >= costValue;
            },
            
            getParticleCount: function(baseCount) {
                return Math.floor(baseCount * this.settings.particleDensity);
            },
            
            getEffectIntensity: function(baseIntensity = 1.0) {
                return baseIntensity * this.settings.effectIntensity;
            },
            
            startFpsMonitoring: function() {
                scene.time.addEvent({
                    delay: this.fpsCheckInterval,
                    loop: true,
                    callback: () => {
                        const fps = scene.game.loop.actualFps;
                        this.fpsHistory.push(fps);
                        
                        // Keep only last 10 samples
                        if (this.fpsHistory.length > 10) {
                            this.fpsHistory.shift();
                        }
                        
                        // Auto-adjust quality if FPS drops
                        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
                        
                        if (avgFps < 30 && this.capabilities.qualityLevel !== 'low') {
                            if (options && options.debug) {
                                console.log('Performance drop detected, reducing quality');
                            }
                            this._reduceQuality();
                        } else if (avgFps > 55 && this.capabilities.qualityLevel !== 'high') {
                            if (options && options.debug) {
                                console.log('Performance stable, considering quality increase');
                            }
                            // Optionally increase quality if performance is good
                        }
                    }
                });
            },
            
            _reduceQuality: function() {
                if (this.capabilities.qualityLevel === 'high') {
                    this.capabilities.qualityLevel = 'medium';
                    this.settings.particleDensity = 0.6;
                    this.settings.effectIntensity = 0.7;
                } else if (this.capabilities.qualityLevel === 'medium') {
                    this.capabilities.qualityLevel = 'low';
                    this.settings.particleDensity = 0.3;
                    this.settings.effectIntensity = 0.5;
                    this.settings.enableParallax = false;
                }
            }
        };
        
        // Start monitoring if requested
        if (options.autoMonitor) {
            manager.startFpsMonitoring();
        }
        
        return manager;
    }
    
    /**
     * Throttle a function call
     * @param {Function} fn - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(fn, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return fn.apply(this, args);
            }
        };
    }
    
    /**
     * Debounce a function call
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(fn, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }
}
