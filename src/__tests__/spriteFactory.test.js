import { jest } from '@jest/globals';

const mockPhaser = {
  Display: {
    Color: {
      GetRed: (c) => (c >> 16) & 0xff,
      GetGreen: (c) => (c >> 8) & 0xff,
      GetBlue: (c) => c & 0xff,
      GetColor: (r, g, b) => ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)
    }
  },
  Math: {
    Clamp: (v, min, max) => Math.min(Math.max(v, min), max)
  }
};

jest.unstable_mockModule('phaser', () => ({
  default: mockPhaser
}));

const { default: SpriteFactory } = await import('../utils/SpriteFactory.js');

function createGraphicsMock() {
  return {
    fillStyle: jest.fn(),
    fillRect: jest.fn(),
    lineStyle: jest.fn(),
    strokeRect: jest.fn(),
    fillCircle: jest.fn(),
    fillEllipse: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    strokePath: jest.fn(),
    fillTriangle: jest.fn(),
    strokeRoundedRect: jest.fn(),
    closePath: jest.fn(),
    fillPath: jest.fn(),
    generateTexture: jest.fn(),
    destroy: jest.fn()
  };
}

describe('SpriteFactory', () => {
  test('shadeColor adjusts rgb channels with clamping', () => {
    expect(SpriteFactory.shadeColor(0x112233, 30)).toBe(0x2f4051);
    expect(SpriteFactory.shadeColor(0x050505, -20)).toBe(0x000000);
    expect(SpriteFactory.shadeColor(0xfefefe, 20)).toBe(0xffffff);
  });

  test('drawHatLogo draws mario emblem strokes', () => {
    const graphics = createGraphicsMock();
    SpriteFactory.drawHatLogo(graphics, 'M', 0xaa0000);

    expect(graphics.lineStyle).toHaveBeenCalledWith(1.5, 0xaa0000, 1);
    expect(graphics.moveTo).toHaveBeenCalledWith(17, 9);
    expect(graphics.lineTo).toHaveBeenCalledWith(23, 9);
    expect(graphics.strokePath).toHaveBeenCalledTimes(1);
  });

  test('createCharacterSprite generates mario texture and cleans up graphics', () => {
    const graphics = createGraphicsMock();
    const scene = {
      add: {
        graphics: jest.fn(() => graphics)
      }
    };

    const result = SpriteFactory.createCharacterSprite(scene, 'mario');

    expect(result).toEqual({ textureKey: 'character_mario', width: 40, height: 55 });
    expect(scene.add.graphics).toHaveBeenCalledTimes(1);
    expect(graphics.generateTexture).toHaveBeenCalledWith('character_mario', 40, 55);
    expect(graphics.destroy).toHaveBeenCalledTimes(1);
  });
});
