'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

interface TagChipProps {
  name: string;
  isActive?: boolean;
  className?: string;
}

export function TagChip({ name, isActive = false, className }: TagChipProps) {
  return (
    <Link
      href={isActive ? '/posts' : `/posts?tag=${encodeURIComponent(name)}`}
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 font-sans text-[0.68rem] font-medium uppercase tracking-wide transition-colors',
        isActive
          ? 'bg-accent-red text-primary-foreground'
          : 'bg-[var(--surface-strong)] text-muted-foreground hover:bg-accent-red/10 hover:text-accent-red',
        className,
      )}
    >
      {name}
    </Link>
  );
}
