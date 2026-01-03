# Mario Game - Mobile Friendly

A mobile-friendly 2D Mario game built with Phaser 3, the industry-standard framework for HTML5 games. Features responsive design, touch controls for mobile devices, and classic platformer gameplay.

## 🎮 Features

- **Flexible Game Modes**: Choose between 1-player or 2-player cooperative mode
- **Customizable Player Names**: No hardcoded names - players can choose their own names!
- **Power-Up System**: Collect mushrooms, fire flowers, and stars from ? boxes
- **Multiple Levels**: Two challenging levels with unique layouts and a boss fight
- **Mobile-First Design**: Fully responsive with touch controls optimized for mobile devices
- **Cross-Platform**: Works on desktop (keyboard) and mobile (touch)
- **Physics-Based Gameplay**: Realistic jumping and movement using Phaser's Arcade Physics
- **Classic Platformer**: Jump on platforms, collect coins, defeat enemies
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

### Game Mode Selection
On the start screen, choose your game mode:
- **1 Player**: Play solo and control one character
- **2 Players**: Play cooperatively with a friend on the same device

### Player Names
Customize your experience by clicking "Edit" next to each player name to set your own names!

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
├── main.js           # Game initialization and touch control handlers
└── scenes/
    ├── StartScene.js # Title screen and instructions
    └── GameScene.js  # Main gameplay scene
```

## 📝 License

MIT License - feel free to use this project for learning or as a base for your own games!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🌟 Future Enhancements

Potential additions:
- More levels with increasing difficulty
- Power-ups (mushrooms, fire flowers)
- Better graphics and animations
- Sound effects and background music
- High score system with local storage
- Multiple character sprites