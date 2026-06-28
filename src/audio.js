// ─── IRON BLOOM AUDIO ───────────────────────────────────────────────────────
// All sound built with Web Audio API — no files needed.
// Drop this block into main.js in place of the four stub functions.

let _ctx = null;
let _ambientNodes = null; // { drone, filter, gainNode }

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

// ─── AMBIENT DRONE ───────────────────────────────────────────────────────────
// Each day gets a different base frequency and filter brightness.
// Low energy days = darker, more muffled, slightly detuned.
// High energy days = cleaner, more open, fuller harmonic.

const DAY_DRONE = [
  // day 1 — okay, warm
  { freq: 110, detune: 0, filterHz: 900, gain: 0.1 },
  // day 2 — slower, achier
  { freq: 98, detune: -8, filterHz: 520, gain: 0.09 },
  // day 3 — lowest, most muffled
  { freq: 82, detune: -18, filterHz: 300, gain: 0.08 },
  // day 4 — returning, slightly
  { freq: 92, detune: -10, filterHz: 440, gain: 0.09 },
  // day 5 — warmer, more presence
  { freq: 104, detune: -4, filterHz: 700, gain: 0.1 },
  // day 6 — open, clear
  { freq: 110, detune: 0, filterHz: 1100, gain: 0.11 },
];

function stopAmbient() {
  if (!_ambientNodes) return;
  try {
    const { drone1, drone2, drone3, filter, gainNode } = _ambientNodes;
    const t = _ctx.currentTime + 1.2;
    gainNode.gain.linearRampToValueAtTime(0, t);
    setTimeout(() => {
      try {
        drone1.stop();
      } catch {}
      try {
        drone2.stop();
      } catch {}
      try {
        drone3.stop();
      } catch {}
    }, 1400);
  } catch {}
  _ambientNodes = null;
}

export function initAudio() {
  getCtx();
}

export function setAmbientEnergy(energyLevel) {
  const ctx = getCtx();
  stopAmbient();

  // Map energyLevel (0–1) to day index (0–5) using the DAY_DRONE table.
  // We pick the closest match so callers don't need to pass a day index.
  const dayIndex = Math.round((1 - energyLevel) * 5);
  const d = DAY_DRONE[Math.min(dayIndex, DAY_DRONE.length - 1)];

  // Three oscillators: fundamental + soft 5th + very quiet octave
  // They all go through a shared lowpass filter and gain node.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = d.filterHz;
  filter.Q.value = 0.8;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(d.gain, ctx.currentTime + 2.5);

  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  function makeOsc(freq, detune, gainVal) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = detune;
    g.gain.value = gainVal;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    return osc;
  }

  const drone1 = makeOsc(d.freq, d.detune, 1.0); // fundamental
  const drone2 = makeOsc(d.freq * 1.5, d.detune * 0.6, 0.35); // 5th
  const drone3 = makeOsc(d.freq * 2, d.detune * 0.3, 0.12); // octave (quiet)

  // Very slow amplitude tremolo — more pronounced on low-energy days
  const tremoloDepth = 0.018 + (1 - energyLevel) * 0.028;
  const tremoloRate = 0.18 + energyLevel * 0.22;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = tremoloRate;
  lfoGain.gain.value = tremoloDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  lfo.start();

  _ambientNodes = { drone1, drone2, drone3, filter, gainNode, lfo };
}

// ─── CHIME ───────────────────────────────────────────────────────────────────
// Short, soft bell-like tone. freq is passed by the interact() call sites.
// On low-energy days the tone decays faster and sits lower in the mix.

export function playChime(freq = 660) {
  const ctx = getCtx();
  const energyLevel = _ambientNodes
    ? (DAY_DRONE.find(
        (d) =>
          Math.abs(d.freq - (_ambientNodes.drone1?.frequency?.value ?? 110)) <
          20,
      )?.gain ?? 0.1)
    : 0.1;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  // Second partial for a bell-ier sound
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2.756; // inharmonic partial — bell quality
  gain2.gain.setValueAtTime(0.18, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start();
  osc2.stop(ctx.currentTime + 0.6);

  gain.gain.setValueAtTime(0.22, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}

// ─── SLEEP TONE ──────────────────────────────────────────────────────────────
// Plays when the player goes to sleep. Descends slowly, then fades.
// On the last day (day 6) it resolves upward instead — a quiet lift.

export function playSleepTone(isLastDay = false) {
  const ctx = getCtx();

  // Fade out the ambient drone first
  if (_ambientNodes) {
    const { gainNode } = _ambientNodes;
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";

  if (isLastDay) {
    // Day 6: gentle rise — resolution
    osc.frequency.setValueAtTime(196, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(262, ctx.currentTime + 1.4);
  } else {
    // Days 1–5: soft descent — rest
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 1.6);
  }

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2.0);
}
