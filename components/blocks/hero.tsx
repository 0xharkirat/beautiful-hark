'use client';
import React, { useState, useEffect } from 'react';
import { iconSchema } from '@/tina/fields/icon';
import { Transition } from 'motion/react';
import Link from 'next/link';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { PageBlocksHero, PageBlocksHeroImage } from '../../tina/__generated__/types';
import { Icon } from '../icon';
import { Section, sectionBlockSchemaField } from '../layout/section';
import { AnimatedGroup } from '../motion-primitives/animated-group';
import { TextEffect } from '../motion-primitives/text-effect';
import { Button } from '../ui/button';
import HeroVideoDialog from '../ui/hero-video-dialog';
import { FadeInImage } from '../ui/fade-in-image';

const transitionVariants = {
  container: {
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.75,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      } as Transition,
    },
  },
};

export const Hero = ({ data }: { data: PageBlocksHero }) => {
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null);

  useEffect(() => {
    const key = 'hero-animation-played';
    if (!sessionStorage.getItem(key)) {
      setHasPlayed(false); // first visit: allow animation
      sessionStorage.setItem(key, '1');
    } else {
      setHasPlayed(true); // already played: skip animation
    }
  }, []);

  // Before mount: skipAnimation=true (no animation, matches SSR default)
  const skipAnimation = hasPlayed !== false;

  const noAnimVariants = {
    container: { visible: {} },
    item: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
  };

  return (
    <Section background={data.background!} size='full' className='relative -mt-20 overflow-hidden pt-20'>
      <HeroAura />
      <div className='pointer-events-none absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--hero-glow)_20%,transparent),transparent_42%)]' />
      <div className='pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 md:block bg-[linear-gradient(180deg,transparent,var(--background))]' />
      <div className='relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-[92rem] items-center gap-14 px-6 pb-12 pt-8 md:px-10 md:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-20 lg:px-12 lg:pb-16'>
        <div className='relative z-10 max-w-3xl'>
          {data.headline && (
            <div data-tina-field={tinaField(data, 'headline')}>
              {skipAnimation ? (
                <h1 className='max-w-[10ch] text-balance font-serif text-6xl leading-none tracking-[-0.04em] text-foreground sm:text-7xl md:text-[5.5rem] xl:text-[7.25rem]'>
                  {data.headline}
                </h1>
              ) : (
                <TextEffect
                  preset='fade-in-blur'
                  speedSegment={0.3}
                  as='h1'
                  className='max-w-[10ch] text-balance font-serif text-6xl leading-none tracking-[-0.04em] text-foreground sm:text-7xl md:text-[5.5rem] xl:text-[7.25rem]'
                  trigger
                >
                  {data.headline}
                </TextEffect>
              )}
            </div>
          )}

          {data.tagline && (
            <div data-tina-field={tinaField(data, 'tagline')} className='mt-6 max-w-2xl'>
              {skipAnimation ? (
                <p className='whitespace-pre-line font-sans text-base leading-8 text-muted-foreground sm:text-lg md:text-xl'>
                  {data.tagline}
                </p>
              ) : (
                <TextEffect
                  per='line'
                  preset='fade-in-blur'
                  speedSegment={0.3}
                  delay={0.3}
                  as='p'
                  className='whitespace-pre-line font-sans text-base leading-8 text-muted-foreground sm:text-lg md:text-xl'
                  trigger
                >
                  {data.tagline}
                </TextEffect>
              )}
            </div>
          )}

          <AnimatedGroup
            variants={skipAnimation ? noAnimVariants : transitionVariants}
            className='mt-10 flex w-full max-w-xl flex-col items-start gap-3 sm:flex-row sm:flex-wrap'
          >
            {data.actions?.map((action) => (
              <div key={action!.label} data-tina-field={tinaField(action)}>
                <Button
                  asChild
                  size='lg'
                  variant={action!.type === 'link' ? 'ghost' : 'default'}
                  className={
                    action!.type === 'link'
                      ? 'min-w-[11rem] justify-center rounded-full border border-border/70 bg-background/60 px-6 text-base text-foreground hover:border-accent-red/50 hover:bg-background/85'
                      : 'min-w-[11rem] justify-center rounded-full px-6 text-base'
                  }
                >
                  <Link href={action!.link!}>
                    {action?.icon && <Icon data={action?.icon} />}
                    <span className='text-nowrap'>{action!.label}</span>
                  </Link>
                </Button>
              </div>
            ))}
          </AnimatedGroup>
        </div>

        {data.image && (
          <AnimatedGroup variants={skipAnimation ? noAnimVariants : transitionVariants} className='relative w-full lg:justify-self-end'>
            <div className='relative mx-auto w-full max-w-[22rem] sm:max-w-[24rem] lg:mr-0 lg:max-w-[26rem] xl:max-w-[28rem]'>
              <div className='absolute inset-x-[12%] bottom-6 h-28 rounded-full bg-[radial-gradient(circle,_color-mix(in_oklab,var(--accent-red)_26%,transparent)_0%,transparent_72%)] blur-3xl' />
              <div className='relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-x-[16%] top-[10%] bottom-[8%] bg-[radial-gradient(circle,_color-mix(in_oklab,var(--hero-glow)_44%,transparent)_0%,transparent_72%)] blur-[56px]' />
                <div className='relative' data-tina-field={tinaField(data, 'image')}>
                  <ImageBlock image={data.image} />
                </div>
              </div>
            </div>
          </AnimatedGroup>
        )}
      </div>
    </Section>
  );
};

