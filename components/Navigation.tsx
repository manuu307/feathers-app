'use client';

import { Feather, PenTool, Search, RefreshCw, User, LogOut, Globe, StickyNote, Volume2, VolumeX, ShoppingBag, Menu, X, Scroll, Notebook } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWriteMenu, setShowWriteMenu] = useState(false);

  const handleViewChange = (view: string) => {
    playSound('click');
    onViewChange(view);
    setIsMobileMenuOpen(false);
    setShowWriteMenu(false);
  };

  const navItems = [
    { id: 'list', icon: Feather, label: t.nav.home },
    // Write is handled separately now
    { id: 'market', icon: ShoppingBag, label: t.nav.market },
    { id: 'search', icon: Search, label: t.nav.seek },
    // Notes is accessed via Write -> Note, but user might want direct access? 
    // User said: "If its notes then go to MEMORY FRAGMENTS view". 
    // Existing 'notes' item goes there. 
    // "Under write, i want to add the option...". 
    // Let's keep 'notes' in the main list? 
    // "The nav item 'Sent' remove it". 
    // Let's remove 'notes' from top level if it's under Write now? 
    // "If scroll is chosen... if its notes then go to MEMORY FRAGMENTS view".
    // This implies 'notes' is a destination of 'Write'.
    // I will remove 'notes' from the top level list to declutter, as requested implicitly by "Under write".
    // Wait, "Under write... I want to add the option". 
    // Let's keep it simple: Remove Sent. Keep Notes? 
    // User said "one more will brake the navbar". Removing Sent helps. 
    // Moving Notes under Write helps more.
    // Let's remove Notes from top level and put it under Write.
    { id: 'profile', icon: User, label: t.nav.profile },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
  ];

  return (
    <>
      {/* Desktop Navigation (Top) - Hidden on Tablet/Mobile (lg breakpoint) */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="hidden lg:flex fixed top-0 left-0 w-full h-20 z-50 items-center justify-between px-8 wood-texture wood-border border-t-0 border-x-0 shadow-2xl"
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

          {/* Write Dropdown */}
          <div className="relative" onMouseEnter={() => setShowWriteMenu(true)} onMouseLeave={() => setShowWriteMenu(false)}>
            <button
              className={`flex flex-col items-center group relative ${['writing', 'notes'].includes(currentView) ? 'text-celtic-gold' : 'text-celtic-parchment/60 hover:text-celtic-parchment'}`}
            >
              <PenTool className="w-6 h-6 mb-1 transition-transform group-hover:-translate-y-1" />
              <span className="text-[10px] uppercase tracking-widest font-serif">{t.nav.write}</span>
              {['writing', 'notes'].includes(currentView) && (
                <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-celtic-gold rounded-full" />
              )}
            </button>
            
            <AnimatePresence>
              {showWriteMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 parchment-card p-2 rounded-sm shadow-xl min-w-[160px] z-[60]"
                >
                  <button
                    onClick={() => handleViewChange('writing')}
                    className="w-full flex items-center space-x-3 text-left px-4 py-3 text-xs uppercase tracking-widest font-serif hover:bg-celtic-wood-dark/5 rounded-sm text-celtic-wood-dark"
                  >
                    <Scroll className="w-4 h-4" />
                    <span>Scroll</span>
                  </button>
                  <button
                    onClick={() => handleViewChange('notes')}
                    className="w-full flex items-center space-x-3 text-left px-4 py-3 text-xs uppercase tracking-widest font-serif hover:bg-celtic-wood-dark/5 rounded-sm text-celtic-wood-dark"
                  >
                    <Notebook className="w-4 h-4" />
                    <span>Note</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

      {/* Mobile/Tablet Navigation Bar (Top) - Visible on lg and below */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 wood-texture wood-border border-t-0 border-x-0 shadow-lg"
      >
        <div className="flex items-center space-x-2" onClick={() => handleViewChange('list')}>
          <div className="w-8 h-8 rounded-full bg-celtic-gold/20 flex items-center justify-center border border-celtic-gold">
            <Feather className="w-4 h-4 text-celtic-gold" />
          </div>
          <span className="text-xl font-display text-celtic-parchment tracking-widest uppercase drop-shadow-md">Feathers</span>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-celtic-parchment hover:text-celtic-gold transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </motion.nav>

      {/* Mobile/Tablet Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] wood-texture flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
              <span className="text-xl font-display text-celtic-parchment tracking-widest uppercase">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-celtic-parchment hover:text-celtic-gold transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-colors ${currentView === item.id ? 'bg-celtic-gold/10 text-celtic-gold border border-celtic-gold/30' : 'text-celtic-parchment hover:bg-white/5'}`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-lg font-display uppercase tracking-widest">{item.label}</span>
                </button>
              ))}

              {/* Write Options in Mobile Menu */}
              <div className="border-t border-white/10 pt-6 mt-2">
                <p className="text-xs uppercase tracking-widest text-celtic-parchment/40 mb-4 px-4">{t.nav.write}</p>
                <button
                  onClick={() => handleViewChange('writing')}
                  className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-colors ${currentView === 'writing' ? 'bg-celtic-gold/10 text-celtic-gold border border-celtic-gold/30' : 'text-celtic-parchment hover:bg-white/5'}`}
                >
                  <Scroll className="w-6 h-6" />
                  <span className="text-lg font-display uppercase tracking-widest">Scroll</span>
                </button>
                <button
                  onClick={() => handleViewChange('notes')}
                  className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-colors ${currentView === 'notes' ? 'bg-celtic-gold/10 text-celtic-gold border border-celtic-gold/30' : 'text-celtic-parchment hover:bg-white/5'}`}
                >
                  <Notebook className="w-6 h-6" />
                  <span className="text-lg font-display uppercase tracking-widest">Note</span>
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
              <div className="flex items-center justify-between">
                <button 
                  onClick={toggleMute}
                  className="flex items-center space-x-3 text-celtic-parchment/70 hover:text-celtic-gold"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span className="text-sm font-serif uppercase tracking-wider">{t.nav.sounds}</span>
                </button>

                <button 
                  onClick={() => {
                    const nextLang = language === 'en' ? 'es' : language === 'es' ? 'pt' : 'en';
                    setLanguage(nextLang);
                  }}
                  className="flex items-center space-x-3 text-celtic-parchment/70 hover:text-celtic-gold"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-serif uppercase tracking-wider">{language === 'en' ? 'English' : language === 'es' ? 'Español' : 'Português'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    playSound('click');
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 text-red-400 hover:bg-red-900/20 rounded-sm transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-display uppercase tracking-widest">{t.nav.leave}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
