'use client';

import { createContext, useContext, useState } from 'react';

export type CharacterId = 'explorer' | 'hero' | 'artist' | 'scientist' | 'wizard';
export type AgeRange = 'A' | 'B' | 'C' | 'D' | 'E';
export type ThemeId = 'space' | 'jungle' | 'ocean' | 'castle' | 'city' | 'candyland' | 'sports' | 'music';
export type VibeId = 'happy' | 'excited' | 'calm' | 'focused';

export function deriveAgeRange(age: number): AgeRange {
  if (age <= 4) return 'A';
  if (age <= 6) return 'B';
  if (age <= 8) return 'C';
  if (age <= 10) return 'D';
  return 'E';
}

interface OnboardingState {
  childName: string;
  childAvatar: CharacterId | null;
  parentName: string;
  parentAvatar: CharacterId | null;
  age: number | null;
  ageRange: AgeRange | null;
  character: CharacterId | null;
  theme: ThemeId | null;
  vibe: VibeId | null;
}

interface OnboardingContextValue extends OnboardingState {
  setChildName: (v: string) => void;
  setChildAvatar: (v: CharacterId) => void;
  setParentName: (v: string) => void;
  setParentAvatar: (v: CharacterId) => void;
  setAge: (v: number) => void;
  setCharacter: (v: CharacterId) => void;
  setTheme: (v: ThemeId) => void;
  setVibe: (v: VibeId) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    childName: '',
    childAvatar: null,
    parentName: '',
    parentAvatar: null,
    age: null,
    ageRange: null,
    character: null,
    theme: null,
    vibe: null,
  });

  const setChildName = (v: string) => setState(s => ({ ...s, childName: v }));
  const setChildAvatar = (v: CharacterId) => setState(s => ({ ...s, childAvatar: v }));
  const setParentName = (v: string) => setState(s => ({ ...s, parentName: v }));
  const setParentAvatar = (v: CharacterId) => setState(s => ({ ...s, parentAvatar: v }));
  const setAge = (v: number) => setState(s => ({ ...s, age: v, ageRange: deriveAgeRange(v) }));
  const setCharacter = (v: CharacterId) => setState(s => ({ ...s, character: v }));
  const setTheme = (v: ThemeId) => setState(s => ({ ...s, theme: v }));
  const setVibe = (v: VibeId) => setState(s => ({ ...s, vibe: v }));

  return (
    <OnboardingContext.Provider value={{ ...state, setChildName, setChildAvatar, setParentName, setParentAvatar, setAge, setCharacter, setTheme, setVibe }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
