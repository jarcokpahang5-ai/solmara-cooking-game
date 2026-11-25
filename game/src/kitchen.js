// Solmara Sizzle Kitchen — the rules: orders, the plate, the clock, scoring.
// This file knows nothing about drawing or input; it only moves the kitchen
// forward one tick at a time, so the same rules drive play and screenshots.

import {
  DAY_LENGTH_SECONDS,
  MAX_ACTIVE_ORDERS,
  QUICK_TIP_COINS,
  QUICK_TIP_SECONDS_FRACTION,
  TOTAL_DAYS,
  dayTuning,
  recipesForDay,
} from './config.js';
import { makeSeededRandom, pickFrom } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_DAY_END = 'dayend';
export const SCREEN_OVER = 'over';

let nextOrderId = 1;

/** A fresh kitchen, before the first day starts. */
export function createKitchen(seed) {
  return {
    seed,
    random: makeSeededRandom(seed),
    screen: SCREEN_TITLE,
    paused: false,
    muted: false,
    day: 1,
    dayTimeLeft: DAY_LENGTH_SECONDS,
    spawnIn: 6,
    orders: [],
    plate: [],
    score: 0,
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    servedToday: 0,
    coinsToday: 0,
    message: 'Welcome to Solmara Sizzle Kitchen!',
    messageUntil: 0,
    clock: 0,
    platePop: 0,
    serveFlash: 0,
    readyDish: null,
    daySummary: null,
  };
}

export function startDay(state) {
  state.screen = SCREEN_PLAY;
  state.dayTimeLeft = DAY_LENGTH_SECONDS;
  state.spawnIn = 4;
  state.orders = [];
  state.plate = [];
  state.servedToday = 0;
  state.coinsToday = 0;
  state.combo = 0;
  state.message = `Day ${state.day} — orders are coming in!`;
  state.messageUntil = state.clock + 3;
  state.readyDish = null;
  spawnOrder(state);
  spawnOrder(state);
}

export function startGame(state) {
  state.day = 1;
  state.score = 0;
  state.coins = 0;
  state.served = 0;
  state.missed = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.daySummary = null;
  startDay(state);
}

/** Deal one new ticket onto the order board, if there is room. A dish already
 * on the board is not dealt again while another dish is free, so the board
 * always shows a spread of different orders. */
export function spawnOrder(state) {
  if (state.orders.length >= MAX_ACTIVE_ORDERS) return null;
  const tuning = dayTuning(state.day);
  const onBoard = new Set(state.orders.map((order) => order.dish));
  const menu = recipesForDay(state.day);
  const fresh = menu.filter((dish) => !onBoard.has(dish.name));
  const dish = pickFrom(state.random, fresh.length > 0 ? fresh : menu);
  const order = {
    id: nextOrderId,
    dish: dish.name,
    items: dish.items.slice(),
    coins: dish.coins,
    patience: tuning.patience,
    patienceMax: tuning.patience,
  };
  nextOrderId += 1;
  state.orders.push(order);
  return order;
}

function sameMultiset(left, right) {
  if (left.length !== right.length) return false;
  const counts = new Map();
  for (const item of left) counts.set(item, (counts.get(item) || 0) + 1);
  for (const item of right) {
    const leftOver = counts.get(item) || 0;
    if (leftOver === 0) return false;
    counts.set(item, leftOver - 1);
  }
  return true;
}

/** The ticket the plate currently matches exactly, or null. */
export function matchingOrder(state) {
  if (state.plate.length === 0) return null;
  return state.orders.find((order) => sameMultiset(state.plate, order.items)) || null;
}

/** Drop one ingredient onto the plate. Returns false when the plate is full. */
export function addIngredient(state, ingredientId) {
  if (state.screen !== SCREEN_PLAY || state.paused) return false;
  if (state.plate.length >= 6) {
    state.message = 'The plate is full — serve it or clear it!';
    state.messageUntil = state.clock + 2;
    return false;
  }
  state.plate.push(ingredientId);
  state.platePop = 0.18;
  state.readyDish = matchingOrder(state);
  return true;
}

