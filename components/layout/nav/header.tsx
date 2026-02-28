'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { HarkLogo } from '@/components/ui/hark-logo';
import { useSearch } from '@/components/ui/SearchContext';
import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useLayout } from '../layout-context';

export const Header = () => {
  const { globalSettings } = useLayout();
  const header = globalSettings!.header!;
  const pathname = usePathname();
  const { openSearch } = useSearch();

  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isMac, setIsMac] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes('MAC') || navigator.userAgent.includes('Mac'));
  }, []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll(); // check initial state
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Open search on Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  return (
    <header className='font-sans'>
      <nav data-state={menuState && 'active'} className={`fixed z-20 w-full transition-all duration-300 ${scrolled ? 'border-b bg-background/80 backdrop-blur-lg' : 'border-b border-transparent bg-background/95'}`}>
        <div className='mx-auto max-w-5xl px-6 transition-all duration-300'>
          <div className='relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4'>
            <div className='flex w-full items-center justify-between gap-12'>
              <Link href='/' aria-label='home' className='flex items-center space-x-2 text-sm tracking-wide'>
                <HarkLogo className='mr-2 h-16 w-16 lg:h-20 lg:w-20 transition-all duration-300' trackEyes />
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

              <div className='hidden lg:flex lg:items-center lg:gap-4 lg:text-sm'>
                {header.nav!.map((item, index) => (
                  <Link
                    key={index}
                    href={item!.href!}
                    className={`border-b border-transparent text-muted-foreground no-underline transition-colors duration-150 hover:border-accent-red hover:text-accent-red hover:no-underline ${isActive(item!.href!) ? 'border-accent-red text-foreground' : ''}`}
                  >
                    <span>{item!.label}</span>
                  </Link>
                ))}
                <div className='group relative'>
                  <button
                    type='button'
                    onClick={openSearch}
                    aria-label={isMac === null ? 'Search' : `Search (${isMac ? '⌘K' : 'Ctrl+K'})`}
                    className='cursor-pointer p-0.5 text-muted-foreground transition-colors hover:text-accent-red'
                  >
                    <Search className='size-4' />
                  </button>
                  <div className='pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 font-sans text-xs text-muted-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100'>
                    {isMac === null ? null : isMac ? '⌘K' : 'Ctrl+K'}
                  </div>
                </div>
                <div className='group relative'>
                  <ThemeToggle />
                  <div className='pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 font-sans text-xs text-muted-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100'>
                    {isMac === null ? null : isMac ? '⌘;' : 'Ctrl+;'}
                  </div>
                </div>
              </div>
            </div>

            <div className='in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-sm border bg-card p-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0'>
              <div className='lg:hidden'>
                <ul className='space-y-6 text-base'>
                  {header.nav!.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item!.href!}
                        className={`block border-b border-transparent pb-1 text-muted-foreground no-underline transition-colors duration-150 hover:border-accent-red hover:text-accent-red hover:no-underline ${isActive(item!.href!) ? 'border-accent-red text-foreground' : ''}`}
                      >
                        <span>{item!.label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type='button'
                      onClick={() => { setMenuState(false); openSearch(); }}
                      className='flex w-full items-center gap-2 border-b border-transparent pb-1 text-muted-foreground transition-colors hover:border-accent-red hover:text-accent-red'
                    >
                      <Search className='size-4' />
                      <span>Search</span>
                    </button>
                  </li>
                  <li>
                    <ThemeToggle mobile />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
