import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

export default class ModeSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ModeSelectionScene' });
        this.audioManager = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Initialize AudioManager
        this.audioManager = new AudioManager(this);
        this.audioManager.preloadSounds();

        // Title
        const title = this.add.text(width / 2, height / 4, 'MARIO GAME', {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 3, 'Select Game Mode', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);

        // 1 Player Button
        const onePlayerBtn = this.add.rectangle(width / 2, height / 2, 300, 80, 0x00aa00);
        const onePlayerText = this.add.text(width / 2, height / 2, '1 PLAYER', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        onePlayerText.setOrigin(0.5);

        // 2 Player Button
        const twoPlayerBtn = this.add.rectangle(width / 2, height / 2 + 100, 300, 80, 0x0066cc);
        const twoPlayerText = this.add.text(width / 2, height / 2 + 100, '2 PLAYERS', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        twoPlayerText.setOrigin(0.5);

        // Make buttons interactive
        onePlayerBtn.setInteractive({ useHandCursor: true });
        twoPlayerBtn.setInteractive({ useHandCursor: true });

        // Hover effects for 1 Player
        onePlayerBtn.on('pointerover', () => {
            onePlayerBtn.setFillStyle(0x00ff00);
        });
        onePlayerBtn.on('pointerout', () => {
            onePlayerBtn.setFillStyle(0x00aa00);
        });
        onePlayerBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.registry.set('gameMode', 'single');
            this.scene.start('CharacterSelectionScene');
        });

        // Hover effects for 2 Players
        twoPlayerBtn.on('pointerover', () => {
            twoPlayerBtn.setFillStyle(0x0088ff);
        });
        twoPlayerBtn.on('pointerout', () => {
            twoPlayerBtn.setFillStyle(0x0066cc);
        });
        twoPlayerBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.registry.set('gameMode', 'multiplayer');
            this.scene.start('MultiplayerLobbyScene');
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 50, 'Click to select game mode', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        instructions.setOrigin(0.5);
    }
}
