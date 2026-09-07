import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';
import { PLAY_MODES } from '../utils/gameModeUtils.js';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
        this.selectedMode = 1;
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        this.MAX_PLAYER_NAME_LENGTH = 15;
        this.audioManager = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.audioManager = new AudioManager(this);
        this.audioManager.preloadSounds();
        this.game.events.emit('hasFirePower', false);
        // Keep DOM touch pads from covering menu clicks on desktop / narrow Mac windows
        this.game.events.emit('showTouchControls', false);

        const title = this.add.text(width / 2, 50, 'MARIO GAME', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        const modeText = this.add.text(width / 2, 115, 'Select Mode:', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        modeText.setOrigin(0.5);

        const onePlayerBtn = this.add.rectangle(width / 2 - 100, 165, 150, 50, 0x00ff00);
        const onePlayerText = this.add.text(width / 2 - 100, 165, '1 Player', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            fontStyle: 'bold'
        });
        onePlayerText.setOrigin(0.5);
        onePlayerBtn.setInteractive({ useHandCursor: true });

        const twoPlayerBtn = this.add.rectangle(width / 2 + 100, 165, 150, 50, 0xcccccc);
        const twoPlayerText = this.add.text(width / 2 + 100, 165, '2 Players', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            fontStyle: 'bold'
        });
        twoPlayerText.setOrigin(0.5);
        twoPlayerBtn.setInteractive({ useHandCursor: true });

        const namePrompt = this.add.text(width / 2, 230, 'Enter Player Names:', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        namePrompt.setOrigin(0.5);

        this.add.text(width / 2 - 200, 280, 'Player 1:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        const player1NameDisplay = this.add.text(width / 2 + 20, 280, this.player1Name, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        player1NameDisplay.setOrigin(0, 0.5);

        const player1EditBtn = this.add.rectangle(width / 2 + 180, 280, 80, 35, 0x0066ff);
        const player1EditText = this.add.text(width / 2 + 180, 280, 'Edit', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        player1EditText.setOrigin(0.5);
        player1EditBtn.setInteractive({ useHandCursor: true });

        const player2NamePrompt = this.add.text(width / 2 - 200, 330, 'Player 2:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        player2NamePrompt.setOrigin(0, 0.5);
        player2NamePrompt.setAlpha(0.3);

        const player2NameDisplay = this.add.text(width / 2 + 20, 330, this.player2Name, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        player2NameDisplay.setOrigin(0, 0.5);
        player2NameDisplay.setAlpha(0.3);

        const player2EditBtn = this.add.rectangle(width / 2 + 180, 330, 80, 35, 0x0066ff);
        const player2EditText = this.add.text(width / 2 + 180, 330, 'Edit', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        player2EditText.setOrigin(0.5);
        player2EditBtn.setAlpha(0.3);
        player2EditText.setAlpha(0.3);
        // Disabled in 1P so it cannot steal clicks
        player2EditBtn.disableInteractive();

        const playClick = () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
        };

        const setPlayer2Enabled = (enabled) => {
            const alpha = enabled ? 1 : 0.3;
            player2NamePrompt.setAlpha(alpha);
            player2NameDisplay.setAlpha(alpha);
            player2EditBtn.setAlpha(alpha);
            player2EditText.setAlpha(alpha);
            if (enabled) {
                player2EditBtn.setInteractive({ useHandCursor: true });
            } else {
                player2EditBtn.disableInteractive();
            }
        };

        onePlayerBtn.on('pointerup', () => {
            playClick();
            this.selectedMode = 1;
            onePlayerBtn.setFillStyle(0x00ff00);
            twoPlayerBtn.setFillStyle(0xcccccc);
            setPlayer2Enabled(false);
        });

        twoPlayerBtn.on('pointerup', () => {
            playClick();
            this.selectedMode = 2;
            onePlayerBtn.setFillStyle(0xcccccc);
            twoPlayerBtn.setFillStyle(0x00ff00);
            setPlayer2Enabled(true);
        });

        player1EditBtn.on('pointerup', () => {
            playClick();
            this.editPlayerName(1, player1NameDisplay);
        });

        player2EditBtn.on('pointerup', () => {
            if (this.selectedMode !== 2) return;
            playClick();
            this.editPlayerName(2, player2NameDisplay);
        });

        const instructions = this.add.text(width / 2, 390,
            'P1: Arrows + X to fire (1P) or WASD + Shift (2P)\nP2: Arrow Keys + X  |  Controller: A jump, X/B fire\nOr open full menu for Puzzle Mode', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        instructions.setOrigin(0.5);

        // Explicit START button (mouse + touch) — avoids fragile full-scene pointer traps
        const startBtn = this.add.rectangle(width / 2, 470, 280, 64, 0x00aa00);
        const startText = this.add.text(width / 2, 470, 'CLICK TO START', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        });
        startText.setOrigin(0.5);
        startBtn.setInteractive({ useHandCursor: true });
        startBtn.setDepth(10);
        startText.setDepth(11);

        this.tweens.add({
            targets: [startBtn, startText],
            alpha: 0.7,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        startBtn.on('pointerover', () => startBtn.setFillStyle(0x00dd00));
        startBtn.on('pointerout', () => startBtn.setFillStyle(0x00aa00));
        startBtn.on('pointerup', () => this.beginGame());

        const menuBtn = this.add.rectangle(width / 2, 545, 220, 44, 0x0066cc);
        const menuText = this.add.text(width / 2, 545, 'Full Menu / Puzzle', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        menuText.setOrigin(0.5);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x0088ff));
        menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x0066cc));
        menuBtn.on('pointerup', () => {
            playClick();
            this.registry.set('playMode', PLAY_MODES.ADVENTURE);
            this.scene.start('ModeSelectionScene');
        });

        this.input.keyboard.once('keydown-SPACE', () => this.beginGame());
        this.input.keyboard.once('keydown-ENTER', () => this.beginGame());
    }

    editPlayerName(playerNumber, displayText) {
        const current = playerNumber === 1 ? this.player1Name : this.player2Name;
        let name = null;
        try {
            name = window.prompt(`Enter name for Player ${playerNumber}:`, current);
        } catch {
            name = null;
        }
        if (name && name.trim()) {
            const trimmed = name.trim().substring(0, this.MAX_PLAYER_NAME_LENGTH);
            if (playerNumber === 1) {
                this.player1Name = trimmed;
            } else {
                this.player2Name = trimmed;
            }
            displayText.setText(trimmed);
        }
    }

    beginGame() {
        if (this.audioManager) {
            this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
        }
        this.registry.set('gameMode', this.selectedMode);
        this.registry.set('playMode', PLAY_MODES.ADVENTURE);
        this.registry.set('player1Name', this.player1Name);
        this.registry.set('player2Name', this.player2Name);
        this.registry.set('selectedCharacter', this.registry.get('selectedCharacter') || 'mario');
        this.registry.set('currentLevel', 1);
        this.registry.set('score', 0);
        this.scene.start('GameScene');
    }
}
