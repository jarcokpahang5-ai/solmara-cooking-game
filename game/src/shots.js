// Solmara Sizzle Kitchen — the staged scenes behind ?shot=title|play|
// assemble|serve. Each one starts a real day from the seed and then sets the
// table by hand, so the same seed always gives the same frame and every
// frame is a moment the real game can reach.

import { RECIPES, dayTuning } from './config.js';
import {
  SCREEN_PLAY,
  SCREEN_TITLE,
  createKitchen,
  spawnOrder,
  startDay,
} from './kitchen.js';

function freshDay(seed) {
  const state = createKitchen(seed);
  state.day = 1;
  startDay(state);
  return state;
}

function fillBoard(state) {
  while (state.orders.length < 3) spawnOrder(state);
}

// After a scene rewrites the first ticket, no other ticket may serve the
// same dish: swap any duplicate for the next recipe off the board.
function dedupeBoard(state) {
  const seen = new Set();
  for (const order of state.orders) {
    if (seen.has(order.dish)) {
      const spare = RECIPES.find((dish) => !seen.has(dish.name) && dish.name !== order.dish);
      if (spare) {
        order.dish = spare.name;
        order.items = spare.items.slice();
        order.coins = spare.coins;
      }
    }
    seen.add(order.dish);
  }
}

function setClock(state, secondsLeft) {
  state.dayTimeLeft = secondsLeft;
  state.clock = 120 - secondsLeft;
}

/**
 * Stage the named scene and return the state to draw. Unknown names fall
 * back to the title screen, so a bare page load never shows a broken frame.
 */
export function stageShot(name, seed) {
  if (name === 'play') {
    const state = freshDay(seed);
    fillBoard(state);
    state.plate = ['bun', 'patty'];
    state.score = 120;
    state.coins = 96;
    state.served = 3;
    state.servedToday = 3;
    state.coinsToday = 96;
    state.combo = 2;
    state.bestCombo = 3;
    state.orders[0].patience = state.orders[0].patienceMax * 0.62;
    state.orders[1].patience = state.orders[1].patienceMax * 0.4;
    setClock(state, 74);
    state.message = 'Nice — keep the tickets moving!';
    state.messageUntil = state.clock + 3;
    state.screen = SCREEN_PLAY;
    return state;
  }
  if (name === 'assemble') {
    const state = freshDay(seed);
    fillBoard(state);
    // The first ticket is a Sunny Burger; the plate holds its first three
    // ingredients, one tomato short — a dish caught mid-assembly.
    state.orders[0] = {
      id: state.orders[0].id,
      dish: 'Sunny Burger',
      items: ['bun', 'patty', 'lettuce', 'tomato'],
      coins: 12,
      patience: dayTuning(1).patience * 0.55,
      patienceMax: dayTuning(1).patience,
    };
    dedupeBoard(state);
    state.plate = ['bun', 'patty', 'lettuce'];
    state.score = 48;
    state.coins = 36;
    state.served = 1;
    state.servedToday = 1;
    state.coinsToday = 36;
    state.combo = 1;
    state.bestCombo = 2;
    state.orders[1].patience = state.orders[1].patienceMax * 0.8;
    setClock(state, 96);
    state.message = 'One more — the Sunny Burger needs a tomato!';
    state.messageUntil = state.clock + 3;
    state.screen = SCREEN_PLAY;
    return state;
  }
  if (name === 'serve') {
    const state = freshDay(seed);
    fillBoard(state);
    // The plate exactly matches the first ticket: the serve button glows and
    // the ticket is highlighted — a plate ready to serve.
    state.orders[0] = {
      id: state.orders[0].id,
      dish: 'Sunny Burger',
      items: ['bun', 'patty', 'lettuce', 'tomato'],
      coins: 12,
      patience: dayTuning(1).patience * 0.7,
      patienceMax: dayTuning(1).patience,
    };
    dedupeBoard(state);
    state.plate = ['bun', 'patty', 'lettuce', 'tomato'];
    state.readyDish = state.orders[0];
    state.score = 156;
    state.coins = 132;
    state.served = 4;
    state.servedToday = 4;
    state.coinsToday = 132;
    state.combo = 3;
    state.bestCombo = 4;
    setClock(state, 58);
    state.message = 'Perfect match — SERVE it now for a quick tip!';
    state.messageUntil = state.clock + 3;
    state.screen = SCREEN_PLAY;
    return state;
  }
  const state = createKitchen(seed);
  state.screen = SCREEN_TITLE;
  return state;
}
