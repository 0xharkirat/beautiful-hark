'use client';
import { HarkLogo } from '@/components/ui/hark-logo';
import Link from 'next/link';
import React from 'react';
import { Icon } from '../../icon';
import { useLayout } from '../layout-context';

export const Footer = () => {
  const { globalSettings } = useLayout();
  const { header, footer } = globalSettings!;

  return (
    <footer className='border-t bg-background pt-16 font-sans'>
      <div className='mx-auto max-w-5xl px-6'>
        <div className='mt-8 flex flex-col items-center gap-6 py-6 md:flex-row md:justify-between'>
          <div className='order-last flex justify-center md:order-first md:justify-start'>
            <Link href='/' aria-label='go home'>
              <HarkLogo className='mr-2 -my-2 h-16 w-16' />
            </Link>
            <span className='ml-2 self-center text-sm text-muted-foreground' suppressHydrationWarning>
              © {new Date().getFullYear()} {header?.name}, All rights reserved
            </span>
          </div>

          <div className='order-first flex flex-col items-center gap-4 md:order-none'>
            <span className='text-xs text-muted-foreground'>
              Vibe Coded with{' '}
              <a href='https://tina.io' target='_blank' rel='noopener noreferrer' className='transition-colors hover:text-accent-red hover:underline'>
                TinaCMS
              </a>
            </span>
          </div>

          <div className='order-last flex items-center justify-center gap-6 text-sm md:order-last md:justify-end'>
            {footer?.social?.map((link, index) => {
              if (link!.icon!.name === 'ssw-icon') {
                return (
                  <Link
                    key={`${link!.icon}${index}`}
                    href={link!.url!}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground transition-all hover:text-accent-red hover:scale-110'
                  >
                    <div
                      className='h-5 w-[60px] bg-current'
                      style={{
                        maskImage: "url('/uploads/ssw-logo-white.png')",
                        WebkitMaskImage: "url('/uploads/ssw-logo-white.png')",
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                  </Link>
                );
              }
              return (
                <Link key={`${link!.icon}${index}`} href={link!.url!} target='_blank' rel='noopener noreferrer'>
                  <Icon data={{ ...link!.icon, size: 'small' }} className='block text-muted-foreground transition-all hover:text-accent-red hover:scale-110' />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};
