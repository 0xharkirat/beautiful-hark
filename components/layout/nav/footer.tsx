'use client';
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
        <div className='mt-8 flex flex-col items-center gap-6 border-t py-6 md:flex-row md:justify-between'>
          <div className='order-last flex justify-center md:order-first md:justify-start'>
            <Link href='/' aria-label='go home'>
              <Icon parentColor={header!.color!} data={header!.icon} />
            </Link>
            <span className='ml-2 self-center text-sm text-muted-foreground'>
              © {new Date().getFullYear()} {header?.name}, All rights reserved
            </span>
          </div>

          <div className='order-first flex flex-col items-center gap-4 md:order-none'>
            <span className='text-xs text-muted-foreground'>
              Powered by{' '}
              <a href='https://tina.io' target='_blank' rel='noopener noreferrer' className='transition-colors hover:text-accent-red'>
                TinaCMS
              </a>
            </span>
          </div>

          <div className='order-last flex justify-center gap-6 text-sm md:order-last md:justify-end'>
            {footer?.social?.map((link, index) => (
              <Link key={`${link!.icon}${index}`} href={link!.url!} target='_blank' rel='noopener noreferrer'>
                <Icon data={{ ...link!.icon, size: 'small' }} className='block text-muted-foreground hover:text-accent-red' />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
