'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  /** The CSS selector for the article element whose headings we should track. */
  articleSelector: string;
}

// ---------------------------------------------------------------------------
// Hook — extracts headings from the DOM and tracks the active one
// ---------------------------------------------------------------------------
function useToc(articleSelector: string) {
  const [items, setItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');

  // Extract headings after the article has rendered.
  // Uses setTimeout to defer past all AnchoredHeading useLayoutEffects
  // which stamp the id attributes we depend on.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const article = document.querySelector(articleSelector);
      if (!article) return;

      const headings = Array.from(article.querySelectorAll('h2, h3')) as HTMLHeadingElement[];
      const extracted: TocItem[] = headings
        .filter((h) => h.id)
        .map((h) => ({
          id: h.id,
          text: h.textContent ?? '',
          level: (Number(h.tagName.slice(1)) as 2 | 3),
        }));

      setItems(extracted);
    }, 0);
    return () => clearTimeout(timer);
  }, [articleSelector]);

  // Track active heading with IntersectionObserver
  React.useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 },
    );

    for (const el of headingEls) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  return { items, activeId };
}

// ---------------------------------------------------------------------------
// TOC link — shared between desktop and mobile
// ---------------------------------------------------------------------------
function TocLink({
  item,
  active,
  onClick,
}: {
  item: TocItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#${item.id}`}
      onClick={onClick}
      className={[
        'block py-1 text-sm leading-snug transition-colors duration-150',
        item.level === 3 ? 'pl-4' : 'pl-0',
        active
          ? 'font-medium text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      ].join(' ')}
    >
      {item.text}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Mobile — floating toggle button + animated dropdown
// ---------------------------------------------------------------------------
function MobileToc({ items, activeId }: { items: TocItem[]; activeId: string }) {
  const [open, setOpen] = React.useState(false);

  if (items.length === 0) return null;

  return (
    <div className='xl:hidden fixed top-24 right-4 z-40'>
      {/* Toggle button */}
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label='Toggle table of contents'
        className='flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm transition-colors hover:bg-muted'
      >
        <span className='sr-only sm:not-sr-only'>On this page</span>
        {/* Hamburger / X icon */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          {open ? (
            <>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </>
          ) : (
            <>
              <line x1='3' y1='6' x2='21' y2='6' />
              <line x1='3' y1='12' x2='21' y2='12' />
              <line x1='3' y1='18' x2='21' y2='18' />
            </>
          )}
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key='mobile-toc'
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            aria-label='Table of contents'
            className='absolute right-0 top-10 w-64 rounded-lg border border-border bg-background/95 p-4 shadow-xl backdrop-blur-sm'
          >
            <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
              On this page
            </p>
            <div className='space-y-0.5 border-l border-border pl-3'>
              {items.map((item) => (
                <TocLink
                  key={item.id}
                  item={item}
                  active={activeId === item.id}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public export
//
// Renders as a single element so it works correctly as a flex child in the
// two-column post layout. The desktop aside is inline; the mobile overlay is
// fixed-position and therefore out of flow regardless.
// ---------------------------------------------------------------------------
export function TableOfContents({ articleSelector }: TableOfContentsProps) {
  const { items, activeId } = useToc(articleSelector);

  return (
    <div className='shrink-0 self-stretch'>
      {/* Desktop — sticky nav that travels within the height of the article column */}
      <nav
        aria-label='Table of contents'
        className='hidden xl:block sticky top-28 w-52'
      >
        {items.length > 0 && (
          <>
            <p className='mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
              On this page
            </p>
            <div className='space-y-0.5 border-l border-border pl-4'>
              {items.map((item) => (
                <TocLink key={item.id} item={item} active={activeId === item.id} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Mobile — fixed overlay, visible below xl */}
      <MobileToc items={items} activeId={activeId} />
    </div>
  );
}
