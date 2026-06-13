// Tile legend (bedroom):
// 0 = floor   1 = wall   2 = bed (sleep -> next day)
// 3 = plant   4 = window 5 = door   6 = rug (decorative floor)
// 7 = mirror   9 = nightstand (iron pills)

// Tile legend (outside):
// 0 = grass   1 = hedge   5 = door (back inside)   8 = tree

export const TILE_SIZE = 20;
export const COLS = 16;
export const ROWS = 9;

export const ROOM = [
  [1, 7, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 5],
  [1, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const OUTSIDE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1],
];

// player's starting tile each day (bedroom)
export const START_POS = { col: 7, row: 4 };
// where the player appears in the outside scene
export const OUTSIDE_START = { col: 7, row: 2 };

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
    mirror: "you look back at yourself. okay, today.",
    nightstand:
      "the iron pills are on the nightstand. you take one with water. routine, mostly.",
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
    mirror: "a little pale, maybe. that's fine.",
    nightstand:
      "today it's harder to remember if you took it. you check the bottle. you did.",
    bedPrompt: "rest a while?",
    tendLines: [
      "reaching out takes a moment.",
      "...",
      "there. small, but something.",
    ],
    sleepLine: "some days just need to be gotten through.",
  },
  {
    label: "day three",
    energyLevel: 0.2,
    tint: "rgba(45, 36, 64, 0.45)",
    intro: "everything feels far away today.",
    window: "the world outside keeps going without you. that's fine.",
    door: "not today.",
    mirror: "you don't really look. that's okay too.",
    nightstand:
      "the bottle feels heavier than it looks today. you manage anyway.",
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
    mirror: "a little more color today.",
    nightstand:
      "one more day of this. it's starting to feel like just part of mornings.",
    bedPrompt: "rest when you need to.",
    tendLines: [
      "a little easier than yesterday.",
      "...",
      "the plant leans toward you.",
    ],
    sleepLine: "small returns count too.",
  },
  {
    label: "day five",
    energyLevel: 0.85,
    tint: "rgba(74, 59, 92, 0.06)",
    intro: "today feels lighter.",
    window: "the window is wide open.",
    door: "you open the door.",
    mirror: "there you are.",
    nightstand:
      "the bottle's getting low. you'll need a refill soon — but not today.",
    bedPrompt: "rest, when you're ready.",
    tendLines: ["it's grown, even through the hard days."],
    sleepLine:
      "however you moved through these days — that was enough. the bloom doesn't ask for more than you have.",
    isLast: true,
    outsideLine: "the air outside is cool and quiet. it's nice to be here.",
    outsideTint: "rgba(182, 216, 196, 0.18)",
  },
];

// plant growth visuals by stage (0-4)
export const PLANT_STAGES = [
  { potColor: "#d9a9b5", leafColor: "#b6d8c4", size: 0.6, leaves: 3 },
  { potColor: "#d9a9b5", leafColor: "#a9d4be", size: 0.75, leaves: 3 },
  { potColor: "#d9a9b5", leafColor: "#9ccdb6", size: 0.9, leaves: 4 },
  { potColor: "#d9a9b5", leafColor: "#8ec6ae", size: 1.05, leaves: 5 },
  {
    potColor: "#d9a9b5",
    leafColor: "#7fc0a6",
    size: 1.2,
    leaves: 5,
    bloom: true,
  },
];
