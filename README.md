[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/jarcokpahang5-ai/solmara-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/jarcokpahang5-ai/solmara-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Solmara Sizzle Kitchen

An original timed short-order cooking game for make.fun's **"Make the best cooking game"** bounty ($250 in USDC, shared by the top 10).

You run the Solmara kitchen for three days, 120 seconds each. Orders land on the order board — each ticket shows its dish, its ingredients and a patience bar that drains while you work. Pick ingredients off the counter (click, or press `1–8`) to build the dish on your plate, then hit **SERVE** (or `Enter`) when the plate matches a ticket exactly. Serve fast for a quick tip, serve in a row to build your combo, and watch out: a ticket whose bar runs out walks out the door, and a wrong plate breaks your combo. Day 2 adds the six-ingredient Full Solmara and faster tickets; day 3 rushes harder still. Six original recipes — Sunny Burger, Cheese Stack, Garden Skillet, Golden Omelette, Tomato Melt and the Full Solmara — all drawn from coloured shapes, with synthesized WebAudio sizzles and chimes and no files at all.

## Run it

No build step, no network. Serve `game/` with any static server and open it in desktop Chrome:

```sh
node serve.ts
# open http://localhost:8080
```

Play with mouse or keyboard: click an ingredient (or press `1–8`) to add it, click the plate to lift the top item off, `Enter` serves, `C` clears the plate, `P` pauses, `M` mutes, `Space` starts or continues.

## Layout

- `game/index.html` — the page; `game/src/` holds the game, one file per job: `config.js` (tuning, ingredients, recipes, palette), `random.js` (seeded random), `kitchen.js` (orders, plate, clock, scoring), `audio.js` (synthesized sounds), `layout.js` (geometry), `render.js` (canvas drawing), `input.js` (keyboard and pointer), `shots.js` (screenshot scenes), `main.js` (boot and loop).
- `screenshots/` — real renders of the game running in Chrome: title, mid-play, a dish mid-assembly, a plate ready to serve. Staged deterministically with `?shot=title|play|assemble|serve&seed=7` (see `shots.json`).
- `main.ts` — the entry program: validates the entry, copies `game/` and `screenshots/` to the output directory and writes `dossier.json`.
