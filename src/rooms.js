// Tile legend (bedroom):
// 0 = floor   1 = wall   2 = bed (sleep -> next day)
// 3 = plant   4 = window 5 = door   6 = rug (decorative floor)
// 7 = mirror  9 = nightstand (iron pills)
// 10 = desk (left tile, monitor)  13 = desk (center tile, keyboard/tools)  17 = desk (right tile, electronics)
// 20 = couch (left)  21 = couch (right)  22 = coffee table (with books + incense)
// 23 = bathroom door  27 = essential oil bottle (bedside)  33 = kitchen door
// 35 = journal (on small table near desk)
// 36 = workbench left   37 = workbench right

// Tile legend (outside):
// 0 = grass   1 = hedge   5 = door (back inside)   8 = tree
// 39 = bench (outside, day 6 emotional endpoint)

export const TILE_SIZE = 32;
export const COLS = 16;
export const ROWS = 10;

// Tile legend (bathroom):
// 0 = floor   1 = wall   5 = door (back to bedroom)
// 24 = tub/shower   25 = sink   26 = cabinet   28 = essential oil (bathroom)   34 = toilet

export const ROOM = [
  [1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 7, 0, 0, 0, 35, 0, 0, 0, 0, 0, 0, 36, 37, 0, 1],
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
  [1, 24, 24, 0, 0, 0, 0, 0, 25, 0, 0, 26, 0, 0, 0, 1],
  [1, 24, 24, 0, 0, 0, 34, 0, 0, 28, 0, 0, 0, 0, 0, 1],
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
  [1, 0, 0, 0, 0, 0, 0, 39, 39, 0, 0, 8, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const START_POS = { col: 10, row: 7 };
// spawn below the bench so player faces up toward it
export const OUTSIDE_START = { col: 7, row: 7 };
export const BATHROOM_START = { col: 7, row: 4 };

export const KITCHEN = [
  [1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 38, 0, 1],
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

export const JOURNAL_ENTRIES = [
  {
    date: "day one",
    text: `starting to feel it today — that low hum under everything. nothing dramatic yet. just a feeling like my body's bracing for something.

i actually restocked the fruit bowl and grabbed fresh spinach and broccoli too. i genuinely love eating greens — i try to do it even when i'm not on my period, just because my body works better when i do. it's one of those things that's good for you and you actually want it, which feels rare.

i also bought a whole pineapple which i will absolutely not finish and i already know that. the chips are right there. the pineapple is a someday problem.

infusion is scheduled for a few days from now. they said my ferritin needs another bump. apparently a 4 isn't where a person's supposed to live. i looked it up. normal is 12 at minimum. i've been running on a 4.`,
  },
  {
    date: "day two",
    text: `the headache started before i even got out of bed. i know this one — it's the same thing wearing a different face. migraines and heavy periods, old friends.

i had coffee this morning out of habit and immediately regretted it. i know better. caffeine makes the cramps worse — something about vasoconstriction. i know this. i have known this. i had the coffee anyway. one cup. my uterus had opinions about that.

ate some spinach later, which helped in a small and unverifiable way. i love my greens even on bad days. they don't fix anything but they make me feel like i'm trying, which sometimes is enough.

skin looks washed out in the mirror. paler than usual. my doctor said chronic fatigue, heavy periods, the brain fog — all of it connects back to the same number. a 4.`,
  },
  {
    date: "day three",
    text: `i don't really want to write today. i'm writing anyway because not writing feels like letting today win completely.

this morning took everything out of me before it even started. if you've had a period like this you already know. i sat on the edge of the tub for a while, just breathing. that's all i'll say.

i look gray. not pale — gray. the anemia makes it worse. the body can't keep up when it's already running low on something as basic as iron.

i couldn't eat the greens today. couldn't eat much of anything. on most days i genuinely love that stuff — spinach, broccoli, all of it. today i just looked at it.

a few days until the infusion. i want the small things back. walking up stairs without stopping at the top. that kind of thing.`,
  },
  {
    date: "day four",
    text: `a little better. color's coming back, slowly, like a photo developing.

ate some spinach and an apple this morning. i know vitamin C helps absorb iron so i try to pair them — a habit i picked up after the diagnosis. i actually enjoy it. greens are not a punishment for me, they're just food i like.

the pineapple did not make it. i'm not going to pretend i'm surprised. i'll buy another one next week and probably do the exact same thing.

cramps are duller now. i skipped the coffee on purpose. felt proud of that. three more days.`,
  },
  {
    date: "day five",
    text: `today didn't feel like survival. it felt like a day. just a regular slightly tired day, which might be the nicest thing anyone could say about a tuesday in the middle of all this.

ate a proper meal without having to convince myself. greens, fruit, the whole thing. i genuinely love eating like this — i think people assume that eating well is a discipline thing but for me it mostly just feels good. on bad days i can't access it. on good days i can.

the workbench has been calling me all week. i haven't touched the project — something about the bad days makes it impossible to make things. my hands don't feel like mine. today they almost do.

two days until the infusion — just a few days after the worst of it. i keep thinking about how different next week might feel.`,
  },
  {
    date: "day six",
    text: `color's back. whole body feels like it belongs to me again instead of something i'm just renting for the week.

restocked the fruit bowl today. fresh spinach, an apple, broccoli. i love this stuff. i always have. there's something satisfying about having good food in the house when you actually want to eat it.

the pineapple was a loss. as predicted. i'll try again next week. the chips were necessary. both things can be true.

i worked on the project for a while this evening. just soldering, small things. it felt good to make something, even something unfinished.

the infusion is tomorrow — a few days after the worst of it passed, right on schedule. strange to look forward to a needle but here we are.

if you're reading this and you know this kind of week — i hope you know it ends. not because someone fixes it for you, but because you get through it. the same way i did. one unglamorous day at a time.`,
  },
];

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
    mirror:
      "you look back at yourself. okay, today. a little paler than usual — iron must be low again.",
    mirrorAgain:
      "you smile a little at your reflection. nothing dramatic. just a normal morning.",
    snacks:
      "chips and a small piece of chocolate. a normal day's small pleasure.",
    snacksAgain:
      "you're not really hungry. you just like having something to hold.",
    couch: "you sink into the couch for a minute, just because it's there.",
    couchAgain: "you could stay here a while longer. nowhere else to be.",
    tub: "a normal shower today. nothing more than that.",
    toilet: "everything looks normal in here. just a bathroom. just a tuesday.",
    toiletAgain: "nothing unusual. you're okay today.",
    fruitBowl:
      "an apple, an orange, a banana. you bought fruit this week with good intentions. the chips are right there though.",
    fruitBowlAgain: "still there. still mostly good.",
    sink: "you wash your hands. cold water first, then warm.",
    sinkAgain: "you splash some water on your face. wakes you up a little.",
    cabinet: "pads, a heating pad, the usual things. all where they should be.",
    cabinetAgain: "you check that everything's stocked. it is, for now.",
    oil: "a small bottle of essential oil sits by the sink. lavender. you dab a little on your wrist out of habit.",
    oilAgain: "the scent lingers a little after you wash your hands. nice.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    fridge:
      "you open it more out of habit than hunger. leftover rice, spinach you bought meaning to cook, a bottle of beet juice you keep meaning to finish. you close it. the spinach is still good — you actually love the stuff, you just need to remember it's there.",
    fridgeAgain: "still there. the spinach is starting to look at you.",
    nightstand:
      "ferrous sulfate, 325mg. one pill, with a full glass of water — not coffee, not tea. you take it. routine, mostly.",
    nightstandAgain:
      "the bottle is still mostly full. plenty of days left in it.",
    bedsideOil:
      "a small bottle on the nightstand, just for nights. you put a drop on your wrist before bed.",
    bedsideOilAgain: "lavender. it works, a little.",
    computer:
      "you turn on your computer. emails can wait, but you check anyway.",
    computerAgain:
      "you scroll for a minute, then close the tab. nothing urgent.",
    tea: "you put the kettle on. nettle tea today — you read somewhere it has iron in it. you're not sure if that's enough to matter, but it doesn't hurt.",
    teaAgain: "the tea's gone lukewarm. you drink it anyway.",
    diffuser: "you light the incense. lavender, faint, curling upward.",
    diffuserAgain:
      "the lavender has settled into the room now. you almost don't notice it anymore — that's how you know it's working.",
    windowAgain:
      "you look again. still warm. you let yourself enjoy it a second time.",
    workbench:
      "the project's half-finished on the bench. wires laid out, solder iron cool. you've been meaning to get back to it.",
    workbenchAgain:
      "you pick up a component, turn it over, set it back down. maybe later.",
    journal: "your journal. you haven't written yet today.",
    bedPrompt: "lie down and rest?",
    tendLines: [
      "someone once told you not to water plants on your period. you do it anyway. the plant seems fine.",
    ],
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
    mirror:
      "your face is pale in a way that has nothing to do with sleep. anemia does this — drains the color right out of you. you already knew that.",
    mirrorAgain:
      "your face looks tired in a way that has nothing to do with sleep. you look away.",
    snacks:
      "you reach for the chips without thinking. you're not even hungry — appetite's been gone since this morning. comfort on autopilot.",
    snacksAgain:
      "the chips are gone faster than you meant them to be. you barely tasted them.",
    couch:
      "the couch holds you a little too well today. it's hard to get back up.",
    couchAgain: "you pull a blanket over yourself without really deciding to.",
    tub: "third shower today. you don't want to think about why. the water helps, at least for a few minutes.",
    tubAgain:
      "you stay under until the water runs cool. you always clean up after yourself. you always do. it's exhausting, the cleaning up.",
    toilet:
      "you were in here longer than you wanted to be. it looks like something happened in here. it did.",
    toiletAgain: "still bad. that's just what this is today.",
    fruitBowl:
      "you grab the orange. it's easy, requires no cooking, no thinking.",
    fruitBowlAgain: "you eat it slowly. that's enough.",
    sink: "you wash your hands carefully. twice. the cold water helps, a little.",
    sinkAgain:
      "you wash them again, more out of habit than need. the routine is grounding.",
    cabinet:
      "you grab a fresh pad without really looking. you know exactly where they are.",
    cabinetAgain: "the heating pad catches your eye. maybe later, on the bed.",
    oil: "you rub a little oil into your temples. it doesn't fix the headache, but it helps the edges of it.",
    oilAgain: "the smell is grounding, somehow, even on a day like this.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen, a little slower than usual.",
    fridge:
      "the cold air feels good on your face for a second. you grab the beet juice — your ferritin's been low and you're supposed to drink it every day. it tastes like dirt. you drink half.",
    fridgeAgain:
      "you finish the other half standing at the counter. it's easier if you don't think about it.",
    nightstand:
      "you check the bottle — ferrous sulfate, 325mg. you think you took it today. you check again. yes. good. you drink some beet juice without sitting up all the way.",
    nightstandAgain:
      "you almost took a second pill by mistake. you didn't. close call.",
    bedsideOil:
      "you reach for the oil before lying down. it's part of the routine now.",
    bedsideOilAgain: "you breathe it in deliberately. it helps, a little.",
    computer:
      "the screen is too bright. you lower it and just sit with it for a while.",
    computerAgain:
      "you close the laptop. the brightness wasn't really the problem.",
    tea: "raspberry leaf tea. it actually helps with the cramps — something about the tannins. your mom used to make you drink red pepper and guava juice instead. you hated it then. you'd give anything for a glass of it now.",
    teaAgain: "you wrap both hands around the mug again, just for the warmth.",
    diffuser:
      "the smell helps more than you expected. a hot shower earlier helped too — your body still remembers the warmth.",
    diffuserAgain:
      "you breathe in deliberately this time. it helps, a little, to remember it's there.",
    windowAgain:
      "the bird is gone now. you watch the empty branch for a moment anyway.",
    workbench:
      "you look at the project from across the room. not today. your hands don't feel like yours right now.",
    workbenchAgain: "still not today.",
    journal: "you should write today. you probably won't.",
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
    energyLevel: 0.15,
    tint: "rgba(35, 38, 20, 0.5)",
    intro: "everything feels far away today.",
    window:
      "the world outside keeps going without you. that's fine. the light through the curtains is too much today, so you look away.",
    windowIdleLine:
      "even with your eyes half-closed, the shapes outside are gentle. blurred, but gentle.",
    door: "not today.",
    mirror:
      "you look gray. not pale — gray. like something's been leached out overnight. because it has. you already know what the number is. a 4.",
    mirrorAgain: "you still don't really look. that's twice now. it's fine.",
    snacks:
      "the chocolate sits unopened. you're not hungry. you haven't been hungry all day. your body just doesn't want anything right now.",
    snacksAgain:
      "you pick up the chocolate, turn it over once, and set it back down. not yet.",
    couch: "you don't mean to fall asleep here, but you do, for a while.",
    couchAgain: "still here. still tired. that's okay.",
    tub: "you sit on the floor of the shower for a while before you even turn the water on. second shower today. you always clean up. you don't always have the energy for it but you do it anyway.",
    tubAgain: "the water helps. getting back up after is its own small battle.",
    toilet:
      "it looks like a crime scene in here. if someone walked in right now you'd have to explain that you're fine, that this is just tuesday, that this is just your body doing what bodies do. you don't have to explain anything.",
    toiletAgain: "you're not going to look at the floor again.",
    fruitBowl:
      "you look at the fruit for a while. you don't have the energy. you close your hand around the banana and put it back.",
    fruitBowlAgain: "not today.",
    sink: "you wash your hands slowly. you lean against the sink for a moment after. just to rest.",
    sinkAgain:
      "you lean against the sink again. just a second. just to breathe.",
    cabinet:
      "you fumble for the pads without really looking. you know this drawer by feel by now.",
    cabinetAgain: "the heating pad. yes. that, today, for sure.",
    oil: "you press the bottle to your wrist but don't have the energy to do much else with it.",
    oilAgain: "you breathe it in anyway. small comfort, low effort.",
    bathroomDoor: "you step into the bathroom. it feels far away today.",
    kitchenDoor: "you step into the kitchen. it feels far away today.",
    fridge:
      "you open it and stand there. cold air on your face. you close it without taking anything.",
    fridgeAgain:
      "you don't have the energy to look for long. you close it again.",
    nightstand:
      "the ferrous sulfate bottle feels heavier than it looks. you take the pill. you don't bother with the beet juice today — you just can't.",
    nightstandAgain:
      "you stare at the bottle for a while before deciding you already took it today. you did. you think.",
    bedsideOil: "you barely manage to dab a little on before your eyes close.",
    bedsideOilAgain: "you breathe it in anyway. small comfort, low effort.",
    computer: "you don't open it today. that's okay.",
    computerAgain: "the screen stays dark. you didn't even try this time.",
    tea: "raspberry leaf tea, both hands around the mug, not moving. the cramps are a 7 today, maybe an 8. your ferritin was a 4 at your last blood test. the doctor said that explained a lot. you believe her now.",
    teaAgain: "the mug has gone cold in your hands. you didn't notice.",
    diffuser: "you turn it up. anything to soften the edges.",
    diffuserAgain: "you turn the dial up another notch. it can't hurt.",
    windowAgain:
      "you don't open your eyes fully this time. the light is still there, somewhere past your eyelids.",
    workbench: "you can't even look at it today.",
    workbenchAgain: "not today.",
    journal:
      "you really don't want to write today. you do it anyway, a little.",
    bedPrompt: "every part of you aches. just rest. that's enough.",
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
      "your eyes are a little puffy. you've been more emotional than usual — that's the iron, partly. the body gets depleted and everything sits closer to the surface.",
    mirrorAgain:
      "your eyes are less puffy than yesterday. small, but you notice.",
    snacks:
      "you eat the chocolate slowly. it actually helps a little, or maybe you just needed something sweet.",
    snacksAgain: "you eat slower this time. it's nice, actually, to taste it.",
    couch: "you sit up a little. not all the way. but a little.",
    couchAgain:
      "the incense is still burning. you watch the smoke for a while.",
    tub: "the shower today feels less like survival and more like care.",
    toilet: "a bit better today. it's just a bathroom again.",
    toiletAgain: "still okay. getting there.",
    fruitBowl:
      "you eat the apple slowly. it's cold and crisp and exactly what you wanted without knowing you wanted it.",
    fruitBowlAgain: "you eat a little more. it's a good day for it.",
    sink: "you wash your hands. look at yourself in the mirror above the sink for just a second. not bad.",
    sinkAgain: "you wash up quickly and feel almost normal about it.",
    tubAgain:
      "you actually wash your hair this time. someone once told you not to wash your hair on your period. you did it anyway. your hair is fine.",
    cabinet:
      "the supplies are running a little low. you make a mental note to restock soon.",
    cabinetAgain:
      "you reorganize the shelf a little, just to have something to do with your hands.",
    oil: "you put a little oil on, this time because you want to, not because you need to.",
    oilAgain: "it smells like a good day. or the start of one, anyway.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    fridge:
      "beet juice, leftover soup, a clementine, and the spinach you keep forgetting about. vitamin C helps absorb iron so you try to pair them when you remember. you actually love spinach — today you cook some with the soup.",
    fridgeAgain: "you find something easy to eat. that counts as a win today.",
    nightstand:
      "ferrous sulfate, water, done. you drink the beet juice too, the whole glass, without making a face. your mom would be proud.",
    nightstandAgain: "you remember without needing the reminder. that's new.",
    bedsideOil:
      "the lavender helps you settle, a little more than usual tonight.",
    bedsideOilAgain:
      "you breathe it in deliberately. it works better when you mean to.",
    computer:
      "a show plays quietly. you don't follow the plot, and that's fine too.",
    computerAgain:
      "you watch another few minutes. it's starting to make sense.",
    tea: "ginger tea. it helps with the nausea the iron pills sometimes bring.",
    teaAgain: "you make a second cup without really planning to.",
    diffuser: "still going. the room smells like rest.",
    diffuserAgain:
      "the smell is comforting now in a familiar way, like the room has a softer edge to it.",
    windowAgain: "the clouds have thinned a little more since you last looked.",
    workbench:
      "you sit down at the bench for a second. just to look. maybe tomorrow.",
    workbenchAgain:
      "you pick up the solder iron and hold it, then put it back down. almost.",
    journal: "you should catch up on the entries you missed.",
    bedPrompt: "rest when you need to.",
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
    mirror:
      "a small laugh at nothing. mood's all over today, and that's fine. you look more like yourself.",
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
    fruitBowl:
      "an apple and an orange. you eat standing at the counter, looking out the window. simple. good.",
    fruitBowlAgain: "you finish what's left. felt good.",
    sink: "you wash your hands, fix your hair in the mirror above the sink. almost normal.",
    sinkAgain: "you fix your hair a little more carefully than usual.",
    tubAgain: "you hum something under the water, half a melody.",
    cabinet:
      "everything's where it should be. you restocked yesterday without even meaning to.",
    cabinetAgain:
      "you close the cabinet and catch yourself smiling at nothing in particular.",
    oil: "you put a little oil on just because the bottle is pretty and the smell is nice.",
    oilAgain:
      "you'll need to buy more soon. that feels like a good problem to have.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    fridge:
      "you linger in front of it, deciding. beet juice, yes. maybe eggs. you feel like eggs.",
    fridgeAgain: "you grab what you came for this time.",
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
    tea: "nettle tea, properly steeped. it has more iron than you'd think for something that grows in a ditch.",
    teaAgain:
      "you finish the second cup slower, by the window, watching the light shift.",
    diffuser: "you refill the water. one more day of this, maybe.",
    diffuserAgain: "you think about refilling it before bed. you do.",
    windowAgain:
      "you crack it open a little further. the air feels good against the warmth of the room.",
    workbench:
      "you sit down at the bench. your hands feel like yours again. you work for a little while.",
    workbenchAgain: "the project's coming along. slowly, but along.",
    journal: "you write a proper entry today. it helps.",
    bedPrompt: "rest, when you're ready.",
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
    window: "the window is wide open. you can finally breathe.",
    windowIdleLine: "the air smells like outside. green, a little cold, alive.",
    door: "you step outside. the air hits you before anything else — cool and real and just slightly cold. it's nice to be out here.",
    mirror: "there you are. color's back. whole face.",
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
    fruitBowl:
      "you restock the bowl. fresh apple, orange, banana. the pineapple didn't make it, as expected. you'll try again next week.",
    fruitBowlAgain: "you eat a little while you restock. no ceremony needed.",
    sink: "you wash up quickly, look in the mirror. just yourself. plainly.",
    sinkAgain:
      "you glance in the mirror and just see yourself, without judgment.",
    tubAgain: "you towel off without thinking twice about any of it.",
    cabinet:
      "you'll need a few more pads before next month. you make a note and move on.",
    cabinetAgain:
      "everything in its place. it'll be ready, whenever it's needed again.",
    oil: "the oil bottle is almost empty. it carried you through the week, in its small way.",
    oilAgain:
      "you set it back down gently. you'll buy more before you need it.",
    bathroomDoor: "you step into the bathroom.",
    kitchenDoor: "you step into the kitchen.",
    fridge:
      "beet juice, almost gone. you finish it standing at the counter, looking out the window. it doesn't taste like dirt anymore. or maybe it does and you don't mind.",
    fridgeAgain:
      "mostly leftovers and a few things to restock. you make a mental list.",
    nightstand:
      "last pill of this cycle. ferrous sulfate, water, done. the infusion is tomorrow — a few days after the worst of it passed, right on schedule. you wonder what number you are now. higher, you think. you feel higher.",
    nightstandAgain:
      "you make a note to order more before next month. small errands feel possible again.",
    bedsideOil:
      "the bottle's nearly empty. it carried you through the week, same as everything else.",
    bedsideOilAgain:
      "you set it back down gently. you'll buy more before you need it.",
    computer: "you close a few tabs. nothing urgent left.",
    computerAgain:
      "you open something just for fun. not work. just because you want to.",
    tea: "tea by the open window. just tea. no reason behind it today.",
    teaAgain:
      "the tea's gone, but you keep holding the empty mug for a moment longer.",
    diffuser:
      "you let the incense burn out instead of lighting a new one. you don't need it today.",
    diffuserAgain: "you turn it off, this time without a second thought.",
    windowAgain:
      "you stand there a while longer, just looking. no reason to rush.",
    workbench:
      "you work on the project for a while this evening. just soldering, small things. it feels good to make something, even something unfinished.",
    workbenchAgain:
      "you leave it where it is. it'll be here when you come back.",
    journal: "you write the last entry. it feels like finishing something.",
    bedPrompt: "rest, when you're ready.",
    tendLines: [
      "it bloomed, even through all of it. you watered it on your period every day. turns out the plant didn't care.",
    ],
    sleepLine:
      "however you moved through these days — that was enough. the bloom doesn't ask for more than you have.",
    isLast: true,
    outsideLine:
      "the air outside is cool and quiet. there's a bench just ahead.",
    benchLine:
      "if you're reading this and you know this kind of week — i hope you know it ends. not because someone fixes it for you, but because you get through it. the same way i did. one unglamorous day at a time. you're not alone ♡",
    outsideTint: "rgba(182, 216, 196, 0.18)",
  },
];

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
