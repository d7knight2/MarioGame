# Collision Mechanics Improvements

## Overview
This document describes the collision mechanics improvements implemented to provide smoother player movements and prevent overlapping issues during gameplay.

## Problem Statement
The original collision system had several issues:
1. Player and object collision bodies matched their exact visual size, causing tight fits that felt restrictive
2. Jump detection threshold was too large (15px), leading to imprecise enemy stomping
3. No velocity limits could cause physics glitches at high speeds
4. Lack of drag made movement feel slippery and hard to control
5. Objects could tunnel through platforms at high velocities

## Solution

### 1. Collision Body Size Optimizations
All collision bodies were reduced by 4px (2px padding on each side) to provide smoother movement:

**Player Collision Bodies:**
- Normal player: `28x44 → 24x40` with offset `(-14, -22) → (-12, -20)`
- Powered-up player: `36x57 → 32x53` with offset `(-18, -28) → (-16, -26)`

**Enemy Collision Bodies:**
- `32x32 → 28x28` (2px padding on all sides)

**Power-up Collision Bodies:**
- `32x32 → 28x28` (2px padding on all sides)

**Benefits:**
- Players can move more smoothly around tight spaces
- Less likely to get stuck on platform edges
- Visual appearance unchanged while hitboxes are more forgiving

### 2. Improved Jump Detection

**Enemy Stomp Detection:**
- Threshold reduced from `15px → 10px` for more precise detection
- Players must be above enemy center and moving downward
- Results in more satisfying and predictable enemy stomping

**Boss Jump Detection:**
- Added `5px margin` for more lenient detection
- Makes boss battles more forgiving and enjoyable
- Prevents frustrating near-misses

### 3. Enhanced Physics Configuration

**Max Velocity Limits:**
- Horizontal: `300 pixels/second`
- Vertical: `800 pixels/second`
- Prevents physics engine glitches at extreme speeds

**Horizontal Drag:**
- Value: `200`
- Provides better movement control
- Reduces sliding and improves stopping responsiveness

**Tile Bias:**
- Increased from default to `32`
- Prevents fast-moving objects from tunneling through platforms
- Ensures solid collision detection even at high speeds

### 4. Consistency Improvements

All locations where collision bodies are set now use consistent values:
- Player creation (both P1 and P2)
- Power-up collection (mushroom and fire flower)
- Power-up loss (taking damage)
- Player revival system

This ensures:
- No sudden hitbox misalignments
- Predictable collision behavior
- Easier maintenance and debugging

## Implementation Details

### Modified Files
- `src/scenes/GameScene.js` - Core collision mechanics implementation
- `src/__tests__/collisionMechanics.test.js` - New comprehensive test suite

### Key Functions Modified
1. `createPlayer()` - Updated collision body sizes and physics settings
2. `createPlayer2()` - Updated collision body sizes and physics settings
3. `hitEnemy()` - Improved jump detection threshold
4. `hitEnemy2()` - Improved jump detection threshold
5. `hitBoss()` - Added detection margin
6. `hitBoss2()` - Added detection margin
7. `collectPowerUp()` - Updated collision body sizes
8. `collectPowerUp2()` - Updated collision body sizes
9. `revivePlayer()` - Updated collision body sizes
10. `spawnPowerUp()` - Updated power-up collision body sizes
11. `createEnemies()` - Updated enemy collision body sizes

### Physics World Configuration
Added at scene creation:
```javascript
this.physics.world.TILE_BIAS = 32;  // Prevent tunneling
```

Added to player bodies:
```javascript
this.player.body.setMaxVelocity(300, 800);  // Velocity limits
this.player.body.setDrag(200, 0);  // Horizontal drag
```

## Testing

### Test Coverage
Added 21 new tests covering:
1. Player collision body sizes and offsets (3 tests)
2. Enemy collision body sizes (2 tests)
3. Power-up collision body sizes (1 test)
4. Jump detection thresholds (4 tests)
5. Physics configuration (3 tests)
6. Collision consistency (2 tests)
7. Edge case handling (3 tests)
8. Movement control (3 tests)

### Test Results
- All 272 existing tests: ✅ PASS
- All 21 new collision tests: ✅ PASS
- **Total: 293 tests passing**

### Manual Testing Checklist
To manually verify improvements:
- [ ] Players move smoothly around platform edges
- [ ] No clipping/overlapping with platforms
- [ ] Enemy stomping feels precise and responsive
- [ ] Boss jump detection is forgiving but not too easy
- [ ] Power-ups are easy to collect without overlapping
- [ ] Movement control feels tight with good stopping
- [ ] No physics glitches at high speeds
- [ ] Multiplayer players don't overlap excessively
- [ ] Revival system restores correct hitbox sizes

## Impact

### Gameplay Improvements
1. **Smoother Movement**: Reduced collision bodies allow players to navigate tight spaces more easily
2. **Better Jump Precision**: Improved thresholds make enemy stomping more reliable and satisfying
3. **Improved Control**: Drag and velocity limits provide tighter, more responsive movement
4. **No Physics Glitches**: Tile bias and velocity limits prevent tunneling and other issues
5. **Consistent Experience**: All collision bodies behave predictably across state changes

### Technical Benefits
1. **Maintainability**: Consistent values across codebase
2. **Testability**: Comprehensive test coverage
3. **Performance**: No negative performance impact
4. **Stability**: Reduced edge cases and glitches

## Future Enhancements

Potential future improvements:
1. Dynamic collision body adjustment based on velocity
2. Custom collision shapes for more complex objects
3. Slope collision support for angled platforms
4. Advanced physics materials (friction, restitution per surface)
5. Collision groups for more granular control

## References

- [Phaser 3 Arcade Physics Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Body.html)
- [Game Feel: A Game Designer's Guide to Virtual Sensation](https://www.google.com/search?q=game+feel+book) (Steve Swink)
- [Platformer Physics Best Practices](https://www.gamedeveloper.com/design/the-guide-to-implementing-2d-platformers)
