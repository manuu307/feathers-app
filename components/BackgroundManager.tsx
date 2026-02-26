'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2574&auto=format&fit=crop', // Foggy Forest
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2670&auto=format&fit=crop', // Ocean Ship
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop', // Mountain Lake
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop', // Starry Sky
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop', // Field
  'https://images.unsplash.com/photo-1550934482-786d2b798c30?q=80&w=2562&auto=format&fit=crop', // Horses
];

export default function BackgroundManager() {
  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    // Select a random background on mount
    const randomIndex = Math.floor(Math.random() * BACKGROUNDS.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setBgImage(BACKGROUNDS[randomIndex]);
  }, []);

  if (!bgImage) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-0"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
    </motion.div>
  );
}
