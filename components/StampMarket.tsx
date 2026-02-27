'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Coins, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useSound } from '@/lib/sounds';
import Stamp from './Stamp';

interface StampMarketProps {
  user: any;
  onUpdateUser: (user: any) => void;
}

export default function StampMarket({ user, onUpdateUser }: StampMarketProps) {
  const { t } = useLanguage();
  const { playSound } = useSound();
  const [stamps, setStamps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchStamps();
  }, []);

  const fetchStamps = async () => {
    try {
      const response = await fetch('/api/stamps');
      if (response.ok) {
        const data = await response.json();
        setStamps(data);
      }
    } catch (error) {
      console.error('Failed to fetch stamps', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async (stamp: any) => {
    if (user.gold < stamp.price) {
      setMessage({ type: 'error', text: 'Not enough gold!' });
      playSound('error');
      return;
    }

    setIsBuying(stamp._id || stamp.id);
    setMessage(null);

    try {
      const response = await fetch('/api/stamps/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          stampId: stamp._id || stamp.id,
          quantity: 1
        })
      });

      const result = await response.json();

      if (response.ok) {
        playSound('success');
        setMessage({ type: 'success', text: `Purchased ${stamp.name}!` });
        
        // Update local user state
        const updatedUser = { ...user };
        updatedUser.gold -= stamp.price;
        
        const stampId = stamp._id || stamp.id;
        const inventoryIndex = updatedUser.stamps.findIndex((s: any) => s.stamp_id === stampId);
        if (inventoryIndex > -1) {
          updatedUser.stamps[inventoryIndex].quantity += 1;
        } else {
          updatedUser.stamps.push({ stamp_id: stampId, quantity: 1 });
        }
        
        onUpdateUser(updatedUser);
      } else {
        setMessage({ type: 'error', text: result.error || 'Purchase failed' });
        playSound('error');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      playSound('error');
    } finally {
      setIsBuying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-celtic-gold animate-spin mb-4" />
        <p className="font-serif italic text-celtic-wood-light">Opening the vault...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display tracking-widest uppercase text-celtic-parchment">Stamp Market</h2>
          <p className="text-celtic-parchment/60 font-serif italic">Enhance your scrolls with unique seals</p>
        </div>
        <div className="flex items-center space-x-3 bg-black/20 px-6 py-3 rounded-full border border-celtic-gold/30">
          <Coins className="w-6 h-6 text-celtic-gold" />
          <span className="text-2xl font-display text-celtic-gold tracking-wider">{user.gold}</span>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-4 rounded-sm flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30' : 'bg-red-900/40 text-red-200 border border-red-500/30'}`}
        >
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-serif italic">{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stamps.map((stamp) => {
          const stampId = stamp._id || stamp.id;
          const owned = user.stamps.find((s: any) => s.stamp_id === stampId);
          const isProcessing = isBuying === stampId;

          return (
            <motion.div
              key={stampId}
              whileHover={{ y: -5 }}
              className="parchment-card p-6 rounded-sm flex flex-col items-center text-center relative overflow-hidden group"
            >
              {stamp.is_default && (
                <div className="absolute top-0 right-0 bg-celtic-gold/20 text-celtic-gold text-[8px] uppercase tracking-widest px-2 py-1 rounded-bl-sm font-display">
                  Default
                </div>
              )}
              
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                <Stamp icon={stamp.icon} color={stamp.color} size="lg" />
              </div>

              <h3 className="text-xl font-display tracking-wider text-celtic-wood-dark mb-1 uppercase">{stamp.name}</h3>
              <p className="text-xs text-celtic-wood-light font-serif italic mb-4 line-clamp-2">{stamp.description || 'A beautiful seal for your correspondence.'}</p>
              
              <div className="mt-auto w-full pt-4 border-t border-celtic-wood-light/10 flex flex-col items-center">
                {owned && (
                  <span className="text-[10px] uppercase tracking-widest text-celtic-wood-light mb-3 font-display">
                    Owned: {owned.quantity}
                  </span>
                )}
                
                <button
                  disabled={isProcessing || (stamp.price > 0 && user.gold < stamp.price)}
                  onClick={() => handleBuy(stamp)}
                  className={`w-full py-2 rounded-sm flex items-center justify-center space-x-2 transition-all ${
                    stamp.price === 0 
                      ? 'bg-celtic-wood-dark/5 text-celtic-wood-light cursor-default' 
                      : 'bg-celtic-wood-dark text-celtic-parchment hover:bg-celtic-gold hover:text-celtic-wood-dark'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : stamp.price === 0 ? (
                    <span className="text-[10px] uppercase tracking-widest font-display">Free Starter</span>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span className="text-sm font-display tracking-widest uppercase">{stamp.price} Gold</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
