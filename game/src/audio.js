// Solmara Sizzle Kitchen — every sound is synthesized with WebAudio, no
// audio files: short oscillator blips and a burst of filtered noise for the
// sizzle. The context is created on the first user gesture, as browsers ask.

let audioContext = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

function ensureContext() {
  if (audioContext) {
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioContext = new Ctor();
  } catch {
    audioContext = null;
  }
  return audioContext;
}

function tone(freq, seconds, type, volume, when = 0) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = ctx.currentTime + when;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  } catch {
    // Sound is garnish: a failed blip never stops the game.
  }
}

function sizzleNoise(seconds) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4200;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // See tone(): sound never blocks play.
  }
}

export function playClick() {
  tone(660, 0.07, 'triangle', 0.12);
}

export function playAdd() {
  sizzleNoise(0.18);
  tone(520, 0.09, 'sine', 0.1);
}

export function playServe() {
  tone(523, 0.12, 'triangle', 0.16);
  tone(659, 0.12, 'triangle', 0.16, 0.09);
  tone(784, 0.2, 'triangle', 0.18, 0.18);
}

export function playWrong() {
  tone(220, 0.18, 'sawtooth', 0.08);
  tone(174, 0.25, 'sawtooth', 0.08, 0.1);
}

export function playWalkout() {
  tone(392, 0.15, 'sine', 0.1);
  tone(311, 0.25, 'sine', 0.1, 0.12);
}

export function playDayEnd() {
  tone(523, 0.15, 'triangle', 0.15);
  tone(659, 0.15, 'triangle', 0.15, 0.12);
  tone(784, 0.15, 'triangle', 0.15, 0.24);
  tone(1047, 0.3, 'triangle', 0.16, 0.36);
}
