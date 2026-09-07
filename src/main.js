import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import StartScene from './scenes/StartScene.js';
import ModeSelectionScene from './scenes/ModeSelectionScene.js';
import CharacterSelectionScene from './scenes/CharacterSelectionScene.js';
import MultiplayerLobbyScene from './scenes/MultiplayerLobbyScene.js';
import LoginScene from './scenes/LoginScene.js';
import MenuScene from './scenes/MenuScene.js';
import FriendsScene from './scenes/FriendsScene.js';
import SettingsScene from './scenes/SettingsScene.js';

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
    input: {
        activePointers: 3,
        mouse: {
            preventDefaultWheel: false
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [LoginScene, MenuScene, FriendsScene, SettingsScene, ModeSelectionScene, CharacterSelectionScene, MultiplayerLobbyScene, StartScene, GameScene]
};

const game = new Phaser.Game(config);

// Expose game instance to window for testing purposes
if (typeof window !== 'undefined') {
    window.Phaser = window.Phaser || {};
    window.Phaser.GAMES = window.Phaser.GAMES || [];
    window.Phaser.GAMES.push(game);
}

function bindHoldButton(el, onDown, onUp) {
    if (!el) return;
    const down = (e) => {
        e.preventDefault();
        onDown();
    };
    const up = (e) => {
        e.preventDefault();
        onUp();
    };
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchend', up, { passive: false });
    el.addEventListener('touchcancel', up, { passive: false });
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);
    el.addEventListener('mouseleave', up);
}

// Handle mobile controls + menu clickability
window.addEventListener('load', () => {
    const touchControls = document.getElementById('touch-controls');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const jumpBtn = document.getElementById('jump-btn');
    const fireBtn = document.getElementById('fire-btn');

    const setTouchControlsVisible = (visible) => {
        if (!touchControls) return;
        touchControls.classList.toggle('controls--visible', !!visible);
    };

    // Hidden on menus by default
    setTouchControlsVisible(false);

    game.events.on('showTouchControls', setTouchControlsVisible);

    if (fireBtn) {
        fireBtn.style.display = 'none';
    }

    game.events.on('hasFirePower', (hasFire) => {
        if (fireBtn) {
            fireBtn.style.display = hasFire ? 'flex' : 'none';
        }
    });

    bindHoldButton(
        leftBtn,
        () => game.registry.set('moveLeft', true),
        () => game.registry.set('moveLeft', false)
    );
    bindHoldButton(
        rightBtn,
        () => game.registry.set('moveRight', true),
        () => game.registry.set('moveRight', false)
    );
    bindHoldButton(
        jumpBtn,
        () => game.registry.set('jump', true),
        () => game.registry.set('jump', false)
    );
    bindHoldButton(
        fireBtn,
        () => game.registry.set('fire', true),
        () => game.registry.set('fire', false)
    );
});

export default game;
