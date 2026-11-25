// Solmara Sizzle Kitchen, a best-cooking-game entry (Node 22, standard
// library only). The game itself is this directory's game/ folder: plain
// static files a desktop browser loads offline, no library and no network
// request. This program is the hand-in: it checks the entry is complete,
// copies game/ and screenshots/ beside this file into the output directory,
// and writes /output/dossier.json with the vendored make.fun library — the
// summary the judge reads.
//
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const destDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  throw new Error(`solmara-cooking-game main.ts: ${message}`);
}

function checkEntryComplete() {
  const page = join(repoRoot, 'game', 'index.html');
  if (!existsSync(page) || !statSync(page).isFile()) {
    fail('game/index.html is missing — the game was not built');
  }
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(shotsDir) || !statSync(shotsDir).isDirectory()) {
    fail('screenshots/ is missing — take 3 or 4 screenshots of the game first');
  }
  const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    fail(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  }
  for (const name of shots) {
    const shot = join(shotsDir, name);
    if (!statSync(shot).isFile()) fail(`screenshots/${name} is not a regular file`);
    if (statSync(shot).size > 262144) fail(`screenshots/${name} is over the 256 KiB cap`);
    if (!/\.(png|jpe?g)$/i.test(name)) fail(`screenshots/${name} is not a PNG or JPEG`);
  }
  return shots;
}

const shots = checkEntryComplete();

mkdirSync(destDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(destDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(destDir, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes; the
// other caps make this program refuse exactly what the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; game/ over 993 files or
// 48 MiB in all, or a path under game/ over 1000 bytes — game/ shares the
// grader's 1000-entry /output cap with screenshots/ and dossier.json).
writeFileSync(
  join(destDir, 'dossier.json'),
  buildDossier(destDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Solmara Sizzle Kitchen handed in: ${shots.length} screenshots, dossier written to ${destDir}`);
