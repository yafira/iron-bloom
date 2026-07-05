import "./style.css";
import {
  initAudio,
  setAmbientEnergy,
  playChime,
  playSleepTone,
} from "./audio.js";
import {
  ROOM,
  OUTSIDE,
  BATHROOM,
  KITCHEN,
  TILE_SIZE,
  COLS,
  ROWS,
  START_POS,
  OUTSIDE_START,
  BATHROOM_START,
  KITCHEN_START,
  DAYS,
  PLANT_STAGES,
  JOURNAL_ENTRIES,
} from "./rooms.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const textBox = document.getElementById("text-box");
const dayLabel = document.getElementById("day-label");

// JOURNAL OVERLAY
const journalOverlay = document.createElement("div");
journalOverlay.id = "journal-overlay";
journalOverlay.innerHTML = `
  <div id="journal-inner">
    <div id="journal-header">
      <span id="journal-date"></span>
      <button id="journal-close">✕</button>
    </div>
    <div id="journal-body"></div>
    <div id="journal-nav">
      <button id="journal-prev">← prev</button>
      <span id="journal-page"></span>
      <button id="journal-next">next →</button>
    </div>
  </div>
`;
document.body.appendChild(journalOverlay);

const style = document.createElement("style");
style.textContent = `
  #journal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 8, 0.88);
    z-index: 100;
    justify-content: center;
    align-items: center;
  }
  #journal-overlay.open { display: flex; }
  #journal-inner {
    background: #1a1a14;
    border: 1.5px solid #4a5a38;
    border-radius: 4px;
    padding: 28px 32px 20px;
    max-width: 480px;
    width: 90%;
    font-family: monospace;
    color: #c8d4a8;
    position: relative;
  }
  #journal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #4a5a38;
    padding-bottom: 10px;
  }
  #journal-date {
    font-size: 11px;
    letter-spacing: 2px;
    color: #7d8a5e;
    text-transform: lowercase;
  }
  #journal-close {
    background: none;
    border: none;
    color: #7d8a5e;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
  }
  #journal-close:hover { color: #c8d4a8; }
  #journal-body {
    font-size: 12px;
    line-height: 1.9;
    letter-spacing: 0.5px;
    white-space: pre-wrap;
    min-height: 180px;
    color: #b8c498;
  }
  #journal-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid #4a5a38;
    font-size: 10px;
    color: #7d8a5e;
  }
  #journal-nav button {
    background: none;
    border: 1px solid #4a5a38;
    color: #7d8a5e;
    cursor: pointer;
    font-family: monospace;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 2px;
  }
  #journal-nav button:hover { color: #c8d4a8; border-color: #c8d4a8; }
  #journal-nav button:disabled { opacity: 0.3; cursor: default; }
`;
document.head.appendChild(style);

let journalPage = 0;

function openJournal() {
  const unlocked = Math.min(state.dayIndex + 1, JOURNAL_ENTRIES.length);
  journalPage = Math.min(journalPage, unlocked - 1);
  renderJournalPage(unlocked);
  journalOverlay.classList.add("open");
  state.journalOpen = true;
}

function renderJournalPage(unlocked) {
  const entry = JOURNAL_ENTRIES[journalPage];
  document.getElementById("journal-date").textContent = entry.date;
  document.getElementById("journal-body").textContent = entry.text;
  document.getElementById("journal-page").textContent =
    `${journalPage + 1} / ${unlocked}`;
  document.getElementById("journal-prev").disabled = journalPage === 0;
  document.getElementById("journal-next").disabled =
    journalPage >= unlocked - 1;
}

function closeJournal() {
  journalOverlay.classList.remove("open");
  state.journalOpen = false;
}

document
  .getElementById("journal-close")
  .addEventListener("click", closeJournal);
document.getElementById("journal-prev").addEventListener("click", () => {
  if (journalPage > 0) {
    journalPage--;
    renderJournalPage(Math.min(state.dayIndex + 1, JOURNAL_ENTRIES.length));
  }
});
document.getElementById("journal-next").addEventListener("click", () => {
  const unlocked = Math.min(state.dayIndex + 1, JOURNAL_ENTRIES.length);
  if (journalPage < unlocked - 1) {
    journalPage++;
    renderJournalPage(unlocked);
  }
});

// close journal on Escape or Space
window.addEventListener("keydown", (e) => {
  if (state.journalOpen && (e.key === "Escape" || e.key === " ")) {
    e.preventDefault();
    closeJournal();
  }
});

// CANVAS / STATE
const LOGICAL_W = COLS * TILE_SIZE;
const LOGICAL_H = ROWS * TILE_SIZE;

function resize() {
  const borderPx = Math.min(28, Math.max(8, window.innerWidth * 0.022));
  const availW = window.innerWidth - borderPx * 2;
  const availH = window.innerHeight - borderPx * 2;
  const scale = Math.min(availW / LOGICAL_W, availH / LOGICAL_H);
  canvas.width = Math.floor(LOGICAL_W * scale);
  canvas.height = Math.floor(LOGICAL_H * scale);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener("resize", resize);
resize();

const PLAYER_SIZE = 22;
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
  idleTime: 0,
  idleLineShown: false,
  visitedObjects: new Set(),
  journalOpen: false,
  benchSat: false,
  benchDone: false,
  textLocked: false,
};

function currentDay() {
  return DAYS[state.dayIndex];
}
function currentGrid() {
  if (state.scene === "outside") return OUTSIDE;
  if (state.scene === "bathroom") return BATHROOM;
  if (state.scene === "kitchen") return KITCHEN;
  return ROOM;
}

function showLine(line, holdMs, force = false) {
  if (state.textLocked && !force) return; // bench narrative lock
  textBox.textContent = line;
  textBox.classList.remove("hidden");
  clearTimeout(textBox._t); // always cancel any previously scheduled hide
  if (holdMs) {
    textBox._t = setTimeout(() => textBox.classList.add("hidden"), holdMs);
  }
}

function updateDayLabel() {
  dayLabel.textContent = state.ended
    ? ""
    : `${currentDay().label} · ${state.dayIndex + 1}/6`;
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
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") initAudio();
});
window.addEventListener("pointerdown", () => {
  if (!state.started) beginGame();
});

