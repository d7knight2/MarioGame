/**
 * SpriteFactory - Creates enhanced sprite-based graphics for game entities
 * Uses Phaser's graphics API to generate textured sprites with better visual quality
 */

export default class SpriteFactory {
    /**
     * Create an enhanced Mario/Luigi/Toad character sprite with animation frames
     * @param {Phaser.Scene} scene - The scene to create sprites in
     * @param {string} character - Character type: 'mario', 'luigi', or 'toad'
     * @returns {object} Character graphics components
     */
    static createCharacterSprite(scene, character) {
        // Character-specific colors
        const colors = {
            mario: { body: 0xff0000, hat: 0xff0000, logo: 'M' },
            luigi: { body: 0x00aa00, hat: 0x00aa00, logo: 'L' },
            toad: { body: 0xff69b4, hat: 0xff69b4, logo: 'T' }
        };
        
        const config = colors[character] || colors.mario;
        
        // Create enhanced character with better shading
        const graphics = scene.add.graphics();
        
        // Body with gradient effect
        graphics.fillStyle(config.body, 1);
        graphics.fillRect(6, 18, 28, 32);
        
        // Add shading to body
        graphics.fillStyle(config.body - 0x220000, 0.3);
        graphics.fillRect(10, 20, 8, 28);
        
        // Head (skin color with shading)
        graphics.fillStyle(0xffdbac, 1);
        graphics.fillCircle(20, 12, 14);
        graphics.fillStyle(0xf5c892, 0.5);
        graphics.fillCircle(16, 12, 10);
        
        // Hat with gradient
        graphics.fillStyle(config.hat, 1);
        graphics.fillEllipse(20, 4, 32, 16);
        graphics.fillStyle(config.hat - 0x330000, 1);
        graphics.fillRect(4, 10, 32, 6);
        
        // Overalls with shading
        graphics.fillStyle(0x0066ff, 1);
        graphics.fillRect(10, 26, 24, 16);
        graphics.fillStyle(0x0044cc, 0.5);
        graphics.fillRect(12, 28, 8, 12);
        
        // Straps
        graphics.fillStyle(0x0066ff, 1);
        graphics.fillRect(8, 14, 4, 12);
        graphics.fillRect(28, 14, 4, 12);
        
        // Buttons
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(10, 16, 2);
        graphics.fillCircle(30, 16, 2);
        
        // Eyes
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(16, 12, 3);
        graphics.fillCircle(24, 12, 3);
        
        // Mustache (not for Toad)
        if (character !== 'toad') {
            graphics.fillStyle(0x654321, 1);
            graphics.fillRect(12, 18, 16, 4);
        }
        
        // Shoes
        graphics.fillStyle(0x654321, 1);
        graphics.fillEllipse(12, 50, 10, 6);
        graphics.fillEllipse(28, 50, 10, 6);
        
        // Logo on hat
        graphics.fillStyle(0xffffff, 1);
        
        // Generate texture
        graphics.generateTexture(`character_${character}`, 40, 55);
        graphics.destroy();
        
        return {
            textureKey: `character_${character}`,
            width: 40,
            height: 55
        };
    }
    
    /**
     * Create an enhanced enemy (Goomba) sprite
     * @param {Phaser.Scene} scene - The scene to create sprites in
     * @returns {object} Enemy graphics components
     */
    static createEnemySprite(scene) {
        const graphics = scene.add.graphics();
        
        // Body with gradient (mushroom shape)
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillEllipse(20, 28, 34, 30);
        graphics.fillStyle(0x654321, 0.4);
        graphics.fillEllipse(16, 28, 20, 24);
        
        // Head with shading
        graphics.fillStyle(0xA0522D, 1);
        graphics.fillEllipse(20, 16, 30, 26);
        graphics.fillStyle(0x8B4513, 0.3);
        graphics.fillEllipse(16, 16, 18, 20);
        
        // Eyes (white with pupils)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillEllipse(14, 16, 10, 12);
        graphics.fillEllipse(26, 16, 10, 12);
        
        // Pupils
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(14, 18, 4);
        graphics.fillCircle(26, 18, 4);
        
        // Eyebrows (angry look)
        graphics.lineStyle(3, 0x654321, 1);
        graphics.beginPath();
        graphics.moveTo(9, 12);
        graphics.lineTo(19, 14);
        graphics.strokePath();
        
        graphics.beginPath();
        graphics.moveTo(31, 12);
        graphics.lineTo(21, 14);
        graphics.strokePath();
        
        // Feet with shading
        graphics.fillStyle(0x654321, 1);
        graphics.fillEllipse(12, 38, 12, 8);
        graphics.fillEllipse(28, 38, 12, 8);
        graphics.fillStyle(0x3d2713, 0.5);
        graphics.fillEllipse(10, 38, 6, 6);
        graphics.fillEllipse(26, 38, 6, 6);
        
        graphics.generateTexture('enemy_goomba', 40, 42);
        graphics.destroy();
        
        return {
            textureKey: 'enemy_goomba',
            width: 40,
            height: 42
        };
    }
    
