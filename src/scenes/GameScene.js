import Phaser from 'phaser';

// Game constants
const POWER_UP_SPAWN_DELAY_MS = 300; // Delay before power-ups start moving horizontally

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.player2 = null;
        this.cursors = null;
        this.wasdKeys = null;
        this.platforms = null;
        this.coins = null;
        this.score = 0;
        this.scoreText = null;
        this.levelText = null;
        this.enemies = null;
        this.finishFlag = null;
        this.gameOver = false;
        this.levelComplete = false;
        this.powerUpBlocks = null;
        this.powerUps = null;
        this.fireballs = null;
        this.fireballs2 = null;
        this.boss = null;
        this.bossHealth = 0;
        this.bossHealthBar = null;
        this.gameMode = 1; // 1 or 2 player mode
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        // Player 1 power-up states
        this.isPoweredUp = false;
        this.hasFirePower = false;
        this.isInvincible = false;
        this.invincibleTimer = null;
        // Player 2 power-up states
        this.isPoweredUp2 = false;
        this.hasFirePower2 = false;
        this.isInvincible2 = false;
        this.invincibleTimer2 = null;
        // Constants
        this.FALL_OFF_THRESHOLD = 50;
        // Game stats tracking
        this.coinsCollected = 0;
        this.enemiesDefeated = 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get game mode and player names from registry
        this.gameMode = this.registry.get('gameMode') || 1;
        this.player1Name = this.registry.get('player1Name') || 'Player 1';
        this.player2Name = this.registry.get('player2Name') || 'Player 2';
        
        // Get current level and score from registry
        const currentLevel = this.registry.get('currentLevel') || 1;
        this.score = this.registry.get('score') || 0;
        
        // Restore game stats
        this.coinsCollected = this.registry.get('coinsCollected') || 0;
        this.enemiesDefeated = this.registry.get('enemiesDefeated') || 0;
        
        // Restore power-up state for player 1
        this.isPoweredUp = this.registry.get('isPoweredUp') || false;
        this.hasFirePower = this.registry.get('hasFirePower') || false;
        
        // Restore power-up state for player 2 (only if 2-player mode)
        if (this.gameMode === 2) {
            this.isPoweredUp2 = this.registry.get('isPoweredUp2') || false;
            this.hasFirePower2 = this.registry.get('hasFirePower2') || false;
        }
        
        // Emit fire power state for UI
        this.game.events.emit('hasFirePower', this.hasFirePower || (this.gameMode === 2 && this.hasFirePower2));
        
        // Extend world bounds for side-scrolling
        this.physics.world.setBounds(0, 0, 3200, height);
        this.cameras.main.setBounds(0, 0, 3200, height);

        // Create sky background gradient
        this.add.rectangle(1600, height / 2, 3200, height, 0x5c94fc);

        // Create platforms group
        this.platforms = this.physics.add.staticGroup();

        // Ground - extended for side-scrolling
        this.createPlatform(0, height - 32, 3200, 64, 0x8B4513);
        
        // Create level-specific layouts
        if (currentLevel === 1) {
            this.createLevel1Platforms();
        } else if (currentLevel === 2) {
            this.createLevel2Platforms();
        } else {
            this.createLevel3Platforms();
        }

        // Create player 1
        this.createPlayer();
        
        // Create player 2 (only in 2-player mode)
        if (this.gameMode === 2) {
            this.createPlayer2();
        }
        
        // Camera follows player 1 (or centered between both in 2-player mode)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        // Create power-up blocks
        this.createPowerUpBlocks();
        
        // Create power-ups group
        this.powerUps = this.physics.add.group();
        
        // Create fireballs groups
        this.fireballs = this.physics.add.group();
        this.fireballs2 = this.physics.add.group();

        // Create coins
        this.createCoins();

        // Create enemies
        this.createEnemies();
        
        // Create finish flag or boss
        if (currentLevel === 2 || currentLevel === 3) {
            this.createBoss();
        } else {
            this.createFinishFlag();
        }

        // Score text - fixed to camera
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        
        // Level text - fixed to camera
        this.levelText = this.add.text(width - 16, 16, 'Level: ' + currentLevel, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.levelText.setOrigin(1, 0);
        this.levelText.setScrollFactor(0);
        
        // Power-up status text
        this.powerUpText = this.add.text(16, 56, '', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.powerUpText.setScrollFactor(0);
        this.updatePowerUpText();

        // Colliders for Player 1
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.powerUps, this.platforms);
        this.physics.add.collider(this.fireballs, this.platforms, this.hitPlatformWithFireball, null, this);
        
        // Colliders for Player 2 (only in 2-player mode)
        if (this.gameMode === 2) {
            this.physics.add.collider(this.player2, this.platforms);
            this.physics.add.collider(this.fireballs2, this.platforms, this.hitPlatformWithFireball, null, this);
        }
        
        // Power-up block collision
        this.physics.add.collider(this.player, this.powerUpBlocks, this.hitPowerUpBlock, null, this);
        if (this.gameMode === 2) {
            this.physics.add.collider(this.player2, this.powerUpBlocks, this.hitPowerUpBlock2, null, this);
        }
        
        // Overlap for collecting coins
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        if (this.gameMode === 2) {
            this.physics.add.overlap(this.player2, this.coins, this.collectCoin, null, this);
        }
        
        // Overlap for collecting power-ups
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
        if (this.gameMode === 2) {
            this.physics.add.overlap(this.player2, this.powerUps, this.collectPowerUp2, null, this);
        }
        
        // Collision with enemies
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);
        if (this.gameMode === 2) {
            this.physics.add.collider(this.player2, this.enemies, this.hitEnemy2, null, this);
        }
        
        // Fireball hits enemy
        this.physics.add.overlap(this.fireballs, this.enemies, this.fireballHitEnemy, null, this);
        if (this.gameMode === 2) {
            this.physics.add.overlap(this.fireballs2, this.enemies, this.fireballHitEnemy, null, this);
        }
        
        // Overlap with finish flag (if not boss level)
        if (currentLevel !== 2) {
            this.physics.add.overlap(this.player, this.finishFlag, this.reachFlag, null, this);
            if (this.gameMode === 2) {
                this.physics.add.overlap(this.player2, this.finishFlag, this.reachFlag, null, this);
            }
        } else if (this.boss) {
            this.physics.add.collider(this.boss, this.platforms);  // Boss collides with platforms
            this.physics.add.collider(this.player, this.boss, this.hitBoss, null, this);
            if (this.gameMode === 2) {
                this.physics.add.collider(this.player2, this.boss, this.hitBoss2, null, this);
            }
            this.physics.add.overlap(this.fireballs, this.boss, this.fireballHitBoss, null, this);
            if (this.gameMode === 2) {
                this.physics.add.overlap(this.fireballs2, this.boss, this.fireballHitBoss, null, this);
            }
        }

        // Keyboard controls
        // Player 1 - WASD keys (or Arrow keys in 1-player mode)
        if (this.gameMode === 1) {
            // In 1-player mode, player 1 uses Arrow keys
            this.cursors = this.input.keyboard.createCursorKeys();
            this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        } else {
            // In 2-player mode, player 1 uses WASD
            this.wasdKeys = {
                up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            };
            this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
            
            // Player 2 uses Arrow keys
            this.cursors = this.input.keyboard.createCursorKeys();
            this.fireKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        }

        // Initialize touch controls from registry
        this.registry.set('moveLeft', false);
        this.registry.set('moveRight', false);
        this.registry.set('jump', false);
        this.registry.set('fire', false);
    }
    
    createLevel1Platforms() {
        const height = this.cameras.main.height;
        
        // Floating platforms - lowered and better distributed
        // First section
        this.createPlatform(300, 480, 150, 32, 0x228B22);
        this.createPlatform(550, 420, 150, 32, 0x228B22);
        this.createPlatform(150, 380, 150, 32, 0x228B22);
        
        // Second section
        this.createPlatform(900, 450, 200, 32, 0x228B22);
        this.createPlatform(1200, 400, 150, 32, 0x228B22);
        this.createPlatform(1450, 480, 150, 32, 0x228B22);
        
        // Third section (harder)
        this.createPlatform(1800, 420, 150, 32, 0x228B22);
        this.createPlatform(2050, 380, 150, 32, 0x228B22);
        this.createPlatform(2300, 450, 150, 32, 0x228B22);
        
        // Final section leading to flag
        this.createPlatform(2600, 420, 150, 32, 0x228B22);
        this.createPlatform(2850, 480, 150, 32, 0x228B22);
    }
    
    createLevel2Platforms() {
        const height = this.cameras.main.height;
        
        // Level 2 - More challenging layout
        // First section - stairs up
        this.createPlatform(200, 500, 120, 32, 0x228B22);
        this.createPlatform(380, 450, 120, 32, 0x228B22);
        this.createPlatform(560, 400, 120, 32, 0x228B22);
        
        // Second section - gaps
        this.createPlatform(850, 480, 100, 32, 0x228B22);
        this.createPlatform(1050, 450, 100, 32, 0x228B22);
        this.createPlatform(1250, 420, 100, 32, 0x228B22);
        
        // Third section - mixed heights
        this.createPlatform(1500, 380, 150, 32, 0x228B22);
        this.createPlatform(1750, 480, 120, 32, 0x228B22);
        this.createPlatform(1950, 400, 150, 32, 0x228B22);
        
        // Fourth section - descending
        this.createPlatform(2200, 420, 120, 32, 0x228B22);
        this.createPlatform(2400, 460, 120, 32, 0x228B22);
        
        // Boss arena section
        this.createPlatform(2650, 480, 150, 32, 0x228B22);
        // Ledge for jumping on boss (twice Mario's height)
        this.createPlatform(2750, 380, 100, 32, 0x228B22);
        
        // Flag area after boss
        this.createPlatform(2900, 450, 100, 32, 0x228B22);
    }
    
    createLevel3Platforms() {
        const height = this.cameras.main.height;
        
        // Level 3 - Most challenging layout with boss arena
        // First section - quick ascent
        this.createPlatform(150, 520, 100, 32, 0x228B22);
        this.createPlatform(320, 470, 100, 32, 0x228B22);
        this.createPlatform(490, 420, 100, 32, 0x228B22);
        this.createPlatform(660, 370, 100, 32, 0x228B22);
        
        // Second section - wide gaps
        this.createPlatform(900, 400, 80, 32, 0x228B22);
        this.createPlatform(1120, 450, 80, 32, 0x228B22);
        this.createPlatform(1340, 400, 80, 32, 0x228B22);
        this.createPlatform(1560, 480, 80, 32, 0x228B22);
        
        // Third section - precision jumps
        this.createPlatform(1800, 420, 100, 32, 0x228B22);
        this.createPlatform(1980, 380, 100, 32, 0x228B22);
        this.createPlatform(2160, 440, 100, 32, 0x228B22);
        this.createPlatform(2340, 400, 100, 32, 0x228B22);
        
        // Boss arena section
        this.createPlatform(2600, 500, 180, 32, 0x228B22);
        // Ledge for jumping on boss (elevated platform, twice Mario's height from ground)
        this.createPlatform(2700, 350, 120, 32, 0x228B22);
        
        // Flag area after boss defeat
        this.createPlatform(2900, 480, 120, 32, 0x228B22);
    }

    createPlatform(x, y, width, height, color) {
        // Create platform with brick-like pattern
        const platform = this.add.graphics();
        platform.fillStyle(color, 1);
        platform.fillRect(0, 0, width, height);
        
        // Add brick pattern
        if (color === 0x8B4513) {
            // Ground - darker brown pattern
            platform.lineStyle(2, 0x654321, 1);
            for (let i = 0; i < width; i += 40) {
                platform.lineBetween(i, 0, i, height);
            }
        } else {
            // Floating platforms - grass on top
            platform.fillStyle(0x32CD32, 1);
            platform.fillRect(0, 0, width, 8);
            platform.lineStyle(2, 0x228B22, 1);
            for (let i = 0; i < width; i += 32) {
                platform.lineBetween(i, 8, i, height);
            }
        }
        
        platform.setPosition(x, y);
        platform.generateTexture('platform_' + x + '_' + y, width, height);
        platform.destroy();
        
        const platformSprite = this.add.image(x + width/2, y + height/2, 'platform_' + x + '_' + y);
        this.physics.add.existing(platformSprite, true);
        this.platforms.add(platformSprite);
    }
    
    createPowerUpBlocks() {
        this.powerUpBlocks = this.physics.add.staticGroup();
        
        const currentLevel = this.registry.get('currentLevel') || 1;
        let blockPositions;
        
        if (currentLevel === 1) {
            // Boxes centered on platforms above where Mario can jump
            // Platform centers: (300+75=375, 480), (550+75=625, 420), (150+75=225, 380)
            // (900+100=1000, 450), (1200+75=1275, 400), (1800+75=1875, 420), (2300+75=2375, 450)
            blockPositions = [
                { x: 375, y: 380, type: 'mushroom' },      // Centered above platform at (300, 480)
                { x: 625, y: 320, type: 'mushroom' },      // Centered above platform at (550, 420)
                { x: 1275, y: 300, type: 'flower' },       // Centered above platform at (1200, 400)
                { x: 1875, y: 320, type: 'star' },         // Centered above platform at (1800, 420)
                { x: 2375, y: 350, type: 'mushroom' }      // Centered above platform at (2300, 450)
            ];
        } else if (currentLevel === 2) {
            // Level 2 boxes centered on platforms
            blockPositions = [
                { x: 440, y: 350, type: 'mushroom' },      // Centered above platform at (380, 450)
                { x: 1100, y: 350, type: 'flower' },       // Centered above platform at (1050, 450)
                { x: 1810, y: 380, type: 'star' },         // Centered above platform at (1750, 480)
                { x: 2700, y: 380, type: 'mushroom' }      // Centered above ledge platform
            ];
        } else {
            // Level 3 boxes centered on platforms
            blockPositions = [
                { x: 490, y: 320, type: 'mushroom' },      // Centered above platform at (490, 420)
                { x: 1120, y: 350, type: 'flower' },       // Centered above platform at (1120, 450)
                { x: 1980, y: 280, type: 'star' },         // Centered above platform at (1980, 380)
                { x: 2700, y: 250, type: 'flower' }        // Centered above ledge platform
            ];
        }
        
        blockPositions.forEach(pos => {
            // Create "?" block
            const block = this.add.rectangle(pos.x, pos.y, 40, 40, 0xffaa00);
            const questionMark = this.add.text(pos.x, pos.y, '?', {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            questionMark.setOrigin(0.5);
            
            this.physics.add.existing(block, true);
            block.powerUpType = pos.type;
            block.used = false;
            block.questionMark = questionMark;
            this.powerUpBlocks.add(block);
            
            // Animate the block
            this.tweens.add({
                targets: [block, questionMark],
                y: pos.y - 5,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        });
    }
    
    updatePowerUpText() {
        let text = '';
        // Player 1 status
        if (this.hasFirePower) {
            text = `${this.player1Name}: Fire Power`;
        } else if (this.isPoweredUp) {
            text = `${this.player1Name}: Super`;
        } else {
            text = `${this.player1Name}: Normal`;
        }
        if (this.isInvincible) {
            text += ' ⭐';
        }
        
        // Player 2 status (only in 2-player mode)
        if (this.gameMode === 2) {
            text += ' | ';
            if (this.hasFirePower2) {
                text += `${this.player2Name}: Fire Power`;
            } else if (this.isPoweredUp2) {
                text += `${this.player2Name}: Super`;
            } else {
                text += `${this.player2Name}: Normal`;
            }
            if (this.isInvincible2) {
                text += ' ⭐';
            }
        }
        
        this.powerUpText.setText(text);
    }
    
    resetGameState() {
        // Helper method to reset all game state
        const gameMode = this.registry.get('gameMode') || 1;
        const player1Name = this.registry.get('player1Name') || 'Player 1';
        const player2Name = this.registry.get('player2Name') || 'Player 2';
        
        this.registry.set('currentLevel', 1);
        this.registry.set('score', 0);
        this.registry.set('isPoweredUp', false);
        this.registry.set('hasFirePower', false);
        this.registry.set('isPoweredUp2', false);
        this.registry.set('hasFirePower2', false);
        this.registry.set('coinsCollected', 0);
        this.registry.set('enemiesDefeated', 0);
        
        // Restore game mode and player names
        this.registry.set('gameMode', gameMode);
        this.registry.set('player1Name', player1Name);
        this.registry.set('player2Name', player2Name);
    }

    createPlayer() {
        // Get selected character from registry
        const selectedCharacter = this.registry.get('selectedCharacter') || 'mario';
        
        // Create character container
        this.player = this.add.container(100, 450);
        
        // Character-specific colors and attributes
        let bodyColor, hatColor, logoText;
        switch(selectedCharacter) {
            case 'luigi':
                bodyColor = 0x00aa00; // Green
                hatColor = 0x00aa00;
                logoText = 'L';
                break;
            case 'toad':
                bodyColor = 0xff69b4; // Pink
                hatColor = 0xff69b4;
                logoText = 'T';
                break;
            case 'mario':
            default:
                bodyColor = 0xff0000; // Red
                hatColor = 0xff0000;
                logoText = 'M';
                break;
        }
        
        // Body parts
        const body = this.add.rectangle(0, 4, 28, 32, bodyColor);
        
        // Head (skin color)
        const head = this.add.circle(0, -12, 14, 0xffdbac);
        
        // Hat
        const hat = this.add.ellipse(0, -20, 32, 16, hatColor);
        // Calculate darker shade for hat brim safely
        const hatBrimColor = Math.max(0, hatColor - 0x330000);
        const hatBrim = this.add.rectangle(0, -14, 32, 6, hatBrimColor);
        
        // Overalls (blue)
        const overalls = this.add.rectangle(0, 12, 24, 16, 0x0066ff);
        const strap1 = this.add.rectangle(-6, 0, 4, 12, 0x0066ff);
        const strap2 = this.add.rectangle(6, 0, 4, 12, 0x0066ff);
        
        // Buttons on overalls
        const button1 = this.add.circle(-6, 2, 2, 0xffff00);
        const button2 = this.add.circle(6, 2, 2, 0xffff00);
        
        // Eyes
        const eye1 = this.add.circle(-4, -12, 3, 0x000000);
        const eye2 = this.add.circle(4, -12, 3, 0x000000);
        
        // Mustache (Toad doesn't have mustache)
        let mustache = null;
        if (selectedCharacter !== 'toad') {
            mustache = this.add.rectangle(0, -6, 16, 4, 0x654321);
        }
        
        // Shoes (brown)
        const shoe1 = this.add.ellipse(-8, 20, 10, 6, 0x654321);
        const shoe2 = this.add.ellipse(8, 20, 10, 6, 0x654321);
        
        // Logo on hat
        const logo = this.add.text(0, -20, logoText, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        logo.setOrigin(0.5);
        
        // Add all parts to container
        const parts = [shoe1, shoe2, overalls, strap1, strap2, button1, button2, body, head, hatBrim, hat, eye1, eye2, logo];
        if (mustache) parts.push(mustache);
        this.player.add(parts);
        
        // Add physics to container
        this.physics.add.existing(this.player);
        
        // Adjust size based on power-up state
        if (this.isPoweredUp) {
            this.player.setScale(1.3);
            this.player.body.setSize(36, 57);
            this.player.body.setOffset(-18, -28);
        } else {
            this.player.body.setSize(28, 44);
            this.player.body.setOffset(-14, -22);
        }
        
        this.player.body.setBounce(0.1);
        this.player.body.setCollideWorldBounds(true);
        
        // Change color for Fire Mario
        if (this.hasFirePower) {
            body.setFillStyle(0xffffff);
        }
        
        // Store references
        this.player.body_part = body;
        this.player.eyes = [eye1, eye2];
        this.player.logoText = logo;
    }

    createPlayer2() {
        // Create Luigi character container (Louisa)
        this.player2 = this.add.container(150, 450);
        
        // Luigi body parts - Green theme
        // Body (green shirt)
        const body = this.add.rectangle(0, 4, 28, 32, 0x00ff00);
        
        // Head (skin color)
        const head = this.add.circle(0, -12, 14, 0xffdbac);
        
        // Hat (green cap)
        const hat = this.add.ellipse(0, -20, 32, 16, 0x00ff00);
        const hatBrim = this.add.rectangle(0, -14, 32, 6, 0x00cc00);
        
        // Overalls (blue)
        const overalls = this.add.rectangle(0, 12, 24, 16, 0x0066ff);
        const strap1 = this.add.rectangle(-6, 0, 4, 12, 0x0066ff);
        const strap2 = this.add.rectangle(6, 0, 4, 12, 0x0066ff);
        
        // Buttons on overalls
        const button1 = this.add.circle(-6, 2, 2, 0xffff00);
        const button2 = this.add.circle(6, 2, 2, 0xffff00);
        
        // Eyes
        const eye1 = this.add.circle(-4, -12, 3, 0x000000);
        const eye2 = this.add.circle(4, -12, 3, 0x000000);
        
        // Mustache
        const mustache = this.add.rectangle(0, -6, 16, 4, 0x654321);
        
        // Shoes (brown)
        const shoe1 = this.add.ellipse(-8, 20, 10, 6, 0x654321);
        const shoe2 = this.add.ellipse(8, 20, 10, 6, 0x654321);
        
        // Logo on hat (L)
        const logo = this.add.text(0, -20, 'L', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        logo.setOrigin(0.5);
        
        // Add all parts to container
        this.player2.add([shoe1, shoe2, overalls, strap1, strap2, button1, button2, body, head, mustache, hatBrim, hat, eye1, eye2, logo]);
        
        // Add physics to container
        this.physics.add.existing(this.player2);
        
        // Adjust size based on power-up state
        if (this.isPoweredUp2) {
            this.player2.setScale(1.3);
            this.player2.body.setSize(36, 57);
            this.player2.body.setOffset(-18, -28);
        } else {
            this.player2.body.setSize(28, 44);
            this.player2.body.setOffset(-14, -22);
        }
        
        this.player2.body.setBounce(0.1);
        this.player2.body.setCollideWorldBounds(true);
        
        // Change color for Fire Luigi
        if (this.hasFirePower2) {
            body.setFillStyle(0xffffff);
        }
        
        // Store references
        this.player2.body_part = body;
        this.player2.eyes = [eye1, eye2];
        this.player2.logoText = logo;
    }

    createCoins() {
        this.coins = this.physics.add.group();
        
        const currentLevel = this.registry.get('currentLevel') || 1;
        let coinPositions;
        
        if (currentLevel === 1) {
            coinPositions = [
                // First section - single row, well spaced
                { x: 300, y: 430 }, { x: 350, y: 430 }, { x: 400, y: 430 },
                { x: 550, y: 370 }, { x: 610, y: 370 },
                { x: 150, y: 330 }, { x: 210, y: 330 },
                
                // Second section
                { x: 900, y: 400 }, { x: 960, y: 400 }, { x: 1020, y: 400 },
                { x: 1200, y: 350 }, { x: 1260, y: 350 },
                { x: 1450, y: 430 }, { x: 1510, y: 430 },
                
                // Third section
                { x: 1800, y: 370 }, { x: 1860, y: 370 },
                { x: 2050, y: 330 }, { x: 2110, y: 330 }, { x: 2170, y: 330 },
                { x: 2300, y: 400 }, { x: 2360, y: 400 },
                
                // Final section
                { x: 2600, y: 370 }, { x: 2660, y: 370 },
                { x: 2850, y: 430 }, { x: 2910, y: 430 }
            ];
        } else if (currentLevel === 2) {
            // Level 2 coins - single row, well spaced
            coinPositions = [
                // First section
                { x: 200, y: 450 }, { x: 260, y: 450 },
                { x: 380, y: 400 }, { x: 440, y: 400 }, { x: 500, y: 400 },
                { x: 560, y: 350 }, { x: 620, y: 350 },
                
                // Second section
                { x: 850, y: 430 }, { x: 910, y: 430 },
                { x: 1050, y: 400 }, { x: 1110, y: 400 },
                { x: 1250, y: 370 }, { x: 1310, y: 370 },
                
                // Third section
                { x: 1500, y: 330 }, { x: 1560, y: 330 }, { x: 1620, y: 330 },
                { x: 1750, y: 430 }, { x: 1810, y: 430 },
                { x: 1950, y: 350 }, { x: 2010, y: 350 }, { x: 2070, y: 350 },
                
                // Fourth section
                { x: 2200, y: 370 }, { x: 2260, y: 370 },
                { x: 2650, y: 430 }, { x: 2710, y: 430 }
            ];
        } else {
            // Level 3 coins - challenging collection
            coinPositions = [
                // First section - ascending
                { x: 150, y: 470 }, { x: 210, y: 470 },
                { x: 320, y: 420 }, { x: 380, y: 420 }, { x: 440, y: 420 },
                { x: 490, y: 370 }, { x: 550, y: 370 },
                { x: 660, y: 320 }, { x: 720, y: 320 },
                
                // Second section - gaps
                { x: 900, y: 350 }, { x: 960, y: 350 },
                { x: 1120, y: 400 }, { x: 1180, y: 400 },
                { x: 1340, y: 350 }, { x: 1400, y: 350 },
                { x: 1560, y: 430 }, { x: 1620, y: 430 },
                
                // Third section - precision
                { x: 1800, y: 370 }, { x: 1860, y: 370 },
                { x: 1980, y: 330 }, { x: 2040, y: 330 }, { x: 2100, y: 330 },
                { x: 2160, y: 390 }, { x: 2220, y: 390 },
                { x: 2340, y: 350 }, { x: 2400, y: 350 },
                
                // Final section
                { x: 2600, y: 450 }, { x: 2660, y: 450 },
                { x: 2900, y: 430 }, { x: 2960, y: 430 }
            ];
        }

        coinPositions.forEach(pos => {
            // Create single coin with gradient-like effect using graphics
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffff00, 1);
            graphics.fillCircle(16, 16, 16);  // Draw at center of 32x32 texture
            graphics.fillStyle(0xffcc00, 1);
            graphics.fillCircle(16, 16, 12);  // Draw inner circle at same center
            graphics.generateTexture(`coin_${pos.x}_${pos.y}`, 32, 32);
            graphics.destroy();
            
            const coin = this.add.image(pos.x, pos.y, `coin_${pos.x}_${pos.y}`);
            this.physics.add.existing(coin);
            coin.body.setAllowGravity(false);
            this.coins.add(coin);
            
            // Add smooth rotating/spinning animation
            this.tweens.add({
                targets: coin,
                scaleX: 0.4,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Add subtle bobbing animation
            this.tweens.add({
                targets: coin,
                y: pos.y - 5,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.tweens.add({
                targets: coin,
                y: pos.y - 5,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        const currentLevel = this.registry.get('currentLevel') || 1;
        let enemyPositions;
        
        if (currentLevel === 1) {
            enemyPositions = [
                { x: 450, y: 450, speed: 80 },
                { x: 700, y: 500, speed: -60 },
                { x: 1100, y: 500, speed: 100 },
                { x: 1350, y: 450, speed: -70 },
                { x: 1700, y: 500, speed: 90 },
                { x: 2150, y: 450, speed: -80 },
                { x: 2500, y: 500, speed: 70 }
            ];
        } else if (currentLevel === 2) {
            // Level 2 - more enemies
            enemyPositions = [
                { x: 300, y: 500, speed: 70 },
                { x: 650, y: 450, speed: -90 },
                { x: 950, y: 500, speed: 100 },
                { x: 1150, y: 500, speed: -80 },
                { x: 1400, y: 450, speed: 85 },
                { x: 1650, y: 500, speed: -75 },
                { x: 2100, y: 450, speed: 95 },
                { x: 2350, y: 500, speed: -70 }
            ];
        } else {
            // Level 3 - most enemies and faster
            enemyPositions = [
                { x: 250, y: 500, speed: 80 },
                { x: 570, y: 450, speed: -95 },
                { x: 800, y: 500, speed: 110 },
                { x: 1020, y: 500, speed: -90 },
                { x: 1240, y: 500, speed: 100 },
                { x: 1460, y: 500, speed: -85 },
                { x: 1700, y: 450, speed: 95 },
                { x: 1900, y: 450, speed: -100 },
                { x: 2080, y: 450, speed: 90 },
                { x: 2260, y: 450, speed: -95 },
                { x: 2500, y: 500, speed: 85 }
            ];
        }

        enemyPositions.forEach(pos => {
            // Create Goomba-like enemy
            const enemy = this.add.container(pos.x, pos.y);
            
            // Body (brown mushroom shape)
            const body = this.add.ellipse(0, 4, 32, 28, 0x8B4513);
            
            // Head
            const head = this.add.ellipse(0, -6, 28, 24, 0xA0522D);
            
            // Eyes
            const eye1 = this.add.ellipse(-6, -6, 8, 10, 0xffffff);
            const eye2 = this.add.ellipse(6, -6, 8, 10, 0xffffff);
            const pupil1 = this.add.circle(-6, -4, 3, 0x000000);
            const pupil2 = this.add.circle(6, -4, 3, 0x000000);
            
            // Eyebrows (angry look)
            const brow1 = this.add.rectangle(-6, -12, 8, 2, 0x654321);
            brow1.setRotation(-0.3);
            const brow2 = this.add.rectangle(6, -12, 8, 2, 0x654321);
            brow2.setRotation(0.3);
            
            // Feet
            const foot1 = this.add.ellipse(-8, 14, 12, 8, 0x654321);
            const foot2 = this.add.ellipse(8, 14, 12, 8, 0x654321);
            
            enemy.add([foot1, foot2, body, head, eye1, eye2, pupil1, pupil2, brow1, brow2]);
            
            this.physics.add.existing(enemy);
            enemy.body.setSize(32, 32);
            enemy.body.setBounce(0);
            enemy.body.setCollideWorldBounds(true);
            enemy.body.setVelocityX(pos.speed);
            this.enemies.add(enemy);
        });
    }
    
    createFinishFlag() {
        // Flag pole position near end of level
        const flagX = 3050;
        const flagY = this.cameras.main.height - 32;
        
        // Pole
        const pole = this.add.rectangle(flagX, flagY - 150, 8, 300, 0xcccccc);
        
        // Flag
        const flag = this.add.polygon(flagX + 4, flagY - 280, [
            0, 0,
            60, 15,
            0, 30
        ], 0xff0000);
        
        // Add white circle in flag
        const flagCircle = this.add.circle(flagX + 20, flagY - 265, 8, 0xffffff);
        
        // Top of pole
        const poleTop = this.add.circle(flagX, flagY - 300, 6, 0xffff00);
        
        // Create finish flag container
        this.finishFlag = this.add.container(flagX, flagY - 150);
        this.physics.add.existing(this.finishFlag);
        this.finishFlag.body.setAllowGravity(false);
        this.finishFlag.body.setSize(80, 300);
        this.finishFlag.body.setOffset(-40, -150);
        
        // Animate flag waving
        this.tweens.add({
            targets: flag,
            scaleX: 0.85,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    createBoss() {
        const currentLevel = this.registry.get('currentLevel') || 1;
        
        // Different boss for level 3 - larger and requires 3 jumps
        if (currentLevel === 3) {
            // Level 3 boss - King Koopa (twice Mario's height = ~88 pixels)
            const bossX = 2690;
            const bossY = this.cameras.main.height - 220; // Higher up for larger boss
            
            this.boss = this.add.container(bossX, bossY);
            
            // Boss body (large armored creature - twice Mario's height)
            const shell = this.add.ellipse(0, 20, 100, 90, 0x8B0000); // Dark red shell
            const shellPattern1 = this.add.rectangle(-20, 20, 20, 20, 0xffaa00);
            const shellPattern2 = this.add.rectangle(0, 20, 20, 20, 0xffaa00);
            const shellPattern3 = this.add.rectangle(20, 20, 20, 20, 0xffaa00);
            
            // Head (larger)
            const head = this.add.ellipse(0, -40, 65, 58, 0xff4500);
            
            // Horns (larger and more menacing)
            const horn1 = this.add.triangle(-20, -60, 0, 0, 15, -20, 7, 0, 0xffaa00);
            const horn2 = this.add.triangle(20, -60, 0, 0, -15, -20, -7, 0, 0xffaa00);
            
            // Eyes (angry, glowing)
            const eye1 = this.add.ellipse(-13, -45, 15, 18, 0xffff00);
            const eye2 = this.add.ellipse(13, -45, 15, 18, 0xffff00);
            const pupil1 = this.add.circle(-13, -43, 6, 0xff0000);
            const pupil2 = this.add.circle(13, -43, 6, 0xff0000);
            
            // Mouth/snout
            const snout = this.add.rectangle(0, -25, 40, 20, 0xff6347);
            const teeth1 = this.add.rectangle(-10, -15, 5, 8, 0xffffff);
            const teeth2 = this.add.rectangle(10, -15, 5, 8, 0xffffff);
            
            // Spikes on shell (larger)
            const spike1 = this.add.triangle(-35, 10, 0, -15, 7, 0, -7, 0, 0x654321);
            const spike2 = this.add.triangle(-12, 10, 0, -15, 7, 0, -7, 0, 0x654321);
            const spike3 = this.add.triangle(12, 10, 0, -15, 7, 0, -7, 0, 0x654321);
            const spike4 = this.add.triangle(35, 10, 0, -15, 7, 0, -7, 0, 0x654321);
            
            // Legs (larger)
            const leg1 = this.add.rectangle(-30, 65, 20, 35, 0xff4500);
            const leg2 = this.add.rectangle(30, 65, 20, 35, 0xff4500);
            
            // Arms (menacing)
            const arm1 = this.add.rectangle(-40, 0, 15, 40, 0xff4500);
            const arm2 = this.add.rectangle(40, 0, 15, 40, 0xff4500);
            const claw1 = this.add.triangle(-45, 20, 0, 0, 8, 10, 0, 10, 0xffffff);
            const claw2 = this.add.triangle(45, 20, 0, 0, -8, 10, 0, 10, 0xffffff);
            
            this.boss.add([
                leg1, leg2, arm1, arm2, claw1, claw2,
                shell, shellPattern1, shellPattern2, shellPattern3,
                spike1, spike2, spike3, spike4, head, snout, teeth1, teeth2,
                eye1, eye2, pupil1, pupil2, horn1, horn2
            ]);
            
            // Add physics (larger hitbox for bigger boss)
            this.physics.add.existing(this.boss);
            this.boss.body.setSize(100, 175); // Twice Mario's height
            this.boss.body.setOffset(-50, -87);
            this.boss.body.setImmovable(false);
            this.boss.body.setAllowGravity(true);
            this.boss.body.setCollideWorldBounds(true);
            
            // Boss AI - more aggressive
            this.bossHealth = 3; // Requires 3 jumps
            this.boss.moveDirection = -1;
            this.boss.moveSpeed = 100; // Faster
            this.boss.body.setVelocityX(this.boss.moveSpeed * this.boss.moveDirection);
            
        } else {
            // Level 2 boss - Original Bowser-like boss
            const bossX = 2690;
            const bossY = this.cameras.main.height - 150;
            
            this.boss = this.add.container(bossX, bossY);
            
            // Boss body (large turtle-like creature)
            const shell = this.add.ellipse(0, 10, 80, 70, 0x228B22);
            const shellPattern1 = this.add.rectangle(-15, 10, 15, 15, 0xffff00);
            const shellPattern2 = this.add.rectangle(0, 10, 15, 15, 0xffff00);
            const shellPattern3 = this.add.rectangle(15, 10, 15, 15, 0xffff00);
            
            // Head
            const head = this.add.ellipse(0, -20, 50, 45, 0x32CD32);
            
            // Horns
            const horn1 = this.add.triangle(-15, -35, 0, 0, 10, -15, 5, 0, 0xff6600);
            const horn2 = this.add.triangle(15, -35, 0, 0, -10, -15, -5, 0, 0xff6600);
            
            // Eyes (angry)
            const eye1 = this.add.ellipse(-10, -22, 12, 15, 0xffffff);
            const eye2 = this.add.ellipse(10, -22, 12, 15, 0xffffff);
            const pupil1 = this.add.circle(-10, -20, 5, 0xff0000);
            const pupil2 = this.add.circle(10, -20, 5, 0xff0000);
            
            // Mouth/snout
            const snout = this.add.rectangle(0, -10, 30, 15, 0x90EE90);
            
            // Spikes on shell
            const spike1 = this.add.triangle(-25, 0, 0, -10, 5, 0, -5, 0, 0x654321);
            const spike2 = this.add.triangle(0, 0, 0, -10, 5, 0, -5, 0, 0x654321);
            const spike3 = this.add.triangle(25, 0, 0, -10, 5, 0, -5, 0, 0x654321);
            
            // Legs
            const leg1 = this.add.rectangle(-25, 40, 15, 25, 0x32CD32);
            const leg2 = this.add.rectangle(25, 40, 15, 25, 0x32CD32);
            
            this.boss.add([
                leg1, leg2, shell, shellPattern1, shellPattern2, shellPattern3,
                spike1, spike2, spike3, head, snout, eye1, eye2, pupil1, pupil2,
                horn1, horn2
            ]);
            
            // Add physics
            this.physics.add.existing(this.boss);
            this.boss.body.setSize(80, 100);
            this.boss.body.setOffset(-40, -50);
            this.boss.body.setImmovable(false);
            this.boss.body.setAllowGravity(true);
            this.boss.body.setCollideWorldBounds(true);
            
            // Boss AI
            this.bossHealth = 5; // Level 2 boss still has 5 health
            this.boss.moveDirection = -1;
            this.boss.moveSpeed = 80;
            this.boss.body.setVelocityX(this.boss.moveSpeed * this.boss.moveDirection);
        }
        
        // Create boss health bar
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.setScrollFactor(0);
        this.updateBossHealthBar();
        
        // Boss attack pattern - jump periodically
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.boss && this.boss.active && !this.gameOver && !this.levelComplete) {
                    this.boss.body.setVelocityY(-300);
                }
            },
            loop: true
        });
        
        // Boss fire breath attack
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.boss && this.boss.active && !this.gameOver && !this.levelComplete) {
                    this.bossFireBreath();
                }
            },
            loop: true
        });
    }
    
    bossFireBreath() {
        // Create fire projectile
        const fireBreath = this.add.circle(this.boss.x, this.boss.y - 20, 12, 0xff6600);
        const fireInner = this.add.circle(this.boss.x, this.boss.y - 20, 8, 0xffff00);
        
        this.physics.add.existing(fireBreath);
        fireBreath.body.setVelocityX(-250);
        fireBreath.body.setAllowGravity(false);
        fireBreath.innerCircle = fireInner;
        
        // Hit player
        this.physics.add.overlap(this.player, fireBreath, () => {
            if (fireBreath.innerCircle) {
                fireBreath.innerCircle.destroy();
            }
            fireBreath.destroy();
            // Treat as enemy hit
            this.hitEnemy(this.player, { body: { velocity: { x: 0 } }, y: this.player.y, destroy: () => {} });
        });
        
        // Animate
        this.tweens.add({
            targets: [fireBreath, fireInner],
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
        
        // Destroy after 5 seconds
        this.time.delayedCall(5000, () => {
            if (fireBreath.innerCircle) {
                fireBreath.innerCircle.destroy();
            }
            if (fireBreath) {
                fireBreath.destroy();
            }
        });
    }
    
    updateBossHealthBar() {
        this.bossHealthBar.clear();
        
        const currentLevel = this.registry.get('currentLevel') || 1;
        const maxHealth = currentLevel === 3 ? 3 : 5;
        
        // Background
        this.bossHealthBar.fillStyle(0x000000, 0.5);
        this.bossHealthBar.fillRect(
            this.cameras.main.width / 2 - 102,
            this.cameras.main.height - 52,
            204,
            24
        );
        
        // Health bar
        const healthWidth = (this.bossHealth / maxHealth) * 200;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(
            this.cameras.main.width / 2 - 100,
            this.cameras.main.height - 50,
            healthWidth,
            20
        );
        
        // Border
        this.bossHealthBar.lineStyle(2, 0xffffff, 1);
        this.bossHealthBar.strokeRect(
            this.cameras.main.width / 2 - 102,
            this.cameras.main.height - 52,
            204,
            24
        );
    }
    
    hitBoss(player, boss) {
        if (this.gameOver || this.levelComplete) return;
        
        // Check if player jumped on boss
        if (player.body.velocity.y > 0 && player.y < boss.y - 40) {
            player.body.setVelocityY(-350);
            this.damageBoss();
        } else {
            // Player takes damage
            this.hitEnemy(player, { body: { velocity: { x: 0 } }, y: player.y, destroy: () => {} });
        }
    }
    
    hitBoss2(player, boss) {
        if (this.gameOver || this.levelComplete) return;
        
        // Check if player 2 jumped on boss
        if (player.body.velocity.y > 0 && player.y < boss.y - 40) {
            player.body.setVelocityY(-350);
            this.damageBoss();
        } else {
            // Player 2 takes damage
            this.hitEnemy2(player, { body: { velocity: { x: 0 } }, y: player.y, destroy: () => {} });
        }
    }
    
    fireballHitBoss(fireball, boss) {
        fireball.destroy();
        this.damageBoss();
    }
    
    damageBoss() {
        this.bossHealth--;
        this.updateBossHealthBar();
        
        // Flash boss
        this.tweens.add({
            targets: this.boss,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
        
        if (this.bossHealth <= 0) {
            // Boss defeated!
            this.boss.destroy();
            this.bossHealthBar.clear();
            this.score += 500;
            this.enemiesDefeated++; // Count boss as enemy defeated
            this.scoreText.setText('Score: ' + this.score);
            
            const currentLevel = this.registry.get('currentLevel') || 1;
            
            // Spawn finish flag after boss defeat
            this.createFinishFlag();
            
            // Resume physics so player can reach flag
            this.levelComplete = false;
            
            // Show boss defeated message (brief)
            const victoryText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 50,
                'BOSS DEFEATED!\nGo to the Flag!',
                {
                    fontSize: '48px',
                    fontFamily: 'Arial',
                    color: '#ffff00',
                    align: 'center',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 8
                }
            );
            victoryText.setOrigin(0.5);
            victoryText.setScrollFactor(0);
            
            // Fade out message after 2 seconds
            this.time.delayedCall(2000, () => {
                this.tweens.add({
                    targets: victoryText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => victoryText.destroy()
                });
            });
            
            // Add flag overlap collider
            this.physics.add.overlap(this.player, this.finishFlag, this.reachFlag, null, this);
            if (this.gameMode === 2) {
                this.physics.add.overlap(this.player2, this.finishFlag, this.reachFlag, null, this);
            }
        }
    }
    
    hitPowerUpBlock(player, block) {
        // Check if player hit block from below
        // Player must be moving upward and be below the block
        if (player.body.velocity.y >= 0 || block.used) return;
        
        // Additional check: player must be below the block (higher y value)
        if (player.y < block.y) return;
        
        block.used = true;
        block.setFillStyle(0xcccccc);
        if (block.questionMark) {
            block.questionMark.destroy();
        }
        
        // Spawn power-up based on type - spawn at block position, will pop out
        const powerUpType = block.powerUpType;
        this.spawnPowerUp(block.x, block.y, powerUpType);
        
        // Block bump animation
        this.tweens.add({
            targets: block,
            y: block.y - 10,
            duration: 100,
            yoyo: true
        });
    }
    
    hitPowerUpBlock2(player, block) {
        // Same logic for player 2
        if (player.body.velocity.y >= 0 || block.used) return;
        if (player.y < block.y) return;
        
        block.used = true;
        block.setFillStyle(0xcccccc);
        if (block.questionMark) {
            block.questionMark.destroy();
        }
        
        const powerUpType = block.powerUpType;
        this.spawnPowerUp(block.x, block.y - 50, powerUpType);
        
        this.tweens.add({
            targets: block,
            y: block.y - 10,
            duration: 100,
            yoyo: true
        });
    }
    
    spawnPowerUp(x, y, type) {
        let powerUp;
        
        if (type === 'mushroom') {
            // Super Mushroom (red with white spots)
            powerUp = this.add.container(x, y);
            const cap = this.add.circle(0, -4, 16, 0xff0000);
            const stem = this.add.rectangle(0, 8, 14, 16, 0xffccaa);
            const spot1 = this.add.circle(-6, -6, 4, 0xffffff);
            const spot2 = this.add.circle(6, -6, 4, 0xffffff);
            const spot3 = this.add.circle(0, -2, 4, 0xffffff);
            powerUp.add([stem, cap, spot1, spot2, spot3]);
            powerUp.powerUpType = 'mushroom';
        } else if (type === 'flower') {
            // Fire Flower
            powerUp = this.add.container(x, y);
            const stem = this.add.rectangle(0, 8, 6, 20, 0x00ff00);
            const center = this.add.circle(0, -6, 8, 0xffff00);
            const petal1 = this.add.circle(0, -14, 6, 0xff6600);
            const petal2 = this.add.circle(-8, -6, 6, 0xff6600);
            const petal3 = this.add.circle(8, -6, 6, 0xff6600);
            const petal4 = this.add.circle(0, 2, 6, 0xff6600);
            powerUp.add([stem, petal1, petal2, petal3, petal4, center]);
            powerUp.powerUpType = 'flower';
        } else if (type === 'star') {
            // Star (invincibility)
            powerUp = this.add.container(x, y);
            const star = this.add.star(0, 0, 5, 16, 8, 0xffff00);
            const innerStar = this.add.star(0, 0, 5, 10, 5, 0xffffff);
            powerUp.add([star, innerStar]);
            powerUp.powerUpType = 'star';
            
            // Star has rainbow animation
            this.tweens.add({
                targets: star,
                rotation: Math.PI * 2,
                duration: 1000,
                repeat: -1
            });
        }
        
        this.physics.add.existing(powerUp);
        powerUp.body.setSize(32, 32);
        powerUp.body.setBounce(0.5);
        powerUp.body.setCollideWorldBounds(true);
        
        // All power-ups now fall with gravity enabled
        // They pop out of the block with upward velocity, then fall and start moving
        powerUp.body.setVelocityY(-150);  // Pop out upward
        
        // After popping out, give them horizontal movement after a delay
        this.time.delayedCall(POWER_UP_SPAWN_DELAY_MS, () => {
            if (powerUp && powerUp.active) {
                // Determine direction based on player position
                const direction = this.player.x < powerUp.x ? -1 : 1;
                // Slowly start moving in determined direction
                if (type === 'mushroom' || type === 'star') {
                    powerUp.body.setVelocityX(direction * (type === 'star' ? 100 : 80));
                } else if (type === 'flower') {
                    // Flowers move slower
                    powerUp.body.setVelocityX(direction * 50);
                }
            }
        });
        
        this.powerUps.add(powerUp);
    }
    
    collectPowerUp(player, powerUp) {
        const type = powerUp.powerUpType;
        
        powerUp.destroy();
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);
        
        if (type === 'mushroom' && !this.isPoweredUp) {
            // Become Super Mario
            this.isPoweredUp = true;
            this.player.setScale(1.3);
            this.player.body.setSize(36, 57);
            this.player.body.setOffset(-18, -28);
            this.updatePowerUpText();
        } else if (type === 'flower') {
            // Become Fire Mario - if not powered up, also grow
            if (!this.isPoweredUp) {
                this.isPoweredUp = true;
                this.player.setScale(1.3);
                this.player.body.setSize(36, 57);
                this.player.body.setOffset(-18, -28);
            }
            this.hasFirePower = true;
            if (this.player.body_part) {
                this.player.body_part.setFillStyle(0xffffff);
            }
            this.updatePowerUpText();
            // Emit fire power state for UI
            this.game.events.emit('hasFirePower', true);
        } else if (type === 'star') {
            // Invincibility
            this.isInvincible = true;
            this.updatePowerUpText();
            
            // Flash effect
            this.tweens.add({
                targets: this.player,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 100
            });
            
            // Remove invincibility after 10 seconds
            if (this.invincibleTimer) {
                this.invincibleTimer.remove();
            }
            this.invincibleTimer = this.time.delayedCall(10000, () => {
                this.isInvincible = false;
                this.player.setAlpha(1);
                this.updatePowerUpText();
            });
        }
        
        // Store power-up state
        this.registry.set('isPoweredUp', this.isPoweredUp);
        this.registry.set('hasFirePower', this.hasFirePower);
    }
    
    collectPowerUp2(player, powerUp) {
        const type = powerUp.powerUpType;
        
        powerUp.destroy();
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);
        
        if (type === 'mushroom' && !this.isPoweredUp2) {
            // Become Super Luigi
            this.isPoweredUp2 = true;
            this.player2.setScale(1.3);
            this.player2.body.setSize(36, 57);
            this.player2.body.setOffset(-18, -28);
            this.updatePowerUpText();
        } else if (type === 'flower') {
            // Become Fire Luigi - if not powered up, also grow
            if (!this.isPoweredUp2) {
                this.isPoweredUp2 = true;
                this.player2.setScale(1.3);
                this.player2.body.setSize(36, 57);
                this.player2.body.setOffset(-18, -28);
            }
            this.hasFirePower2 = true;
            if (this.player2.body_part) {
                this.player2.body_part.setFillStyle(0xffffff);
            }
            this.updatePowerUpText();
            // Emit fire power state for UI
            this.game.events.emit('hasFirePower', this.hasFirePower || this.hasFirePower2);
        } else if (type === 'star') {
            // Invincibility for player 2
            this.isInvincible2 = true;
            this.updatePowerUpText();
            
            // Flash effect
            this.tweens.add({
                targets: this.player2,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 100
            });
            
            // Remove invincibility after 10 seconds
            if (this.invincibleTimer2) {
                this.invincibleTimer2.remove();
            }
            this.invincibleTimer2 = this.time.delayedCall(10000, () => {
                this.isInvincible2 = false;
                this.player2.setAlpha(1);
                this.updatePowerUpText();
            });
        }
        
        // Store power-up state
        this.registry.set('isPoweredUp2', this.isPoweredUp2);
        this.registry.set('hasFirePower2', this.hasFirePower2);
    }

    collectCoin(player, coin) {
        // Stop all tweens on the coin before collection
        this.tweens.killTweensOf(coin);
        
        // Coin collection animation - scale up and fade out
        this.tweens.add({
            targets: coin,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                coin.destroy();
            }
        });
        
        this.score += 10;
        this.coinsCollected++; // Track coins collected
        this.scoreText.setText('Score: ' + this.score);
        
        // Play a simple sound effect (visual feedback)
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
    }
    
    reachFlag(player, flag) {
        if (this.gameOver || this.levelComplete) return;
        
        this.levelComplete = true;
        this.physics.pause();
        
        // Bonus for completing level
        this.score += 100;
        this.scoreText.setText('Score: ' + this.score);
        
        const levelCompleteText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'LEVEL COMPLETE!',
            {
                fontSize: '64px',
                fontFamily: 'Arial',
                color: '#ffff00',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        levelCompleteText.setOrigin(0.5);
        levelCompleteText.setScrollFactor(0);
        
        const bonusText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 30,
            'Bonus: +100\nScore: ' + this.score,
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        bonusText.setOrigin(0.5);
        bonusText.setScrollFactor(0);
        
        const currentLevel = this.registry.get('currentLevel') || 1;
        const nextLevel = currentLevel + 1;
        
        let continueText;
        if (nextLevel <= 3) {
            continueText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 120,
                'Tap to Continue to Level ' + nextLevel,
                {
                    fontSize: '28px',
                    fontFamily: 'Arial',
                    color: '#00ff00',
                    align: 'center',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            );
        } else {
            // Level 3 completed - show stats and credits
            this.showGameCompleteScreen();
            return; // Exit early to not set up default handlers
        }
        continueText.setOrigin(0.5);
        continueText.setScrollFactor(0);
        
        // Blinking animation
        this.tweens.add({
            targets: continueText,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        
        // Store score and stats in registry
        this.registry.set('score', this.score);
        this.registry.set('coinsCollected', this.coinsCollected);
        this.registry.set('enemiesDefeated', this.enemiesDefeated);
        
        this.input.once('pointerdown', () => {
            if (nextLevel <= 3) {
                this.registry.set('currentLevel', nextLevel);
                this.scene.restart();
                this.levelComplete = false;
            }
        });
        
        this.input.keyboard.once('keydown-SPACE', () => {
            if (nextLevel <= 3) {
                this.registry.set('currentLevel', nextLevel);
                this.scene.restart();
                this.levelComplete = false;
            }
        });
    }
    
    showGameCompleteScreen() {
        // Clear existing UI elements
        this.scoreText.setVisible(false);
        this.levelText.setVisible(false);
        this.powerUpText.setVisible(false);
        
        // Title
        const titleText = this.add.text(
            this.cameras.main.centerX,
            80,
            '🎉 GAME COMPLETE! 🎉',
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ffff00',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);
        
        // Stats section
        const statsText = this.add.text(
            this.cameras.main.centerX,
            180,
            '═══ FINAL STATS ═══\n\n' +
            'Final Score: ' + this.score + '\n' +
            'Coins Collected: ' + this.coinsCollected + '\n' +
            'Enemies Defeated: ' + this.enemiesDefeated + '\n' +
            'Levels Completed: 3\n' +
            (this.gameMode === 2 ? 'Players: ' + this.player1Name + ' & ' + this.player2Name : 'Player: ' + this.player1Name),
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        statsText.setOrigin(0.5);
        statsText.setScrollFactor(0);
        
        // Credits section
        const creditsText = this.add.text(
            this.cameras.main.centerX,
            370,
            '═══ CREDITS ═══\n\n' +
            'Game Design: Mario Game\n' +
            'Built with: Phaser 3\n' +
            'Platform: JavaScript/HTML5\n' +
            'Thanks for playing!',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#aaffaa',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        creditsText.setOrigin(0.5);
        creditsText.setScrollFactor(0);
        
        // Share button
        const shareText = this.add.text(
            this.cameras.main.centerX - 100,
            500,
            '📤 Share Stats',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#00ffff',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4,
                backgroundColor: '#006666',
                padding: { x: 15, y: 10 }
            }
        );
        shareText.setOrigin(0.5);
        shareText.setScrollFactor(0);
        shareText.setInteractive({ useHandCursor: true });
        
        shareText.on('pointerdown', () => {
            this.shareStats();
        });
        
        shareText.on('pointerover', () => {
            shareText.setScale(1.1);
        });
        
        shareText.on('pointerout', () => {
            shareText.setScale(1);
        });
        
        // Restart button
        const restartText = this.add.text(
            this.cameras.main.centerX + 100,
            500,
            '🔄 Play Again',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#00ff00',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4,
                backgroundColor: '#006600',
                padding: { x: 15, y: 10 }
            }
        );
        restartText.setOrigin(0.5);
        restartText.setScrollFactor(0);
        restartText.setInteractive({ useHandCursor: true });
        
        restartText.on('pointerdown', () => {
            this.resetGameState();
            this.scene.restart();
            this.levelComplete = false;
        });
        
        restartText.on('pointerover', () => {
            restartText.setScale(1.1);
        });
        
        restartText.on('pointerout', () => {
            restartText.setScale(1);
        });
        
        // Keyboard support
        this.input.keyboard.once('keydown-SPACE', () => {
            this.resetGameState();
            this.scene.restart();
            this.levelComplete = false;
        });
    }
    
    shareStats() {
        const statsMessage = `🎮 I completed Mario Game! 🎮\n\n` +
            `Final Score: ${this.score}\n` +
            `Coins: ${this.coinsCollected}\n` +
            `Enemies Defeated: ${this.enemiesDefeated}\n` +
            `All 3 levels completed!\n\n` +
            `Can you beat my score?`;
        
        // Try Web Share API first (mobile-friendly)
        if (navigator.share) {
            navigator.share({
                title: 'Mario Game Stats',
                text: statsMessage
            }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackCopyToClipboard(statsMessage);
            });
        } else {
            // Fallback: copy to clipboard
            this.fallbackCopyToClipboard(statsMessage);
        }
    }
    
    fallbackCopyToClipboard(text) {
        // Try modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCopyNotification();
            }).catch(err => {
                console.log('Clipboard error:', err);
                // Last resort: show text for manual copy
                this.showManualCopyDialog(text);
            });
        } else {
            // Very old browsers
            this.showManualCopyDialog(text);
        }
    }
    
    showCopyNotification() {
        const notification = this.add.text(
            this.cameras.main.centerX,
            550,
            '✓ Stats copied to clipboard!',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#00ff00',
                backgroundColor: '#003300',
                padding: { x: 10, y: 5 }
            }
        );
        notification.setOrigin(0.5);
        notification.setScrollFactor(0);
        
        // Fade out after 2 seconds
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: notification,
                alpha: 0,
                duration: 500,
                onComplete: () => notification.destroy()
            });
        });
    }
    
    showManualCopyDialog(text) {
        alert('Stats:\n\n' + text + '\n\n(Copy this text to share!)');
    }

    hitEnemy(player, enemy) {
        if (this.gameOver) return;
        
        // If invincible, destroy enemy
        if (this.isInvincible) {
            enemy.destroy();
            this.score += 50;
            this.enemiesDefeated++; // Track enemies defeated
            this.scoreText.setText('Score: ' + this.score);
            return;
        }
        
        // Check if player is falling onto enemy from above
        // Improved collision detection: player must be above enemy and moving downward
        // More lenient threshold for better gameplay
        if (player.body.velocity.y > 0 && player.y < enemy.y - 5) {
            // Bounce and destroy enemy
            player.body.setVelocityY(-300);
            enemy.destroy();
            this.score += 50;
            this.enemiesDefeated++; // Track enemies defeated
            this.scoreText.setText('Score: ' + this.score);
        } else {
            // Player hit from side - take damage or die
            if (this.isPoweredUp) {
                // Lose power-up instead of dying
                if (this.hasFirePower) {
                    this.hasFirePower = false;
                    if (this.player.body_part) {
                        this.player.body_part.setFillStyle(0xff0000);
                    }
                    // Emit fire power state for UI
                    this.game.events.emit('hasFirePower', false);
                } else {
                    this.isPoweredUp = false;
                    this.player.setScale(1);
                    this.player.body.setSize(28, 44);
                    this.player.body.setOffset(-14, -22);
                }
                this.updatePowerUpText();
                this.registry.set('isPoweredUp', this.isPoweredUp);
                this.registry.set('hasFirePower', this.hasFirePower);
                
                // Brief invincibility after taking damage
                this.isInvincible = true;
                this.tweens.add({
                    targets: this.player,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true,
                    repeat: 15
                });
                this.time.delayedCall(3000, () => {
                    this.isInvincible = false;
                    this.player.setAlpha(1);
                });
            } else {
                // Game over - play death animation
                this.gameOver = true;
                this.physics.pause();
                
                // Death animation - Mario spins and falls
                this.tweens.add({
                    targets: this.player,
                    angle: 720,
                    y: this.player.y - 100,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Cubic.easeIn',
                    onComplete: () => {
                        // Return to start screen after animation
                        this.resetGameState();
                        this.scene.start('StartScene');
                        this.gameOver = false;
                    }
                });
            }
        }
    }
    
    hitEnemy2(player, enemy) {
        if (this.gameOver) return;
        
        // If invincible, destroy enemy
        if (this.isInvincible2) {
            enemy.destroy();
            this.score += 50;
            this.enemiesDefeated++; // Track enemies defeated
            this.scoreText.setText('Score: ' + this.score);
            return;
        }
        
        // Check if player is falling onto enemy from above
        if (player.body.velocity.y > 0 && player.y < enemy.y - 5) {
            // Bounce and destroy enemy
            player.body.setVelocityY(-300);
            enemy.destroy();
            this.score += 50;
            this.enemiesDefeated++; // Track enemies defeated
            this.scoreText.setText('Score: ' + this.score);
        } else {
            // Player hit from side - take damage or die
            if (this.isPoweredUp2) {
                // Lose power-up instead of dying
                if (this.hasFirePower2) {
                    this.hasFirePower2 = false;
                    if (this.player2.body_part) {
                        this.player2.body_part.setFillStyle(0x00ff00);
                    }
                    // Emit fire power state for UI (check both players)
                    this.game.events.emit('hasFirePower', this.hasFirePower || this.hasFirePower2);
                } else {
                    this.isPoweredUp2 = false;
                    this.player2.setScale(1);
                    this.player2.body.setSize(28, 44);
                    this.player2.body.setOffset(-14, -22);
                }
                this.updatePowerUpText();
                this.registry.set('isPoweredUp2', this.isPoweredUp2);
                this.registry.set('hasFirePower2', this.hasFirePower2);
                
                // Brief invincibility after taking damage
                this.isInvincible2 = true;
                this.tweens.add({
                    targets: this.player2,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true,
                    repeat: 15
                });
                this.time.delayedCall(3000, () => {
                    this.isInvincible2 = false;
                    this.player2.setAlpha(1);
                });
            } else {
                // Player 2 dies - just respawn them
                this.player2.setPosition(150, 450);
                this.player2.setAlpha(0.5);
                this.time.delayedCall(1000, () => {
                    this.player2.setAlpha(1);
                });
            }
        }
    }
    
    fireballHitEnemy(fireball, enemy) {
        // Stop animations
        const tweenTargets = [fireball];
        if (fireball.innerCircle && fireball.innerCircle.active) {
            tweenTargets.push(fireball.innerCircle);
            fireball.innerCircle.destroy();
        }
        this.tweens.killTweensOf(tweenTargets);
        
        // Clear delayed destruction timer if it exists
        if (fireball.destructionTimer) {
            fireball.destructionTimer.remove();
        }
        fireball.destroy();
        enemy.destroy();
        this.score += 50;
        this.enemiesDefeated++; // Track enemies defeated
        this.scoreText.setText('Score: ' + this.score);
    }
    
    hitPlatformWithFireball(fireball, platform) {
        // Stop animations
        const tweenTargets = [fireball];
        if (fireball.innerCircle && fireball.innerCircle.active) {
            tweenTargets.push(fireball.innerCircle);
            fireball.innerCircle.destroy();
        }
        this.tweens.killTweensOf(tweenTargets);
        
        // Clear delayed destruction timer if it exists
        if (fireball.destructionTimer) {
            fireball.destructionTimer.remove();
        }
        fireball.destroy();
    }
    
    shootFireball() {
        if (!this.hasFirePower) return;
        
        // Create fireball
        const direction = this.player.scaleX > 0 ? 1 : -1;
        const fireball = this.add.circle(
            this.player.x + (direction * 20),
            this.player.y,
            10,
            0xff6600
        );
        
        const fireballInner = this.add.circle(
            this.player.x + (direction * 20),
            this.player.y,
            6,
            0xffff00
        );
        
        this.physics.add.existing(fireball);
        fireball.body.setVelocityX(direction * 400);
        fireball.body.setVelocityY(-150);  // Consistent upward velocity for arc
        fireball.body.setBounce(0.5);  // Moderate bounce factor
        fireball.body.setAllowGravity(true);
        fireball.body.setCollideWorldBounds(false);  // Manual bounds checking for cleanup
        fireball.innerCircle = fireballInner;
        
        this.fireballs.add(fireball);
        
        // Animate fireball - combined rotation and pulsing effect
        this.tweens.add({
            targets: [fireball, fireballInner],
            rotation: Math.PI * 2,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Destroy after 3 seconds
        fireball.destructionTimer = this.time.delayedCall(3000, () => {
            if (fireball && fireball.active) {
                const tweenTargets = [fireball];
                if (fireball.innerCircle && fireball.innerCircle.active) {
                    tweenTargets.push(fireball.innerCircle);
                    fireball.innerCircle.destroy();
                }
                this.tweens.killTweensOf(tweenTargets);
                fireball.destroy();
            }
        });
    }
    
    shootFireball2() {
        if (!this.hasFirePower2) return;
        
        // Create fireball for player 2
        const direction = this.player2.scaleX > 0 ? 1 : -1;
        const fireball = this.add.circle(
            this.player2.x + (direction * 20),
            this.player2.y,
            10,
            0x00ff00  // Green fireball for Luigi
        );
        
        const fireballInner = this.add.circle(
            this.player2.x + (direction * 20),
            this.player2.y,
            6,
            0xffff00
        );
        
        this.physics.add.existing(fireball);
        fireball.body.setVelocityX(direction * 400);
        fireball.body.setVelocityY(-150);
        fireball.body.setBounce(0.5);
        fireball.body.setAllowGravity(true);
        fireball.body.setCollideWorldBounds(false);
        fireball.innerCircle = fireballInner;
        
        this.fireballs2.add(fireball);
        
        // Animate fireball
        this.tweens.add({
            targets: [fireball, fireballInner],
            rotation: Math.PI * 2,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Destroy after 3 seconds
        fireball.destructionTimer = this.time.delayedCall(3000, () => {
            if (fireball && fireball.active) {
                const tweenTargets = [fireball];
                if (fireball.innerCircle && fireball.innerCircle.active) {
                    tweenTargets.push(fireball.innerCircle);
                    fireball.innerCircle.destroy();
                }
                this.tweens.killTweensOf(tweenTargets);
                fireball.destroy();
            }
        });
    }

    update() {
        if (this.gameOver || this.levelComplete) return;

        // Update enemy movement (bounce off platforms)
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.body.blocked.right || enemy.body.blocked.left) {
                enemy.body.setVelocityX(-enemy.body.velocity.x);
            }
        });
        
        // Update boss movement
        if (this.boss && this.boss.active) {
            // Bounce boss off world bounds
            if (this.boss.body.blocked.right) {
                this.boss.moveDirection = -1;
                this.boss.body.setVelocityX(this.boss.moveSpeed * this.boss.moveDirection);
            } else if (this.boss.body.blocked.left) {
                this.boss.moveDirection = 1;
                this.boss.body.setVelocityX(this.boss.moveSpeed * this.boss.moveDirection);
            }
        }
        
        // Update power-ups movement
        this.powerUps.children.entries.forEach(powerUp => {
            if (powerUp.body && (powerUp.body.blocked.right || powerUp.body.blocked.left)) {
                powerUp.body.setVelocityX(-powerUp.body.velocity.x);
            }
        });
        
        // Update fireballs positions (player 1)
        const FIREBALL_BOTTOM_MARGIN = 100;  // Buffer below screen for cleanup
        this.fireballs.children.entries.forEach(fireball => {
            if (fireball.innerCircle) {
                fireball.innerCircle.setPosition(fireball.x, fireball.y);
            }
            // Destroy fireballs that go out of bounds
            if (fireball.x < 0 || fireball.x > this.physics.world.bounds.width || 
                fireball.y > this.physics.world.bounds.height + FIREBALL_BOTTOM_MARGIN) {
                if (fireball.innerCircle && fireball.innerCircle.active) {
                    fireball.innerCircle.destroy();
                }
                if (fireball.destructionTimer) {
                    fireball.destructionTimer.remove();
                }
                this.tweens.killTweensOf(fireball);
                fireball.destroy();
            }
        });
        
        // Update fireballs positions (player 2) - only in 2-player mode
        if (this.gameMode === 2) {
            this.fireballs2.children.entries.forEach(fireball => {
                if (fireball.innerCircle) {
                    fireball.innerCircle.setPosition(fireball.x, fireball.y);
                }
                if (fireball.x < 0 || fireball.x > this.physics.world.bounds.width || 
                    fireball.y > this.physics.world.bounds.height + FIREBALL_BOTTOM_MARGIN) {
                    if (fireball.innerCircle && fireball.innerCircle.active) {
                        fireball.innerCircle.destroy();
                    }
                    if (fireball.destructionTimer) {
                        fireball.destructionTimer.remove();
                    }
                    this.tweens.killTweensOf(fireball);
                    fireball.destroy();
                }
            });
        }

        // Get touch controls from registry
        const moveLeft = this.registry.get('moveLeft');
        const moveRight = this.registry.get('moveRight');
        const jumpPressed = this.registry.get('jump');
        const firePressed = this.registry.get('fire');

        if (this.gameMode === 1) {
            // 1-Player mode: Player 1 uses Arrow keys or touch controls
            const scaleX = this.isPoweredUp ? (this.player.scaleX < 0 ? -1.3 : 1.3) : 1;
            const scaleY = this.isPoweredUp ? 1.3 : 1;
            
            if (this.cursors.left.isDown || moveLeft) {
                this.player.body.setVelocityX(-200);
                this.player.setScale(-Math.abs(scaleX), scaleY);
            } else if (this.cursors.right.isDown || moveRight) {
                this.player.body.setVelocityX(200);
                this.player.setScale(Math.abs(scaleX), scaleY);
            } else {
                this.player.body.setVelocityX(0);
            }

            // Jump - Up arrow or touch
            if ((this.cursors.up.isDown || jumpPressed) && this.player.body.touching.down) {
                this.player.body.setVelocityY(-400);
            }
            
            // Fire - X key or touch
            if (Phaser.Input.Keyboard.JustDown(this.fireKey) || (firePressed && !this.lastFirePressed)) {
                this.shootFireball();
            }
            this.lastFirePressed = firePressed;
        } else {
            // 2-Player mode: Player 1 uses WASD, Player 2 uses Arrow keys or touch
            const scaleX = this.isPoweredUp ? (this.player.scaleX < 0 ? -1.3 : 1.3) : 1;
            const scaleY = this.isPoweredUp ? 1.3 : 1;
            
            if (this.wasdKeys.left.isDown) {
                this.player.body.setVelocityX(-200);
                this.player.setScale(-Math.abs(scaleX), scaleY);
            } else if (this.wasdKeys.right.isDown) {
                this.player.body.setVelocityX(200);
                this.player.setScale(Math.abs(scaleX), scaleY);
            } else {
                this.player.body.setVelocityX(0);
            }

            // Jump - W key for player 1
            if (this.wasdKeys.up.isDown && this.player.body.touching.down) {
                this.player.body.setVelocityY(-400);
            }
            
            // Fire - Shift key for player 1
            if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
                this.shootFireball();
            }
            
            // Player 2 movement - Arrow keys or touch
            const scaleX2 = this.isPoweredUp2 ? (this.player2.scaleX < 0 ? -1.3 : 1.3) : 1;
            const scaleY2 = this.isPoweredUp2 ? 1.3 : 1;
            
            if (this.cursors.left.isDown || moveLeft) {
                this.player2.body.setVelocityX(-200);
                this.player2.setScale(-Math.abs(scaleX2), scaleY2);
            } else if (this.cursors.right.isDown || moveRight) {
                this.player2.body.setVelocityX(200);
                this.player2.setScale(Math.abs(scaleX2), scaleY2);
            } else {
                this.player2.body.setVelocityX(0);
            }

            // Jump - Up arrow or touch for player 2
            if ((this.cursors.up.isDown || jumpPressed) && this.player2.body.touching.down) {
                this.player2.body.setVelocityY(-400);
            }
            
            // Fire - X key or touch for player 2
            if (Phaser.Input.Keyboard.JustDown(this.fireKey2) || (firePressed && !this.lastFirePressed)) {
                this.shootFireball2();
            }
            this.lastFirePressed = firePressed;
        }

        // Check if player(s) fell off the world
        if (this.player.y > this.cameras.main.height + this.FALL_OFF_THRESHOLD || 
            (this.gameMode === 2 && this.player2 && this.player2.y > this.cameras.main.height + this.FALL_OFF_THRESHOLD)) {
            this.resetGameState();
            this.scene.restart();
        }
    }
}
