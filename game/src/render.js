// Solmara Sizzle Kitchen — everything the player sees, drawn on one canvas.
// One file, one job: it reads the kitchen state and paints it, and never
// changes the rules. Food is drawn from coloured shapes, so the game needs no
// image files and looks the same on every machine.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DAY_LENGTH_SECONDS,
  INGREDIENTS,
  PALETTE,
  RECIPES,
  ingredientById,
} from './config.js';
import {
  BOARD,
  CLEAR_BUTTON,
  COUNTER,
  MENU,
  NEXT_DAY_BUTTON,
  AGAIN_BUTTON,
  MUTE_BUTTON,
  PAUSE_BUTTON,
  PLATE,
  PLATE_STATION,
  SERVE_BUTTON,
  START_BUTTON,
  TOP_BAR,
  ingredientBinRect,
  orderTicketRect,
} from './layout.js';
import { SCREEN_DAY_END, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './kitchen.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function patienceColor(fraction) {
  if (fraction > 0.5) return PALETTE.leafGreen;
  if (fraction > 0.25) return PALETTE.gold;
  return PALETTE.danger;
}

function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Draw one ingredient as coloured shapes, centred at (cx, cy), size ~radius. */
export function drawIngredient(ctx, id, cx, cy, size) {
  const item = ingredientById(id);
  if (!item) return;
  const s = size;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = item.dark;
    rr(ctx, -s, -s * 0.15, s * 2, s * 0.55, s * 0.2);
    ctx.fill();
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = item.light;
    for (const [dx, dy] of [[-0.45, -0.55], [0, -0.75], [0.45, -0.55], [-0.2, -0.35], [0.25, -0.3]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = item.dark;
    rr(ctx, -s * 1.05, -s * 0.42, s * 2.1, s * 0.84, s * 0.4);
    ctx.fill();
    ctx.fillStyle = item.main;
    rr(ctx, -s, -s * 0.32, s * 2, s * 0.64, s * 0.3);
    ctx.fill();
    ctx.fillStyle = item.light;
    for (const dx of [-0.6, 0, 0.6]) {
      ctx.beginPath();
      ctx.arc(dx * s, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.6);
    ctx.lineTo(s, s * 0.6);
    ctx.lineTo(0, -s * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.dark;
    for (const [dx, dy] of [[-0.3, 0.25], [0.3, 0.3], [0, -0.1]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = item.main;
    for (const [dx, dy, r] of [[-0.55, 0.15, 0.55], [0, -0.25, 0.65], [0.55, 0.15, 0.55]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.2);
    ctx.quadraticCurveTo(0, -s * 0.5, s * 0.7, s * 0.2);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = item.light;
    ctx.beginPath();
    ctx.arc(-s * 0.3, -s * 0.25, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.leafGreen;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.35, -s * 0.95);
    ctx.lineTo(0, -s * 0.75);
    ctx.lineTo(s * 0.35, -s * 0.95);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.05, s * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = s * 0.06;
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(s * 0.1, s * 0.05, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(s * 0.02, -s * 0.05, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'onion') {
    ctx.strokeStyle = item.main;
    ctx.lineWidth = s * 0.22;
    for (const r of [0.85, 0.55, 0.28]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = item.light;
    ctx.lineWidth = s * 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'sauce') {
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.75, -s * 0.1, s * 0.45, s * 0.7);
    ctx.quadraticCurveTo(0, s, -s * 0.45, s * 0.7);
    ctx.quadraticCurveTo(-s * 0.75, -s * 0.1, 0, -s);
    ctx.fill();
    ctx.fillStyle = item.light;
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.15, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWallAndFloor(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = PALETTE.wallTile;
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    for (let y = 64; y < 262; y += 64) {
      if (((x + y) / 64) % 2 === 0) ctx.fillRect(x, y, 62, 62);
    }
  }
  // Hanging lamps and a shelf of pots, for a kitchen that reads as a kitchen.
  for (const lx of [220, 640, 1060]) {
    ctx.strokeStyle = '#5b3a1e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lx, 64);
    ctx.lineTo(lx, 96);
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(lx, 108, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 520, CANVAS_WIDTH, CANVAS_HEIGHT - 520);
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#2b1a0e';
  ctx.fillRect(TOP_BAR.x, TOP_BAR.y, TOP_BAR.w, TOP_BAR.h);
  text(ctx, '🍳 SOLMARA SIZZLE KITCHEN', 24, 33, 26, '#ffd98a', '800');
  text(ctx, `DAY ${state.day} / 3`, 470, 33, 20, '#ffffff');
  text(ctx, `SCORE ${state.score}`, 580, 33, 20, '#ffffff');
  text(ctx, `🪙 ${state.coins}`, 730, 33, 20, PALETTE.gold);
  // The day timer: a bar you can feel, with the clock beside it.
  const frac = state.dayTimeLeft / DAY_LENGTH_SECONDS;
  const bx = 830;
  const bw = 300;
  ctx.fillStyle = '#4a2c14';
  rr(ctx, bx, 20, bw, 24, 12);
  ctx.fill();
  ctx.fillStyle = patienceColor(frac);
  if (frac > 0) {
    rr(ctx, bx, 20, Math.max(24, bw * frac), 24, 12);
    ctx.fill();
  }
  text(ctx, `⏱ ${formatClock(state.dayTimeLeft)}`, bx + bw + 12, 33, 20, '#ffffff');
  for (const [button, label] of [[PAUSE_BUTTON, state.paused ? '▶' : 'II'], [MUTE_BUTTON, state.muted ? '✕' : '♪']]) {
    ctx.fillStyle = '#4a2c14';
    rr(ctx, button.x, button.y, button.w, button.h, 8);
    ctx.fill();
    text(ctx, label, button.x + button.w / 2, button.y + button.h / 2 + 1, 18, '#ffffff', '800', 'center');
  }
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = PALETTE.board;
  rr(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 14);
  ctx.fill();
  text(ctx, 'ORDER BOARD  —  serve the ticket before its bar runs out', BOARD.x + 18, BOARD.y + 18, 15, '#ffd98a', '800');
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', BOARD.x + 18, BOARD.y + 92, 20, PALETTE.boardPaper, '600');
    return;
  }
  state.orders.forEach((order, index) => {
    const rect = orderTicketRect(index);
    const frac = Math.max(0, order.patience / order.patienceMax);
    const ready = state.readyDish && state.readyDish.id === order.id;
    ctx.fillStyle = ready ? '#fff3c4' : PALETTE.boardPaper;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    if (ready) {
      ctx.strokeStyle = PALETTE.serveGreen;
      ctx.lineWidth = 4;
      rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.stroke();
    }
    text(ctx, `#${order.id}  ${order.dish}`, rect.x + 14, rect.y + 20, 19, PALETTE.ink, '800');
    text(ctx, `🪙 ${order.coins}`, rect.x + rect.w - 14, rect.y + 20, 19, '#8a6d1f', '800', 'right');
    order.items.forEach((id, i) => {
      drawIngredient(ctx, id, rect.x + 30 + i * 46, rect.y + 56, 15);
    });
    ctx.fillStyle = '#e8dcc0';
    rr(ctx, rect.x + 14, rect.y + 84, rect.w - 28, 12, 6);
    ctx.fill();
    ctx.fillStyle = patienceColor(frac);
    rr(ctx, rect.x + 14, rect.y + 84, Math.max(12, (rect.w - 28) * frac), 12, 6);
    ctx.fill();
    text(ctx, `${Math.ceil(order.patience)}s`, rect.x + rect.w - 14, rect.y + 56, 15, frac < 0.25 ? PALETTE.danger : PALETTE.softInk, '800', 'right');
  });
}

function drawCounter(ctx, state) {
  ctx.fillStyle = PALETTE.counterFront;
  rr(ctx, COUNTER.x, COUNTER.y, COUNTER.w, COUNTER.h, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, COUNTER.x, COUNTER.y, COUNTER.w, 26, 12);
  ctx.fill();
  text(ctx, 'INGREDIENTS  —  click (or press 1–8) to add to the plate', COUNTER.x + 16, COUNTER.y + 13, 14, '#ffffff', '800');
  INGREDIENTS.forEach((item, index) => {
    const bin = ingredientBinRect(index);
    const inPlate = state.plate.filter((id) => id === item.id).length;
    ctx.fillStyle = '#fff8e7';
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#d9c39a';
    ctx.lineWidth = 2;
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.stroke();
    drawIngredient(ctx, item.id, bin.x + 52, bin.y + 56, 30);
    text(ctx, item.name, bin.x + 96, bin.y + 40, 19, PALETTE.ink, '800');
    text(ctx, `key ${item.key}`, bin.x + 96, bin.y + 68, 14, PALETTE.softInk, '600');
    if (inPlate > 0) {
      ctx.fillStyle = PALETTE.serveGreen;
      ctx.beginPath();
      ctx.arc(bin.x + bin.w - 22, bin.y + bin.h - 22, 16, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, String(inPlate), bin.x + bin.w - 22, bin.y + bin.h - 21, 16, '#ffffff', '800', 'center');
    }
  });
}

function drawMenu(ctx) {
  ctx.fillStyle = '#fff8e7';
  rr(ctx, MENU.x, MENU.y, MENU.w, MENU.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#d9c39a';
  ctx.lineWidth = 2;
  rr(ctx, MENU.x, MENU.y, MENU.w, MENU.h, 14);
  ctx.stroke();
  text(ctx, "TODAY'S MENU", MENU.x + 16, MENU.y + 20, 16, PALETTE.ink, '800');
  RECIPES.forEach((dish, index) => {
    const y = MENU.y + 52 + index * 34;
    text(ctx, dish.name, MENU.x + 16, y, 15, PALETTE.ink, '700');
    text(ctx, `🪙${dish.coins}`, MENU.x + MENU.w - 14, y, 14, '#8a6d1f', '700', 'right');
    dish.items.forEach((id, i) => {
      drawIngredient(ctx, id, MENU.x + MENU.w - 60 - (dish.items.length - 1 - i) * 30, y, 10);
    });
  });
}

function drawPlateStation(ctx, state) {
  ctx.fillStyle = 'rgba(43, 26, 14, 0.92)';
  rr(ctx, PLATE_STATION.x, PLATE_STATION.y, PLATE_STATION.w, PLATE_STATION.h, 14);
  ctx.fill();
  text(ctx, 'YOUR PLATE  —  click the plate to lift the top item off', PLATE_STATION.x + 16, PLATE_STATION.y + 20, 14, '#ffd98a', '800');
  // The plate, with the dish stacked on it layer by layer.
  ctx.fillStyle = PALETTE.plateWhite;
  ctx.beginPath();
  ctx.arc(PLATE.cx, PLATE.cy, PLATE.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9b98f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(PLATE.cx, PLATE.cy, PLATE.r - 8, 0, Math.PI * 2);
  ctx.stroke();
  if (state.plate.length === 0) {
    text(ctx, 'empty plate', PLATE.cx, PLATE.cy, 18, '#b8a888', '600', 'center');
  } else {
    const pop = 1 + state.platePop * 0.6;
    state.plate.forEach((id, i) => {
      const y = PLATE.cy + 34 - i * 22;
      const scale = i === state.plate.length - 1 ? pop : 1;
      drawIngredient(ctx, id, PLATE.cx, y, 30 * scale);
    });
  }
  // Serve button: it glows green when a ticket matches the plate.
  const ready = Boolean(state.readyDish);
  const pulse = ready ? 1 + Math.sin(state.clock * 6) * 0.03 : 1;
  ctx.save();
  ctx.translate(SERVE_BUTTON.x + SERVE_BUTTON.w / 2, SERVE_BUTTON.y + SERVE_BUTTON.h / 2);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = ready ? PALETTE.serveGreen : '#5d7a63';
  rr(ctx, -SERVE_BUTTON.w / 2, -SERVE_BUTTON.h / 2, SERVE_BUTTON.w, SERVE_BUTTON.h, 14);
  ctx.fill();
  ctx.restore();
  text(ctx, ready ? `SERVE ${state.readyDish.dish.toUpperCase()}!` : 'SERVE  (Enter)', SERVE_BUTTON.x + SERVE_BUTTON.w / 2, SERVE_BUTTON.y + SERVE_BUTTON.h / 2, ready ? 22 : 20, '#ffffff', '800', 'center');
  ctx.fillStyle = '#4a2c14';
  rr(ctx, CLEAR_BUTTON.x, CLEAR_BUTTON.y, CLEAR_BUTTON.w, CLEAR_BUTTON.h, 10);
  ctx.fill();
  text(ctx, 'CLEAR PLATE  (C)', CLEAR_BUTTON.x + CLEAR_BUTTON.w / 2, CLEAR_BUTTON.y + CLEAR_BUTTON.h / 2, 16, '#ffd98a', '800', 'center');
  if (state.serveFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.serveFlash})`;
    ctx.fillRect(PLATE_STATION.x, PLATE_STATION.y, PLATE_STATION.w, PLATE_STATION.h);
  }
  // Stats and the cook's message, on the right of the station.
  const sx = 864;
  text(ctx, `SERVED  ${state.served}`, sx, 592, 20, '#ffffff');
  text(ctx, `MISSED  ${state.missed}`, sx, 624, 20, '#ffb3a3');
  text(ctx, `COMBO  x${state.combo}   (best x${state.bestCombo})`, sx, 656, 20, state.combo >= 3 ? PALETTE.gold : '#ffffff');
  text(ctx, `DAY ${state.day} — ${state.servedToday} served, 🪙 ${state.coinsToday} earned`, sx, 688, 16, '#ffd98a');
  const showMessage = state.clock < state.messageUntil;
  text(ctx, showMessage ? state.message : 'Match a ticket exactly, then SERVE before its bar runs out.', sx, 724, 15, showMessage ? '#ffffff' : '#cbb693', '600');
  if (state.paused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    text(ctx, 'PAUSED — press P to keep cooking', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 32, '#ffffff', '800', 'center');
  }
}

function overlayCard(ctx) {
  ctx.fillStyle = 'rgba(43, 26, 14, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = PALETTE.cream;
  rr(ctx, 290, 110, 700, 560, 18);
  ctx.fill();
}

function drawTitle(ctx, state) {
  overlayCard(ctx);
  drawIngredient(ctx, 'bun', 400, 210, 34);
  drawIngredient(ctx, 'tomato', 880, 210, 34);
  drawIngredient(ctx, 'egg', 640, 168, 26);
  text(ctx, 'SOLMARA', 640, 250, 64, PALETTE.tomatoRed, '800', 'center');
  text(ctx, 'SIZZLE KITCHEN', 640, 316, 44, PALETTE.ink, '800', 'center');
  text(ctx, 'A timed short-order kitchen — original recipes, no two days alike.', 640, 368, 18, PALETTE.softInk, '600', 'center');
  const lines = [
    '1 · Orders land on the board — each ticket shows its dish and its patience bar.',
    '2 · Click ingredients (or press 1–8) to build the dish on your plate.',
    '3 · When the plate matches a ticket, SERVE it before the bar runs out.',
    '4 · Fast serves earn a quick tip; serves in a row build your combo.',
    '5 · Three days, 120 seconds each. Day 3 adds the six-ingredient Full Solmara.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 414 + i * 30, 17, PALETTE.ink, '600', 'center'));
  ctx.fillStyle = PALETTE.serveGreen;
  rr(ctx, START_BUTTON.x, START_BUTTON.y, START_BUTTON.w, START_BUTTON.h, 14);
  ctx.fill();
  text(ctx, 'START COOKING  (Space)', START_BUTTON.x + START_BUTTON.w / 2, START_BUTTON.y + START_BUTTON.h / 2, 22, '#ffffff', '800', 'center');
  text(ctx, 'Keyboard + mouse · plays offline · sounds are synthesized, no files', 640, 656, 14, PALETTE.softInk, '600', 'center');
}

function drawDayEnd(ctx, state) {
  overlayCard(ctx);
  const summary = state.daySummary || { day: state.day, served: 0, coins: 0, missed: 0 };
  text(ctx, `DAY ${summary.day} COMPLETE!`, 640, 210, 44, PALETTE.serveGreenDark, '800', 'center');
  text(ctx, `You served ${summary.served} dishes and earned 🪙 ${summary.coins}.`, 640, 280, 22, PALETTE.ink, '700', 'center');
  text(ctx, `${summary.missed} customer${summary.missed === 1 ? '' : 's'} walked out. Total score: ${state.score}.`, 640, 320, 20, PALETTE.softInk, '600', 'center');
  text(ctx, `Day ${summary.day + 1} is busier: tickets run out faster and new dishes join the menu.`, 640, 360, 18, PALETTE.ink, '600', 'center');
  drawIngredient(ctx, 'cheese', 640, 440, 40);
  ctx.fillStyle = PALETTE.serveGreen;
  rr(ctx, NEXT_DAY_BUTTON.x, NEXT_DAY_BUTTON.y, NEXT_DAY_BUTTON.w, NEXT_DAY_BUTTON.h, 14);
  ctx.fill();
  text(ctx, `START DAY ${summary.day + 1}  (Space)`, NEXT_DAY_BUTTON.x + NEXT_DAY_BUTTON.w / 2, NEXT_DAY_BUTTON.y + NEXT_DAY_BUTTON.h / 2, 22, '#ffffff', '800', 'center');
}

function drawGameOver(ctx, state) {
  overlayCard(ctx);
  text(ctx, 'SERVICE OVER!', 640, 210, 48, PALETTE.tomatoRed, '800', 'center');
  text(ctx, `Final score: ${state.score}  ·  🪙 ${state.coins} earned`, 640, 290, 26, PALETTE.ink, '800', 'center');
  text(ctx, `${state.served} dishes served · ${state.missed} walked out · best combo x${state.bestCombo}`, 640, 340, 20, PALETTE.softInk, '600', 'center');
  const verdict = state.score >= 200
    ? 'Head Chef material — the Solmara regulars will be back tomorrow.'
    : state.score >= 100
      ? 'A solid service — the lunch rush nearly had you, but the plates went out.'
      : 'A rocky service — the tickets piled up, but every chef starts somewhere.';
  text(ctx, verdict, 640, 390, 18, PALETTE.ink, '600', 'center');
  drawIngredient(ctx, 'patty', 560, 460, 34);
  drawIngredient(ctx, 'lettuce', 640, 460, 34);
  drawIngredient(ctx, 'sauce', 720, 460, 34);
  ctx.fillStyle = PALETTE.serveGreen;
  rr(ctx, AGAIN_BUTTON.x, AGAIN_BUTTON.y, AGAIN_BUTTON.w, AGAIN_BUTTON.h, 14);
  ctx.fill();
  text(ctx, 'COOK AGAIN  (Space)', AGAIN_BUTTON.x + AGAIN_BUTTON.w / 2, AGAIN_BUTTON.y + AGAIN_BUTTON.h / 2, 22, '#ffffff', '800', 'center');
}

/** Paint one frame of the game. */
export function renderGame(ctx, state) {
  drawWallAndFloor(ctx);
  drawTopBar(ctx, state);
  drawOrderBoard(ctx, state);
  drawCounter(ctx, state);
  drawMenu(ctx);
  drawPlateStation(ctx, state);
  if (state.screen === SCREEN_TITLE) drawTitle(ctx, state);
  else if (state.screen === SCREEN_DAY_END) drawDayEnd(ctx, state);
  else if (state.screen === SCREEN_OVER) drawGameOver(ctx, state);
}
