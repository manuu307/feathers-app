import type { Metadata } from 'next';
import { Cinzel, EB_Garamond, Pinyon_Script } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Feathers',
  description: 'A slow-letter ritual web application.',
};

import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${ebGaramond.variable} ${pinyonScript.variable}`}>
      <body className="bg-feathers-bg text-feathers-text min-h-screen antialiased selection:bg-feathers-accent selection:text-feathers-bg overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
