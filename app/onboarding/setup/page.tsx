'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, type CharacterId } from '../../context/OnboardingContext';
import FloatingClouds from '../../components/FloatingClouds';

const CHARACTERS: { id: CharacterId; label: string }[] = [
  { id: 'explorer',  label: 'Explorer'  },
  { id: 'hero',      label: 'Hero'      },
  { id: 'artist',    label: 'Artist'    },
  { id: 'scientist', label: 'Scientist' },
  { id: 'wizard',    label: 'Wizard'    },
];

const AGES = [3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── sub-components ─────────────────────────────────────────────────────────

function NameInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-[#0D3B66] placeholder-gray-400 outline-none transition-colors font-medium"
      style={{ fontFamily: "'Poppins', sans-serif" }}
      onFocus={e  => (e.target.style.borderColor = '#FF9933')}
      onBlur={e   => (e.target.style.borderColor = value ? '#FF9933' : '#e5e7eb')}
    />
  );
}

function AvatarGrid({
  selected, onSelect, disabledId,
}: { selected: CharacterId | null; onSelect: (id: CharacterId) => void; disabledId?: CharacterId | null }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {CHARACTERS.map(({ id, label }) => {
        const isSelected = selected === id;
        return (
          <motion.button
            key={id}
            onClick={() => onSelect(id)}
            className="flex flex-col items-center gap-1 focus:outline-none"
            whileTap={{ scale: 0.92 }}
            title={label}
          >
            <motion.div
              animate={isSelected ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative rounded-full overflow-hidden"
              style={{
                width: 52, height: 52,
                border: isSelected ? '3px solid #FF9933' : '3px solid transparent',
                boxShadow: isSelected ? '0 0 0 2px rgba(255,153,51,0.25)' : 'none',
                opacity: (!isSelected && selected) ? 0.45 : 1,
                transition: 'opacity 0.2s, border-color 0.2s, box-shadow 0.2s',
                background: '#f3f4f6',
              }}
            >
              <Image
                src={`/assets/characters/${id}.svg`}
                alt={label}
                fill
                className="object-cover"
              />
            </motion.div>
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: isSelected ? '#FF9933' : '#94a3b8' }}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── main page ───────────────────────────────────────────────────────────────

export default function FamilySetupPage() {
  const router = useRouter();
  const ctx = useOnboarding();

  const [childName,   setChildNameLocal]   = useState(ctx.childName);
  const [childAvatar, setChildAvatarLocal] = useState<CharacterId | null>(ctx.childAvatar);
  const [parentName,  setParentNameLocal]  = useState(ctx.parentName);
  const [parentAvatar,setParentAvatarLocal]= useState<CharacterId | null>(ctx.parentAvatar);
  const [age,         setAgeLocal]         = useState<number | null>(ctx.age);

  const isReady =
    childName.trim().length > 0 &&
    childAvatar !== null &&
    parentName.trim().length > 0 &&
    parentAvatar !== null &&
    age !== null;

  function handleNext() {
    if (!isReady) return;
    ctx.setChildName(childName.trim());
    ctx.setChildAvatar(childAvatar!);
    ctx.setParentName(parentName.trim());
    ctx.setParentAvatar(parentAvatar!);
    ctx.setAge(age!);
    router.push('/onboarding/character');
  }

  const cardClass = "bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-5";

  return (
    <div className="min-h-screen bg-[#F5F1E8] relative overflow-hidden">
      <FloatingClouds />

      <div className="relative z-10 flex flex-col items-center px-4 py-10 min-h-screen">

        {/* Progress bar */}
        <motion.div
          className="w-full max-w-3xl mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#0D3B66]/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Step 1 of 3
            </span>
            <span className="text-xs font-semibold text-[#FF9933]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Family Setup
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#0D3B66]/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF9933, #FF7F00)' }}
              initial={{ width: 0 }}
              animate={{ width: '33%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Page title */}
        <motion.h1
          className="font-quicksand text-3xl md:text-4xl font-bold text-[#0D3B66] mb-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Let's meet the family! 👋
        </motion.h1>

        {/* Cards row */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* ── Child Card ── */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Your Little Learner
            </p>

            <NameInput
              value={childName}
              onChange={setChildNameLocal}
              placeholder="What is your child's name?"
            />

            <div>
              <p className="font-quicksand text-sm font-bold text-[#0D3B66] mb-3">
                Pick their avatar
              </p>
              <AvatarGrid
                selected={childAvatar}
                onSelect={setChildAvatarLocal}
              />
            </div>
          </motion.div>

          {/* ── Parent Card ── */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
              The Grown-Up Guide
            </p>

            <NameInput
              value={parentName}
              onChange={setParentNameLocal}
              placeholder="What is your name?"
            />

            <div>
              <p className="font-quicksand text-sm font-bold text-[#0D3B66] mb-3">
                Pick your avatar
              </p>
              <AvatarGrid
                selected={parentAvatar}
                onSelect={setParentAvatarLocal}
              />
            </div>
          </motion.div>
        </div>

        {/* ── Age Section ── */}
        <motion.div
          className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <p className="font-quicksand text-base font-bold text-[#0D3B66] mb-1 text-center">
            How old is your child?
          </p>
          <p className="text-xs text-gray-400 text-center mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            This helps us pick the right games.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {AGES.map(n => {
              const isSelected = age === n;
              return (
                <motion.button
                  key={n}
                  onClick={() => setAgeLocal(n)}
                  animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.93 }}
                  className="w-12 h-12 rounded-full text-sm font-bold transition-colors focus:outline-none"
                  style={{
                    background: isSelected ? '#FF9933' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0D3B66',
                    border: isSelected ? '2px solid #FF9933' : '2px solid #e5e7eb',
                    boxShadow: isSelected ? '0 4px 14px rgba(255,153,51,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  {n}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Next Button ── */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
        >
          <motion.button
            onClick={handleNext}
            disabled={!isReady}
            whileHover={isReady ? { scale: 1.03, y: -2 } : {}}
            whileTap={isReady ? { scale: 0.97 } : {}}
            className="w-full py-4 rounded-full text-white font-bold text-lg transition-all"
            style={{
              fontFamily: "'Quicksand', sans-serif",
              background: isReady
                ? 'linear-gradient(135deg, #FF9933 0%, #FF7F00 100%)'
                : '#e5e7eb',
              color: isReady ? '#ffffff' : '#9ca3af',
              boxShadow: isReady ? '0 8px 24px rgba(255,153,51,0.38)' : 'none',
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: 'background 0.3s, box-shadow 0.3s, color 0.3s',
            }}
          >
            {isReady ? (
              <span className="flex items-center justify-center gap-3">
                Build Our World
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            ) : (
              'Fill in all fields to continue'
            )}
          </motion.button>

          {/* Completion hint dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[
              { label: 'Child name', done: childName.trim().length > 0 },
              { label: 'Child avatar', done: childAvatar !== null },
              { label: 'Parent name', done: parentName.trim().length > 0 },
              { label: 'Parent avatar', done: parentAvatar !== null },
              { label: 'Age', done: age !== null },
            ].map(({ label, done }) => (
              <motion.div
                key={label}
                title={label}
                animate={{ backgroundColor: done ? '#FF9933' : '#d1d5db' }}
                transition={{ duration: 0.25 }}
                className="w-2 h-2 rounded-full"
              />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