/** Lift the top ingredient back off the plate. */
export function removeTopIngredient(state) {
  if (state.screen !== SCREEN_PLAY || state.paused) return false;
  if (state.plate.length === 0) return false;
  state.plate.pop();
  state.readyDish = matchingOrder(state);
  return true;
}

/** Tip the plate out and start the dish again. */
export function clearPlate(state) {
  if (state.screen !== SCREEN_PLAY || state.paused) return false;
  if (state.plate.length === 0) return false;
  state.plate = [];
  state.readyDish = null;
  state.message = 'Plate cleared.';
  state.messageUntil = state.clock + 1.5;
  return true;
}

function orderById(state, id) {
  return state.orders.find((order) => order.id === id) || null;
}

/**
 * Serve the plate. A plate that matches a ticket earns its coins, a combo
 * bonus and a quick tip when the ticket is still fresh; a plate that matches
 * nothing breaks the combo and stays put, so the cook can fix it.
 */
export function servePlate(state) {
  if (state.screen !== SCREEN_PLAY || state.paused) return { ok: false, reason: 'not-playing' };
  const order = matchingOrder(state);
  if (!order) {
    state.combo = 0;
    state.serveFlash = 0.4;
    state.message = state.plate.length === 0
      ? 'Nothing on the plate yet — add ingredients first!'
      : 'No ticket wants this dish — check the order board!';
    state.messageUntil = state.clock + 2.5;
    return { ok: false, reason: 'no-match' };
  }
  const quick = order.patience > order.patienceMax * QUICK_TIP_SECONDS_FRACTION;
  const tip = quick ? QUICK_TIP_COINS : 0;
  const comboBonus = state.combo * 2;
  const earned = order.coins + tip + comboBonus;
  state.score += earned;
  state.coins += earned;
  state.coinsToday += earned;
  state.served += 1;
  state.servedToday += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((ticket) => ticket.id !== order.id);
  state.plate = [];
  state.readyDish = null;
  state.serveFlash = 0.4;
  state.message = quick
    ? `Served ${order.dish}! +${earned} coins (quick tip +${tip}, combo x${state.combo})`
    : `Served ${order.dish}! +${earned} coins (combo x${state.combo})`;
  state.messageUntil = state.clock + 3;
  return { ok: true, order, earned, tip };
}

function finishDay(state) {
  state.daySummary = {
    day: state.day,
    served: state.servedToday,
    coins: state.coinsToday,
    missed: state.missed,
  };
  state.plate = [];
  state.readyDish = null;
  if (state.day >= TOTAL_DAYS) {
    state.screen = SCREEN_OVER;
  } else {
    state.screen = SCREEN_DAY_END;
  }
}

/** Advance the kitchen by dt seconds: clocks, patience, spawning, day end. */
export function tickKitchen(state, dt) {
  if (state.screen !== SCREEN_PLAY || state.paused) return;
  state.clock += dt;
  state.dayTimeLeft -= dt;
  if (state.platePop > 0) state.platePop = Math.max(0, state.platePop - dt);
  if (state.serveFlash > 0) state.serveFlash = Math.max(0, state.serveFlash - dt);
  for (const order of state.orders) order.patience -= dt;
  const walkedOut = state.orders.filter((order) => order.patience <= 0);
  if (walkedOut.length > 0) {
    state.orders = state.orders.filter((order) => order.patience > 0);
    state.missed += walkedOut.length;
    state.combo = 0;
    state.message = walkedOut.length === 1
      ? `A customer walked out — ${walkedOut[0].dish} was too slow!`
      : `${walkedOut.length} customers walked out!`;
    state.messageUntil = state.clock + 3;
  }
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder(state);
    state.spawnIn = dayTuning(state.day).spawnGap;
  }
  if (state.dayTimeLeft <= 0) {
    state.dayTimeLeft = 0;
    finishDay(state);
  }
}

/** Move on from the day-end card to the next day. */
export function nextDay(state) {
  if (state.screen !== SCREEN_DAY_END) return;
  state.day += 1;
  startDay(state);
}
