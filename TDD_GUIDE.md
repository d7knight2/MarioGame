# Test-Driven Development in Mario Game

This document explains how Test-Driven Development (TDD) principles are applied in the Mario Game project.

## What is TDD?

Test-Driven Development is a software development approach where tests are written **before** the actual code. The TDD cycle follows three steps:

1. **Red** - Write a failing test
2. **Green** - Write minimal code to make the test pass
3. **Refactor** - Improve the code while keeping tests green

## TDD in This Project

### Test Structure

The project follows a comprehensive testing strategy:

```
src/
├── utils/                    # Pure functions (business logic)
│   ├── scoreCalculator.js
│   ├── gameCodeGenerator.js
│   └── powerUpUtils.js
└── __tests__/                # Test files mirror source structure
    ├── scoreCalculator.test.js
    ├── gameCodeGenerator.test.js
    ├── powerUpUtils.test.js
    └── scoringSystemIntegration.test.js
```

### Test Coverage

- **20 test suites** with **497 passing tests**
- **80%+ code coverage** requirement
- Tests cover:
  - Unit tests for individual functions
  - Integration tests for system workflows
  - Edge cases and error conditions
  - Performance and scalability

## Example: Score Calculator

### Step 1: Write Tests First (Red Phase)

```javascript
// src/__tests__/scoreCalculator.test.js
describe('calculateCoinScore', () => {
  test('should calculate score for single coin', () => {
    expect(calculateCoinScore(1)).toBe(10);
  });
  
  test('should handle negative numbers', () => {
    expect(calculateCoinScore(-5)).toBe(0);
  });
});
```

### Step 2: Implement Minimal Code (Green Phase)

```javascript
// src/utils/scoreCalculator.js
export const SCORE_VALUES = {
  coin: 10
};

export function calculateCoinScore(count) {
  if (count < 0) {
    return 0;
  }
  return count * SCORE_VALUES.coin;
}
```

### Step 3: Refactor (Refactor Phase)

Add documentation, improve structure, and ensure code quality:

```javascript
/**
 * Calculate score for collecting multiple coins
 * @param {number} count - Number of coins collected (must be non-negative)
 * @returns {number} Total score
 */
export function calculateCoinScore(count) {
  if (count < 0) {
    return 0; // Don't allow negative scores
  }
  return count * SCORE_VALUES.coin;
}
```

## Integration Testing

### Real-World Scenarios

Integration tests validate complete workflows:

```javascript
describe('Game Scenario: Complete Level 1', () => {
  test('should calculate correct total score', () => {
    // Arrange: Set up game statistics
    const gameStats = {
      coins: 15,
      enemies: 5,
      powerUps: 2,
      levelsCompleted: 1,
      bossesDefeated: 0
    };

    // Act: Calculate the total score
    const totalScore = calculateTotalScore(gameStats);

    // Assert: Verify the calculation
    expect(totalScore).toBe(600);
  });
});
```

### Benefits of Integration Tests

1. **Verify System Behavior** - Tests how components work together
2. **Catch Integration Bugs** - Find issues when combining modules
3. **Document Workflows** - Show how the system is meant to be used
4. **Regression Prevention** - Ensure changes don't break existing features

## Test Organization

### Unit Tests

Test individual functions in isolation:

- `scoreCalculator.test.js` - Score calculation functions
- `gameCodeGenerator.test.js` - Game code generation and validation
- `powerUpUtils.test.js` - Power-up physics and behavior
- `playerNameUtils.test.js` - Player name validation

### Integration Tests

Test complete workflows:

- `scoringSystemIntegration.test.js` - End-to-end scoring scenarios
- `checkpointIntegration.test.js` - Checkpoint save/load workflows
- `multiplayerRevival.test.js` - Multiplayer revival system
- `gameLogic.test.js` - Core game mechanics

### UI Tests

End-to-end tests with Playwright:

- `tests/gameplay.spec.js` - Gameplay scenarios
- `tests/auth.spec.js` - Authentication flows

## Best Practices

