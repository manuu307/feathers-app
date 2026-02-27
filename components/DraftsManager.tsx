'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Edit3, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useSound } from '@/lib/sounds';

interface Draft {
  _id: string;
  content: string;
  receiver_address?: string;
  stamp_id?: string;
  scheduled_at?: string;
  updated_at: string;
}

interface DraftsManagerProps {
  userId: string;
  onSelectDraft: (draft: Draft) => void;
  onClose: () => void;
}

export default function DraftsManager({ userId, onSelectDraft, onClose }: DraftsManagerProps) {
  const { t } = useLanguage();
  const { playSound } = useSound();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      const response = await fetch(`/api/drafts?senderId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error('Failed to fetch drafts', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    if (!window.confirm(t.drafts.discard + '?')) return;

    try {
      const response = await fetch(`/api/drafts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrafts(drafts.filter((d) => d._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete draft', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-celtic-parchment/95 backdrop-blur-md border-l border-celtic-wood-light/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-celtic-wood-light/10">
        <div>
          <h2 className="font-display text-celtic-wood-dark uppercase tracking-widest text-lg">
            {t.drafts.title}
          </h2>
          <p className="text-[10px] text-celtic-wood-light font-serif italic">{t.drafts.subtitle}</p>
        </div>
        
        <button onClick={onClose} className="text-celtic-wood-light hover:text-celtic-wood-dark">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {drafts.map((draft) => (
              <motion.div
                key={draft._id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => onSelectDraft(draft)}
                className="p-4 rounded-sm bg-white/40 border border-celtic-wood-light/10 hover:bg-white/60 hover:border-celtic-gold/30 transition-all cursor-pointer group relative"
              >
                <div className="pr-8">
                  <p className="text-celtic-wood-dark font-serif italic line-clamp-2 text-sm mb-2">
                    {draft.content.replace(/\f/g, ' ')}
                  </p>
                  
                  <div className="flex flex-col gap-1 text-[10px] text-celtic-wood-light uppercase tracking-wider">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mounted ? new Date(draft.updated_at).toLocaleDateString() : '...'}
                      </span>
                      {draft.receiver_address && (
                        <span className="truncate max-w-[100px]">
                          To: {draft.receiver_address}
                        </span>
                      )}
                    </div>
                    {draft.scheduled_at && (
                      <span className="text-celtic-gold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Scheduled: {mounted ? new Date(draft.scheduled_at).toLocaleString() : '...'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteDraft(draft._id, e)}
                  className="absolute top-2 right-2 p-2 text-celtic-wood-light/40 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  title={t.drafts.discard}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {!isLoading && drafts.length === 0 && (
            <div className="text-center py-12">
              <p className="font-serif italic text-celtic-wood-light">
                {t.drafts.empty}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
