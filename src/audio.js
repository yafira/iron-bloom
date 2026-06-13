let ctx = null;
let droneGain = null;
let droneOsc1 = null;
let droneOsc2 = null;
let filter = null;
let started = false;

export function initAudio() {
  if (started) return;
  started = true;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  droneGain = ctx.createGain();
  droneGain.gain.value = 0.0;
  filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1200;

  droneOsc1 = ctx.createOscillator();
  droneOsc1.type = "sine";
  droneOsc1.frequency.value = 110;

  droneOsc2 = ctx.createOscillator();
  droneOsc2.type = "sine";
  droneOsc2.frequency.value = 110 * 1.5; // soft fifth

  droneOsc1.connect(filter);
  droneOsc2.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(ctx.destination);

  droneOsc1.start();
  droneOsc2.start();

  // fade in gently
  const now = ctx.currentTime;
  droneGain.gain.setValueAtTime(0, now);
  droneGain.gain.linearRampToValueAtTime(0.05, now + 2.5);
}

// energy 0..1 — low energy = darker filter, slightly lower pitch, quieter
export function setAmbientEnergy(energy) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const targetFreq = 900 + energy * 900; // 900-1800 Hz cutoff
  const targetPitch = 100 + energy * 16; // 100-116 Hz base
  const targetGain = 0.03 + energy * 0.035;

  filter.frequency.cancelScheduledValues(now);
  filter.frequency.setTargetAtTime(targetFreq, now, 1.2);

  droneOsc1.frequency.cancelScheduledValues(now);
  droneOsc1.frequency.setTargetAtTime(targetPitch, now, 1.2);
  droneOsc2.frequency.setTargetAtTime(targetPitch * 1.5, now, 1.2);

  droneGain.gain.cancelScheduledValues(now);
  droneGain.gain.setTargetAtTime(targetGain, now, 1.2);
}

// short soft chime for interactions
export function playChime(pitch = 660) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = pitch;
  gain.gain.value = 0;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  osc.start(now);
  osc.stop(now + 0.65);
}

// low soft tone for sleep/transition
export function playSleepTone() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 220;
  gain.gain.value = 0;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.05, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 1.6);

  osc.start(now);
  osc.stop(now + 1.7);
}
