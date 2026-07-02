// apps/frontend/components/WakingUp.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Sharpening the pencils…',
  'Unrolling the canvas…',
  'Arranging the sticky notes…',
  'Waking up your workspace…',
  'Almost ready to draw…',
];

export function WakingUp({ visible }: { visible: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'compact'>('intro');

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      setPhase('intro');
      return;
    }

    // Show the big centered animation first, then shrink down
    // into the compact layout with rotating status text — makes
    // the wait feel shorter and more intentional.
    const introTimer = setTimeout(() => setPhase('compact'), 2600);

    const messageInterval = setInterval(() => {
      setMessageIndex(i => Math.min(i + 1, MESSAGES.length - 1));
    }, 7000);

    return () => {
      clearTimeout(introTimer);
      clearInterval(messageInterval);
    };
  }, [visible]);

  const logoSize = phase === 'intro' ? { w: 200, h: 150 } : { w: 110, h: 82 };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'var(--canvas)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 28,
          }}
        >
          {/* Animated logo — two circles orbiting in and out of overlap.
              Starts big and centered, then shrinks into the compact layout. */}
          <motion.svg
            viewBox="0 0 120 90"
            fill="none"
            animate={{ width: logoSize.w, height: logoSize.h }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <motion.circle
              cy="45" r="30"
              stroke="var(--coral)" strokeWidth="2.5"
              fill="var(--coral)" fillOpacity="0.12"
              animate={{ cx: [42, 34, 42] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cy="45" r="30"
              stroke="var(--ink)" strokeWidth="2.5"
              fill="var(--ink)" fillOpacity="0.06"
              animate={{ cx: [78, 86, 78] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.ellipse
              cy="45" rx="13" ry="22"
              fill="var(--coral)"
              animate={{
                cx: [60, 60, 60],
                fillOpacity: [0.35, 0.75, 0.35],
                ry: [22, 26, 22],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.svg>

          {/* Status text — only appears once the logo has settled into
              the compact size, so the intro feels clean and uncluttered. */}
          <AnimatePresence>
            {phase === 'compact' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'center', maxWidth: 320 }}
              >
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400,
                  color: 'var(--ink)', marginBottom: 8,
                }}>
                  DrawSync
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: 'var(--muted-color)', fontSize: 14 }}
                  >
                    {MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 18 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--coral)',
                      }}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{
                        duration: 1.2, repeat: Infinity,
                        delay: i * 0.2, ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}