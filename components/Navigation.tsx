'use client';

import { Feather, PenTool, Search, RefreshCw, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function Navigation({ currentView, onViewChange, onRefresh, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'list', icon: Feather, label: 'Home' },
    { id: 'writing', icon: PenTool, label: 'Write' },
    { id: 'search', icon: Search, label: 'Seek' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Navigation (Top) */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="hidden md:flex fixed top-0 left-0 w-full h-20 z-50 items-center justify-between px-8 wood-texture wood-border border-t-0 border-x-0 shadow-2xl"
      >
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onViewChange('list')}>
          <div className="w-10 h-10 rounded-full bg-celtic-gold/20 flex items-center justify-center border border-celtic-gold">
            <Feather className="w-6 h-6 text-celtic-gold" />
          </div>
          <span className="text-2xl font-display text-celtic-parchment tracking-widest uppercase drop-shadow-md">Feathers</span>
        </div>

        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
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
          <button 
            onClick={onRefresh}
            className="p-2 rounded-full hover:bg-white/5 text-celtic-parchment/60 hover:text-celtic-gold transition-colors"
            title="Refresh Letters"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 text-celtic-parchment/60 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-serif hidden lg:inline">Leave</span>
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
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center p-2 ${currentView === item.id ? 'text-celtic-gold' : 'text-celtic-parchment/60'}`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[9px] uppercase tracking-widest font-serif">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center p-2 text-celtic-parchment/60 hover:text-red-400"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-serif">Leave</span>
        </button>
      </motion.nav>
    </>
  );
}
