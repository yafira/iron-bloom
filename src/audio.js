// ─── IRON BLOOM AUDIO ───────────────────────────────────────────────────────

let _ctx = null;
let _lastChimeIndex = -1;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

export function initAudio() {
  getCtx();
}

export function setAmbientEnergy(_energyLevel) {}

// ─── SLEEP TONES BY DAY ──────────────────────────────────────────────────────
// Each day gets its own emotional phrase played on sleep.
// Arc: bright → dulling → lowest → returning → warmer → resolved
//
// day 1 — hopeful, upward
// day 2 — still okay, small descent
// day 3 — lowest, heavy, slow
// day 4 — a little lighter, tentative
// day 5 — warmer, almost there
// day 6 — resolved, open

const SLEEP_PHRASES = [
  // day 1 — bright rising phrase
  [
    { freq: 349, t: 0 },
    { freq: 440, t: 0.5 },
    { freq: 523, t: 1.0 },
  ],
  // day 2 — gentle dip
  [
    { freq: 392, t: 0 },
    { freq: 349, t: 0.7 },
  ],
  // day 3 — heavy, slow, low
  [
    { freq: 220, t: 0 },
    { freq: 196, t: 1.0 },
  ],
  // day 4 — cautious lift
  [
    { freq: 262, t: 0 },
    { freq: 294, t: 0.8 },
  ],
  // day 5 — warmer two-note rise
  [
    { freq: 330, t: 0 },
    { freq: 392, t: 0.6 },
    { freq: 440, t: 1.1 },
  ],
  // day 6 — full resolution, open and clear
  [
    { freq: 349, t: 0 },
    { freq: 440, t: 0.5 },
    { freq: 523, t: 0.9 },
    { freq: 587, t: 1.3 },
  ],
];

// filter brightness by day — day 3 most muffled, day 6 most open
const SLEEP_FILTER = [1200, 900, 500, 700, 1000, 1800];
const SLEEP_GAIN = [0.13, 0.12, 0.11, 0.12, 0.13, 0.14];

function playSleepPhrase(dayIndex) {
  const ctx = getCtx();
  const phrase = SLEEP_PHRASES[dayIndex] ?? SLEEP_PHRASES[0];
  const filterHz = SLEEP_FILTER[dayIndex] ?? 1000;
  const gainVal = SLEEP_GAIN[dayIndex] ?? 0.13;

  phrase.forEach(({ freq, t }) => {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterHz;
    filter.Q.value = 2.0;

    const masterGain = ctx.createGain();
    masterGain.gain.value = gainVal;
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = -10;

    const g = ctx.createGain();
    const now = ctx.currentTime + t;
    // day 3 gets a slower attack for extra heaviness
    const attack = dayIndex === 2 ? 0.08 : 0.04;
    const decay = dayIndex === 2 ? 2.2 : 1.8;

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.8, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(now + decay + 0.1);

    // sub octave for weight
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = freq * 0.5;
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0, now);
    subG.gain.linearRampToValueAtTime(0.25, now + attack);
    subG.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.7);
    sub.connect(subG);
    subG.connect(masterGain);
    sub.start(now);
    sub.stop(now + decay + 0.1);
  });
}

// dayIndex is passed from main.js sleep() call
export function playSleepTone(isLastDay = false, dayIndex = 0) {
  playSleepPhrase(dayIndex);
}

// ─── CHIME POOL ──────────────────────────────────────────────────────────────

const CHIME_NOTES = [
  [294, 349],
  [392, 440],
  [262, 294, 349],
  [440, 392],
  [349, 294],
  [294, 440],
  [392],
  [440, 349, 294],
];

export function playChime() {
  const ctx = getCtx();

  let idx;
  do {
    idx = Math.floor(Math.random() * CHIME_NOTES.length);
  } while (idx === _lastChimeIndex && CHIME_NOTES.length > 1);
  _lastChimeIndex = idx;

  const notes = CHIME_NOTES[idx];

  notes.forEach((freq, i) => {
    const delay = i * 0.13;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 3.0;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.14;
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = -6;

    const g = ctx.createGain();
    const decay = 0.7 + Math.random() * 0.2;
    const now = ctx.currentTime + delay;

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.75, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(now + decay + 0.05);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = freq * 0.5;
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0, now);
    subG.gain.linearRampToValueAtTime(0.2, now + 0.015);
    subG.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.6);
    sub.connect(subG);
    subG.connect(masterGain);
    sub.start(now);
    sub.stop(now + decay + 0.05);
  });
}
