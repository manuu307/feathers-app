'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Mail, ChevronLeft, ChevronRight, Tag, Save, Trash2, Filter, StickyNote } from 'lucide-react';
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
import NotesManager from '@/components/NotesManager';
import DraftsManager from '@/components/DraftsManager';
import LetterSkeleton from '@/components/LetterSkeleton';
import StampMarket from '@/components/StampMarket';
import Envelope from '@/components/Envelope';
import { useLanguage } from '@/lib/i18n';
import { useSound } from '@/lib/sounds';
import { Eraser } from 'lucide-react';

interface DeskProps {
  user: any;
  onLogout: () => void;
}

export default function Desk({ user: initialUser, onLogout }: DeskProps) {
  const { t } = useLanguage();
  const { playSound } = useSound();
  const [user, setUser] = useState(initialUser);
  const [view, setView] = useState('list'); // list, writing, reading, search, profile, notes
  const [letters, setLetters] = useState<any[]>([]);
  const [isLettersLoading, setIsLettersLoading] = useState(true);
  const [allStamps, setAllStamps] = useState<any[]>([]);
  const [allEnvelopes, setAllEnvelopes] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stampsRes, envelopesRes] = await Promise.all([
          fetch('/api/stamps'),
          fetch('/api/envelopes')
        ]);
        
        if (stampsRes.ok) {
          setAllStamps(await stampsRes.json());
        }
        if (envelopesRes.ok) {
          setAllEnvelopes(await envelopesRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch assets', error);
      }
    };
    fetchData();
  }, []);
  const [currentPage, setCurrentPage] = useState(0);
  const [writingPages, setWritingPages] = useState<string[]>(['']);
  const [currentWritingPage, setCurrentWritingPage] = useState(0);
  const CHARS_PER_PAGE = 600;
  const PAGE_DELIMITER = '\f';
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [birdState, setBirdState] = useState<'idle' | 'flying' | 'landing'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  // Tagging & Saving State
  const [mailboxTab, setMailboxTab] = useState<'inbox' | 'saved' | 'sent'>('inbox');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [readingTags, setReadingTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Notes State
  const [showNotesSidebar, setShowNotesSidebar] = useState(false);

  // Drafts State
  const [showDraftsSidebar, setShowDraftsSidebar] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

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

  const fetchLetters = useCallback(async (showLoading = false) => {
    if (!user?.addresses?.[0]?.address) {
      console.warn('No user address found, skipping fetch');
      setIsLettersLoading(false);
      return;
    }

    if (showLoading) setIsLettersLoading(true);
    try {
      const address = user.addresses[0].address;
      let url = `/api/letters/${address}`;
      const params = new URLSearchParams();
      
      if (mailboxTab === 'saved') params.append('type', 'saved');
      if (mailboxTab === 'sent') {
        params.append('type', 'sent');
        params.append('userId', user._id);
      }
      
      const queryString = params.toString();
      const response = await fetch(queryString ? `${url}?${queryString}` : url);
      
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error fetching letters:', response.status, errorData);
      }
    } catch (error) {
      console.error('Network Error fetching letters:', error);
    } finally {
      setIsLettersLoading(false);
    }
  }, [user, mailboxTab]);

  useEffect(() => {
    setLetters([]); 
    fetchLetters(true);
    const interval = setInterval(() => fetchLetters(false), 30000); // Poll every 30s silently
    return () => clearInterval(interval);
  }, [fetchLetters]);

  const handleCloseLetter = async (action: 'save' | 'drop') => {
    if (!selectedLetter) return;
    playSound('click');

    try {
      const response = await fetch('/api/letters/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLetter._id,
          status: action === 'save' ? 'saved' : 'dropped',
          tags: readingTags
        }),
      });

      if (response.ok) {
        setSelectedLetter(null);
        setShowCloseConfirmation(false);
        setReadingTags([]);
        setView('list');
        fetchLetters(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to update letter status', error);
    }
  };

  const saveDraft = async () => {
    const fullContent = writingPages.join(PAGE_DELIMITER);
    if (!fullContent.trim()) return;

    try {
      const url = currentDraftId ? `/api/drafts/${currentDraftId}` : '/api/drafts';
      const method = currentDraftId ? 'PUT' : 'POST';
      const body: any = {
        content: fullContent,
        receiver_address: watch('receiver_address'),
        stamp_id: watch('stamp_id'),
        scheduled_at: watch('scheduled_at'),
      };
      
      if (!currentDraftId) {
        body.sender_id = user._id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const draft = await response.json();
        setCurrentDraftId(draft._id);
      }
    } catch (error) {
      console.error('Failed to save draft', error);
    }
  };

  // Auto-save draft when leaving writing view
  useEffect(() => {
    return () => {
      if (view === 'writing') {
        // We can't use async in cleanup, but we can fire and forget or use sendBeacon if needed.
        // However, since state might be stale in cleanup, we handle it in onViewChange
      }
    };
  }, [view]);

  const handleViewChange = async (newView: string) => {
    if (view === 'writing') {
      await saveDraft();
      // Reset writing state if leaving writing view
      if (newView !== 'writing') {
         // Don't reset immediately if we want to keep state? 
         // Actually user requested "when he abandon that position".
         // So we save and then clear.
         setWritingPages(['']);
         setCurrentWritingPage(0);
         setCurrentDraftId(null);
         reset();
      }
    }
    if (newView === 'sent') {
      setMailboxTab('sent');
      setView('list');
      setSelectedTag(null);
      return;
    }
    if (newView === 'list') {
      setMailboxTab('inbox');
      setSelectedTag(null);
    }
    setView(newView);
    if (newView !== 'reading') setSelectedLetter(null);
    if (newView === 'writing') {
      // Reset handled above or when entering?
      // If entering writing view fresh, we want empty state.
      // If we clicked "Write" from nav, we want empty state.
      // If we clicked a draft, we handle that separately.
    }
  };

  const handleSelectDraft = (draft: any) => {
    playSound('paper');
    setWritingPages(draft.content.split(PAGE_DELIMITER));
    setValue('receiver_address', draft.receiver_address || '');
    setValue('stamp_id', draft.stamp_id);
    setValue('scheduled_at', draft.scheduled_at ? new Date(draft.scheduled_at).toISOString().slice(0, 16) : '');
    setCurrentDraftId(draft._id);
    setShowDraftsSidebar(false);
    setView('writing');
  };

  const onSend = async (data: SendLetterInput) => {
    setIsSending(true);
    setSendError(null);
    playSound('bird');
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

      if (currentDraftId) {
        await fetch(`/api/drafts/${currentDraftId}`, { method: 'DELETE' });
        setCurrentDraftId(null);
      }

      playSound('success');
      // Success animation/state
      setView('list');
      reset();
      setWritingPages(['']);
      setCurrentWritingPage(0);
      alert(t.writing.success.replace('{name}', user.bird.name));
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
    setWritingPages(['']);
    setCurrentWritingPage(0);
    reset();
    setValue('receiver_address', selectedUser.address);
    setView('writing');
  };

  return (
    <div className="relative min-h-screen w-full text-celtic-wood-dark">
      <BackgroundManager />
      
      <Navigation 
        currentView={view} 
        onViewChange={handleViewChange}
        onRefresh={() => fetchLetters(true)}
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
              <div className="text-center mb-8">
                <h2 className="text-4xl font-display text-white drop-shadow-md tracking-widest uppercase italic">{t.mailbox.title}</h2>
                <div className="h-0.5 w-32 bg-white/50 mx-auto mt-4" />
              </div>

              {/* Tabs */}
              <div className="flex justify-center space-x-8 mb-8">
                <button
                  onClick={() => { setMailboxTab('inbox'); setSelectedTag(null); }}
                  className={`text-lg font-display tracking-widest uppercase transition-colors ${mailboxTab === 'inbox' ? 'text-celtic-gold border-b-2 border-celtic-gold' : 'text-white/60 hover:text-white'}`}
                >
                  {t.mailbox.inbox}
                </button>
                <button
                  onClick={() => { setMailboxTab('saved'); setSelectedTag(null); }}
                  className={`text-lg font-display tracking-widest uppercase transition-colors ${mailboxTab === 'saved' ? 'text-celtic-gold border-b-2 border-celtic-gold' : 'text-white/60 hover:text-white'}`}
                >
                  {t.mailbox.saved}
                </button>
                <button
                  onClick={() => { setMailboxTab('sent'); setSelectedTag(null); }}
                  className={`text-lg font-display tracking-widest uppercase transition-colors ${mailboxTab === 'sent' ? 'text-celtic-gold border-b-2 border-celtic-gold' : 'text-white/60 hover:text-white'}`}
                >
                  {t.mailbox.sent}
                </button>
              </div>

              {/* Tag Filters (Only in Saved) */}
              {mailboxTab === 'saved' && letters.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 rounded-full text-xs font-display tracking-wider uppercase transition-colors ${!selectedTag ? 'bg-celtic-gold text-celtic-wood-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {t.mailbox.all}
                  </button>
                  {Array.from(new Set(letters.flatMap(l => l.tags || []))).map((tag: any) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-display tracking-wider uppercase transition-colors ${selectedTag === tag ? 'bg-celtic-gold text-celtic-wood-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {(() => {
                if (isLettersLoading) {
                  return (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <LetterSkeleton key={i} />
                      ))}
                    </div>
                  );
                }

                const displayedLetters = selectedTag 
                  ? letters.filter(l => l.tags?.includes(selectedTag))
                  : letters;

                if (displayedLetters.length === 0) {
                  return (
                    <div className="parchment-card p-12 text-center rounded-sm">
                      <p className="text-celtic-wood-light font-serif italic text-xl">
                        {mailboxTab === 'sent' ? t.mailbox.noSent : (mailboxTab === 'saved' ? t.mailbox.noSaved : t.mailbox.empty)}
                      </p>
                      {mailboxTab === 'inbox' && (
                        <button 
                          onClick={() => setView('writing')}
                          className="mt-6 text-celtic-gold hover:text-celtic-wood-dark underline font-display text-sm uppercase tracking-widest"
                        >
                          {t.mailbox.sendBird}
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {displayedLetters.map((letter) => {
                      const envelope = allEnvelopes.find(e => (e._id || e.id) === letter.envelope_id) || 
                        allEnvelopes.find(e => e.is_default) || 
                        { layout: 'classic', css_class: 'bg-[#f0e6d2] border border-[#d7c9a8]' };
                      
                      const letterStamps = (letter.stamps || [letter.stamp_id]).map((sid: string) => 
                        allStamps.find(s => (s._id || s.id) === sid)
                      ).filter(Boolean);

                      return (
                        <motion.div
                          key={letter._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            playSound('paper');
                            setSelectedLetter(letter);
                            setCurrentPage(0);
                            setReadingTags(letter.tags || []);
                            setView('reading');
                          }}
                          className="cursor-pointer hover:-translate-y-1 transition-transform flex flex-col items-center"
                        >
                          <Envelope
                            layout={envelope.layout}
                            cssClass={envelope.css_class}
                            senderAddress={letter.sender_id?.addresses?.[0]?.address || 'Unknown'}
                            receiverAddress={letter.receiver_address}
                            stamps={letterStamps}
                            size="md"
                          />
                          
                          {/* Tags in Card */}
                          {letter.tags && letter.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2 justify-center">
                              {letter.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] uppercase tracking-wider text-celtic-wood-light bg-celtic-wood-dark/5 px-2 py-0.5 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* WRITING VIEW */}
          {view === 'writing' && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl parchment-card p-8 md:p-16 rounded-sm relative shadow-2xl flex flex-col min-h-[700px]"
            >
              <button 
                onClick={() => setView('list')}
                className="absolute top-6 right-6 text-celtic-wood-light hover:text-celtic-wood-dark transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="absolute top-6 left-6 flex items-center gap-6 md:gap-8">
                {/* Notes Toggle */}
                <button 
                  onClick={() => setShowNotesSidebar(!showNotesSidebar)}
                  className={`transition-colors flex items-center gap-2 ${showNotesSidebar ? 'text-celtic-gold' : 'text-celtic-wood-light hover:text-celtic-wood-dark'}`}
                  title={t.notes.title}
                >
                  <StickyNote className="w-6 h-6" />
                  <span className="text-[10px] uppercase tracking-widest font-display hidden md:inline">{t.notes.title}</span>
                </button>

                {/* Drafts Toggle */}
                <button 
                  onClick={() => setShowDraftsSidebar(!showDraftsSidebar)}
                  className={`transition-colors flex items-center gap-2 ${showDraftsSidebar ? 'text-celtic-gold' : 'text-celtic-wood-light hover:text-celtic-wood-dark'}`}
                  title={t.drafts.title}
                >
                  <Eraser className="w-6 h-6" />
                  <span className="text-[10px] uppercase tracking-widest font-display hidden md:inline">{t.drafts.title}</span>
                </button>
              </div>

              <h2 className="text-4xl font-display text-celtic-wood-dark mb-12 text-center tracking-widest uppercase">{t.writing.title}</h2>

              <form 
                onSubmit={handleSubmit((data) => {
                  const fullContent = writingPages.join(PAGE_DELIMITER);
                  onSend({ ...data, content: fullContent });
                })} 
                className="space-y-10 flex-grow flex flex-col"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 flex-grow">
                  <div className="flex-1 w-full flex flex-col">
                    <div className="relative mb-10">
                      <label className="block text-xs uppercase tracking-[0.2em] text-celtic-wood-light mb-3 font-display">{t.writing.recipient}</label>
                      <input
                        {...register('receiver_address')}
                        className="w-full bg-transparent border-b-2 border-celtic-wood-light/30 py-3 text-celtic-wood-dark font-serif text-2xl focus:border-celtic-gold focus:outline-none transition-colors placeholder:text-celtic-wood-light/30"
                        placeholder="E.g. north-watch-07"
                      />
                      {errors.receiver_address && <p className="text-red-700 text-xs mt-2 font-serif">{errors.receiver_address.message}</p>}
                    </div>

                    <div className="relative mb-10">
                      <label className="block text-xs uppercase tracking-[0.2em] text-celtic-wood-light mb-3 font-display">{t.writing.schedule}</label>
                      <input
                        type="datetime-local"
                        {...register('scheduled_at')}
                        className="w-full bg-transparent border-b-2 border-celtic-wood-light/30 py-3 text-celtic-wood-dark font-serif text-xl focus:border-celtic-gold focus:outline-none transition-colors"
                      />
                      {errors.scheduled_at && <p className="text-red-700 text-xs mt-2 font-serif">{errors.scheduled_at.message}</p>}
                    </div>

                    <div className="relative flex-grow flex flex-col">
                      <textarea
                        value={writingPages[currentWritingPage]}
                        onChange={(e) => {
                          const newPages = [...writingPages];
                          newPages[currentWritingPage] = e.target.value;
                          setWritingPages(newPages);
                          // Sync with form for validation (though we use joined content on submit)
                          setValue('content', newPages.join(PAGE_DELIMITER));
                        }}
                        rows={12}
                        className="w-full bg-transparent border-none resize-none text-celtic-wood-dark font-serif text-xl leading-relaxed focus:ring-0 p-0 placeholder:text-celtic-wood-light/30 italic flex-grow"
                        placeholder={t.writing.placeholder}
                      />
                      {errors.content && <p className="text-red-700 text-xs mt-2 font-serif">{errors.content.message}</p>}
                    </div>

                    {/* Writing Pagination Controls */}
                    <div className="mt-6 flex items-center justify-between border-t border-celtic-wood-light/10 pt-6">
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          disabled={currentWritingPage === 0}
                          onClick={() => {
                            playSound('paper');
                            setCurrentWritingPage(prev => prev - 1);
                          }}
                          className="p-2 text-celtic-wood-light hover:text-celtic-gold disabled:opacity-20 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <span className="font-serif italic text-celtic-wood-light text-sm">
                          {t.writing.page} {currentWritingPage + 1} / {writingPages.length}
                        </span>

                        <button
                          type="button"
                          disabled={currentWritingPage === writingPages.length - 1}
                          onClick={() => {
                            playSound('paper');
                            setCurrentWritingPage(prev => prev + 1);
                          }}
                          className="p-2 text-celtic-wood-light hover:text-celtic-gold disabled:opacity-20 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {writingPages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const currentPageContent = writingPages[currentWritingPage];
                              if (currentPageContent.trim().length > 0) {
                                if (!window.confirm(t.writing.confirmRemovePage)) {
                                  return;
                                }
                              }
                              const newPages = writingPages.filter((_, i) => i !== currentWritingPage);
                              setWritingPages(newPages);
                              setCurrentWritingPage(Math.max(0, currentWritingPage - 1));
                            }}
                            className="text-[10px] uppercase tracking-widest font-display text-red-700/60 hover:text-red-700 transition-colors"
                          >
                            {t.writing.removePage}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newPages = [...writingPages];
                            newPages.splice(currentWritingPage + 1, 0, '');
                            setWritingPages(newPages);
                            setCurrentWritingPage(currentWritingPage + 1);
                          }}
                          className="px-4 py-2 border border-celtic-gold/30 text-celtic-gold hover:bg-celtic-gold/5 transition-colors text-[10px] uppercase tracking-widest font-display rounded-sm"
                        >
                          {t.writing.addPage}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Envelope and Stamp Selection */}
                  <div className="w-full md:w-64 flex flex-col space-y-6 p-6 bg-white/30 rounded-sm border border-celtic-wood-light/10">
                    
                    {/* Envelope Selection */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-celtic-wood-light font-display block mb-4">{t.writing.selectEnvelope || 'Select Envelope'}</label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {allEnvelopes.filter(e => e.is_default || user.envelopes?.includes(e._id || e.id)).map((env) => (
                          <button
                            key={env._id || env.id}
                            type="button"
                            onClick={() => setValue('envelope_id', env._id || env.id)}
                            className={`p-2 rounded-sm text-left text-xs font-display uppercase tracking-wider transition-all ${watch('envelope_id') === (env._id || env.id) ? 'bg-celtic-wood-dark text-celtic-parchment' : 'hover:bg-celtic-wood-dark/5 text-celtic-wood-dark'}`}
                          >
                            {env.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stamp Selection */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-celtic-wood-light font-display block mb-4">{t.writing.selectSeal}</label>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {user.stamps?.filter((s: any) => s.quantity > 0).map((inventoryItem: any) => {
                          const stamp = allStamps.find(s => (s._id || s.id) === inventoryItem.stamp_id);
                          if (!stamp) return null;
                          
                          const stampId = stamp._id || stamp.id;
                          const currentStamps = watch('stamps') || [];
                          const isSelected = currentStamps.includes(stampId);

                          return (
                            <button
                              key={stampId}
                              type="button"
                              onClick={() => {
                                playSound('stamp');
                                const current = watch('stamps') || [];
                                if (current.includes(stampId)) {
                                  setValue('stamps', current.filter((id: string) => id !== stampId));
                                } else if (current.length < 3) {
                                  setValue('stamps', [...current, stampId]);
                                }
                              }}
                              className={`p-2 rounded-sm transition-all flex flex-col items-center justify-center relative ${isSelected ? 'bg-celtic-gold/20 ring-2 ring-celtic-gold' : 'hover:bg-celtic-wood-dark/5'}`}
                            >
                              <Stamp icon={stamp.icon} color={stamp.color} size="md" />
                              <span className="text-[8px] mt-1 text-celtic-wood-light font-display">x{inventoryItem.quantity}</span>
                              {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-celtic-gold rounded-full" />}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-celtic-wood-light italic mt-2 text-center">
                        {(watch('stamps') || []).length}/3 selected
                      </p>
                    </div>
                  </div>
                </div>

                {/* Envelope Preview */}
                <div className="mt-8 flex justify-center">
                  {(() => {
                    const envId = watch('envelope_id');
                    const envelope = allEnvelopes.find(e => (e._id || e.id) === envId) || allEnvelopes[0];
                    const selectedStamps = (watch('stamps') || []).map((sid: string) => allStamps.find(s => (s._id || s.id) === sid)).filter(Boolean);
                    
                    if (!envelope) return null;

                    return (
                      <div className="transform scale-75 md:scale-100 origin-top">
                        <Envelope
                          layout={envelope.layout}
                          cssClass={envelope.css_class}
                          senderAddress={user.addresses[0].address}
                          receiverAddress={watch('receiver_address') || 'Recipient'}
                          stamps={selectedStamps}
                          size="md"
                        />
                      </div>
                    );
                  })()}
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
                    {isSending ? t.writing.preparing : (
                      <>
                        {t.writing.dispatch} {user.bird.name} <Send className="w-4 h-4 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* READING VIEW */}
          {view === 'reading' && selectedLetter && (() => {
            const content = selectedLetter.content || '';
            let pages = [];
            
            if (content.includes(PAGE_DELIMITER)) {
              pages = content.split(PAGE_DELIMITER);
            } else {
              for (let i = 0; i < content.length; i += CHARS_PER_PAGE) {
                pages.push(content.substring(i, i + CHARS_PER_PAGE));
              }
            }
            
            const totalPages = Math.max(1, pages.length);
            const currentPageContent = pages[currentPage] || '';

            return (
              <motion.div
                key="reading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl parchment-card p-8 md:p-16 rounded-sm relative shadow-2xl flex flex-col min-h-[600px]"
              >
                <button 
                  onClick={() => setShowCloseConfirmation(true)}
                  className="absolute top-6 right-6 text-celtic-wood-light hover:text-celtic-wood-dark transition-colors z-10"
                >
                  <X className="w-8 h-8" />
                </button>

                <div className="mb-12 text-center border-b border-celtic-wood-light/20 pb-8 relative">
                  <p className="font-display text-xs text-celtic-wood-light uppercase tracking-[0.3em] mb-3">{t.reading.received}</p>
                  <p className="font-serif text-2xl italic text-celtic-wood-dark">
                    {mounted ? new Date(selectedLetter.available_at).toLocaleDateString() : '...'}
                  </p>
                  
                  {(() => {
                    const stamp = allStamps.find(s => (s._id || s.id) === selectedLetter.stamp_id);
                    if (!stamp) return null;
                    return (
                      <div className="absolute top-0 right-0 transform rotate-12 drop-shadow-md">
                        <Stamp 
                          icon={stamp.icon} 
                          color={stamp.color} 
                          size="lg" 
                        />
                      </div>
                    );
                  })()}
                </div>

                <div className="flex-grow prose prose-p:font-serif prose-headings:font-display prose-p:text-celtic-wood-dark prose-headings:text-celtic-wood-dark max-w-none">
                  <p className="text-xl leading-loose italic whitespace-pre-wrap">
                    {currentPageContent}
                  </p>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-celtic-wood-light/10 pt-6">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => {
                        playSound('paper');
                        setCurrentPage(prev => Math.max(0, prev - 1));
                      }}
                      className="flex items-center space-x-2 text-celtic-wood-light hover:text-celtic-gold disabled:opacity-20 transition-colors uppercase font-display text-[10px] tracking-widest"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{t.reading.prev}</span>
                    </button>
                    
                    <span className="font-serif italic text-celtic-wood-light text-sm">
                      {t.reading.page} {currentPage + 1} / {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages - 1}
                      onClick={() => {
                        playSound('paper');
                        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
                      }}
                      className="flex items-center space-x-2 text-celtic-wood-light hover:text-celtic-gold disabled:opacity-20 transition-colors uppercase font-display text-[10px] tracking-widest"
                    >
                      <span>{t.reading.next}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Tagging Section */}
                <div className="mt-12 pt-8 border-t border-celtic-wood-light/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-celtic-wood-light" />
                    <span className="text-xs font-display uppercase tracking-widest text-celtic-wood-light">{t.reading.tags}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {readingTags.map(tag => (
                      <span key={tag} className="bg-celtic-wood-dark/5 text-celtic-wood-dark px-3 py-1 rounded-full text-xs font-display tracking-wider flex items-center gap-2">
                        #{tag}
                        <button 
                          onClick={() => setReadingTags(prev => prev.filter(t => t !== tag))}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTag.trim() && !readingTags.includes(newTag.trim())) {
                            setReadingTags([...readingTags, newTag.trim()]);
                            setNewTag('');
                          }
                        }
                      }}
                      placeholder={t.reading.addTag}
                      className="bg-transparent border-b border-celtic-wood-light/30 py-1 text-sm font-serif focus:border-celtic-gold focus:outline-none placeholder:italic placeholder:text-celtic-wood-light/40"
                    />
                    <button
                      onClick={() => {
                        if (newTag.trim() && !readingTags.includes(newTag.trim())) {
                          setReadingTags([...readingTags, newTag.trim()]);
                          setNewTag('');
                        }
                      }}
                      className="text-celtic-gold hover:text-celtic-wood-dark"
                    >
                      <span className="text-xs uppercase font-display tracking-widest">+</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-celtic-wood-light/20 text-center">
                  <p className="font-script text-4xl text-celtic-wood-dark/60">{t.reading.regards}</p>
                  <p className="font-display text-xs text-celtic-wood-light mt-4 tracking-widest uppercase">{t.reading.traveler}</p>
                </div>

                {/* Close Confirmation Modal */}
                <AnimatePresence>
                  {showCloseConfirmation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-sm"
                    >
                      <div className="text-center p-8 max-w-sm">
                        <h3 className="font-display text-xl text-celtic-wood-dark mb-4 uppercase tracking-widest">{t.reading.saveOrDrop}</h3>
                        <p className="font-serif italic text-celtic-wood-light mb-8">{t.reading.saveOrDropDesc}</p>
                        
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleCloseLetter('drop')}
                            className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-700 hover:bg-red-50 transition-colors font-display text-xs uppercase tracking-widest rounded-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t.reading.drop}
                          </button>
                          <button
                            onClick={() => handleCloseLetter('save')}
                            className="flex items-center gap-2 px-6 py-3 bg-celtic-wood-dark text-celtic-parchment hover:bg-celtic-wood-main transition-colors font-display text-xs uppercase tracking-widest rounded-sm shadow-lg"
                          >
                            <Save className="w-4 h-4" />
                            {t.reading.save}
                          </button>
                        </div>
                        <button 
                          onClick={() => setShowCloseConfirmation(false)}
                          className="mt-6 text-xs text-celtic-wood-light underline hover:text-celtic-wood-dark"
                        >
                          {t.profile.cancel}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })()}

          {/* PROFILE VIEW */}
          {view === 'profile' && (
            <ProfileView user={user} onUpdate={handleUpdateUser} />
          )}

          {/* SEARCH VIEW */}
          {view === 'search' && (
            <SearchView onSelectUser={handleSelectUser} />
          )}

          {/* MARKET VIEW */}
          {view === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl"
            >
              <StampMarket user={user} onUpdateUser={handleUpdateUser} />
            </motion.div>
          )}

          {/* NOTES VIEW */}
          {view === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl h-[80vh]"
            >
              <NotesManager userId={user._id} mode="full" />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* NOTES SIDEBAR (For Writing) */}
      <AnimatePresence>
        {showNotesSidebar && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 md:w-96 z-50 shadow-2xl"
          >
            <NotesManager 
              userId={user._id} 
              mode="sidebar" 
              onClose={() => setShowNotesSidebar(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAFTS SIDEBAR (For Writing) */}
      <AnimatePresence>
        {showDraftsSidebar && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 md:w-96 z-50 shadow-2xl"
          >
            <DraftsManager 
              userId={user._id} 
              onSelectDraft={handleSelectDraft}
              onClose={() => setShowDraftsSidebar(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
