import Phaser from 'phaser';

export default class OnlineMultiplayerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OnlineMultiplayerScene' });
        this.gameCode = '';
        this.isCreatingRoom = true;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        const title = this.add.text(width / 2, 60, 'ONLINE MULTIPLAYER', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Info message
        const infoText = this.add.text(width / 2, 140, 
            'Online multiplayer requires a backend server.\nThis feature is under development.', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        infoText.setOrigin(0.5);

        // How it will work section
        const howItWorksTitle = this.add.text(width / 2, 220, 'How It Will Work:', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        howItWorksTitle.setOrigin(0.5);

        const steps = [
            '1. Player 1 creates a game room and gets a unique code',
            '2. Player 2 joins using the game code in a different browser',
            '3. Both players select their characters',
            '4. Game starts with synchronized state',
            '5. Each player controls their own character',
            '6. Real-time position and action sync via WebSocket'
        ];

        let yOffset = 280;
        steps.forEach(step => {
            const stepText = this.add.text(width / 2, yOffset, step, {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });
            stepText.setOrigin(0.5);
            yOffset += 30;
        });

        // Technical requirements
        const techTitle = this.add.text(width / 2, yOffset + 20, 'Technical Requirements:', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff9900',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        techTitle.setOrigin(0.5);

        const techText = this.add.text(width / 2, yOffset + 60, 
            '• WebSocket server (Socket.IO or similar)\n' +
            '• Backend API for room management\n' +
            '• State synchronization logic\n' +
            '• Lag compensation and prediction', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        techText.setOrigin(0.5);

        // Back button
        const backButton = this.add.rectangle(width / 2, height - 60, 200, 50, 0x3366cc);
        backButton.setStrokeStyle(3, 0xffffff);
        backButton.setInteractive({ useHandCursor: true });

        const backText = this.add.text(width / 2, height - 60, '← BACK TO MENU', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        backText.setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x4488ee);
        });

        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x3366cc);
        });

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Note about local multiplayer
        const localNote = this.add.text(width / 2, height - 20, 
            'Try "2 PLAYERS (LOCAL)" for same-device multiplayer!', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        });
        localNote.setOrigin(0.5);
    }
}
