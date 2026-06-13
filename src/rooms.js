// Tile legend:
// 0 = floor   1 = wall   2 = bed (sleep -> next day)
// 3 = plant   4 = window 5 = door   6 = rug (decorative floor)

export const TILE_SIZE = 20;
export const COLS = 16;
export const ROWS = 9;

export const ROOM = [
  [1,1,1,1,1,1,1,4,4,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,6,6,6,6,0,0,0,0,0,0,1],
  [1,0,0,0,0,6,6,6,6,0,0,0,0,0,0,5],
  [1,0,0,0,0,6,6,6,6,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// player's starting tile each day
export const START_POS = { col: 7, row: 4 };

// energyLevel: 0 (lowest) to 1 (full) — affects move speed and
// how many "tend" presses the plant needs.
export const DAYS = [
  {
    label: "day one",
    energyLevel: 1,
    tint: "rgba(74, 59, 92, 0.0)",
    intro: "today feels okay.",
    window: "the light outside is warm. you don't have to go out to feel it.",
    door: "not yet. maybe later.",
    bedPrompt: "lie down and rest?",
    tendLines: ["the leaves shift a little."],
    sleepLine: "the day folds quietly into night.",
  },
  {
    label: "day two",
    energyLevel: 0.6,
    tint: "rgba(60, 48, 80, 0.22)",
    intro: "a little slower today. that's okay.",
    window: "the light is softer than yesterday.",
    door: "the door feels far away right now.",
    bedPrompt: "rest a while?",
    tendLines: ["reaching out takes a moment.", "...", "there. small, but something."],
    sleepLine: "some days just need to be gotten through.",
  },
  {
    label: "day three",
    energyLevel: 0.2,
    tint: "rgba(45, 36, 64, 0.45)",
    intro: "everything feels far away today.",
    window: "the world outside keeps going without you. that's fine.",
    door: "not today.",
    bedPrompt: "just rest. that's enough.",
    tendLines: ["...", "...", "...", "even just looking at it is something."],
    sleepLine: "low days don't undo the rest. they're just part of it.",
  },
  {
    label: "day four",
    energyLevel: 0.55,
    tint: "rgba(58, 46, 78, 0.25)",
    intro: "a bit more today. not full, but more.",
    window: "the light is coming back, slowly.",
    door: "maybe soon.",
    bedPrompt: "rest when you need to.",
    tendLines: ["a little easier than yesterday.", "...", "the plant leans toward you."],
    sleepLine: "small returns count too.",
  },
  {
    label: "day five",
    energyLevel: 0.85,
    tint: "rgba(74, 59, 92, 0.06)",
    intro: "today feels lighter.",
    window: "the window is wide open.",
    door: "the door doesn't feel so far today.",
    bedPrompt: "rest, when you're ready.",
    tendLines: ["it's grown, even through the hard days."],
    sleepLine: "however you moved through these days — that was enough. the bloom doesn't ask for more than you have.",
    isLast: true,
  },
];

// plant growth visuals by stage (0-4)
export const PLANT_STAGES = [
  { potColor: "#d9a9b5", leafColor: "#b6d8c4", size: 0.6 },
  { potColor: "#d9a9b5", leafColor: "#a9d4be", size: 0.75 },
  { potColor: "#d9a9b5", leafColor: "#9ccdb6", size: 0.9 },
  { potColor: "#d9a9b5", leafColor: "#8ec6ae", size: 1.05 },
  { potColor: "#d9a9b5", leafColor: "#7fc0a6", size: 1.2, bloom: true },
];
