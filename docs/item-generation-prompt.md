# ReadyKiddo — Item Art Generation Prompt

Paste the block below into your image-generation LLM. Fill in the two slots at
the top (`WORLD` and `ITEMS`). Everything else is fixed so every item comes out
in the same house style and drops straight into `assets/images/games/items/`.

---

## ▶ THE PROMPT (copy from here down)

```
You are generating game item art for "ReadyKiddo," a learning app for kids
ages 3–5. Produce clean, consistent sticker-style icons.

WORLD: {{WORLD}}            ← e.g. Space, Candy Land, Jungle, Beach, Castle, Studio
ITEMS: {{ITEMS}}            ← one item, or a comma-separated list, e.g. comet, moon, alien

Generate ONE image per item in the ITEMS list. Each item is an independent,
standalone icon — do NOT combine items into a scene.

═══ HARD REQUIREMENTS (must follow exactly) ═══
• Canvas: 512 × 512 pixels, square.
• Background: FULLY TRANSPARENT. No background color, no scene, no shadow plate,
  no card, no frame, no ground line. Just the object on transparency.
• Composition: ONE single object, centered, with even padding around it so
  nothing touches the edges. The object fills ~80% of the canvas.
• No text, no letters, no numbers, no labels, no watermark anywhere.

═══ HOUSE STYLE (match these exactly) ═══
• Form: chunky, rounded, friendly, toddler-safe. Cartoon/sticker, NOT realistic,
  NOT 3D-rendered, NOT photographic. Simple iconic shapes a 3-year-old reads instantly.
• Fill: smooth soft gradient — a lighter tint at the top-left flowing into the
  main color, then a slightly darker shade at the bottom-right.
• Outline: ONE clean outline around the whole silhouette in a darker shade of the
  object's own color. Even, medium-thick weight (about 12–14px at this 512 size).
  No sketchy or doubled lines.
• Highlight: one soft white glossy highlight in the upper-left, plus one tiny
  bright white dot for shine.
• Sparkle: 1–3 small white 4-point sparkles for a little magic (optional, tasteful).
• Strong silhouette: the shape must be obvious and distinct at thumbnail size.

═══ COLOR RULES ═══
• If a COLOR is specified below, render the item primarily in that color
  (using the lighter/main/darker gradient described above).
  COLOR: {{COLOR or "natural"}}     ← red, blue, yellow, green, purple, orange — or "natural"
• If COLOR is "natural," use the item's real-world color
  (banana = yellow, coconut = brown, etc.).
• Allowed game palette when a color is requested:
  red, blue, yellow, green, purple, orange.

═══ OPTIONAL FACE ═══
• If the item is marked as a "hero" character (alien, robot, monkey, crab, dragon,
  unicorn, fairy, star, gummy, starfish, flower, sun, etc.), give it a simple
  kawaii face: two round eyes with a small white catch-light, a small smile, and
  soft pink cheek blush. Otherwise NO face — keep it a plain object.

═══ OUTPUT ═══
• Deliver each item as its own 512×512 transparent PNG.
• Name each file as the lowercase, hyphenated item name + ".png"
  (e.g. "comet.png", "paint-tube.png").
```

## ◀ (end of prompt)

---

## How to fill the slots

| Slot | What to put |
|---|---|
| `{{WORLD}}` | The theme name — Space, Candy Land, Jungle, Beach, Castle, Studio |
| `{{ITEMS}}` | One item or a comma list from `item-library-wishlist.md` (use the `slug`) |
| `{{COLOR}}` | A game color for color-sort items `[C]`, or `natural` for `[N]` items |

### Example — a few Space items, recolored
```
WORLD: Space
ITEMS: comet, satellite, asteroid
COLOR: blue
```

### Example — a natural-color Jungle item
```
WORLD: Jungle
ITEMS: banana
COLOR: natural
```

### Tip for color-sort `[C]` items
Run the same item list once per game color (red, blue, yellow, green, purple,
orange) and save as `comet-red.png`, `comet-blue.png`, … so the sorting game has
a matching tile for every bucket. `[N]` items only need one natural version.
