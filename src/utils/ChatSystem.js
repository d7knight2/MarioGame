/**
 * ChatSystem - Handles in-game communication and quick signals for multiplayer
 * Provides text chat and predefined signal system for player interaction
 */

// Message display timing constants
const MESSAGE_FADE_TIMEOUT_MS = 5000; // Messages fade after 5 seconds
const MESSAGE_FADE_DELAY_MS = 2000; // Additional delay before complete fade

export default class ChatSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Chat state
        this.isOpen = false;
        this.messages = [];
        this.maxMessages = 50;
        this.maxDisplayedMessages = 5;
        
        // Quick signals
        this.signals = [
            { id: 'help', text: 'Help!', icon: '🆘', color: 0xff0000 },
            { id: 'go', text: 'Go!', icon: '➡️', color: 0x00ff00 },
            { id: 'wait', text: 'Wait!', icon: '✋', color: 0xffaa00 },
            { id: 'nice', text: 'Nice!', icon: '👍', color: 0x00aaff },
            { id: 'thanks', text: 'Thanks!', icon: '🙏', color: 0xff69b4 }
        ];
        
        // UI elements (will be created on demand)
        this.chatContainer = null;
        this.messageDisplay = null;
        this.signalButtons = [];
        this.inputField = null;
        this.chatToggleButton = null;
        
        // Message timeout
        this.messageTimeout = MESSAGE_FADE_TIMEOUT_MS;
        this.activeMessageTimers = [];
        
        // Event callbacks
        this.onMessageSent = null;
        this.onSignalSent = null;
    }

    /**
     * Initialize chat UI
     */
    createUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Chat toggle button (bottom right corner)
        this.chatToggleButton = this.scene.add.rectangle(
            width - 50,
            height - 50,
            40,
            40,
            0x333333,
            0.8
        );
        this.chatToggleButton.setScrollFactor(0);
        this.chatToggleButton.setDepth(1000);
        this.chatToggleButton.setInteractive({ useHandCursor: true });
        
        const chatIcon = this.scene.add.text(
            width - 50,
            height - 50,
            '💬',
            {
                fontSize: '24px',
                fontFamily: 'Arial'
            }
        );
        chatIcon.setOrigin(0.5);
        chatIcon.setScrollFactor(0);
        chatIcon.setDepth(1001);
        
        this.chatToggleButton.on('pointerdown', () => {
            this.toggleChat();
        });
        
        // Message display area (always visible, bottom left)
        this.messageDisplay = this.scene.add.container(10, height - 200);
        this.messageDisplay.setScrollFactor(0);
        this.messageDisplay.setDepth(999);
        
        // Quick signal buttons (hidden by default)
        this.createSignalButtons();
    }

    /**
     * Create quick signal buttons
     */
    createSignalButtons() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const buttonWidth = 100;
        const buttonHeight = 35;
        const spacing = 10;
        const startY = height - 150;
        
        this.signals.forEach((signal, index) => {
            const x = width - buttonWidth - 10;
            const y = startY - (index * (buttonHeight + spacing));
            
            // Button background
            const button = this.scene.add.rectangle(
                x,
                y,
                buttonWidth,
                buttonHeight,
                signal.color,
                0.8
            );
            button.setScrollFactor(0);
            button.setDepth(1002);
            button.setInteractive({ useHandCursor: true });
            button.setVisible(false);
            
            // Button text
            const text = this.scene.add.text(
                x,
                y,
                `${signal.icon} ${signal.text}`,
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }
            );
            text.setOrigin(0.5);
            text.setScrollFactor(0);
            text.setDepth(1003);
            text.setVisible(false);
            
            // Click handler
            button.on('pointerdown', () => {
                this.sendSignal(signal.id);
            });
            
            // Hover effects
            button.on('pointerover', () => {
                button.setFillStyle(signal.color, 1.0);
                button.setScale(1.05);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(signal.color, 0.8);
                button.setScale(1.0);
            });
            
            this.signalButtons.push({ button, text, signal });
        });
    }

    /**
     * Toggle chat interface visibility
     */
    toggleChat() {
        this.isOpen = !this.isOpen;
        
        // Show/hide signal buttons
        this.signalButtons.forEach(({ button, text }) => {
            button.setVisible(this.isOpen);
            text.setVisible(this.isOpen);
        });
        
        // Update toggle button appearance
        if (this.chatToggleButton) {
            this.chatToggleButton.setFillStyle(
                this.isOpen ? 0x00aa00 : 0x333333,
                0.8
            );
        }
    }

    /**
     * Send a quick signal
     * @param {string} signalId - Signal identifier
     */
    sendSignal(signalId) {
        const signal = this.signals.find(s => s.id === signalId);
        if (!signal) return;
        
        // Add as a message
        this.addMessage({
            type: 'signal',
            signalId: signal.id,
            text: signal.text,
            icon: signal.icon,
            color: signal.color,
            timestamp: Date.now(),
            sender: 'local'
        });
        
        // Trigger callback for network transmission
        if (this.onSignalSent) {
            this.onSignalSent(signalId);
        }
        
        // Auto-close chat after sending signal
        if (this.isOpen) {
            this.toggleChat();
        }
    }

    /**
     * Send a text message
     * @param {string} text - Message text
     */
    sendMessage(text) {
        if (!text || text.trim().length === 0) return;
        
        // Add as a message
        this.addMessage({
            type: 'text',
            text: text.trim(),
            timestamp: Date.now(),
            sender: 'local'
        });
        
        // Trigger callback for network transmission
        if (this.onMessageSent) {
            this.onMessageSent(text.trim());
        }
    }

    /**
     * Add a message to the chat (sent or received)
     * @param {Object} message - Message object
     */
    addMessage(message) {
        this.messages.push(message);
        
        // Maintain message history limit
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        
        // Display the message
        this.displayMessage(message);
    }

    /**
     * Display a message in the UI
     * @param {Object} message - Message to display
     */
    displayMessage(message) {
        if (!this.messageDisplay) return;
        
        // Clear old messages
        this.messageDisplay.removeAll(true);
        this.clearMessageTimers();
        
        // Get recent messages to display
        const recentMessages = this.messages.slice(-this.maxDisplayedMessages);
        
        // Display each message
        recentMessages.forEach((msg, index) => {
            const y = index * 35;
            
            // Background
            const bg = this.scene.add.rectangle(
                0,
                y,
                400,
                30,
                0x000000,
                0.6
            );
            bg.setOrigin(0, 0);
            
            // Message content
            let displayText = '';
            let color = '#ffffff';
            
            if (msg.type === 'signal') {
                displayText = `${msg.icon} ${msg.text}`;
                // Validate color is a number before converting
                if (typeof msg.color === 'number' && Number.isFinite(msg.color)) {
                    color = '#' + msg.color.toString(16).padStart(6, '0');
                } else if (typeof msg.color === 'string' && msg.color.length > 0) {
                    color = msg.color.startsWith('#') ? msg.color : '#' + msg.color;
                }
            } else if (msg.type === 'text') {
                const prefix = msg.sender === 'local' ? 'You' : 'Player';
                displayText = `${prefix}: ${msg.text}`;
            } else if (msg.type === 'system') {
                displayText = msg.text;
                color = '#ffaa00';
            }
            
            const text = this.scene.add.text(
                5,
                y + 5,
                displayText,
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: color,
                    fontStyle: 'bold',
                    wordWrap: { width: 390 }
                }
            );
            text.setOrigin(0, 0);
            
            this.messageDisplay.add([bg, text]);
        });
        
        // Set timer to fade out messages (using constant)
        const timer = this.scene.time.delayedCall(this.messageTimeout, () => {
            this.fadeOutOldMessages();
        });
        this.activeMessageTimers.push(timer);
    }

    /**
     * Fade out old messages
     */
    fadeOutOldMessages() {
        if (!this.messageDisplay) return;
        
        // Only keep the most recent message visible
        if (this.messages.length > 0) {
            this.messageDisplay.setAlpha(0.3);
            
            // Fade out completely after additional delay (using constant)
            this.scene.time.delayedCall(MESSAGE_FADE_DELAY_MS, () => {
                if (this.messageDisplay) {
                    this.messageDisplay.setAlpha(0);
                }
            });
        }
    }

    /**
     * Clear message fade timers
     */
    clearMessageTimers() {
        this.activeMessageTimers.forEach(timer => {
            if (timer) {
                timer.remove();
            }
        });
        this.activeMessageTimers = [];
        
        // Reset alpha
        if (this.messageDisplay) {
            this.messageDisplay.setAlpha(1);
        }
    }

    /**
     * Receive a message from another player
     * @param {Object} message - Received message
     */
    receiveMessage(message) {
        this.addMessage({
            ...message,
            sender: 'remote',
            timestamp: Date.now()
        });
    }

    /**
     * Receive a signal from another player
     * @param {string} signalId - Signal identifier
     */
    receiveSignal(signalId) {
        const signal = this.signals.find(s => s.id === signalId);
        if (!signal) return;
        
        this.addMessage({
            type: 'signal',
            signalId: signal.id,
            text: signal.text,
            icon: signal.icon,
            color: signal.color,
            timestamp: Date.now(),
            sender: 'remote'
        });
    }

    /**
     * Add system message
     * @param {string} text - System message text
     */
    addSystemMessage(text) {
        this.addMessage({
            type: 'system',
            text: text,
            timestamp: Date.now(),
            sender: 'system'
        });
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        this.messages = [];
        if (this.messageDisplay) {
            this.messageDisplay.removeAll(true);
        }
        this.clearMessageTimers();
    }

    /**
     * Destroy chat system and clean up
     */
    destroy() {
        this.clearMessageTimers();
        
        if (this.chatToggleButton) {
            this.chatToggleButton.destroy();
        }
        
        if (this.messageDisplay) {
            this.messageDisplay.destroy();
        }
        
        this.signalButtons.forEach(({ button, text }) => {
            button.destroy();
            text.destroy();
        });
        
        this.signalButtons = [];
    }
}