const keys = new Set();
window.addEventListener("keydown", (e) => {
  if (state.journalOpen) return;
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
  )
    e.preventDefault();
  initAudio();
  if (!state.started) {
    beginGame();
    return;
  }
  if (state.transitioning) return;
  if (k === "r" && (state.ended || state.benchDone)) {
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
  )
    keys.add(k);
  if (k === " " || k === "enter") interact();
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

document
  .querySelectorAll(".touch-dpad .touch-btn, #touch-dpad .touch-btn")
  .forEach((btn) => {
    const key = btn.dataset.key;
    const press = (e) => {
      e.preventDefault();
      if (state.journalOpen) return;
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
  if (state.journalOpen) {
    closeJournal();
    return;
  }
  startAudioOnce();
  if (!state.started) {
    beginGame();
    return;
  }
  if (state.ended || (state.benchDone && state.scene === "outside")) {
    restart();
    return;
  }
  if (!state.transitioning) interact();
});
document.getElementById("t-interact")?.addEventListener("click", (e) => {
  if (state.journalOpen) {
    closeJournal();
    return;
  }
  if (!state.started) {
    beginGame();
    return;
  }
  if (state.ended || (state.benchDone && state.scene === "outside")) {
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
  state.idleTime = 0;
  state.idleLineShown = false;
  state.visitedObjects = new Set();
  state.scene = "room";
  state.ended = false;
  state.benchSat = false;
  state.benchDone = false;
  state.textLocked = false;
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
  const passable = new Set([
    0, // floor
    6, // rug
    10,
    13,
    17, // desk
    35, // journal table
    36,
    37, // workbench
    38, // fruit bowl
    // bathroom furniture
    24,
    25,
    26,
    28,
    34,
    // kitchen furniture
    29,
    30,
    31,
    32,
    // bedroom furniture
    9,
    20,
    21,
    22,
    27,
  ]);
  return !passable.has(code);
}
function canStandAt(x, y) {
  const corners = [
    [x, y],
    [x + PLAYER_SIZE - 1, y],
    [x, y + PLAYER_SIZE - 1],
    [x + PLAYER_SIZE - 1, y + PLAYER_SIZE - 1],
  ];
  for (const [cx, cy] of corners) {
    if (
      isBlocking(tileAt(Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE)))
    )
      return false;
  }
  return true;
}
function facingTile() {
  const cx = state.player.x + PLAYER_SIZE / 2;
  const cy = state.player.y + PLAYER_SIZE / 2;
  let col = Math.floor(cx / TILE_SIZE);
  let row = Math.floor(cy / TILE_SIZE);
  if (state.player.dir === "up") row--;
  if (state.player.dir === "down") row++;
  if (state.player.dir === "left") col--;
  if (state.player.dir === "right") col++;
  return tileAt(col, row);
}

function interact() {
  const day = currentDay();
  const tile = facingTile();

  function showWithFollowup(key, holdMs, tileCode) {
    const again = day[key + "Again"];
    if (state.visitedObjects.has(key) && again) {
      showLine(again, holdMs);
    } else {
      showLine(day[key], holdMs);
      state.visitedObjects.add(key);
    }
    playChime(tileCode);
  }

  if (tile === 35) {
    playChime(35);
    if (day.journal) showLine(day.journal, 1500);
    journalPage = state.dayIndex; // always open to today's entry
    setTimeout(() => openJournal(), 600);
    return;
  }
  if (tile === 36 || tile === 37) {
    showWithFollowup("workbench", 3500, 36);
    return;
  }
  if (tile === 38) {
    showWithFollowup("fruitBowl", 3500, 30);
    return;
  }
  if (tile === 39) {
    if (state.scene === "outside" && !state.benchSat) {
      state.benchSat = true;
      state.textLocked = true; // prevent anything from overwriting this
      // FIX: pass force=true so this line isn't blocked by the lock
      // we just set on the line above (showLine bails out early if
      // textLocked is already true and force isn't passed).
      showLine(currentDay().benchLine || "you sit for a while.", null, true);
      playChime(20);
    }
    return;
  }
  if (tile === 4) {
    showWithFollowup("window", 3500, 4);
    return;
  }
  if (tile === 7) {
    showWithFollowup("mirror", 3000, 7);
    return;
  }
  if (tile === 9) {
    showWithFollowup("nightstand", 3500, 9);
    return;
  }
  if (tile === 27) {
    showWithFollowup("bedsideOil", 3500, 27);
    return;
  }
  if (tile === 24) {
    showWithFollowup("tub", 3500, 24);
    return;
  }
  if (tile === 34) {
    showWithFollowup("toilet", 3500, 34);
    return;
  }
  if (tile === 25) {
    showWithFollowup("sink", 3500, 25);
    return;
  }
  if (tile === 26) {
    showWithFollowup("cabinet", 3500, 26);
    return;
  }
  if (tile === 28) {
    showWithFollowup("oil", 3500, 28);
    return;
  }
  if (tile === 10 || tile === 13 || tile === 17) {
    showWithFollowup("computer", 3500, 10);
    return;
  }
  if (tile === 29) {
    showWithFollowup("tea", 3500, 29);
    return;
  }
  if (tile === 30 || tile === 32) {
    showWithFollowup("snacks", 3500, 30);
    return;
  }
  if (tile === 31) {
    showWithFollowup("fridge", 3000, 31);
    return;
  }
  if (tile === 20 || tile === 21) {
    showWithFollowup("couch", 3500, 20);
    return;
  }
  if (tile === 22) {
    showWithFollowup("diffuser", 3500, 22);
    return;
  }

  if (tile === 23) {
    showLine(day.bathroomDoor, 1800);
    playChime(23);
    state.transitioning = true;
    setTimeout(() => {
      state.scene = "bathroom";
      state.player.x =
        BATHROOM_START.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y =
        BATHROOM_START.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "up";
      state.transitioning = false;
    }, 900);
    return;
  }
  if (tile === 33) {
    showLine(day.kitchenDoor, 1800);
    playChime(33);
    state.transitioning = true;
    setTimeout(() => {
      state.scene = "kitchen";
      state.player.x =
        KITCHEN_START.col * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y =
        KITCHEN_START.row * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "up";
      state.transitioning = false;
    }, 900);
    return;
  }
  if (tile === 5) {
    if (state.scene === "bathroom") {
      playChime(5);
      state.scene = "room";
      state.player.x = 14 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y = 7 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "left";
      return;
    }
    if (state.scene === "kitchen") {
      playChime(5);
      state.scene = "room";
      state.player.x = 14 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.y = 9 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      state.player.dir = "left";
      return;
    }
    if (state.scene === "room" && day.isLast) {
      showLine(day.door, 2200);
      playChime(5);
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
      playChime(5);
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
    playChime(5);
    return;
  }
  if (tile === 3) {
    const lines = day.tendLines;
    if (state.tendIndex < lines.length) {
      showLine(lines[state.tendIndex], 2500);
      playChime(3);
      state.tendIndex++;
      if (state.tendIndex === lines.length) {
        state.plantStage = Math.min(
          state.plantStage + 1,
          PLANT_STAGES.length - 1,
        );
        playChime(3);
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
      playChime(2);
    } else {
      sleep();
    }
    return;
  }
}

function sleep() {
  const day = currentDay();
  showLine(day.sleepLine, null);
  playSleepTone(day.isLast, state.dayIndex);
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
      state.idleTime = 0;
      state.idleLineShown = false;
      state.visitedObjects = new Set();
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
  if (state.transitioning || state.ended || state.journalOpen) return;
  const energy = currentDay().energyLevel;
  const speed = (0.8 + energy * 1.6) * (TILE_SIZE / 20);
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

    // Fixed Trigger: Moving in ANY direction away from the bench triggers the play again prompt
    if (state.benchSat && !state.benchDone && state.scene === "outside") {
      state.benchDone = true;
      state.textLocked = false;
      showLine(
        "if you're reading this and you know this kind of week — i hope you know it ends. not because someone fixes it for you, but because you get through it. the same way i did. one unglamorous day at a time. you’re not alone ♡ \n\nyou made it through. press R to play again.",
        null,
        true,
      );
      return;
    }
    const nx = state.player.x + dx * speed;
    if (canStandAt(nx, state.player.y)) state.player.x = nx;
    const ny = state.player.y + dy * speed;
    if (canStandAt(state.player.x, ny)) state.player.y = ny;
    state.idleTime = 0;
    state.idleLineShown = false;
  } else {
    if (facingTile() === 4 && !state.transitioning) {
      state.idleTime += 1 / 60;
      if (
        state.idleTime > 4 &&
        !state.idleLineShown &&
        textBox.classList.contains("hidden")
      ) {
        state.idleLineShown = true;
        showLine(currentDay().windowIdleLine, 4500);
      }
    } else {
      state.idleTime = 0;
      state.idleLineShown = false;
    }
  }
}

// TILE COLORS
const TILE_COLORS = {
  0: "#9ca878",
  1: "#7d8a5e",
  2: "#c9c98a",
  4: "#dbe0b0",
  5: "#6e7a52",
  6: "#aeb888",
  7: "#7d8a5e",
  9: "#9ca878",
  10: "#9ca878",
  11: "#9ca878",
  12: "#9ca878",
  13: "#9ca878",
  16: "#9ca878",
  17: "#9ca878",
  18: "#9ca878",
  20: "#9ca878",
  21: "#9ca878",
  22: "#9ca878",
  23: "#6e7a52",
  27: "#9ca878",
  33: "#8a7a5a",
  35: "#9ca878",
  36: "#9ca878",
  37: "#9ca878",
  38: "#c4b896",
};
const OUTSIDE_COLORS = {
  0: "#8c9968",
  1: "#6e7a52",
  5: "#9ca878",
  8: "#7d8a5e",
  39: "#8c9968",
};
const BATHROOM_COLORS = {
  0: "#a8c0b0",
  1: "#7d9488",
  5: "#6e7a52",
  24: "#a8c0b0",
  25: "#a8c0b0",
  26: "#a8c0b0",
  28: "#a8c0b0",
  34: "#a8c0b0",
};
const KITCHEN_COLORS = {
  0: "#c4b896",
  1: "#8a7a5a",
  5: "#6e7a52",
  29: "#c4b896",
  30: "#c4b896",
  32: "#c4b896",
  31: "#c4b896",
  4: "#dbe0b0",
  38: "#c4b896",
};

// DRAW ROOM
function drawRoom() {
  const grid = currentGrid();
  let palette = TILE_COLORS;
  if (state.scene === "outside") palette = OUTSIDE_COLORS;
  else if (state.scene === "bathroom") palette = BATHROOM_COLORS;
  else if (state.scene === "kitchen") palette = KITCHEN_COLORS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = grid[row][col];
      const x = col * TILE_SIZE,
        y = row * TILE_SIZE;
      if (tile === 3) {
        drawFloorTile(x, y, 0, palette);
        drawPlant(x, y);
        continue;
      }
      if (tile === 8) {
        ctx.fillStyle = OUTSIDE_COLORS[0];
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        drawGrassTexture(x, y);
        drawTree(x, y);
        continue;
      }
      if (tile === 39) {
        drawFloorTile(x, y, 0, palette);
        if (currentGrid()[row][col - 1] !== 39) drawBench(x, y);
        continue;
      }
      if (state.scene === "outside") drawOutsideTile(tile, x, y);
      else drawFloorTile(x, y, tile, palette);
      if (tile === 1 && state.scene === "room") drawWallTexture(x, y, col, row);
      if (tile === 2) drawBed(x, y, col, row);
      if (tile === 4) drawWindow(x, y);
      if (tile === 5 && state.scene !== "outside") drawDoor(x, y);
      if (tile === 23) drawBathroomDoor(x, y);
      if (tile === 33) drawKitchenDoor(x, y);
      if (tile === 6) drawRug(x, y, row, col);
      if (tile === 7) drawMirror(x, y);
      if (tile === 9) drawNightstand(x, y);
      if (tile === 27) drawBedsideOil(x, y);
      if (tile === 24) {
        const iL = grid[row][col - 1] !== 24;
        const iT = grid[row - 1] === undefined || grid[row - 1][col] !== 24;
        drawTub(x, y, iL, iT);
      }
      if (tile === 34) drawToilet(x, y);
      if (tile === 26) drawCabinet(x, y);
      if (tile === 28) drawBathroomOil(x, y);
      if (tile === 25) drawSink(x, y);
      if (tile === 10) drawDesk(x, y, "left");
      if (tile === 13) drawDesk(x, y, "center");
      if (tile === 17) drawDesk(x, y, "right");
      if (tile === 35) drawJournalTable(x, y);
      if (tile === 36) drawWorkbench(x, y, "left");
      if (tile === 37) drawWorkbench(x, y, "right");
      if (tile === 20) drawCouch(x, y, "left");
      if (tile === 21) drawCouch(x, y, "right");
      if (tile === 22) {
        const iL = grid[row][col - 1] !== 22;
        drawCoffeeTable(x, y, iL ? "left" : "right");
      }
      if (tile === 38) drawFruitBowl(x, y);
      if (tile === 4 && state.scene === "kitchen") drawWindow(x, y);
      if (tile === 29) drawStove(x, y);
      if (tile === 30) drawCounter(x, y, "left");
      if (tile === 32) drawCounter(x, y, "right");
      if (tile === 31) {
        const iB = grid[row + 1] === undefined || grid[row + 1][col] !== 31;
        if (iB) drawFridge(x, y);
      }
    }
  }
}

function drawFloorTile(x, y, tile, palette) {
  const base = (palette || TILE_COLORS)[tile] ?? (palette || TILE_COLORS)[0];
  ctx.fillStyle = base;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  if (tile === 0 || tile === 3) {
    ctx.strokeStyle = "rgba(110, 125, 75, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + TILE_SIZE);
    ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
    ctx.stroke();
    if ((x / TILE_SIZE) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(x + TILE_SIZE * 0.5, y);
      ctx.lineTo(x + TILE_SIZE * 0.5, y + TILE_SIZE);
      ctx.stroke();
    }
  }
}

function drawWallTexture(x, y, col, row) {
  ctx.strokeStyle = "rgba(90,105,60,0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + TILE_SIZE / 2, y);
  ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE * 0.25, y + TILE_SIZE * 0.5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE * 0.75, y + TILE_SIZE * 0.5, 2, 0, Math.PI * 2);
  ctx.fill();
  if (row === ROWS - 1) {
    ctx.fillStyle = "rgba(90,105,60,0.28)";
    ctx.fillRect(x, y, TILE_SIZE, 6);
  }
  if (row === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
  }
}

function drawGrassTexture(x, y) {
  ctx.strokeStyle = "rgba(140,190,165,0.55)";
  ctx.lineWidth = 1.5;
  for (const [x1, y1, x2, y2] of [
    [x + 5, y + TILE_SIZE - 3, x + 3, y + TILE_SIZE - 11],
    [x + 14, y + TILE_SIZE - 4, x + 16, y + TILE_SIZE - 13],
    [x + 24, y + TILE_SIZE - 3, x + 22, y + TILE_SIZE - 10],
    [x + 9, y + TILE_SIZE - 2, x + 10, y + TILE_SIZE - 7],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawOutsideTile(tile, x, y) {
  ctx.fillStyle = OUTSIDE_COLORS[tile] ?? OUTSIDE_COLORS[0];
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  if (tile === 0) drawGrassTexture(x, y);
  if (tile === 1) {
    ctx.fillStyle = "rgba(140,190,165,0.5)";
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(x + 5 + i * 7, y + 6 + j * 9, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.fillStyle = "rgba(120,175,150,0.4)";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + 9 + i * 9, y + 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (tile === 5) drawDoor(x, y);
}

function drawJournalTable(x, y) {
  const S = TILE_SIZE / 20;
  // small side table
  ctx.fillStyle = "#a98fa3";
  ctx.fillRect(x + 2 * S, y + 14 * S, TILE_SIZE - 4 * S, 3 * S);
  ctx.fillStyle = "#bda3b6";
  ctx.fillRect(x + 2 * S, y + 10 * S, TILE_SIZE - 4 * S, 5 * S);
  ctx.fillStyle = "#a98fa3";
  ctx.fillRect(x + 3 * S, y + 17 * S, 2.5 * S, 9 * S);
  ctx.fillRect(x + TILE_SIZE - 5.5 * S, y + 17 * S, 2.5 * S, 9 * S);
  // journal book on top
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(x + 4 * S, y - 2 * S, TILE_SIZE - 8 * S, 13 * S);
  ctx.fillStyle = "#e0a8bc";
  ctx.fillRect(x + 4 * S, y - 2 * S, TILE_SIZE - 8 * S, 2 * S);
  // spine
  ctx.fillStyle = "#b87090";
  ctx.fillRect(x + 4 * S, y - 2 * S, 2.5 * S, 13 * S);
  // lined pages peeking out
  ctx.fillStyle = "#f5eff2";
  ctx.fillRect(x + 7 * S, y - 1 * S, TILE_SIZE - 12 * S, 11 * S);
  ctx.strokeStyle = "rgba(200,150,170,0.4)";
  ctx.lineWidth = S * 0.6;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 8 * S, y + (1.5 + i * 2) * S);
    ctx.lineTo(x + TILE_SIZE - 6 * S, y + (1.5 + i * 2) * S);
    ctx.stroke();
  }
  // small pen resting on top
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + TILE_SIZE - 6 * S, y - 4 * S, 1.5 * S, 10 * S);
  ctx.fillStyle = "#c4b896";
  ctx.fillRect(x + TILE_SIZE - 6.2 * S, y + 5.5 * S, 2 * S, 2 * S);
}

function drawWorkbench(x, y, position) {
  const S = TILE_SIZE / 20;
  if (position !== "left") return;
  const w = TILE_SIZE * 2;

  // bench surface — deeper, more substantial
  ctx.fillStyle = "#6a5440";
  ctx.fillRect(x, y + 14 * S, w, 7 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x, y + 14 * S, w, 2 * S);
  // wood grain
  ctx.strokeStyle = "rgba(90,70,50,0.3)";
  ctx.lineWidth = S * 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 2 * S, y + (15.5 + i * 1.8) * S);
    ctx.lineTo(x + w - 2 * S, y + (15.5 + i * 1.8) * S);
    ctx.stroke();
  }
  // legs
  ctx.fillStyle = "#5a4430";
  ctx.fillRect(x + 2 * S, y + 21 * S, 3 * S, 7 * S);
  ctx.fillRect(x + w - 5 * S, y + 21 * S, 3 * S, 7 * S);

  // pegboard back wall — tools hanging
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(x, y - 18 * S, w, 15 * S);
  ctx.fillStyle = "#46382c";
  ctx.fillRect(x, y - 18 * S, w, 1.5 * S);
  // pegboard holes
  ctx.fillStyle = "rgba(30,20,10,0.5)";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      ctx.beginPath();
      ctx.arc(
        x + (3 + c * 4.8) * S,
        y + (-15 + r * 5) * S,
        0.6 * S,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // hanging tools on pegboard
  // screwdriver
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x + 3 * S, y - 14 * S, 1.5 * S, 8 * S);
  ctx.fillStyle = "#e8842a";
  ctx.fillRect(x + 2.5 * S, y - 14 * S, 2.5 * S, 4 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 3.2 * S, y - 6 * S, 0.8 * S, 2 * S);

  // pliers
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 8 * S, y - 14 * S, 2 * S, 9 * S);
  ctx.fillStyle = "#5a6e48";
  ctx.fillRect(x + 7.5 * S, y - 14 * S, 3 * S, 3 * S);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 9.5 * S, y - 12 * S, 1.5 * S, 7 * S);

  // wire stripper / small tool
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x + 14 * S, y - 13 * S, 1.2 * S, 7 * S);
  ctx.fillStyle = "#c44569";
  ctx.fillRect(x + 13.5 * S, y - 13 * S, 2.2 * S, 3 * S);

  // ruler hanging
  ctx.fillStyle = "#e8d44a";
  ctx.fillRect(x + 18 * S, y - 14 * S, 1.5 * S, 10 * S);
  ctx.strokeStyle = "rgba(100,80,0,0.5)";
  ctx.lineWidth = S * 0.4;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 18 * S, y + (-13 + i * 2) * S);
    ctx.lineTo(x + 19 * S, y + (-13 + i * 2) * S);
    ctx.stroke();
  }

  // hook with extra wire coil
  ctx.strokeStyle = "#aeb888";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.arc(x + 24 * S, y - 11 * S, 3 * S, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 24 * S, y - 8 * S, 2 * S, 0, Math.PI * 1.8);
  ctx.stroke();

  // PCB board on bench surface
  ctx.fillStyle = "#2a4a2a";
  ctx.fillRect(x + 2 * S, y + 4 * S, 16 * S, 11 * S);
  ctx.fillStyle = "#3a5c3a";
  ctx.fillRect(x + 2 * S, y + 4 * S, 16 * S, 1.5 * S);
  // traces
  ctx.strokeStyle = "rgba(180,220,100,0.55)";
  ctx.lineWidth = S * 0.6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 4 * S, y + (6 + i * 3) * S);
    ctx.lineTo(x + 14 * S, y + (6 + i * 3) * S);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x + 10 * S, y + 4 * S);
  ctx.lineTo(x + 10 * S, y + 15 * S);
  ctx.stroke();
  // components
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x + 5 * S, y + 5.5 * S, 3 * S, 2 * S);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(x + 9 * S, y + 6 * S, 2 * S, 1.5 * S);
  ctx.fillStyle = "#aeb888";
  ctx.fillRect(x + 12 * S, y + 5.5 * S, 3 * S, 3 * S);
  ctx.fillStyle = "#e8842a";
  ctx.beginPath();
  ctx.arc(x + 4 * S, y + 11 * S, 1.2 * S, 0, Math.PI * 2);
  ctx.fill();

  // solder iron on its stand
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 19 * S, y + 10 * S, 3 * S, 5 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(x + 19.5 * S, y + 3 * S, 2 * S, 8 * S);
  ctx.fillStyle = "#5a6e48";
  ctx.fillRect(x + 19.5 * S, y + 3 * S, 2 * S, 3 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x + 20 * S, y + 1 * S, 1 * S, 2.5 * S);
  const mt = performance.now() / 1000;
  ctx.strokeStyle = "rgba(220,180,130,0.6)";
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(x + 20.5 * S, y + 0.5 * S);
  ctx.quadraticCurveTo(x + 22.5 * S, y - 2.5 * S, x + 20.5 * S, y - 5 * S);
  ctx.stroke();

  // multimeter
  ctx.fillStyle = "#46583a";
  ctx.fillRect(x + 23 * S, y + 5 * S, 9 * S, 10 * S);
  ctx.fillStyle = "#aeb888";
  ctx.fillRect(x + 24 * S, y + 6 * S, 7 * S, 5 * S);
  ctx.fillStyle = "rgba(180,220,100,0.6)";
  ctx.fillText = "";
  ctx.fillStyle = "#7fc0a6";
  ctx.fillRect(x + 25 * S, y + 7 * S, 2 * S, 1 * S);
  ctx.fillStyle = "#c44569";
  ctx.fillRect(x + 28 * S, y + 7 * S, 2 * S, 1 * S);
  ctx.fillStyle = "#9ca878";
  ctx.fillRect(x + 26 * S, y + 12 * S, 3 * S, 2 * S);
  // probe wires
  ctx.strokeStyle = "#c98fa0";
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(x + 25 * S, y + 15 * S);
  ctx.quadraticCurveTo(x + 23 * S, y + 18 * S, x + 20 * S, y + 16 * S);
  ctx.stroke();
  ctx.strokeStyle = "#aeb888";
  ctx.beginPath();
  ctx.moveTo(x + 28 * S, y + 15 * S);
  ctx.quadraticCurveTo(x + 30 * S, y + 18 * S, x + 32 * S, y + 16 * S);
  ctx.stroke();

  // loose wires on surface
  ctx.strokeStyle = "#c44569";
  ctx.lineWidth = 1.2 * S;
  ctx.beginPath();
  ctx.moveTo(x + 3 * S, y + 15 * S);
  ctx.quadraticCurveTo(x + 8 * S, y + 12 * S, x + 13 * S, y + 15 * S);
  ctx.stroke();
  ctx.strokeStyle = "#aeb888";
  ctx.beginPath();
  ctx.moveTo(x + 14 * S, y + 16 * S);
  ctx.quadraticCurveTo(x + 17 * S, y + 13 * S, x + 21 * S, y + 16 * S);
  ctx.stroke();

  // sticky note
  ctx.fillStyle = "#f5e86a";
  ctx.fillRect(x + 24 * S, y + 1 * S, 8 * S, 6 * S);
  ctx.strokeStyle = "rgba(180,160,0,0.4)";
  ctx.lineWidth = S * 0.5;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 25 * S, y + (2.5 + i * 1.8) * S);
    ctx.lineTo(x + 31 * S, y + (2.5 + i * 1.8) * S);
    ctx.stroke();
  }

  // small tray with components — resistors, caps
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(x + 3 * S, y + 17 * S, 12 * S, 4 * S);
  ctx.fillStyle = "#46382c";
  ctx.fillRect(x + 3 * S, y + 17 * S, 12 * S, 1 * S);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(x + 4 * S, y + 18 * S, 2 * S, 1.5 * S);
  ctx.fillStyle = "#aeb888";
  ctx.fillRect(x + 7 * S, y + 18 * S, 2 * S, 1.5 * S);
  ctx.fillStyle = "#e8842a";
  ctx.fillRect(x + 10 * S, y + 18 * S, 2 * S, 1.5 * S);

  // magnifying glass leaning against pegboard
  ctx.strokeStyle = "#cdb6a4";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.arc(x + 35 * S, y + 8 * S, 4 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(180,210,255,0.2)";
  ctx.beginPath();
  ctx.arc(x + 35 * S, y + 8 * S, 4 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cdb6a4";
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(x + 38 * S, y + 11 * S);
  ctx.lineTo(x + 40 * S, y + 14 * S);
  ctx.stroke();
}

function drawBed(x, y, col, row) {
  const S = TILE_SIZE / 20;
  const grid = currentGrid();
  const isLeftHalf = col === 0 || (grid[row] && grid[row][col - 1] !== 2);
  if (!isLeftHalf) return;
  const w = TILE_SIZE * 2,
    h = TILE_SIZE * 2,
    lift = 22 * S;
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x + 2 * S, y - lift, w - 4 * S, lift + 6 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x + 5 * S, y - lift + 3 * S, w - 10 * S, lift - 4 * S);
  ctx.fillStyle = "#d4c0aa";
  ctx.fillRect(x + 5 * S, y - lift + 3 * S, w - 10 * S, 2 * S);
  ctx.fillStyle = "#a98a76";
  ctx.fillRect(x + 2 * S, y - lift, w - 4 * S, 2.5 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 2 * S, y + 4 * S, w - 4 * S, 3 * S);
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x, y, 3 * S, h);
  ctx.fillRect(x + w - 3 * S, y, 3 * S, h);
  ctx.fillRect(x, y + h - 5 * S, w, 5 * S);
  ctx.fillStyle = "#a98a76";
  ctx.fillRect(x, y + h - 5 * S, w, 1.5 * S);
  ctx.fillStyle = "#f6cfe0";
  ctx.fillRect(x + 3 * S, y + 6 * S, w - 6 * S, h - 12 * S);
  const pw = (w - 18 * S) / 2,
    ph = 12 * S,
    py2 = y + 8 * S;
  for (let p = 0; p < 2; p++) {
    const px2 = x + 5 * S + p * (pw + 8 * S);
    ctx.fillStyle = "#e8c4d8";
    ctx.fillRect(px2 + 1.5 * S, py2 + 2 * S, pw, ph);
    ctx.fillStyle = "#fde8f1";
    ctx.fillRect(px2, py2, pw, ph);
    ctx.fillStyle = "#fffafc";
    ctx.globalAlpha = 0.7;
    ctx.fillRect(px2 + 2 * S, py2 + 1.5 * S, pw - 4 * S, 3 * S);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(217,169,181,0.6)";
    ctx.lineWidth = 1.5 * S;
    ctx.strokeRect(px2 + 2 * S, py2 + 2 * S, pw - 4 * S, ph - 4 * S);
    ctx.fillStyle = "rgba(217,169,181,0.4)";
    ctx.beginPath();
    ctx.arc(px2 + 2.5 * S, py2 + 2.5 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px2 + pw - 2.5 * S, py2 + 2.5 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px2 + 2.5 * S, py2 + ph - 2.5 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px2 + pw - 2.5 * S, py2 + ph - 2.5 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(217,169,181,0.3)";
    ctx.lineWidth = S;
    ctx.beginPath();
    ctx.moveTo(px2 + pw / 2, py2 + 2 * S);
    ctx.lineTo(px2 + pw / 2, py2 + ph - 2 * S);
    ctx.stroke();
  }
  const bTop = y + 8 * S + 12 * S + 2 * S;
  ctx.fillStyle = "#e9b8cb";
  ctx.fillRect(x + 3 * S, bTop, w - 6 * S, h - 5 * S - bTop + y);
  ctx.fillStyle = "#f0c8d8";
  ctx.fillRect(x + 3 * S, bTop, w - 6 * S, 3 * S);
  ctx.fillStyle = "#dba6bd";
  const bH = h - 5 * S - bTop + y;
  for (let i = 1; i < 5; i++)
    ctx.fillRect(x + 3 * S + i * ((w - 6 * S) / 5), bTop, 1 * S, bH);
  ctx.fillRect(x + 3 * S, bTop + bH * 0.5, w - 6 * S, 1 * S);
}

