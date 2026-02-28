'use client';

import { useSearch } from '@/components/ui/SearchContext';
import type { SearchIndexEntry } from '@/app/search-index.json/route';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Case-insensitive substring match across title, excerpt, and tags */
function filterPosts(entries: SearchIndexEntry[], query: string): SearchIndexEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;

  return entries.filter((entry) => {
    if (entry.title.toLowerCase().includes(q)) return true;
    if (entry.excerpt.toLowerCase().includes(q)) return true;
    if (entry.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
    return false;
  });
}

/** Bold the matching portion of a string */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className='bg-accent-red/20 text-foreground rounded-sm px-0.5'>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const SearchModal = () => {
  const { isOpen, closeSearch } = useSearch();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchIndexEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = index ? filterPosts(index, query) : [];

  // ── Fetch index once when the modal first opens ───────────────────────────
  useEffect(() => {
    if (!isOpen || index !== null) return;

    fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SearchIndexEntry[]>;
      })
      .then(setIndex)
      .catch(() => setLoadError(true));
  }, [isOpen, index]);

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(-1);
      // Small delay to let the animation settle
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Keyboard: Cmd/Ctrl+K global toggle ───────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          // openSearch is wired at the icon level; here we just close
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch]);

  // ── Keyboard navigation inside modal ─────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        closeSearch();
        return;
      }
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const target = results[activeIndex];
        if (target) {
          closeSearch();
          router.push(target.url);
        }
      }
    },
    [results, activeIndex, closeSearch, router],
  );

  // ── Reset active index when query changes ─────────────────────────────────
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // ── Scroll active result into view ────────────────────────────────────────
  useEffect(() => {
    if (activeIndex < 0) return;
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          key='search-backdrop'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeSearch}
          className='fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[10vh] backdrop-blur-md'
          aria-label='Close search'
        >
          {/* Modal panel — stop propagation so clicks inside don't close */}
          <motion.div
            key='search-panel'
            initial={{ y: -20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
            role='dialog'
            aria-modal='true'
            aria-label='Search posts'
          >
            {/* Input row */}
            <div className='flex items-center gap-3 border-b border-border px-5 py-4'>
              <Search className='size-5 shrink-0 text-muted-foreground' />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Search posts…'
                className='min-w-0 flex-1 bg-transparent font-sans text-base text-foreground placeholder:text-muted-foreground focus:outline-none'
                aria-label='Search posts'
                aria-autocomplete='list'
                aria-controls='search-results'
                aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                autoComplete='off'
                spellCheck={false}
              />
              {query && (
                <button
                  type='button'
                  onClick={() => setQuery('')}
                  className='rounded-md p-1 text-muted-foreground hover:text-foreground'
                  aria-label='Clear search'
                >
                  <X className='size-4' />
                </button>
              )}
              <kbd className='hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-sans text-xs text-muted-foreground sm:inline'>
                Esc
              </kbd>
            </div>

            {/* Results area */}
            <div className='max-h-[60vh] overflow-y-auto'>
              {loadError ? (
                <p className='px-5 py-8 text-center font-sans text-sm text-muted-foreground'>
                  Failed to load search index. Please try again.
                </p>
              ) : index === null ? (
                <p className='px-5 py-8 text-center font-sans text-sm text-muted-foreground'>Loading…</p>
              ) : results.length === 0 && query.trim() !== '' ? (
                <p className='px-5 py-8 text-center font-sans text-sm text-muted-foreground'>
                  No posts found for <span className='font-medium text-foreground'>"{query}"</span>
                </p>
              ) : results.length === 0 ? (
                <p className='px-5 py-8 text-center font-sans text-sm text-muted-foreground'>
                  Start typing to search posts…
                </p>
              ) : (
                <ul id='search-results' ref={listRef} role='listbox' className='py-2'>
                  {results.map((entry, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <li
                        key={entry.slug}
                        id={`search-result-${i}`}
                        role='option'
                        aria-selected={isActive}
                      >
                        <Link
                          href={entry.url}
                          onClick={closeSearch}
                          className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                            isActive ? 'bg-accent-red/10' : 'hover:bg-muted/50'
                          }`}
                          tabIndex={-1}
                        >
                          {/* Icon */}
                          <div className='mt-0.5 shrink-0 rounded-md border border-border bg-background p-1.5 text-muted-foreground'>
                            <Search className='size-4' />
                          </div>

                          {/* Text */}
                          <div className='min-w-0 flex-1'>
                            <p className='font-sans text-sm font-semibold leading-snug text-foreground'>
                              <Highlight text={entry.title} query={query} />
                            </p>
                            {entry.excerpt && (
                              <p className='mt-0.5 line-clamp-2 font-sans text-xs text-muted-foreground'>
                                <Highlight text={entry.excerpt} query={query} />
                              </p>
                            )}
                            {entry.tags.length > 0 && (
                              <div className='mt-1.5 flex flex-wrap items-center gap-1'>
                                <Tag className='size-3 text-muted-foreground' />
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className='rounded-full bg-muted px-1.5 py-0.5 font-sans text-xs text-muted-foreground'
                                  >
                                    <Highlight text={tag} query={query} />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight
                            className={`mt-1 size-4 shrink-0 transition-opacity ${
                              isActive ? 'text-accent-red opacity-100' : 'opacity-0'
                            }`}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Footer hint */}
              {results.length > 0 && (
                <div className='flex items-center gap-4 border-t border-border px-5 py-2.5'>
                  <span className='font-sans text-xs text-muted-foreground'>
                    <kbd className='rounded border border-border px-1 py-0.5 text-xs'>↑↓</kbd> navigate
                  </span>
                  <span className='font-sans text-xs text-muted-foreground'>
                    <kbd className='rounded border border-border px-1 py-0.5 text-xs'>↵</kbd> open
                  </span>
                  <span className='font-sans text-xs text-muted-foreground'>
                    <kbd className='rounded border border-border px-1 py-0.5 text-xs'>Esc</kbd> close
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
