import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';
import { PLAY_MODES } from '../utils/gameModeUtils.js';

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
        const title = this.add.text(width / 2, height / 5, 'MARIO GAME', {
            fontSize: '56px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 5 + 55, 'Select Game Mode', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);

        const buttonY = [
            height / 2 - 40,
            height / 2 + 60,
            height / 2 + 160
        ];

        // 1 Player Button
        const onePlayerBtn = this.add.rectangle(width / 2, buttonY[0], 300, 70, 0x00aa00);
        const onePlayerText = this.add.text(width / 2, buttonY[0], '1 PLAYER', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        onePlayerText.setOrigin(0.5);

        // 2 Player Button
        const twoPlayerBtn = this.add.rectangle(width / 2, buttonY[1], 300, 70, 0x0066cc);
        const twoPlayerText = this.add.text(width / 2, buttonY[1], '2 PLAYERS', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        twoPlayerText.setOrigin(0.5);

        // Puzzle Mode Button
        const puzzleBtn = this.add.rectangle(width / 2, buttonY[2], 300, 70, 0xaa6600);
        const puzzleText = this.add.text(width / 2, buttonY[2], 'PUZZLE MODE', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        puzzleText.setOrigin(0.5);

        // Make buttons interactive
        onePlayerBtn.setInteractive({ useHandCursor: true });
        twoPlayerBtn.setInteractive({ useHandCursor: true });
        puzzleBtn.setInteractive({ useHandCursor: true });

        const playClick = () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
        };

        // Hover effects for 1 Player
        onePlayerBtn.on('pointerover', () => {
            onePlayerBtn.setFillStyle(0x00ff00);
        });
        onePlayerBtn.on('pointerout', () => {
            onePlayerBtn.setFillStyle(0x00aa00);
        });
        onePlayerBtn.on('pointerdown', () => {
            playClick();
            this.registry.set('gameMode', 'single');
            this.registry.set('playMode', PLAY_MODES.ADVENTURE);
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
            playClick();
            this.registry.set('gameMode', 'multiplayer');
            this.registry.set('playMode', PLAY_MODES.ADVENTURE);
            this.scene.start('MultiplayerLobbyScene');
        });

        // Hover effects for Puzzle
        puzzleBtn.on('pointerover', () => {
            puzzleBtn.setFillStyle(0xdd8800);
        });
        puzzleBtn.on('pointerout', () => {
            puzzleBtn.setFillStyle(0xaa6600);
        });
        puzzleBtn.on('pointerdown', () => {
            playClick();
            this.registry.set('gameMode', 'single');
            this.registry.set('playMode', PLAY_MODES.PUZZLE);
            this.scene.start('CharacterSelectionScene');
        });

        // Instructions
        const instructions = this.add.text(
            width / 2,
            height - 40,
            'Controllers & Joy-Cons: pair via Bluetooth, then press a button in-game',
            {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        instructions.setOrigin(0.5);
    }
}
