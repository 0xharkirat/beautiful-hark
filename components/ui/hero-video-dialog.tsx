'use client';

import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { useVideoDialog } from './VideoDialogContext';

interface HeroVideoProps {
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt?: string;
  className?: string;
}

export default function HeroVideoDialog({ videoSrc, thumbnailSrc, thumbnailAlt = 'Video thumbnail', className }: HeroVideoProps) {
  const { openVideo } = useVideoDialog();

  return (
    <div className={cn('relative', className)}>
      <div className='group relative cursor-pointer' onClick={() => openVideo(videoSrc)}>
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          width={1920}
          height={1080}
          className='w-full rounded-sm border transition-all duration-200 ease-out group-hover:brightness-[0.92]'
        />
        <div className='absolute inset-0 flex scale-[0.95] items-center justify-center rounded-sm transition-all duration-200 ease-out group-hover:scale-100'>
          <div className='flex size-20 items-center justify-center rounded-full border border-border bg-background/90'>
            <div className='relative flex size-12 scale-100 items-center justify-center rounded-full bg-accent-red transition-all duration-200 ease-out group-hover:scale-105'>
              <Play className='size-6 scale-100 fill-primary-foreground text-primary-foreground transition-transform duration-200 ease-out group-hover:scale-105' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
