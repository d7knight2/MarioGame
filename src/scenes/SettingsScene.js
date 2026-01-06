import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.audioManager = null;
        this.sliders = [];
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Initialize AudioManager
        this.audioManager = new AudioManager(this);
        const settings = this.audioManager.getSettings();

        // Background overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

        // Title
        const title = this.add.text(width / 2, 60, 'AUDIO SETTINGS', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Create slider controls
        const sliderY = 150;
        const sliderSpacing = 80;

        // Master Volume
        this.createSlider(width / 2, sliderY, 'Master Volume', settings.masterVolume, (value) => {
            this.audioManager.setMasterVolume(value);
            this.audioManager.playSound('coin'); // Test sound
        });

        // Sound Effects Volume
        this.createSlider(width / 2, sliderY + sliderSpacing, 'Sound Effects', settings.sfxVolume, (value) => {
            this.audioManager.setSfxVolume(value);
            this.audioManager.playSound('jump'); // Test sound
        });

        // Music Volume
        this.createSlider(width / 2, sliderY + sliderSpacing * 2, 'Music Volume', settings.musicVolume, (value) => {
            this.audioManager.setMusicVolume(value);
        });

        // Mute toggle button
        const muteY = sliderY + sliderSpacing * 3 + 20;
        const muteBtn = this.add.rectangle(width / 2, muteY, 200, 50, settings.muted ? 0xcc0000 : 0x00aa00);
        const muteBtnText = this.add.text(width / 2, muteY, settings.muted ? '🔇 UNMUTE' : '🔊 MUTE', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        muteBtnText.setOrigin(0.5);
        muteBtn.setInteractive({ useHandCursor: true });

        muteBtn.on('pointerover', () => {
            muteBtn.setFillStyle(settings.muted ? 0xff0000 : 0x00ff00);
        });
        muteBtn.on('pointerout', () => {
            muteBtn.setFillStyle(settings.muted ? 0xcc0000 : 0x00aa00);
        });
        muteBtn.on('pointerdown', () => {
            const isMuted = this.audioManager.toggleMute();
            muteBtn.setFillStyle(isMuted ? 0xcc0000 : 0x00aa00);
            muteBtnText.setText(isMuted ? '🔇 UNMUTE' : '🔊 MUTE');
            if (!isMuted) {
                this.audioManager.playSound('coin'); // Test sound after unmute
            }
        });

        // Back button
        const backBtn = this.add.rectangle(width / 2, height - 80, 200, 50, 0x666666);
        const backText = this.add.text(width / 2, height - 80, 'BACK', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        backText.setOrigin(0.5);
        backBtn.setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0x888888);
        });
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x666666);
        });
        backBtn.on('pointerdown', () => {
            this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            this.audioManager.cleanup();
            this.scene.start('MenuScene');
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 30, 'Adjust volumes and test with the sliders', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa',
            align: 'center'
        });
        instructions.setOrigin(0.5);
    }

    /**
     * Create a slider control for volume adjustment
     */
    createSlider(x, y, label, initialValue, onChange) {
        // Label
        const labelText = this.add.text(x, y - 25, label, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        labelText.setOrigin(0.5);

        // Slider track
        const trackWidth = 300;
        const trackHeight = 8;
        const track = this.add.rectangle(x, y, trackWidth, trackHeight, 0x555555);

        // Slider fill (shows current value)
        const fill = this.add.rectangle(x - trackWidth / 2, y, trackWidth * initialValue, trackHeight, 0x00aaff);
        fill.setOrigin(0, 0.5);

        // Slider handle
        const handleRadius = 12;
        const handle = this.add.circle(x - trackWidth / 2 + trackWidth * initialValue, y, handleRadius, 0xffffff);
        handle.setStrokeStyle(2, 0x000000);
        handle.setInteractive({ useHandCursor: true, draggable: true });

        // Value text
        const valueText = this.add.text(x + trackWidth / 2 + 40, y, Math.round(initialValue * 100) + '%', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        valueText.setOrigin(0.5);

        // Drag handler
        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject === handle) {
                // Constrain to track bounds
                const minX = x - trackWidth / 2;
                const maxX = x + trackWidth / 2;
                const constrainedX = Math.max(minX, Math.min(maxX, dragX));
                
                handle.x = constrainedX;
                
                // Update fill
                const fillWidth = constrainedX - minX;
                fill.width = fillWidth;
                
                // Calculate value (0-1)
                const value = (constrainedX - minX) / trackWidth;
                valueText.setText(Math.round(value * 100) + '%');
                
                // Call onChange callback
                if (onChange) {
                    onChange(value);
                }
            }
        });

        // Click on track to jump to position
        track.setInteractive({ useHandCursor: true });
        track.on('pointerdown', (pointer) => {
            const localX = pointer.x;
            const minX = x - trackWidth / 2;
            const maxX = x + trackWidth / 2;
            const constrainedX = Math.max(minX, Math.min(maxX, localX));
            
            handle.x = constrainedX;
            
            // Update fill
            const fillWidth = constrainedX - minX;
            fill.width = fillWidth;
            
            // Calculate value (0-1)
            const value = (constrainedX - minX) / trackWidth;
            valueText.setText(Math.round(value * 100) + '%');
            
            // Call onChange callback
            if (onChange) {
                onChange(value);
            }
        });

        this.sliders.push({ track, fill, handle, valueText });
    }
}
