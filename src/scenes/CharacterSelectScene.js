import Phaser from 'phaser';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
        this.gameMode = null;
        this.player1Character = 'mario';
        this.player2Character = 'luigi';
    }

    init(data) {
        this.gameMode = data.mode || 'single';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        const title = this.add.text(width / 2, 60, 'CHARACTER SELECT', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Player 1 Selection
        const p1Label = this.add.text(width / 4, 120, 
            this.gameMode === 'single' ? 'SELECT CHARACTER' : 'PLAYER 1', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        p1Label.setOrigin(0.5);

        // Create Mario character preview for Player 1
        this.p1MarioPreview = this.createCharacterPreview(width / 4 - 80, 200, 'mario');
        this.p1MarioButton = this.createCharacterButton(width / 4 - 80, 330, 'MARIO', () => {
            this.selectPlayer1Character('mario');
        });

        // Create Luigi character preview for Player 1
        this.p1LuigiPreview = this.createCharacterPreview(width / 4 + 80, 200, 'luigi');
        this.p1LuigiButton = this.createCharacterButton(width / 4 + 80, 330, 'LUIGI', () => {
            this.selectPlayer1Character('luigi');
        });

        // Selection indicator for Player 1
        this.p1Selector = this.add.rectangle(width / 4 - 80, 200, 120, 120);
        this.p1Selector.setStrokeStyle(4, 0xffff00);
        this.p1Selector.setFillStyle(0xffff00, 0.1);

        // Player 2 Selection (only for local multiplayer)
        if (this.gameMode === 'local') {
            const p2Label = this.add.text(3 * width / 4, 120, 'PLAYER 2', {
                fontSize: '24px',
                fontFamily: 'Arial, sans-serif',
                color: '#00ff00',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            });
            p2Label.setOrigin(0.5);

            // Create Mario character preview for Player 2
            this.p2MarioPreview = this.createCharacterPreview(3 * width / 4 - 80, 200, 'mario');
            this.p2MarioButton = this.createCharacterButton(3 * width / 4 - 80, 330, 'MARIO', () => {
                this.selectPlayer2Character('mario');
            });

            // Create Luigi character preview for Player 2
            this.p2LuigiPreview = this.createCharacterPreview(3 * width / 4 + 80, 200, 'luigi');
            this.p2LuigiButton = this.createCharacterButton(3 * width / 4 + 80, 330, 'LUIGI', () => {
                this.selectPlayer2Character('luigi');
            });

            // Selection indicator for Player 2
            this.p2Selector = this.add.rectangle(3 * width / 4 + 80, 200, 120, 120);
            this.p2Selector.setStrokeStyle(4, 0x00ff00);
            this.p2Selector.setFillStyle(0x00ff00, 0.1);
        }

        // Start button
        this.startButton = this.add.rectangle(width / 2, height - 100, 250, 60, 0xff0000);
        this.startButton.setStrokeStyle(3, 0xffffff);
        this.startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(width / 2, height - 100, 'START GAME', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        startText.setOrigin(0.5);

        // Start button effects
        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0xff3333);
            this.tweens.add({
                targets: [this.startButton, startText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0xff0000);
            this.tweens.add({
                targets: [this.startButton, startText],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        this.startButton.on('pointerdown', () => {
            this.startGame();
        });

        // Back button
        const backButton = this.add.text(50, height - 40, '← BACK', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        backButton.on('pointerover', () => {
            backButton.setColor('#ffff00');
        });
        backButton.on('pointerout', () => {
            backButton.setColor('#ffffff');
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 150, 
            this.gameMode === 'single' ? 
            'Player 1: W/A/S/D to move, SHIFT to fire' :
            'Player 1: W/A/S/D, SHIFT | Player 2: Arrow Keys, X', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        instructions.setOrigin(0.5);
    }

    createCharacterPreview(x, y, character) {
        const container = this.add.container(x, y);
        
        if (character === 'mario') {
            // Mario preview - red
            const body = this.add.rectangle(0, 4, 28, 32, 0xff0000);
            const head = this.add.circle(0, -12, 14, 0xffdbac);
            const hat = this.add.ellipse(0, -20, 32, 16, 0xff0000);
            const logo = this.add.text(0, -20, 'M', {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            logo.setOrigin(0.5);
            const overalls = this.add.rectangle(0, 12, 24, 16, 0x0066ff);
            
            container.add([body, head, hat, logo, overalls]);
        } else {
            // Luigi preview - green
            const body = this.add.rectangle(0, 4, 28, 32, 0x00ff00);
            const head = this.add.circle(0, -12, 14, 0xffdbac);
            const hat = this.add.ellipse(0, -20, 32, 16, 0x00ff00);
            const logo = this.add.text(0, -20, 'L', {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            logo.setOrigin(0.5);
            const overalls = this.add.rectangle(0, 12, 24, 16, 0x0066ff);
            
            container.add([body, head, hat, logo, overalls]);
        }
        
        container.setScale(2);
        return container;
    }

    createCharacterButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 100, 40, 0x3366cc);
        button.setStrokeStyle(2, 0xffffff);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0x4488ee);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x3366cc);
        });

        button.on('pointerdown', callback);

        return { button, text: buttonText };
    }

    selectPlayer1Character(character) {
        this.player1Character = character;
        
        // Move selector
        const targetX = character === 'mario' ? 
            this.cameras.main.width / 4 - 80 : 
            this.cameras.main.width / 4 + 80;
        
        this.tweens.add({
            targets: this.p1Selector,
            x: targetX,
            duration: 200,
            ease: 'Cubic.easeOut'
        });
    }

    selectPlayer2Character(character) {
        this.player2Character = character;
        
        // Move selector
        const targetX = character === 'mario' ? 
            3 * this.cameras.main.width / 4 - 80 : 
            3 * this.cameras.main.width / 4 + 80;
        
        this.tweens.add({
            targets: this.p2Selector,
            x: targetX,
            duration: 200,
            ease: 'Cubic.easeOut'
        });
    }

    startGame() {
        // Store selections in registry
        this.registry.set('gameMode', this.gameMode);
        this.registry.set('player1Character', this.player1Character);
        this.registry.set('player2Character', this.player2Character);
        
        // Reset game state
        this.registry.set('currentLevel', 1);
        this.registry.set('score', 0);
        this.registry.set('isPoweredUp', false);
        this.registry.set('hasFirePower', false);
        this.registry.set('isPoweredUp2', false);
        this.registry.set('hasFirePower2', false);
        
        // Start game
        this.scene.start('GameScene');
    }
}
