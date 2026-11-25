// Solmara Sizzle Kitchen — where everything sits on the 1280x800 canvas.
// One file, one job: every clickable rectangle is computed here, so render.js
// draws exactly what input.js can click, and neither guesses the other's math.

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';

export const TOP_BAR = { x: 0, y: 0, w: CANVAS_WIDTH, h: 64 };
export const BOARD = { x: 40, y: 84, w: CANVAS_WIDTH - 80, h: 158 };
export const COUNTER = { x: 40, y: 262, w: 800, h: 258 };
export const MENU = { x: 864, y: 262, w: 376, h: 258 };
export const PLATE_STATION = { x: 40, y: 540, w: CANVAS_WIDTH - 80, h: 240 };

// Ingredient bins: two rows of four across the counter.
export function ingredientBinRect(index) {
  const perRow = 4;
  const col = index % perRow;
  const row = Math.floor(index / perRow);
  const w = 182;
  const h = 112;
  const gapX = 24;
  const gapY = 18;
  return {
    x: COUNTER.x + 16 + col * (w + gapX),
    y: COUNTER.y + 34 + row * (h + gapY),
    w,
    h,
  };
}

// Order tickets: three cards across the board.
export function orderTicketRect(index) {
  const w = 376;
  const gap = 16;
  return {
    x: BOARD.x + 16 + index * (w + gap),
    y: BOARD.y + 34,
    w,
    h: 108,
  };
}

export const PLATE = { cx: 300, cy: 660, r: 96 };

export const SERVE_BUTTON = { x: 520, y: 592, w: 300, h: 76 };
export const CLEAR_BUTTON = { x: 520, y: 684, w: 300, h: 48 };
export const START_BUTTON = { x: 490, y: 560, w: 300, h: 72 };
export const NEXT_DAY_BUTTON = { x: 490, y: 540, w: 300, h: 72 };
export const AGAIN_BUTTON = { x: 490, y: 560, w: 300, h: 72 };
export const PAUSE_BUTTON = { x: CANVAS_WIDTH - 118, y: 12, w: 46, h: 40 };
export const MUTE_BUTTON = { x: CANVAS_WIDTH - 62, y: 12, w: 46, h: 40 };

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function pointInPlate(px, py) {
  const dx = px - PLATE.cx;
  const dy = py - PLATE.cy;
  return dx * dx + dy * dy <= PLATE.r * PLATE.r;
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
