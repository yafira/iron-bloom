import "./style.css";
import {
  ROOM,
  OUTSIDE,
  TILE_SIZE,
  COLS,
  ROWS,
  START_POS,
  OUTSIDE_START,
  DAYS,
  PLANT_STAGES,
} from "./rooms.js";
import {
  initAudio,
  setAmbientEnergy,
  playChime,
  playSleepTone,
} from "./audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const textBox = document.getElementById("text-box");
const dayLabel = document.getElementById("day-label");

const LOGICAL_W = COLS * TILE_SIZE;
const LOGICAL_H = ROWS * TILE_SIZE;

function resize() {
  const scale = Math.min(
    window.innerWidth / LOGICAL_W,
    window.innerHeight / LOGICAL_H,
  );
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
  scene: "room",
  ended: false,
  started: false,
  transitioning: false,
};

function currentDay() {
  return DAYS[state.dayIndex];
}

function currentGrid() {
  return state.scene === "outside" ? OUTSIDE : ROOM;
}

function showLine(line, holdMs) {
  textBox.textContent = line;
  textBox.classList.remove("hidden");
  if (holdMs) {
    clearTimeout(textBox._t);
    textBox._t = setTimeout(() => textBox.classList.add("hidden"), holdMs);
  }
}

function updateDayLabel() {
  dayLabel.textContent = state.ended
    ? ""
    : `${currentDay().label} · ${state.dayIndex + 1}/5`;
}

function beginGame() {
  if (state.started) return;
  state.started = true;
  showLine(currentDay().intro, 3000);
  updateDayLabel();
}

function startAudioOnce() {
  initAudio();
  setAmbientEnergy(currentDay().energyLevel);
  window.removeEventListener("keydown", startAudioOnce);
  window.removeEventListener("pointerdown", startAudioOnce);
}
window.addEventListener("keydown", startAudioOnce, { once: true });
window.addEventListener("pointerdown", startAudioOnce, { once: true });
window.addEventListener("pointerdown", () => {
  if (!state.started) beginGame();
});

const keys = new Set();
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (
    [
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "w",
      "a",
      "s",
      "d",
      " ",
      "enter",
      "r",
    ].includes(k)
  ) {
    e.preventDefault();
  }
  if (!state.started) {
    beginGame();
    return;
  }
  if (state.transitioning) return;

  if (k === "r" && state.ended) {
    restart();
    return;
  }

  if (
    [
      "arrowup",
      "w",
      "arrowdown",
      "s",
      "arrowleft",
      "a",
      "arrowright",
      "d",
    ].includes(k)
  ) {
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
document
  .querySelectorAll(".touch-dpad .touch-btn, #touch-dpad .touch-btn")
  .forEach((btn) => {
    const key = btn.dataset.key;
    const press = (e) => {
      e.preventDefault();
      startAudioOnce();
      if (!state.started) {
        beginGame();
        return;
      }
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
  if (!state.started) {
    beginGame();
    return;
  }
  if (state.ended) {
    restart();
    return;
  }
  if (!state.transitioning) interact();
});
document.getElementById("t-interact")?.addEventListener("click", (e) => {
  if (!state.started) {
    beginGame();
    return;
  }
  if (state.ended) {
    restart();
    return;
  }
  if (!state.transitioning) interact();
});

function restart() {
  state.dayIndex = 0;
  state.plantStage = 0;
  state.tendIndex = 0;
  state.bedConfirm = false;
  state.scene = "room";
  state.ended = false;
  state.player.x = START_POS.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
  state.player.y = START_POS.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
  state.player.dir = "down";
  setAmbientEnergy(currentDay().energyLevel);
  showLine(currentDay().intro, 3000);
  updateDayLabel();
}

function tileAt(col, row) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 1;
  return currentGrid()[row][col];
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
  if (tile === 7) {
    showLine(day.mirror, 3000);
    playChime(700);
    return;
  }
  if (tile === 9) {
    showLine(day.nightstand, 3500);
    playChime(660);
    return;
  }
  if (tile === 5) {
    if (state.scene === "room" && day.isLast) {
      showLine(day.door, 2200);
      playChime(560);
      state.transitioning = true;
      setTimeout(() => {
        state.scene = "outside";
        state.player.x =
          OUTSIDE_START.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
        state.player.y =
          OUTSIDE_START.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
        state.player.dir = "down";
        state.transitioning = false;
        showLine(day.outsideLine, 4000);
      }, 1200);
      return;
    }
    if (state.scene === "outside") {
      playChime(560);
      state.scene = "room";
      state.player.x =
        START_POS.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y =
        START_POS.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "down";
      showLine(day.intro, 2500);
      return;
    }
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
        state.plantStage = Math.min(
          state.plantStage + 1,
          PLANT_STAGES.length - 1,
        );
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
      state.player.x =
        START_POS.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y =
        START_POS.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "down";
      state.transitioning = false;
      setAmbientEnergy(currentDay().energyLevel);
      showLine(currentDay().intro, 3000);
      updateDayLabel();
    }
  }, 1600);
}

