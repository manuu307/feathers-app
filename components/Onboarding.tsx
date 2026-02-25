'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserSchema, CreateUserInput, BirdTypeEnum } from '@/lib/validation';
import { Loader2 } from 'lucide-react';

interface OnboardingProps {
  onUserCreated: (user: any) => void;
}

export default function Onboarding({ onUserCreated }: OnboardingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      bird_type: 'owl',
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // If address exists, try to "login" by fetching the user
          // In a real app, this would need auth. Here we just fetch by address for the prototype.
          // But wait, the API doesn't expose "get by address" publicly without auth usually.
          // Let's just show the error for now.
          throw new Error('Address already claimed. Please choose another.');
        }
        throw new Error(result.error || 'Failed to create user');
      }

      onUserCreated(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="game-panel w-full max-w-md p-10 border-white/10"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-display text-white tracking-widest uppercase italic drop-shadow-md">Character Creation</h2>
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1 font-display">Full Name</label>
            <input
              {...register('full_name')}
              className="w-full bg-black/40 border border-white/10 px-4 py-2 text-white focus:border-feathers-accent focus:outline-none transition-all font-serif"
              placeholder="Lysandra Vance"
            />
            {errors.full_name && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1 font-display">Birth Date</label>
            <input
              type="date"
              {...register('birth_date')}
              className="w-full bg-black/40 border border-white/10 px-4 py-2 text-white focus:border-feathers-accent focus:outline-none transition-all font-serif"
            />
            {errors.birth_date && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider">{errors.birth_date.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1 font-display">Realm Address</label>
            <div className="flex items-center">
              <span className="text-white/30 mr-2 font-display">@</span>
              <input
                {...register('address')}
                className="w-full bg-black/40 border border-white/10 px-4 py-2 text-white focus:border-feathers-accent focus:outline-none transition-all font-serif"
                placeholder="moon-valley-01"
              />
            </div>
            {errors.address && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1 font-display">Bird Name</label>
              <input
                {...register('bird_name')}
                className="w-full bg-black/40 border border-white/10 px-4 py-2 text-white focus:border-feathers-accent focus:outline-none transition-all font-serif"
                placeholder="Archimedes"
              />
              {errors.bird_name && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider">{errors.bird_name.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1 font-display">Bird Type</label>
              <select
                {...register('bird_type')}
                className="w-full bg-black/40 border border-white/10 px-4 py-2 text-white focus:border-feathers-accent focus:outline-none transition-all font-serif appearance-none cursor-pointer"
              >
                {BirdTypeEnum.options.map((type) => (
                  <option key={type} value={type} className="bg-[#1a1a20]">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-sm text-red-200 text-xs text-center font-serif italic">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="game-button w-full py-4 text-white uppercase tracking-[0.3em] text-xs font-display flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Create Character</span>
          )}
        </button>
      </form>
    </motion.div>
  );
}