function drawWindow(x, y) {
  const S = TILE_SIZE / 20;
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(x + 1 * S, y + TILE_SIZE - 6 * S, TILE_SIZE - 2 * S, 5 * S);
  ctx.fillStyle = "#f3e6d8";
  ctx.fillRect(x + 1 * S, y + TILE_SIZE - 6 * S, TILE_SIZE - 2 * S, 1.5 * S);
  ctx.fillStyle = "#fdf3d3";
  ctx.fillRect(x + 3 * S, y + 3 * S, TILE_SIZE - 6 * S, TILE_SIZE - 10 * S);
  ctx.fillStyle = "#fffcf0";
  ctx.fillRect(x + 3 * S, y + 3 * S, TILE_SIZE - 6 * S, 6 * S);
  ctx.fillStyle = "#fce8b8";
  ctx.fillRect(x + 3 * S, y + TILE_SIZE - 12 * S, TILE_SIZE - 6 * S, 5 * S);
  ctx.strokeStyle = "#e8d6ec";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(x + TILE_SIZE / 2, y + 3 * S);
  ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 6 * S);
  ctx.moveTo(x + 3 * S, y + TILE_SIZE / 2);
  ctx.lineTo(x + TILE_SIZE - 3 * S, y + TILE_SIZE / 2);
  ctx.stroke();
  ctx.strokeStyle = "#b89c89";
  ctx.strokeRect(
    x + 1.5 * S,
    y + 1.5 * S,
    TILE_SIZE - 3 * S,
    TILE_SIZE - 3 * S,
  );
  ctx.fillStyle = "rgba(232,214,236,0.75)";
  ctx.fillRect(x, y, 4 * S, TILE_SIZE);
  ctx.fillRect(x + TILE_SIZE - 4 * S, y, 4 * S, TILE_SIZE);
  ctx.strokeStyle = "rgba(217,169,181,0.4)";
  ctx.lineWidth = S;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + (1 + i * 2) * S, y);
    ctx.lineTo(x + (1 + i * 2) * S, y + TILE_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + TILE_SIZE - (1 + i * 2) * S, y);
    ctx.lineTo(x + TILE_SIZE - (1 + i * 2) * S, y + TILE_SIZE);
    ctx.stroke();
  }
}

function drawDoor(x, y) {
  const S = TILE_SIZE / 20;
  ctx.fillStyle = "#7a6688";
  ctx.fillRect(x + 1 * S, y, TILE_SIZE - 2 * S, TILE_SIZE);
  ctx.fillStyle = "#9c84ab";
  ctx.fillRect(x + 2.5 * S, y + 1 * S, TILE_SIZE - 5 * S, TILE_SIZE - 2 * S);
  ctx.fillStyle = "#b9a8c9";
  ctx.fillRect(x + 4 * S, y + 3 * S, TILE_SIZE - 8 * S, TILE_SIZE * 0.4);
  ctx.fillRect(
    x + 4 * S,
    y + TILE_SIZE * 0.5,
    TILE_SIZE - 8 * S,
    TILE_SIZE * 0.38,
  );
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = S;
  ctx.strokeRect(x + 4 * S, y + 3 * S, TILE_SIZE - 8 * S, TILE_SIZE * 0.4);
  ctx.strokeRect(
    x + 4 * S,
    y + TILE_SIZE * 0.5,
    TILE_SIZE - 8 * S,
    TILE_SIZE * 0.38,
  );
  ctx.fillStyle = "#f3eef7";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE - 7 * S, y + TILE_SIZE / 2, 2 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cbb8d8";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE - 7 * S, y + TILE_SIZE / 2, 0.8 * S, 0, Math.PI * 2);
  ctx.fill();
}

