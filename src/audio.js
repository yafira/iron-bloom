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

// no background music — silence between interactions is intentional
export function setAmbientEnergy(_energyLevel) {}

// ─── CHIME POOL ──────────────────────────────────────────────────────────────
// Dark minor synth tones. Filtered sawtooth + sub sine.
// Rotates so you never hear the same one twice in a row.

const CHIME_NOTES = [
  [294, 349], // D4 → F4
  [392, 440], // G4 → A4
  [262, 294, 349], // C4 → D4 → F4
  [440, 392], // A4 → G4
  [349, 294], // F4 → D4
  [294, 440], // D4 → A4
  [392], // G4 alone
  [440, 349, 294], // A4 → F4 → D4
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

// ─── SLEEP TONE ──────────────────────────────────────────────────────────────
// Slow filtered synth phrase. Days 1–5 sink, day 6 rises.

export function playSleepTone(isLastDay = false) {
  const ctx = getCtx();

  const notes = isLastDay
    ? [
        { freq: 220, t: 0 },
        { freq: 294, t: 0.7 },
        { freq: 349, t: 1.3 },
      ]
    : [
        { freq: 294, t: 0 },
        { freq: 220, t: 0.8 },
      ];

  notes.forEach(({ freq, t }) => {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 2.0;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.13;
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = -10;

    const g = ctx.createGain();
    const now = ctx.currentTime + t;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.8, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(now + 2.0);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = freq * 0.5;
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0, now);
    subG.gain.linearRampToValueAtTime(0.25, now + 0.04);
    subG.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    sub.connect(subG);
    subG.connect(masterGain);
    sub.start(now);
    sub.stop(now + 1.6);
  });
}
