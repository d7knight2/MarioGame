/**
 * Data-driven puzzle level definitions for Puzzle Mode.
 * Win by opening the gate (switches or key), then touching the finish flag.
 */

export const PUZZLE_MAX_LEVEL = 2;

/**
 * @typedef {Object} PuzzlePlatform
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} [color]
 */

/**
 * @typedef {Object} PuzzleLevel
 * @property {string} name
 * @property {string} objective
 * @property {'switches'|'key'} puzzleType
 * @property {PuzzlePlatform[]} platforms
 * @property {{x:number,y:number}[]} coins
 * @property {{x:number,y:number,speed:number}[]} enemies
 * @property {{x:number,y:number}[]} [switches]
 * @property {{x:number,y:number}[]} [keys]
 * @property {{x:number,y:number,w:number,h:number}} gate
 * @property {{x:number,y:number}} flag
 * @property {number} [switchesRequired]
 */

/** @type {PuzzleLevel[]} */
export const PUZZLE_LEVELS = [
  {
    name: 'Switch Gate',
    objective: 'Hit both switches to open the gate',
    puzzleType: 'switches',
    switchesRequired: 2,
    platforms: [
      { x: 220, y: 480, w: 140, h: 32 },
      { x: 480, y: 420, w: 120, h: 32 },
      { x: 720, y: 360, w: 120, h: 32 },
      { x: 980, y: 420, w: 160, h: 32 },
      { x: 1280, y: 380, w: 120, h: 32 },
      { x: 1550, y: 450, w: 180, h: 32 },
      { x: 1850, y: 400, w: 140, h: 32 },
      { x: 2150, y: 460, w: 200, h: 32 },
      { x: 2500, y: 420, w: 160, h: 32 },
      { x: 2800, y: 480, w: 180, h: 32 }
    ],
    coins: [
      { x: 250, y: 430 }, { x: 310, y: 430 },
      { x: 510, y: 370 }, { x: 750, y: 310 },
      { x: 1020, y: 370 }, { x: 1080, y: 370 },
      { x: 1310, y: 330 }, { x: 1600, y: 400 },
      { x: 1880, y: 350 }, { x: 2200, y: 410 },
      { x: 2540, y: 370 }, { x: 2860, y: 430 }
    ],
    enemies: [
      { x: 600, y: 500, speed: 70 },
      { x: 1400, y: 500, speed: -80 },
      { x: 2000, y: 500, speed: 75 }
    ],
    switches: [
      { x: 750, y: 340 },
      { x: 1880, y: 380 }
    ],
    gate: { x: 2920, y: 400, w: 40, h: 140 },
    flag: { x: 3050, y: 500 }
  },
  {
    name: 'Key Quest',
    objective: 'Find the key to unlock the gate',
    puzzleType: 'key',
    platforms: [
      { x: 200, y: 500, w: 120, h: 32 },
      { x: 420, y: 440, w: 100, h: 32 },
      { x: 640, y: 380, w: 100, h: 32 },
      { x: 860, y: 320, w: 120, h: 32 },
      { x: 1100, y: 280, w: 100, h: 32 },
      { x: 1340, y: 360, w: 140, h: 32 },
      { x: 1620, y: 420, w: 120, h: 32 },
      { x: 1880, y: 360, w: 100, h: 32 },
      { x: 2140, y: 440, w: 160, h: 32 },
      { x: 2450, y: 400, w: 140, h: 32 },
      { x: 2750, y: 470, w: 200, h: 32 }
    ],
    coins: [
      { x: 230, y: 450 }, { x: 450, y: 390 },
      { x: 670, y: 330 }, { x: 890, y: 270 },
      { x: 1130, y: 230 }, { x: 1380, y: 310 },
      { x: 1650, y: 370 }, { x: 1910, y: 310 },
      { x: 2180, y: 390 }, { x: 2480, y: 350 },
      { x: 2800, y: 420 }
    ],
    enemies: [
      { x: 500, y: 500, speed: 85 },
      { x: 1200, y: 500, speed: -90 },
      { x: 1700, y: 500, speed: 80 },
      { x: 2300, y: 500, speed: -85 }
    ],
    keys: [
      { x: 1130, y: 230 }
    ],
    gate: { x: 2880, y: 390, w: 40, h: 150 },
    flag: { x: 3050, y: 500 }
  }
];

/**
 * @param {number} levelNumber - 1-based
 * @returns {PuzzleLevel|null}
 */
export function getPuzzleLevel(levelNumber) {
  const index = levelNumber - 1;
  if (index < 0 || index >= PUZZLE_LEVELS.length) {
    return null;
  }
  return PUZZLE_LEVELS[index];
}
