'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserSchema, CreateUserInput, BirdTypeEnum } from '@/lib/validation';

import { useLanguage } from '@/lib/i18n';

interface ProfileViewProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function ProfileView({ user, onUpdate }: ProfileViewProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // We reuse the CreateUserSchema but might need a separate UpdateUserSchema if fields differ
  // For now, let's assume we can update everything except address (usually immutable ID)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      full_name: user.full_name,
      birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      address: user.addresses[0].address, // Read-only
      bird_name: user.bird.name,
      bird_type: user.bird.type,
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);
    // TODO: Implement update API
    // For prototype, we just simulate update locally
    setTimeout(() => {
      const updatedUser = {
        ...user,
        full_name: data.full_name,
        birth_date: data.birth_date,
        bird: {
          name: data.bird_name,
          type: data.bird_type,
        }
      };
      onUpdate(updatedUser);
      setIsEditing(false);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto parchment-card p-8 md:p-12 rounded-sm relative"
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-celtic-wood-dark rounded-full border-2 border-celtic-gold flex items-center justify-center shadow-lg">
        <UserIcon className="w-6 h-6 text-celtic-parchment" />
      </div>

      <h2 className="text-3xl font-display text-celtic-wood-dark text-center mb-2 mt-4 uppercase tracking-widest">{t.profile.title}</h2>
      <p className="text-center text-celtic-wood-light font-serif italic mb-8">{t.profile.subtitle}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-celtic-wood-light border-b border-celtic-wood-light/20 pb-2 mb-4">{t.profile.identity}</h3>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-celtic-wood-main mb-1">{t.profile.fullName}</label>
              <input
                {...register('full_name')}
                disabled={!isEditing}
                className="w-full bg-transparent border-b border-celtic-wood-light/30 py-2 text-celtic-wood-dark font-serif text-lg focus:border-celtic-gold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
              {errors.full_name && <p className="text-red-700 text-[10px] mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-celtic-wood-main mb-1">{t.profile.birthDate}</label>
              <input
                type="date"
                {...register('birth_date')}
                disabled={!isEditing}
                className="w-full bg-transparent border-b border-celtic-wood-light/30 py-2 text-celtic-wood-dark font-serif text-lg focus:border-celtic-gold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-celtic-wood-main mb-1">{t.profile.realmAddress}</label>
              <div className="flex items-center text-celtic-wood-dark/50 font-serif text-lg py-2 border-b border-transparent">
                <span className="mr-1">@</span>
                {user.addresses[0].address}
              </div>
              <p className="text-[10px] text-celtic-wood-light italic">{t.profile.addressNote}</p>
            </div>
          </div>

          {/* Companion Section */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-celtic-wood-light border-b border-celtic-wood-light/20 pb-2 mb-4">{t.profile.companion}</h3>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-celtic-wood-main mb-1">{t.profile.birdName}</label>
              <input
                {...register('bird_name')}
                disabled={!isEditing}
                className="w-full bg-transparent border-b border-celtic-wood-light/30 py-2 text-celtic-wood-dark font-serif text-lg focus:border-celtic-gold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-celtic-wood-main mb-1">{t.profile.birdType}</label>
              <select
                {...register('bird_type')}
                disabled={!isEditing}
                className="w-full bg-transparent border-b border-celtic-wood-light/30 py-2 text-celtic-wood-dark font-serif text-lg focus:border-celtic-gold focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
              >
                {BirdTypeEnum.options.map((type) => (
                  <option key={type} value={type}>
                    {t.birds[type as keyof typeof t.birds] || type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 bg-celtic-wood-dark text-celtic-parchment font-display tracking-widest uppercase text-xs hover:bg-celtic-wood-main transition-colors shadow-md"
            >
              {t.profile.edit}
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-celtic-wood-dark text-celtic-wood-dark font-display tracking-widest uppercase text-xs hover:bg-celtic-wood-dark/5 transition-colors"
              >
                {t.profile.cancel}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-celtic-green text-white font-display tracking-widest uppercase text-xs hover:bg-celtic-green/90 transition-colors shadow-md flex items-center"
              >
                {isLoading ? t.profile.saving : (
                  <>
                    {t.profile.save} <Save className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </motion.div>
  );
}
