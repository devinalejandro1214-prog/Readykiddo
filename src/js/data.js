export const defaults = {
  name: "Nova",
  avatar: "fox",
  interestStyle: "dino",
  music: "lo-fi",
  colorPalette: "pastel",
  vibe: "cozy",
  guideStyle: "coach",
  sensoryIntensity: "gentle",
  victoryStyle: "builder",
  navigationMethod: "buttons",
  pathfinderIndex: 0,
  audioEnabled: false,
  hasCompletedComfort: false,
  hasCompletedJourney: false
};

export const categories = [
  {
    key: "name",
    title: "Choose your name",
    helper: "Pick a short name the Facilitator Buddy can say clearly.",
    choices: [
      { value: "Nova",  label: "Nova",  glyph: "N",  description: "Bright, curious, ready to explore." },
      { value: "Milo",  label: "Milo",  glyph: "M",  description: "Warm, steady, and playful." },
      { value: "Luna",  label: "Luna",  glyph: "L",  description: "Calm, imaginative, and gentle." },
      { value: "Kai",   label: "Kai",   glyph: "K",  description: "Brave, focused, and quick." },
      { value: "Zuri",  label: "Zuri",  glyph: "Z",  description: "Creative, joyful, and bold." }
    ]
  },
  {
    key: "avatar",
    title: "Choose your companion",
    helper: "Your companion becomes the friendly guide of your learning world.",
    choices: [
      { value: "sherlock",  label: "Sherlock Holmes",   glyph: "SH", description: "The Great Detective — sharp, curious, and never misses a clue." },
      { value: "pooh",      label: "Winnie the Pooh",   glyph: "WP", description: "The Honey Bear — warm, unhurried, and always kind." },
      { value: "alice",     label: "Alice",              glyph: "AL", description: "Down the Rabbit Hole — wonderfully brave and endlessly imaginative." },
      { value: "robinhood", label: "Robin Hood",         glyph: "RH", description: "The Forest Hero — bold, fair, and full of adventure." },
      { value: "peterpan",  label: "Peter Pan",          glyph: "PP", description: "The Boy Who Flew — playful, free, and never boring." },
      { value: "mowgli",    label: "Mowgli",             glyph: "MW", description: "The Jungle Boy — fearless, wild-hearted, and loyal." },
      { value: "dorothy",   label: "Dorothy",            glyph: "DO", description: "There's No Place Like Home — determined, warm, and brave." },
      { value: "mermaid",   label: "Little Mermaid",     glyph: "LM", description: "Part of Your World — curious about everything beyond the horizon." }
    ]
  },
  {
    key: "interestStyle",
    title: "Choose your world style",
    helper: "This changes the background, lesson frame, and world sectors.",
    choices: [
      { value: "dino",         label: "Dino World",       glyph: "DI", description: "Fossils, footprints, and discovery trails through prehistoric lands." },
      { value: "space",        label: "Deep Space",        glyph: "SP", description: "Stars, planets, cosmic missions, and zero-gravity wonder." },
      { value: "undersea",     label: "Deep Sea",          glyph: "US", description: "Bubbles, glowing reefs, and the quiet of the ocean floor." },
      { value: "jungle",       label: "Jungle Canopy",     glyph: "JC", description: "Wild animals, tropical storms, and hidden paths through the trees." },
      { value: "clockwork",    label: "Clockwork Gears",   glyph: "CW", description: "Ticking mechanisms, inventions, and the magic of how things work." },
      { value: "classiclit",   label: "Classic Stories",   glyph: "CS", description: "Timeless tales, legendary characters, and worlds made from words." }
    ]
  },
  {
    key: "music",
    title: "Choose your music feel",
    helper: "ReadyKiddo uses tiny response tones that match this style.",
    choices: [
      { value: "lo-fi",       label: "Lo-Fi Nature",         glyph: "LF", description: "Rain on vinyl, soft pads, and cozy progress cues." },
      { value: "orchestral",  label: "Orchestral Adventure",  glyph: "OA", description: "Cinematic strings that rise with every achievement." },
      { value: "synthwave",   label: "Synth-Wave Space",      glyph: "SW", description: "Arpeggiated synths and smooth future-retro pulses." },
      { value: "8bit",        label: "8-Bit Retro",           glyph: "8B", description: "Chiptune melodies and satisfying pixel-perfect cues." },
      { value: "nature",      label: "Nature",                glyph: "NA", description: "Gentle chimes, birdsong, and organic ambient tones." }
    ]
  },
  {
    key: "colorPalette",
    title: "Choose your color palette",
    helper: "The palette updates contrast, focus rings, and world lighting instantly.",
    choices: [
      { value: "pastel",         label: "Pastel",         glyph: "PA", description: "Soft and gentle with friendly contrast." },
      { value: "high-contrast",  label: "High-Contrast",  glyph: "HC", description: "Clear edges and stronger readability." },
      { value: "earth",          label: "Earth",          glyph: "EA", description: "Warm greens, clay, and grounding tones." },
      { value: "neon",           label: "Neon",           glyph: "NE", description: "Bright, energetic, and futuristic." },
      { value: "deep",           label: "Deep",           glyph: "DP", description: "Cool, immersive, and lower glare." }
    ]
  },
  {
    key: "vibe",
    title: "Choose your vibe",
    helper: "Vibe changes the pacing, corner softness, prompt energy, and reward style.",
    choices: [
      { value: "cozy",      label: "Cozy",      glyph: "CO", description: "Slower transitions and soft encouragement." },
      { value: "energetic", label: "Energetic", glyph: "EG", description: "Snappier movement and upbeat prompts." },
      { value: "stealthy",  label: "Stealthy",  glyph: "ST", description: "Quiet focus with mission-style framing." },
      { value: "curious",   label: "Curious",   glyph: "CU", description: "Discovery language and question-led prompts." },
      { value: "heroic",    label: "Heroic",    glyph: "HR", description: "Bold goals and victory language." }
    ]
  },
  {
    key: "guideStyle",
    title: "Choose your guide style",
    helper: "The Facilitator Buddy adapts its language without over-talking.",
    choices: [
      { value: "coach",         label: "Coach",        glyph: "CH", description: "Clear goals, praise, and next best action." },
      { value: "professor",     label: "Professor",    glyph: "PR", description: "Calm explanations and structured steps." },
      { value: "comedian",      label: "Comedian",     glyph: "CM", description: "Playful lines with careful timing." },
      { value: "zen",           label: "Zen",          glyph: "ZN", description: "Soft wording and gentle pacing." },
      { value: "secret-agent",  label: "Secret Agent", glyph: "SA", description: "Mission clues and focused objectives." }
    ]
  },
  {
    key: "sensoryIntensity",
    title: "Check sensory intensity",
    helper: "This filters animation density, sound cue strength, and visual motion.",
    choices: [
      { value: "low",      label: "Low",      glyph: "I",   description: "No decorative motion and almost silent cues." },
      { value: "gentle",   label: "Gentle",   glyph: "II",  description: "Very soft transitions and light feedback." },
      { value: "balanced", label: "Balanced", glyph: "III", description: "Comfort motion with simple response tones." },
      { value: "lively",   label: "Lively",   glyph: "IV",  description: "More animation, sparkle, and sound feedback." },
      { value: "high",     label: "High",     glyph: "V",   description: "Full premium motion and expressive rewards." }
    ]
  },
  {
    key: "victoryStyle",
    title: "Choose your victory style",
    helper: "Victory style changes what a completed task visibly gives the child.",
    choices: [
      { value: "collector", label: "Collector", glyph: "BD", description: "Earn badges and fill a treasure shelf." },
      { value: "explorer",  label: "Explorer",  glyph: "MP", description: "Unlock new map paths and secret places." },
      { value: "builder",   label: "Builder",   glyph: "BL", description: "Add pieces to a personal world." },
      { value: "hero",      label: "Hero",      glyph: "SH", description: "Rescue helpers and complete brave quests." },
      { value: "dj",        label: "DJ",        glyph: "DJ", description: "Collect sounds and remix tiny wins." }
    ]
  },
  {
    key: "navigationMethod",
    title: "Check navigation",
    helper: "Navigation changes the physical interaction model, not only the buttons.",
    choices: [
      { value: "buttons",     label: "Buttons",     glyph: "BT", description: "Classic large tap targets and clear controls." },
      { value: "drag",        label: "Drag",        glyph: "DG", description: "Move choices into a safe drop zone." },
      { value: "tilt",        label: "Tilt",        glyph: "TL", description: "Use lean-style prompts and arrow support." },
      { value: "voice",       label: "Voice",       glyph: "VC", description: "Say the choice name when voice is available." },
      { value: "pathfinder",  label: "Pathfinder",  glyph: "PF", description: "A guided trail with fewer choices visible." }
    ]
  }
];

