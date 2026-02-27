'use client';

import { LanguageProvider } from '@/lib/i18n';
import { SoundProvider } from '@/lib/sounds';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SoundProvider>
        {children}
      </SoundProvider>
    </LanguageProvider>
  );
}
