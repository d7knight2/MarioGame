import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import StartScene from './scenes/StartScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import OnlineMultiplayerScene from './scenes/OnlineMultiplayerScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#5c94fc',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [MenuScene, CharacterSelectScene, OnlineMultiplayerScene, StartScene, GameScene]
};

const game = new Phaser.Game(config);

// Handle mobile controls
window.addEventListener('load', () => {
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const jumpBtn = document.getElementById('jump-btn');
    const fireBtn = document.getElementById('fire-btn');
    
    // Hide fire button initially
    if (fireBtn) {
        fireBtn.style.display = 'none';
    }
    
    // Listen for power-up changes to show/hide fire button
    game.events.on('hasFirePower', (hasFire) => {
        if (fireBtn) {
            fireBtn.style.display = hasFire ? 'flex' : 'none';
        }
    });
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.registry.set('moveLeft', true);
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.registry.set('moveLeft', false);
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.registry.set('moveRight', true);
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.registry.set('moveRight', false);
        });
    }
    
    if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.registry.set('jump', true);
        });
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.registry.set('jump', false);
        });
    }
    
    if (fireBtn) {
        fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.registry.set('fire', true);
        });
        fireBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.registry.set('fire', false);
        });
    }
});

export default game;
