# Contributing to Mario Game

Thank you for your interest in contributing to the Mario Game project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Project Architecture](#project-architecture)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Git
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Setting Up Your Development Environment

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MarioGame.git
   cd MarioGame
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`

4. **Run Tests**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Run tests in watch mode
   npm run test:coverage # Generate coverage report
   ```

5. **Run End-to-End Tests**
   ```bash
   npm run test:e2e      # Run Playwright tests
   npm run test:e2e:ui   # Run tests in UI mode
   ```

## Development Workflow

### Creating a New Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use descriptive branch names:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test improvements

### Making Changes

1. Make your changes in small, focused commits
2. Write clear commit messages describing what and why
3. Test your changes thoroughly
4. Ensure all tests pass before committing

### Commit Message Guidelines

Follow this format for commit messages:

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or modifications
- `chore:` - Maintenance tasks

**Example:**
```
feat: Add checkpoint system for level progression

Implement checkpoint manager that saves player state at key points
in the level. This allows players to restart from checkpoints instead
of the beginning.

Closes #123
```

## Coding Standards

### JavaScript/ES6+ Guidelines

1. **Use Modern JavaScript**
   - Use ES6+ features (arrow functions, destructuring, template literals)
   - Use `const` by default, `let` when reassignment is needed
   - Avoid `var`

2. **Naming Conventions**
   - Classes: `PascalCase` (e.g., `GameScene`, `AudioManager`)
   - Functions/methods: `camelCase` (e.g., `calculateScore`, `updatePosition`)
   - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_PLAYER_NAME_LENGTH`)
   - Private methods: Prefix with underscore `_privateMethod`

3. **Code Organization**
   ```javascript
   // Good: Clear function structure
   export function calculateScore(coins, enemies) {
     if (coins < 0 || enemies < 0) {
       return 0;
     }
     return coins * 10 + enemies * 50;
   }
   
   // Avoid: Inline magic numbers
   return coins * 10 + enemies * 50; // What do these numbers mean?
   ```

4. **Documentation**
   - Add JSDoc comments for all public functions
   - Document complex algorithms with inline comments
   - Keep comments up-to-date with code changes

   ```javascript
   /**
    * Calculate total score from game statistics
    * @param {Object} stats - Game statistics
    * @param {number} stats.coins - Coins collected
    * @param {number} stats.enemies - Enemies defeated
    * @returns {number} Total score
    */
   export function calculateTotalScore(stats) {
     // Implementation
   }
   ```

5. **Error Handling**
   ```javascript
   // Always validate input
   if (!data || typeof data !== 'object') {
     console.warn('Invalid data provided');
     return null;
   }
   ```

### File Organization

```
src/
├── main.js                 # Game initialization
├── scenes/                 # Phaser scenes
│   ├── GameScene.js       # Main gameplay
│   ├── MenuScene.js       # Menu system
│   └── ...
├── utils/                  # Utility functions
│   ├── scoreCalculator.js # Score utilities
│   ├── gameCodeGenerator.js
│   └── ...
└── __tests__/             # Unit tests
    ├── scoreCalculator.test.js
    └── ...
```

## Testing Guidelines

### Test-Driven Development (TDD)

We follow TDD principles:

1. **Write tests first** - Before implementing a feature, write tests
2. **Make tests pass** - Implement minimal code to pass tests
3. **Refactor** - Improve code while keeping tests green

### Writing Tests

1. **Unit Tests** - Test individual functions in isolation
   ```javascript
   describe('calculateCoinScore', () => {
     test('should calculate score for single coin', () => {
       expect(calculateCoinScore(1)).toBe(10);
     });
     
     test('should handle negative numbers', () => {
       expect(calculateCoinScore(-5)).toBe(0);
     });
   });
   ```

2. **Integration Tests** - Test multiple components working together
   ```javascript
   describe('Checkpoint System Integration', () => {
     test('should save and restore player state', () => {
       const manager = new CheckpointManager();
       manager.saveCheckpoint(1, { x: 100, y: 200, score: 500 });
       const restored = manager.loadCheckpoint(1);
       expect(restored.score).toBe(500);
     });
   });
   ```

3. **Test Coverage** - Aim for 80% coverage minimum
   - All utility functions should have tests
   - Critical game logic should be well-tested
   - Edge cases and error conditions should be covered

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Check coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Submitting Changes

### Pull Request Process

1. **Update Documentation**
   - Update README.md if you add features
   - Add JSDoc comments to new functions
   - Update CONTRIBUTING.md if process changes

2. **Ensure Tests Pass**
   ```bash
   npm test
   npm run test:e2e
   npm run build  # Verify build works
   ```

3. **Create Pull Request**
   - Push your branch to GitHub
   - Create a PR with a clear title and description
   - Reference any related issues
   - Add screenshots for UI changes

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Closes #123
   ```

5. **Code Review**
   - Address review comments promptly
   - Be open to feedback
   - Make requested changes in new commits

6. **Continuous Integration**
   - All CI checks must pass
   - Tests run on Node 18.x and 20.x
   - Playwright tests run on Chrome, Firefox, and Safari

## Project Architecture

### Game Structure

The game is built with **Phaser 3**, a powerful HTML5 game framework.

#### Core Components

1. **Scenes** (`src/scenes/`)
   - `LoginScene` - User authentication
   - `MenuScene` - Main menu
   - `GameScene` - Main gameplay logic
   - `CharacterSelectionScene` - Character picker
   - Each scene is self-contained with its own logic

2. **Utilities** (`src/utils/`)
   - **Score System** - `scoreCalculator.js` handles all scoring
   - **Game Codes** - `gameCodeGenerator.js` for multiplayer sessions
   - **Power-ups** - `powerUpUtils.js` manages power-up behavior
   - **Audio** - `AudioManager.js` handles sounds and music
   - **Performance** - `PerformanceOptimizer.js` for optimization

3. **Physics**
   - Arcade Physics engine for collisions
   - Gravity: 800 pixels/second²
   - Player movement and jumping mechanics

#### Key Game Mechanics

**Score Calculation:**
```javascript
import { calculateTotalScore } from './utils/scoreCalculator.js';

const score = calculateTotalScore({
  coins: 10,        // 10 points each
  enemies: 3,       // 50 points each
  powerUps: 2,      // 50 points each
  levelsCompleted: 1, // 100 points each
  bossesDefeated: 1   // 500 points
});
```

**Power-up System:**
- Mushroom: Makes player bigger
- Fire Flower: Enables fireball shooting
- Star: Temporary invincibility

**Multiplayer:**
- Local 2-player co-op
- Online multiplayer with game codes
- Real-time synchronization

### Adding New Features

When adding a feature:

1. **Create utility functions** in `src/utils/`
2. **Write tests** in `src/__tests__/`
3. **Integrate into scenes** as needed
4. **Update documentation**

Example: Adding a new power-up type

```javascript
// 1. Add to powerUpUtils.js
export const POWER_UP_TYPES = {
  MUSHROOM: 'mushroom',
  FLOWER: 'flower',
  STAR: 'star',
  ICE_FLOWER: 'iceFlower' // New type
};

// 2. Write tests in powerUpUtils.test.js
test('should recognize ice flower as valid type', () => {
  expect(isValidPowerUpType('iceFlower')).toBe(true);
});

// 3. Integrate into GameScene.js
// Add collision handlers and visual effects

// 4. Document in README.md
```

## Questions or Problems?

- Open an issue on GitHub
- Check existing issues for similar problems
- Read the [README.md](README.md) for setup instructions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Mario Game! 🎮✨
