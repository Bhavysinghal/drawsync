// apps/frontend/components/WakingUp.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Waking up the server…',
  'This can take up to a minute on the free tier…',
  'Almost there…',
  'Just a little longer…',
];

export function WakingUp({ visible }: { visible: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex(i => Math.min(i + 1, MESSAGES.length - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [visible]);

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
          {/* Animated logo — two circles orbiting in and out of overlap */}
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
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
          </svg>

          {/* Status text */}
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
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
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
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
  );
}