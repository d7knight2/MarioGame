# Mario Game - Mobile Friendly

A mobile-friendly 2D Mario game built with Phaser 3, the industry-standard framework for HTML5 games. Features responsive design, touch controls for mobile devices, and classic platformer gameplay.

## 🎮 Features

- **Account System**: Create an account with username or play as guest
- **Friends List**: Add friends by username and see their online status
- **Multiplayer Invitations**: Invite friends to play via shareable links or in-app notifications
- **Online Notifications**: Get notified when friends invite you to play
- **Flexible Game Modes**: Choose between 1-player or 2-player cooperative mode
- **Multiplayer Lobby**: Host or join games with unique game codes
- **Character Selection**: Choose from Mario, Luigi, or Toad
- **Customizable Player Names**: No hardcoded names - players can choose their own names!
- **Character Selection**: Pick Mario or Luigi for each player independently
- **Online Multiplayer Ready**: Infrastructure prepared for future online multiplayer with game codes
- **Power-Up System**: Collect mushrooms, fire flowers, and stars from ? boxes
- **Multiple Levels**: Two challenging levels with unique layouts and a boss fight
- **Mobile-First Design**: Fully responsive with touch controls optimized for mobile devices
- **Cross-Platform**: Works on desktop (keyboard) and mobile (touch)
- **Physics-Based Gameplay**: Realistic jumping and movement using Phaser's Arcade Physics
- **Classic Platformer**: Jump on platforms, collect coins, defeat enemies
- **Smooth Animations**: Polished coin animations with spinning and floating effects
- **Modern Tech Stack**: Built with Phaser 3 and Vite for fast development

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/d7knight2/MarioGame.git
cd MarioGame
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect the configuration from `vercel.json`
4. Click "Deploy"

The `vercel.json` file is already configured with the correct build settings for this Vite project.

## 🎯 How to Play

### Account System
1. **Login/Register**: Enter a username to create an account or log in
2. **Guest Mode**: Click "Play as Guest" to play without an account (no friends/invite features)
3. **Main Menu**: Access game modes, friends list, and invitations from the main menu

### Multiplayer Invitations
1. **Add Friends**: Click "Friends" button → "Add Friend" → Enter friend's username
2. **Invite Friends**: 
   - Click "Invite" button on the main menu
   - Copy the shareable link and send via text/email
   - Or select a friend from your friends list to send an in-app invite
3. **Accept Invitations**: When invited, you'll see a notification on the menu - click to join
4. **Join via Link**: Open an invitation link to automatically join the game

### Game Mode Selection
Choose your game mode:
- **1 Player**: Play solo and control one character
- **2 Players (Local)**: Play cooperatively with a friend on the same device
- **2 Players (Multiplayer)**: Host or join a game with a friend online (via game codes)

### Character Selection
Choose from three characters:
- **Mario**: The classic hero (red)
- **Luigi**: Mario's brother (green)
- **Toad**: The mushroom kingdom citizen (pink)

### Controls

**1-Player Mode:**
- **Arrow Keys** (↑ ↓ ← →): Move and jump
- **X**: Shoot fireballs (when powered up with Fire Flower)
- **Mobile**: Use on-screen touch buttons

**2-Player Mode:**

**Player 1:**
- **W/A/S/D**: Move and jump
- **Left Shift**: Shoot fireballs (when powered up with Fire Flower)

**Player 2:**
- **Arrow Keys** (↑ ↓ ← →): Move and jump
- **X**: Shoot fireballs (when powered up with Fire Flower)
- **Mobile**: Use on-screen touch buttons (controls Player 2)

### Desktop Controls (All Modes)
- **Space**: Start game / Restart after game over

### Mobile Controls
- Use the on-screen touch buttons:
  - **← →**: Move left and right
  - **↑**: Jump
  - **Fire**: Shoot fireballs (appears when powered up)

### Gameplay
- Collect yellow coins for points (+10 each)
- Hit the **?** boxes from below to get power-ups:
  - **Red Mushroom**: Grow bigger (Super Mode)
  - **Fire Flower**: Shoot fireballs (Fire Power)
  - **Star**: Temporary invincibility
