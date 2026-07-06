# iron bloom

> _water the plant. rest the body. repeat._

A short cozy RPG about six days inside a body that fights you every month. Walk slowly on the bad days. Tend the plant. Read the journal. Go outside when you're ready.

Made with vanilla JavaScript and Vite. No dependencies, no frameworks, no engine.

**tags:** `womens-health` `menstrual-health` `anemia` `chronic-illness` `mental-health` `cozy-game` `game-poem` `pixel-art` `accessibility` `personal`

---

## screenshots

|                                                      |                                                  |                                                                |
| ---------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| ![title screen](/public/screenshots/01-title.png)    | ![day one — the bedroom](/public/screenshots/02-room.png) | ![the journal](/public/screenshots/03-journal.png)    |
| ![day three — the bathroom](/public/screenshots/04-broom.png)   | ![the workbench](/public/screenshots/05-kitchen.png)   | ![day six — outside](/public/screenshots/06-outside.png)                  |



---

Iron Bloom is a game poem about living with heavy periods, anemia, chronic fatigue, and everything that comes with it. The idea came to me sitting in an infusion chair getting iron put back into my body.

The mechanics are the poem: movement speed tied to energy, a plant that wilts or blooms with you, a journal that unlocks day by day. The bathroom looks like something happened in there on the bad days. The bed has a stain on day two. You water the plant anyway. Someone told you not to water plants on your period. The plant bloomed.

By day six you go outside and sit on a bench. The air is cold. You made it through.

---

## the reality behind this game

This game is rooted in real conditions that affect millions of people who menstruate. If any of this sounds familiar — you are not alone.

**Heavy menstrual bleeding (menorrhagia)**
Heavy menstrual bleeding affects up to 1 in 3 premenopausal people. About 1 in 5 report periods that interfere with daily life. The American College of Obstetricians and Gynecologists defines it as excessive menstrual bleeding that negatively impacts physical, social, emotional, and material quality of life — not just a number on a chart.
_Source: American College of Obstetricians and Gynecologists (ACOG), [Heavy Menstrual Bleeding FAQ](https://www.acog.org/womens-health/faqs/heavy-menstrual-bleeding), updated 2021; Yale Medicine_

**Iron-deficiency anemia**
Heavy periods are the single most common cause of iron-deficiency anemia in people of reproductive age. Heavy bleeding can strip 30–40mg of iron from the body each month — well above what diet alone can replace. Around 60% of those with heavy periods may develop anemia if blood loss goes untreated. A normal ferritin level is at least 12 µg/L. Many people are walking around at a 4.
_Source: CDC, [Heavy Menstrual Bleeding](https://www.cdc.gov/ncbddd/blooddisorders/women/menorrhagia.html), reviewed 2023; Cleveland Clinic, Menorrhagia, 2023; Mira Fertility / miracare.com, 2026_

**Chronic fatigue and brain fog**
Anemia directly causes fatigue, brain fog, difficulty concentrating, shortness of breath, and dizziness. These are not character flaws or laziness. They are symptoms of a body running low on something essential. People with heavy menstrual bleeding are over four times more likely to report feeling tired or short of breath during their period.
_Source: Sinharoy et al., The Lancet Global Health, October 2023 — multinational study across 10 cities, 4,828 participants_

**The emotional weight**
Heavy menstrual bleeding has been shown to negatively affect psychological state, energy, work productivity, social relationships, and daily functioning. The WHO recognizes iron-deficiency anemia as a significant public health concern with direct impact on cognitive and physical health, including the ability to participate fully in school and work.
_Source: WHO Vitamin and Mineral Nutrition Information System; ACOG Committee Opinion, 2019; The Lancet Global Health, 2023_

**If this is your experience:** talk to a doctor about ferritin testing, iron infusions, and treatment options. You deserve more than being told it's normal.

---

## how to play

- **Arrow keys / WASD** to move
- **Space / Enter** to interact with objects
- **R** to restart
- Touch controls supported on mobile

Walk up to objects and press interact. Some objects have follow-up text if you visit them again. The journal opens as an overlay — use the arrows to browse entries. Sleep in the bed to advance to the next day.

---

## running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## building for production

```bash
npm run build
```

Output goes to `dist/`. Zip the contents and upload to itch.io as an HTML project.

---

## technical notes

- Built with [Vite](https://vitejs.dev/) and vanilla JavaScript — no game engine
- All graphics drawn with the HTML5 Canvas API
- All audio generated with the Web Audio API — no sound files
- Self-contained, works fully offline once built
- Designed to run in an iFrame (itch.io compatible)
- Touch controls for mobile

---

## license

[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) — you may share this work with attribution, but may not use it commercially or create derivative works without permission.

© 2026 Yafira Martinez / [Electrocute Lab](https://electrocute.io)
