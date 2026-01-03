import Phaser from 'phaser';

export default class FriendsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FriendsScene' });
        this.username = '';
        this.friends = [];
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get current user
        this.username = localStorage.getItem('currentUser') || 'Guest';
        this.loadUserData();

        // Title
        const title = this.add.text(width / 2, 60, 'Friends List', {
            fontSize: '42px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Add friend button
        const addFriendBtn = this.add.rectangle(width / 2, 130, 250, 50, 0x00aa00);
        const addFriendText = this.add.text(width / 2, 130, '+ Add Friend', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        addFriendText.setOrigin(0.5);
        addFriendBtn.setInteractive({ useHandCursor: true });

        addFriendBtn.on('pointerover', () => {
            addFriendBtn.setFillStyle(0x00ff00);
        });
        addFriendBtn.on('pointerout', () => {
            addFriendBtn.setFillStyle(0x00aa00);
        });
        addFriendBtn.on('pointerdown', () => {
            this.addFriend();
        });

        // Friends list container
        this.friendsContainer = this.add.container(0, 0);
        this.displayFriends();

        // Back button
        const backBtn = this.add.rectangle(100, height - 40, 150, 40, 0x666666);
        const backText = this.add.text(100, height - 40, 'Back', {
            fontSize: '18px',
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
            this.scene.start('MenuScene');
        });
    }

    loadUserData() {
        const userDataKey = `userData_${this.username}`;
        const userData = localStorage.getItem(userDataKey);
        if (userData) {
            const data = JSON.parse(userData);
            this.friends = data.friends || [];
        }
    }

    saveUserData() {
        const userDataKey = `userData_${this.username}`;
        const userData = JSON.parse(localStorage.getItem(userDataKey) || '{}');
        userData.friends = this.friends;
        localStorage.setItem(userDataKey, JSON.stringify(userData));
    }

    displayFriends() {
        // Clear existing display
        this.friendsContainer.removeAll(true);

        if (this.friends.length === 0) {
            const noFriendsText = this.add.text(400, 250, 'No friends yet.\nAdd friends to play with them!', {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            });
            noFriendsText.setOrigin(0.5);
            this.friendsContainer.add(noFriendsText);
            return;
        }

        // Display each friend
        this.friends.forEach((friend, index) => {
            const yPos = 200 + (index * 70);
            
            // Friend card background
            const card = this.add.rectangle(400, yPos, 600, 60, 0x444444);
            card.setStrokeStyle(2, 0x666666);

            // Friend name
            const nameText = this.add.text(150, yPos, friend, {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            nameText.setOrigin(0, 0.5);

            // Online status indicator (simulated)
            const isOnline = Math.random() > 0.5;
            const statusCircle = this.add.circle(120, yPos, 8, isOnline ? 0x00ff00 : 0x666666);
            const statusText = this.add.text(nameText.x + nameText.width + 15, yPos, 
                isOnline ? 'Online' : 'Offline', {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: isOnline ? '#00ff00' : '#999999'
            });
            statusText.setOrigin(0, 0.5);

            // Invite button
            const inviteBtn = this.add.rectangle(550, yPos, 120, 40, 0xff6600);
            const inviteText = this.add.text(550, yPos, 'Invite', {
                fontSize: '18px',
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
                this.inviteFriend(friend);
            });

            // Remove button
            const removeBtn = this.add.rectangle(670, yPos, 40, 40, 0xcc0000);
            const removeText = this.add.text(670, yPos, '✕', {
                fontSize: '24px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            removeText.setOrigin(0.5);
            removeBtn.setInteractive({ useHandCursor: true });

            removeBtn.on('pointerover', () => {
                removeBtn.setFillStyle(0xff0000);
            });
            removeBtn.on('pointerout', () => {
                removeBtn.setFillStyle(0xcc0000);
            });
            removeBtn.on('pointerdown', () => {
                this.removeFriend(friend);
            });

            // Add all elements to container
            this.friendsContainer.add([card, statusCircle, nameText, statusText, inviteBtn, inviteText, removeBtn, removeText]);
        });
    }

    addFriend() {
        const friendName = prompt('Enter friend username to add:');
        if (!friendName || !friendName.trim()) {
            return;
        }

        const trimmedName = friendName.trim();

        // Check if trying to add self
        if (trimmedName === this.username) {
            alert('You cannot add yourself as a friend!');
            return;
        }

        // Check if already a friend
        if (this.friends.includes(trimmedName)) {
            alert('This user is already your friend!');
            return;
        }

        // Check if user exists
        const friendDataKey = `userData_${trimmedName}`;
        if (!localStorage.getItem(friendDataKey)) {
            alert('User not found. Make sure they have created an account!');
            return;
        }

        // Add friend
        this.friends.push(trimmedName);
        this.saveUserData();

        // Also add current user to friend's list (mutual friendship)
        const friendData = JSON.parse(localStorage.getItem(friendDataKey));
        if (!friendData.friends) {
            friendData.friends = [];
        }
        if (!friendData.friends.includes(this.username)) {
            friendData.friends.push(this.username);
            localStorage.setItem(friendDataKey, JSON.stringify(friendData));
        }

        // Refresh display
        this.displayFriends();
        alert(`${trimmedName} added as a friend!`);
    }

    removeFriend(friendName) {
        const confirm = window.confirm(`Remove ${friendName} from your friends list?`);
        if (!confirm) {
            return;
        }

        // Remove from friends list
        this.friends = this.friends.filter(f => f !== friendName);
        this.saveUserData();

        // Remove current user from friend's list
        const friendDataKey = `userData_${friendName}`;
        const friendData = localStorage.getItem(friendDataKey);
        if (friendData) {
            const data = JSON.parse(friendData);
            if (data.friends) {
                data.friends = data.friends.filter(f => f !== this.username);
                localStorage.setItem(friendDataKey, JSON.stringify(data));
            }
        }

        // Refresh display
        this.displayFriends();
    }

    inviteFriend(friendName) {
        // Generate invite code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const inviteCode = Array.from({ length: 6 }, () => 
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');

        // Send invite to friend
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
            
            // Set up game as host
            this.registry.set('gameMode', 'multiplayer');
            this.registry.set('multiplayerRole', 'host');
            this.registry.set('gameCode', inviteCode);
            
            alert(`Invitation sent to ${friendName}!\nGame code: ${inviteCode}\n\nStarting lobby...`);
            
            // Go to character selection
            this.scene.start('CharacterSelectionScene');
        } else {
            alert(`Could not send invite to ${friendName}.`);
        }
    }
}
