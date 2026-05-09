# ReadyKiddo World System Overview

## Purpose

ReadyKiddo is being shaped as a personalized child-friendly web app where a child and parent build a learning adventure by choosing:

- who the child plays as
- what the character wears
- what world they enter
- what emotional adventure tone, or vibe, that world should have

The goal is visual-first. A child who cannot read yet should still be able to understand choices through picture buttons, character previews, and simple progression.

## Current Product Flow

The intended flow is:

1. Landing page
2. Setup screen with child name, parent name, and character choice
3. Pick your world
4. Pick your adventure vibe
5. Pick your character style/costume
6. World reveal
7. Future game screen

Music is intentionally deferred. Music choices may be added later, but the current app should not reference missing audio files or require autoplay.

## Agent Roles

Codex role:

- organize folders and assets
- process transparent character PNGs
- create and rename image assets
- maintain GitHub and Netlify deployment
- document asset structure and implementation decisions

Claude Code role:

- write and maintain the site code
- implement onboarding flow
- implement world reveal and future game screens
- connect UI state to the asset structure
- keep the app working across desktop and mobile

## Characters

The current six characters are:

- Amelia
- Aria
- Emmett
- Mica
- Steven
- Trish

Each character has transparent PNG costume assets.

Character costume path pattern:

```text
assets/images/characters/{character-slug}/{style-slug}.png
```

Supported styles:

- `plain`
- `hero`
- `explorer`
- `wizard`
- `artist`
- `scientist`

Example:

```text
assets/images/characters/mica/hero.png
```

The setup screen should use the `plain` image. The selected style should determine which costume appears after onboarding and during games.

## Worlds

We originally discussed having base backgrounds plus reusable vibe overlays. After testing image generation workflows, the better current direction is to generate a complete background per world and vibe. This gives more control over composition, readability, and space for the character and UI.

Current worlds:

- Space
- Jungle
- Beach
- Castle
- Studio
- Candy Land

World base background path pattern:

```text
assets/images/world-backgrounds/{world-slug}/base.png
```

World plus vibe background path pattern:

```text
assets/images/world-backgrounds/{world-slug}/vibes/{vibe-slug}/background.png
```

Example:

```text
assets/images/world-backgrounds/space/vibes/magical/background.png
```

## Vibes

Vibes are not separate transparent overlays right now. They are mood-specific versions of the chosen world background.

Current vibes:

- Cozy
- Exciting
- Magical
- Silly
- Brave

Conceptually:

- the world answers "Where are we?"
- the vibe answers "What kind of adventure is this?"
- the style answers "How does my character show up?"

This keeps personalization simple while still creating a rich result. A Space + Cozy world can feel quiet and soft, while Space + Brave can feel dramatic and heroic, without needing a separate world list.

## Picture Buttons

The app should avoid text-only choices for core child-facing decisions. World, vibe, and style choices use image buttons that act like small snapshots of the result.

Button asset folders:

```text
assets/images/buttons/worlds/
assets/images/buttons/vibes/
assets/images/buttons/styles/
assets/images/buttons/buttons.json
```

World buttons preview the world. Vibe buttons preview the mood. Style buttons preview a costume. Labels can still exist for parents and accessibility, but the main decision should be understandable visually.

## Current Site Logic

The onboarding profile is stored in `localStorage` as a single saved object.

The important fields are:

```json
{
  "childName": "Example",
  "parentName": "Example",
  "character": "Mica",
  "theme": "Space",
  "vibe": "Magical",
  "style": "Hero"
}
```

The world reveal reads that profile and builds image paths from predictable slugs:

```text
Character:
assets/images/characters/{characterSlug}/{styleSlug}.png

Background:
assets/images/world-backgrounds/{worldSlug}/vibes/{vibeSlug}/background.png
```

Future screens should use the same saved profile object so the experience stays consistent.

## World Reveal Direction

The world reveal currently works as the bridge between onboarding and gameplay.

It should show:

- the selected world and vibe background full-screen
- the selected character in the selected costume
- a welcome card with the child name
- a game preview or "coming soon" panel
- a button to continue into the future game screen

