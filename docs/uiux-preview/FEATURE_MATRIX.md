# ReadyKiddo UI/UX Preview Feature Matrix

This branch is an experimental interface preview. It does not replace the production application and does not write to production data.

## Fully interactive in the preview

- Responsive landing experience
- Four-step local onboarding flow
- Character, world, age, and routine selection
- Kid-mode Today screen
- Activity filtering and local saved activities
- Milestones view
- Parent dashboard mock with responsive learning insights
- Mock Zoey parent-guidance interaction
- Redesigned Shape Discovery interaction with success and retry states
- Local-only feedback dialog with loading, validation, and success states
- Offline banner, loading transition, empty state, toast messages, and reduced-motion behavior
- Links from the activity library to the existing working game engine

## Connected to existing ReadyKiddo code

- Existing character artwork is reused through the current `assets/images/characters` structure.
- Existing game files and runtime assets are copied into the generated preview bundle.
- Activity cards can launch the existing `game-loader.html` games.
- The preview build applies a draft-only `defer` fix for the Zoey companion load-order error. Production source remains unchanged.

## Partially connected

- Existing games retain their current internal interface after the redesigned activity library launches them.
- Current audio, session manager, and game registry remain active inside the connected game pages.
- Game progress earned in the legacy game engine is not synchronized back into the redesigned mock dashboard.

## Visual or local-data only

- Parent progress metrics and milestone data
- Parent learning recommendations
- Zoey parent-advisor responses
- Feedback submission
- Account creation, authentication, parental gate, child switching, and database writes
- Milestone persistence across devices

## Safety boundaries

- No production domain configuration is changed.
- No production Supabase writes are performed.
- No Gemini or other paid AI endpoint is called.
- No feedback issue is created.
- Development test pages and repository documentation are excluded from the preview build.

## Build

```bash
npm run build:uiux-preview
```

The generated deployment directory is `.uiux-preview-dist/` and is intentionally ignored by Git.
