/**
 * AudioManager - Handles all audio operations in the game
 * Manages sound effects, background music, and audio settings
 */
export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        
        // Load audio settings from localStorage
        this.settings = this.loadSettings();
    }

    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('audioSettings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (e) {
                console.error('Failed to parse audio settings:', e);
            }
        }
        
        // Default settings
        return {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5,
            muted: false
        };
    }

    /**
     * Save audio settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('audioSettings', JSON.stringify(this.settings));
    }

    /**
     * Update audio settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Apply new settings to all active sounds
        this.applyVolumeSettings();
    }

    /**
     * Apply volume settings to all sounds
     */
    applyVolumeSettings() {
        const effectiveVolume = this.settings.muted ? 0 : this.settings.masterVolume;
        
        // Update all sound effects
        Object.values(this.sounds).forEach(sound => {
            if (sound && !sound.pendingRemove) {
                sound.setVolume(effectiveVolume * this.settings.sfxVolume);
            }
        });
        
        // Update all music
        Object.values(this.music).forEach(music => {
            if (music && !music.pendingRemove) {
                music.setVolume(effectiveVolume * this.settings.musicVolume);
            }
        });
        
        // Update currently playing music
        if (this.currentMusic && !this.currentMusic.pendingRemove) {
            this.currentMusic.setVolume(effectiveVolume * this.settings.musicVolume);
        }
    }

    /**
     * Create sound effects using Web Audio API (placeholder beeps/tones)
     * In a production environment, these would be replaced with actual audio files
     */
    preloadSounds() {
        // Note: Phaser's sound system will handle the actual audio creation
        // We'll use Phaser's built-in sound generator for simple tones
        
        // These are just keys - actual sounds will be created when needed
        this.soundKeys = {
            jump: 'jump',
            coin: 'coin',
            enemyHit: 'enemyHit',
            powerUp: 'powerUp',
            fireball: 'fireball',
            damage: 'damage',
            gameOver: 'gameOver',
            levelComplete: 'levelComplete'
        };
        
        this.musicKeys = {
            menu: 'menuMusic',
            gameplay: 'gameplayMusic',
            boss: 'bossMusic',
            victory: 'victoryMusic'
        };
    }

    /**
     * Create a simple beep sound using Web Audio API
     * This is a fallback for when no audio assets are available
     */
    createBeepSound(frequency, duration, type = 'sine') {
        if (!this.scene.game.sound || !this.scene.game.sound.context) {
            return null;
        }

        try {
            const context = this.scene.game.sound.context;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            const now = context.currentTime;
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            return true;
        } catch (e) {
            console.warn('Failed to create beep sound:', e);
            return null;
        }
    }

    /**
     * Play a sound effect
     */
    playSound(soundKey, volume = 1.0) {
        if (this.settings.muted) return;
        
        const effectiveVolume = this.settings.masterVolume * this.settings.sfxVolume * volume;
        
        // Create simple procedural sounds based on the sound key
        // These are temporary placeholders that work without audio files
        switch (soundKey) {
            case this.soundKeys.jump:
                this.createBeepSound(400, 0.1, 'sine');
                break;
            case this.soundKeys.coin:
                this.createBeepSound(800, 0.15, 'sine');
                setTimeout(() => this.createBeepSound(1000, 0.1, 'sine'), 50);
                break;
            case this.soundKeys.enemyHit:
                this.createBeepSound(200, 0.2, 'sawtooth');
                break;
            case this.soundKeys.powerUp:
                this.createBeepSound(600, 0.1, 'sine');
                setTimeout(() => this.createBeepSound(800, 0.1, 'sine'), 80);
                setTimeout(() => this.createBeepSound(1000, 0.15, 'sine'), 160);
                break;
            case this.soundKeys.fireball:
                this.createBeepSound(300, 0.15, 'triangle');
                break;
            case this.soundKeys.damage:
                this.createBeepSound(150, 0.3, 'sawtooth');
                break;
            case this.soundKeys.gameOver:
                this.createBeepSound(300, 0.2, 'square');
                setTimeout(() => this.createBeepSound(200, 0.3, 'square'), 200);
                break;
            case this.soundKeys.levelComplete:
                this.createBeepSound(600, 0.15, 'sine');
                setTimeout(() => this.createBeepSound(700, 0.15, 'sine'), 100);
                setTimeout(() => this.createBeepSound(800, 0.15, 'sine'), 200);
                setTimeout(() => this.createBeepSound(1000, 0.25, 'sine'), 300);
                break;
            default:
                console.warn('Unknown sound key:', soundKey);
        }
    }

    /**
     * Play background music
     */
    playMusic(musicKey, loop = true) {
        if (this.settings.muted) return;
        
        // Stop current music if playing
        if (this.currentMusic) {
            this.stopMusic();
        }
        
        // For now, we'll skip background music since it requires actual audio files
        // The infrastructure is in place for when audio files are added
        console.log(`Background music requested: ${musicKey} (not implemented - requires audio files)`);
        
        // In a real implementation with audio files:
        // this.currentMusic = this.scene.sound.add(musicKey, {
        //     loop: loop,
        //     volume: this.settings.masterVolume * this.settings.musicVolume
        // });
        // this.currentMusic.play();
    }

    /**
     * Stop current background music
     */
    stopMusic() {
        if (this.currentMusic && !this.currentMusic.pendingRemove) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    /**
     * Pause current background music
     */
    pauseMusic() {
        if (this.currentMusic && !this.currentMusic.pendingRemove) {
            this.currentMusic.pause();
        }
    }

    /**
     * Resume paused background music
     */
    resumeMusic() {
        if (this.currentMusic && !this.currentMusic.pendingRemove) {
            this.currentMusic.resume();
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.settings.muted = !this.settings.muted;
        this.saveSettings();
        this.applyVolumeSettings();
        return this.settings.muted;
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.applyVolumeSettings();
    }

    /**
     * Set sound effects volume (0-1)
     */
    setSfxVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.applyVolumeSettings();
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.applyVolumeSettings();
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Cleanup - stop all sounds and music
     */
    cleanup() {
        this.stopMusic();
        
        // Clean up sound references
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
    }
}
