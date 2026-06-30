// Tile legend (bedroom):
// 0 = floor   1 = wall   2 = bed (sleep -> next day)
// 3 = plant   4 = window 5 = door   6 = rug (decorative floor)
// 7 = mirror  9 = nightstand (iron pills)
// 10 = desk (left tile, monitor)  13 = desk (center tile, keyboard/tools)  17 = desk (right tile, electronics)
// 11 = (removed, now in kitchen)  16/18 = (removed, now in kitchen)
// 20 = couch (left)  21 = couch (right)  22 = coffee table (with books + incense)
// 23 = bathroom door  27 = essential oil bottle (bedside)  33 = kitchen door

// Tile legend (outside):
// 0 = grass   1 = hedge   5 = door (back inside)   8 = tree

export const TILE_SIZE = 32;
export const COLS = 16;
export const ROWS = 10;

// Tile legend (bathroom):
// 0 = floor   1 = wall   5 = door (back to bedroom)
// 24 = tub/shower   25 = sink   26 = cabinet   28 = essential oil (bathroom)

export const ROOM = [
  [1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
  [1, 0, 0, 0, 0, 0, 10, 13, 17, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [1, 0, 20, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 6, 6, 0, 0, 0, 0, 0, 0, 0, 2, 2, 9, 0, 23],
  [1, 0, 6, 6, 0, 0, 22, 22, 0, 0, 0, 2, 2, 27, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33],
];

export const BATHROOM = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 1],
  [1, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 1],
  [1, 24, 24, 0, 0, 0, 34, 0, 25, 28, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const START_POS = { col: 10, row: 7 };
export const OUTSIDE_START = { col: 6, row: 7 };
export const BATHROOM_START = { col: 6, row: 4 };

export const KITCHEN = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 0, 0, 1],
  [1, 29, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 30, 32, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
export const KITCHEN_START = { col: 6, row: 4 };

export const DAYS = [
  {
    label: "day one",
    energyLevel: 1.0,
    tint: "rgba(40, 45, 25, 0.0)",
    intro: "today feels okay. something feels a little off, but okay.",
    window: "the light outside is warm. you don't have to go out to feel it.",
    windowIdleLine:
      "dust drifts slowly through the light. you watch it for a while.",
    door: "not yet. maybe later.",
    mirror: "you look back at yourself. okay, today.",
    snacks:
      "chips and a small piece of chocolate. a normal day's small pleasure.",
    couch: "you sink into the couch for a minute, just because it's there.",
    couchAgain: "you could stay here a while longer. nowhere else to be.",
    tub: "a normal shower today. nothing more than that.",
    toilet: "everything looks normal in here. just a bathroom. just a tuesday.",
    toiletAgain: "you wash your hands twice without thinking about it.",
    tubAgain:
      "the water's still warm. you stay a minute longer than you need to.",
    sink: "you splash some water on your face. wakes you up a little.",
    sinkAgain:
      "you catch your reflection in the little mirror above the sink and look away.",
    cabinet: "pads, a heating pad, the usual things. all where they should be.",
    cabinetAgain: "you check that everything's stocked. it is, for now.",
    oil: "a small bottle of essential oil sits by the sink. lavender. you dab a little on your wrist out of habit.",
    oilAgain: "the scent lingers a little after you wash your hands. nice.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    fridge: "you open it more out of habit than hunger, then close it again.",
    nightstand:
      "ferrous sulfate, 325mg. one pill, with a full glass of water — not coffee, not tea, the bottle says water. you take it. routine, mostly. the beet juice beside it is almost untouched.",
    nightstandAgain:
      "the bottle is still mostly full. at least a few weeks left.",
    bedsideOil:
      "a small bottle on the nightstand, just for nights. you put a drop on your wrist before bed.",
    bedsideOilAgain: "lavender. it works, a little.",
    computer:
      "you turn on your computer. emails can wait, but you check anyway.",
    computerAgain:
      "you scroll for a minute, then close the tab. nothing urgent.",
    tea: "you make tea, mostly out of habit.",
    teaAgain: "the tea's gone lukewarm. you drink it anyway.",
    diffuser: "you light the incense. lavender, faint, curling upward.",
    diffuserAgain:
      "the lavender has settled into the room now. you almost don't notice it anymore — that's how you know it's working.",
    windowAgain:
      "you look again. still warm. you let yourself enjoy it a second time.",
    mirrorAgain:
      "you smile a little at your reflection. nothing dramatic. just a normal morning.",
    snacksAgain:
      "you're not really hungry. you just like having something to hold.",
    // kitchen
    fridge:
      "you open it more out of habit than hunger. leftover rice, half a lemon, a bottle of beet juice you keep meaning to finish. you close it.",
    fridgeAgain: "still there. still not hungry enough.",
    snacks:
      "chips and a small piece of chocolate. a normal day's small pleasure.",
    snacksAgain:
      "you're not really hungry. you just like having something to hold.",
    tea: "you put the kettle on. nettle tea today — you read somewhere it has iron in it. you're not sure if that's enough to matter, but it doesn't hurt.",
    teaAgain: "the tea's gone lukewarm. you drink it anyway.",
    bedPrompt: "lie down and rest?",
    // plant — day 1: one press, easy
    tendLines: ["you water it a little. it seems to like that."],
    sleepLine: "the day folds quietly into night.",
  },
  {
    label: "day two",
    energyLevel: 0.35,
    tint: "rgba(45, 50, 28, 0.32)",
    intro:
      "everything is slower today. your whole body aches, and getting up takes longer than it should.",
    window:
      "the light is softer than yesterday. even so, it presses behind your eyes a little. a headache, building.",
    windowIdleLine: "a bird passes by outside, unbothered. you watch it go.",
    door: "the door feels far away right now.",
    mirror: "tears come out of nowhere. you let them. it passes.",
    snacks: "you reach for the chips without thinking. comfort on autopilot.",
    snacksAgain: "the chips are gone faster than you meant them to be.",
    couch:
      "the couch holds you a little too well today. it's hard to get back up.",
    couchAgain: "you pull a blanket over yourself without really deciding to.",
    tub: "a hot shower, longer than usual. your body needed it.",
    toilet:
      "the bathroom floor has a few wrappers on it. evidence of this morning. you leave them for now.",
    toiletAgain: "you'll clean it up later. probably.",
    tubAgain: "you stay under the water until it starts to run cool.",
    sink: "you change quickly. it's easier to keep this part short today.",
    sinkAgain: "you wash your hands again, more out of habit than need.",
    cabinet:
      "you grab a fresh pad without really looking. you know exactly where they are.",
    cabinetAgain: "the heating pad catches your eye. maybe later, on the bed.",
    oil: "you rub a little oil into your temples. it doesn't fix the headache, but it helps the edges of it.",
    oilAgain: "the smell is grounding, somehow, even on a day like this.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen, a little slower than usual.",
    nightstand:
      "you check the bottle — ferrous sulfate, 325mg. you took it yesterday. you think you took it today. you check again. yes. good. the beet juice is on the nightstand too. you drink some without sitting up all the way.",
    nightstandAgain:
      "you almost took a second pill by mistake. you didn't. close call.",
    bedsideOil:
      "you reach for the oil before lying down. it's part of the routine now.",
    bedsideOilAgain: "you breathe it in deliberately. it helps, a little.",
    computer:
      "the screen is too bright. you lower it and just sit with it for a while.",
    computerAgain:
      "you close the laptop. the brightness wasn't really the problem.",
    // kitchen
    fridge:
      "the cold air feels good on your face for a second. you grab the beet juice — your ferritin's been low and you're supposed to drink it every day. it tastes like dirt. you drink half.",
    fridgeAgain:
      "you finish the other half standing at the counter. it's easier if you don't think about it.",
    tea: "raspberry leaf tea. it actually helps with the cramps — something about the tannins relaxing the uterus. your mom used to make you drink red pepper and guava juice instead. you hated it then. you'd give anything for a glass of it now.",
    teaAgain: "you wrap both hands around the mug again, just for the warmth.",
    diffuser:
      "the smell helps more than you expected. a hot shower earlier helped too — your body still remembers the warmth.",
    diffuserAgain:
      "you breathe in deliberately this time. it helps, a little, to remember it's there.",
    windowAgain:
      "the bird is gone now. you watch the empty branch for a moment anyway.",
    mirrorAgain:
      "your face looks tired in a way that has nothing to do with sleep.",
    bedPrompt: "rest a while?",
    // plant — day 2: three presses, heavier
    tendLines: [
      "reaching out takes a moment.",
      "...",
      "there. small, but something.",
    ],
    sleepLine: "some days just need to be gotten through.",
  },
  {
    label: "day three",
    energyLevel: 0.15,
    tint: "rgba(35, 38, 20, 0.5)",
    intro: "everything feels far away today.",
    window:
      "the world outside keeps going without you. that's fine. the light through the curtains is too much today, so you look away.",
    windowIdleLine:
      "even with your eyes half-closed, the shapes outside are gentle. blurred, but gentle.",
    door: "not today.",
    mirror: "you don't really look. that's okay too.",
    mirrorAgain: "you still don't look. that's twice now. it's fine.",
    snacks: "the chocolate sits unopened. maybe later. probably later.",
    snacksAgain:
      "you pick up the chocolate, turn it over once, and set it back down.",
    couch: "you don't mean to fall asleep here, but you do, for a while.",
    couchAgain: "still here. still tired. that's okay.",
    tub: "you sit on the floor of the shower for a while before you even turn the water on.",
    toilet:
      "it looks like something happened in here. it did. you happened in here. that's allowed.",
    toiletAgain: "you look at the floor and then decide not to.",
    tubAgain:
      "the water helps, but standing back up after is its own small battle.",
    sink: "changing today takes longer than it should. every part of you aches.",
    sinkAgain: "you lean against the sink for a moment, just to rest.",
    cabinet:
      "you fumble for the pads without really looking. you know this drawer by feel by now.",
    cabinetAgain: "the heating pad. yes. that, today, for sure.",
    oil: "you press the bottle to your wrist but don't have the energy to do much else with it.",
    oilAgain: "you breathe it in anyway. small comfort, low effort.",
    bathroomDoor: "you step into the bathroom. it feels far away today.",
    kitchenDoor: "you step into the kitchen. it feels far away today.",
    nightstand:
      "the ferrous sulfate bottle feels heavier than it looks. you take the pill. you don't bother with the beet juice today — you can't. you just can't.",
    nightstandAgain:
      "you stare at the bottle for a while before deciding you already took it today. you did. you think.",
    bedsideOil: "you barely manage to dab a little on before your eyes close.",
    bedsideOilAgain: "you breathe it in anyway. small comfort, low effort.",
    computer: "you don't open it today. that's okay.",
    computerAgain: "the screen stays dark. you didn't even try this time.",
    // kitchen
    fridge:
      "you open it and stand there. cold air on your face. you close it without taking anything.",
    fridgeAgain:
      "you don't have the energy to look for long. you close it again.",
    tea: "raspberry leaf tea, both hands around the mug, not moving. the cramps are a 7 today, maybe an 8. your ferritin was a 4 at your last blood test. a 4. the doctor said that explained a lot. you believe her now.",
    teaAgain: "the mug has gone cold in your hands. you didn't notice.",
    diffuser: "you turn it up. anything to soften the edges.",
    diffuserAgain: "you turn the dial up another notch. it can't hurt.",
    windowAgain:
      "you don't open your eyes fully this time. the light is still there, somewhere past your eyelids.",
    bedPrompt: "every part of you aches. just rest. that's enough.",
    // plant — day 3: five presses, mostly silence — costs the most
    tendLines: [
      "...",
      "...",
      "you stand in front of it for a while.",
      "...",
      "even just looking counts. you decide that.",
    ],
    sleepLine: "low days don't undo the rest. they're just part of it.",
  },
  {
    label: "day four",
    energyLevel: 0.3,
    tint: "rgba(42, 47, 26, 0.4)",
    intro: "still low, but maybe — maybe — a little less than yesterday.",
    window: "the light is coming back, slowly.",
    windowIdleLine:
      "the clouds shift. for a moment, more light. then less. then more again.",
    door: "maybe soon.",
    mirror:
      "your eyes are a little puffy. you've been more emotional than usual — that's part of this too.",
    mirrorAgain:
      "your eyes are less puffy than yesterday. small, but you notice.",
    snacks:
      "you eat the chocolate slowly. it actually helps a little, or maybe you just needed something sweet.",
    snacksAgain: "you eat slower this time. it's nice, actually, to taste it.",
    couch: "you sit up a little. not all the way. but a little.",
    couchAgain:
      "the incense is still burning. you watch the smoke for a while.",
    tub: "the shower today feels less like survival and more like care.",
    toilet: "a bit better today. you pick up the wrapper from yesterday.",
    toiletAgain: "small cleanup. it counts.",
    tubAgain: "you actually wash your hair this time. small milestone.",
    sink: "changing is easier today. less bracing for it.",
    sinkAgain: "you look at yourself for a second longer than usual. not bad.",
    cabinet:
      "the supplies are running a little low. you make a mental note to restock soon.",
    cabinetAgain:
      "you reorganize the shelf a little, just to have something to do with your hands.",
    oil: "you put a little oil on, this time because you want to, not because you need to.",
    oilAgain: "it smells like a good day. or the start of one, anyway.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    nightstand:
      "ferrous sulfate, water, done. you drink the beet juice too, the whole glass, without making a face. your mom would be proud. you text her later, maybe.",
    nightstandAgain: "you remember without needing the reminder. that's new.",
    bedsideOil:
      "the lavender helps you settle, a little more than usual tonight.",
    bedsideOilAgain:
      "you breathe it in deliberately. it works better when you mean to.",
    computer:
      "a show plays quietly. you don't follow the plot, and that's fine too.",
    computerAgain:
      "you watch another few minutes. it's starting to make sense.",
    // kitchen
    fridge:
      "beet juice, leftover soup, a clementine. your body wants the clementine — vitamin C helps absorb the iron, you read that once. you eat it standing at the counter.",
    fridgeAgain: "you find something easy to eat. that counts as a win today.",
    tea: "ginger tea. it helps with the nausea the iron pills sometimes bring. not today, but you make it anyway, just in case.",
    teaAgain: "you make a second cup without really planning to.",
    diffuser: "still going. the room smells like rest.",
    diffuserAgain:
      "the smell is comforting now in a familiar way, like the room has a softer edge to it.",
    windowAgain: "the clouds have thinned a little more since you last looked.",
    bedPrompt: "rest when you need to.",
    // plant — day 4: three presses, tentative
    tendLines: [
      "...",
      "a little water. carefully.",
      "it's still here. so are you.",
    ],
    sleepLine: "small returns count too.",
  },
  {
    label: "day five",
    energyLevel: 0.55,
    tint: "rgba(48, 53, 30, 0.22)",
    intro:
      "a bit more today. emotions feel close to the surface, but the days are turning.",
    window: "the window's open a crack. fresh air, a little.",
    windowIdleLine:
      "a breeze moves the curtain. you feel it before you see it.",
    door: "almost ready.",
    mirror: "a small laugh at nothing. mood's all over today, and that's fine.",
    mirrorAgain:
      "you catch yourself smiling again, for no clear reason. you let it happen.",
    snacks:
      "you grab a handful of chips and eat them standing up. no reason. just hungry.",
    snacksAgain:
      "you eat without really thinking about why. just because it's there, and you want it.",
    couch:
      "you curl up with one of the books, even if you don't end up reading much of it.",
    couchAgain: "you read a few more pages this time. small progress.",
    tub: "a longer shower today, no real reason. it just felt good to stand there.",
    toilet: "mostly clean in here now. you feel okay about it.",
    toiletAgain: "you wipe down the counter while you're here. might as well.",
    tubAgain: "you hum something under the water, half a melody.",
    sink: "changing is just changing today. ordinary. no ceremony to it.",
    sinkAgain:
      "you fix your hair in the mirror, a little more carefully than usual.",
    cabinet:
      "everything's where it should be. you restocked yesterday without even meaning to.",
    cabinetAgain:
      "you close the cabinet and catch yourself smiling at nothing in particular.",
    oil: "you put a little oil on just because the bottle is pretty and the smell is nice.",
    oilAgain:
      "you'll need to buy more soon. that feels like a good problem to have.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    nightstand:
      "one more day of iron pills. you take it with the beet juice without thinking twice. it's just morning now.",
    nightstandAgain:
      "you count what's left in the bottle. enough. more than enough.",
    bedsideOil:
      "you take a moment with it tonight, breathing it in slowly before bed.",
    bedsideOilAgain: "you think about buying the bigger bottle next time.",
    computer: "you reply to one message. small, but done.",
    computerAgain:
      "you open a new tab just to see what's there. curiosity, for once.",
    // kitchen
    fridge:
      "you linger in front of it, deciding. beet juice, yes. maybe eggs. you feel like eggs.",
    fridgeAgain: "you grab what you came for this time.",
    tea: "nettle tea, properly steeped this time. it has more iron than you'd think for something that grows in a ditch. you read that and thought of your grandmother, who made you drink things from the yard growing up.",
    teaAgain:
      "you finish the second cup slower, by the window, watching the light shift.",
    diffuser: "you refill the water. one more day of this, maybe.",
    diffuserAgain: "you think about refilling it before bed. you do.",
    windowAgain:
      "you crack it open a little further. the air feels good against the warmth of the room.",
    bedPrompt: "rest, when you're ready.",
    // plant — day 5: two presses, warmer
    tendLines: [
      "you tend to it properly today.",
      "it leans toward you a little, you think.",
    ],
    sleepLine: "however you felt today — all of it — was allowed.",
  },
  {
    label: "day six",
    energyLevel: 0.85,
    tint: "rgba(40, 45, 25, 0.06)",
    intro: "today feels lighter.",
    window: "the window is wide open.",
    windowIdleLine: "the air smells like outside. green, a little cold, alive.",
    door: "you open the door.",
    mirror: "there you are.",
    mirrorAgain:
      "you look a little longer this time. it's a good kind of looking.",
    snacks:
      "the snack bowl is almost empty. you made it through the week, one small thing at a time.",
    snacksAgain:
      "the bowl really is almost empty now. you'll restock, eventually.",
    couch:
      "you sit properly today, book open, incense lit, nowhere you need to rush off to.",
    couchAgain: "this is a good place to end the day. quiet. yours.",
    tub: "a quick shower, easy, unremarkable. that's its own kind of good.",
    toilet: "the bathroom is just a bathroom again. back to normal, for now.",
    toiletAgain: "you look around and feel quietly satisfied. it all adds up.",
    tubAgain: "you towel off without thinking twice about any of it.",
    sink: "changing is just changing. no thought required. you're back to that.",
    sinkAgain:
      "you glance in the mirror and just see yourself, plainly, without judgment.",
    cabinet:
      "you'll need a few more pads before next month. you make a note and move on.",
    cabinetAgain:
      "everything in its place. it'll be ready, whenever it's needed again.",
    oil: "the oil bottle is almost empty. it carried you through the week, in its small way.",
    oilAgain:
      "you set it back down gently. you'll buy more before you need it.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    nightstand:
      "last pill of this cycle. ferrous sulfate, water, done. you'll get your levels checked again next month. a 4 was where you started. you wonder what number you are now. higher, you think. you feel higher.",
    nightstandAgain:
      "you make a note to order more before next month. small errands feel possible again.",
    bedsideOil:
      "the bottle's nearly empty. it carried you through the week, same as everything else.",
    bedsideOilAgain:
      "you set it back down gently. you'll buy more before you need it.",
    computer: "you close a few tabs. nothing urgent left.",
    computerAgain:
      "you open something just for fun. not work. just because you want to.",
    // kitchen
    fridge:
      "beet juice, almost gone. you finish it standing at the counter, looking out the window. it doesn't taste like dirt anymore. or maybe it does and you don't mind.",
    fridgeAgain:
      "mostly leftovers and a few things to restock. you make a mental list.",
    tea: "tea by the open window. just tea. no reason behind it today.",
    teaAgain:
      "the tea's gone, but you keep holding the empty mug for a moment longer.",
    diffuser:
      "you let the incense burn out instead of lighting a new one. you don't need it today — but you might tomorrow, and that's fine.",
    diffuserAgain: "you turn it off, this time without a second thought.",
    windowAgain:
      "you stand there a while longer, just looking. no reason to rush.",
    bedPrompt: "rest, when you're ready.",
    // plant — day 6: one press, quiet and earned
    tendLines: ["it bloomed, even through all of it."],
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
