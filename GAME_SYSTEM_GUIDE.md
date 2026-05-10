# ReadyKiddo Universal Game System

## What's Been Created

A modular, multi-game architecture that allows any number of games to be registered and loaded dynamically.

### New Files

```
assets/js/games/
├── item-data.js              ← All 108 SVG items (6 worlds × 3 items × 6 colors)
├── shape-definitions.js      ← SVG shape outlines (circle, square, triangle, star, rectangle)
├── game-shell.js             ← Universal game wrapper (context, audio, animations)
├── game-registry.js          ← Dynamic game loader + registry system

game-loader.html              ← New universal game launcher
```

---

## How It Works

### 1. Item Library (`item-data.js`)

**All 108 SVG items organized by world:**

```javascript
// Space: star, planet, rocket
// Candy Land: lollipop, gummy, cupcake
// Jungle: fruit, leaf, flower
// Beach: starfish, shell, beachball
// Castle: gem, shield, crown
// Studio: paintblob, brush, note

getItemSVG('star', 'red')           // Returns red star SVG
getWorldItems('candy-land')         // Returns ['lollipop', 'gummy', 'cupcake']
```

### 2. Shape Definitions (`shape-definitions.js`)

**SVG shape outlines extracted from item logic:**

```javascript
getShapeSVG('circle', 'large')      // Returns circle outline SVG
getShapeSVG('square', 'medium')     // Returns square outline SVG
getShapeSVG('triangle', 'small')    // Returns triangle outline SVG
getShapeSVG('star', 'large')        // Returns star outline SVG
```

### 3. Game Shell (`game-shell.js`)

**Universal wrapper providing:**

- **Game Context**: User profile, world, character, paths
- **Audio Prompts**: Text-to-speech (Web Speech API) + fallback
- **Character Animations**: cheer, nod, wave, thumbs-up, dance, sway
- **Session Management**: Save game data to localStorage
- **Navigation**: Pass between games

```javascript
const shell = new GameShell('color-sort');
await shell.initialize();

// Speak to the child
await shell.context.speak("Great job! You found the red item!");

// Trigger animation
shell.context.characterAnimation('cheer');

// Save session
shell.context.saveSession({ accuracy: 0.95, finalBranch: 'hard' });
```

### 4. Game Registry (`game-registry.js`)

**Centralized game registration & dynamic loading:**

```javascript
// Registered games
GAME_REGISTRY = {
  'color-sort': { ... },
  'shape-recognition': { ... },
  'coming-soon-1': { ... }
}

// Load any game
const game = await loadGame('shape-recognition');

// Get next recommendation
const nextGame = getNextGameRecommendation(
  currentGame, 
  finalBranch,  // 'neutral', 'easy-medium', 'medium', 'medium-hard', 'hard'
  accuracy      // 0.0 - 1.0
);
```

### 5. Game Loader (`game-loader.html`)

**Universal entry point for any game:**

```html
<!-- Load color-sort (default) -->
<a href="game-loader.html">Play Game</a>

<!-- Load shape-recognition -->
<a href="game-loader.html?game=shape-recognition">Shape Game</a>

<!-- Auto-loads from world-reveal.html -->
window.location.href = 'game-loader.html?game=color-sort';
```

---

## How to Create a New Game

### Step 1: Create Game Class

**File:** `assets/js/games/my-game.js`

```javascript
class MyGame {
  constructor(context) {
    this.context = context;  // From GameShell
    this.performance = {};
  }

  async startGame() {
    // Initialize UI
    this.render();
    
    // Greet player
    await this.context.speak(`Hi ${this.context.childName}!`);
    
    // Start gameplay
    this.presentItem();
  }

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <!-- Your game UI here -->
    `;
  }

  presentItem() {
    // Game logic here
  }
}
```

### Step 2: Create CSS

**File:** `assets/css/my-game.css`

```css
/* Your game styling */
```

### Step 3: Register Game

**Update `assets/js/games/game-registry.js`:**

```javascript
const GAME_REGISTRY = {
  'color-sort': { ... },
  'shape-recognition': { ... },
  'my-game': {
    name: 'My Game',
    description: 'A fun new game',
    class: 'MyGame',
    scriptPath: 'assets/js/games/my-game.js',
    cssPath: 'assets/css/my-game.css',
    isActive: true,
    order: 3
  }
};
```

### Step 4: Load the Game

```html
<a href="game-loader.html?game=my-game">Play My Game</a>
```

---

## How to Use Items in Games

### Example: Color Sort Game

```javascript
class ColorSortGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;
  }

  renderItem(itemName, color) {
    const itemSVG = getItemSVG(itemName, color);
    const itemEl = document.createElement('div');
    itemEl.innerHTML = itemSVG;
    return itemEl;
  }

  start() {
    const worldItems = getWorldItems(this.worldSlug);
    // worldItems = ['star', 'planet', 'rocket'] if space
    // worldItems = ['lollipop', 'gummy', 'cupcake'] if candy-land
    
    const randomItem = worldItems[Math.floor(Math.random() * worldItems.length)];
    const randomColor = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'][Math.random()];
    
    this.renderItem(randomItem, randomColor);
  }
}
```

---

## How to Use Shapes in Games

### Example: Shape Recognition Game

```javascript
class ShapeRecognitionGame {
  constructor(context) {
    this.context = context;
  }

  presentShapeOutline(shapeType) {
    const shapeSVG = getShapeSVG(shapeType, 'large');
    const outlineEl = document.createElement('div');
    outlineEl.innerHTML = shapeSVG;
    document.getElementById('gameArea').appendChild(outlineEl);
  }

