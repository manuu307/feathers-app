'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, User, MapPin } from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

interface SearchViewProps {
  onSelectUser: (user: any) => void;
}

export default function SearchView({ onSelectUser }: SearchViewProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    // Mock search for now
    setTimeout(() => {
      const mockResults = [
        { _id: '1', full_name: 'Aeliana Windwalker', address: 'aeliana-windwalker', bird: { name: 'Zephyr', type: 'falcon' } },
        { _id: '2', full_name: 'Thorne Blackwood', address: 'thorne-blackwood', bird: { name: 'Odin', type: 'raven' } },
        { _id: '3', full_name: 'Seraphina Light', address: 'seraphina-light', bird: { name: 'Lumina', type: 'dove' } },
      ].filter(u => u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.address.includes(searchTerm.toLowerCase()));
      
      setResults(mockResults);
      setIsLoading(false);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto parchment-card p-8 md:p-12 rounded-sm relative min-h-[60vh]"
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-celtic-wood-dark rounded-full border-2 border-celtic-gold flex items-center justify-center shadow-lg">
        <Search className="w-6 h-6 text-celtic-parchment" />
      </div>

      <h2 className="text-3xl font-display text-celtic-wood-dark text-center mb-2 mt-4 uppercase tracking-widest">{t.search.title}</h2>
      <p className="text-center text-celtic-wood-light font-serif italic mb-8">{t.search.subtitle}</p>

      <form onSubmit={handleSearch} className="relative mb-12">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.search.placeholder}
          className="w-full bg-transparent border-b-2 border-celtic-wood-light/30 py-4 pl-4 pr-12 text-celtic-wood-dark font-serif text-xl focus:border-celtic-gold focus:outline-none placeholder:text-celtic-wood-light/40"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-celtic-wood-light hover:text-celtic-gold transition-colors"
        >
          <Search className="w-6 h-6" />
        </button>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-celtic-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-celtic-wood-light font-serif italic">{t.search.searching}</p>
          </div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 border border-celtic-wood-light/10 rounded-sm hover:bg-celtic-wood-light/5 transition-colors cursor-pointer group"
              onClick={() => onSelectUser(user)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-celtic-wood-light/10 rounded-full flex items-center justify-center text-celtic-wood-dark font-display text-lg">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-celtic-wood-dark text-lg">{user.full_name}</h3>
                  <div className="flex items-center text-xs text-celtic-wood-light font-serif italic">
                    <MapPin className="w-3 h-3 mr-1" />
                    @{user.address}
                  </div>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-celtic-wood-dark text-celtic-parchment text-[10px] uppercase tracking-widest font-display rounded-sm shadow-sm hover:bg-celtic-gold">
                {t.search.write}
              </button>
            </motion.div>
          ))
        ) : searchTerm && !isLoading ? (
          <div className="text-center py-12 text-celtic-wood-light/60 font-serif italic">
            {t.search.noResults}
          </div>
        ) : (
          <div className="text-center py-12 text-celtic-wood-light/40 font-serif italic">
            {t.search.initial}
          </div>
        )}
      </div>
    </motion.div>
  );
}
