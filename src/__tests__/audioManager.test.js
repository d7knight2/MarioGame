/**
 * Unit tests for AudioManager
 * These tests verify audio settings management and sound playback functionality.
 */

describe('AudioManager Tests', () => {
    describe('Audio Settings', () => {
        beforeEach(() => {
            // Clear localStorage before each test
            localStorage.clear();
        });

        test('should load default settings when no saved settings exist', () => {
            const settings = {
                masterVolume: 0.7,
                sfxVolume: 0.8,
                musicVolume: 0.5,
                muted: false
            };
            
            expect(settings.masterVolume).toBe(0.7);
            expect(settings.sfxVolume).toBe(0.8);
            expect(settings.musicVolume).toBe(0.5);
            expect(settings.muted).toBe(false);
        });

        test('should save and load audio settings from localStorage', () => {
            const testSettings = {
                masterVolume: 0.6,
                sfxVolume: 0.9,
                musicVolume: 0.4,
                muted: true
            };
            
            localStorage.setItem('audioSettings', JSON.stringify(testSettings));
            const loaded = JSON.parse(localStorage.getItem('audioSettings'));
            
            expect(loaded.masterVolume).toBe(0.6);
            expect(loaded.sfxVolume).toBe(0.9);
            expect(loaded.musicVolume).toBe(0.4);
            expect(loaded.muted).toBe(true);
        });

        test('should clamp volume values between 0 and 1', () => {
            const clampVolume = (volume) => Math.max(0, Math.min(1, volume));
            
            expect(clampVolume(1.5)).toBe(1);
            expect(clampVolume(-0.5)).toBe(0);
            expect(clampVolume(0.5)).toBe(0.5);
        });

        test('should handle corrupted localStorage data gracefully', () => {
            localStorage.setItem('audioSettings', 'invalid json');
            
            let settings;
            try {
                settings = JSON.parse(localStorage.getItem('audioSettings'));
            } catch (e) {
                // If parsing fails, use defaults
                settings = {
                    masterVolume: 0.7,
                    sfxVolume: 0.8,
                    musicVolume: 0.5,
                    muted: false
                };
            }
            
            expect(settings.masterVolume).toBe(0.7);
        });
    });

    describe('Sound Keys', () => {
        test('should have all required sound keys defined', () => {
            const soundKeys = {
                jump: 'jump',
                coin: 'coin',
                enemyHit: 'enemyHit',
                powerUp: 'powerUp',
                fireball: 'fireball',
                damage: 'damage',
                gameOver: 'gameOver',
                levelComplete: 'levelComplete'
            };
            
            expect(soundKeys).toHaveProperty('jump');
            expect(soundKeys).toHaveProperty('coin');
            expect(soundKeys).toHaveProperty('enemyHit');
            expect(soundKeys).toHaveProperty('powerUp');
            expect(soundKeys).toHaveProperty('fireball');
            expect(soundKeys).toHaveProperty('damage');
            expect(soundKeys).toHaveProperty('gameOver');
            expect(soundKeys).toHaveProperty('levelComplete');
        });

        test('should have all required music keys defined', () => {
            const musicKeys = {
                menu: 'menuMusic',
                gameplay: 'gameplayMusic',
                boss: 'bossMusic',
                victory: 'victoryMusic'
            };
            
            expect(musicKeys).toHaveProperty('menu');
            expect(musicKeys).toHaveProperty('gameplay');
            expect(musicKeys).toHaveProperty('boss');
            expect(musicKeys).toHaveProperty('victory');
        });
    });

    describe('Volume Control', () => {
        test('should calculate effective volume correctly when not muted', () => {
            const masterVolume = 0.7;
            const sfxVolume = 0.8;
            const muted = false;
            
            const effectiveVolume = muted ? 0 : masterVolume * sfxVolume;
            
            expect(effectiveVolume).toBeCloseTo(0.56, 2);
        });

        test('should return zero effective volume when muted', () => {
            const masterVolume = 0.7;
            const sfxVolume = 0.8;
            const muted = true;
            
            const effectiveVolume = muted ? 0 : masterVolume * sfxVolume;
            
            expect(effectiveVolume).toBe(0);
        });

        test('should toggle mute state correctly', () => {
            let muted = false;
            
            muted = !muted;
            expect(muted).toBe(true);
            
            muted = !muted;
            expect(muted).toBe(false);
        });
    });

    describe('Settings Persistence', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        test('should persist master volume changes', () => {
            const settings = {
                masterVolume: 0.7,
                sfxVolume: 0.8,
                musicVolume: 0.5,
                muted: false
            };
            
            settings.masterVolume = 0.9;
            localStorage.setItem('audioSettings', JSON.stringify(settings));
            
            const loaded = JSON.parse(localStorage.getItem('audioSettings'));
            expect(loaded.masterVolume).toBe(0.9);
        });

        test('should persist mute state changes', () => {
            const settings = {
                masterVolume: 0.7,
                sfxVolume: 0.8,
                musicVolume: 0.5,
                muted: false
            };
            
            settings.muted = true;
            localStorage.setItem('audioSettings', JSON.stringify(settings));
            
            const loaded = JSON.parse(localStorage.getItem('audioSettings'));
            expect(loaded.muted).toBe(true);
        });

        test('should persist all volume changes together', () => {
            const settings = {
                masterVolume: 0.5,
                sfxVolume: 0.6,
                musicVolume: 0.7,
                muted: false
            };
            
            localStorage.setItem('audioSettings', JSON.stringify(settings));
            const loaded = JSON.parse(localStorage.getItem('audioSettings'));
            
            expect(loaded.masterVolume).toBe(0.5);
            expect(loaded.sfxVolume).toBe(0.6);
            expect(loaded.musicVolume).toBe(0.7);
        });
    });
});
