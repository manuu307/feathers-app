'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, RefreshCw, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendLetterSchema, SendLetterInput } from '@/lib/validation';
import { MOCK_STAMPS } from '@/lib/mocks';

import Bird from '@/components/Bird';
import Stamp from '@/components/Stamp';

interface DeskProps {
  user: any;
  onLogout: () => void;
}

export default function Desk({ user, onLogout }: DeskProps) {
  const [view, setView] = useState<'idle' | 'writing' | 'reading'>('idle');
  const [letters, setLetters] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [birdState, setBirdState] = useState<'idle' | 'flying' | 'landing'>('idle');
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);

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
      // Assuming the user has an address at index 0
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
      setView('idle');
      reset();
      alert(`Your bird ${user.bird.name} has taken flight.`);
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center">
      {/* Header / Status */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-start p-8 z-20">
        <div>
          <h1 className="text-3xl font-display text-feathers-text drop-shadow-sm">{user.full_name}</h1>
          <p className="text-feathers-accent font-serif text-sm italic">@{user.addresses[0].address}</p>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={fetchLetters} className="text-feathers-muted hover:text-feathers-accent transition-colors p-2 bg-white/30 rounded-full backdrop-blur-sm shadow-sm">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={onLogout} className="text-feathers-muted hover:text-feathers-text text-xs uppercase tracking-[0.2em] font-display bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm">
            Leave
          </button>
        </div>
      </div>

      {/* Main Desk Area */}
      <AnimatePresence mode="wait">
        {view === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-16"
          >
            {/* Bird Placeholder */}
            <div className="relative group cursor-pointer" onClick={() => setView('writing')}>
              <div className="w-40 h-40 rounded-full bg-white/40 flex items-center justify-center border-2 border-feathers-accent/20 group-hover:border-feathers-accent/50 transition-all duration-700 overflow-hidden shadow-xl backdrop-blur-md">
                <Bird 
                  type={user.bird.type} 
                  state={birdState} 
                  className="w-24 h-24 text-feathers-accent/80 group-hover:text-feathers-accent transition-colors" 
                />
              </div>
              <p className="text-center mt-6 text-feathers-text font-display tracking-widest uppercase text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                Write a letter
              </p>
            </div>

            {/* Inbox */}
            <div className="w-full max-w-lg">
              <h3 className="text-center text-feathers-muted text-xs uppercase tracking-[0.3em] font-display mb-8">The Mailbox</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {letters.length === 0 ? (
                  <p className="text-center text-feathers-muted/60 font-serif italic text-lg">The winds have brought no news today.</p>
                ) : (
                  letters.map((letter) => (
                    <motion.div
                      key={letter._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        setSelectedLetter(letter);
                        setView('reading');
                      }}
                      className="relative p-6 bg-white/50 backdrop-blur-sm border border-feathers-muted/10 rounded-sm cursor-pointer hover:bg-white/80 transition-all group shadow-sm hover:shadow-md overflow-hidden"
                    >
                      {/* Envelope Flap Effect */}
                      <div className="absolute top-0 left-0 w-full h-2 bg-feathers-accent/10 group-hover:bg-feathers-accent/20 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-feathers-accent/60" />
                          <span className="text-feathers-accent font-display text-sm tracking-wider">From the Beyond</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-feathers-muted text-xs font-serif italic mb-2">
                            {new Date(letter.available_at).toLocaleDateString()}
                          </span>
                          {letter.stamp && (
                            <Stamp 
                              icon={letter.stamp.icon} 
                              color={letter.stamp.color} 
                              size="sm" 
                              className="rotate-3 group-hover:rotate-6 transition-transform" 
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-feathers-text text-sm font-serif group-hover:text-feathers-accent transition-colors italic">
                        A sealed scroll awaits your eyes...
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'writing' && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full max-w-3xl bg-feathers-paper text-feathers-ink p-16 rounded-sm shadow-2xl relative border border-feathers-muted/10"
          >
            <button 
              onClick={() => setView('idle')}
              className="absolute top-6 right-6 text-feathers-ink/40 hover:text-feathers-ink transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <h2 className="text-4xl font-display text-feathers-ink mb-12 text-center tracking-tight">Compose Scroll</h2>

            <form onSubmit={handleSubmit(onSend)} className="space-y-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-8">
                  <div className="relative mb-10">
                    <label className="block text-xs uppercase tracking-[0.2em] text-feathers-ink/40 mb-3 font-display">Recipient Address</label>
                    <input
                      {...register('receiver_address')}
                      className="w-full bg-transparent border-b-2 border-feathers-ink/10 py-3 text-feathers-ink font-serif text-xl focus:border-feathers-accent focus:outline-none transition-colors"
                      placeholder="E.g. north-watch-07"
                    />
                    {errors.receiver_address && <p className="text-red-700 text-xs mt-2 font-serif">{errors.receiver_address.message}</p>}
                  </div>

                  <div className="relative">
                    <textarea
                      {...register('content')}
                      rows={8}
                      className="w-full bg-transparent border-none resize-none text-feathers-ink font-serif text-xl leading-relaxed focus:ring-0 p-0 placeholder:text-feathers-ink/20 italic"
                      placeholder="My dearest friend, the sun rises over the valley..."
                    />
                    {errors.content && <p className="text-red-700 text-xs mt-2 font-serif">{errors.content.message}</p>}
                  </div>
                </div>

                {/* Stamp Selection */}
                <div className="w-32 flex flex-col items-center space-y-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-feathers-ink/40 font-display">Stamp</label>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_STAMPS.filter(s => user.stamps?.includes(s.id)).map((stamp) => (
                      <button
                        key={stamp.id}
                        type="button"
                        onClick={() => setValue('stamp_id', currentStampId === stamp.id ? undefined : stamp.id)}
                        className={`p-1 rounded-sm transition-all ${currentStampId === stamp.id ? 'bg-feathers-accent/20 ring-2 ring-feathers-accent/40' : 'hover:bg-feathers-ink/5'}`}
                      >
                        <Stamp icon={stamp.icon} color={stamp.color} size="md" />
                      </button>
                    ))}
                    {(!user.stamps || user.stamps.length === 0) && (
                      <div className="w-12 h-14 border-2 border-dashed border-feathers-ink/10 rounded-sm flex items-center justify-center">
                        <span className="text-[8px] text-feathers-ink/20 text-center px-1">No stamps</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {sendError && (
                <p className="text-red-700 text-sm text-center italic font-serif">{sendError}</p>
              )}

              <div className="flex justify-center pt-10">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-12 py-4 bg-feathers-accent text-white font-display tracking-[0.3em] uppercase text-xs hover:bg-feathers-accent/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
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

        {view === 'reading' && selectedLetter && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-3xl bg-feathers-paper text-feathers-ink p-16 rounded-sm shadow-2xl relative border border-feathers-muted/10"
          >
             <button 
              onClick={() => {
                setSelectedLetter(null);
                setView('idle');
              }}
              className="absolute top-6 right-6 text-feathers-ink/40 hover:text-feathers-ink transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="mb-12 text-center border-b border-feathers-ink/10 pb-6 relative">
              <p className="font-display text-xs text-feathers-ink/40 uppercase tracking-[0.3em] mb-3">Scroll Received</p>
              <p className="font-serif text-xl italic">{new Date(selectedLetter.available_at).toLocaleDateString()}</p>
              
              {selectedLetter.stamp && (
                <div className="absolute top-0 right-0">
                  <Stamp 
                    icon={selectedLetter.stamp.icon} 
                    color={selectedLetter.stamp.color} 
                    size="md" 
                    className="rotate-6" 
                  />
                </div>
              )}
            </div>

            <div 
              className="prose prose-p:font-serif prose-headings:font-display prose-p:text-feathers-ink prose-headings:text-feathers-ink max-w-none prose-p:text-xl prose-p:leading-relaxed prose-p:italic"
              dangerouslySetInnerHTML={{ __html: selectedLetter.content_rendered }}
            />

            <div className="mt-16 pt-10 border-t border-feathers-ink/10 text-center">
              <p className="font-script text-4xl text-feathers-ink/60">With regards,</p>
              <p className="font-display text-xs text-feathers-ink/40 mt-4 tracking-widest uppercase">A Traveler of the Realm</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
