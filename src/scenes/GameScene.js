import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.cursors = null;
        this.platforms = null;
        this.coins = null;
        this.score = 0;
        this.scoreText = null;
        this.enemies = null;
        this.gameOver = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create sky background gradient
        this.add.rectangle(width / 2, height / 2, width, height, 0x5c94fc);

        // Create platforms group
        this.platforms = this.physics.add.staticGroup();

        // Ground
        this.createPlatform(0, height - 32, width, 64, 0x8B4513);
        
        // Floating platforms
        this.createPlatform(600, 400, 200, 32, 0x228B22);
        this.createPlatform(400, 300, 200, 32, 0x228B22);
        this.createPlatform(50, 250, 200, 32, 0x228B22);
        this.createPlatform(650, 200, 150, 32, 0x228B22);

        // Create player (Mario)
        this.createPlayer();

        // Create coins
        this.createCoins();

        // Create enemies
        this.createEnemies();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Overlap for collecting coins
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        
        // Collision with enemies
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Initialize touch controls from registry
        this.registry.set('moveLeft', false);
        this.registry.set('moveRight', false);
        this.registry.set('jump', false);
    }

    createPlatform(x, y, width, height, color) {
        const platform = this.add.rectangle(x + width/2, y + height/2, width, height, color);
        this.physics.add.existing(platform, true);
        this.platforms.add(platform);
    }

    createPlayer() {
        // Create Mario character
        this.player = this.add.rectangle(100, 450, 32, 32, 0xff0000);
        this.physics.add.existing(this.player);
        this.player.body.setBounce(0.1);
        this.player.body.setCollideWorldBounds(true);
        
        // Add a simple face to Mario
        const eye1 = this.add.circle(0, -4, 3, 0xffffff);
        const eye2 = this.add.circle(8, -4, 3, 0xffffff);
        const hat = this.add.rectangle(0, -12, 32, 8, 0x0000ff);
        
        this.player.eyes = this.add.container(this.player.x, this.player.y, [eye1, eye2, hat]);
    }

    createCoins() {
        this.coins = this.physics.add.group();

        const coinPositions = [
            { x: 600, y: 350 },
            { x: 650, y: 350 },
            { x: 700, y: 350 },
            { x: 400, y: 250 },
            { x: 450, y: 250 },
            { x: 100, y: 200 },
            { x: 150, y: 200 },
            { x: 700, y: 150 }
        ];

        coinPositions.forEach(pos => {
            const coin = this.add.circle(pos.x, pos.y, 10, 0xffff00);
            this.physics.add.existing(coin);
            coin.body.setAllowGravity(false);
            this.coins.add(coin);
            
            // Add spinning animation
            this.tweens.add({
                targets: coin,
                scaleX: 0.5,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        });
    }

    createEnemies() {
        this.enemies = this.physics.add.group();

        // Create simple enemies
        const enemy1 = this.add.rectangle(500, 250, 32, 32, 0x8b0000);
        this.physics.add.existing(enemy1);
        enemy1.body.setBounce(0);
        enemy1.body.setCollideWorldBounds(true);
        enemy1.body.setVelocityX(100);
        this.enemies.add(enemy1);

        const enemy2 = this.add.rectangle(200, 200, 32, 32, 0x8b0000);
        this.physics.add.existing(enemy2);
        enemy2.body.setBounce(0);
        enemy2.body.setCollideWorldBounds(true);
        enemy2.body.setVelocityX(-80);
        this.enemies.add(enemy2);
    }

    collectCoin(player, coin) {
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

    hitEnemy(player, enemy) {
        if (this.gameOver) return;
        
        // Check if player is falling onto enemy from above
        if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
            // Bounce and destroy enemy
            player.body.setVelocityY(-300);
            enemy.destroy();
            this.score += 50;
            this.scoreText.setText('Score: ' + this.score);
        } else {
            // Game over
            this.gameOver = true;
            this.physics.pause();
            player.setTint(0xff0000);
            
            const gameOverText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'GAME OVER\nTap to Restart',
                {
                    fontSize: '48px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    align: 'center',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 8
                }
            );
            gameOverText.setOrigin(0.5);
            
            this.input.once('pointerdown', () => {
                this.scene.restart();
                this.gameOver = false;
                this.score = 0;
            });
            
            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.restart();
                this.gameOver = false;
                this.score = 0;
            });
        }
    }

    update() {
        if (this.gameOver) return;

        // Update enemy movement (bounce off platforms)
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.body.blocked.right || enemy.body.blocked.left) {
                enemy.body.setVelocityX(-enemy.body.velocity.x);
            }
        });

        // Get touch controls from registry
        const moveLeft = this.registry.get('moveLeft');
        const moveRight = this.registry.get('moveRight');
        const jumpPressed = this.registry.get('jump');

        // Player movement - keyboard
        if (this.cursors.left.isDown || moveLeft) {
            this.player.body.setVelocityX(-200);
            if (this.player.eyes) {
                this.player.eyes.setScale(-1, 1);
            }
        } else if (this.cursors.right.isDown || moveRight) {
            this.player.body.setVelocityX(200);
            if (this.player.eyes) {
                this.player.eyes.setScale(1, 1);
            }
        } else {
            this.player.body.setVelocityX(0);
        }

        // Jump - keyboard or touch
        if ((this.cursors.up.isDown || jumpPressed) && this.player.body.touching.down) {
            this.player.body.setVelocityY(-400);
        }

        // Update eyes position
        if (this.player.eyes) {
            this.player.eyes.setPosition(this.player.x, this.player.y);
        }

        // Check if player fell off the world
        if (this.player.y > this.cameras.main.height + 50) {
            this.scene.restart();
            this.score = 0;
        }
    }
}