- Jump on enemies from above to defeat them (+50 points)
- Avoid touching enemies from the side (you'll lose your power-up or die)
- In 2-player mode, both players can collect power-ups independently
- Both players can defeat enemies and the boss
- Don't fall off the platforms!

## 🛠️ Technology Stack

- **Phaser 3**: HTML5 game framework with built-in physics engine
- **Vite**: Modern build tool for fast development and optimized production builds
- **Vanilla JavaScript**: ES6+ modules for clean, maintainable code
- **Responsive Design**: Automatic scaling to fit any screen size

## 📱 Mobile Optimization

This game implements several mobile-friendly features:

1. **Touch Controls**: Virtual buttons positioned for easy thumb access
2. **Viewport Configuration**: Prevents zooming and ensures proper scaling
3. **Responsive Canvas**: Automatically scales to fit device screen
4. **Performance**: Optimized rendering for smooth 60 FPS on mobile devices

## 🎨 Game Architecture

```
src/
├── main.js                      # Game initialization and touch control handlers
├── scenes/
│   ├── LoginScene.js            # User login/register screen
│   ├── MenuScene.js             # Main menu with friends and invite features
│   ├── FriendsScene.js          # Friends list management
│   ├── ModeSelectionScene.js    # Game mode selection (single/multiplayer)
│   ├── CharacterSelectionScene.js # Character selection screen
│   ├── MultiplayerLobbyScene.js # Multiplayer lobby with game codes
│   ├── SettingsScene.js         # Game settings and audio controls
│   ├── StartScene.js            # Classic start screen (for guests)
│   └── GameScene.js             # Main gameplay scene
├── utils/
│   ├── scoreCalculator.js       # Score calculation utilities
│   ├── gameCodeGenerator.js     # Game code generation for multiplayer
│   ├── powerUpUtils.js          # Power-up physics and behavior
│   ├── playerNameUtils.js       # Player name validation
│   ├── CheckpointManager.js     # Checkpoint save/load system
│   ├── AudioManager.js          # Audio and music management
│   ├── ConnectionMonitor.js     # Network quality monitoring
│   ├── MultiplayerSync.js       # Multiplayer state synchronization
│   ├── ChatSystem.js            # In-game chat functionality
│   ├── ParticleEffects.js       # Particle effect generators
│   ├── AnimationManager.js      # Animation controllers
│   ├── BackgroundGenerator.js   # Parallax background system
│   ├── SpriteFactory.js         # Sprite creation utilities
│   ├── WaterEffects.js          # Water and liquid effects
│   └── PerformanceOptimizer.js  # Performance optimization utilities
└── __tests__/                   # Unit tests (Jest)
    ├── scoreCalculator.test.js
    ├── gameCodeGenerator.test.js
    ├── powerUpUtils.test.js
    └── ... (19 test suites total)
```

### Core Design Patterns

**Test-Driven Development (TDD):**
- All utility functions are developed using TDD principles
- 484 unit tests ensure code reliability
- 80%+ code coverage requirement
- See [Testing Guide](CONTRIBUTING.md#testing-guidelines)

**Utility-First Architecture:**
- Core game logic extracted into testable utility functions
- Pure functions for calculations (score, game codes, etc.)
- Separation of concerns between scenes and utilities
- Easy to test and maintain

**Scene-Based Structure:**
- Each scene handles a specific game state
- Scenes communicate via Phaser's event system
- Clean transitions between game states

**Example: Score Calculation**
```javascript
import { calculateTotalScore, SCORE_VALUES } from './utils/scoreCalculator.js';

// Pure function - easy to test
const score = calculateTotalScore({
  coins: 10,        // 10 × 10 = 100
  enemies: 3,       // 3 × 50 = 150
  powerUps: 2,      // 2 × 50 = 100
  levelsCompleted: 1, // 1 × 100 = 100
  bossesDefeated: 1   // 1 × 500 = 500
});
// Total: 950 points
```

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 💾 Data Storage

The game uses browser's `localStorage` to store:
- User accounts and session data
- Friends lists
- Pending game invitations
- User preferences

**Note**: Data is stored locally in your browser. Clearing browser data will reset your account.

## 📝 License

MIT License - feel free to use this project for learning or as a base for your own games!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

Please read our [Contributing Guidelines](CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Coding standards
- Testing guidelines
- Pull request process

### Developer Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Detailed API reference for all utility functions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Test Coverage](src/__tests__)** - Comprehensive unit tests following TDD principles

### Continuous Integration

This repository uses GitHub Actions for automated testing and maintenance:
- **Run Tests Automatically**: Runs unit tests with Jest on every commit and pull request
- **Playwright UI Tests**: Runs end-to-end tests on multiple browsers
- **AI-Powered Merge Conflict Resolution**: Runs hourly to automatically detect and resolve merge conflicts in open pull requests using intelligent conflict resolution strategies
  - Gathers context from PR comments and file history
  - Applies AI-powered resolution strategies
  - Includes retry logic and automated testing
  - Creates detailed logs for review
  - See [AI Merge Conflict Resolution Documentation](.github/AI_MERGE_CONFLICT_RESOLUTION.md) for details

### Branch Protection (Repository Maintainers)

To ensure code quality and prevent breaking changes, repository maintainers should enable branch protection rules:

1. Go to **Settings** → **Branches** in the GitHub repository
2. Click **Add branch protection rule**
3. Set **Branch name pattern** to `main` (or `master`)
4. Enable the following settings:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
   - Under "Status checks that are required", search for and select all required checks:
     - `test (18.x)` - Unit tests on Node 18
     - `test (20.x)` - Unit tests on Node 20
     - `Playwright Tests (chromium)` - E2E tests on Chrome
     - `Playwright Tests (firefox)` - E2E tests on Firefox
     - `Playwright Tests (webkit)` - E2E tests on Safari
   - Note: Status check names appear after the first PR runs the workflows
5. Click **Create** or **Save changes**

With these settings, all pull requests must pass automated tests before they can be merged, ensuring code quality and stability.

## 🎨 Graphics & Visual Effects

The game features enhanced visual feedback and particle effects:

- **Particle Effects**: 
  - Sparkle particles on coin collection
  - Explosion effects when enemies are defeated
  - Power-up collection bursts with radiating particles
  - Star trails during invincibility mode
  - Fireball impact effects
  - Block hit particle fragments

- **Visual Feedback**:
  - Screen shake on enemy defeat, damage, and boss attacks
  - Score popups (+10, +50, +100) that float upward
  - Flash effects for powerful events (boss defeat, fire breath)
  - Smooth tweening animations throughout

- **Parallax Background**:
  - Multiple layers create depth: clouds, mountains, hills, and bushes
  - Each layer scrolls at different speeds for parallax effect
  - Animated clouds drift slowly across the sky
  - Decorative pipes add to the Mario aesthetic

- **Boss Enhancements**:
  - Charging indicators before attacks (orange tint)
  - Dramatic defeat animation with explosion particles
  - Screen shake and flash effects during battle

## 🌟 Future Enhancements

Potential additions:
- Backend server for real-time multiplayer synchronization
- WebSocket or WebRTC for live multiplayer gameplay
- Persistent accounts with database storage
- Global leaderboards
- More levels with increasing difficulty
- Sound effects and background music
- Achievement system
- Profile customization
- Sprite sheet animations for smoother character movement