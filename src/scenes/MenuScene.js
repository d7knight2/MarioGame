import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedMode = null; // 'single', 'local', 'online'
        this.player1Character = 'mario'; // 'mario' or 'luigi'
        this.player2Character = 'luigi'; // 'mario' or 'luigi'
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Hide fire button on menu
        this.game.events.emit('hasFirePower', false);

        // Title
        const title = this.add.text(width / 2, 80, 'MARIO GAME', {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, 140, 'Select Game Mode', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);

        // Mode selection buttons
        this.createModeButton(width / 2, 220, '1 PLAYER', 'single');
        this.createModeButton(width / 2, 290, '2 PLAYERS (LOCAL)', 'local');
        this.createModeButton(width / 2, 360, '2 PLAYERS (ONLINE)', 'online');

        // Instructions at bottom
        const instructions = this.add.text(width / 2, height - 40, 
            'Select a mode to continue', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        instructions.setOrigin(0.5);
    }

    createModeButton(x, y, text, mode) {
        // Button background
        const button = this.add.rectangle(x, y, 350, 50, 0x3366cc);
        button.setStrokeStyle(3, 0xffffff);
        button.setInteractive({ useHandCursor: true });

        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        // Hover effect
        button.on('pointerover', () => {
            button.setFillStyle(0x4488ee);
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x3366cc);
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        // Click handler
        button.on('pointerdown', () => {
            this.selectedMode = mode;
            
            if (mode === 'online') {
                // Show online multiplayer screen
                this.scene.start('OnlineMultiplayerScene');
            } else {
                // Show character selection
                this.scene.start('CharacterSelectScene', { mode: mode });
            }
        });
    }
}