On mobile, the character needs to stay visually important. Recent local adjustments increased the phone character size and changed the landing page button to ReadyKiddo logo blue.

## How Games Can Fit Later

Games should be built as reusable interfaces that read the same profile data, rather than separate one-off pages for every character or world.

A future `game.html` can load:

```text
gameProfile or userProfile from localStorage
```

Then it can render:

- background from selected world + vibe
- character from selected character + style
- game UI layered above the background
- optional animations or video moments based on the world, vibe, or milestone

The game should not need to know every individual image manually. It should use the same slug path system as world reveal.

Recommended page layer model:

```text
Layer 1: world/vibe background image
Layer 2: optional ambient video or animation
Layer 3: character PNG
Layer 4: game objects/interactions
Layer 5: UI controls, prompts, score, progress, buttons
```

This makes the game system flexible. A counting game, matching game, tracing game, story choice, or celebration screen could all use the same personalization foundation.

## Game Interface Coding Concept

Each future game can be treated as a module with a simple contract:

```js
const gameContext = {
  childName,
  parentName,
  character,
  characterSlug,
  style,
  styleSlug,
  world,
  worldSlug,
  vibe,
  vibeSlug,
  backgroundPath,
  characterPath
};
```

The game module should receive this context and then render its own interaction.

Possible structure:

```text
assets/js/games/
  game-shell.js
  game-registry.js
  matching-game.js
  counting-game.js
  tracing-game.js
```

The app can start with one shell and swap game modules later.

The game shell owns:

- loading the profile
- resolving asset paths
- drawing the background
- placing the character
- handling responsive layout
- showing shared buttons and progress UI

Each game module owns:

- instructions
- interaction rules
- success/failure states
- rewards or transition events

## Gemini Veo 3 Animation Plan

Gemini Veo 3 can be used for extra-touch animations without replacing the core app interface.

Best uses:

- short world intro animations
- character celebration moments
- magical transitions between onboarding and world reveal
- ambient background loops
- reward clips after a completed activity
- small story cutscenes between games

Recommended video asset path:

```text
assets/videos/{world-slug}/{vibe-slug}/{moment-name}.mp4
```

Examples:

```text
assets/videos/space/magical/intro.mp4
assets/videos/castle/brave/celebration.mp4
assets/videos/beach/cozy/ambient-loop.mp4
```

Videos should be optional enhancements. If a video is missing, the app should still work with the static background.

Suggested coding pattern:

```js
const videoPath = `assets/videos/${worldSlug}/${vibeSlug}/intro.mp4`;
```

Then check whether the file loads. If it does, play the video muted or after user interaction. If it fails, continue with the static image.

## Video and UI Layering

For world reveal or games, video can sit between the background and the character:

```text
background image
ambient or transition video
character PNG
interactive UI
```

This allows video to add motion without making the interface hard to use.

Important rules:

- Do not put important instructions inside video only.
- Do not rely on autoplay audio.
- Keep videos short and lightweight for mobile.
- Use poster images or static backgrounds as fallback.
- Make sure videos do not cover buttons or game controls.

## Mobile Notes

Mobile is a first-class experience.

Current mobile priorities:

- landing page words must remain readable
- CTA button should use ReadyKiddo blue
- onboarding cards should scroll naturally
- picture buttons should stay large enough for children to tap
- world reveal character should be big enough to feel like the child’s selected avatar
- game UI must avoid tiny controls and text-only actions

The app should be tested in iPhone-sized viewports regularly.

## Current Deployment Context

GitHub repository:

```text
https://github.com/devinalejandro1214-prog/Readykiddo.git
```

Netlify live site:

```text
https://readykiddo.com
```

Recent local CSS changes for mobile rendering are not yet pushed unless Codex pushes them after this report.

## Recommended Next Build Step

The next logical code step is to create the first `game.html` shell, not a specific game yet.

That shell should:

- read the saved profile
- render the selected background
- render the selected character
- reserve a clear game area
- include a reusable top or bottom UI area
- support optional video animation layers
- include graceful fallbacks if optional videos are missing

Once this shell exists, specific games can plug into it without rebuilding the personalization system every time.

