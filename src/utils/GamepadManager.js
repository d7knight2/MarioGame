/**
 * Browser Gamepad API helper for controllers / Joy-Cons.
 * Polls connected pads and maps to Mario move/jump/fire input.
 */

const DEADZONE = 0.35;

/** Standard Gamepad mapping button indices */
export const BUTTON = {
  A: 0,          // Cross / A — jump
  B: 1,          // Circle / B — fire (alt)
  X: 2,          // Square / X — fire
  Y: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  SELECT: 8,
  START: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15
};

/**
 * @typedef {Object} GamepadInput
 * @property {boolean} left
 * @property {boolean} right
 * @property {boolean} jump
 * @property {boolean} fire
 * @property {boolean} connected
 * @property {string|null} id
 */

/**
 * @returns {GamepadInput}
 */
export function createEmptyInput() {
  return {
    left: false,
    right: false,
    jump: false,
    fire: false,
    connected: false,
    id: null
  };
}

/**
 * Read a single gamepad into Mario controls.
 * Works with Standard Gamepad mapping and common Joy-Con / Bluetooth pads.
 * @param {Gamepad|null} pad
 * @returns {GamepadInput}
 */
export function readGamepad(pad) {
  const input = createEmptyInput();
  if (!pad || !pad.connected) {
    return input;
  }

  input.connected = true;
  input.id = pad.id || 'Gamepad';

  const buttons = pad.buttons || [];
  const axes = pad.axes || [];

  const pressed = (index) => {
    const btn = buttons[index];
    if (!btn) return false;
    return btn.pressed || btn.value > 0.5;
  };

  const axisX = typeof axes[0] === 'number' ? axes[0] : 0;

  input.left = pressed(BUTTON.DPAD_LEFT) || axisX < -DEADZONE;
  input.right = pressed(BUTTON.DPAD_RIGHT) || axisX > DEADZONE;
  input.jump = pressed(BUTTON.A) || pressed(BUTTON.Y);
  // Fire: X / B / R1 — covers Joy-Con and Xbox/PS layouts
  input.fire = pressed(BUTTON.X) || pressed(BUTTON.B) || pressed(BUTTON.R1);

  return input;
}

/**
 * Poll navigator.getGamepads() safely.
 * @returns {Array<Gamepad|null>}
 */
export function getConnectedGamepads() {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return [];
  }
  try {
    const list = navigator.getGamepads();
    return list ? Array.from(list).filter(Boolean) : [];
  } catch {
    return [];
  }
}

/**
 * Get input for player index (0 = first pad, 1 = second).
 * @param {number} playerIndex
 * @returns {GamepadInput}
 */
export function getPlayerGamepadInput(playerIndex = 0) {
  const pads = getConnectedGamepads();
  return readGamepad(pads[playerIndex] || null);
}

/**
 * Merge gamepad input into registry-style touch flags without clearing them.
 * @param {Object} registry - Phaser registry-like object with get/set
 * @param {GamepadInput} padInput
 * @param {Object} [options]
 * @param {boolean} [options.overwrite=false] - if true, set only from pad (ignore prior touch)
 */
export function applyGamepadToRegistry(registry, padInput, options = {}) {
  if (!registry || !padInput || !padInput.connected) {
    return;
  }

  const { overwrite = false } = options;

  if (overwrite) {
    registry.set('moveLeft', padInput.left);
    registry.set('moveRight', padInput.right);
    registry.set('jump', padInput.jump);
    registry.set('fire', padInput.fire);
    return;
  }

  if (padInput.left) registry.set('moveLeft', true);
  if (padInput.right) registry.set('moveRight', true);
  if (padInput.jump) registry.set('jump', true);
  if (padInput.fire) registry.set('fire', true);
}

/**
 * Lightweight manager that tracks connect/disconnect and polls each frame.
 */
export default class GamepadManager {
  constructor() {
    this.lastPadIds = [];
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
  }

  start() {
    if (typeof window === 'undefined') return;
    window.addEventListener('gamepadconnected', this._onConnect);
    window.addEventListener('gamepaddisconnected', this._onDisconnect);
  }

  stop() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('gamepadconnected', this._onConnect);
    window.removeEventListener('gamepaddisconnected', this._onDisconnect);
  }

  _onConnect(event) {
    this.lastPadIds = getConnectedGamepads().map((p) => p.id);
    if (typeof console !== 'undefined') {
      console.info('[Gamepad] Connected:', event.gamepad?.id);
    }
  }

  _onDisconnect(event) {
    this.lastPadIds = getConnectedGamepads().map((p) => p.id);
    if (typeof console !== 'undefined') {
      console.info('[Gamepad] Disconnected:', event.gamepad?.id);
    }
  }

  /**
   * @param {number} playerIndex
   * @returns {GamepadInput}
   */
  poll(playerIndex = 0) {
    return getPlayerGamepadInput(playerIndex);
  }

  /**
   * @returns {number}
   */
  getConnectedCount() {
    return getConnectedGamepads().length;
  }
}
