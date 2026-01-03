import Phaser from 'phaser';

export default class MultiplayerLobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MultiplayerLobbyScene' });
        this.gameCode = null;
        this.isHost = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        const title = this.add.text(width / 2, 80, 'Multiplayer Lobby', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Host Game Button
        const hostBtn = this.add.rectangle(width / 2, height / 2 - 80, 300, 70, 0x00aa00);
        const hostText = this.add.text(width / 2, height / 2 - 80, 'HOST GAME', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        hostText.setOrigin(0.5);

        hostBtn.setInteractive({ useHandCursor: true });
        hostBtn.on('pointerover', () => {
            hostBtn.setFillStyle(0x00ff00);
        });
        hostBtn.on('pointerout', () => {
            hostBtn.setFillStyle(0x00aa00);
        });
        hostBtn.on('pointerdown', () => {
            this.hostGame();
        });

        // Join Game Section
        const joinLabel = this.add.text(width / 2, height / 2 + 20, 'Or Enter Game Code:', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        joinLabel.setOrigin(0.5);

        // Game Code Display/Input (we'll use HTML input for this)
        this.codeDisplay = this.add.text(width / 2, height / 2 + 70, '', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.codeDisplay.setOrigin(0.5);

        // Join Button
        const joinBtn = this.add.rectangle(width / 2, height / 2 + 130, 200, 60, 0x0066cc);
        const joinText = this.add.text(width / 2, height / 2 + 130, 'JOIN GAME', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        joinText.setOrigin(0.5);

        joinBtn.setInteractive({ useHandCursor: true });
        joinBtn.on('pointerover', () => {
            joinBtn.setFillStyle(0x0088ff);
        });
        joinBtn.on('pointerout', () => {
            joinBtn.setFillStyle(0x0066cc);
        });
        joinBtn.on('pointerdown', () => {
            this.joinGame();
        });

        // Back button
        const backBtn = this.add.rectangle(100, height - 50, 150, 50, 0x666666);
        const backText = this.add.text(100, height - 50, 'BACK', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
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
            this.scene.start('ModeSelectionScene');
        });

        // Instructions
        this.statusText = this.add.text(width / 2, height - 50, 'Choose to host or join a game', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.statusText.setOrigin(0.5);

        // Create HTML input for game code
        this.createCodeInput();
    }

    createCodeInput() {
        const input = document.createElement('input');
        input.id = 'game-code-input';
        input.type = 'text';
        input.placeholder = 'Enter 6-digit code';
        input.maxLength = 6;
        input.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            margin-top: 70px;
            width: 200px;
            height: 40px;
            font-size: 24px;
            text-align: center;
            text-transform: uppercase;
            border: 3px solid #ffffff;
            background: rgba(0, 0, 0, 0.7);
            color: #ffff00;
            font-weight: bold;
            border-radius: 5px;
        `;
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(input);
        } else {
            document.body.appendChild(input);
        }

        // Clean up on scene shutdown
        this.events.on('shutdown', () => {
            const existingInput = document.getElementById('game-code-input');
            if (existingInput) {
                existingInput.remove();
            }
        });
    }

    hostGame() {
        // Generate a random 6-digit game code
        this.gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.isHost = true;
        
        this.codeDisplay.setText(`Game Code: ${this.gameCode}`);
        this.statusText.setText('Waiting for player to join...\nShare this code with your friend!');

        // Store in registry for game synchronization
        this.registry.set('multiplayerRole', 'host');
        this.registry.set('gameCode', this.gameCode);

        // For now, simulate connection - in real implementation would use WebSockets/PeerJS
        this.statusText.setText('Host mode - code: ' + this.gameCode + '\n(Multiplayer sync requires backend setup)');
        
        // After a moment, allow starting
        this.time.delayedCall(2000, () => {
            this.statusText.setText('Click to start game (multiplayer in development)');
            this.input.once('pointerdown', () => {
                this.scene.start('CharacterSelectionScene');
            });
        });
    }

    joinGame() {
        const input = document.getElementById('game-code-input');
        const code = input ? input.value.toUpperCase() : '';
        
        if (code.length === 6) {
            this.gameCode = code;
            this.isHost = false;
            
            this.statusText.setText('Connecting to game...');
            
            // Store in registry
            this.registry.set('multiplayerRole', 'guest');
            this.registry.set('gameCode', this.gameCode);

            // Simulate connection
            this.time.delayedCall(1500, () => {
                this.statusText.setText('Guest mode - code: ' + this.gameCode + '\n(Multiplayer sync requires backend setup)');
                
                this.time.delayedCall(1500, () => {
                    this.scene.start('CharacterSelectionScene');
                });
            });
        } else {
            this.statusText.setText('Please enter a valid 6-digit game code');
            this.time.delayedCall(2000, () => {
                this.statusText.setText('Choose to host or join a game');
            });
        }
    }
}
