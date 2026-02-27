'use client';

import { motion } from 'motion/react';
import Owl from '@/components/birds/Owl';

interface BirdProps {
  type: 'owl' | 'raven' | 'dove' | 'falcon';
  state: 'idle' | 'flying' | 'landing';
  className?: string;
}

export default function Bird({ type, state, className }: BirdProps) {
  if (type === 'owl') {
    return <Owl state={state} className={className} />;
  }

  // Simplified SVG paths (placeholders for now, but distinct)
  const birdPaths: Record<string, string> = {
    raven: "M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z", 
    dove: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    falcon: "M12 2L2 22l10-3 10 3L12 2z",
  };

  const variants = {
    idle: {
      y: [0, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    flying: {
      x: [-20, 20],
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    },
    landing: {
      y: [-50, 0],
      scale: [1.2, 1],
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={variants as any}
      animate={state}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-feathers-accent drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
      >
        <path d={birdPaths[type] || birdPaths.raven} />
      </svg>
    </motion.div>
  );
}
