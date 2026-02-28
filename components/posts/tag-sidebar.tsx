'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

interface TagCount {
  name: string;
  count: number;
}

interface TagSidebarProps {
  tags: TagCount[];
  activeTag: string | null;
}

export function TagSidebar({ tags, activeTag }: TagSidebarProps) {
  if (tags.length === 0) return null;

  return (
    <aside className='hidden lg:block w-56 shrink-0'>
      <div className='sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto'>
        <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>Tags</h2>
        <ul className='space-y-1'>
          {activeTag && (
            <li>
              <Link
                href='/posts'
                className='flex items-center justify-between rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
              >
                <span>All posts</span>
              </Link>
            </li>
          )}
          {tags.map(({ name, count }) => {
            const isActive = activeTag === name;
            return (
              <li key={name}>
                <Link
                  href={isActive ? '/posts' : `/posts?tag=${encodeURIComponent(name)}`}
                  className={cn(
                    'flex items-center justify-between rounded-sm px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-accent-red/10 font-medium text-accent-red'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span>{name}</span>
                  <span
                    className={cn(
                      'ml-2 rounded-full px-1.5 py-0.5 text-xs font-medium',
                      isActive ? 'bg-accent-red/20 text-accent-red' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
