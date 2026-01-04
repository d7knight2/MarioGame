/**
 * BackgroundGenerator - Creates parallax background layers and environmental decorations
 */

export default class BackgroundGenerator {
    /**
     * Create a multi-layer parallax background
     * @param {Phaser.Scene} scene - The scene to create background in
     * @param {number} worldWidth - Width of the game world
     * @param {number} worldHeight - Height of the game world
     */
    static createParallaxBackground(scene, worldWidth, worldHeight) {
        const layers = [];
        
        // Layer 1: Sky gradient (already exists as base, but we can add clouds)
        const cloudLayer = this.createCloudLayer(scene, worldWidth, worldHeight);
        cloudLayer.setScrollFactor(0.1);
        layers.push(cloudLayer);
        
        // Layer 2: Distant mountains
        const mountainLayer = this.createMountainLayer(scene, worldWidth, worldHeight);
        mountainLayer.setScrollFactor(0.3);
        layers.push(mountainLayer);
        
        // Layer 3: Hills
        const hillLayer = this.createHillLayer(scene, worldWidth, worldHeight);
        hillLayer.setScrollFactor(0.5);
        layers.push(hillLayer);
        
        // Layer 4: Bushes and decorations (foreground details)
        const bushLayer = this.createBushLayer(scene, worldWidth, worldHeight);
        bushLayer.setScrollFactor(0.9);
        layers.push(bushLayer);
        
        return layers;
    }
    
