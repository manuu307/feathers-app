'use client';

import { Feather, PenTool, Search, RefreshCw, User, LogOut, Globe, StickyNote, Volume2, VolumeX, SendHorizontal, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from '@/lib/i18n';
import { useSound } from '@/lib/sounds';
import { useState } from 'react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function Navigation({ currentView, onViewChange, onRefresh, onLogout }: NavigationProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isMuted, toggleMute, playSound } = useSound();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleViewChange = (view: string) => {
    playSound('click');
    onViewChange(view);
  };

  const navItems = [
    { id: 'list', icon: Feather, label: t.nav.home },
    { id: 'writing', icon: PenTool, label: t.nav.write },
    { id: 'sent', icon: SendHorizontal, label: t.nav.sent },
    { id: 'market', icon: ShoppingBag, label: t.nav.market },
    { id: 'search', icon: Search, label: t.nav.seek },
    { id: 'notes', icon: StickyNote, label: t.nav.notes },
    { id: 'profile', icon: User, label: t.nav.profile },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
  ];

  return (
    <>
      {/* Desktop Navigation (Top) */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="hidden md:flex fixed top-0 left-0 w-full h-20 z-50 items-center justify-between px-8 wood-texture wood-border border-t-0 border-x-0 shadow-2xl"
      >
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleViewChange('list')}>
          <div className="w-10 h-10 rounded-full bg-celtic-gold/20 flex items-center justify-center border border-celtic-gold">
            <Feather className="w-6 h-6 text-celtic-gold" />
          </div>
          <span className="text-2xl font-display text-celtic-parchment tracking-widest uppercase drop-shadow-md">Feathers</span>
        </div>

        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`flex flex-col items-center group relative ${currentView === item.id ? 'text-celtic-gold' : 'text-celtic-parchment/60 hover:text-celtic-parchment'}`}
            >
              <item.icon className="w-6 h-6 mb-1 transition-transform group-hover:-translate-y-1" />
              <span className="text-[10px] uppercase tracking-widest font-serif">{item.label}</span>
              {currentView === item.id && (
                <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-celtic-gold rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Sound Toggle */}
          <button 
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-white/5 text-celtic-parchment/60 hover:text-celtic-gold transition-colors flex items-center space-x-1"
            title={t.nav.sounds}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                playSound('click');
                setShowLangMenu(!showLangMenu);
              }}
              className="p-2 rounded-full hover:bg-white/5 text-celtic-parchment/60 hover:text-celtic-gold transition-colors flex items-center space-x-1"
              title="Change Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-[10px] uppercase font-serif">{language}</span>
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 parchment-card p-2 rounded-sm shadow-xl min-w-[120px] z-[60]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        playSound('click');
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs uppercase tracking-widest font-serif hover:bg-celtic-wood-dark/5 rounded-sm ${language === lang.code ? 'text-celtic-gold font-bold' : 'text-celtic-wood-dark'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => {
              playSound('click');
              onRefresh();
            }}
            className="p-2 rounded-full hover:bg-white/5 text-celtic-parchment/60 hover:text-celtic-gold transition-colors"
            title={t.nav.refresh}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <button 
            onClick={() => {
              playSound('click');
              onLogout();
            }}
            className="flex items-center space-x-2 text-celtic-parchment/60 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-serif hidden lg:inline">{t.nav.leave}</span>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Navigation (Bottom) */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed bottom-0 left-0 w-full h-20 z-50 flex items-center justify-around px-4 wood-texture wood-border border-b-0 border-x-0 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleViewChange(item.id)}
            className={`flex flex-col items-center p-2 ${currentView === item.id ? 'text-celtic-gold' : 'text-celtic-parchment/60'}`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[9px] uppercase tracking-widest font-serif">{item.label}</span>
          </button>
        ))}
        
        {/* Mobile Sound Toggle */}
        <button
          onClick={toggleMute}
          className="flex flex-col items-center p-2 text-celtic-parchment/60"
        >
          {isMuted ? <VolumeX className="w-6 h-6 mb-1" /> : <Volume2 className="w-6 h-6 mb-1" />}
          <span className="text-[9px] uppercase tracking-widest font-serif">{t.nav.sounds}</span>
        </button>

        {/* Mobile Language Toggle (Cycles) */}
        <button
          onClick={() => {
            playSound('click');
            const nextLang = language === 'en' ? 'es' : language === 'es' ? 'pt' : 'en';
            setLanguage(nextLang);
          }}
          className="flex flex-col items-center p-2 text-celtic-parchment/60"
        >
          <Globe className="w-6 h-6 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-serif">{language}</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            onLogout();
          }}
          className="flex flex-col items-center p-2 text-celtic-parchment/60 hover:text-red-400"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-serif">{t.nav.leave}</span>
        </button>
      </motion.nav>
    </>
  );
}
