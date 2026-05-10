# ReadyKiddo 2.0 — Quick Start Guide

## 🎮 Playing the Games

### Option 1: From Onboarding
1. Go to `onboarding.html`
2. Complete profile setup (name, character, world, vibe, style)
3. Click "Start Game"
4. Game loads automatically

### Option 2: Direct URL
```
Color Sort: http://localhost/ReadyKiddo2.0/game-loader.html?game=color-sort
Shapes: http://localhost/ReadyKiddo2.0/game-loader.html?game=shape-recognition
```

### Option 3: Browser Console (Testing)
```javascript
// Set up test profile
localStorage.setItem('userProfile', JSON.stringify({
  childName: 'Leo',
  character: 'mica',
  theme: 'space',
  vibe: 'cozy',
  style: 'hero'
}));

// Load color sort game
window.location.href = 'game-loader.html?game=color-sort';

// Or load shapes game
window.location.href = 'game-loader.html?game=shape-recognition';
```

---

## 🛠️ Creating a New Game

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
    this.startGameplay();
  }

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `<!-- Your game UI here -->`;
  }

  startGameplay() {
    // Game logic here
  }

  async end() {
    // Save session
    this.context.saveSession({
      gameType: 'my-game',
      accuracy: 0.85,
      finalBranch: 'hard',
      // ... other metrics
    });
  }
}
```

### Step 2: Create CSS

**File:** `assets/css/my-game.css`

```css
/* Your game styling */
```

### Step 3: Register Game

**Update:** `assets/js/games/game-registry.js`

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

### Step 4: Launch Game

```html
<a href="game-loader.html?game=my-game">Play My Game</a>
```

---

## 📚 Using Built-in Systems

### Access Game Context

```javascript
class MyGame {
  constructor(context) {
    this.context = context;  // This has everything!
  }
}

// Available properties:
context.childName           // 'Leo'
context.character           // 'mica'
context.world              // 'Space'
context.worldSlug          // 'space'
context.backgroundPath     // Preloaded
context.characterPath      // Preloaded
context.sessionId          // Unique ID
```

### Use Items from World

```javascript
// Get all items for the selected world
const worldItems = getWorldItems(this.context.worldSlug);
// Returns: ['star', 'planet', 'rocket'] for space

// Render an item in a specific color
const itemSvg = getItemSVG('star', 'red');
// Returns: <svg>...</svg> string

// Insert into DOM
const itemEl = document.createElement('div');
itemEl.innerHTML = itemSvg;
gameArea.appendChild(itemEl);
```

### Use Shape Definitions

```javascript
// Get shape outline
const shapeSvg = getShapeSVG('circle', 'large');
// Returns: <svg>...</svg> with blue outline

// Sizes: 'large', 'medium', 'small'
const smallShape = getShapeSVG('square', 'small');

// Shapes: circle, square, triangle, star, rectangle
```

### Play Audio Prompts

```javascript
// Speak text using Web Speech API
await this.context.speak("Good job!");
await this.context.speak(`You got ${count} correct!`);

// Play sound effects (requires audio files)
this.context.playSound('correct');   // ding!
this.context.playSound('wrong');     // uh-oh
this.context.playSound('levelup');   // ta-da!
this.context.playSound('celebration'); // woohoo!
```

### Trigger Character Animations

```javascript
// Available animations
this.context.characterAnimation('cheer');      // Jump + rotate
this.context.characterAnimation('nod');        // Head nod
this.context.characterAnimation('wave');       // Waving hand
this.context.characterAnimation('thumbs-up');  // Thumbs up
this.context.characterAnimation('celebrate');  // Full dance
this.context.characterAnimation('sway');       // Side sway
```

### Save Session Data

```javascript
this.context.saveSession({
  gameType: 'my-game',
  accuracy: 0.92,
  finalBranch: 'hard',
  correctItems: 9,
  totalItems: 10,
  avgResponseTime: 1200,
  branchPath: 'neutral → medium → hard',
  customMetrics: { ... },
  strengthAreas: ['color1', 'color2'],
  opportunityAreas: ['color3'],
  nextGameRecommendation: 'shape-recognition'
});

// Automatically adds: timestamp, sessionId, childName, world, character, vibe
```

---

## 🎨 World-Specific Content

### Available Worlds

```javascript
getWorldItems('space')          // ['star', 'planet', 'rocket']
getWorldItems('candy-land')     // ['lollipop', 'gummy', 'cupcake']
getWorldItems('jungle')         // ['fruit', 'leaf', 'flower']
getWorldItems('beach')          // ['starfish', 'shell', 'beachball']
getWorldItems('castle')         // ['gem', 'shield', 'crown']
getWorldItems('studio')         // ['paintblob', 'brush', 'note']
```

### Available Colors (for all items)

```javascript
'red'     // #e23b3b
'blue'    // #2a7fd9
'yellow'  // #f4c83b
'green'   // #4aaf5a
'purple'  // #9558c4
'orange'  // #ff9d2f
```

### Rendering World-Specific Items

```javascript
// Example: Candy Land
const items = getWorldItems(this.context.worldSlug);
// items = ['lollipop', 'gummy', 'cupcake']

// Pick random item in random color
const item = items[Math.floor(Math.random() * items.length)];
const color = ['red', 'blue', 'yellow'][Math.floor(Math.random() * 3)];
const svg = getItemSVG(item, color);

