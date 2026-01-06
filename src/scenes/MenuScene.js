import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.username = '';
        this.friends = [];
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get current user
        this.username = localStorage.getItem('currentUser') || 'Guest';
        
        // Load user data
        this.loadUserData();

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

        // Welcome message with username
        const welcome = this.add.text(width / 2, 120, `Welcome, ${this.username}!`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        welcome.setOrigin(0.5);

        // Play button
        const playBtn = this.add.rectangle(width / 2, 200, 300, 60, 0x00aa00);
        const playText = this.add.text(width / 2, 200, 'PLAY GAME', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        playText.setOrigin(0.5);
        playBtn.setInteractive({ useHandCursor: true });

        playBtn.on('pointerover', () => {
            playBtn.setFillStyle(0x00ff00);
        });
        playBtn.on('pointerout', () => {
            playBtn.setFillStyle(0x00aa00);
        });
        playBtn.on('pointerdown', () => {
            this.scene.start('ModeSelectionScene');
        });

        // Friends button
        const friendsBtn = this.add.rectangle(width / 2 - 110, 290, 200, 50, 0x0066cc);
        const friendsText = this.add.text(width / 2 - 110, 290, '👥 Friends', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        friendsText.setOrigin(0.5);
        friendsBtn.setInteractive({ useHandCursor: true });

        friendsBtn.on('pointerover', () => {
            friendsBtn.setFillStyle(0x0088ff);
        });
        friendsBtn.on('pointerout', () => {
            friendsBtn.setFillStyle(0x0066cc);
        });
        friendsBtn.on('pointerdown', () => {
            this.scene.start('FriendsScene');
        });

        // Invite button
        const inviteBtn = this.add.rectangle(width / 2 + 110, 290, 200, 50, 0xff6600);
        const inviteText = this.add.text(width / 2 + 110, 290, '📧 Invite', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        inviteText.setOrigin(0.5);
        inviteBtn.setInteractive({ useHandCursor: true });

        inviteBtn.on('pointerover', () => {
            inviteBtn.setFillStyle(0xff8833);
        });
        inviteBtn.on('pointerout', () => {
            inviteBtn.setFillStyle(0xff6600);
        });
        inviteBtn.on('pointerdown', () => {
            this.showInviteModal();
        });

        // Check for pending invites
        this.checkPendingInvites();

        // Notifications area
        this.notificationText = this.add.text(width / 2, 370, '', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.notificationText.setOrigin(0.5);

        // Online friends section
        const onlineLabel = this.add.text(width / 2, 420, 'Online Friends:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        onlineLabel.setOrigin(0.5);

        this.onlineFriendsText = this.add.text(width / 2, 460, this.getOnlineFriendsText(), {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.onlineFriendsText.setOrigin(0.5);

        // Logout button
        const logoutBtn = this.add.rectangle(100, height - 40, 150, 40, 0x666666);
        const logoutText = this.add.text(100, height - 40, 'Logout', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        logoutText.setOrigin(0.5);
        logoutBtn.setInteractive({ useHandCursor: true });

        logoutBtn.on('pointerover', () => {
            logoutBtn.setFillStyle(0x888888);
        });
        logoutBtn.on('pointerout', () => {
            logoutBtn.setFillStyle(0x666666);
        });
        logoutBtn.on('pointerdown', () => {
            localStorage.removeItem('currentUser');
            this.scene.start('LoginScene');
        });

        // Settings button
        const settingsBtn = this.add.rectangle(width - 100, height - 40, 150, 40, 0x444444);
        const settingsText = this.add.text(width - 100, height - 40, '⚙️ Settings', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        settingsText.setOrigin(0.5);
        settingsBtn.setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerover', () => {
            settingsBtn.setFillStyle(0x666666);
        });
        settingsBtn.on('pointerout', () => {
            settingsBtn.setFillStyle(0x444444);
        });
        settingsBtn.on('pointerdown', () => {
            this.scene.start('SettingsScene');
        });
    }

    loadUserData() {
        const userDataKey = `userData_${this.username}`;
        const userData = localStorage.getItem(userDataKey);
        if (userData) {
            try {
                const data = JSON.parse(userData);
                this.friends = Array.isArray(data.friends) ? data.friends : [];
            } catch (e) {
                console.error('Failed to parse user data:', e);
                this.friends = [];
            }
        }
    }

    checkPendingInvites() {
        const userDataKey = `userData_${this.username}`;
        const userData = localStorage.getItem(userDataKey);
        if (userData) {
            try {
                const data = JSON.parse(userData);
                if (data.pendingInvites && Array.isArray(data.pendingInvites) && data.pendingInvites.length > 0) {
                    const invite = data.pendingInvites[0];
                    if (invite && invite.from && invite.code) {
                        this.notificationText.setText(`🔔 ${invite.from} invited you to play!\nClick to accept`);
                        this.notificationText.setInteractive({ useHandCursor: true });
                        this.notificationText.on('pointerdown', () => {
                            this.acceptInvite(invite);
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }

    acceptInvite(invite) {
        // Remove invite from pending
        const userDataKey = `userData_${this.username}`;
        try {
            const userData = JSON.parse(localStorage.getItem(userDataKey) || '{}');
            userData.pendingInvites = (userData.pendingInvites || []).filter(i => i.code !== invite.code);
            localStorage.setItem(userDataKey, JSON.stringify(userData));
        } catch (e) {
            console.error('Failed to update user data:', e);
        }

        // Join the game with the invite code
        this.registry.set('gameMode', 'multiplayer');
        this.registry.set('multiplayerRole', 'guest');
        this.registry.set('gameCode', invite.code);
        this.scene.start('CharacterSelectionScene');
    }

    getOnlineFriendsText() {
        if (this.friends.length === 0) {
            return 'No friends yet. Add friends to see them here!';
        }
        
        // Simulate online status (in real app, would check server)
        const onlineFriends = this.friends.filter(() => Math.random() > 0.5);
        
        if (onlineFriends.length === 0) {
            return 'No friends online';
        }
        
        return onlineFriends.slice(0, 3).join(', ') + 
               (onlineFriends.length > 3 ? ` +${onlineFriends.length - 3} more` : '');
    }

    showInviteModal() {
        // Create a semi-transparent overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        overlay.setInteractive();

        // Modal background
        const modal = this.add.rectangle(400, 300, 600, 400, 0x333333);
        modal.setStrokeStyle(4, 0xffffff);

        // Modal title
        const modalTitle = this.add.text(400, 150, 'Invite Friends to Play', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        modalTitle.setOrigin(0.5);

        // Generate invite link/code
        const inviteCode = this.generateInviteCode();
        const inviteLink = `${window.location.origin}?invite=${inviteCode}`;

        // Display invite link
        const linkText = this.add.text(400, 220, 'Share this link:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        linkText.setOrigin(0.5);

        const linkDisplay = this.add.text(400, 260, inviteLink, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        linkDisplay.setOrigin(0.5);

        // Copy button
        const copyBtn = this.add.rectangle(400, 320, 200, 50, 0x0066cc);
        const copyText = this.add.text(400, 320, 'Copy Link', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        copyText.setOrigin(0.5);
        copyBtn.setInteractive({ useHandCursor: true });

        copyBtn.on('pointerdown', () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(inviteLink).then(() => {
                    copyText.setText('✓ Copied!');
                    this.time.delayedCall(2000, () => {
                        copyText.setText('Copy Link');
                    });
                }).catch((err) => {
                    console.error('Failed to copy:', err);
                    copyText.setText('Copy failed');
                    this.time.delayedCall(2000, () => {
                        copyText.setText('Copy Link');
                    });
                });
            } else {
                // Fallback for browsers without clipboard API
                alert('Copy this link: ' + inviteLink);
            }
        });

        // Invite specific friend
        const inviteFriendText = this.add.text(400, 380, 'Or invite a friend:', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        inviteFriendText.setOrigin(0.5);

        const inviteFriendBtn = this.add.rectangle(400, 420, 200, 45, 0xff6600);
        const inviteFriendBtnText = this.add.text(400, 420, 'Select Friend', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        inviteFriendBtnText.setOrigin(0.5);
        inviteFriendBtn.setInteractive({ useHandCursor: true });

        inviteFriendBtn.on('pointerdown', () => {
            // Close this modal and open friend selector
            this.closeModal(overlay, [modal, modalTitle, linkText, linkDisplay, copyBtn, copyText, 
                                     inviteFriendText, inviteFriendBtn, inviteFriendBtnText, closeBtn, closeText]);
            this.showFriendSelector(inviteCode);
        });

        // Close button
        const closeBtn = this.add.rectangle(400, 480, 150, 40, 0x999999);
        const closeText = this.add.text(400, 480, 'Close', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        closeText.setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.closeModal(overlay, [modal, modalTitle, linkText, linkDisplay, copyBtn, copyText, 
                                     inviteFriendText, inviteFriendBtn, inviteFriendBtnText, closeBtn, closeText]);
        });
    }

    showFriendSelector(inviteCode) {
        if (this.friends.length === 0) {
            alert('You have no friends yet. Add friends first!');
            return;
        }

        const friendName = prompt('Enter friend username to invite:\n\n' + this.friends.join(', '));
        if (friendName && this.friends.includes(friendName)) {
            this.sendInviteToFriend(friendName, inviteCode);
        }
    }

    sendInviteToFriend(friendName, inviteCode) {
        const friendDataKey = `userData_${friendName}`;
        const friendData = localStorage.getItem(friendDataKey);
        
        if (friendData) {
            const data = JSON.parse(friendData);
            if (!data.pendingInvites) {
                data.pendingInvites = [];
            }
            
            // Add invite
            data.pendingInvites.push({
                from: this.username,
                code: inviteCode,
                timestamp: Date.now()
            });
            
            localStorage.setItem(friendDataKey, JSON.stringify(data));
            alert(`Invite sent to ${friendName}!`);
        } else {
            alert(`Friend ${friendName} not found.`);
        }
    }

    generateInviteCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return Array.from({ length: 6 }, () => 
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
    }

    closeModal(overlay, elements) {
        overlay.destroy();
        elements.forEach(el => el.destroy());
    }
}