function drawRug(x, y, row, col) {
  const S = TILE_SIZE / 20,
    RUG_ROW = 7,
    RUG_COL = 2,
    RUG_W = 2,
    RUG_H = 2;
  if (row !== RUG_ROW || col !== RUG_COL) return;
  const w = TILE_SIZE * RUG_W,
    h = TILE_SIZE * RUG_H;
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(x + 1 * S, y + 1 * S, w, h);
  ctx.fillStyle = "#a9b58a";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(125,138,94,0.15)";
  for (let i = 0; i < RUG_H * 2; i++)
    ctx.fillRect(x, y + i * (h / (RUG_H * 2)), w, (h / (RUG_H * 2)) * 0.5);
  ctx.strokeStyle = "rgba(125,138,94,0.35)";
  ctx.lineWidth = 1.5 * S;
  ctx.strokeRect(x + 3 * S, y + 3 * S, w - 6 * S, h - 6 * S);
  ctx.strokeStyle = "rgba(125,138,94,0.22)";
  ctx.lineWidth = 1 * S;
  ctx.strokeRect(x + 7 * S, y + 7 * S, w - 14 * S, h - 14 * S);
  ctx.fillStyle = "rgba(125,138,94,0.25)";
  for (const [cx2, cy2] of [
    [x + 5 * S, y + 5 * S],
    [x + w - 5 * S, y + 5 * S],
    [x + 5 * S, y + h - 5 * S],
    [x + w - 5 * S, y + h - 5 * S],
  ]) {
    ctx.beginPath();
    ctx.arc(cx2, cy2, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
  }
  const mcx = x + w / 2,
    mcy = y + h / 2;
  ctx.fillStyle = "rgba(196,156,168,0.18)";
  ctx.beginPath();
  ctx.moveTo(mcx, mcy - 6 * S);
  ctx.lineTo(mcx + 6 * S, mcy);
  ctx.lineTo(mcx, mcy + 6 * S);
  ctx.lineTo(mcx - 6 * S, mcy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(217,169,181,0.5)";
  ctx.lineWidth = 1 * S;
  ctx.stroke();
}

function drawMirror(x, y) {
  const S = TILE_SIZE / 20,
    lift = 28 * S;
  ctx.fillStyle = "rgba(20,21,15,0.18)";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2,
    y + TILE_SIZE - 2 * S,
    TILE_SIZE * 0.38,
    3 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#8a73a0";
  ctx.fillRect(x + 3 * S, y + TILE_SIZE - 3 * S, 6 * S, 3 * S);
  ctx.fillRect(x + TILE_SIZE - 9 * S, y + TILE_SIZE - 3 * S, 6 * S, 3 * S);
  ctx.fillStyle = "#a090b8";
  ctx.fillRect(x + 3 * S, y + TILE_SIZE - 3 * S, 6 * S, 1 * S);
  ctx.fillRect(x + TILE_SIZE - 9 * S, y + TILE_SIZE - 3 * S, 6 * S, 1 * S);
  ctx.fillStyle = "#9a78b8";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 2.5 * S,
    y + TILE_SIZE - 7 * S,
    5 * S,
    7 * S,
  );
  ctx.fillStyle = "#b090d0";
  ctx.fillRect(x + TILE_SIZE / 2 - 1 * S, y + TILE_SIZE - 7 * S, 2 * S, 7 * S);
  const frameCY = y + TILE_SIZE - 8 * S - lift / 2,
    frameRX = TILE_SIZE * 0.44,
    frameRY = lift / 2 + 3 * S;
  ctx.fillStyle = "#a080c0";
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, frameCY, frameRX, frameRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a8de";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2 - 1 * S,
    frameCY - 1 * S,
    frameRX - 1.5 * S,
    frameRY - 1.5 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#f0eaff";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2,
    frameCY,
    frameRX - 3 * S,
    frameRY - 3 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(255,245,200,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2,
    frameCY,
    frameRX - 3 * S,
    frameRY - 3 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE * 0.38,
    frameCY - frameRY * 0.35,
    frameRX * 0.12,
    frameRY * 0.22,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE * 0.55,
    frameCY + frameRY * 0.3,
    frameRX * 0.08,
    frameRY * 0.12,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawNightstand(x, y) {
  const S = TILE_SIZE / 20,
    lift = 22 * S;
  ctx.fillStyle = "#a98fa3";
  ctx.fillRect(x + 1 * S, y + 1 * S, TILE_SIZE - 2 * S, 3 * S);
  ctx.fillStyle = "#cdb6c4";
  ctx.fillRect(x + 1 * S, y - 4 * S, TILE_SIZE - 2 * S, 5 * S);
  ctx.fillStyle = "#bda3b6";
  ctx.fillRect(x + 1 * S, y - 4 * S, TILE_SIZE - 2 * S, 1.5 * S);
  ctx.fillStyle = "#a98fa3";
  ctx.fillRect(x + 3 * S, y + 3 * S, 2.5 * S, TILE_SIZE - 4 * S);
  ctx.fillRect(x + TILE_SIZE - 5.5 * S, y + 3 * S, 2.5 * S, TILE_SIZE - 4 * S);
  ctx.fillStyle = "#bda3b6";
  ctx.fillRect(x + 2 * S, y + 3 * S, TILE_SIZE - 4 * S, 4 * S);
  ctx.fillStyle = "#a98fa3";
  ctx.fillRect(x + 4 * S, y + 4 * S, TILE_SIZE - 8 * S, 2 * S);
  ctx.fillStyle = "#f3e6f0";
  ctx.fillRect(x + 4 * S, y - lift, 8 * S, lift - 1 * S);
  ctx.fillStyle = "#7fc0a6";
  ctx.fillRect(x + 4 * S, y - lift, 8 * S, 4 * S);
  ctx.fillStyle = "#6aab92";
  ctx.fillRect(x + 5 * S, y - lift + 1 * S, 6 * S, 2 * S);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 5 * S, y - lift + 6 * S, 6 * S, 5 * S);
  ctx.strokeStyle = "rgba(127,192,166,0.7)";
  ctx.lineWidth = S * 0.7;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 5.5 * S, y - lift + (7.5 + i * 1.3) * S);
    ctx.lineTo(x + 10.5 * S, y - lift + (7.5 + i * 1.3) * S);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(x + 5 * S, y - 1 * S, 8 * S, 2 * S);
  ctx.fillStyle = "#f3e6f0";
  ctx.fillRect(x + 15 * S, y - 12 * S, 7 * S, 12 * S);
  ctx.fillStyle = "#c44569";
  ctx.fillRect(x + 15 * S, y - 10 * S, 7 * S, 10 * S);
  ctx.fillStyle = "#e0719a";
  ctx.fillRect(x + 15 * S, y - 10 * S, 7 * S, 2 * S);
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.25;
  ctx.fillRect(x + 16 * S, y - 10 * S, 2 * S, 10 * S);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(200,80,120,0.4)";
  ctx.lineWidth = S;
  ctx.strokeRect(x + 15 * S, y - 12 * S, 7 * S, 12 * S);
}

function drawDesk(x, y, position) {
  const S = TILE_SIZE / 20;
  if (position !== "left") return;
  const w = TILE_SIZE * 3;
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x, y + 17 * S, w, 6 * S);
  ctx.fillStyle = "#a98a76";
  ctx.fillRect(x, y + 17 * S, w, 2 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 2 * S, y + 23 * S, 3 * S, 4 * S);
  ctx.fillRect(x + w / 2 - 1.5 * S, y + 23 * S, 3 * S, 4 * S);
  ctx.fillRect(x + w - 5 * S, y + 23 * S, 3 * S, 4 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 2 * S, y + 11 * S, TILE_SIZE - 4 * S, 6 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x + 2 * S, y + 11 * S, TILE_SIZE - 4 * S, 1.5 * S);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 3 * S, y + 13 * S, 8 * S, 3 * S);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#46583a";
    ctx.fillRect(x + (4 + i * 2.5) * S, y + 13.5 * S, 1.5 * S, 1.5 * S);
  }
  ctx.fillStyle = "#5a6e48";
  ctx.fillRect(x + 3 * S, y - 3 * S, TILE_SIZE - 6 * S, 14 * S);
  ctx.fillStyle = "#46583a";
  ctx.fillRect(x + 3 * S, y - 3 * S, TILE_SIZE - 6 * S, 2 * S);
  ctx.fillStyle = "#2a2620";
  ctx.fillRect(x + 5 * S, y - 0.5 * S, TILE_SIZE - 10 * S, 9 * S);
  ctx.fillStyle = "#aeb888";
  ctx.fillRect(x + 6 * S, y + 0.5 * S, TILE_SIZE - 12 * S, 7 * S);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(x + 7 * S, y + 1.5 * S);
  ctx.lineTo(x + 10 * S, y + 1.5 * S);
  ctx.lineTo(x + 7 * S, y + 5.5 * S);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(70,88,58,0.45)";
  ctx.lineWidth = S * 0.8;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 7.5 * S, y + (2.5 + i * 2) * S);
    ctx.lineTo(x + TILE_SIZE - 7 * S, y + (2.5 + i * 2) * S);
    ctx.stroke();
  }
  ctx.fillStyle = "#aeb888";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE - 5 * S, y + 10 * S, 0.8 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#46583a";
  ctx.fillRect(x + TILE_SIZE / 2 - 2 * S, y + 11 * S, 4 * S, 1.5 * S);
  const cx2 = x + TILE_SIZE;
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(cx2 + 1 * S, y + 18.5 * S, 17 * S, 4 * S);
  ctx.fillStyle = "#9ca878";
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 7; c++)
      ctx.fillRect(
        cx2 + (1.7 + c * 2.2) * S,
        y + (19 + r * 1.8) * S,
        1.7 * S,
        1.4 * S,
      );
  ctx.fillRect(cx2 + 4 * S, y + 22.5 * S, 9 * S, 1.4 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(cx2 + 2 * S, y + 11 * S, 13 * S, 7 * S);
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(cx2 + 2 * S, y + 11 * S, 13 * S, 1 * S);
  ctx.fillRect(cx2 + 8 * S, y + 11 * S, 1 * S, 7 * S);
  ctx.strokeStyle = "rgba(110,125,75,0.5)";
  ctx.lineWidth = S * 0.7;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx2 + 3 * S, y + (13 + i * 1.8) * S);
    ctx.lineTo(cx2 + 7 * S, y + (13 + i * 1.8) * S);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(110,125,75,0.7)";
  ctx.lineWidth = S * 0.8;
  ctx.beginPath();
  ctx.moveTo(cx2 + 9.5 * S, y + 13 * S);
  ctx.lineTo(cx2 + 12 * S, y + 13 * S);
  ctx.lineTo(cx2 + 12 * S, y + 15 * S);
  ctx.lineTo(cx2 + 10 * S, y + 15 * S);
  ctx.stroke();
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(cx2 + 16 * S, y + 15 * S, 3 * S, 7 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(cx2 + 16.5 * S, y + 7 * S, 2 * S, 9 * S);
  ctx.fillStyle = "#5a6e48";
  ctx.fillRect(cx2 + 16.5 * S, y + 7 * S, 2 * S, 3 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(cx2 + 17 * S, y + 4.5 * S, 1 * S, 3 * S);
  ctx.strokeStyle = "rgba(220,180,130,0.55)";
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(cx2 + 17.5 * S, y + 3.5 * S);
  ctx.quadraticCurveTo(
    cx2 + 19.5 * S,
    y + 0.5 * S,
    cx2 + 17.5 * S,
    y - 2.5 * S,
  );
  ctx.stroke();
  const rx = x + TILE_SIZE * 2;
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(rx + 1 * S, y + 12 * S, 14 * S, 9 * S);
  ctx.fillStyle = "#c9c98a";
  ctx.fillRect(rx + 1 * S, y + 12 * S, 14 * S, 1 * S);
  ctx.fillStyle = "#9ca878";
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++)
      ctx.fillRect(
        rx + (2 + c * 1.5) * S,
        y + (13.5 + r * 1.8) * S,
        0.9 * S,
        0.9 * S,
      );
  ctx.strokeStyle = "#5a6e48";
  ctx.lineWidth = S * 0.8;
  ctx.beginPath();
  ctx.moveTo(rx + 4 * S, y + 12 * S);
  ctx.lineTo(rx + 4 * S, y + 10 * S);
  ctx.lineTo(rx + 7 * S, y + 10 * S);
  ctx.lineTo(rx + 7 * S, y + 12 * S);
  ctx.stroke();
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(rx + 4.5 * S, y + 9 * S, 2.5 * S, 1.5 * S);
  ctx.fillStyle = "#46583a";
  ctx.fillRect(rx + 16 * S, y + 11 * S, 9 * S, 11 * S);
  ctx.fillStyle = "#aeb888";
  ctx.fillRect(rx + 17 * S, y + 12 * S, 7 * S, 5 * S);
  ctx.fillStyle = "#9ca878";
  ctx.fillRect(rx + 19 * S, y + 18 * S, 3 * S, 3 * S);
  ctx.strokeStyle = "#c98fa0";
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(rx + 18 * S, y + 22 * S);
  ctx.quadraticCurveTo(rx + 16 * S, y + 26 * S, rx + 14 * S, y + 24 * S);
  ctx.stroke();
  ctx.strokeStyle = "#aeb888";
  ctx.beginPath();
  ctx.moveTo(rx + 21 * S, y + 22 * S);
  ctx.quadraticCurveTo(rx + 23 * S, y + 26 * S, rx + 25 * S, y + 24 * S);
  ctx.stroke();
  ctx.fillStyle = "#c44569";
  ctx.fillRect(rx + 2 * S, y + 3 * S, 6 * S, 11 * S);
  ctx.fillStyle = "#e0719a";
  ctx.fillRect(rx + 2 * S, y + 3 * S, 6 * S, 2 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(rx + 3 * S, y + 1 * S, 4 * S, 2.5 * S);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(rx + 3 * S, y + 5.5 * S, 4 * S, 5 * S);
  ctx.strokeStyle = "#a02850";
  ctx.lineWidth = S * 0.9;
  ctx.beginPath();
  ctx.moveTo(rx + 2 * S, y + 10 * S);
  ctx.lineTo(rx + 8 * S, y + 10 * S);
  ctx.stroke();
}

function drawCouch(x, y, position) {
  const S = TILE_SIZE / 20;
  if (position !== "left") return;
  const w = TILE_SIZE * 2,
    lift = 20 * S;
  ctx.fillStyle = "rgba(20,21,15,0.14)";
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2,
    y + TILE_SIZE - 1 * S,
    w * 0.46,
    3.5 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#6a7650";
  ctx.fillRect(x, y - lift * 0.5, 5 * S, lift * 0.5 + 10 * S);
  ctx.fillRect(x + w - 5 * S, y - lift * 0.5, 5 * S, lift * 0.5 + 10 * S);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x, y - lift * 0.5, 5 * S, 2 * S);
  ctx.fillRect(x + w - 5 * S, y - lift * 0.5, 5 * S, 2 * S);
  ctx.fillStyle = "#58663e";
  ctx.fillRect(x, y + 8 * S, 5 * S, 2 * S);
  ctx.fillRect(x + w - 5 * S, y + 8 * S, 5 * S, 2 * S);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 5 * S, y - lift, w - 10 * S, lift);
  ctx.fillStyle = "#6a7650";
  ctx.fillRect(x + 5 * S, y - lift, w - 10 * S, 2.5 * S);
  ctx.fillStyle = "#58663e";
  ctx.fillRect(x + 5 * S, y - 1 * S, w - 10 * S, 2.5 * S);
  const cpw = (w - 10 * S - 4 * S) / 3;
  for (let i = 0; i < 3; i++) {
    const cpx = x + 5 * S + 2 * S + i * (cpw + 1 * S);
    ctx.fillStyle = "#8c9968";
    ctx.fillRect(cpx, y - lift + 3 * S, cpw, lift - 6 * S);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(cpx, y - lift + 3 * S, cpw, 2 * S);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(cpx, y - 3 * S, cpw, 2 * S);
  }
  ctx.fillStyle = "#aeb888";
  ctx.fillRect(x + 5 * S, y - 7 * S, w - 10 * S, 9 * S);
  ctx.fillStyle = "#9ca878";
  ctx.fillRect(x + 5 * S, y - 7 * S, w - 10 * S, 1.5 * S);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 5 * S, y + 1 * S, w - 10 * S, 2.5 * S);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(x + 7 * S, y - 6 * S, w - 14 * S, 2 * S);
  ctx.fillStyle = "#d9a9b5";
  ctx.fillRect(x + 7 * S, y - 12 * S, 9 * S, 7 * S);
  ctx.fillStyle = "#e8c4d0";
  ctx.fillRect(x + 7 * S, y - 12 * S, 9 * S, 1.5 * S);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(x + 7 * S, y - 12 * S, 1.5 * S, 7 * S);
  ctx.strokeStyle = "rgba(217,169,181,0.5)";
  ctx.lineWidth = S * 0.8;
  ctx.strokeRect(x + 8.5 * S, y - 10.5 * S, 6 * S, 4 * S);
  ctx.fillStyle = "#3a4a30";
  ctx.fillRect(x + 5 * S, y + 3 * S, 3 * S, 5 * S);
  ctx.fillRect(x + w - 8 * S, y + 3 * S, 3 * S, 5 * S);
  ctx.fillStyle = "rgba(20,21,15,0.2)";
  ctx.fillRect(x + 5 * S, y + 8 * S, 3 * S, 1 * S);
  ctx.fillRect(x + w - 8 * S, y + 8 * S, 3 * S, 1 * S);
}

