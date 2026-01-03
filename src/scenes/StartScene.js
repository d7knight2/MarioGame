import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
        this.selectedMode = 1; // Default to 1-player
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        this.MAX_PLAYER_NAME_LENGTH = 15;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Hide fire button when returning to start screen
        this.game.events.emit('hasFirePower', false);

        // Title
        const title = this.add.text(width / 2, 60, 'MARIO GAME', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Mode selection
        const modeText = this.add.text(width / 2, 140, 'Select Mode:', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        modeText.setOrigin(0.5);

        // 1-Player button
        const onePlayerBtn = this.add.rectangle(width / 2 - 100, 190, 150, 50, 0x00ff00);
        const onePlayerText = this.add.text(width / 2 - 100, 190, '1 Player', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            fontStyle: 'bold'
        });
        onePlayerText.setOrigin(0.5);
        onePlayerBtn.setInteractive({ useHandCursor: true });
        
        // 2-Player button
        const twoPlayerBtn = this.add.rectangle(width / 2 + 100, 190, 150, 50, 0xcccccc);
        const twoPlayerText = this.add.text(width / 2 + 100, 190, '2 Players', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            fontStyle: 'bold'
        });
        twoPlayerText.setOrigin(0.5);
        twoPlayerBtn.setInteractive({ useHandCursor: true });

        // Mode button handlers
        onePlayerBtn.on('pointerdown', () => {
            this.selectedMode = 1;
            onePlayerBtn.setFillStyle(0x00ff00);
            twoPlayerBtn.setFillStyle(0xcccccc);
            player2NamePrompt.setAlpha(0.3);
            player2NameDisplay.setAlpha(0.3);
        });

        twoPlayerBtn.on('pointerdown', () => {
            this.selectedMode = 2;
            onePlayerBtn.setFillStyle(0xcccccc);
            twoPlayerBtn.setFillStyle(0x00ff00);
            player2NamePrompt.setAlpha(1);
            player2NameDisplay.setAlpha(1);
        });

        // Player name inputs
        const namePrompt = this.add.text(width / 2, 260, 'Enter Player Names:', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        namePrompt.setOrigin(0.5);

        // Player 1 name
        const player1NamePrompt = this.add.text(width / 2 - 200, 310, 'Player 1:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        player1NamePrompt.setOrigin(0, 0.5);

        const player1NameDisplay = this.add.text(width / 2 + 20, 310, this.player1Name, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        player1NameDisplay.setOrigin(0, 0.5);

        const player1EditBtn = this.add.rectangle(width / 2 + 180, 310, 80, 35, 0x0066ff);
        const player1EditText = this.add.text(width / 2 + 180, 310, 'Edit', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        player1EditText.setOrigin(0.5);
        player1EditBtn.setInteractive({ useHandCursor: true });

        // Player 2 name
        const player2NamePrompt = this.add.text(width / 2 - 200, 360, 'Player 2:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        player2NamePrompt.setOrigin(0, 0.5);
        player2NamePrompt.setAlpha(0.3); // Dimmed by default (1-player mode)

        const player2NameDisplay = this.add.text(width / 2 + 20, 360, this.player2Name, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        player2NameDisplay.setOrigin(0, 0.5);
        player2NameDisplay.setAlpha(0.3); // Dimmed by default

        const player2EditBtn = this.add.rectangle(width / 2 + 180, 360, 80, 35, 0x0066ff);
        const player2EditText = this.add.text(width / 2 + 180, 360, 'Edit', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        player2EditText.setOrigin(0.5);
        player2EditBtn.setInteractive({ useHandCursor: true });
        player2EditBtn.setAlpha(0.3); // Dimmed by default
        player2EditText.setAlpha(0.3); // Dimmed by default

        // Edit button handlers
        player1EditBtn.on('pointerdown', () => {
            const name = prompt('Enter name for Player 1:', this.player1Name);
            if (name && name.trim()) {
                this.player1Name = name.trim().substring(0, this.MAX_PLAYER_NAME_LENGTH);
                player1NameDisplay.setText(this.player1Name);
            }
        });

        player2EditBtn.on('pointerdown', () => {
            if (this.selectedMode === 2) {
                const name = prompt('Enter name for Player 2:', this.player2Name);
                if (name && name.trim()) {
                    this.player2Name = name.trim().substring(0, this.MAX_PLAYER_NAME_LENGTH);
                    player2NameDisplay.setText(this.player2Name);
                }
            }
        });

        // Instructions
        const instructions = this.add.text(width / 2, 440, 
            'P1: W/A/S/D + Shift to fire  |  P2: Arrow Keys + X to fire\nMobile: Use touch buttons (controls P2)', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        instructions.setOrigin(0.5);

        // Start button text
        const startText = this.add.text(width / 2, 520, 'TAP TO START', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        startText.setOrigin(0.5);

        // Blinking animation
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Start game on click or tap
        this.input.on('pointerdown', (pointer) => {
            // Check if click is on UI elements
            if (onePlayerBtn.getBounds().contains(pointer.x, pointer.y) ||
                twoPlayerBtn.getBounds().contains(pointer.x, pointer.y) ||
                player1EditBtn.getBounds().contains(pointer.x, pointer.y) ||
                (this.selectedMode === 2 && player2EditBtn.getBounds().contains(pointer.x, pointer.y))) {
                return; // Don't start game if clicking on buttons
            }
            
            // Store game mode and names in registry
            this.registry.set('gameMode', this.selectedMode);
            this.registry.set('player1Name', this.player1Name);
            this.registry.set('player2Name', this.player2Name);
            this.scene.start('GameScene');
        });

        // Also start on spacebar
        this.input.keyboard.once('keydown-SPACE', () => {
            this.registry.set('gameMode', this.selectedMode);
            this.registry.set('player1Name', this.player1Name);
            this.registry.set('player2Name', this.player2Name);
            this.scene.start('GameScene');
        });
    }
}