### 1. Arrange-Act-Assert Pattern

Structure tests clearly:

```javascript
test('example test', () => {
  // Arrange: Set up test data
  const input = 5;
  
  // Act: Execute the function
  const result = calculateScore(input);
  
  // Assert: Verify the result
  expect(result).toBe(50);
});
```

### 2. Test Edge Cases

Always test boundary conditions:

```javascript
test('should handle zero input', () => {
  expect(calculateCoinScore(0)).toBe(0);
});

test('should handle negative input', () => {
  expect(calculateCoinScore(-5)).toBe(0);
});

test('should handle large numbers', () => {
  expect(calculateCoinScore(1000)).toBe(10000);
});
```

### 3. Descriptive Test Names

Use clear, descriptive names:

```javascript
// Good
test('should return 0 for negative coin count', () => { ... });

// Bad
test('test1', () => { ... });
```

### 4. One Assertion Per Concept

Focus each test on one specific behavior:

```javascript
// Good: Tests one concept
test('should calculate coin score correctly', () => {
  expect(calculateCoinScore(5)).toBe(50);
});

test('should handle negative values', () => {
  expect(calculateCoinScore(-5)).toBe(0);
});

// Avoid: Testing multiple concepts
test('coin score calculation', () => {
  expect(calculateCoinScore(5)).toBe(50);
  expect(calculateCoinScore(-5)).toBe(0);
  expect(calculateCoinScore(0)).toBe(0);
});
```

### 5. Test Documentation

Add comments explaining **why**, not **what**:

```javascript
test('should treat negative values as zero', () => {
  // Negative values shouldn't be possible in actual gameplay,
  // but we handle them defensively to prevent score exploits
  expect(calculateCoinScore(-5)).toBe(0);
});
```

## Running Tests

### Quick Reference

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- scoreCalculator.test.js

# Run E2E tests
npm run test:e2e
```

### Continuous Integration

Tests run automatically on:
- Every commit
- Every pull request
- Node.js 18.x and 20.x
- Multiple browsers (Chrome, Firefox, Safari)

## Coverage Requirements

The project maintains high test coverage:

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Excluded from Coverage

Some files are excluded from coverage requirements:
- `src/main.js` - Entry point
- `src/scenes/**/*.js` - Phaser scenes (tested via E2E)
- Certain utility managers (tested via integration)

## Writing New Tests

### For New Features

1. **Write test first**
   ```javascript
   test('new feature should work', () => {
     expect(newFunction()).toBe(expectedResult);
   });
   ```

2. **Run test** - Should fail (Red phase)
   ```bash
   npm test
   ```

3. **Implement feature** - Make test pass (Green phase)
   ```javascript
   export function newFunction() {
     return expectedResult;
   }
   ```

4. **Refactor** - Improve code quality
   - Add documentation
   - Extract constants
   - Improve naming

5. **Verify** - Tests still pass
   ```bash
   npm test
   ```

### For Bug Fixes

1. **Write failing test** that reproduces the bug
2. **Fix the bug** to make test pass
3. **Verify** all tests still pass

## Resources

- **Jest Documentation**: https://jestjs.io/
- **Playwright Documentation**: https://playwright.dev/
- **TDD Principles**: https://en.wikipedia.org/wiki/Test-driven_development

## Examples

See the following files for complete examples:

- `src/__tests__/scoringSystemIntegration.test.js` - Integration test example
- `src/__tests__/scoreCalculator.test.js` - Unit test example
- `src/__tests__/gameLogic.test.js` - Game mechanics test example

---

## Summary

TDD ensures:
- ✅ **Code Quality** - Tests catch bugs early
- ✅ **Design Improvement** - Writing tests first leads to better APIs
- ✅ **Documentation** - Tests serve as living documentation
- ✅ **Confidence** - Refactor without fear of breaking things
- ✅ **Regression Prevention** - Tests prevent old bugs from returning

The Mario Game project demonstrates TDD best practices with comprehensive test coverage, integration tests for real-world scenarios, and clear test organization.