function drawCoffeeTable(x, y, position) {
  const S = TILE_SIZE / 20;
  if (position !== "left") return;
  const w = TILE_SIZE * 2;
  ctx.fillStyle = "rgba(20,21,15,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2,
    y + TILE_SIZE - 2 * S,
    w * 0.42,
    3 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(x + 4 * S, y + 7 * S, 2.5 * S, 9 * S);
  ctx.fillRect(x + w - 6.5 * S, y + 7 * S, 2.5 * S, 9 * S);
  ctx.fillStyle = "#6a5440";
  ctx.fillRect(x + 6 * S, y + 7 * S, 1.5 * S, 4 * S);
  ctx.fillRect(x + w - 7.5 * S, y + 7 * S, 1.5 * S, 4 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 1 * S, y + 5 * S, w - 2 * S, 3 * S);
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x + 1 * S, y - 1 * S, w - 2 * S, 7 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x + 1 * S, y - 1 * S, w - 2 * S, 1.8 * S);
  ctx.strokeStyle = "rgba(154,125,106,0.28)";
  ctx.lineWidth = S * 0.6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 4 * S, y + (1.5 + i * 1.8) * S);
    ctx.lineTo(x + w - 4 * S, y + (1.5 + i * 1.8) * S);
    ctx.stroke();
  }
  const bookColors = ["#c98fa0", "#9ca878", "#a98fb8"];
  let bookY = y - 1 * S;
  for (let i = 0; i < 3; i++) {
    bookY -= 2.5 * S + 0.5 * S;
    const bw = (12 - i * 1.5) * S;
    ctx.fillStyle = bookColors[i];
    ctx.fillRect(x + 3 * S, bookY, bw, 2.5 * S);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(x + 3 * S, bookY, bw, 0.7 * S);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(x + 3 * S, bookY, 1.5 * S, 2.5 * S);
  }
  ctx.fillStyle = "#e0719a";
  ctx.fillRect(x + 8 * S, bookY - 2.5 * S, 1.5 * S, 3.5 * S);
  const ix = x + w - 15 * S,
    iy = y - 0.5 * S;
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(ix, iy, 12 * S, 1.5 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(ix + 0.5 * S, iy - 0.8 * S, 11 * S, 1 * S);
  ctx.fillStyle = "#c4b896";
  ctx.fillRect(ix + 1 * S, iy - 8 * S, 1 * S, 8 * S);
  ctx.fillStyle = "#a8a090";
  ctx.fillRect(ix + 0.5 * S, iy - 9 * S, 2 * S, 1.5 * S);
  ctx.fillStyle = "#c44569";
  ctx.beginPath();
  ctx.arc(ix + 1 * S, iy - 9.5 * S, 1.2 * S, 0, Math.PI * 2);
  ctx.fill();
  const mt = performance.now() / 1000;
  const d1 = Math.sin(mt * 0.55) * 2 * S,
    d2 = Math.sin(mt * 0.4 + 1.2) * 1.8 * S,
    d3 = Math.sin(mt * 0.32 + 2.5) * 1.4 * S;
  ctx.strokeStyle = "rgba(232,214,236,0.5)";
  ctx.lineWidth = S * 1.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ix + 1 * S, iy - 10 * S);
  ctx.quadraticCurveTo(
    ix + 1 * S + d1,
    iy - 17 * S,
    ix + 1 * S + d2,
    iy - 23 * S,
  );
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(ix + 1 * S + d2, iy - 23 * S);
  ctx.quadraticCurveTo(ix + 1 * S + d3, iy - 29 * S, ix + 1 * S, iy - 34 * S);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";
}

function drawKitchenDoor(x, y) {
  const S = TILE_SIZE / 20;
  ctx.fillStyle = "#6e5644";
  ctx.fillRect(x + 1 * S, y, TILE_SIZE - 2 * S, TILE_SIZE);
  ctx.fillStyle = "#8a7a5a";
  ctx.fillRect(x + 2.5 * S, y + 1 * S, TILE_SIZE - 5 * S, TILE_SIZE - 2 * S);
  ctx.fillStyle = "#c4b896";
  ctx.fillRect(x + 4 * S, y + 3 * S, TILE_SIZE - 8 * S, TILE_SIZE * 0.4);
  ctx.fillRect(
    x + 4 * S,
    y + TILE_SIZE * 0.5,
    TILE_SIZE - 8 * S,
    TILE_SIZE * 0.38,
  );
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + 4 * S, y + 3 * S, TILE_SIZE - 8 * S, 2 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(x + TILE_SIZE / 2 - 3 * S, y + 9 * S, 6 * S, 4 * S);
  ctx.strokeStyle = "#aeb888";
  ctx.lineWidth = S * 0.8;
  ctx.beginPath();
  ctx.moveTo(x + TILE_SIZE / 2, y + 7 * S);
  ctx.quadraticCurveTo(
    x + TILE_SIZE / 2 + 1.5 * S,
    y + 5 * S,
    x + TILE_SIZE / 2,
    y + 3 * S,
  );
  ctx.stroke();
  ctx.fillStyle = "#f3eef7";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE - 6 * S, y + TILE_SIZE / 2, 1.6 * S, 0, Math.PI * 2);
  ctx.fill();
}

function drawStove(x, y) {
  const S = TILE_SIZE / 20;
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(x + 1 * S, y, TILE_SIZE - 2 * S, TILE_SIZE);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 1 * S, y, TILE_SIZE - 2 * S, 2 * S);
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(x + 3 * S, y + 10 * S, TILE_SIZE - 6 * S, 9 * S);
  ctx.fillStyle = "#46382c";
  ctx.fillRect(x + 5 * S, y + 12 * S, TILE_SIZE - 10 * S, 5 * S);
  ctx.fillStyle = "#c4b896";
  ctx.fillRect(x + 16 * S, y + 13.5 * S, 2 * S, 2 * S);
  ctx.fillStyle = "#3a3028";
  ctx.beginPath();
  ctx.arc(x + 7 * S, y + 5 * S, 3 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 14 * S, y + 5 * S, 3 * S, 0, Math.PI * 2);
  ctx.fill();
  const kx = x + 14 * S,
    ky = y + 5 * S;
  ctx.fillStyle = "#cbb8d8";
  ctx.beginPath();
  ctx.ellipse(kx, ky - 6 * S, 6 * S, 5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b8a2c8";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(kx, ky - 6 * S, 6 * S, 5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#a98fb8";
  ctx.beginPath();
  ctx.ellipse(kx, ky - 11 * S, 3 * S, 1.2 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(kx - 1 * S, ky - 13.5 * S, 2 * S, 2.5 * S);
  ctx.fillStyle = "#a98fb8";
  ctx.fillRect(kx - 9 * S, ky - 9 * S, 4 * S, 2 * S);
  ctx.strokeStyle = "#a98fb8";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.arc(kx, ky - 10 * S, 4.5 * S, 0.1 * Math.PI, 0.9 * Math.PI, true);
  ctx.stroke();
  const mt = performance.now() / 1000;
  ctx.strokeStyle = "rgba(203,184,216,0.6)";
  ctx.lineWidth = 1.2 * S;
  ctx.beginPath();
  ctx.moveTo(kx, ky - 16 * S);
  ctx.quadraticCurveTo(
    kx + Math.sin(mt * 0.7) * 1.5 * S,
    ky - 22 * S,
    kx,
    ky - 27 * S,
  );
  ctx.stroke();
  ctx.fillStyle = "#f3e6f0";
  ctx.fillRect(x + 1 * S, y - 5 * S, 5 * S, 5 * S);
  ctx.fillStyle = "#cbb8d8";
  ctx.fillRect(x + 1 * S, y - 5 * S, 5 * S, 1.5 * S);
}

function drawCounter(x, y, position) {
  const S = TILE_SIZE / 20;
  if (position !== "left") return;
  const w = TILE_SIZE * 2;
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 1 * S, y + 5 * S, w - 2 * S, TILE_SIZE - 5 * S);
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(x + 1 * S, y + 5 * S, w - 2 * S, 2 * S);
  ctx.strokeStyle = "rgba(125,100,82,0.5)";
  ctx.lineWidth = S * 0.8;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 8 * S);
  ctx.lineTo(x + w / 2, y + TILE_SIZE);
  ctx.stroke();
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x + 1 * S, y + 1 * S, w - 2 * S, 5 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x + 1 * S, y + 1 * S, w - 2 * S, 1.5 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.beginPath();
  ctx.ellipse(x + 12 * S, y - 9 * S, 9 * S, 5.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9c98a";
  ctx.beginPath();
  ctx.ellipse(x + 12 * S, y - 9 * S, 9 * S, 3.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5e86a";
  for (const [cx2, cy2, rx, ry, ang] of [
    [-4, 0, 2.2, 1.1, 0.2],
    [-1, -1.5, 1.8, 0.9, 0],
    [3, -0.5, 2.2, 1.1, -0.2],
    [0, 1.2, 1.8, 0.8, 0.1],
  ]) {
    ctx.beginPath();
    ctx.ellipse(
      x + 12 * S + cx2 * S,
      y - 9 * S + cy2 * S,
      rx * S,
      ry * S,
      ang,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.strokeStyle = "#a8a870";
  ctx.lineWidth = 1 * S;
  ctx.beginPath();
  ctx.ellipse(x + 12 * S, y - 9 * S, 9 * S, 3.5 * S, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(x + 26 * S, y - 13 * S, 8 * S, 9 * S);
  ctx.fillStyle = "#7a5228";
  ctx.fillRect(x + 26 * S, y - 13 * S, 8 * S, 1.8 * S);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(x + 27 * S, y - 10 * S, 6 * S, 1.8 * S);
  ctx.strokeStyle = "#3a2210";
  ctx.lineWidth = S * 0.7;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + (26 + i * 2.7) * S, y - 13 * S);
    ctx.lineTo(x + (26 + i * 2.7) * S, y - 4 * S);
    ctx.stroke();
  }
  ctx.fillStyle = "#9ca878";
  ctx.fillRect(x + 36 * S, y - 14 * S, 5 * S, 13 * S);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 36 * S, y - 14 * S, 5 * S, 2 * S);
  ctx.fillRect(x + 36 * S, y - 3 * S, 5 * S, 2 * S);
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(x + 36.7 * S, y - 16 * S, 3.5 * S, 2 * S);
}

function drawFridge(x, y) {
  const S = TILE_SIZE / 20,
    lift = 38 * S;
  ctx.fillStyle = "rgba(20,21,15,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2,
    y + TILE_SIZE - 1 * S,
    TILE_SIZE * 0.4,
    2 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#dbe0b0";
  ctx.fillRect(x + 2 * S, y + TILE_SIZE - lift, TILE_SIZE - 4 * S, lift);
  ctx.fillStyle = "#c9c98a";
  ctx.fillRect(x + 2 * S, y + TILE_SIZE - lift, TILE_SIZE - 4 * S, 2 * S);
  ctx.strokeStyle = "rgba(154,154,100,0.5)";
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(x + 2 * S, y + TILE_SIZE - lift * 0.62);
  ctx.lineTo(x + TILE_SIZE - 2 * S, y + TILE_SIZE - lift * 0.62);
  ctx.stroke();
  ctx.fillStyle = "#9a9a6a";
  ctx.fillRect(
    x + TILE_SIZE - 6 * S,
    y + TILE_SIZE - lift * 0.85,
    1.5 * S,
    6 * S,
  );
  ctx.fillRect(
    x + TILE_SIZE - 6 * S,
    y + TILE_SIZE - lift * 0.5,
    1.5 * S,
    8 * S,
  );
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + 4 * S, y + TILE_SIZE - lift + 3 * S, 2.5 * S, lift - 6 * S);
}

