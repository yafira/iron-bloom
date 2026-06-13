import "./style.css";
import { ROOM, TILE_SIZE, COLS, ROWS, START_POS, DAYS, PLANT_STAGES } from "./rooms.js";
import { initAudio, setAmbientEnergy, playChime, playSleepTone } from "./audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const textBox = document.getElementById("text-box");

const LOGICAL_W = COLS * TILE_SIZE;
const LOGICAL_H = ROWS * TILE_SIZE;

function resize() {
  const scale = Math.min(window.innerWidth / LOGICAL_W, window.innerHeight / LOGICAL_H);
  canvas.width = Math.floor(LOGICAL_W * scale);
  canvas.height = Math.floor(LOGICAL_H * scale);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener("resize", resize);
resize();

const PLAYER_SIZE = 14;
const state = {
  dayIndex: 0,
  plantStage: 0,
  player: {
    x: START_POS.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
    y: START_POS.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
    dir: "down",
  },
  tendIndex: 0,
  bedConfirm: false,
  ended: false,
  transitioning: false,
};

function currentDay() {
  return DAYS[state.dayIndex];
}

function showLine(line, holdMs) {
  textBox.textContent = line;
  textBox.classList.remove("hidden");
  if (holdMs) {
    clearTimeout(textBox._t);
    textBox._t = setTimeout(() => textBox.classList.add("hidden"), holdMs);
  }
}

showLine(currentDay().intro, 3000);

function startAudioOnce() {
  initAudio();
  setAmbientEnergy(currentDay().energyLevel);
  window.removeEventListener("keydown", startAudioOnce);
  window.removeEventListener("pointerdown", startAudioOnce);
}
window.addEventListener("keydown", startAudioOnce, { once: true });
window.addEventListener("pointerdown", startAudioOnce, { once: true });

const keys = new Set();
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," ","enter","r"].includes(k)) {
    e.preventDefault();
  }
  if (state.transitioning) return;

  if (k === "r" && state.ended) {
    restart();
    return;
  }

  if (["arrowup","w","arrowdown","s","arrowleft","a","arrowright","d"].includes(k)) {
    keys.add(k);
  }

  if (k === " " || k === "enter") {
    interact();
  }
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

// touch controls — map to the same key set / interact function
document.querySelectorAll(".touch-dpad .touch-btn, #touch-dpad .touch-btn").forEach((btn) => {
  const key = btn.dataset.key;
  const press = (e) => {
    e.preventDefault();
    startAudioOnce();
    if (state.transitioning) return;
    keys.add(key);
  };
  const release = (e) => {
    e.preventDefault();
    keys.delete(key);
  };
  btn.addEventListener("touchstart", press);
  btn.addEventListener("touchend", release);
  btn.addEventListener("touchcancel", release);
  btn.addEventListener("mousedown", press);
  btn.addEventListener("mouseup", release);
});

document.getElementById("t-interact")?.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startAudioOnce();
  if (state.ended) { restart(); return; }
  if (!state.transitioning) interact();
});
document.getElementById("t-interact")?.addEventListener("click", (e) => {
  if (state.ended) { restart(); return; }
  if (!state.transitioning) interact();
});

function restart() {
  state.dayIndex = 0;
  state.plantStage = 0;
  state.tendIndex = 0;
  state.bedConfirm = false;
  state.ended = false;
  state.player.x = START_POS.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
  state.player.y = START_POS.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
  state.player.dir = "down";
  setAmbientEnergy(currentDay().energyLevel);
  showLine(currentDay().intro, 3000);
}

function tileAt(col, row) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 1;
  return ROOM[row][col];
}
function isBlocking(code) {
  return code !== 0 && code !== 6;
}
function canStandAt(x, y) {
  const corners = [
    [x, y],
    [x + PLAYER_SIZE - 1, y],
    [x, y + PLAYER_SIZE - 1],
    [x + PLAYER_SIZE - 1, y + PLAYER_SIZE - 1],
  ];
  for (const [cx, cy] of corners) {
    const col = Math.floor(cx / TILE_SIZE);
    const row = Math.floor(cy / TILE_SIZE);
    if (isBlocking(tileAt(col, row))) return false;
  }
  return true;
}

function facingTile() {
  const cx = state.player.x + PLAYER_SIZE / 2;
  const cy = state.player.y + PLAYER_SIZE / 2;
  let col = Math.floor(cx / TILE_SIZE);
  let row = Math.floor(cy / TILE_SIZE);
  if (state.player.dir === "up") row -= 1;
  if (state.player.dir === "down") row += 1;
  if (state.player.dir === "left") col -= 1;
  if (state.player.dir === "right") col += 1;
  return tileAt(col, row);
}

function interact() {
  const day = currentDay();
  const tile = facingTile();

  if (tile === 4) {
    showLine(day.window, 3500);
    playChime(740);
    return;
  }
  if (tile === 5) {
    showLine(day.door, 3000);
    playChime(520);
    return;
  }
  if (tile === 3) {
    const lines = day.tendLines;
    if (state.tendIndex < lines.length) {
      showLine(lines[state.tendIndex], 2500);
      playChime(620 + state.tendIndex * 30);
      state.tendIndex++;
      if (state.tendIndex === lines.length) {
        state.plantStage = Math.min(state.plantStage + 1, PLANT_STAGES.length - 1);
        playChime(880);
      }
    } else {
      showLine(lines[lines.length - 1], 2200);
    }
    return;
  }
  if (tile === 2) {
    if (!state.bedConfirm) {
      showLine(day.bedPrompt, 3000);
      state.bedConfirm = true;
      playChime(440);
    } else {
      sleep();
    }
    return;
  }
}

