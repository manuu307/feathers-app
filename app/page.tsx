'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Feather } from 'lucide-react';
import Onboarding from '@/components/Onboarding';
import Desk from '@/components/Desk';
import VideoBackground from '@/components/VideoBackground';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check local storage for existing user
    try {
      const storedUser = localStorage.getItem('feathers_user');
      if (storedUser) {
        // eslint-disable-next-line
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load user", e);
    }
  }, []);

  const handleUserCreated = (newUser: any) => {
    setUser(newUser);
    localStorage.setItem('feathers_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('feathers_user');
    setHasEntered(false);
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Cinematic Video Background */}
      <VideoBackground />

      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-10 flex flex-col items-center text-center space-y-12 max-w-2xl"
          >
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
                className="text-7xl md:text-9xl font-display tracking-tighter text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] uppercase italic"
              >
                Feathers
              </motion.h1>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <p className="text-xl md:text-2xl font-serif text-white/90 tracking-[0.5em] uppercase drop-shadow-md">
                Age of Correspondence
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 2 }}
              className="game-panel p-8 max-w-md border-white/20"
            >
              <p className="text-feathers-text font-serif text-lg leading-relaxed italic">
                &quot;The winds carry the whispers of the realm. Every scroll is a legacy, every bird a messenger of fate.&quot;
              </p>
              
              <div className="mt-10 flex flex-col space-y-4">
                <button 
                  className="game-button px-12 py-4 text-white font-display tracking-[0.2em] uppercase text-sm rounded-sm transition-all"
                  onClick={() => setHasEntered(true)}
                >
                  {user ? `Return as ${user.full_name}` : 'Enter the Realm'}
                </button>
                <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest font-serif">
                  <span>Version 2.5.0</span>
                  <span>© 2026 Feathers Corp.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-10 w-full flex justify-center"
          >
            {user ? (
              <Desk user={user} onLogout={handleLogout} />
            ) : (
              <Onboarding onUserCreated={handleUserCreated} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