export const comfortKeys = ["sensoryIntensity", "navigationMethod", "music"];

export const guides = {
  coach: {
    label: "Coach guide",
    face: "GO",
    intro: name => `All right, ${name}. One strong choice at a time.`,
    step: (name, step) => `${name}, pick the option that feels easiest to start with. I'll keep the path steady.`,
    complete: name => `Splendid work, ${name}. Your world is ready for the first quest.`
  },
  professor: {
    label: "Professor guide",
    face: "IQ",
    intro: name => `Hello, ${name}. We will make one clear selection per step.`,
    step: (name, step) => `${name}, this choice teaches ReadyKiddo how to shape your ${step.title.toLowerCase()}.`,
    complete: name => `${name}, your learning settings are organized and ready.`
  },
  comedian: {
    label: "Comedian guide",
    face: "HA",
    intro: name => `Welcome, ${name}. Tiny choices, big magic. No confetti cannon unless invited.`,
    step: (name, step) => `${name}, choose your favorite. I promise the buttons are behaving themselves today.`,
    complete: name => `Ta-da, ${name}. Your world has entered the building.`
  },
  zen: {
    label: "Zen guide",
    face: "OM",
    intro: name => `Welcome, ${name}. We will move gently.`,
    step: (name, step) => `${name}, breathe in, look once, and choose what feels comfortable.`,
    complete: name => `${name}, your calm path is ready.`
  },
  "secret-agent": {
    label: "Secret Agent guide",
    face: "07",
    intro: name => `Agent ${name}, your mission profile is open.`,
    step: (name, step) => `Agent ${name}, select the best clue for ${step.title.toLowerCase()}.`,
    complete: name => `Mission complete, Agent ${name}. Your world is secure and ready.`
  }
};

