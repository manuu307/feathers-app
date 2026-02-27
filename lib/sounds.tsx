'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (soundName: keyof typeof SOUNDS) => void;
}

const SOUNDS = {
  paper: '/sounds/paper.mp3',
  bird: '/sounds/bird.mp3',
  stamp: '/sounds/stamp.mp3',
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);
  const [mounted, setMounted] = useState(false);
  const audioCache = React.useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      // Load muted state
      const saved = localStorage.getItem('celtic-sounds-muted');
      if (saved !== null) {
        setIsMuted(saved === 'true');
      }
    }, 0);

    // Preload sounds
    Object.entries(SOUNDS).forEach(([name, path]) => {
      const audio = new Audio(path);
      audio.load();
      audioCache.current[name] = audio;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      localStorage.setItem('celtic-sounds-muted', String(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    if (!mounted || isMuted) return;

    const audio = audioCache.current[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.4;
      audio.play().catch((err) => {
        console.log(`Audio playback for ${soundName} blocked or failed:`, err.message);
      });
    }
  }, [isMuted, mounted]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
