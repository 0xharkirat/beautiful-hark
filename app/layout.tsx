import { ThemeProvider } from '@/components/theme-provider';
import VideoDialog from '@/components/ui/VideoDialog';
import { VideoDialogProvider } from '@/components/ui/VideoDialogContext';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { EB_Garamond, Geist } from 'next/font/google';
import React from 'react';

import '@/styles.css';
import { TailwindIndicator } from '@/components/ui/breakpoint-indicator';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Tales of Hark',
  description: 'His Holy Harkness: High Priest of Vibes, Creative Code & Thoughtful Engineering.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={cn(geistSans.variable, garamond.variable)} suppressHydrationWarning>
      <head>
        <link rel='alternate' type='application/rss+xml' title='Tales of Hark RSS Feed' href='/feed.xml' />
        <link rel='alternate' type='application/atom+xml' title='Tales of Hark Atom Feed' href='/atom.xml' />
        <link rel='alternate' type='application/json' title='Tales of Hark JSON Feed' href='/feed.json' />
      </head>
      <body className='min-h-screen bg-background font-serif antialiased'>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <VideoDialogProvider>
            {children}
            <VideoDialog />
          </VideoDialogProvider>
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
