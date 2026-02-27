'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Trash2, Save, StickyNote } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useSound } from '@/lib/sounds';

interface Note {
  _id: string;
  content: string;
  color: string;
  created_at: string;
}

interface NotesManagerProps {
  userId: string;
  mode?: 'full' | 'sidebar';
  onClose?: () => void;
}

const COLORS = [
  { id: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-200' },
  { id: 'blue', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-200' },
  { id: 'green', bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-200' },
  { id: 'pink', bg: 'bg-pink-100', text: 'text-pink-900', border: 'border-pink-200' },
];

export default function NotesManager({ userId, mode = 'full', onClose }: NotesManagerProps) {
  const { t } = useLanguage();
  const { playSound } = useSound();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('yellow');
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/notes?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    playSound('click');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          content: newNoteContent,
          color: newNoteColor,
        }),
      });

      if (response.ok) {
        const note = await response.json();
        setNotes([note, ...notes]);
        setNewNoteContent('');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    playSound('click');
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const handleUpdateNote = async (note: Note) => {
    playSound('click');
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note.content,
          color: note.color,
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Failed to update note', error);
    }
  };

  return (
    <div className={`h-full flex flex-col ${mode === 'sidebar' ? 'bg-celtic-parchment/95 backdrop-blur-md border-l border-celtic-wood-light/20 shadow-2xl' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${mode === 'sidebar' ? 'p-4 border-b border-celtic-wood-light/10' : 'mb-8'}`}>
        <div>
          <h2 className={`font-display text-celtic-wood-dark uppercase tracking-widest ${mode === 'sidebar' ? 'text-lg' : 'text-4xl drop-shadow-md text-white'}`}>
            {t.notes.title}
          </h2>
          {mode === 'full' && <div className="h-0.5 w-32 bg-white/50 mt-4" />}
        </div>
        
        {mode === 'sidebar' && onClose && (
          <button onClick={onClose} className="text-celtic-wood-light hover:text-celtic-wood-dark">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`flex-grow overflow-y-auto ${mode === 'sidebar' ? 'p-4' : 'pb-20'}`}>
        
        {/* Create New Note Button/Form */}
        <AnimatePresence>
          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-sm shadow-md border border-celtic-wood-light/20 ${COLORS.find(c => c.id === newNoteColor)?.bg}`}
            >
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder={t.notes.placeholder}
                className="w-full bg-transparent border-none resize-none text-celtic-wood-dark font-handwriting text-lg focus:ring-0 p-0 placeholder:text-celtic-wood-dark/40"
                rows={3}
                autoFocus
              />
              
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-celtic-wood-dark/10">
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setNewNoteColor(color.id)}
                      className={`w-4 h-4 rounded-full border ${color.bg} ${newNoteColor === color.id ? 'ring-2 ring-celtic-wood-dark ring-offset-1' : 'border-celtic-wood-dark/20'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-1 text-celtic-wood-dark/60 hover:text-celtic-wood-dark"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCreateNote}
                    disabled={!newNoteContent.trim()}
                    className="p-1 text-celtic-wood-dark hover:text-celtic-gold disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className={`w-full mb-6 p-4 rounded-sm border-2 border-dashed border-celtic-wood-light/30 flex items-center justify-center gap-2 text-celtic-wood-light hover:text-celtic-wood-dark hover:border-celtic-wood-dark/30 transition-all group ${mode === 'full' ? 'bg-white/10 backdrop-blur-sm' : ''}`}
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-display uppercase tracking-widest text-xs">{t.notes.add}</span>
            </button>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        <div className={`grid gap-4 ${mode === 'full' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-sm shadow-sm hover:shadow-md transition-shadow relative group ${COLORS.find(c => c.id === note.color)?.bg || 'bg-yellow-100'}`}
              >
                {editingNote?._id === note._id ? (
                  <div className="h-full flex flex-col">
                    <textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      className="w-full bg-transparent border-none resize-none text-celtic-wood-dark font-handwriting text-lg focus:ring-0 p-0 mb-8"
                      rows={4}
                      autoFocus
                    />
                     <div className="absolute bottom-2 right-2 flex gap-2">
                        <button
                          onClick={() => setEditingNote(null)}
                          className="p-1.5 bg-white/50 rounded-full hover:bg-white/80 text-celtic-wood-dark transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleUpdateNote(editingNote)}
                          className="p-1.5 bg-white/50 rounded-full hover:bg-white/80 text-celtic-wood-dark transition-colors"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
                ) : (
                  <>
                    <p className="text-celtic-wood-dark font-handwriting text-lg whitespace-pre-wrap mb-6">
                      {note.content}
                    </p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1.5 bg-white/50 rounded-full hover:bg-white/80 text-celtic-wood-dark transition-colors"
                      >
                        <StickyNote className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1.5 bg-white/50 rounded-full hover:bg-white/80 text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-3">
                        <span className="text-[10px] text-celtic-wood-dark/40 font-display uppercase tracking-wider">
                            {mounted ? new Date(note.created_at).toLocaleDateString() : '...'}
                        </span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {!isLoading && notes.length === 0 && !isCreating && (
            <div className="col-span-full text-center py-12">
              <p className={`font-serif italic text-lg ${mode === 'full' ? 'text-white/60' : 'text-celtic-wood-light'}`}>
                {t.notes.empty}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
