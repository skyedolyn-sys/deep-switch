import React from 'react';
import { motion } from 'framer-motion';

export function Sparkle() {
  return (
    <motion.div
      className="absolute bottom-12 right-12 pointer-events-none z-0 text-white/30"
      style={{ width: 44, height: 44 }}
      animate={{
        rotate: 360,
        y: [0, -12, 0],
      }}
      transition={{
        rotate: {
          repeat: Infinity,
          duration: 20,
          ease: 'linear',
        },
        y: {
          repeat: Infinity,
          duration: 5,
          ease: 'easeInOut',
        },
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 40 40"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 0C20 11 29 20 40 20C29 20 20 29 20 40C20 29 11 20 0 20C11 20 20 11 20 0Z" />
      </svg>
    </motion.div>
  );
}
