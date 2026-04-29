# ReadyKiddo Motion-First SPA V4

A modular, Netlify-ready single-page application for a premium neuro-inclusive interactive learning platform for children ages 4-7.

## Design direction

This V4 build treats motion as a first-class interface layer and adds a Motion Director for consistent route, name, choice, and sector choreography. Route changes, card selections, world reveal, and sector navigation are animated through:

- CSS View Transitions where supported
- Web Animations API fallback
- State-aware motion intensity
- Reduced-motion support
- Sensory-safe "Calm mode"

## Architecture

```text
index.html
netlify.toml
src/
  styles/
    main.css
    tokens.css
    base.css
    motion.css
    shell.css
    components.css
    themes.css
    routes.css
  js/
    app.js
    data.js
    state.js
    router.js
    motion.js
    theme-orchestrator.js
    audio-engine.js
    interaction-engine.js
    routes/
      landing.js
      comfort.js
      onboard.js
      world.js
      sector.js
```

## Core product behavior

- Comfort setup can happen before onboarding so sensory and navigation preferences are active immediately.
- The full 10-step ReadyKiddo journey is preserved:
  1. Name
  2. Avatar
  3. Interest Style
  4. Music
  5. Color Palette
  6. Vibe
  7. Guide Style
  8. Sensory Intensity
  9. Victory Style
  10. Navigation Method
- Global state persists through localStorage with validation and safe fallbacks.
- Audio, visual theme, motion density, route transitions, and navigation logic remain synchronized.
- Navigation modes include Buttons, Drag, Tilt, Voice, and Pathfinder.
- Pathfinder exposes all five choices without showing them all at once.

## Run locally

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy on Netlify

Upload the folder or connect a repo. The included `netlify.toml` publishes from the root and redirects all routes back to `index.html`.


## V3 verification

- JavaScript modules were syntax-checked with `node --check`.
- High-contrast palette was patched to preserve white text on dark glass surfaces.
- The app uses hash routes, so it works locally and on Netlify without server-side routing.


## V4 upgrades

- Adds `MotionDirector`, a centralized choreography layer for state-aware route movement, name reveal, touch ripples, and sector completion.
- Adds motion bridge progress across Comfort, Onboarding, and World reveal.
- Adds tactile name seed animation so entering or choosing a name becomes the first visible world-building moment.
- Adds sync tiles that keep Sensory, Music, Vibe, and Navigation visible as active product state.
- Adds richer sector interaction with activity completion states, orbit detail motion, and reward feedback.
- Adds premium motion CSS layers for native-app-like glass depth and smoother visual continuity.
