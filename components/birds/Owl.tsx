'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface OwlProps {
  state: 'idle' | 'flying' | 'landing';
  className?: string;
}

export default function Owl({ state, className }: OwlProps) {
  const [blink, setBlink] = useState(false);

  // Random blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000 + Math.random() * 2000); // Blink every 4-6 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  const bodyVariants = {
    idle: {
      y: [0, 2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    flying: {
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const wingLeftVariants = {
    idle: {
      rotate: [0, 2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
    },
    flying: {
      rotate: [0, -30, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const }
    }
  };

  const wingRightVariants = {
    idle: {
      rotate: [0, -2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
    },
    flying: {
      rotate: [0, 30, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const }
    }
  };

  return (
    <motion.div className={`relative w-full h-full ${className}`} animate={state}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Colors */}
        <defs>
          <linearGradient id="feather-grad" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8D6E63" /> {/* Brown */}
            <stop offset="100%" stopColor="#5D4037" /> {/* Dark Brown */}
          </linearGradient>
          <linearGradient id="chest-grad" x1="100" y1="50" x2="100" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D7CCC8" /> {/* Light Brown/Tan */}
            <stop offset="100%" stopColor="#A1887F" />
          </linearGradient>
          <radialGradient id="eye-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(50)">
            <stop stopColor="#FFECB3" />
            <stop offset="1" stopColor="#FF6F00" />
          </radialGradient>
        </defs>

        <motion.g variants={bodyVariants} initial="idle" animate={state}>
          {/* Left Wing */}
          <motion.g 
            variants={wingLeftVariants} 
            style={{ originX: 0.8, originY: 0.4 }} // Pivot near shoulder
            initial="idle"
            animate={state}
          >
             <path 
              d="M40 70 C 20 50, 10 90, 20 130 C 30 150, 50 140, 60 120 Z" 
              fill="url(#feather-grad)" 
              stroke="#3E2723" 
              strokeWidth="2"
            />
            {/* Feathers detail */}
            <path d="M20 130 Q 30 110 40 120" stroke="#3E2723" strokeWidth="1" fill="none"/>
            <path d="M25 120 Q 35 100 45 110" stroke="#3E2723" strokeWidth="1" fill="none"/>
          </motion.g>

          {/* Right Wing */}
          <motion.g 
            variants={wingRightVariants} 
            style={{ originX: 0.2, originY: 0.4 }} // Pivot near shoulder
            initial="idle"
            animate={state}
          >
            <path 
              d="M160 70 C 180 50, 190 90, 180 130 C 170 150, 150 140, 140 120 Z" 
              fill="url(#feather-grad)" 
              stroke="#3E2723" 
              strokeWidth="2"
            />
             {/* Feathers detail */}
             <path d="M180 130 Q 170 110 160 120" stroke="#3E2723" strokeWidth="1" fill="none"/>
             <path d="M175 120 Q 165 100 155 110" stroke="#3E2723" strokeWidth="1" fill="none"/>
          </motion.g>

          {/* Tail */}
          <path d="M80 150 L 100 180 L 120 150 Z" fill="#4E342E" />

          {/* Body */}
          <ellipse cx="100" cy="110" rx="45" ry="55" fill="url(#feather-grad)" stroke="#3E2723" strokeWidth="2" />
          
          {/* Chest/Belly Tuft */}
          <path 
            d="M70 100 Q 100 160 130 100 Q 100 110 70 100" 
            fill="url(#chest-grad)" 
            opacity="0.9"
          />
          {/* Chest Feather Texture */}
          <path d="M85 110 Q 90 115 95 110" stroke="#5D4037" strokeWidth="1" fill="none" />
          <path d="M105 110 Q 110 115 115 110" stroke="#5D4037" strokeWidth="1" fill="none" />
          <path d="M95 125 Q 100 130 105 125" stroke="#5D4037" strokeWidth="1" fill="none" />

          {/* Talons */}
          <path d="M85 160 L 80 170 L 90 170 Z" fill="#FFB300" stroke="#E65100" />
          <path d="M115 160 L 110 170 L 120 170 Z" fill="#FFB300" stroke="#E65100" />

          {/* Head */}
          <motion.g
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            {/* Head Shape */}
            <path 
              d="M60 60 Q 50 20 80 40 Q 100 30 120 40 Q 150 20 140 60 Q 150 80 100 85 Q 50 80 60 60" 
              fill="url(#feather-grad)" 
              stroke="#3E2723" 
              strokeWidth="2"
            />
            
            {/* Ear Tufts */}
            <path d="M62 55 L 55 30 L 75 45" fill="#4E342E" />
            <path d="M138 55 L 145 30 L 125 45" fill="#4E342E" />

            {/* Face Mask */}
            <path 
              d="M70 60 Q 85 80 100 70 Q 115 80 130 60 Q 135 45 120 45 Q 100 55 100 55 Q 100 55 80 45 Q 65 45 70 60" 
              fill="#D7CCC8" 
              stroke="#A1887F"
            />

            {/* Beak */}
            <path d="M95 70 L 100 85 L 105 70 Q 100 65 95 70" fill="#FF6F00" stroke="#E65100" />

            {/* Eyes Container */}
            <g>
              {/* Left Eye */}
              <circle cx="82" cy="58" r="10" fill="#FFB74D" stroke="#E65100" strokeWidth="2" />
              <circle cx="82" cy="58" r="4" fill="#000" />
              <circle cx="84" cy="56" r="1.5" fill="#FFF" />
              
              {/* Left Eyelid (Blink Animation) */}
              <motion.path 
                d="M70 58 Q 82 48 94 58" 
                fill="#8D6E63" 
                stroke="#5D4037"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: blink ? 1 : 0 }}
                style={{ originY: 0.5 }} // Blink from center/top
              />

              {/* Right Eye */}
              <circle cx="118" cy="58" r="10" fill="#FFB74D" stroke="#E65100" strokeWidth="2" />
              <circle cx="118" cy="58" r="4" fill="#000" />
              <circle cx="116" cy="56" r="1.5" fill="#FFF" />

               {/* Right Eyelid (Blink Animation) */}
               <motion.path 
                d="M106 58 Q 118 48 130 58" 
                fill="#8D6E63" 
                stroke="#5D4037"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: blink ? 1 : 0 }}
                style={{ originY: 0.5 }}
              />
            </g>
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
