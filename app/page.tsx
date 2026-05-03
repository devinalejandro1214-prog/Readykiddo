'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FloatingClouds from './components/FloatingClouds';

const featurePills = [
  { icon: '🎮', label: 'Games & Challenges' },
  { icon: '📚', label: 'Reading & Math' },
  { icon: '🎨', label: 'Creative Play' },
  { icon: '⭐', label: 'Progress Rewards' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <FloatingClouds />

      <div className="text-center max-w-2xl relative z-10">

        {/* Logo */}
        <motion.div
          className="relative mb-10 inline-block"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,153,51,0.18) 0%, rgba(13,59,102,0.08) 55%, transparent 72%)',
              width: 420, height: 420,
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: -1,
            }}
          />
          <div
            className="rounded-3xl p-8 inline-block"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #fdf8f2 100%)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(13,59,102,0.10), 0 24px 48px rgba(255,153,51,0.12)',
              border: '1.5px solid rgba(255,255,255,0.9)',
            }}
          >
            <Image
              src="/ReadyKiddoLogo.jpeg"
              alt="ReadyKiddo"
              width={144}
              height={144}
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Tag */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(13,59,102,0.08)', color: '#0D3B66', border: '1.5px solid rgba(13,59,102,0.12)' }}
          >
            🌟 Personalized for every child · Ages 3–11
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl font-semibold text-[#0D3B66] mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        >
          Pick a character. Choose your world. Start the adventure.
        </motion.p>

        {/* Body copy */}
        <motion.p
          className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
        >
          ReadyKiddo builds a learning experience around <em>your</em> child — their pace,
          their interests, their way of growing.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
        >
          {featurePills.map(p => (
            <span
              key={p.label}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-[#0D3B66]"
              style={{
                background: 'rgba(255,255,255,0.75)',
                border: '1.5px solid rgba(13,59,102,0.10)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {p.icon} {p.label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="mb-5"
        >
          <Link href="/onboarding/setup">
            <motion.span
              className="inline-flex items-center gap-3 text-white font-bold py-4 px-14 rounded-full text-lg cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF9933 0%, #FF7F00 100%)',
                boxShadow: '0 8px 24px rgba(255,153,51,0.40)',
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '1.1rem',
              }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Build Your World
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.span>
          </Link>
        </motion.div>

        {/* Parent line */}
        <motion.p
          className="text-sm text-gray-500 flex items-center justify-center gap-2 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.45 }}
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.5L10 14.8l-4.9 2.4.9-5.5L2 7.8l5.5-.8z" fill="#FF9933"/>
          </svg>
          Parents get real-time insight into every milestone their child reaches.
        </motion.p>
      </div>
    </div>
  );
}
