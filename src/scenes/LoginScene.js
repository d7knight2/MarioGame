import Phaser from 'phaser';

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' });
        this.username = '';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Check for invite code in URL
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('invite');
        if (inviteCode) {
            // Validate invite code format (6-character alphanumeric)
            if (/^[A-Z0-9]{6}$/i.test(inviteCode)) {
                this.registry.set('pendingInviteCode', inviteCode);
            } else {
                console.warn('Invalid invite code format:', inviteCode);
            }
        }

        // Check if already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.username = savedUser;
            // If there's an invite code, handle it
            if (inviteCode) {
                this.handleInviteCode(inviteCode);
            } else {
                this.scene.start('MenuScene');
            }
            return;
        }

        // Title
        const title = this.add.text(width / 2, 80, 'MARIO GAME', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Login title
        const loginTitle = this.add.text(width / 2, 160, 'Login / Register', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        loginTitle.setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(width / 2, 220, 'Enter your username to continue:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        instructions.setOrigin(0.5);

        // Username display
        const usernameDisplay = this.add.text(width / 2, 280, '', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        usernameDisplay.setOrigin(0.5);

        // Input button
        const inputBtn = this.add.rectangle(width / 2, 350, 200, 50, 0x0066ff);
        const inputText = this.add.text(width / 2, 350, 'Enter Username', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        inputText.setOrigin(0.5);
        inputBtn.setInteractive({ useHandCursor: true });

        inputBtn.on('pointerdown', () => {
            const username = prompt('Enter your username (3-15 characters):');
            if (username && username.trim() && username.trim().length >= 3) {
                this.username = username.trim().substring(0, 15);
                usernameDisplay.setText(this.username);
                continueBtn.setFillStyle(0x00ff00);
                continueText.setText('Continue');
            }
        });

        // Continue button
        const continueBtn = this.add.rectangle(width / 2, 430, 200, 50, 0x666666);
        const continueText = this.add.text(width / 2, 430, 'Enter Username', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        continueText.setOrigin(0.5);
        continueBtn.setInteractive({ useHandCursor: true });

        continueBtn.on('pointerdown', () => {
            if (this.username) {
                // Save user to localStorage
                localStorage.setItem('currentUser', this.username);
                
                // Initialize user data if first time
                const userDataKey = `userData_${this.username}`;
                if (!localStorage.getItem(userDataKey)) {
                    const userData = {
                        username: this.username,
                        friends: [],
                        pendingInvites: [],
                        lastOnline: Date.now()
                    };
                    localStorage.setItem(userDataKey, JSON.stringify(userData));
                }
                
                // Check for pending invite code
                const inviteCode = this.registry.get('pendingInviteCode');
                if (inviteCode) {
                    this.handleInviteCode(inviteCode);
                } else {
                    this.scene.start('MenuScene');
                }
            }
        });

        // Guest mode button
        const guestBtn = this.add.rectangle(width / 2, 510, 200, 40, 0x999999);
        const guestText = this.add.text(width / 2, 510, 'Play as Guest', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        guestText.setOrigin(0.5);
        guestBtn.setInteractive({ useHandCursor: true });

        guestBtn.on('pointerdown', () => {
            this.username = 'Guest' + Math.floor(Math.random() * 10000);
            localStorage.setItem('currentUser', this.username);
            this.scene.start('StartScene');
        });
    }

    handleInviteCode(inviteCode) {
        // Clear the invite from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        this.registry.set('pendingInviteCode', null);
        
        // Set up to join the game
        this.registry.set('gameMode', 'multiplayer');
        this.registry.set('multiplayerRole', 'guest');
        this.registry.set('gameCode', inviteCode);
        
        // Go directly to character selection
        this.scene.start('CharacterSelectionScene');
    }
}