    /**
     * Create enhanced coin sprite with metallic look
     * @param {Phaser.Scene} scene - The scene to create sprites in
     * @returns {object} Coin graphics components
     */
    static createCoinSprite(scene) {
        const graphics = scene.add.graphics();
        
        // Outer ring (darker gold)
        graphics.fillStyle(0xffaa00, 1);
        graphics.fillCircle(16, 16, 15);
        
        // Middle layer (bright gold)
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(16, 16, 13);
        
        // Inner highlight
        graphics.fillStyle(0xffffcc, 1);
        graphics.fillCircle(14, 14, 8);
        
        // Shading
        graphics.fillStyle(0xffcc00, 0.6);
        graphics.fillCircle(18, 18, 10);
        
        graphics.generateTexture('coin_enhanced', 32, 32);
        graphics.destroy();
        
        return {
            textureKey: 'coin_enhanced',
            width: 32,
            height: 32
        };
    }
    
    /**
     * Create enhanced power-up sprites (mushroom, flower, star)
     * @param {Phaser.Scene} scene - The scene to create sprites in
     * @param {string} type - Power-up type: 'mushroom', 'flower', or 'star'
     * @returns {object} Power-up graphics components
     */
    static createPowerUpSprite(scene, type) {
        const graphics = scene.add.graphics();
        
        if (type === 'mushroom') {
            // Red mushroom cap
            graphics.fillStyle(0xff0000, 1);
            graphics.fillEllipse(20, 15, 36, 26);
            
            // White spots
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(12, 15, 5);
            graphics.fillCircle(28, 15, 5);
            graphics.fillCircle(20, 10, 4);
            
            // Stem
            graphics.fillStyle(0xffffcc, 1);
            graphics.fillRect(14, 25, 12, 15);
            
            // Shading
            graphics.fillStyle(0xcc0000, 0.4);
            graphics.fillEllipse(24, 18, 20, 16);
            
        } else if (type === 'flower') {
            // Fire flower
            // Center
            graphics.fillStyle(0xffff00, 1);
            graphics.fillCircle(20, 20, 8);
            
            // Petals (orange/red)
            const petalColor = 0xff4500;
            graphics.fillStyle(petalColor, 1);
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x = 20 + Math.cos(angle) * 12;
                const y = 20 + Math.sin(angle) * 12;
                graphics.fillCircle(x, y, 6);
            }
            
            // Stem
            graphics.fillStyle(0x00aa00, 1);
            graphics.fillRect(18, 28, 4, 12);
            
            // Leaves
            graphics.fillEllipse(12, 32, 8, 6);
            graphics.fillEllipse(28, 32, 8, 6);
            
        } else if (type === 'star') {
            // Star with gradient
            graphics.fillStyle(0xffff00, 1);
            
            // Draw 5-point star
            const centerX = 20;
            const centerY = 20;
            const outerRadius = 16;
            const innerRadius = 7;
            
            graphics.beginPath();
            for (let i = 0; i < 10; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if (i === 0) {
                    graphics.moveTo(x, y);
                } else {
                    graphics.lineTo(x, y);
                }
            }
            graphics.closePath();
            graphics.fillPath();
            
            // Inner highlight
            graphics.fillStyle(0xffffcc, 1);
            graphics.fillCircle(centerX, centerY, 6);
        }
        
        graphics.generateTexture(`powerup_${type}`, 40, 40);
        graphics.destroy();
        
