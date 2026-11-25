// Solmara Sizzle Kitchen — mouse and keyboard. One file, one job: turn a
// click or a key into one call on the kitchen rules, and play the sound that
// answers it at once. It never draws and never changes a rule itself.

import { INGREDIENTS } from './config.js';
import {
  AGAIN_BUTTON,
  CLEAR_BUTTON,
  MUTE_BUTTON,
  NEXT_DAY_BUTTON,
  PAUSE_BUTTON,
  PLATE,
  SERVE_BUTTON,
  START_BUTTON,
  ingredientBinRect,
  pointInPlate,
  pointInRect,
} from './layout.js';
import {
  SCREEN_DAY_END,
  SCREEN_OVER,
  SCREEN_PLAY,
  SCREEN_TITLE,
  addIngredient,
  clearPlate,
  nextDay,
  removeTopIngredient,
  servePlate,
  startGame,
} from './kitchen.js';
import {
  playAdd,
  playClick,
  playServe,
  playWrong,
  setMuted,
} from './audio.js';

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function tryServe(state) {
  const result = servePlate(state);
  if (result.ok) playServe();
  else if (result.reason === 'no-match') playWrong();
}

function pressStart(state) {
  if (state.screen === SCREEN_TITLE) {
    playClick();
    startGame(state);
  } else if (state.screen === SCREEN_DAY_END) {
    playClick();
    nextDay(state);
  } else if (state.screen === SCREEN_OVER) {
    playClick();
    startGame(state);
  }
}

/** Wire a canvas up to the kitchen state. Call once, at boot. */
export function attachInput(canvas, state) {
  canvas.addEventListener('click', (event) => {
    const point = canvasPoint(canvas, event);
    if (state.screen === SCREEN_TITLE) {
      if (pointInRect(point.x, point.y, START_BUTTON)) pressStart(state);
      return;
    }
    if (state.screen === SCREEN_DAY_END) {
      if (pointInRect(point.x, point.y, NEXT_DAY_BUTTON)) pressStart(state);
      return;
    }
    if (state.screen === SCREEN_OVER) {
      if (pointInRect(point.x, point.y, AGAIN_BUTTON)) pressStart(state);
      return;
    }
    if (pointInRect(point.x, point.y, MUTE_BUTTON)) {
      state.muted = !state.muted;
      setMuted(state.muted);
      playClick();
      return;
    }
    if (pointInRect(point.x, point.y, PAUSE_BUTTON)) {
      state.paused = !state.paused;
      playClick();
      return;
    }
    if (state.screen !== SCREEN_PLAY || state.paused) return;
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (pointInRect(point.x, point.y, ingredientBinRect(i))) {
        if (addIngredient(state, INGREDIENTS[i].id)) playAdd();
        return;
      }
    }
    if (pointInRect(point.x, point.y, SERVE_BUTTON)) {
      tryServe(state);
      return;
    }
    if (pointInRect(point.x, point.y, CLEAR_BUTTON)) {
      if (clearPlate(state)) playClick();
      return;
    }
    if (pointInPlate(point.x, point.y)) {
      if (removeTopIngredient(state)) playClick();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') {
      if (state.screen === SCREEN_TITLE || state.screen === SCREEN_DAY_END || state.screen === SCREEN_OVER) {
        event.preventDefault();
        pressStart(state);
        return;
      }
      if (event.code === 'Enter' && state.screen === SCREEN_PLAY) tryServe(state);
      return;
    }
    if (event.code === 'KeyM') {
      state.muted = !state.muted;
      setMuted(state.muted);
      return;
    }
    if (event.code === 'KeyP' && state.screen === SCREEN_PLAY) {
      state.paused = !state.paused;
      return;
    }
    if (state.screen !== SCREEN_PLAY || state.paused) return;
    if (event.code === 'KeyC' || event.code === 'Backspace') {
      if (clearPlate(state)) playClick();
      return;
    }
    const digit = Number(event.key);
    if (digit >= 1 && digit <= INGREDIENTS.length) {
      if (addIngredient(state, INGREDIENTS[digit - 1].id)) playAdd();
    }
  });
}

export { PLATE };
