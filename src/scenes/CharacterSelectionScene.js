import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

export default class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectionScene' });
        this.selectedCharacter = 'mario';
        this.audioManager = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Initialize AudioManager
        this.audioManager = new AudioManager(this);
        this.audioManager.preloadSounds();

        // Title
        const title = this.add.text(width / 2, 80, 'Select Your Character', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Character options
        const characters = [
            { name: 'mario', label: 'Mario', color: 0xff0000, x: width / 4 },
            { name: 'luigi', label: 'Luigi', color: 0x00ff00, x: width / 2 },
            { name: 'toad', label: 'Toad', color: 0xff69b4, x: 3 * width / 4 }
        ];

        this.characterButtons = [];

        characters.forEach(char => {
            // Character preview (simple colored circle for now)
            const preview = this.add.circle(char.x, height / 2 - 50, 60, char.color);
            preview.setStrokeStyle(4, 0xffffff);

            // Character name
            const nameText = this.add.text(char.x, height / 2 + 40, char.label, {
                fontSize: '28px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            });
            nameText.setOrigin(0.5);

            // Selection button
            const button = this.add.rectangle(char.x, height / 2 + 100, 120, 50, 0x666666);
            const buttonText = this.add.text(char.x, height / 2 + 100, 'Select', {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff'
            });
            buttonText.setOrigin(0.5);

            button.setInteractive({ useHandCursor: true });
            button.charName = char.name;

            // Hover effects
            button.on('pointerover', () => {
                button.setFillStyle(0x888888);
            });
            button.on('pointerout', () => {
                if (this.selectedCharacter !== button.charName) {
                    button.setFillStyle(0x666666);
                }
            });
            button.on('pointerdown', () => {
                if (this.audioManager) {
                    this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
                }
                this.selectCharacter(button.charName);
            });

            this.characterButtons.push({ button, preview, char });
        });

        // Start button
        this.startBtn = this.add.rectangle(width / 2, height - 100, 200, 60, 0x00aa00);
        this.startText = this.add.text(width / 2, height - 100, 'START GAME', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.startText.setOrigin(0.5);

        this.startBtn.setInteractive({ useHandCursor: true });
        this.startBtn.on('pointerover', () => {
            this.startBtn.setFillStyle(0x00ff00);
        });
        this.startBtn.on('pointerout', () => {
            this.startBtn.setFillStyle(0x00aa00);
        });
        this.startBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.startGame();
        });

        // Set Mario as default selected
        this.selectCharacter('mario');
    }

    selectCharacter(charName) {
        this.selectedCharacter = charName;
        
        // Update button visuals
        this.characterButtons.forEach(({ button, preview }) => {
            if (button.charName === charName) {
                button.setFillStyle(0xffff00);
                preview.setScale(1.2);
            } else {
                button.setFillStyle(0x666666);
                preview.setScale(1.0);
            }
        });
    }

    startGame() {
        // Store selected character in registry
        this.registry.set('selectedCharacter', this.selectedCharacter);
        
        // Check game mode
        const gameMode = this.registry.get('gameMode') || 'single';
        
        // Start game for both single and multiplayer modes
        this.registry.set('currentLevel', 1);
        this.registry.set('score', 0);
        this.scene.start('GameScene');
    }
}