  start() {
    this.presentShapeOutline('circle');  // Show circle outline
    
    // Present items to match against
    const items = ['planet', 'beachball', 'lollipop'];  // All circles
    this.presentItems(items);
  }
}
```

---

## Audio System

### Text-to-Speech

```javascript
// Speak any text
await this.context.speak("Hello, let's play!");
await this.context.speak(`You got ${correct} correct!`);

// Features
// - Adjustable rate (0.5 = slow, 1.5 = fast)
// - Clear pronunciation for children
// - Fallback to console.log if Web Speech API unavailable
```

### Sound Effects

```javascript
// Play registered sounds
this.context.playSound('correct');      // ding!
this.context.playSound('wrong');        // uh-oh
this.context.playSound('levelup');      // ta-da!
this.context.playSound('leveldown');    // oh-no
this.context.playSound('celebration');  // woohoo!

// Note: Audio files need to be added to assets/sounds/
// For now, sounds fallback to console logs
```

---

## Character Animations

```javascript
// Available animations
this.context.characterAnimation('cheer');      // Jump up and down
this.context.characterAnimation('nod');        // Nod head
this.context.characterAnimation('wave');       // Wave hand
this.context.characterAnimation('thumbs-up');  // Thumbs up gesture
this.context.characterAnimation('celebrate');  // Full dance
this.context.characterAnimation('sway');       // Gentle sway
```

---

## Game Context Data

Every game receives a `context` object with:

```javascript
{
  // User Info
  childName: 'Leo',
  parentName: 'Mom',
  childId: 'child_12345',

  // World Selection
  world: 'Space',
  worldSlug: 'space',
  character: 'Mica',
  characterSlug: 'mica',
  style: 'Hero',
  styleSlug: 'hero',
  vibe: 'Cozy',
  vibeSlug: 'cozy',

  // Asset Paths
  backgroundPath: 'assets/images/world-backgrounds/space/vibes/cozy/background.png',
  characterPath: 'assets/images/characters/mica/hero.png',

  // Session Info
  startTime: 1234567890,
  sessionId: 'session_1234567890',

  // Utilities (functions)
  playSound(soundKey),
  speak(text),
  characterAnimation(type),
  saveSession(data),
  goToNextGame(gameType)
}
```

---

## Session Data Structure

When you save a session, include:

```javascript
this.context.saveSession({
  gameType: 'color-sort',
  accuracy: 0.92,
  finalBranch: 'hard',
  correctItems: 9,
  totalItems: 10,
  avgResponseTime: 1200,  // ms
  branchPath: 'neutral → easy-medium → medium → medium-hard → hard',
  shapesAttempted: { red: 5, blue: 5 },
  shapesCorrect: { red: 4, blue: 5 },
  strengthAreas: ['color-discrimination', 'visual-processing-speed'],
  opportunityAreas: [],
  nextGameRecommendation: 'shape-recognition'
});

// Automatically adds:
// - childName, character, world, vibe
// - timestamp
// - sessionId
```

---

## World-to-Game Flow

### Current Flow
```
Onboarding → World Reveal → [Select Game] → Game Loader → Game Instance
```

### Updated Recommended Flow
```
Onboarding → World Reveal → Auto-load Game → Game 1 → Game 2 → Game 3
```

### From world-reveal.html

```javascript
// Auto-load color-sort
document.getElementById('startGameButton').addEventListener('click', () => {
  window.location.href = 'game-loader.html?game=color-sort';
});

// Or let the game recommend the next one
const nextGame = getNextGameRecommendation('color-sort', 'hard', 0.95);
window.location.href = `game-loader.html?game=${nextGame}`;
```

---

## What's Next

### Ready to Build:
- ✅ Shape Recognition Game (`shape-recognition-game.js`)
- ✅ Parent Dashboard (`parent-dashboard.html`)
- ✅ Audio Prompt Integration
- ✅ Auto-progression System

### Future Games:
- Number Matching Game
- Pattern Builder
- Color-Number Match
- Counting Game

---

## Testing a Game

1. **Via URL:**
   ```
   http://localhost/ReadyKiddo2.0/game-loader.html?game=color-sort
   ```

2. **From Code:**
   ```javascript
   // In browser console
   localStorage.setItem('userProfile', JSON.stringify({
     childName: 'Leo',
     character: 'Mica',
     theme: 'Space',
     vibe: 'Cozy',
     style: 'Plain'
   }));
   window.location.href = 'game-loader.html?game=color-sort';
   ```

---

## Key Features

✅ **Extracted SVG Items** - All 108 items ready to use
✅ **Shape Outlines** - Circle, square, triangle, star, rectangle
✅ **World-Specific Items** - Each game loads items from the selected world
✅ **Universal Game Shell** - Audio, animations, context, session management
✅ **Dynamic Game Loading** - Register games, load them by name
✅ **Error Handling** - Graceful fallbacks for missing assets
✅ **Web Speech API** - Text-to-speech for all prompts
✅ **Character Animations** - 6 different animations
✅ **Session Persistence** - Save game data automatically
✅ **Next Game Recommendations** - Suggest progression based on performance

---

## Architecture Overview

```
game-loader.html
    ├── item-data.js (all SVGs)
    ├── shape-definitions.js (shape outlines)
    ├── game-shell.js (wrapper + utilities)
    ├── game-registry.js (loader)
    └── [Dynamic Game Script]
        ├── color-sort-game.js
        ├── shape-recognition-game.js
        └── [future games...]
```

All games share the same context, audio system, and animation system. Each game is independent but follows the same API.

Ready to build the Shape Recognition Game! 🎮
