'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, Link } from 'lucide-react';
import { FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface ShareBarProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareBar({ title, url, className }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [xCopied, setXCopied] = useState(false);
  const [linkedInCopied, setLinkedInCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const xUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  function handleCopy() {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleX() {
    // Copy URL to clipboard in case it is needed alongside the pre-filled text
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setXCopied(true);
        setTimeout(() => setXCopied(false), 3000);
      })
      .catch(() => {});
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  }

  function handleLinkedIn() {
    // Copy URL to clipboard so the user can paste if LinkedIn does not auto-fill
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setLinkedInCopied(true);
        setTimeout(() => setLinkedInCopied(false), 3000);
      })
      .catch(() => {});
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className='text-xs text-muted-foreground font-sans mr-1 flex items-center gap-1'>
        <Link className='size-3' />
        Share
      </span>

      {/* Copy link */}
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy link'}
        aria-label={copied ? 'Link copied' : 'Copy link to post'}
        className='size-8 text-muted-foreground hover:text-foreground'
      >
        {copied ? <Check className='size-4 text-green-500' /> : <Copy className='size-4' />}
      </Button>

      {/* X / Twitter -- copies URL to clipboard first, then opens the share dialog */}
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={handleX}
        title={xCopied ? 'Link copied! Paste into your post.' : 'Share on X'}
        aria-label='Share on X (Twitter)'
        className='size-8 text-muted-foreground hover:text-foreground'
      >
        <FaXTwitter className={cn('size-4', xCopied && 'text-sky-500')} />
      </Button>

      {/* LinkedIn -- copies URL to clipboard first, then opens the share dialog */}
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={handleLinkedIn}
        title={linkedInCopied ? 'Link copied! Paste into your post.' : 'Share on LinkedIn'}
        aria-label='Share on LinkedIn'
        className='size-8 text-muted-foreground hover:text-foreground'
      >
        <FaLinkedin className={cn('size-4', linkedInCopied && 'text-blue-500')} />
      </Button>
    </div>
  );
}