// Render
const el = document.createElement('div');
el.innerHTML = svg;
gameArea.appendChild(el);
```

---

## 📊 Performance Metrics

### Accuracy Calculation
```javascript
const accuracy = correctItems / totalItems;  // 0.0 - 1.0
const percentage = Math.round(accuracy * 100);
```

### Response Time
```javascript
this.responseTimes = [];

// Record each response
const startTime = Date.now();
// ... user responds ...
const responseTime = Date.now() - startTime;
this.responseTimes.push(responseTime);

// Calculate average
const avgTime = Math.round(
  this.responseTimes.reduce((a, b) => a + b, 0) / 
  this.responseTimes.length
);
```

### Strength/Opportunity Areas
```javascript
// Track per-category accuracy
const accuracy = { red: 1.0, blue: 0.67, yellow: 0.5 };

// Sort and pick top/bottom
const sorted = Object.entries(accuracy)
  .sort((a, b) => b[1] - a[1]);

const strengths = sorted.slice(0, 2).map(([cat]) => cat);
const opportunities = sorted.slice(-2).map(([cat]) => cat);
```

---

## 🔄 Game Progression

### Next Game Recommendation

```javascript
// In game-registry.js
function getNextGameRecommendation(currentGame, finalBranch, accuracy) {
  if (currentGame === 'color-sort') {
    return 'shape-recognition';  // Natural progression
  }
  
  if (currentGame === 'shape-recognition') {
    if (accuracy > 0.85 && finalBranch === 'hard') {
      return 'coming-soon-1';     // Advanced path
    }
    return 'color-sort';          // Repeat or practice
  }
  
  return 'color-sort';            // Default fallback
}
```

### Auto-Load Next Game

```javascript
// After game ends
const nextGame = getNextGameRecommendation(
  'color-sort',
  'hard',
  0.95
);
window.location.href = `game-loader.html?game=${nextGame}`;
```

---

## 🐛 Debugging

### Check Browser Console

```javascript
// View last session
const lastSession = JSON.parse(
  localStorage.getItem('lastGameSession')
);
console.log(lastSession);

// View all sessions
const history = JSON.parse(
  localStorage.getItem('gameHistory') || '[]'
);
console.log(history);

// View user profile
const profile = JSON.parse(
  localStorage.getItem('userProfile') || '{}'
);
console.log(profile);
```

### Check Game Registry

```javascript
console.log(GAME_REGISTRY);
console.log(getActiveGames());
console.log(getAllGames());
```

### Check Items

```javascript
// Test item rendering
const svg = getItemSVG('star', 'red');
console.log(svg);  // Should show SVG markup

// Test all world items
Object.keys(WORLDS).forEach(world => {
  console.log(world, getWorldItems(world));
});
```

---

## 📱 Mobile Testing

### Responsive Sizes
- **Mobile**: < 768px (2-column layout)
- **Tablet**: 768px - 1024px (flexible)
- **Desktop**: > 1024px (full layout)

### Touch Events
- All zones and buttons have ≥ 44px touch targets
- Drag-and-drop works on touch devices
- No hover-only functionality

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

---

## ✨ Tips & Tricks

### Custom Item Colors
```javascript
// All items support any hex color
const customColor = '#FF00FF';
const svg = getItemSVG('star', customColor);
```

### Custom Shape Sizes
```javascript
// Shapes support: 'large', 'medium', 'small'
const bigCircle = getShapeSVG('circle', 'large');
const smallCircle = getShapeSVG('circle', 'small');
```

### Async Audio
```javascript
// Audio is async - wait for completion
await this.context.speak("Before next action");
doNextThing();  // This runs after speaking

// Non-blocking speech
this.context.speak("Background message");
doNextThing();  // This runs immediately
```

### Character Persistence
```javascript
// Character stays visible across screens
// Background auto-loads from context
// Both fade in with animations
```

---

## 🎯 Best Practices

1. **Always await speak()** — Use `await` for sequential prompts
2. **Track all metrics** — Record accuracy, time, category performance
3. **Save sessions** — Every game must save data before ending
4. **Use animations** — Give visual/audio feedback on every user action
5. **Test world-specific** — Make sure items load correctly for all 6 worlds
6. **Mobile-first CSS** — Design for touch first, enhance for desktop
7. **Progressive difficulty** — Start easy, gradually increase challenge
8. **Error handling** — Fallback gracefully if assets missing

---

## 📞 Support

### Common Issues

**Game won't load?**
- Check browser console for errors
- Verify localStorage has valid userProfile
- Check that game is registered in GAME_REGISTRY

**Items don't show?**
- Verify worldSlug is correct
- Check getWorldItems() returns array
- Inspect SVG markup in console

**Audio not working?**
- Web Speech API requires HTTPS (or localhost)
- Check browser supports SpeechSynthesis
- Test with `window.speechSynthesis` in console

**Animations laggy?**
- Reduce animation duration in CSS
- Check for overlapping animations
- Profile with Chrome DevTools

---

## 🚀 Ready to Build!

The system is ready for:
- ✅ Adding new games
- ✅ Custom world content
- ✅ Extended difficulty branches
- ✅ New game types and mechanics
- ✅ Parent dashboard integration
- ✅ Multi-child support

Start by copying the structure of `ColorSortGame` or `ShapeRecognitionGame`, modify the mechanics, and register it in `game-registry.js`.

Happy building! 🎮