    /**
     * Create cloud layer
     * @param {Phaser.Scene} scene - The scene
     * @param {number} worldWidth - World width
     * @param {number} worldHeight - World height
     */
    static createCloudLayer(scene, worldWidth, worldHeight) {
        const container = scene.add.container(0, 0);
        
        // Create several clouds
        const cloudPositions = [
            { x: 200, y: 80 },
            { x: 500, y: 120 },
            { x: 900, y: 60 },
            { x: 1300, y: 100 },
            { x: 1700, y: 80 },
            { x: 2100, y: 110 },
            { x: 2500, y: 70 },
            { x: 2900, y: 90 }
        ];
        
        cloudPositions.forEach(pos => {
            const cloud = this.createCloud(scene, pos.x, pos.y);
            container.add(cloud);
            
            // Animate clouds moving slowly
            scene.tweens.add({
                targets: cloud,
                x: pos.x + 50,
                duration: 20000 + Math.random() * 10000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
        
        return container;
    }
    
    /**
     * Create a single cloud
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static createCloud(scene, x, y) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffffff, 0.8);
        
        // Draw cloud as overlapping circles
        graphics.fillCircle(0, 0, 20);
        graphics.fillCircle(15, -5, 18);
        graphics.fillCircle(30, 0, 20);
        graphics.fillCircle(22, 8, 15);
        graphics.fillCircle(8, 10, 15);
        
        graphics.setPosition(x, y);
        return graphics;
    }
    
    /**
     * Create mountain layer
     * @param {Phaser.Scene} scene - The scene
     * @param {number} worldWidth - World width
     * @param {number} worldHeight - World height
     */
    static createMountainLayer(scene, worldWidth, worldHeight) {
        const graphics = scene.add.graphics();
        
        // Draw distant mountains with gradient effect
        graphics.fillStyle(0x4a6fa5, 0.6);
        
        // Mountain 1
        graphics.beginPath();
        graphics.moveTo(0, worldHeight - 200);
        graphics.lineTo(300, worldHeight - 400);
        graphics.lineTo(600, worldHeight - 200);
        graphics.closePath();
        graphics.fillPath();
        
        // Mountain 2
        graphics.beginPath();
        graphics.moveTo(400, worldHeight - 200);
        graphics.lineTo(800, worldHeight - 450);
        graphics.lineTo(1200, worldHeight - 200);
        graphics.closePath();
        graphics.fillPath();
        
        // Mountain 3
        graphics.beginPath();
        graphics.moveTo(1000, worldHeight - 200);
        graphics.lineTo(1400, worldHeight - 380);
        graphics.lineTo(1800, worldHeight - 200);
        graphics.closePath();
        graphics.fillPath();
        
        // Mountain 4
        graphics.beginPath();
        graphics.moveTo(1600, worldHeight - 200);
        graphics.lineTo(2000, worldHeight - 420);
        graphics.lineTo(2400, worldHeight - 200);
        graphics.closePath();
        graphics.fillPath();
        
        // Mountain 5
        graphics.beginPath();
        graphics.moveTo(2200, worldHeight - 200);
        graphics.lineTo(2600, worldHeight - 390);
        graphics.lineTo(3000, worldHeight - 200);
        graphics.closePath();
        graphics.fillPath();
        
        return graphics;
    }
    
    /**
     * Create hill layer
     * @param {Phaser.Scene} scene - The scene
     * @param {number} worldWidth - World width
     * @param {number} worldHeight - World height
     */
    static createHillLayer(scene, worldWidth, worldHeight) {
        const graphics = scene.add.graphics();
        
        // Draw rolling hills
        graphics.fillStyle(0x228B22, 0.7);
        
        // Create smooth hills using bezier curves
        graphics.beginPath();
        graphics.moveTo(0, worldHeight - 150);
        
        for (let x = 0; x < worldWidth; x += 400) {
            graphics.bezierCurveTo(
                x + 100, worldHeight - 200,
                x + 300, worldHeight - 200,
                x + 400, worldHeight - 150
            );
        }
        
        graphics.lineTo(worldWidth, worldHeight);
        graphics.lineTo(0, worldHeight);
        graphics.closePath();
        graphics.fillPath();
        
        return graphics;
    }
    
    /**
     * Create bush layer
     * @param {Phaser.Scene} scene - The scene
     * @param {number} worldWidth - World width
     * @param {number} worldHeight - World height
     */
    static createBushLayer(scene, worldWidth, worldHeight) {
        const container = scene.add.container(0, 0);
        
        // Add bushes at regular intervals
        const bushPositions = [
            { x: 100, y: worldHeight - 50 },
            { x: 400, y: worldHeight - 50 },
            { x: 800, y: worldHeight - 50 },
            { x: 1200, y: worldHeight - 50 },
            { x: 1600, y: worldHeight - 50 },
            { x: 2000, y: worldHeight - 50 },
            { x: 2400, y: worldHeight - 50 },
            { x: 2800, y: worldHeight - 50 }
        ];
        
        bushPositions.forEach(pos => {
            const bush = this.createBush(scene, pos.x, pos.y);
            container.add(bush);
        });
        
        return container;
    }
    
    /**
     * Create a single bush
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static createBush(scene, x, y) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0x006400, 0.8);
        
        // Draw bush as overlapping circles
        graphics.fillCircle(0, 0, 15);
        graphics.fillCircle(12, -3, 13);
        graphics.fillCircle(24, 0, 15);
        graphics.fillCircle(-12, -3, 13);
        graphics.fillCircle(12, 8, 10);
        graphics.fillCircle(-8, 8, 10);
        
        // Add highlights
        graphics.fillStyle(0x228B22, 0.6);
        graphics.fillCircle(-8, -5, 8);
        graphics.fillCircle(16, -5, 8);
        
        graphics.setPosition(x, y);
        return graphics;
    }
    
    /**
     * Create pipes (Mario-style pipes)
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} height - Pipe height
     */
    static createPipe(scene, x, y, height = 80) {
        const graphics = scene.add.graphics();
        
        // Pipe body
        graphics.fillStyle(0x00aa00, 1);
        graphics.fillRect(0, 0, 60, height);
        
        // Darker side for 3D effect
        graphics.fillStyle(0x008800, 1);
        graphics.fillRect(50, 0, 10, height);
        
        // Pipe top (rim)
        graphics.fillStyle(0x00cc00, 1);
        graphics.fillRect(-5, -10, 70, 10);
        
        // Top rim darker edge
        graphics.fillStyle(0x00aa00, 1);
        graphics.fillRect(-5, 0, 70, 3);
        
        // Inner shadow
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillCircle(30, -5, 20);
        
        graphics.setPosition(x, y - height);
        return graphics;
    }
    
    /**
     * Add pipes to the scene at specific locations
     * @param {Phaser.Scene} scene - The scene
     * @param {number} worldHeight - World height
     */
    static addPipes(scene, worldHeight) {
        const pipePositions = [
            { x: 600, height: 80 },
            { x: 1500, height: 100 },
            { x: 2300, height: 80 }
        ];
        
        const pipes = [];
        pipePositions.forEach(pos => {
            const pipe = this.createPipe(scene, pos.x, worldHeight - 32, pos.height);
            pipes.push(pipe);
        });
        
        return pipes;
    }
}
