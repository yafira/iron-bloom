// IRON BLOOM AUDIO

let _ctx = null;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

export function initAudio() {
  getCtx();
}
export function setAmbientEnergy(_e) {}

// CHIME FAMILIES
// Each object type gets its own tonal family.
// Within each family there's slight pitch/timing randomness so it never
// sounds identical twice.
//
// families:
//   "soft"    — bed, couch, oil, bedsideOil  (warm low tones, slow decay)
//   "bright"  — window, door, outside        (higher, open, quick)
//   "plant"   — plant tending                (earthy mid tones, longer)
//   "glass"   — mirror, sink, tub            (clear, bell-like)
//   "paper"   — journal, computer            (dry, subtle, short)
//   "metal"   — workbench, nightstand        (slightly harder, metallic partial)
//   "warm"    — tea, kitchen, fridge, snacks (round, homey)
//   "nav"     — doors, transitions           (neutral, short)

const FAMILIES = {
  soft: {
    notes: [
      [220, 330],
      [196, 294],
      [220, 262],
    ],
    filterHz: 700,
    gain: 0.13,
    decay: 1.2,
    type: "triangle",
  },
  bright: {
    notes: [
      [523, 659],
      [587, 740],
      [494, 622],
    ],
    filterHz: 2400,
    gain: 0.14,
    decay: 0.7,
    type: "sine",
  },
  plant: {
    notes: [
      [294, 392, 440],
      [262, 349, 440],
      [294, 370, 494],
    ],
    filterHz: 900,
    gain: 0.13,
    decay: 1.1,
    type: "triangle",
  },
  glass: {
    notes: [
      [523, 659],
      [494, 622],
      [554, 698],
    ],
    filterHz: 2000,
    gain: 0.12,
    decay: 1.3,
    type: "sine",
  },
  paper: {
    notes: [[440], [392], [415]],
    filterHz: 1200,
    gain: 0.1,
    decay: 0.6,
    type: "triangle",
  },
  metal: {
    notes: [
      [330, 440],
      [294, 392],
      [349, 466],
    ],
    filterHz: 1400,
    gain: 0.12,
    decay: 0.9,
    type: "sawtooth",
  },
  warm: {
    notes: [
      [349, 440],
      [330, 415],
      [370, 466],
    ],
    filterHz: 1000,
    gain: 0.12,
    decay: 1.0,
    type: "triangle",
  },
  nav: {
    notes: [[392], [349], [415]],
    filterHz: 1600,
    gain: 0.11,
    decay: 0.5,
    type: "sine",
  },
};

// tile → family mapping
const TILE_FAMILY = {
  2: "soft", // bed
  3: "plant", // plant
  4: "bright", // window
  5: "nav", // door
  7: "glass", // mirror
  9: "metal", // nightstand
  10: "paper", // computer/desk
  13: "paper",
  17: "metal",
  20: "soft", // couch
  21: "soft",
  22: "warm", // coffee table
  23: "nav", // bathroom door
  24: "glass", // tub
  25: "glass", // sink
  26: "metal", // cabinet
  27: "soft", // bedside oil
  28: "soft", // bathroom oil
  29: "warm", // stove/tea
  30: "warm", // counter/snacks
  31: "warm", // fridge
  32: "warm",
  33: "nav", // kitchen door
  34: "soft", // toilet
  35: "paper", // journal
  36: "metal", // workbench
  37: "metal",
  38: "warm", // fruit bowl
  39: "soft", // bench
};

function playFamily(family) {
  const ctx = getCtx();
  const f = FAMILIES[family] || FAMILIES.warm;

  // pick a random note sequence from this family
  const notes = f.notes[Math.floor(Math.random() * f.notes.length)];
  // slight random detune ±12 cents for variation within family
  const detune = (Math.random() - 0.5) * 24;

  const masterGain = ctx.createGain();
  masterGain.gain.value = f.gain;
  masterGain.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = f.filterHz;
  filter.Q.value = 1.8;
  filter.connect(masterGain);

  notes.forEach((freq, i) => {
    const delay = i * 0.11 + Math.random() * 0.02; // tiny timing variation
    const osc = ctx.createOscillator();
    osc.type = f.type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    // inharmonic shimmer partial — gives each note a little life
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq * (f.type === "sawtooth" ? 2.1 : 2.756);
    osc2.detune.value = detune * 0.5;

    const g = ctx.createGain();
    const g2 = ctx.createGain();
    const decay = f.decay + (Math.random() - 0.5) * 0.15;
    const now = ctx.currentTime + delay;

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.8, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(0.18, now + 0.012);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.4);

    osc.connect(g);
    g.connect(filter);
    osc2.connect(g2);
    g2.connect(masterGain); // shimmer bypasses filter for sparkle

    osc.start(now);
    osc.stop(now + decay + 0.05);
    osc2.start(now);
    osc2.stop(now + decay * 0.4 + 0.05);
  });
}

// tile is passed from interact() so each object gets its family
export function playChime(tile) {
  const family = TILE_FAMILY[tile] || "warm";
  playFamily(family);
}

// SLEEP TONE
const SLEEP_PHRASES = [
  [
    { freq: 349, t: 0 },
    { freq: 440, t: 0.5 },
    { freq: 523, t: 1.0 },
  ], // day 1 bright rise
  [
    { freq: 392, t: 0 },
    { freq: 349, t: 0.7 },
  ], // day 2 gentle dip
  [
    { freq: 220, t: 0 },
    { freq: 196, t: 1.0 },
  ], // day 3 heavy, low
  [
    { freq: 262, t: 0 },
    { freq: 294, t: 0.8 },
  ], // day 4 cautious lift
  [
    { freq: 330, t: 0 },
    { freq: 392, t: 0.6 },
    { freq: 440, t: 1.1 },
  ], // day 5 warmer rise
  [
    { freq: 349, t: 0 },
    { freq: 440, t: 0.5 },
    { freq: 523, t: 0.9 },
    { freq: 587, t: 1.3 },
  ], // day 6 full resolution
];
const SLEEP_FILTER = [1200, 900, 500, 700, 1000, 1800];
const SLEEP_GAIN = [0.13, 0.12, 0.11, 0.12, 0.13, 0.14];

export function playSleepTone(isLastDay = false, dayIndex = 0) {
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
    const attack = dayIndex === 2 ? 0.08 : 0.04;
    const decay = dayIndex === 2 ? 2.2 : 1.8;

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.8, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(now + decay + 0.1);

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
