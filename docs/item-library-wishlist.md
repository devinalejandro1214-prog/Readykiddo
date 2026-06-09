# ReadyKiddo — Item Library Generation List

A long, themed list of items to generate so Zoey has a deep library to
personalize each child's games. Built on the existing item system in
`assets/js/games/item-data.js` and the art in
`assets/images/games/items/{item}.png`.

---

## How to use this list

- Generate each item as a **512×512 PNG with a transparent background**.
- Match the existing house style (see **Style spec** below) so new art drops
  in next to the current items seamlessly.
- File name = the `slug` in the tables, e.g. `comet.png`, lowercase, hyphenated.
- Drop finished files into `assets/images/games/items/`.
- ✅ = already exists. ⬜ = to generate.

### Color tags (which game each item is best for)
- **[C] Color-sort friendly** — looks natural in *any* of the 6 game colors
  (red, blue, yellow, green, purple, orange). Abstract or
  paintable shapes. These are the priority for the color-sorting game.
- **[N] Natural-color** — has one "real" color (a banana is yellow). Great for
  **counting, matching, feeding, and pattern** games where color isn't the
  sort key. Generate these in their natural color only.
- **[F] Has a friendly face** — give it the kawaii eyes + smile, like the
  current star / gummy / starfish / flower. Use sparingly: 2–3 "hero" items
  per world, the rest are plain objects.

---

## Style spec (so everything matches)

- **Canvas:** 512×512, transparent PNG, item centered with a little padding.
- **Form:** chunky, rounded, friendly. No sharp realism. Toddler-safe shapes.
- **Fill:** soft gradient — light tint top-left → main color → darker bottom-right.
- **Outline:** a single darker-shade outline around the whole silhouette
  (think 2.5px at 100px scale → ~13px at 512). Clean, consistent weight.
- **Highlight:** one soft white gloss highlight upper-left, plus a tiny bright dot.
- **Sparkles:** 1–3 small white 4-point sparkles for shine (optional).
- **Shadow:** a faint soft ellipse shadow under grounded items (optional).
- **Readability:** strong, distinct silhouette — the shape should be obvious at
  thumbnail size even before color is applied.

> Prompt seed you can reuse:
> *"A cute chunky cartoon {ITEM}, soft gradient {COLOR} with a darker outline,
> a glossy white highlight, tiny sparkle, flat kids'-app sticker style,
> centered, transparent background, 512×512."*

---

## SPACE  🚀
*Subtitle: "Galactic sort across the stars"*

| slug | item | tags |
|---|---|---|
| star | Star | ✅ [C][F] |
| planet | Ringed planet | ✅ [C] |
| rocket | Rocket | ✅ [C][F] |
| comet | Comet with a glowing tail | ⬜ [C] |
| moon | Crescent moon | ⬜ [C][F] |
| ufo | Flying saucer / UFO | ⬜ [C] |
| alien | Friendly little alien | ⬜ [C][F] |
| astronaut | Astronaut in a suit | ⬜ [N][F] |
| satellite | Satellite | ⬜ [C] |
| asteroid | Chunky asteroid / space rock | ⬜ [C] |
| telescope | Telescope on a stand | ⬜ [N] |
| robot | Cute space robot | ⬜ [C][F] |
| meteor | Shooting star / meteor streak | ⬜ [C] |
| space-helmet | Astronaut helmet | ⬜ [C] |
| galaxy | Spiral galaxy swirl | ⬜ [C] |

## CANDY LAND  🍭
*Subtitle: "Sweet treats into the candy basket"*

| slug | item | tags |
|---|---|---|
| lollipop | Swirl lollipop | ✅ [C] |
| gummy | Gummy bear | ✅ [C][F] |
| cupcake | Cupcake | ✅ [C] |
| candycane | Candy cane | ✅ [C] |
| icecream | Ice cream cone | ✅ [C] |
| gumdrop | Gumdrop | ✅ [C] |
| cherry | Cherries | ✅ [C] |
| donut | Frosted donut | ⬜ [C] |
| macaron | Macaron | ⬜ [C] |
| jellybean | Jellybean | ⬜ [C] |
| bonbon | Wrapped candy / bonbon | ⬜ [C] |
| cottoncandy | Cotton candy on a cone | ⬜ [C] |
| chocolate | Chocolate bar | ⬜ [N] |
| marshmallow | Marshmallow | ⬜ [C] |
| cookie | Cookie | ⬜ [N] |
| popsicle | Popsicle | ⬜ [C] |
| candyheart | Candy heart | ⬜ [C][F] |
| layercake | Slice of layer cake | ⬜ [C] |

## JUNGLE  🌿
*Subtitle: "Wild fruits, leaves, and blooms"*

