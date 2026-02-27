'use client';

import { motion } from 'motion/react';

export default function LetterSkeleton() {
  return (
    <div className="relative parchment-card p-6 rounded-sm overflow-hidden animate-pulse">
      {/* Envelope Flap Effect */}
      <div className="absolute top-0 left-0 w-full h-3 bg-celtic-wood-dark/5" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-celtic-wood-dark/10" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-celtic-wood-dark/10 rounded" />
            <div className="h-3 w-20 bg-celtic-wood-dark/5 rounded" />
          </div>
        </div>
        
        <div className="w-12 h-12 rounded-full bg-celtic-wood-dark/10" />
      </div>
      
      <div className="h-6 w-full bg-celtic-wood-dark/5 rounded border-l-2 border-celtic-gold/20 pl-4" />
      
      <div className="mt-4 flex gap-2">
        <div className="h-4 w-12 bg-celtic-wood-dark/5 rounded-full" />
        <div className="h-4 w-16 bg-celtic-wood-dark/5 rounded-full" />
      </div>

      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      />
    </div>
  );
}