function sleep() {
  const day = currentDay();
  showLine(day.sleepLine, null);
  playSleepTone();
  state.transitioning = true;
  setTimeout(() => {
    if (day.isLast) {
      state.ended = true;
      state.transitioning = false;
      showEnding();
    } else {
      state.dayIndex++;
      state.tendIndex = 0;
      state.bedConfirm = false;
      state.player.x = START_POS.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y = START_POS.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "down";
      state.transitioning = false;
      setAmbientEnergy(currentDay().energyLevel);
      showLine(currentDay().intro, 3000);
    }
  }, 1600);
}

function showEnding() {
  textBox.classList.add("hidden");
  setTimeout(() => {
    showLine("the bloom is still here. so are you.  (press R to play again)", null);
  }, 200);
}

function update() {
  if (state.transitioning || state.ended) return;

  const energy = currentDay().energyLevel;
  const speed = 0.8 + energy * 1.6;

  let dx = 0, dy = 0;
  if (keys.has("arrowup") || keys.has("w")) { dy -= 1; state.player.dir = "up"; }
  if (keys.has("arrowdown") || keys.has("s")) { dy += 1; state.player.dir = "down"; }
  if (keys.has("arrowleft") || keys.has("a")) { dx -= 1; state.player.dir = "left"; }
  if (keys.has("arrowright") || keys.has("d")) { dx += 1; state.player.dir = "right"; }

  if (dx !== 0 || dy !== 0) {
    if (state.bedConfirm) state.bedConfirm = false;
    const nx = state.player.x + dx * speed;
    if (canStandAt(nx, state.player.y)) state.player.x = nx;
    const ny = state.player.y + dy * speed;
    if (canStandAt(state.player.x, ny)) state.player.y = ny;
  }
}

const TILE_COLORS = {
  0: "#f3e6f0", // floor — pale lilac-pink
  1: "#c9b6d4", // wall — dusty lavender
  2: "#f6cfe0", // bed — soft pink
  4: "#fdf3d3", // window — warm cream
  5: "#b9a8c9", // door — muted plum-lavender
  6: "#e8d6ec", // rug — pale violet
};

function drawRoom() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = ROOM[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      if (tile === 3) {
        ctx.fillStyle = TILE_COLORS[0];
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        drawPlant(x, y);
        continue;
      }
      ctx.fillStyle = TILE_COLORS[tile] ?? TILE_COLORS[0];
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      if (tile === 2) {
        ctx.fillStyle = "#fde8f1";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 6);
      }
      if (tile === 4) {
        ctx.fillStyle = "#fffaf0";
        ctx.fillRect(x + 2, y + TILE_SIZE - 6, TILE_SIZE - 4, 4);
      }
    }
  }
}

function drawPlant(x, y) {
  const stage = PLANT_STAGES[state.plantStage];
  const cx = x + TILE_SIZE / 2;
  const baseY = y + TILE_SIZE - 4;

  ctx.fillStyle = stage.potColor;
  ctx.fillRect(cx - 6, baseY - 6, 12, 6);

  const r = 8 * stage.size;
  ctx.fillStyle = stage.leafColor;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 6 - r * 0.6, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.5, baseY - 6 - r * 0.3, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.5, baseY - 6 - r * 0.3, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  if (stage.bloom) {
    ctx.fillStyle = "#f3a6c1";
    ctx.beginPath();
    ctx.arc(cx, baseY - 6 - r * 0.9, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  const { x, y, dir } = state.player;
  const energy = currentDay().energyLevel;
  const moving = keys.has("arrowup") || keys.has("w") || keys.has("arrowdown") || keys.has("s") ||
                 keys.has("arrowleft") || keys.has("a") || keys.has("arrowright") || keys.has("d");

  // walk bob: faster/bouncier on high energy, slower/heavier on low energy
  const bobSpeed = 6 + energy * 10;
  const bobAmount = 1 + energy * 1.5;
  const bob = moving ? Math.sin(performance.now() / (200 / bobSpeed)) * bobAmount : 0;

  // low energy = slight squish (slumped posture)
  const squish = 1 - (1 - energy) * 0.15;
  const h = PLAYER_SIZE * squish;
  const yOffset = (PLAYER_SIZE - h) + bob;

  ctx.fillStyle = "#4a3b5c";
  ctx.fillRect(x, y + yOffset, PLAYER_SIZE, h);

  ctx.fillStyle = "#e8d6ec";
  const n = 4;
  if (dir === "up") ctx.fillRect(x + PLAYER_SIZE / 2 - n / 2, y + yOffset, n, n);
  if (dir === "down") ctx.fillRect(x + PLAYER_SIZE / 2 - n / 2, y + yOffset + h - n, n, n);
  if (dir === "left") ctx.fillRect(x, y + yOffset + h / 2 - n / 2, n, n);
  if (dir === "right") ctx.fillRect(x + PLAYER_SIZE - n, y + yOffset + h / 2 - n / 2, n, n);
}

function drawTint() {
  ctx.fillStyle = currentDay().tint;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
}

function drawFade() {
  if (!state.transitioning && !state.ended) return;
  ctx.fillStyle = "rgba(45, 36, 64, 1)";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
}

function render() {
  ctx.save();
  const scale = canvas.width / LOGICAL_W;
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

  drawRoom();
  drawPlayer();
  drawTint();
  drawFade();

  ctx.restore();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