type LoadStage = 'placeholder' | 'video';

const HeroVideo = ({ videoSrc, placeholderSrc }: { videoSrc: string; placeholderSrc: string }) => {
  const [stage, setStage] = useState<LoadStage>('placeholder');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setStage('video');

    if (video.readyState >= 3) {
      setStage('video');
    } else {
      video.addEventListener('canplay', handleCanPlay);
      return () => video.removeEventListener('canplay', handleCanPlay);
    }
  }, []);

  const mediaCls = 'aspect-[4/5] h-auto w-full object-cover';

  return (
    <div className='flex items-center justify-center'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={placeholderSrc}
        alt=''
        aria-hidden='true'
        className={stage === 'placeholder' ? mediaCls : 'sr-only'}
      />

      <video
        ref={videoRef}
        className={stage === 'video' ? mediaCls : 'sr-only'}
        autoPlay
        loop
        muted
        playsInline
        src={videoSrc}
      />
    </div>
  );
};

const ImageBlock = ({ image }: { image: PageBlocksHeroImage }) => {
  // @ts-ignore - videoSrc will be generated by TinaCMS codegen after schema update
  if (image.videoSrc) {
    return (
      <HeroVideo
        // @ts-ignore
        videoSrc={image.videoSrc}
        placeholderSrc='/uploads/hark-placeholder.webp'
      />
    );
  }

  if (image.videoUrl) {
    let videoId = '';
    if (image.videoUrl) {
      const embedPrefix = '/embed/';
      const idx = image.videoUrl.indexOf(embedPrefix);
      if (idx !== -1) {
        videoId = image.videoUrl.substring(idx + embedPrefix.length).split('?')[0];
      }
    }
    const thumbnailSrc = image.src ? image.src! : videoId ? `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '';

    return <HeroVideoDialog videoSrc={image.videoUrl} thumbnailSrc={thumbnailSrc} thumbnailAlt='Hero Video' />;
  }

  if (image.src) {
    return (
      <FadeInImage
        className='relative z-2 aspect-[4/5] h-auto w-full object-cover'
        alt={image!.alt || ''}
        src={image!.src!}
        height={4000}
        width={3000}
        priority
      />
    );
  }
};

const AURA_GRID_SIZE = 48;
const AURA_PALETTES = {
  light: {
    base: [251, 245, 236],
    warm: [206, 119, 76],
    gold: [232, 184, 100],
    ember: [120, 73, 58],
  },
  dark: {
    base: [45, 30, 28],
    warm: [181, 110, 74],
    gold: [205, 163, 92],
    ember: [92, 56, 49],
  },
} as const;

const HeroAura = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || typeof window === 'undefined') {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;

    const syncCanvas = () => {
      canvas.width = AURA_GRID_SIZE;
      canvas.height = AURA_GRID_SIZE;
    };

    const draw = (time: number) => {
      const palette = document.documentElement.classList.contains('dark') ? AURA_PALETTES.dark : AURA_PALETTES.light;
      const t = time * 0.00034;

      for (let y = 0; y < AURA_GRID_SIZE; y += 1) {
        for (let x = 0; x < AURA_GRID_SIZE; x += 1) {
          const nx = x / AURA_GRID_SIZE;
          const ny = y / AURA_GRID_SIZE;
          const wave = Math.sin(nx * 6.4 + t) + Math.cos(ny * 5.1 - t * 1.2);
          const bloom = Math.sin((nx + ny) * 5.8 - t * 0.7);
          const swirl = Math.cos(Math.hypot(nx - 0.52, ny - 0.35) * 14 - t * 1.6);
          const warmth = (wave + 2) / 4;
          const glow = (bloom + swirl + 2) / 4;

          const red = Math.round(palette.base[0] * 0.38 + palette.warm[0] * warmth * 0.4 + palette.gold[0] * glow * 0.28 + palette.ember[0] * (1 - nx) * 0.18);
          const green = Math.round(palette.base[1] * 0.42 + palette.warm[1] * warmth * 0.34 + palette.gold[1] * glow * 0.26 + palette.ember[1] * ny * 0.16);
          const blue = Math.round(palette.base[2] * 0.48 + palette.warm[2] * warmth * 0.24 + palette.gold[2] * glow * 0.12 + palette.ember[2] * (1 - glow) * 0.16);

          context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          context.fillRect(x, y, 1, 1);
        }
      }

      frameId = window.requestAnimationFrame(draw);
    };

    syncCanvas();
    resizeObserver = new ResizeObserver(syncCanvas);
    resizeObserver.observe(canvas);
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div className='pointer-events-none absolute inset-0 hidden overflow-hidden md:block' aria-hidden='true'>
      <div className='absolute inset-x-[10%] top-[-8%] h-[86%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--hero-glow)_36%,transparent),transparent_72%)] blur-3xl' />
      <canvas
        ref={canvasRef}
        className='absolute inset-0 h-full w-full scale-110 opacity-55 blur-[18px] [mask-image:radial-gradient(circle_at_50%_34%,black_20%,black_52%,transparent_84%)]'
      />
    </div>
  );
};

export const heroBlockSchema: Template = {
  name: 'hero',
  label: 'Hero',
  ui: {
    previewSrc: '/blocks/hero.png',
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: 'This Big Text is Totally Awesome',
      text: 'Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.',
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'string',
      label: 'Headline',
      name: 'headline',
    },
    {
      type: 'string',
      label: 'Tagline',
      name: 'tagline',
    },
    {
      label: 'Actions',
      name: 'actions',
      type: 'object',
      list: true,
      ui: {
        defaultItem: {
          label: 'Action Label',
          type: 'button',
          icon: {
            name: 'Tina',
            color: 'white',
            style: 'float',
          },
          link: '/',
        },
        itemProps: (item) => ({ label: item.label }),
      },
      fields: [
        {
          label: 'Label',
          name: 'label',
          type: 'string',
        },
        {
          label: 'Type',
          name: 'type',
          type: 'string',
          options: [
            { label: 'Button', value: 'button' },
            { label: 'Link', value: 'link' },
          ],
        },
        iconSchema as any,
        {
          label: 'Link',
          name: 'link',
          type: 'string',
        },
      ],
    },
    {
      type: 'object',
      label: 'Image',
      name: 'image',
      fields: [
        {
          name: 'src',
          label: 'Image Source',
          type: 'image',
        },
        {
          name: 'alt',
          label: 'Alt Text',
          type: 'string',
        },
        {
          name: 'videoUrl',
          label: 'YouTube Embed URL',
          type: 'string',
          description: 'If using a YouTube video, make sure to use the embed version of the video URL',
        },
        {
          name: 'videoSrc',
          label: 'Video Source (MP4/WebM)',
          type: 'image',
          description: 'Upload an MP4 or WebM video file. This will autoplay and loop.',
        },
      ],
    },
  ],
};
