export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    '^phaser$': '<rootDir>/node_modules/phaser/dist/phaser.js'
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/scenes/**/*.js',
    '!src/utils/AnimationManager.js',
    '!src/utils/BackgroundGenerator.js',
    '!src/utils/ParticleEffects.js',
    '!src/utils/SpriteFactory.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