function drawToilet(x, y) {
  const S = TILE_SIZE / 20,
    lift = 16 * S;
  ctx.fillStyle = "#e8e8e0";
  ctx.fillRect(x + 4 * S, y - lift, TILE_SIZE - 8 * S, lift - 4 * S);
  ctx.fillStyle = "#d4d4c8";
  ctx.fillRect(x + 4 * S, y - lift, TILE_SIZE - 8 * S, 1.5 * S);
  ctx.fillStyle = "#f0f0e8";
  ctx.fillRect(x + 3 * S, y - lift - 1 * S, TILE_SIZE - 6 * S, 2 * S);
  ctx.fillStyle = "#e8e8e0";
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, y + 1 * S, 8 * S, 5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b8d4c8";
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, y + 2 * S, 5 * S, 3 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c8c8b8";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2,
    y + 1 * S,
    7.5 * S,
    4.5 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.fillStyle = "rgba(20,21,15,0.1)";
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, y + 6 * S, 7 * S, 2 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBathroomDoor(x, y) {
  const S = TILE_SIZE / 20;
  ctx.fillStyle = "#5a6e48";
  ctx.fillRect(x + 1 * S, y, TILE_SIZE - 2 * S, TILE_SIZE);
  ctx.fillStyle = "#7d8a5e";
  ctx.fillRect(x + 2.5 * S, y + 1 * S, TILE_SIZE - 5 * S, TILE_SIZE - 2 * S);
  ctx.fillStyle = "#9ca878";
  ctx.fillRect(x + 4 * S, y + 3 * S, TILE_SIZE - 8 * S, TILE_SIZE * 0.4);
  ctx.fillRect(
    x + 4 * S,
    y + TILE_SIZE * 0.5,
    TILE_SIZE - 8 * S,
    TILE_SIZE * 0.38,
  );
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + 4 * S, y + 3 * S, TILE_SIZE - 8 * S, 2 * S);
  ctx.fillStyle = "#aeb888";
  ctx.beginPath();
  ctx.moveTo(x + TILE_SIZE / 2, y + 8 * S);
  ctx.quadraticCurveTo(
    x + TILE_SIZE / 2 + 2.5 * S,
    y + 12 * S,
    x + TILE_SIZE / 2,
    y + 14 * S,
  );
  ctx.quadraticCurveTo(
    x + TILE_SIZE / 2 - 2.5 * S,
    y + 12 * S,
    x + TILE_SIZE / 2,
    y + 8 * S,
  );
  ctx.fill();
  ctx.fillStyle = "#f3eef7";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE - 6 * S, y + TILE_SIZE / 2, 1.6 * S, 0, Math.PI * 2);
  ctx.fill();
}

function drawBedsideOil(x, y) {
  const S = TILE_SIZE / 20,
    lift = 10 * S;
  ctx.fillStyle = "rgba(20,21,15,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x + TILE_SIZE / 2,
    y + TILE_SIZE - 3 * S,
    6 * S,
    1.5 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#7fc0a6";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 3 * S,
    y + TILE_SIZE - lift,
    6 * S,
    lift - 3 * S,
  );
  ctx.fillStyle = "#6aab92";
  ctx.fillRect(x + TILE_SIZE / 2 - 3 * S, y + TILE_SIZE - lift, 6 * S, 2 * S);
  ctx.fillStyle = "#46583a";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 1 * S,
    y + TILE_SIZE - lift - 4 * S,
    2 * S,
    4 * S,
  );
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 2 * S,
    y + TILE_SIZE - lift + 3 * S,
    1 * S,
    lift - 7 * S,
  );
}

function drawTub(x, y, isLeftHalf, isTopHalf) {
  const S = TILE_SIZE / 20;
  if (!isLeftHalf || !isTopHalf) return;
  const w = TILE_SIZE * 2,
    h = TILE_SIZE * 2;
  ctx.fillStyle = "#c5dcd2";
  ctx.fillRect(x + 1 * S, y + 2 * S, w - 2 * S, h - 2 * S);
  ctx.fillStyle = "#9ab8ae";
  ctx.fillRect(x + 1 * S, y + h - 4 * S, w - 2 * S, 4 * S);
  ctx.fillStyle = "#dceae3";
  ctx.fillRect(x + 1 * S, y + 2 * S, w - 2 * S, 4 * S);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(x + 2 * S, y + 2 * S, w - 4 * S, 1.5 * S);
  ctx.fillStyle = "#b8d4c8";
  ctx.fillRect(x + 5 * S, y + 7 * S, w - 10 * S, h - 14 * S);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x + 5 * S, y + 7 * S, w - 10 * S, 2.5 * S);
  const wt = performance.now() / 1000,
    ripple = Math.sin(wt * 1.2) * 0.5 * S;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = S * 0.8;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(
      x + 7 * S,
      y + (11 + i * 4) * S + (i % 2 === 0 ? ripple : -ripple),
    );
    ctx.lineTo(
      x + w - 7 * S,
      y + (11 + i * 4) * S + (i % 2 === 0 ? ripple : -ripple),
    );
    ctx.stroke();
  }
  ctx.fillStyle = "#7d9488";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h - 7 * S, 2 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b8d4c8";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h - 7 * S, 1 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a8c0b8";
  ctx.fillRect(x + w / 2 - 1.5 * S, y - 12 * S, 3 * S, 14 * S);
  ctx.fillStyle = "#9ab8ae";
  ctx.fillRect(x + w / 2 - 2 * S, y - 13 * S, 8 * S, 3 * S);
  ctx.fillStyle = "#7d9488";
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2 + 4 * S,
    y - 11.5 * S,
    4 * S,
    2.5 * S,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(184,212,200,0.7)";
  for (let i = 0; i < 4; i++) {
    const sx = x + w / 2 + 2 * S + i * 1.5 * S,
      sy = y - 8 * S + Math.sin(wt * 2 + i) * S;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8 * S, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#9ab8ae";
  for (const [lx, ly] of [
    [x + 3 * S, y + h - 3 * S],
    [x + w - 5 * S, y + h - 3 * S],
    [x + 4 * S, y + h - 2 * S],
    [x + w - 6 * S, y + h - 2 * S],
  ])
    ctx.fillRect(lx, ly, 3 * S, 3 * S);
}

function drawSink(x, y) {
  const S = TILE_SIZE / 20,
    lift = 16 * S;
  ctx.fillStyle = "#a8a8c0";
  ctx.fillRect(x + 6 * S, y - lift, TILE_SIZE - 12 * S, 7 * S);
  ctx.fillStyle = "#e8e8f3";
  ctx.fillRect(x + 7 * S, y - lift + 1 * S, TILE_SIZE - 14 * S, 5 * S);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(x + 7.5 * S, y - lift + 1.5 * S, 1.5 * S, 4 * S);
  ctx.fillStyle = "#e8e8e0";
  ctx.fillRect(x + 7 * S, y - 6 * S, TILE_SIZE - 14 * S, 8 * S);
  ctx.fillStyle = "#d4d4c8";
  ctx.fillRect(x + 7 * S, y - 6 * S, TILE_SIZE - 14 * S, 1.5 * S);
  ctx.fillStyle = "#c8c8ba";
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, y - 2 * S, 6 * S, 2.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a8a89c";
  ctx.fillRect(x + TILE_SIZE / 2 - 1 * S, y - 9 * S, 2 * S, 4 * S);
  ctx.fillStyle = "#d4d4c8";
  ctx.fillRect(x + TILE_SIZE / 2 - 2.5 * S, y + 2 * S, 5 * S, 6 * S);
}

function drawCabinet(x, y) {
  const S = TILE_SIZE / 20,
    lift = 24 * S;
  ctx.fillStyle = "#8a7060";
  ctx.fillRect(x + 1 * S, y - lift, TILE_SIZE - 2 * S, lift + 2 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(x + 2 * S, y - lift + 1 * S, TILE_SIZE - 4 * S, lift - 1 * S);
  ctx.strokeStyle = "rgba(154,125,106,0.6)";
  ctx.lineWidth = S * 0.8;
  ctx.strokeRect(
    x + 3.5 * S,
    y - lift + 2.5 * S,
    TILE_SIZE - 7 * S,
    lift - 5 * S,
  );
  const sY1 = y - lift + 4 * S,
    sY2 = y - lift + 12 * S,
    sY3 = y - lift + 19 * S;
  for (const sY of [sY1, sY2, sY3]) {
    ctx.fillStyle = "#d4c4b8";
    ctx.fillRect(x + 3 * S, sY, TILE_SIZE - 6 * S, 1.2 * S);
  }
  ctx.fillStyle = "#d9a9b5";
  ctx.fillRect(x + 4 * S, sY1 + 1.5 * S, 7 * S, 5 * S);
  ctx.fillStyle = "#e8c4d0";
  ctx.fillRect(x + 4 * S, sY1 + 1.5 * S, 7 * S, 1.2 * S);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(x + 4 * S, sY1 + 1.5 * S, 1.2 * S, 5 * S);
  ctx.fillStyle = "#b87090";
  ctx.fillRect(x + 6.5 * S, sY1 + 3 * S, 2 * S, 0.8 * S);
  ctx.fillRect(x + 7.1 * S, sY1 + 2.5 * S, 0.8 * S, 2 * S);
  ctx.fillStyle = "#7fc0a6";
  ctx.fillRect(x + 4 * S, sY2 + 1.5 * S, 10 * S, 5 * S);
  ctx.fillStyle = "#6aab92";
  ctx.fillRect(x + 4 * S, sY2 + 1.5 * S, 10 * S, 1.2 * S);
  ctx.strokeStyle = "#a8d0c0";
  ctx.lineWidth = S * 0.8;
  ctx.beginPath();
  ctx.moveTo(x + 14 * S, sY2 + 4 * S);
  ctx.quadraticCurveTo(x + 16 * S, sY2 + 6 * S, x + 15 * S, sY2 + 9 * S);
  ctx.stroke();
  ctx.fillStyle = "#f3e6f0";
  ctx.fillRect(x + 4 * S, sY3 + 1.5 * S, 5 * S, 6 * S);
  ctx.fillStyle = "#7fc0a6";
  ctx.fillRect(x + 4 * S, sY3 + 1.5 * S, 5 * S, 2 * S);
  ctx.fillStyle = "#c44569";
  ctx.fillRect(x + 10 * S, sY3 + 2.5 * S, 4 * S, 5 * S);
  ctx.fillStyle = "#e0719a";
  ctx.fillRect(x + 10 * S, sY3 + 2.5 * S, 4 * S, 1.5 * S);
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(x + TILE_SIZE - 5.5 * S, y - lift / 2 - 2 * S, 1.8 * S, 4 * S);
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + TILE_SIZE - 5.2 * S, y - lift / 2 - 2 * S, 0.8 * S, 4 * S);
}

