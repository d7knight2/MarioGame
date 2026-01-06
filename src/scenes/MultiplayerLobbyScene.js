import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

export default class MultiplayerLobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MultiplayerLobbyScene' });
        this.gameCode = null;
        this.isHost = false;
        this.lobbyState = 'initial'; // 'initial', 'hosting', 'joining'
        this.audioManager = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Initialize AudioManager
        this.audioManager = new AudioManager(this);
        this.audioManager.preloadSounds();

        // UI Layout constants for consistent spacing
        const UI_SPACING = {
            titleY: 60,
            hostBtnY: height / 2 - 120,
            joinLabelY: height / 2 + 20,
            codeDisplayY: height / 2 + 100,
            inputOffsetY: height / 2 + 70,
            joinBtnY: height / 2 + 170
            switchBtnY: height / 2 + 155,  // Fixed from height/2 + 120 to prevent overlap with codeDisplay
            statusTextY: height - 100,
            backBtnY: height - 50
        };

        // Title
        this.title = this.add.text(width / 2, UI_SPACING.titleY, 'Multiplayer Lobby', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.title.setOrigin(0.5);
        this.title.setDepth(10);

        // Host Game Button
        this.hostBtn = this.add.rectangle(width / 2, UI_SPACING.hostBtnY, 300, 70, 0x00aa00);
        this.hostText = this.add.text(width / 2, UI_SPACING.hostBtnY, 'HOST GAME', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.hostText.setOrigin(0.5);
        this.hostBtn.setDepth(20);
        this.hostText.setDepth(21);

        this.hostBtn.setInteractive({ useHandCursor: true });
        this.hostBtn.on('pointerover', () => {
            this.hostBtn.setFillStyle(0x00ff00);
        });
        this.hostBtn.on('pointerout', () => {
            this.hostBtn.setFillStyle(0x00aa00);
        });
        this.hostBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.hostGame();
        });

        // Join Game Section
        this.joinLabel = this.add.text(width / 2, UI_SPACING.joinLabelY, 'Or Enter Game Code:', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.joinLabel.setOrigin(0.5);
        this.joinLabel.setDepth(10);

        // Game Code Display (shown when hosting)
        this.codeDisplay = this.add.text(width / 2, UI_SPACING.codeDisplayY, '', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.codeDisplay.setOrigin(0.5);
        this.codeDisplay.setDepth(30);

        // Join Button
        this.joinBtn = this.add.rectangle(width / 2, UI_SPACING.joinBtnY, 200, 60, 0x0066cc);
        this.joinText = this.add.text(width / 2, UI_SPACING.joinBtnY, 'JOIN GAME', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.joinText.setOrigin(0.5);
        this.joinBtn.setDepth(20);
        this.joinText.setDepth(21);

        this.joinBtn.setInteractive({ useHandCursor: true });
        this.joinBtn.on('pointerover', () => {
            this.joinBtn.setFillStyle(0x0088ff);
        });
        this.joinBtn.on('pointerout', () => {
            this.joinBtn.setFillStyle(0x0066cc);
        });
        this.joinBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.joinGame();
        });

        // Switch to Join Button (hidden initially, positioned below code display)
        this.switchToJoinBtn = this.add.rectangle(width / 2, UI_SPACING.switchBtnY, 250, 60, 0xcc6600);
        this.switchToJoinText = this.add.text(width / 2, UI_SPACING.switchBtnY, 'SWITCH TO JOIN', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.switchToJoinText.setOrigin(0.5);
        this.switchToJoinBtn.setVisible(false);
        this.switchToJoinText.setVisible(false);
        this.switchToJoinBtn.setDepth(20);
        this.switchToJoinText.setDepth(21);

        this.switchToJoinBtn.setInteractive({ useHandCursor: true });
        this.switchToJoinBtn.on('pointerover', () => {
            this.switchToJoinBtn.setFillStyle(0xff8800);
        });
        this.switchToJoinBtn.on('pointerout', () => {
            this.switchToJoinBtn.setFillStyle(0xcc6600);
        });
        this.switchToJoinBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.switchToJoinMode();
        });

        // Back button
        this.backBtn = this.add.rectangle(100, UI_SPACING.backBtnY, 150, 50, 0x666666);
        this.backText = this.add.text(100, UI_SPACING.backBtnY, 'BACK', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        this.backText.setOrigin(0.5);
        this.backBtn.setDepth(20);
        this.backText.setDepth(21);

        this.backBtn.setInteractive({ useHandCursor: true });
        this.backBtn.on('pointerover', () => {
            this.backBtn.setFillStyle(0x888888);
        });
        this.backBtn.on('pointerout', () => {
            this.backBtn.setFillStyle(0x666666);
        });
        this.backBtn.on('pointerdown', () => {
            if (this.audioManager) {
                this.audioManager.playSound(this.audioManager.soundKeys.coin, 0.5);
            }
            this.scene.start('ModeSelectionScene');
        });

        // Status text
        this.statusText = this.add.text(width / 2, UI_SPACING.statusTextY, 'Choose to host or join a game', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.statusText.setOrigin(0.5);
        this.statusText.setDepth(10);

        // Store UI spacing for HTML input positioning
        this.uiSpacing = UI_SPACING;

        // Create HTML input for game code
        this.createCodeInput();
    }

    createCodeInput() {
        const input = document.createElement('input');
        input.id = 'game-code-input';
        input.type = 'text';
        input.placeholder = 'Enter 6-digit code';
        input.maxLength = 6;
        
        // Calculate responsive positioning based on game canvas and UI spacing
        const canvas = this.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const height = this.cameras.main.height;
        
        // Position input at the calculated offset (between label and join button)
        const inputYRatio = this.uiSpacing.inputOffsetY / height;
        
        input.style.cssText = `
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: ${canvasRect.top + canvasRect.height * inputYRatio}px;
            width: min(200px, 40vw);
            height: 40px;
            font-size: 24px;
            text-align: center;
            text-transform: uppercase;
            border: 3px solid #ffffff;
            background: rgba(0, 0, 0, 0.7);
            color: #ffff00;
            font-weight: bold;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(input);
        } else {
            document.body.appendChild(input);
        }

        // Update position on window resize
        this.handleResize = () => {
            const rect = canvas.getBoundingClientRect();
            input.style.top = `${rect.top + rect.height * inputYRatio}px`;
        };
        window.addEventListener('resize', this.handleResize);

        // Clean up on scene shutdown or destroy
        const cleanup = () => {
            const existingInput = document.getElementById('game-code-input');
            if (existingInput) {
                existingInput.remove();
            }
            window.removeEventListener('resize', this.handleResize);
        };
        
        this.events.on('shutdown', cleanup);
        this.events.on('destroy', cleanup);
    }

    hostGame() {
        // Generate a robust 6-character game code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
        this.gameCode = Array.from({ length: 6 }, () => 
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        this.isHost = true;
        this.lobbyState = 'hosting';
        
        // Update UI to show hosting lobby
        this.title.setText('Hosting Game');
        this.codeDisplay.setText(`Game Code: ${this.gameCode}`);
        this.statusText.setText('Waiting for player to join...\nShare this code with your friend!');

        // Hide host button and join input/button
        this.hostBtn.setVisible(false);
        this.hostText.setVisible(false);
        this.joinLabel.setVisible(false);
        this.joinBtn.setVisible(false);
        this.joinText.setVisible(false);
        
        // Hide HTML input
        const input = document.getElementById('game-code-input');
        if (input) {
            input.style.display = 'none';
        }

        // Show switch to join button
        this.switchToJoinBtn.setVisible(true);
        this.switchToJoinText.setVisible(true);

        // Store in registry for game synchronization
        this.registry.set('multiplayerRole', 'host');
        this.registry.set('gameCode', this.gameCode);

        // For now, simulate connection - in real implementation would use WebSockets/PeerJS
        // After a moment, allow starting
        this.time.delayedCall(2000, () => {
            this.statusText.setText('Waiting for player...\n(Click to start - multiplayer sync in development)');
            this.input.once('pointerdown', () => {
                this.scene.start('CharacterSelectionScene');
            });
        });
    }

    switchToJoinMode() {
        // Reset state
        this.lobbyState = 'initial';
        this.isHost = false;
        this.gameCode = null;

        // Reset title
        this.title.setText('Multiplayer Lobby');
        
        // Clear code display
        this.codeDisplay.setText('');
        
        // Show host button and join UI
        this.hostBtn.setVisible(true);
        this.hostText.setVisible(true);
        this.joinLabel.setVisible(true);
        this.joinBtn.setVisible(true);
        this.joinText.setVisible(true);
        
        // Show HTML input
        const input = document.getElementById('game-code-input');
        if (input) {
            input.style.display = 'block';
            input.value = '';
        }

        // Hide switch button
        this.switchToJoinBtn.setVisible(false);
        this.switchToJoinText.setVisible(false);

        // Reset status
        this.statusText.setText('Choose to host or join a game');
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
