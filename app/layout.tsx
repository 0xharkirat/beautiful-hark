import { ThemeProvider } from '@/components/theme-provider';
import SearchModal from '@/components/ui/SearchModal';
import { SearchProvider } from '@/components/ui/SearchContext';
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
  title: {
    default: 'Tales of Hark',
    template: '%s | Tales of Hark',
  },
  description: 'His Holy Harkness: High Priest of Vibes, Creative Code & Thoughtful Engineering.',
  metadataBase: new URL('https://beautiful-hark.vercel.app'),
  openGraph: {
    title: 'Tales of Hark',
    description: 'His Holy Harkness: High Priest of Vibes, Creative Code & Thoughtful Engineering.',
    url: 'https://beautiful-hark.vercel.app',
    siteName: 'Tales of Hark',
    images: [
      {
        url: '/uploads/hark-logo-bg.png',
        width: 512,
        height: 512,
        alt: 'Tales of Hark logo',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tales of Hark',
    description: 'His Holy Harkness: High Priest of Vibes, Creative Code & Thoughtful Engineering.',
    images: ['/uploads/hark-logo-bg.png'],
  },
  icons: {
    icon: '/uploads/hark-logo-bg.png',
    apple: '/uploads/hark-logo-bg.png',
  },
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
          <SearchProvider>
            <VideoDialogProvider>
              {children}
              <VideoDialog />
              <SearchModal />
            </VideoDialogProvider>
          </SearchProvider>
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