function drawBathroomOil(x, y) {
  const S = TILE_SIZE / 20,
    lift = 12 * S;
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 4 * S, y + 1 * S, TILE_SIZE - 8 * S, 2.5 * S);
  ctx.fillStyle = "rgba(20,21,15,0.12)";
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, y + 1 * S, 5 * S, 1.2 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cbb8d8";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 3 * S,
    y + 1 * S - lift,
    6 * S,
    lift - 3 * S,
  );
  ctx.fillStyle = "#a98fb8";
  ctx.fillRect(x + TILE_SIZE / 2 - 3 * S, y + 1 * S - lift, 6 * S, 2 * S);
  ctx.fillStyle = "#46583a";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 1 * S,
    y + 1 * S - lift - 4 * S,
    2 * S,
    4 * S,
  );
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(
    x + TILE_SIZE / 2 - 2 * S,
    y + 1 * S - lift + 3 * S,
    1 * S,
    lift - 7 * S,
  );
}

function drawBench(x, y) {
  const S = TILE_SIZE / 20;
  const w = TILE_SIZE * 2;

  // shadow
  ctx.fillStyle = "rgba(20,21,15,0.12)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 22 * S, w * 0.38, 2 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs — four visible, properly positioned
  ctx.fillStyle = "#8a7060";
  ctx.fillRect(x + 4 * S, y + 13 * S, 2 * S, 9 * S);
  ctx.fillRect(x + w - 6 * S, y + 13 * S, 2 * S, 9 * S);
  ctx.fillRect(x + 4 * S, y + 6 * S, 2 * S, 5 * S);
  ctx.fillRect(x + w - 6 * S, y + 6 * S, 2 * S, 5 * S);

  // cross bar between legs
  ctx.fillStyle = "#7d6452";
  ctx.fillRect(x + 6 * S, y + 18 * S, w - 12 * S, 1.5 * S);

  // seat — three visible slats
  const slatY = y + 11 * S;
  const slatColors = ["#cdb6a4", "#c4ae9c", "#bba494"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = slatColors[i];
    ctx.fillRect(x + 2 * S, slatY + i * 2.2 * S, w - 4 * S, 1.8 * S);
    // slat highlight
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + 2 * S, slatY + i * 2.2 * S, w - 4 * S, 0.6 * S);
  }

  // backrest posts
  ctx.fillStyle = "#8a7060";
  ctx.fillRect(x + 4 * S, y + 1 * S, 2 * S, 11 * S);
  ctx.fillRect(x + w - 6 * S, y + 1 * S, 2 * S, 11 * S);

  // backrest — two slats
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(x + 2 * S, y + 2 * S, w - 4 * S, 1.8 * S);
  ctx.fillStyle = "#c4ae9c";
  ctx.fillRect(x + 2 * S, y + 5 * S, w - 4 * S, 1.8 * S);
  // highlights
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 2 * S, y + 2 * S, w - 4 * S, 0.6 * S);
  ctx.fillRect(x + 2 * S, y + 5 * S, w - 4 * S, 0.6 * S);

  // arm rests
  ctx.fillStyle = "#9a7d6a";
  ctx.fillRect(x + 2 * S, y + 8 * S, 4 * S, 1.5 * S);
  ctx.fillRect(x + w - 6 * S, y + 8 * S, 4 * S, 1.5 * S);
}

