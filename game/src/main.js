// Solmara Sizzle Kitchen — boot and the frame loop. One file, one job: size
// the canvas, pick a live game or a staged screenshot scene from the URL,
// then tick the rules and paint, forever, at the browser's own pace.

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { SCREEN_PLAY, createKitchen, tickKitchen } from './kitchen.js';
import { renderGame } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7') || 7;
const shot = params.get('shot');

// A ?shot= URL stages one frozen scene for screenshots; any other load is a
// live game waiting on its title screen.
const state = shot ? stageShot(shot, seed) : createKitchen(seed);
attachInput(canvas, state);

const status = document.getElementById('status');
let lastFrame = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (state.screen === SCREEN_PLAY) tickKitchen(state, dt);
  renderGame(ctx, state);
  if (status) {
    status.textContent = `Day ${state.day}, score ${state.score}, ${state.served} dishes served, `
      + `${state.orders.length} orders on the board, ${Math.ceil(state.dayTimeLeft)} seconds left.`;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
