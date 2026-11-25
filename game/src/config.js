// Solmara Sizzle Kitchen — tuning, ingredients, recipes and palette.
// One file, one job: every number and name the kitchen rules use lives here,
// so the rest of the game reads like a recipe book, not a spreadsheet.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;
export const DAY_LENGTH_SECONDS = 120;
export const MAX_ACTIVE_ORDERS = 3;
export const QUICK_TIP_SECONDS_FRACTION = 0.5;
export const QUICK_TIP_COINS = 3;

// Patience (seconds) and spawn gap (seconds) per day: later days rush harder.
export const DAY_TUNING = [
  { patience: 50, spawnGap: 14 },
  { patience: 42, spawnGap: 11 },
  { patience: 35, spawnGap: 9 },
];
export const TOTAL_DAYS = 3;

export const PALETTE = {
  wall: '#f7e8c9',
  wallTile: '#f2dcb4',
  floor: '#8a5a33',
  counterTop: '#b5773f',
  counterFront: '#7c4a21',
  board: '#5b3a1e',
  boardPaper: '#fff8e7',
  cream: '#fff6df',
  ink: '#3a2412',
  softInk: '#6b4a2a',
  tomatoRed: '#d94f30',
  leafGreen: '#3f9e4d',
  gold: '#f2b705',
  plateWhite: '#fdfdf8',
  serveGreen: '#2e9e4f',
  serveGreenDark: '#1f7a38',
  danger: '#c0392b',
};

// Eight ingredients on the counter, in key order (keys 1-8). Each one carries
// the colours its drawing uses, so render.js never hard-codes a food's look.
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', main: '#e8b06a', dark: '#c98d45', light: '#f6d9a0' },
  { id: 'patty', name: 'Patty', key: '2', main: '#7a4a21', dark: '#5d3413', light: '#9c6a35' },
  { id: 'cheese', name: 'Cheese', key: '3', main: '#f6c945', dark: '#d9a41f', light: '#ffe27a' },
  { id: 'lettuce', name: 'Lettuce', key: '4', main: '#4caf50', dark: '#2f7d32', light: '#8fd694' },
  { id: 'tomato', name: 'Tomato', key: '5', main: '#e74c3c', dark: '#b93224', light: '#ff8a75' },
  { id: 'egg', name: 'Egg', key: '6', main: '#fdfdf8', dark: '#d9d2c0', light: '#ffffff' },
  { id: 'onion', name: 'Onion', key: '7', main: '#b388eb', dark: '#7e57c2', light: '#d1c4e9' },
  { id: 'sauce', name: 'Sauce', key: '8', main: '#e25822', dark: '#a83a12', light: '#ff8a5c' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

// A dish is a name, the exact multiset of ingredients on its plate, and its
// payout in coins. Duplicates matter: Cheese Stack really wants two cheese.
export const RECIPES = [
  { name: 'Sunny Burger', items: ['bun', 'patty', 'lettuce', 'tomato'], coins: 12 },
  { name: 'Cheese Stack', items: ['bun', 'patty', 'cheese', 'cheese'], coins: 14 },
  { name: 'Garden Skillet', items: ['lettuce', 'tomato', 'egg', 'onion'], coins: 11 },
  { name: 'Golden Omelette', items: ['egg', 'egg', 'cheese', 'onion'], coins: 13 },
  { name: 'Tomato Melt', items: ['bun', 'cheese', 'tomato', 'tomato'], coins: 10 },
  { name: 'Full Solmara', items: ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'egg'], coins: 20 },
];

export function recipeByName(name) {
  return RECIPES.find((dish) => dish.name === name);
}

// Which dishes may appear on a given day: the six-ingredient Full Solmara
// only joins the menu from day 2, so day 1 stays learnable.
export function recipesForDay(day) {
  return day >= 2 ? RECIPES : RECIPES.slice(0, 5);
}

export function dayTuning(day) {
  return DAY_TUNING[Math.min(day, TOTAL_DAYS) - 1];
}
