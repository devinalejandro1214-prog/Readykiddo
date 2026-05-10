# Sorting Game Assets Structure

## Folder Organization

```
sorting-game/
├── candy-land/
│   ├── container/
│   │   ├── red.png
│   │   ├── blue.png
│   │   ├── yellow.png
│   │   ├── green.png
│   │   ├── purple.png
│   │   └── orange.png
│   └── items/
│       ├── red-item1.png
│       ├── red-item2.png
│       ├── blue-item1.png
│       ├── blue-item2.png
│       ├── yellow-item1.png
│       ├── yellow-item2.png
│       ├── green-item1.png
│       ├── green-item2.png
│       ├── purple-item1.png
│       ├── purple-item2.png
│       ├── orange-item1.png
│       └── orange-item2.png
├── space/
│   ├── container/
│   └── items/
├── jungle/
│   ├── container/
│   └── items/
├── beach/
│   ├── container/
│   └── items/
├── castle/
│   ├── container/
│   └── items/
└── studio/
    ├── container/
    └── items/
```

## File Naming Convention

### Container Images
- **Location**: `{theme}/container/`
- **Format**: `{color}.png`
- **Colors**: `red`, `blue`, `yellow`, `green`, `purple`
- **Example**: `candy-land/container/red.png`
- **Size**: Recommend 200x200px minimum
- **Style**: Should look like a container/basket/bucket

### Item Images
- **Location**: `{theme}/items/`
- **Format**: `{color}-{shape}.png`
- **Naming**: Pick any shape name (e.g., apple, ball, star, rocket, etc.)
- **Examples**: 
  - `candy-land/items/red-lollipop.png`
  - `candy-land/items/blue-gumball.png`
  - `space/items/red-rocket.png`
- **Size**: Recommend 200x200px minimum
- **Style**: Should fit in a white rounded square container

## How the Game Works

1. **Background**: Loaded from `assets/images/world-backgrounds/{theme}/vibes/{vibe}/background.webp`
2. **Character**: Loaded from `assets/images/characters/{character}/{style}.png`
3. **Containers**: Game looks for images in `{theme}/container/{color}.png`
   - If not found, uses a solid colored box
4. **Items**: Game looks for images in `{theme}/items/{color}-{shape}.png`
   - If not found, falls back to inline SVG shapes

## Available Themes
- `candy-land` - Candy themed
- `space` - Space themed
- `jungle` - Jungle themed
- `beach` - Beach themed
- `castle` - Castle/medieval themed
- `studio` - Art studio themed

## Colors (Always 6)
- `red` - #e23b3b
- `blue` - #2a7fd9
- `yellow` - #f4c83b
- `green` - #4aaf5a
- `purple` - #9558c4
- `orange` - #ff9d2f

## Image Specifications

### Container Images
- **Purpose**: Drop target for items
- **Transparency**: Yes (PNG with alpha channel)
- **Background**: Transparent
- **Size**: 200x200px or larger
- **Content**: Center-aligned container/basket/bucket image

### Item Images
- **Purpose**: What kids drag and drop
- **Transparency**: Yes (PNG with alpha channel)
- **Background**: Transparent
- **Size**: 200x200px or larger
- **Content**: Simple, recognizable object centered in the image

## Example Item Naming for Each Theme

### Candy Land
- `red-lollipop.png`, `red-cherry.png`
- `blue-gumball.png`, `blue-mint.png`
- `yellow-banana.png`, `yellow-candy.png`
- `green-apple.png`, `green-gummy.png`
- `purple-grape.png`, `purple-lollipop.png`
- `orange-pumpkin.png`, `orange-peach.png`

### Space
- `red-rocket.png`, `red-mars.png`
- `blue-planet.png`, `blue-comet.png`
- `yellow-star.png`, `yellow-sun.png`
- `green-alien.png`, `green-meteor.png`
- `purple-nebula.png`, `purple-satellite.png`
- `orange-asteroid.png`, `orange-supernova.png`

### Jungle
- `red-parrot.png`, `red-flower.png`
- `blue-river.png`, `blue-butterfly.png`
- `yellow-banana.png`, `yellow-sun.png`
- `green-leaf.png`, `green-frog.png`
- `purple-vine.png`, `purple-fruit.png`
- `orange-tiger.png`, `orange-firefly.png`

## Testing

1. Place images in the appropriate folders
2. Open `game-loader.html?game=color-sort` in browser after creating an onboarding profile
3. The universal game shell will load the selected world, vibe, character, and style
4. Images should appear instead of SVG fallbacks
5. If item images aren't found, the game will fall back to colored SVG shapes

## Notes

- Minimum 2 items per color recommended for variety (6 colors = 12+ items per theme)
- The game randomly selects from available items of each color
- All items should have similar visual weight/size to look balanced
- Keep file sizes under 100KB each for performance
- With 6 colors, players will reach the hardest difficulty level with all colors active