function showEnding() {
  textBox.classList.add("hidden");
  updateDayLabel();
  setTimeout(() => {
    showLine(
      "the bloom is still here. so are you.  (press R to play again)",
      null,
    );
  }, 200);
}

function update() {
  if (state.transitioning || state.ended) return;

  const energy = currentDay().energyLevel;
  const speed = 0.8 + energy * 1.6;

  let dx = 0,
    dy = 0;
  if (keys.has("arrowup") || keys.has("w")) {
    dy -= 1;
    state.player.dir = "up";
  }
  if (keys.has("arrowdown") || keys.has("s")) {
    dy += 1;
    state.player.dir = "down";
  }
  if (keys.has("arrowleft") || keys.has("a")) {
    dx -= 1;
    state.player.dir = "left";
  }
  if (keys.has("arrowright") || keys.has("d")) {
    dx += 1;
    state.player.dir = "right";
  }

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
  7: "#c9b6d4", // mirror — drawn over wall color
  9: "#f3e6f0", // nightstand — drawn over floor color
};

const OUTSIDE_COLORS = {
  0: "#dcebe1", // grass — pale mint
  1: "#b9d4c4", // hedge — soft sage
  5: "#f3e6f0", // door path — pale lilac-pink
  8: "#cfe6d6", // tree base — drawn over
};

function drawRoom() {
  const grid = currentGrid();
  const palette = state.scene === "outside" ? OUTSIDE_COLORS : TILE_COLORS;
  const fallback =
    state.scene === "outside" ? OUTSIDE_COLORS[0] : TILE_COLORS[0];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = grid[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile === 3) {
        ctx.fillStyle = TILE_COLORS[0];
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        drawPlant(x, y);
        continue;
      }
      if (tile === 8) {
        ctx.fillStyle = OUTSIDE_COLORS[0];
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        drawTree(x, y);
        continue;
      }

      ctx.fillStyle = palette[tile] ?? fallback;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      if (tile === 2) {
        ctx.fillStyle = "#fde8f1";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 6);
      }
      if (tile === 4) {
        ctx.fillStyle = "#fffaf0";
        ctx.fillRect(x + 2, y + TILE_SIZE - 6, TILE_SIZE - 4, 4);
      }
      if (tile === 7) {
        ctx.fillStyle = "#f3eef7";
        ctx.fillRect(x + 4, y + 3, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.35;
        ctx.fillRect(x + 5, y + 4, 4, TILE_SIZE - 10);
        ctx.globalAlpha = 1;
      }
      if (tile === 9) {
        ctx.fillStyle = "#cdb6c4";
        ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, TILE_SIZE - 10);
        ctx.fillStyle = "#f3e6f0";
        ctx.fillRect(x + 6, y + 8, 4, 6);
        ctx.fillStyle = "#7fc0a6";
        ctx.fillRect(x + 6, y + 8, 4, 2);
      }
    }
  }
}

