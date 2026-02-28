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
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors',
        isActive
          ? 'border-accent-red bg-accent-red text-primary-foreground'
          : 'border-border bg-secondary text-secondary-foreground hover:border-accent-red/60 hover:text-foreground',
        className,
      )}
    >
      {name}
    </Link>
  );
}
