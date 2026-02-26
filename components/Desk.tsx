'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendLetterSchema, SendLetterInput } from '@/lib/validation';
import { MOCK_STAMPS } from '@/lib/mocks';

import Bird from '@/components/Bird';
import Stamp from '@/components/Stamp';
import Navigation from '@/components/Navigation';
import BackgroundManager from '@/components/BackgroundManager';
import ProfileView from '@/components/ProfileView';
import SearchView from '@/components/SearchView';

interface DeskProps {
  user: any;
  onLogout: () => void;
}

export default function Desk({ user: initialUser, onLogout }: DeskProps) {
  const [user, setUser] = useState(initialUser);
  const [view, setView] = useState('list'); // list, writing, reading, search, profile
  const [letters, setLetters] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [birdState, setBirdState] = useState<'idle' | 'flying' | 'landing'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SendLetterInput>({
    resolver: zodResolver(SendLetterSchema),
    defaultValues: {
      sender_id: user._id,
    },
  });

  const currentStampId = watch('stamp_id');

  const fetchLetters = useCallback(async () => {
    try {
      const address = user.addresses[0].address;
      const response = await fetch(`/api/letters/${address}`);
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
      console.error('Failed to fetch letters', error);
    }
  }, [user]);

  useEffect(() => {
    fetchLetters();
    const interval = setInterval(fetchLetters, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchLetters]);

  const onSend = async (data: SendLetterInput) => {
    setIsSending(true);
    setSendError(null);
    try {
      const response = await fetch('/api/letters/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send letter');
      }

      // Success animation/state
      setView('list');
      reset();
      alert(`Your bird ${user.bird.name} has taken flight.`);
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('feathers_user', JSON.stringify(updatedUser));
  };

  const handleSelectUser = (selectedUser: any) => {
    setValue('receiver_address', selectedUser.address);
    setView('writing');
  };

  return (
    <div className="relative min-h-screen w-full text-celtic-wood-dark">
      <BackgroundManager />
      
      <Navigation 
        currentView={view} 
        onViewChange={(v) => {
          setView(v);
          if (v !== 'reading') setSelectedLetter(null);
        }}
        onRefresh={fetchLetters}
        onLogout={onLogout}
      />

      <main className="relative z-10 pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* LIST VIEW */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl space-y-8"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-display text-white drop-shadow-md tracking-widest uppercase italic">The Mailbox</h2>
                <div className="h-0.5 w-32 bg-white/50 mx-auto mt-4" />
              </div>

              {letters.length === 0 ? (
                <div className="parchment-card p-12 text-center rounded-sm">
                  <p className="text-celtic-wood-light font-serif italic text-xl">The winds have brought no news today.</p>
                  <button 
                    onClick={() => setView('writing')}
                    className="mt-6 text-celtic-gold hover:text-celtic-wood-dark underline font-display text-sm uppercase tracking-widest"
                  >
                    Send a bird
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {letters.map((letter) => (
                    <motion.div
                      key={letter._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        setSelectedLetter(letter);
                        setView('reading');
                      }}
                      className="relative parchment-card p-6 rounded-sm cursor-pointer hover:-translate-y-1 transition-transform group overflow-hidden"
                    >
                      {/* Envelope Flap Effect */}
                      <div className="absolute top-0 left-0 w-full h-3 bg-celtic-wood-dark/5 group-hover:bg-celtic-wood-dark/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-celtic-wood-dark/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-celtic-wood-dark" />
                          </div>
                          <div>
                            <span className="block text-celtic-wood-dark font-display text-sm tracking-wider uppercase">From the Beyond</span>
                            <span className="text-celtic-wood-light text-xs font-serif italic">
                              {new Date(letter.available_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {letter.stamp && (
                          <div className="transform rotate-3 group-hover:rotate-6 transition-transform">
                            <Stamp 
                              icon={letter.stamp.icon} 
                              color={letter.stamp.color} 
                              size="sm" 
                            />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-celtic-wood-main text-lg font-serif italic line-clamp-2 border-l-2 border-celtic-gold/30 pl-4">
                        &quot;A sealed scroll awaits your eyes...&quot;
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* WRITING VIEW */}
          {view === 'writing' && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl parchment-card p-8 md:p-16 rounded-sm relative shadow-2xl"
            >
              <button 
                onClick={() => setView('list')}
                className="absolute top-6 right-6 text-celtic-wood-light hover:text-celtic-wood-dark transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <h2 className="text-4xl font-display text-celtic-wood-dark mb-12 text-center tracking-widest uppercase">Compose Scroll</h2>

              <form onSubmit={handleSubmit(onSend)} className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="flex-1 w-full">
                    <div className="relative mb-10">
                      <label className="block text-xs uppercase tracking-[0.2em] text-celtic-wood-light mb-3 font-display">Recipient Address</label>
                      <input
                        {...register('receiver_address')}
                        className="w-full bg-transparent border-b-2 border-celtic-wood-light/30 py-3 text-celtic-wood-dark font-serif text-2xl focus:border-celtic-gold focus:outline-none transition-colors placeholder:text-celtic-wood-light/30"
                        placeholder="E.g. north-watch-07"
                      />
                      {errors.receiver_address && <p className="text-red-700 text-xs mt-2 font-serif">{errors.receiver_address.message}</p>}
                    </div>

                    <div className="relative">
                      <textarea
                        {...register('content')}
                        rows={10}
                        className="w-full bg-transparent border-none resize-none text-celtic-wood-dark font-serif text-xl leading-relaxed focus:ring-0 p-0 placeholder:text-celtic-wood-light/30 italic"
                        placeholder="My dearest friend, the sun rises over the valley..."
                      />
                      {errors.content && <p className="text-red-700 text-xs mt-2 font-serif">{errors.content.message}</p>}
                    </div>
                  </div>

                  {/* Stamp Selection */}
                  <div className="w-full md:w-48 flex flex-col items-center space-y-6 p-6 bg-white/30 rounded-sm border border-celtic-wood-light/10">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-celtic-wood-light font-display">Select Seal</label>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                      {MOCK_STAMPS.filter(s => user.stamps?.includes(s.id)).map((stamp) => (
                        <button
                          key={stamp.id}
                          type="button"
                          onClick={() => setValue('stamp_id', currentStampId === stamp.id ? undefined : stamp.id)}
                          className={`p-2 rounded-sm transition-all flex justify-center ${currentStampId === stamp.id ? 'bg-celtic-gold/20 ring-2 ring-celtic-gold' : 'hover:bg-celtic-wood-dark/5'}`}
                        >
                          <Stamp icon={stamp.icon} color={stamp.color} size="md" />
                        </button>
                      ))}
                      {(!user.stamps || user.stamps.length === 0) && (
                        <div className="col-span-2 md:col-span-1 h-20 border-2 border-dashed border-celtic-wood-light/20 rounded-sm flex items-center justify-center">
                          <span className="text-[10px] text-celtic-wood-light/40 text-center px-2">No stamps available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {sendError && (
                  <p className="text-red-700 text-sm text-center italic font-serif bg-red-50 p-2 rounded-sm border border-red-100">{sendError}</p>
                )}

                <div className="flex justify-center pt-10 border-t border-celtic-wood-light/10">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-12 py-4 bg-celtic-wood-dark text-celtic-parchment font-display tracking-[0.3em] uppercase text-xs hover:bg-celtic-wood-main transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
                  >
                    {isSending ? 'The bird prepares...' : (
                      <>
                        Dispatch {user.bird.name} <Send className="w-4 h-4 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* READING VIEW */}
          {view === 'reading' && selectedLetter && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl parchment-card p-8 md:p-16 rounded-sm relative shadow-2xl"
            >
               <button 
                onClick={() => {
                  setSelectedLetter(null);
                  setView('list');
                }}
                className="absolute top-6 right-6 text-celtic-wood-light hover:text-celtic-wood-dark transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="mb-12 text-center border-b border-celtic-wood-light/20 pb-8 relative">
                <p className="font-display text-xs text-celtic-wood-light uppercase tracking-[0.3em] mb-3">Scroll Received</p>
                <p className="font-serif text-2xl italic text-celtic-wood-dark">{new Date(selectedLetter.available_at).toLocaleDateString()}</p>
                
                {selectedLetter.stamp && (
                  <div className="absolute top-0 right-0 transform rotate-12 drop-shadow-md">
                    <Stamp 
                      icon={selectedLetter.stamp.icon} 
                      color={selectedLetter.stamp.color} 
                      size="lg" 
                    />
                  </div>
                )}
              </div>

              <div className="prose prose-p:font-serif prose-headings:font-display prose-p:text-celtic-wood-dark prose-headings:text-celtic-wood-dark max-w-none">
                <p className="text-xl leading-loose italic whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
              </div>

              <div className="mt-16 pt-10 border-t border-celtic-wood-light/20 text-center">
                <p className="font-script text-4xl text-celtic-wood-dark/60">With regards,</p>
                <p className="font-display text-xs text-celtic-wood-light mt-4 tracking-widest uppercase">A Traveler of the Realm</p>
              </div>
            </motion.div>
          )}

          {/* PROFILE VIEW */}
          {view === 'profile' && (
            <ProfileView user={user} onUpdate={handleUpdateUser} />
          )}

          {/* SEARCH VIEW */}
          {view === 'search' && (
            <SearchView onSelectUser={handleSelectUser} />
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
