# API Documentation

This document provides detailed API documentation for the Mario Game utility functions and core classes.

## Table of Contents

- [Score Calculator](#score-calculator)
- [Game Code Generator](#game-code-generator)
- [Power-up Utils](#power-up-utils)
- [Player Name Utils](#player-name-utils)
- [Checkpoint Manager](#checkpoint-manager)
- [Audio Manager](#audio-manager)
- [Connection Monitor](#connection-monitor)
- [Performance Optimizer](#performance-optimizer)

---

## Score Calculator

**Module:** `src/utils/scoreCalculator.js`

Handles all score calculations in the game.

### Constants

#### `SCORE_VALUES`

Score values for different game actions.

```javascript
{
  coin: 10,
  enemy: 50,
  powerUp: 50,
  levelComplete: 100,
  bossDefeat: 500
}
```

### Functions

#### `calculateCoinScore(count)`

Calculate score for collecting multiple coins.

**Parameters:**
- `count` (number): Number of coins collected (must be non-negative)

**Returns:** (number) Total score

**Example:**
```javascript
import { calculateCoinScore } from './utils/scoreCalculator.js';

const score = calculateCoinScore(5);
// Returns: 50 (5 coins × 10 points)
```

---

#### `calculateEnemyScore(count)`

Calculate score for defeating multiple enemies.

**Parameters:**
- `count` (number): Number of enemies defeated (must be non-negative)

**Returns:** (number) Total score

**Example:**
```javascript
const score = calculateEnemyScore(3);
// Returns: 150 (3 enemies × 50 points)
```

---

#### `calculateTotalScore(stats)`

Calculate total score from game statistics.

**Parameters:**
- `stats` (Object): Game statistics
  - `stats.coins` (number): Coins collected
  - `stats.enemies` (number): Enemies defeated
  - `stats.powerUps` (number): Power-ups collected
  - `stats.levelsCompleted` (number): Levels completed
  - `stats.bossesDefeated` (number): Bosses defeated

**Returns:** (number) Total score

**Example:**
```javascript
const stats = {
  coins: 10,
  enemies: 3,
  powerUps: 2,
  levelsCompleted: 1,
  bossesDefeated: 1
};

const totalScore = calculateTotalScore(stats);
// Returns: 950
// Breakdown: (10×10) + (3×50) + (2×50) + (1×100) + (1×500)
```

---

#### `isValidScore(score)`

Validate that a score is within acceptable bounds.

**Parameters:**
- `score` (number): Score to validate

**Returns:** (boolean) Whether score is valid

**Example:**
```javascript
isValidScore(100);    // true
isValidScore(-10);    // false (negative)
isValidScore(Infinity); // false (non-finite)
```

---

## Game Code Generator

**Module:** `src/utils/gameCodeGenerator.js`

Generates and validates game codes for multiplayer sessions.

### Constants

#### `VALID_GAME_CODE_CHARS`

Valid characters for game codes. Excludes confusing characters (O, 0, I, 1).

```javascript
'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
```

### Functions

#### `generateGameCode(length = 6)`

Generate a robust game code.

**Parameters:**
- `length` (number, optional): Length of the code (default: 6)

**Returns:** (string) Generated game code

**Example:**
```javascript
import { generateGameCode } from './utils/gameCodeGenerator.js';

const code = generateGameCode();
// Returns: "ABC234" (example, random)

const longCode = generateGameCode(8);
// Returns: "ABCD2345" (example, random)
```

---

#### `isValidGameCode(code, expectedLength = 6)`

Validate a game code.

**Parameters:**
- `code` (string): The code to validate
- `expectedLength` (number, optional): Expected length (default: 6)

**Returns:** (boolean) Whether the code is valid

**Example:**
```javascript
isValidGameCode('ABC234');     // true
isValidGameCode('ABC12O');     // false (contains 'O')
isValidGameCode('ABC');        // false (wrong length)
```

---

#### `formatGameCode(code)`

Format a game code for display.

**Parameters:**
- `code` (string): The code to format

**Returns:** (string) Formatted code with hyphen

**Example:**
```javascript
formatGameCode('ABC123');
// Returns: "ABC-123"

formatGameCode('ABCDEFGH');
// Returns: "ABCD-EFGH"
```

---

## Power-up Utils

**Module:** `src/utils/powerUpUtils.js`

Utilities for power-up behavior and physics.

### Constants

#### `POWER_UP_SPAWN_DELAY_MS`

Delay before power-up spawns (in milliseconds).

```javascript
300
```

#### `POWER_UP_TYPES`

Available power-up types.

```javascript
{
  MUSHROOM: 'mushroom',
  FLOWER: 'flower',
  STAR: 'star'
}
```

#### `POWER_UP_SPEEDS`

Horizontal velocities for each power-up type.

```javascript
{
  mushroom: 80,
  flower: 50,
  star: 100
}
```

### Functions

#### `calculatePowerUpDirection(playerX, powerUpX)`

Calculate direction a power-up should move based on player position.

**Parameters:**
- `playerX` (number): Player's x position
- `powerUpX` (number): Power-up's x position

**Returns:** (number) Direction multiplier (-1 for left, 1 for right)

**Example:**
```javascript
import { calculatePowerUpDirection } from './utils/powerUpUtils.js';

calculatePowerUpDirection(100, 200);
// Returns: -1 (move left, away from player)

calculatePowerUpDirection(300, 200);
// Returns: 1 (move right, away from player)
```

---

#### `getPowerUpSpeed(type)`

Get speed for a power-up type.

**Parameters:**
- `type` (string): Power-up type

**Returns:** (number) Speed value

**Example:**
```javascript
getPowerUpSpeed('mushroom'); // 80
getPowerUpSpeed('star');     // 100
getPowerUpSpeed('invalid');  // 80 (defaults to mushroom)
```

---

#### `isValidPowerUpType(type)`

Check if a power-up type is valid.

**Parameters:**
- `type` (string): Power-up type to check

**Returns:** (boolean) Whether the type is valid

**Example:**
```javascript
isValidPowerUpType('mushroom'); // true
isValidPowerUpType('invalid');  // false
```

---

#### `calculateInitialSpawnVelocity()`

Calculate initial upward velocity when power-up spawns.

**Returns:** (number) Initial Y velocity (negative = upward)

**Example:**
```javascript
const velocity = calculateInitialSpawnVelocity();
// Returns: -150 (upward pop)
```

---

#### `shouldEnableGravity(type)`

Check if power-up should have gravity enabled.

**Parameters:**
- `type` (string): Power-up type

**Returns:** (boolean) Whether gravity should be enabled

**Example:**
```javascript
shouldEnableGravity('mushroom'); // true
shouldEnableGravity('flower');   // true
```

---

## Player Name Utils

**Module:** `src/utils/playerNameUtils.js`

Utilities for validating and formatting player names.

### Constants

#### `MAX_PLAYER_NAME_LENGTH`

Maximum allowed length for player names.

```javascript
15
```

#### `MIN_PLAYER_NAME_LENGTH`

Minimum allowed length for player names.

```javascript
1
```

#### `DEFAULT_PLAYER_NAMES`

Default names for players.

```javascript
{
  player1: 'Player 1',
  player2: 'Player 2'
}
```

### Functions

#### `sanitizePlayerName(name, maxLength = 15)`

Validate and sanitize a player name.

**Parameters:**
- `name` (string): The name to validate
- `maxLength` (number, optional): Maximum length (default: 15)

**Returns:** (string|null) Sanitized name or null if invalid

**Example:**
```javascript
import { sanitizePlayerName } from './utils/playerNameUtils.js';

sanitizePlayerName('  Mario  ');
// Returns: "Mario" (trimmed)

sanitizePlayerName('VeryLongPlayerNameThatExceedsLimit');
// Returns: "VeryLongPlayerN" (truncated to 15 chars)

sanitizePlayerName('');
// Returns: null (too short)
```

---

#### `isValidPlayerName(name)`

Check if a player name is valid.

**Parameters:**
- `name` (string): The name to check

**Returns:** (boolean) Whether the name is valid

**Example:**
```javascript
isValidPlayerName('Mario');  // true
isValidPlayerName('');       // false
isValidPlayerName('TooLongPlayerName123'); // false
```

---

#### `getDefaultPlayerName(playerNumber)`

Get a default player name.

**Parameters:**
- `playerNumber` (number): Player number (1 or 2)

**Returns:** (string) Default player name

**Example:**
```javascript
getDefaultPlayerName(1); // "Player 1"
getDefaultPlayerName(2); // "Player 2"
```

---

## Checkpoint Manager

**Module:** `src/utils/CheckpointManager.js`

Manages checkpoint state for level progression.

### Class: `CheckpointManager`

#### Constructor

```javascript
const checkpointManager = new CheckpointManager();
```

#### Methods

##### `saveCheckpoint(level, state)`

Save checkpoint state for a level.

**Parameters:**
- `level` (number): Current level number
- `state` (Object): State to save
  - `state.x` (number): Player x position
  - `state.y` (number): Player y position
  - `state.score` (number): Current score
  - `state.isPoweredUp` (boolean): Powered up state
  - `state.hasFirePower` (boolean): Fire power state
  - `state.coinsCollected` (number): Coins collected
  - `state.enemiesDefeated` (number): Enemies defeated

**Example:**
```javascript
const manager = new CheckpointManager();

manager.saveCheckpoint(1, {
  x: 400,
  y: 300,
  score: 550,
  isPoweredUp: true,
  hasFirePower: false,
  coinsCollected: 15,
  enemiesDefeated: 8
});
```

---

##### `loadCheckpoint(level)`

Load checkpoint state for a level.

**Parameters:**
- `level` (number): Level number

**Returns:** (Object|null) Checkpoint state or null if not found

**Example:**
```javascript
const checkpoint = manager.loadCheckpoint(1);
if (checkpoint) {
  console.log(`Resume from: ${checkpoint.x}, ${checkpoint.y}`);
  console.log(`Score: ${checkpoint.score}`);
}
```

---

##### `hasCheckpoint(level)`

Check if a checkpoint exists.

**Parameters:**
- `level` (number): Level number

**Returns:** (boolean) Whether checkpoint exists

**Example:**
```javascript
if (manager.hasCheckpoint(1)) {
  showResumeButton();
}
```

---

##### `clearCheckpoint(level)`

Clear checkpoint for a level.

**Parameters:**
- `level` (number): Level number

**Example:**
```javascript
manager.clearCheckpoint(1);
```

---

## Audio Manager

**Module:** `src/utils/AudioManager.js`

Manages all audio operations including sound effects and music.

### Class: `AudioManager`

#### Constructor

```javascript
const audioManager = new AudioManager(scene);
```

**Parameters:**
- `scene` (Phaser.Scene): The Phaser scene instance

#### Methods

##### `loadSettings()`

Load audio settings from localStorage.

**Returns:** (Object) Audio settings

---

##### `saveSettings()`

Save current audio settings to localStorage.

---

##### `updateSettings(newSettings)`

Update audio settings.

**Parameters:**
- `newSettings` (Object): New settings to merge

**Example:**
```javascript
audioManager.updateSettings({
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.9,
  muted: false
});
```

---

##### `playSound(key, config)`

Play a sound effect.

**Parameters:**
- `key` (string): Sound key
- `config` (Object, optional): Sound configuration

**Example:**
```javascript
audioManager.playSound('coin', { volume: 0.5 });
```

---

##### `playMusic(key, config)`

Play background music.

**Parameters:**
- `key` (string): Music key
- `config` (Object, optional): Music configuration

**Example:**
```javascript
audioManager.playMusic('level1', { loop: true, volume: 0.4 });
```

---

##### `stopMusic()`

Stop currently playing music.

---

##### `mute()`

Mute all audio.

---

##### `unmute()`

Unmute all audio.

---

## Connection Monitor

**Module:** `src/utils/ConnectionMonitor.js`

Monitors network connection quality for multiplayer games.

### Class: `ConnectionMonitor`

#### Constructor

```javascript
const monitor = new ConnectionMonitor();
```

#### Methods

##### `start()`

Start connection monitoring.

---

##### `stop()`

Stop connection monitoring.

---

##### `recordPing(latency)`

Record a latency measurement.

**Parameters:**
- `latency` (number): Round-trip time in milliseconds

**Example:**
```javascript
monitor.recordPing(45); // 45ms latency
```

---

##### `getConnectionQuality()`

Get current connection quality rating.

**Returns:** (string) Quality rating: 'excellent', 'good', 'fair', or 'poor'

**Example:**
```javascript
const quality = monitor.getConnectionQuality();
console.log(`Connection: ${quality}`);
```

---

##### `getAverageLatency()`

Get average latency.

**Returns:** (number) Average latency in milliseconds

---

##### `getPacketLossRate()`

Get packet loss rate.

**Returns:** (number) Packet loss rate (0.0 to 1.0)

---

## Performance Optimizer

**Module:** `src/utils/PerformanceOptimizer.js`

Provides performance optimizations for visual effects.

### Static Methods

#### `createObjectPool(scene, createFn, initialSize = 10)`

Create an object pool for reusable game objects.

**Parameters:**
- `scene` (Phaser.Scene): The scene
- `createFn` (Function): Function to create new objects
- `initialSize` (number, optional): Initial pool size (default: 10)

**Returns:** (Object) Object pool manager with methods:
- `acquire()`: Get an object from the pool
- `release(obj)`: Return an object to the pool
- `releaseAll()`: Return all active objects
- `destroy()`: Destroy the pool

**Example:**
```javascript
import PerformanceOptimizer from './utils/PerformanceOptimizer.js';

const particlePool = PerformanceOptimizer.createObjectPool(
  this,
  () => this.add.circle(0, 0, 5, 0xFFFFFF),
  20
);

// Use object
const particle = particlePool.acquire();
particle.setPosition(100, 100);

// Return when done
particlePool.release(particle);
```

---

#### `isInViewport(scene, x, y, padding = 100)`

Check if coordinates are visible in viewport.

**Parameters:**
- `scene` (Phaser.Scene): The scene
- `x` (number): X coordinate
- `y` (number): Y coordinate
- `padding` (number, optional): Extra padding around viewport (default: 100)

**Returns:** (boolean) Whether coordinates are visible

**Example:**
```javascript
if (PerformanceOptimizer.isInViewport(this, enemy.x, enemy.y)) {
  enemy.setActive(true);
  enemy.update();
}
```

---

#### `detectDeviceCapabilities(scene)`

Detect device capabilities for adaptive quality.

**Parameters:**
- `scene` (Phaser.Scene): The scene

**Returns:** (Object) Capability information

**Example:**
```javascript
const capabilities = PerformanceOptimizer.detectDeviceCapabilities(this);
console.log(`Quality Level: ${capabilities.qualityLevel}`);
console.log(`Is Mobile: ${capabilities.isMobile}`);
```

---

## Usage Examples

### Complete Score System

```javascript
import {
  calculateCoinScore,
  calculateEnemyScore,
  calculateTotalScore,
  SCORE_VALUES
} from './utils/scoreCalculator.js';

class GameScene extends Phaser.Scene {
  collectCoin() {
    this.coins++;
    this.score += SCORE_VALUES.coin;
  }
  
  defeatEnemy() {
    this.enemies++;
    this.score += SCORE_VALUES.enemy;
  }
  
  endLevel() {
    const totalScore = calculateTotalScore({
      coins: this.coins,
      enemies: this.enemies,
      powerUps: this.powerUps,
      levelsCompleted: 1,
      bossesDefeated: this.bossesDefeated
    });
    
    console.log(`Final Score: ${totalScore}`);
  }
}
```

### Multiplayer Session

```javascript
import {
  generateGameCode,
  formatGameCode,
  isValidGameCode
} from './utils/gameCodeGenerator.js';

class MultiplayerLobby {
  createGame() {
    this.gameCode = generateGameCode();
    this.displayCode = formatGameCode(this.gameCode);
    console.log(`Join with code: ${this.displayCode}`);
  }
  
  joinGame(inputCode) {
    const cleanCode = inputCode.replace('-', '');
    if (isValidGameCode(cleanCode)) {
      this.connectToGame(cleanCode);
    } else {
      this.showError('Invalid game code');
    }
  }
}
```

---

## Best Practices

1. **Always validate input** - Use validation functions before processing
2. **Handle edge cases** - Functions are designed to handle invalid input gracefully
3. **Use constants** - Import and use provided constants instead of hardcoding values
4. **Check return values** - Functions may return null for invalid input
5. **Test thoroughly** - See unit tests for comprehensive usage examples

---

For more examples, see the test files in `src/__tests__/`.