| slug | item | tags |
|---|---|---|
| fruit | Round fruit | ✅ [C] |
| leaf | Leaf | ✅ [C] |
| flower | Flower | ✅ [C][F] |
| banana | Banana | ⬜ [N] |
| coconut | Coconut | ⬜ [N] |
| pineapple | Pineapple | ⬜ [N] |
| monkey | Friendly monkey | ⬜ [N][F] |
| parrot | Parrot | ⬜ [C][F] |
| toucan | Toucan | ⬜ [N][F] |
| frog | Frog | ⬜ [C][F] |
| snake | Friendly coiled snake | ⬜ [C][F] |
| butterfly | Butterfly | ⬜ [C] |
| mushroom | Spotted mushroom | ⬜ [C] |
| vine | Hanging vine | ⬜ [N] |
| tigercub | Tiger cub | ⬜ [N][F] |
| beetle | Shiny beetle | ⬜ [C] |
| orchid | Orchid bloom | ⬜ [C][F] |

## BEACH  🏖️
*Subtitle: "Treasures from the shore"*

| slug | item | tags |
|---|---|---|
| starfish | Starfish | ✅ [C][F] |
| shell | Spiral shell | ✅ [C] |
| beachball | Beach ball | ✅ [C] |
| surfboard | Surfboard | ✅ [C] |
| sandcastle | Sandcastle | ✅ [N] |
| scallop | Scallop shell | ✅ [C] |
| hibiscus | Hibiscus flower | ✅ [C][F] |
| crab | Friendly crab | ⬜ [C][F] |
| fish | Tropical fish | ⬜ [C][F] |
| seahorse | Seahorse | ⬜ [C][F] |
| bucket | Sand bucket + spade | ⬜ [C] |
| sun | Smiling sun | ⬜ [N][F] |
| palmtree | Palm tree | ⬜ [N] |
| sunglasses | Sunglasses | ⬜ [C] |
| flipflops | Flip-flops | ⬜ [C] |
| umbrella | Beach umbrella | ⬜ [C] |
| sailboat | Little sailboat | ⬜ [C] |
| dolphin | Dolphin | ⬜ [C][F] |
| coral | Coral branch | ⬜ [C] |

## CASTLE  🏰
*Subtitle: "Royal jewels and royal regalia"*

| slug | item | tags |
|---|---|---|
| gem | Gemstone | ✅ [C] |
| shield | Shield | ✅ [C] |
| crown | Crown | ✅ [C] |
| key | Golden key | ⬜ [N] |
| dragon | Friendly baby dragon | ⬜ [C][F] |
| sword | Sword | ⬜ [C] |
| chest | Treasure chest | ⬜ [N] |
| scroll | Rolled scroll | ⬜ [N] |
| potion | Potion bottle | ⬜ [C] |
| wand | Magic wand | ⬜ [C] |
| ring | Jeweled ring | ⬜ [C] |
| goblet | Goblet / chalice | ⬜ [C] |
| banner | Castle flag / banner | ⬜ [C] |
| tower | Castle tower | ⬜ [C] |
| unicorn | Unicorn | ⬜ [C][F] |
| fairy | Fairy | ⬜ [C][F] |
| coin | Gold coin | ⬜ [N] |
| torch | Wall torch | ⬜ [N] |

## STUDIO  🎨
*Subtitle: "Tools of art and music"*

| slug | item | tags |
|---|---|---|
| paintblob | Paint blob | ✅ [C] |
| brush | Paintbrush | ✅ [C] |
| note | Music note | ✅ [C] |
| palette | Paint palette | ⬜ [C] |
| crayon | Crayon | ⬜ [C] |
| pencil | Pencil | ⬜ [C] |
| paint-tube | Paint tube | ⬜ [C] |
| easel | Easel with canvas | ⬜ [N] |
| drum | Drum | ⬜ [C] |
| guitar | Guitar | ⬜ [C] |
| trumpet | Trumpet | ⬜ [N] |
| microphone | Microphone | ⬜ [C] |
| tambourine | Tambourine | ⬜ [C] |
| bell | Hand bell | ⬜ [N] |
| camera | Camera | ⬜ [C] |
| clapboard | Film clapboard | ⬜ [C] |
| ribbon | Award ribbon / rosette | ⬜ [C][F] |
| mask | Theater mask | ⬜ [C][F] |

---

## Counts

| World | Existing | New to generate | Total |
|---|---|---|---|
| Space | 3 | 12 | 15 |
| Candy Land | 7 | 11 | 18 |
| Jungle | 3 | 14 | 17 |
| Beach | 7 | 12 | 19 |
| Castle | 3 | 15 | 18 |
| Studio | 3 | 15 | 18 |
| **Total** | **26** | **79** | **105** |

---

## After the art is generated

To wire new items into the games, for each new item:
1. Add its slug to the world's `items` array in `WORLDS` (item-data.js).
2. Add its slug to `ITEM_PNG_AVAILABLE` (item-data.js) so the PNG is used.
3. (Optional) Add an SVG fallback generator in `ITEM_GENERATORS` for when the
   PNG hasn't loaded — only needed for color-sort `[C]` items that must recolor.

[C] items used in **color-sort** need to read correctly in all 6 colors, so
either generate 6 color variants (`comet-red.png`, …) or keep the SVG generator
as the recoloring source and use the PNG only as the neutral display tile.
[N] items are single-color and slot straight into counting / matching / feeding
/ pattern games.