function drawTree(x, y) {
  const cx = x + TILE_SIZE / 2;
  const baseY = y + TILE_SIZE - 3;

  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(cx - 2, baseY - 8, 4, 8);

  ctx.fillStyle = "#a9d4be";
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 11, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#bce0cd";
  ctx.beginPath();
  ctx.ellipse(cx - 4, baseY - 13, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 4, baseY - 13, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlant(x, y) {
  const stage = PLANT_STAGES[state.plantStage];
  const cx = x + TILE_SIZE / 2;
  const baseY = y + TILE_SIZE - 4;

  // soft shadow
  ctx.fillStyle = "#e6d6e2";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 1, 7, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // pot
  ctx.fillStyle = stage.potColor;
  ctx.fillRect(cx - 6, baseY - 6, 12, 6);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(cx - 6, baseY - 6, 12, 2);

  // stem
  ctx.strokeStyle = stage.leafColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 6);
  ctx.lineTo(cx, baseY - 6 - 8 * stage.size);
  ctx.stroke();

  // leaves — fan out based on stage.leaves
  const r = 8 * stage.size;
  const top = baseY - 6 - r * 0.6;
  const positions = [
    [0, -r * 0.2, r, r * 0.7],
    [-r * 0.55, r * 0.25, r * 0.5, r * 0.35],
    [r * 0.55, r * 0.25, r * 0.5, r * 0.35],
    [-r * 0.85, -r * 0.1, r * 0.4, r * 0.28],
    [r * 0.85, -r * 0.1, r * 0.4, r * 0.28],
  ];
  ctx.fillStyle = stage.leafColor;
  for (let i = 0; i < stage.leaves; i++) {
    const [dx, dy, rx, ry] = positions[i];
    ctx.beginPath();
    ctx.ellipse(cx + dx, top + dy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (stage.bloom) {
    ctx.fillStyle = "#f3a6c1";
    ctx.beginPath();
    ctx.arc(cx, top - r * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fbd4e3";
    ctx.beginPath();
    ctx.arc(cx - 5, top - r * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  const { x, y, dir } = state.player;
  const energy = currentDay().energyLevel;
  const moving =
    keys.has("arrowup") ||
    keys.has("w") ||
    keys.has("arrowdown") ||
    keys.has("s") ||
    keys.has("arrowleft") ||
    keys.has("a") ||
    keys.has("arrowright") ||
    keys.has("d");

  // walk bob: faster/bouncier on high energy, slower/heavier on low energy
  const bobSpeed = 6 + energy * 10;
  const bobAmount = 1 + energy * 1.5;
  const bob = moving
    ? Math.sin(performance.now() / (200 / bobSpeed)) * bobAmount
    : 0;

  // low energy = slight squish (slumped posture)
  const squish = 1 - (1 - energy) * 0.15;
  const h = PLAYER_SIZE * squish;
  const yOffset = PLAYER_SIZE - h + bob;

  ctx.fillStyle = "#4a3b5c";
  ctx.fillRect(x, y + yOffset, PLAYER_SIZE, h);

  ctx.fillStyle = "#e8d6ec";
  const n = 4;
  if (dir === "up")
    ctx.fillRect(x + PLAYER_SIZE / 2 - n / 2, y + yOffset, n, n);
  if (dir === "down")
    ctx.fillRect(x + PLAYER_SIZE / 2 - n / 2, y + yOffset + h - n, n, n);
  if (dir === "left") ctx.fillRect(x, y + yOffset + h / 2 - n / 2, n, n);
  if (dir === "right")
    ctx.fillRect(x + PLAYER_SIZE - n, y + yOffset + h / 2 - n / 2, n, n);

  // eyes
  ctx.fillStyle = "#e8d6ec";
  if (dir === "down" || dir === "left" || dir === "right") {
    const eyeY = y + yOffset + h * 0.35;
    if (dir !== "left") ctx.fillRect(x + PLAYER_SIZE * 0.6, eyeY, 2, 2);
    if (dir !== "right") ctx.fillRect(x + PLAYER_SIZE * 0.25, eyeY, 2, 2);
  }
}

function drawTint() {
  const day = currentDay();
  const tint =
    state.scene === "outside" && day.outsideTint ? day.outsideTint : day.tint;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
}

function drawFade() {
  if (!state.transitioning && !state.ended) return;
  ctx.fillStyle = "rgba(45, 36, 64, 1)";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
}

function drawTitleScreen() {
  ctx.fillStyle = "#2d2440";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  // soft floating petal/leaf shapes for atmosphere
  const t = performance.now() / 1000;
  const petals = [
    [40, 30],
    [270, 50],
    [60, 130],
    [250, 150],
    [150, 40],
    [200, 110],
  ];
  ctx.fillStyle = "#7fc0a6";
  for (let i = 0; i < petals.length; i++) {
    const [px, py] = petals[i];
    const drift = Math.sin(t * 0.6 + i) * 3;
    ctx.beginPath();
    ctx.ellipse(px, py + drift, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f6ecf5";
  ctx.font = "16px monospace";
  ctx.fillText("iron bloom", LOGICAL_W / 2, LOGICAL_H / 2 - 12);

  ctx.font = "8px monospace";
  ctx.fillStyle = "#cbb8d8";
  ctx.fillText("five days, one small plant", LOGICAL_W / 2, LOGICAL_H / 2 + 6);

  ctx.fillStyle = "#9c8aac";
  const blink = Math.sin(t * 2) > 0;
  if (blink) {
    ctx.fillText(
      "press any key or tap to begin",
      LOGICAL_W / 2,
      LOGICAL_H - 16,
    );
  }
  ctx.textAlign = "left";
}

function render() {
  ctx.save();
  const scale = canvas.width / LOGICAL_W;
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

  if (!state.started) {
    drawTitleScreen();
    ctx.restore();
    return;
  }

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