function drawTree(x, y) {
  const S = TILE_SIZE / 20,
    cx = x + TILE_SIZE / 2,
    baseY = y + TILE_SIZE - 4 * S;
  ctx.fillStyle = "rgba(140,190,165,0.4)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 1 * S, 10 * S, 2.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cdb6a4";
  ctx.fillRect(cx - 2.5 * S, baseY - 12 * S, 5 * S, 12 * S);
  ctx.fillStyle = "#b89c89";
  ctx.fillRect(cx - 2.5 * S, baseY - 12 * S, 1.5 * S, 12 * S);
  ctx.fillStyle = "#a9d4be";
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 17 * S, 14 * S, 12 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#bce0cd";
  ctx.beginPath();
  ctx.ellipse(cx - 7 * S, baseY - 21 * S, 8 * S, 6 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 7 * S, baseY - 21 * S, 8 * S, 6 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 26 * S, 7 * S, 6 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(140,190,165,0.4)";
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI * 2 * i) / 6;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(ang) * 9 * S,
      baseY - 17 * S + Math.sin(ang) * 7 * S,
      1.5 * S,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawPlant(x, y) {
  const S = TILE_SIZE / 20,
    stage = PLANT_STAGES[state.plantStage],
    cx = x + TILE_SIZE / 2,
    baseY = y + TILE_SIZE - 4 * S;
  const energy = state.started ? currentDay().energyLevel : 1,
    wilt = energy;
  const wiltColor =
    wilt < 0.5 ? `rgba(140,160,120,${0.6 + wilt * 0.4})` : stage.leafColor;
  ctx.fillStyle = "#e6d6e2";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 1 * S, 11 * S, 3 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = stage.potColor;
  ctx.beginPath();
  ctx.moveTo(cx - 10 * S, baseY - 9 * S);
  ctx.lineTo(cx + 10 * S, baseY - 9 * S);
  ctx.lineTo(cx + 8 * S, baseY);
  ctx.lineTo(cx - 8 * S, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(cx - 10 * S, baseY - 9 * S, 20 * S, 2.5 * S);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(cx - 8 * S, baseY - 6 * S);
  ctx.lineTo(cx - 5 * S, baseY - 6 * S);
  ctx.lineTo(cx - 6 * S, baseY);
  ctx.lineTo(cx - 8 * S, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#7a6052";
  ctx.fillRect(cx - 9 * S, baseY - 9 * S, 18 * S, 2 * S);
  const stemH = 13 * S * stage.size,
    stemLean = (1 - wilt) * 8 * S;
  ctx.strokeStyle = wiltColor;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 9 * S);
  ctx.quadraticCurveTo(
    cx + stemLean * 0.5,
    baseY - 9 * S - stemH * 0.5,
    cx + stemLean,
    baseY - 9 * S - stemH,
  );
  ctx.stroke();
  const stemTipX = cx + stemLean,
    stemTipY = baseY - 9 * S - stemH;
  const r = 13 * S * stage.size,
    wiltDroop = (1 - wilt) * r * 0.6,
    top = stemTipY - r * 0.6 * wilt,
    wiltAngle = (1 - wilt) * 0.7;
  const positions = [
    [0, -r * 0.2 + wiltDroop, r, r * 0.7],
    [-r * 0.6, r * 0.25 + wiltDroop, r * 0.55, r * 0.38],
    [r * 0.6, r * 0.25 + wiltDroop, r * 0.55, r * 0.38],
    [-r * 0.9, -r * 0.1 + wiltDroop * 0.5, r * 0.42, r * 0.3],
    [r * 0.9, -r * 0.1 + wiltDroop * 0.5, r * 0.42, r * 0.3],
  ];
  ctx.fillStyle = wiltColor;
  for (let i = 0; i < stage.leaves; i++) {
    const [dx, dy, rx, ry] = positions[i];
    const leafAngle = i === 0 ? 0 : i % 2 === 1 ? -wiltAngle : wiltAngle;
    ctx.beginPath();
    ctx.ellipse(stemTipX + dx, top + dy, rx, ry, leafAngle, 0, Math.PI * 2);
    ctx.fill();
  }
  if (wilt > 0.4) {
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = S;
    for (let i = 0; i < stage.leaves; i++) {
      const [dx, dy, rx] = positions[i];
      ctx.beginPath();
      ctx.moveTo(stemTipX + dx, top + dy - rx * 0.5);
      ctx.lineTo(stemTipX + dx, top + dy + rx * 0.5);
      ctx.stroke();
    }
  }
  if (stage.bloom && wilt > 0.5) {
    ctx.globalAlpha = Math.min(1, (wilt - 0.5) * 3);
    ctx.fillStyle = "#f3a6c1";
    for (let i = 0; i < 5; i++) {
      const ang = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(
        stemTipX + Math.cos(ang) * 3.5 * S,
        top - r * 0.5 + Math.sin(ang) * 3.5 * S,
        3 * S,
        2.2 * S,
        ang,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#fbd4e3";
    ctx.beginPath();
    ctx.arc(stemTipX, top - r * 0.5, 2 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(stemTipX - r * 0.7, top - r * 0.15, 2.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3a6c1";
    ctx.beginPath();
    ctx.arc(stemTipX - r * 0.7, top - r * 0.15, 1 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawFruitBowl(x, y) {
  const S = TILE_SIZE / 20;
  const cx = x + TILE_SIZE / 2;
  const baseY = y + TILE_SIZE - 6 * S;

  // bowl
  ctx.fillStyle = "#cdb6a4";
  ctx.beginPath();
  ctx.ellipse(cx, baseY, 11 * S, 4 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b89c89";
  ctx.beginPath();
  ctx.ellipse(cx, baseY, 11 * S, 2.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // apple (red)
  ctx.fillStyle = "#c44040";
  ctx.beginPath();
  ctx.arc(cx - 3 * S, baseY - 7 * S, 4 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a03030";
  ctx.lineWidth = S * 0.5;
  ctx.beginPath();
  ctx.arc(cx - 3 * S, baseY - 7 * S, 4 * S, 0.2, 0.8);
  ctx.stroke();
  ctx.strokeStyle = "#5a3a1a";
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * S, baseY - 11 * S);
  ctx.lineTo(cx - 2 * S, baseY - 13 * S);
  ctx.stroke();

  // orange
  ctx.fillStyle = "#e8842a";
  ctx.beginPath();
  ctx.arc(cx + 5 * S, baseY - 5 * S, 3.5 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c86820";
  ctx.lineWidth = S * 0.5;
  ctx.beginPath();
  ctx.arc(cx + 5 * S, baseY - 5 * S, 3.5 * S, 0, Math.PI * 2);
  ctx.stroke();

  // banana (yellow curve)
  ctx.strokeStyle = "#e8d44a";
  ctx.lineWidth = 3 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 8 * S, baseY - 10 * S);
  ctx.quadraticCurveTo(cx - 2 * S, baseY - 14 * S, cx + 2 * S, baseY - 10 * S);
  ctx.stroke();
  ctx.lineCap = "butt";

  // pineapple (yellow body, green top)
  ctx.fillStyle = "#e8c84a";
  ctx.beginPath();
  ctx.ellipse(cx + 1 * S, baseY - 10 * S, 2.5 * S, 4 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a7a3a";
  ctx.beginPath();
  ctx.moveTo(cx + 1 * S, baseY - 14 * S);
  ctx.lineTo(cx - 1 * S, baseY - 17 * S);
  ctx.moveTo(cx + 1 * S, baseY - 14 * S);
  ctx.lineTo(cx + 1 * S, baseY - 18 * S);
  ctx.moveTo(cx + 1 * S, baseY - 14 * S);
  ctx.lineTo(cx + 3 * S, baseY - 17 * S);
  ctx.stroke();
}

// CLUTTER
function drawClutter() {
  const S = TILE_SIZE / 20;
  if (state.scene === "room") {
    // hair tie on the floor near the bed
    ctx.strokeStyle = "rgba(217, 169, 181, 0.7)";
    ctx.lineWidth = 2 * S;
    ctx.beginPath();
    ctx.arc(
      11 * TILE_SIZE + 18 * S,
      6 * TILE_SIZE + 10 * S,
      3 * S,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    // small stack of folded laundry near the couch
    ctx.fillStyle = "#cbb8d8";
    ctx.fillRect(3 * TILE_SIZE + 5 * S, 5 * TILE_SIZE + 20 * S, 14 * S, 6 * S);
    ctx.fillStyle = "#b89cc4";
    ctx.fillRect(3 * TILE_SIZE + 5 * S, 5 * TILE_SIZE + 20 * S, 14 * S, 2 * S);
    // a single dropped sock near the bed
    ctx.fillStyle = "#9ca878";
    ctx.beginPath();
    ctx.ellipse(
      10 * TILE_SIZE + 6 * S,
      6 * TILE_SIZE + 26 * S,
      5 * S,
      2.5 * S,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // small framed photo leaning against the wall near the desk
    ctx.fillStyle = "#cdb6a4";
    ctx.fillRect(5 * TILE_SIZE + 2 * S, 2 * TILE_SIZE + 14 * S, 10 * S, 12 * S);
    ctx.fillStyle = "#e8e0f0";
    ctx.fillRect(5 * TILE_SIZE + 4 * S, 2 * TILE_SIZE + 16 * S, 6 * S, 8 * S);
    // period stain on bed — day 2 faint, day 3 most visible, fades day 4, gone day 5+
    const dayIdx = state.dayIndex;
    if (dayIdx >= 1 && dayIdx <= 3) {
      const opacity = dayIdx === 1 ? 0.55 : dayIdx === 2 ? 0.85 : 0.25;
      ctx.fillStyle = `rgba(180, 20, 40, ${opacity})`;
      ctx.beginPath();
      ctx.ellipse(
        11 * TILE_SIZE + TILE_SIZE,
        8 * TILE_SIZE + 10 * S,
        6 * S,
        4 * S,
        0.1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  if (state.scene === "bathroom") {
    ctx.fillStyle = "#a8c0b8";
    ctx.fillRect(1 * TILE_SIZE + 4 * S, 4 * TILE_SIZE + 2 * S, 18 * S, 6 * S);
    ctx.fillStyle = "#94aca4";
    ctx.fillRect(1 * TILE_SIZE + 4 * S, 4 * TILE_SIZE + 2 * S, 18 * S, 2 * S);
    ctx.fillStyle = "#cbb8d8";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(2 * TILE_SIZE, 4 * TILE_SIZE + 12 * S, 30 * S, 12 * S);
    ctx.globalAlpha = 1;
  }
  if (state.scene === "kitchen") {
    ctx.fillStyle = "#9ca878";
    ctx.fillRect(8 * TILE_SIZE + 2 * S, 3 * TILE_SIZE + 6 * S, 5 * S, 14 * S);
    ctx.fillStyle = "#8c9968";
    ctx.fillRect(8 * TILE_SIZE + 2 * S, 3 * TILE_SIZE + 6 * S, 5 * S, 3 * S);
    ctx.fillStyle = "#d9a9b5";
    ctx.fillRect(3 * TILE_SIZE + 4 * S, 24 * S, 8 * S, 6 * S);
    ctx.fillStyle = "#8ec6ae";
    ctx.beginPath();
    ctx.ellipse(3 * TILE_SIZE + 8 * S, 20 * S, 6 * S, 8 * S, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// PLAYER
function drawPlayer() {
  const { x, y, dir } = state.player;
  const S = TILE_SIZE / 20;
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
  const bobSpeed = 6 + energy * 10,
    bobAmount = (1 + energy * 1.5) * S;
  const t = performance.now() / (200 / bobSpeed);
  const bob = moving ? Math.sin(t) * bobAmount : 0;
  const walkFrame = moving ? (Math.sin(t) > 0 ? 1 : -1) : 0;
  const squish = 1 - (1 - energy) * 0.12;
  const w = PLAYER_SIZE,
    h = PLAYER_SIZE * squish,
    top = y + (PLAYER_SIZE - h) + bob;

  // skin tone shifts with energy — pale on day 2/3, normal on good days
  const skinBase =
    energy < 0.2
      ? { skin: "#ddc8a8", shadow: "#c4a888", blush: "rgba(200,120,140,0.2)" }
      : energy < 0.4
        ? {
            skin: "#e6d0b0",
            shadow: "#ccb090",
            blush: "rgba(220,140,160,0.28)",
          }
        : {
            skin: "#f0d9b8",
            shadow: "#dcc09e",
            blush: "rgba(243,166,193,0.38)",
          };

  const SKIN = skinBase.skin,
    SHADOW = skinBase.shadow,
    HAIR = "#1c1a16",
    DRESS = "#1c1a16";

  ctx.fillStyle = "rgba(20,21,15,0.22)";
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2,
    y + PLAYER_SIZE + 1 * S,
    w * 0.42,
    2.5 * S,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  const headD = w * 0.62,
    headX = x + (w - headD) / 2,
    headY = top - h * 0.22;
  const bodyTop = headY + headD * 0.86,
    bodyH = top + h - bodyTop,
    bodyW = w * 0.66,
    bodyX = x + (w - bodyW) / 2;
  const legW = bodyW * 0.3,
    legH = 4 * S,
    legOff = walkFrame * 1.2 * S;

  ctx.fillStyle = SKIN;
  ctx.fillRect(
    bodyX + bodyW * 0.14 + legOff,
    top + h - legH,
    legW,
    legH * 0.55,
  );
  ctx.fillRect(
    bodyX + bodyW - legW - bodyW * 0.14 - legOff,
    top + h - legH,
    legW,
    legH * 0.55,
  );
  ctx.fillStyle = HAIR;
  ctx.fillRect(
    bodyX + bodyW * 0.14 + legOff,
    top + h - legH * 0.45,
    legW,
    legH * 0.45,
  );
  ctx.fillRect(
    bodyX + bodyW - legW - bodyW * 0.14 - legOff,
    top + h - legH * 0.45,
    legW,
    legH * 0.45,
  );

  ctx.fillStyle = DRESS;
  ctx.beginPath();
  ctx.moveTo(bodyX + 2 * S, bodyTop);
  ctx.lineTo(bodyX + bodyW - 2 * S, bodyTop);
  ctx.lineTo(bodyX + bodyW, bodyTop + bodyH - legH * 0.4);
  ctx.lineTo(bodyX, bodyTop + bodyH - legH * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#100f0c";
  ctx.beginPath();
  ctx.moveTo(bodyX, bodyTop);
  ctx.lineTo(bodyX + 3 * S, bodyTop);
  ctx.lineTo(bodyX + 3 * S, bodyTop + bodyH - legH * 0.4);
  ctx.lineTo(bodyX, bodyTop + bodyH - legH * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = SKIN;
  ctx.fillRect(bodyX + bodyW * 0.5 - 2 * S, bodyTop, 4 * S, 1.5 * S);
  ctx.fillStyle = DRESS;
  ctx.fillRect(bodyX - 2 * S, bodyTop + 1 * S, 2.5 * S, bodyH * 0.5);
  ctx.fillRect(bodyX + bodyW - 0.5 * S, bodyTop + 1 * S, 2.5 * S, bodyH * 0.5);
  ctx.fillStyle = SKIN;
  ctx.fillRect(bodyX - 2 * S, bodyTop + 1 * S + bodyH * 0.5, 2.5 * S, 2 * S);
  ctx.fillRect(
    bodyX + bodyW - 0.5 * S,
    bodyTop + 1 * S + bodyH * 0.5,
    2.5 * S,
    2 * S,
  );

  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(headX + headD / 2, headY + headD / 2, headD / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SHADOW;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(
    headX + headD / 2,
    headY + headD * 0.8,
    headD * 0.4,
    headD * 0.16,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = HAIR;
  ctx.beginPath();
  ctx.arc(
    headX + headD / 2,
    headY + headD * 0.42,
    headD * 0.58,
    Math.PI,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillRect(
    headX - 1.5 * S,
    headY + headD * 0.15,
    headD * 0.26,
    headD * 0.78,
  );
  ctx.fillRect(
    headX + headD - headD * 0.26 + 1.5 * S,
    headY + headD * 0.15,
    headD * 0.26,
    headD * 0.78,
  );

  if (dir !== "up") {
    ctx.fillStyle = HAIR;
    ctx.fillRect(
      headX - 1 * S,
      headY + headD * 0.08,
      headD + 2 * S,
      headD * 0.28,
    );
    const fY = headY + headD * 0.36,
      fW = (headD + 2 * S) / 6;
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0)
        ctx.fillRect(headX - 1 * S + i * fW, fY, fW, headD * 0.05);
    }
    const eyeY = headY + headD * 0.52,
      eyeSize = 1.6 * S;
    ctx.fillStyle = HAIR;
    let e1x, e2x;
    if (dir === "down") {
      e1x = headX + headD * 0.28;
      e2x = headX + headD * 0.62;
    } else if (dir === "left") {
      e1x = headX + headD * 0.18;
      e2x = headX + headD * 0.38;
      ctx.fillStyle = SHADOW;
      ctx.fillRect(headX - 0.5 * S, eyeY + headD * 0.05, 1.2 * S, 1.5 * S);
      ctx.fillStyle = HAIR;
    } else {
      e1x = headX + headD * 0.52;
      e2x = headX + headD * 0.72;
      ctx.fillStyle = SHADOW;
      ctx.fillRect(
        headX + headD - 0.7 * S,
        eyeY + headD * 0.05,
        1.2 * S,
        1.5 * S,
      );
      ctx.fillStyle = HAIR;
    }
    ctx.fillRect(e1x, eyeY, eyeSize, eyeSize);
    ctx.fillRect(e2x, eyeY, eyeSize, eyeSize);

    // under-eye shading on low energy days
    if (energy < 0.4) {
      ctx.fillStyle = `rgba(80, 40, 60, ${0.18 + (0.4 - energy) * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(
        e1x + eyeSize / 2,
        eyeY + eyeSize + 1.2 * S,
        eyeSize * 0.9,
        eyeSize * 0.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        e2x + eyeSize / 2,
        eyeY + eyeSize + 1.2 * S,
        eyeSize * 0.9,
        eyeSize * 0.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.fillStyle = skinBase.blush;
    const br = headD * 0.07;
    if (dir === "down") {
      ctx.beginPath();
      ctx.arc(headX + headD * 0.18, eyeY + headD * 0.16, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headX + headD * 0.82, eyeY + headD * 0.16, br, 0, Math.PI * 2);
      ctx.fill();
    } else if (dir === "left") {
      ctx.beginPath();
      ctx.arc(headX + headD * 0.16, eyeY + headD * 0.16, br, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(headX + headD * 0.84, eyeY + headD * 0.16, br, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = HAIR;
    ctx.beginPath();
    ctx.arc(headX + headD / 2, headY + headD / 2, headD / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(
      headX - 1.5 * S,
      headY + headD * 0.15,
      headD * 0.26,
      headD * 0.85,
    );
    ctx.fillRect(
      headX + headD - headD * 0.26 + 1.5 * S,
      headY + headD * 0.15,
      headD * 0.26,
      headD * 0.85,
    );
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
  ctx.fillStyle = "rgba(20,21,15,1)";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
}

function drawTitleScreen() {
  const S = TILE_SIZE / 20;
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  const t = performance.now() / 1000;
  const petals = [
    [0.08, 0.12],
    [0.85, 0.18],
    [0.15, 0.55],
    [0.8, 0.62],
    [0.45, 0.1],
    [0.6, 0.42],
    [0.25, 0.85],
    [0.7, 0.85],
  ];
  ctx.fillStyle = "#4a6b58";
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < petals.length; i++) {
    const [pxF, pyF] = petals[i],
      drift = Math.sin(t * 0.6 + i) * 4 * S;
    ctx.beginPath();
    ctx.ellipse(
      pxF * LOGICAL_W,
      pyF * LOGICAL_H + drift,
      5 * S,
      3.5 * S,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const cx = LOGICAL_W / 2,
    cy = LOGICAL_H / 2 - 50 * S,
    sway = Math.sin(t * 0.8) * 3 * S;
  ctx.fillStyle = "#d9a9b5";
  ctx.fillRect(cx - 14 * S, cy + 20 * S, 28 * S, 15 * S);
  ctx.fillStyle = "#c98fa0";
  ctx.fillRect(cx - 14 * S, cy + 20 * S, 28 * S, 4 * S);
  ctx.strokeStyle = "#7fc0a6";
  ctx.lineWidth = 3 * S;
  ctx.beginPath();
  ctx.moveTo(cx + sway * 0.3, cy + 20 * S);
  ctx.quadraticCurveTo(cx + sway, cy, cx + sway * 0.5, cy - 20 * S);
  ctx.stroke();
  ctx.fillStyle = "#8ec6ae";
  ctx.beginPath();
  ctx.ellipse(
    cx - 18 * S + sway,
    cy + 6 * S,
    13 * S,
    7.5 * S,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    cx + 19 * S + sway,
    cy + 9 * S,
    13 * S,
    7.5 * S,
    0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#f3a6c1";
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(
      cx + sway * 0.5 + Math.cos(angle) * 9 * S,
      cy - 20 * S + Math.sin(angle) * 9 * S,
      6 * S,
      4.5 * S,
      angle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = "#fbd4e3";
  ctx.beginPath();
  ctx.arc(cx + sway * 0.5, cy - 20 * S, 4.5 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f6ecf5";
  ctx.font = `${16 * S}px PixelFont, monospace`;
  ctx.fillText("iron bloom", cx, LOGICAL_H / 2 + 44 * S);
  ctx.font = `${8 * S}px PixelFont, monospace`;
  ctx.fillStyle = "#cbb8d8";
  ctx.fillText(
    "water the plant. rest the body. repeat.",
    cx,
    LOGICAL_H / 2 + 70 * S,
  );
  ctx.fillStyle = "#9c8aac";
  if (Math.sin(t * 2) > 0)
    ctx.fillText("press any key or tap to begin", cx, LOGICAL_H - 16 * S);
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
  drawClutter();
  drawPlayer();
  drawTint();
  drawFade();
  ctx.restore();
}

let loopStarted = false;
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
function startLoop() {
  if (loopStarted) return;
  loopStarted = true;
  loop();
}
if (document.fonts && document.fonts.load) {
  document.fonts.load("10px PixelFont").then(startLoop).catch(startLoop);
  setTimeout(startLoop, 500);
} else {
  startLoop();
}
