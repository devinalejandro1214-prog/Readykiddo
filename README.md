# ReadyKiddo

A personalized learning app for children ages 3-11, featuring interactive games, reading, math, and creative play with adaptive difficulty and progress tracking.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion for animations
- **State Management**: React Context API

## Project Structure

```
readykiddo/
├── app/
│   ├── components/          # Reusable React components
│   ├── context/             # State management (OnboardingContext)
│   ├── onboarding/          # Onboarding flow screens
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── public/                  # Static assets
│   ├── ReadyKiddoLogo.jpeg  # App logo
│   └── assets/characters/   # Character SVGs
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config
└── postcss.config.mjs       # Tailwind config
```

## Getting Started

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Features Implemented

✅ **Landing Page** - Animated UI with floating clouds, brand messaging, and CTA  
✅ **Family Setup Screen** - Collect child name, parent name, and age with character avatars  
✅ **Form Validation** - Button disabled until all fields are filled  
✅ **State Management** - OnboardingContext for persistent onboarding data  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Animations** - Smooth transitions using Framer Motion  

## Next Steps

- [ ] Character selection screen (/onboarding/character)
- [ ] World/theme selection screen
- [ ] Vibe selection screen
- [ ] Main learning dashboard
- [ ] Game modules
- [ ] Progress tracking
- [ ] Parent dashboard

## Deployment

Deploy to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdevinalejandro1214-prog%2FReadykiddo)

Or deploy to any Node.js hosting platform.
