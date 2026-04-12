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
    <Section background={data.background!} size='default' className='-mt-20 pt-20'>
      <div className='flex flex-col items-center py-24 text-center md:py-32'>

        {data.image && (
          <AnimatedGroup variants={skipAnimation ? noAnimVariants : transitionVariants} className='mb-8 p-4'>
            <div
              className='group/video w-28 cursor-pointer overflow-hidden rounded-xl transition-all duration-500 hover:scale-[1.25] hover:drop-shadow-[0_8px_36px_rgba(183,35,1,0.22)]'
              data-tina-field={tinaField(data, 'image')}
            >
              <ImageBlock image={data.image} />
            </div>
          </AnimatedGroup>
        )}

        {data.headline && (
          <div data-tina-field={tinaField(data, 'headline')} className='mb-6 max-w-3xl'>
            {skipAnimation ? (
              <h1 className='font-sans text-5xl font-bold tracking-tighter text-foreground md:text-7xl'>
                {data.headline}
              </h1>
            ) : (
              <TextEffect
                preset='fade-in-blur'
                speedSegment={0.3}
                as='h1'
                className='font-sans text-5xl font-bold tracking-tighter text-foreground md:text-7xl'
                trigger
              >
                {data.headline}
              </TextEffect>
            )}
          </div>
        )}

        {data.tagline && (
          <div data-tina-field={tinaField(data, 'tagline')} className='max-w-2xl'>
            {skipAnimation ? (
              <p className='whitespace-pre-line font-serif text-xl italic leading-relaxed text-muted-foreground md:text-2xl'>
                {data.tagline}
              </p>
            ) : (
              <TextEffect
                per='line'
                preset='fade-in-blur'
                speedSegment={0.3}
                delay={0.3}
                as='p'
                className='whitespace-pre-line font-serif text-xl italic leading-relaxed text-muted-foreground md:text-2xl'
                trigger
              >
                {data.tagline}
              </TextEffect>
            )}
          </div>
        )}

        <AnimatedGroup
          variants={skipAnimation ? noAnimVariants : transitionVariants}
          className='mt-12 flex flex-wrap justify-center gap-4'
        >
          {data.actions?.map((action) => (
            <div key={action!.label} data-tina-field={tinaField(action)}>
              <Link
                href={action!.link!}
                className={
                  action!.type === 'link'
                    ? 'inline-block rounded-md border border-border/60 bg-[var(--surface-soft)] px-8 py-3 font-sans text-sm font-medium uppercase tracking-wider text-accent-red transition-colors hover:bg-muted'
                    : 'inline-block rounded-md bg-gradient-to-r from-accent-red to-primary px-8 py-3 font-sans text-sm font-medium uppercase tracking-wider text-white shadow-lg shadow-accent-red/10 transition-all hover:-translate-y-0.5 hover:shadow-accent-red/20'
                }
              >
                {action?.icon && <Icon data={action?.icon} />}
                <span className='text-nowrap'>{action!.label}</span>
              </Link>
            </div>
          ))}
        </AnimatedGroup>
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
