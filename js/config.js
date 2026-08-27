/* =========================================================================
   EVERYTHING YOU MIGHT WANT TO CHANGE LIVES IN THIS FILE.
   Nothing here needs the rest of the code to be understood.
   ========================================================================= */

export const CONFIG = {

  /* ---------------------------------------------------------------- her */
  NAME: "Luna",
  AGE: 23,
  FAVOURITE_COLOUR: "purple",        // the answer to the gate and to Q1
  SIGNED: "Firass",

  /* -------------------------------------------------------- the ending */
  /* Set this to false and the line never appears anywhere. */
  FLIRTY_LINE_ON: true,
  FLIRTY_LINE: "Maybe I'll get to be part of the year too. 💜",

  FINAL_LINES: [
    "And now…",
    "One last thing.",
    "Feliz cumpleaños, Luna. 💜",
    "I could've just sent you a message.",
    "But where's the fun in that?",
    "I hope 23 gives you a lot of reasons to smile.",
    "Enjoy your day."
  ],

  /* ---- your number, country code first, digits only, no "+" ----------
     Leave "" and the experience simply ends on the last line.          */
  WHATSAPP: "96179193912",
  WHATSAPP_TEXT: "🌙",

  /* ------------------------------------------------------------- music */
  MUSIC: {
    src: "assets/telepatia.mp3",     // swap this file to change the track
    volume: 0.5,
    fadeMs: 2600
  },

  /* ------------------------------------------------------- the photo --
     Drop a picture of the two of you at this path. If it isn't there the
     memory still works — it falls back to a drawn stand-in.            */
  MEMORY_PHOTO: "assets/memory-photo.jpg",
  MEMORY_PHOTO_CAPTION: "us, some night",

  /* ------------------------------------------------ the terrible site */
  WORLD1: {
    title: "HAPPY<br>BIRTHDAY<br>LUNA!!!",
    sub: "~*~ 23 today ~*~",
    marquee: "*** HAPPY BIRTHDAY LUNA *** BEST WISHES ON UR SPECIAL DAY *** " +
             "MANY HAPPY RETURNS *** PLZ ENJOY THE MUSIC *** SIGN MY GUESTBOOK ***",
    letter: [
      "Dear <b>Luna</b>,",
      "Wishing u a very happy birthday.",
      "May all ur dreams come true."
    ],
    visitors: "000023",
    award: "★ BEST BIRTHDAY SITE 2003 ★",
    verdict: "the lame card won 😐"
  },

  /* ---------------------------------------------- what he says, when --
     Short. He is not making a speech.                                  */
  LINES: {
    afterGlitch: ["Okay.", "That was terrible.", "Let's do this properly."],
    hello:       ["Hola, Luna. 💜", "I made you something."],
    mission:     ["GET LUNA TO HER BIRTHDAY"],
    problem:     ["Something went wrong…", "The birthday room is locked."],
    ready:       "¿Lista?",
    memoryFound: "Yeah… I remember this one.",
    quizPass:    ["You passed.", "Unfortunately, I already decided you were getting a present."],
    doorsDone:   "Right. That's enough of that.",
    roomOpen:    "You made it.",
    wish:        "Haz un deseo.",
    correct:     "Muy bien. 😌",
    wrong:       "Intenta otra vez.",
    noCheating:  "No hagas trampa."
  },

  /* ------------------------------------------------------- the keys --- */
  KEYS: [
    { id: "memory",   icon: "💜", label: "A memory"   },
    { id: "wish",     icon: "✨",       label: "A wish"     },
    { id: "surprise", icon: "🎁", label: "A surprise" }
  ],

  /* ------------------------------------------- mini-game 1: the hunt --
     One of these is `key: true`. The rest are there to be funny.       */
  MEMORY_OBJECTS: [
    { id: "bracelet", sprite: 0, key: true,
      line: "The purple one. You wore it the whole night." },
    { id: "camera",   sprite: 1, line: "You took forty of these. I'm in two." },
    { id: "car",      sprite: 2, line: "\"Five minutes away.\" You were not five minutes away." },
    { id: "moon",     sprite: 3, line: "Somebody named you after this. Good call." },
    { id: "shades",   sprite: 4, line: "Indoors. At night. Iconic." },
    { id: "pizza",    sprite: 5, line: "You said you weren't hungry." }
  ],

  /* ------------------------------------------ mini-game 2: the quiz ---
     Add, remove or reword freely. `a` is the index of the right answer. */
  LUNA_QUESTIONS: [
    {
      q: "What's Luna's favourite colour?",
      options: ["Blue", "Purple", "Green", "Whatever looks expensive"],
      a: 1,
      after: "Obviously."
    },
    {
      q: "How many candles are we dealing with today?",
      options: ["22", "23", "Don't", "24, but she'd deny it"],
      a: 1,
      after: "Twenty-three. Suits you."
    },
    {
      q: "Luna says she'll be ready in five minutes. Realistically?",
      options: ["Five minutes", "Fifteen", "Forty", "She is already asleep"],
      a: 2,
      after: "Forty. And worth it, every time."
    },
    {
      q: "Correct response when Luna says \"I'm not hungry\"?",
      options: ["Believe her", "Order anyway", "Argue", "Eat alone, bravely"],
      a: 1,
      after: "Order anyway. You always finish half of mine."
    }
  ],

  /* ------------------------------------------ mini-game 3: the doors --- */
  DOORS: [
    { id: "normal", label: "NORMAL", tag: "the sensible one",
      result: "Boring.", detail: "He walks through. Nothing happens. Nothing at all." },
    { id: "stupid", label: "STUPID", tag: "probably fine",
      result: "Much better.", detail: "He goes in headfirst and comes out wearing the cake." },
    { id: "bad",    label: "DEFINITELY A BAD IDEA", tag: "do not",
      result: "🚨 LUNA HAS MADE A TERRIBLE DECISION",
      detail: "Alarms. Sprinklers. He is already running." }
  ],

  /* --------------------------------------------------------- assets --- */
  ART: {
    walk:      "assets/him-walk.webp",   // 5 cells: 4 walking + 1 in the air
    stand:     "assets/him-stand.webp",
    withCake:  "assets/him-cake.webp",
    villa:     "assets/chalet.webp",
    room:      "assets/room.webp",
    mountains: "assets/mountains.webp",
    floor:     "assets/floor.webp",
    water:     "assets/water.webp",
    bunting:   "assets/bunting.webp",
    cabana:    "assets/cabana.webp",
    lounger:   "assets/lounger.webp",
    firebowl:  "assets/firebowl.webp",
    champagne: "assets/champagne.webp",
    gifts:     "assets/gifts.webp",
    floaties:  "assets/floaties.webp",
    palm:      "assets/palm.webp",
    cake:      "assets/cake.webp",
    objects:   "assets/objects.webp",    // 6 cells, see MEMORY_OBJECTS
    doors:     "assets/doors.webp"       // 3 cells, see DOORS
  }
};

/* how many cells live in each sprite strip */
export const CELLS = { walk: 5, objects: 6, doors: 3 };