        return {
            textureKey: `powerup_${type}`,
            width: 40,
            height: 40
        };
    }
    
    /**
     * Create enhanced block sprite for ? blocks
     * @param {Phaser.Scene} scene - The scene to create sprites in
     * @returns {object} Block graphics components
     */
    static createBlockSprite(scene) {
        const graphics = scene.add.graphics();
        
        // Block body with gradient
        graphics.fillStyle(0xffaa00, 1);
        graphics.fillRect(0, 0, 40, 40);
        
        // Darker edges for 3D effect
        graphics.fillStyle(0xcc8800, 1);
        graphics.fillRect(0, 0, 40, 4);  // Top shadow
        graphics.fillRect(0, 36, 40, 4); // Bottom shadow
        graphics.fillRect(0, 0, 4, 40);  // Left shadow
        graphics.fillRect(36, 0, 4, 40); // Right shadow
        
        // Lighter highlights
        graphics.fillStyle(0xffdd00, 1);
        graphics.fillRect(4, 4, 32, 4);
        graphics.fillRect(4, 4, 4, 32);
        
        graphics.generateTexture('block_question', 40, 40);
        graphics.destroy();
        
        return {
            textureKey: 'block_question',
            width: 40,
            height: 40
        };
    }
    
    /**
     * Create boss sprite (Bowser-like)
     * @param {Phaser.Scene} scene - The scene to create sprites in
     * @param {number} level - Boss level (2 or 3 for different sizes)
     * @returns {object} Boss graphics components
     */
    static createBossSprite(scene, level) {
        const graphics = scene.add.graphics();
        const scale = level === 3 ? 1.5 : 1;
        const width = 80 * scale;
        const height = 100 * scale;
        
        // Shell (dark red with pattern)
        graphics.fillStyle(0x8B0000, 1);
        graphics.fillEllipse(width / 2, height * 0.6, width * 0.8, height * 0.5);
        
        // Shell pattern
        graphics.fillStyle(0xffaa00, 1);
        for (let i = 0; i < 3; i++) {
            graphics.fillRect(width * 0.25 + i * width * 0.2, height * 0.5, width * 0.15, height * 0.15);
        }
        
        // Head with gradient
        graphics.fillStyle(0xff4500, 1);
        graphics.fillEllipse(width / 2, height * 0.3, width * 0.65, height * 0.4);
        graphics.fillStyle(0xcc3300, 0.4);
        graphics.fillEllipse(width * 0.6, height * 0.3, width * 0.4, height * 0.3);
        
        // Horns
        graphics.fillStyle(0xffaa00, 1);
        graphics.fillTriangle(
            width * 0.25, height * 0.15,
            width * 0.3, height * 0.05,
            width * 0.35, height * 0.15
        );
        graphics.fillTriangle(
            width * 0.65, height * 0.15,
            width * 0.7, height * 0.05,
            width * 0.75, height * 0.15
        );
        
        // Eyes (glowing)
        graphics.fillStyle(0xffff00, 1);
        graphics.fillEllipse(width * 0.38, height * 0.28, width * 0.12, height * 0.12);
        graphics.fillEllipse(width * 0.62, height * 0.28, width * 0.12, height * 0.12);
        
        // Pupils (red)
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(width * 0.38, height * 0.28, width * 0.05);
        graphics.fillCircle(width * 0.62, height * 0.28, width * 0.05);
        
        // Mouth (menacing)
        graphics.lineStyle(3 * scale, 0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(width * 0.3, height * 0.45);
        graphics.lineTo(width * 0.7, height * 0.45);
        graphics.strokePath();
        
        // Teeth
        graphics.fillStyle(0xffffff, 1);
        for (let i = 0; i < 5; i++) {
            graphics.fillTriangle(
                width * 0.3 + i * width * 0.1, height * 0.45,
                width * 0.35 + i * width * 0.1, height * 0.4,
                width * 0.4 + i * width * 0.1, height * 0.45
            );
        }
        
        // Claws/Feet
        graphics.fillStyle(0xffaa00, 1);
        graphics.fillEllipse(width * 0.3, height * 0.9, width * 0.2, height * 0.12);
        graphics.fillEllipse(width * 0.7, height * 0.9, width * 0.2, height * 0.12);
        
        const textureKey = `boss_level${level}`;
        graphics.generateTexture(textureKey, width, height);
        graphics.destroy();
        
        return {
            textureKey: textureKey,
            width: width,
            height: height
        };
    }
}