export const sensoryProfiles = {
  low:      { label: "Low",      motion: "Motion locked down",      sound: "Essential cues only",          volume: 0.012 },
  gentle:   { label: "Gentle",   motion: "Soft transitions",         sound: "Whisper-soft cues",            volume: 0.032 },
  balanced: { label: "Balanced", motion: "Comfort motion",           sound: "Soft response tones",          volume: 0.052 },
  lively:   { label: "Lively",   motion: "Expressive motion",        sound: "Playful response tones",       volume: 0.082 },
  high:     { label: "High",     motion: "Full premium animation",   sound: "Bright celebration cues",      volume: 0.112 }
};

export const sectors = [
  { id: "stream",  title: "Learning Stream",  glyph: "ST", short: "Adaptive episodes",  detail: "A calm playlist that reshapes pacing, tone, and reward timing around the child." },
  { id: "create",  title: "Create Studio",    glyph: "CR", short: "Build a world",       detail: "A tactile maker space where victories add pieces to the child's personal world." },
  { id: "calm",    title: "Calm Cove",        glyph: "CC", short: "Reset gently",        detail: "Low-sensory activities, breathing cues, and gentle transitions for regulation." },
  { id: "quest",   title: "Quest Path",       glyph: "QP", short: "Guided challenges",   detail: "Short learning missions with facilitator scaffolding and meaningful celebration." }
];

export const avatarGlyphs = {
  sherlock: "SH", pooh: "WP", alice: "AL", robinhood: "RH",
  peterpan: "PP", mowgli: "MW", dorothy: "DO", mermaid: "LM",
  fox: "FX", robot: "RB", dino: "DN", whale: "WH", dragon: "DR"
};

export function choiceLabel(key, value) {
  const category = categories.find(item => item.key === key);
  const choice = category?.choices.find(item => item.value === value);
  return choice?.label ?? String(value);
}

export function choiceGlyph(key, value) {
  const category = categories.find(item => item.key === key);
  const choice = category?.choices.find(item => item.value === value);
  return choice?.glyph ?? "RK";
}
