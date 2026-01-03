import Phaser from 'phaser';

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
        } else {
            this.createLevel2Platforms();
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
        if (currentLevel === 2) {
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
        
        // Final section
        this.createPlatform(2650, 480, 150, 32, 0x228B22);
        this.createPlatform(2900, 450, 100, 32, 0x228B22);
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
            blockPositions = [
                { x: 250, y: 440, type: 'mushroom' },      // Reachable from ground
                { x: 600, y: 380, type: 'mushroom' },      // Reachable from platform at 420
                { x: 1150, y: 360, type: 'flower' },       // Reachable from platform at 400
                { x: 1850, y: 380, type: 'star' },         // Reachable from platform at 420
                { x: 2350, y: 410, type: 'mushroom' }      // Reachable from platform at 450
            ];
        } else {
            blockPositions = [
                { x: 420, y: 410, type: 'mushroom' },      // Reachable from platform at 450
                { x: 1000, y: 410, type: 'flower' },       // Reachable from platform at 450
                { x: 1700, y: 440, type: 'star' },         // Reachable from platform at 480
                { x: 2350, y: 420, type: 'mushroom' }      // Reachable from platform at 460
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
        
        // Restore game mode and player names
        this.registry.set('gameMode', gameMode);
        this.registry.set('player1Name', player1Name);
        this.registry.set('player2Name', player2Name);
    }

    createPlayer() {
        // Create Mario character container
        this.player = this.add.container(100, 450);
        
        // Mario body parts
        // Body (red shirt)
        const body = this.add.rectangle(0, 4, 28, 32, 0xff0000);
        
        // Head (skin color)
        const head = this.add.circle(0, -12, 14, 0xffdbac);
        
        // Hat (red cap)
        const hat = this.add.ellipse(0, -20, 32, 16, 0xff0000);
        const hatBrim = this.add.rectangle(0, -14, 32, 6, 0xcc0000);
        
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
        
        // Logo on hat (M)
        const logo = this.add.text(0, -20, 'M', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        logo.setOrigin(0.5);
        
        // Add all parts to container
        this.player.add([shoe1, shoe2, overalls, strap1, strap2, button1, button2, body, head, mustache, hatBrim, hat, eye1, eye2, logo]);
        
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
        } else {
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
                { x: 2400, y: 410 }, { x: 2460, y: 410 },
                
                // Final section
                { x: 2650, y: 430 }, { x: 2710, y: 430 },
                { x: 2900, y: 400 }, { x: 2960, y: 400 }
            ];
        }

        coinPositions.forEach(pos => {
            // Larger coins (16px radius instead of 12px)
            const coin = this.add.circle(pos.x, pos.y, 16, 0xffff00);
            const coinInner = this.add.circle(pos.x, pos.y, 12, 0xffcc00);
            this.physics.add.existing(coin);
            coin.body.setAllowGravity(false);
            coin.innerCircle = coinInner;
            this.coins.add(coin);
            
            // Add rotating/spinning animation
            this.tweens.add({
                targets: [coin, coinInner],
                scaleX: 0.2,
                duration: 400,
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
        } else {
            // Level 2 - more enemies
            enemyPositions = [
                { x: 300, y: 500, speed: 70 },
                { x: 650, y: 450, speed: -90 },
                { x: 950, y: 500, speed: 100 },
                { x: 1150, y: 500, speed: -80 },
                { x: 1400, y: 450, speed: 85 },
                { x: 1650, y: 500, speed: -75 },
                { x: 2100, y: 450, speed: 95 },
                { x: 2350, y: 500, speed: -70 },
                { x: 2750, y: 500, speed: 80 }
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
        // Bowser-like boss at end of level 2
        const bossX = 2900;
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
        this.boss.body.setImmovable(false);  // Allow gravity to affect boss
        this.boss.body.setAllowGravity(true);  // Enable gravity
        this.boss.body.setCollideWorldBounds(true);
        
        // Boss AI
        this.bossHealth = 5;
        this.boss.moveDirection = -1;
        this.boss.moveSpeed = 80;
        this.boss.body.setVelocityX(this.boss.moveSpeed * this.boss.moveDirection);
        
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
        
        // Background
        this.bossHealthBar.fillStyle(0x000000, 0.5);
        this.bossHealthBar.fillRect(
            this.cameras.main.width / 2 - 102,
            this.cameras.main.height - 52,
            204,
            24
        );
        
        // Health bar
        const healthWidth = (this.bossHealth / 5) * 200;
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
            this.scoreText.setText('Score: ' + this.score);
            
            // Show victory
            this.levelComplete = true;
            this.physics.pause();
            
            const victoryText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 50,
                'BOSS DEFEATED!\nYOU WIN!',
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
            victoryText.setOrigin(0.5);
            victoryText.setScrollFactor(0);
            
            const bonusText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                'Boss Bonus: +500\nFinal Score: ' + this.score,
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
            
            const restartText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 130,
                'Tap to Play Again',
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
            restartText.setOrigin(0.5);
            restartText.setScrollFactor(0);
            
            this.tweens.add({
                targets: restartText,
                alpha: 0.3,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
            
            this.input.once('pointerdown', () => {
                this.resetGameState();
                this.scene.restart();
                this.levelComplete = false;
            });
            
            this.input.keyboard.once('keydown-SPACE', () => {
                this.resetGameState();
                this.scene.restart();
                this.levelComplete = false;
            });
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
        
        // Spawn power-up based on type
        const powerUpType = block.powerUpType;
        this.spawnPowerUp(block.x, block.y - 50, powerUpType);
        
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
        
        // Mushrooms and stars move
        if (type === 'mushroom' || type === 'star') {
            powerUp.body.setVelocityX(type === 'star' ? 150 : 100);
        } else {
            powerUp.body.setAllowGravity(false);
        }
        
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
        // Destroy both the coin and its inner circle
        if (coin.innerCircle) {
            coin.innerCircle.destroy();
        }
        coin.destroy();
        this.score += 10;
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
        if (nextLevel <= 2) {
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
            continueText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 120,
                'YOU WIN! All Levels Complete!\nTap to Restart',
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
        
        // Store score in registry
        this.registry.set('score', this.score);
        
        this.input.once('pointerdown', () => {
            if (nextLevel <= 2) {
                this.registry.set('currentLevel', nextLevel);
                this.scene.restart();
                this.levelComplete = false;
            } else {
                // Reset to level 1 after completing all levels
                this.resetGameState();
                this.scene.restart();
                this.levelComplete = false;
            }
        });
        
        this.input.keyboard.once('keydown-SPACE', () => {
            if (nextLevel <= 2) {
                this.registry.set('currentLevel', nextLevel);
                this.scene.restart();
                this.levelComplete = false;
            } else {
                // Reset to level 1 after completing all levels
                this.resetGameState();
                this.scene.restart();
                this.levelComplete = false;
            }
        });
    }

    hitEnemy(player, enemy) {
        if (this.gameOver) return;
        
        // If invincible, destroy enemy
        if (this.isInvincible) {
            enemy.destroy();
            this.score += 50;
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
            this.scoreText.setText('Score: ' + this.score);
            return;
        }
        
        // Check if player is falling onto enemy from above
        if (player.body.velocity.y > 0 && player.y < enemy.y - 5) {
            // Bounce and destroy enemy
            player.body.setVelocityY(-300);
            enemy.destroy();
            this.score += 50;
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
