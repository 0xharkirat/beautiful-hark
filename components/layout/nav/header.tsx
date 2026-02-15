'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Icon } from '../../icon';
import { useLayout } from '../layout-context';

export const Header = () => {
  const { globalSettings } = useLayout();
  const header = globalSettings!.header!;
  const pathname = usePathname();

  const [menuState, setMenuState] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  return (
    <header className='font-sans'>
      <nav data-state={menuState && 'active'} className='fixed z-20 w-full border-b bg-background/95'>
        <div className='mx-auto max-w-6xl px-6 transition-all duration-300'>
          <div className='relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4'>
            <div className='flex w-full items-center justify-between gap-12'>
              <Link href='/' aria-label='home' className='flex items-center space-x-2 text-sm tracking-wide'>
                {header.logo ? (
                  <div className="relative mr-2 h-14 w-14 lg:h-16 lg:w-16 overflow-hidden rounded-md transition-all duration-300">
                    <img
                      src={header.logo}
                      alt={header.name || "Logo"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <Icon
                    parentColor={header.color!}
                    data={{
                      name: header.icon!.name,
                      color: header.icon!.color,
                      style: header.icon!.style,
                    }}
                  />
                )}
                {' '}
                <span className='text-foreground'>{header.name}</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                className='relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 text-muted-foreground hover:text-foreground lg:hidden'
              >
                <Menu className='in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200' />
                <X className='in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200' />
              </button>

              <div className='hidden lg:flex lg:items-center lg:gap-4'>
                <ul className='flex gap-8 text-sm'>
                  {header.nav!.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item!.href!}
                        className={`block border-b border-transparent py-1 text-muted-foreground transition-colors duration-150 hover:text-accent-red ${isActive(item!.href!) ? 'border-accent-red text-foreground' : ''}`}
                      >
                        <span>{item!.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <ThemeToggle />
              </div>
            </div>

            <div className='in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-sm border bg-card p-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0'>
              <div className='lg:hidden'>
                <ul className='space-y-6 text-base'>
                  {header.nav!.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item!.href!}
                        className={`block border-b border-transparent pb-1 text-muted-foreground transition-colors duration-150 hover:text-accent-red ${isActive(item!.href!) ? 'border-accent-red text-foreground' : ''}`}
                      >
                        <span>{item!.label}</span>
                      </Link>
                    </li>
                  ))}
                  <div className='pt-6'>
                    <ThemeToggle />
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
