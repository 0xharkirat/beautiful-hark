'use client';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { PageBlocksAbout } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { ScrollReveal } from '../motion-primitives/scroll-reveal';
import { FadeInImage } from '../ui/fade-in-image';

// ---------------------------------------------------------------------------
// Markdown renderers
// ---------------------------------------------------------------------------

const markdownComponents = {
  a: (props: any) => {
    const url = props.url || props.href;
    const isExternal = url && (url.startsWith('http') || url.startsWith('//'));
    return (
      <a
        href={url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className='text-accent-red underline decoration-accent-red/30 underline-offset-2 transition-all duration-150 hover:decoration-accent-red hover:opacity-80'
      >
        {props.children}
      </a>
    );
  },
  img: (props: any) => (
    <span className='my-8 flex flex-col items-center group'>
      <span className='overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03]'>
        <FadeInImage src={props.url} alt={props.alt || ''} width={800} height={600} className='rounded-lg w-auto h-auto max-h-[500px] object-contain' />
      </span>
      {(props.caption || props.title) && (
        <span className='mt-2 text-center text-sm font-serif italic text-muted-foreground'>{props.caption || props.title}</span>
      )}
    </span>
  ),
  Image: (props: any) => (
    <span className='my-8 flex flex-col items-center group'>
      <span className='overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03]'>
        <FadeInImage src={props.url} alt={props.alt || ''} width={800} height={600} className='rounded-lg w-auto h-auto max-h-[500px] object-contain' />
      </span>
      {props.caption && <span className='mt-2 text-center text-sm font-serif italic text-muted-foreground'>{props.caption}</span>}
    </span>
  ),
  ImagePair: (props: any) => (
    <span className='my-8 grid grid-cols-2 gap-4 not-prose'>
      {[
        { url: props.leftUrl, alt: props.leftAlt, caption: props.leftCaption },
        { url: props.rightUrl, alt: props.rightAlt, caption: props.rightCaption },
      ].map((img, i) =>
        img.url ? (
          <span key={i} className='flex flex-col items-center group'>
            <span className='overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03]'>
              <FadeInImage src={img.url} alt={img.alt || ''} width={600} height={500} className='rounded-lg w-auto h-auto max-h-[400px] object-contain' />
            </span>
            {img.caption && <span className='mt-2 text-center text-sm font-serif italic text-muted-foreground'>{img.caption}</span>}
          </span>
        ) : null
      )}
    </span>
  ),
};

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabId = 'overview' | 'career' | 'early-life';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'career', label: 'Tale of Career' },
  { id: 'early-life', label: 'Tale of Childhood & Education' },
];

const TAB_IDS = ['overview', 'career', 'early-life'] as const;

function isTabId(value: string | null): value is TabId {
  return TAB_IDS.includes(value as TabId);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const About = ({ data }: { data: PageBlocksAbout }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: TabId = isTabId(tabParam) ? tabParam : 'overview';

  const setActiveTab = (id: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', id);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && data.gallery) {
      setSelectedImageIndex((selectedImageIndex + 1) % data.gallery.length);
    }
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && data.gallery) {
      setSelectedImageIndex((selectedImageIndex - 1 + data.gallery.length) % data.gallery.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, data.gallery]);

  // Resolve section data by title prefix (case-insensitive)
  const careerSection = data.sections?.find((s: any) => s?.title?.toLowerCase().startsWith('career'));
  const earlyLifeSection = data.sections?.find((s: any) => s?.title?.toLowerCase().startsWith('early'));

  return (
    <Section className='flex-1' data-tina-field={tinaField(data)}>
      <div className='mx-auto max-w-5xl px-6 py-12'>
        {/* ---------------------------------------------------------------- */}
        {/* Page header — always visible, same across all tabs               */}
        {/* ---------------------------------------------------------------- */}
        <ScrollReveal>
          <div className='mb-10 pb-8'>
            <h1
              className='mb-2 font-sans text-5xl font-bold tracking-tighter text-foreground'
              data-tina-field={tinaField(data, 'title')}
            >
              {data.title}
            </h1>
            {data.subtitle && (
              <div className='font-serif text-xl italic text-muted-foreground' data-tina-field={tinaField(data, 'subtitle')}>
                {typeof data.subtitle === 'string' ? <p>{data.subtitle}</p> : <TinaMarkdown content={data.subtitle} components={markdownComponents} />}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- */}
        {/* Sub-tab navigation                                               */}
        {/* ---------------------------------------------------------------- */}
        <ScrollReveal>
          <div className='mb-8'>
            <div className='relative flex gap-1 border-b border-border/30 overflow-x-auto'>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'relative px-4 py-3 font-sans text-xs font-medium uppercase tracking-tight transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap shrink-0',
                    activeTab === tab.id ? 'text-accent-red' : 'text-muted-foreground opacity-70 hover:opacity-100 hover:text-accent-red',
                  ].join(' ')}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId='aboutTabIndicator'
                      className='absolute bottom-0 left-0 right-0 h-0.5 bg-accent-red'
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ---------------------------------------------------------------- */}
        {/* Tab panels                                                       */}
        {/* ---------------------------------------------------------------- */}

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
            {/* Sidebar / Profile image */}
            <div className='lg:col-span-1 order-first lg:order-last'>
              {data.profileImage && (
                <ScrollReveal delay={0.2}>
                  <div data-tina-field={tinaField(data, 'profileImage')}>
                    <div className='relative aspect-square w-full overflow-hidden rounded-t-full mb-4 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(183,35,1,0.12)]'>
                      <FadeInImage
                        src={data.profileImage}
                        alt={data.title || 'Profile'}
                        fill
                        className='object-cover'
                        priority
                        sizes='(max-width: 1024px) 100vw, 33vw'
                      />
                    </div>
                    {data.imageCaption && <div className='text-center font-serif text-sm italic text-muted-foreground'>{data.imageCaption}</div>}
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Summary text */}
            <ScrollReveal delay={0.1} className='lg:col-span-2'>
              <div className='prose max-w-none'>
                <div data-tina-field={tinaField(data, 'summary')}>
                  <TinaMarkdown content={data.summary} components={markdownComponents} />
                </div>
              </div>
              <div className='mt-6'>
                <Link href='/poems' className='group inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground transition-all duration-150 hover:gap-2.5 hover:text-accent-red'>
                  Also writes poetry &rarr;
                </Link>
              </div>
            </ScrollReveal>
          </div>
        )}

        {/* Career */}
        {activeTab === 'career' && careerSection && (
          <ScrollReveal>
            <div className='prose max-w-none'>
              <TinaMarkdown content={careerSection.content} components={markdownComponents} />
            </div>
          </ScrollReveal>
        )}

        {/* Early Life & Education */}
        {activeTab === 'early-life' && earlyLifeSection && (
          <ScrollReveal>
            <div className='prose max-w-none'>
              <TinaMarkdown content={earlyLifeSection.content} components={markdownComponents} />
            </div>
          </ScrollReveal>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Gallery — always visible below the tab content                  */}
        {/* ---------------------------------------------------------------- */}
        {data.gallery && data.gallery.length > 0 && (
          <ScrollReveal>
            <div className='mt-16 pt-8'>
              <h2 className='mb-6 font-sans text-2xl font-bold tracking-tight text-foreground'>Gallery</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {data.gallery.map((item: any, i: number) => {
                  if (!item?.src) return null;
                  return (
                    <div
                      key={i}
                      className='relative aspect-video rounded-lg overflow-hidden shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-xl hover:scale-[1.03]'
                      onClick={() => openLightbox(i)}
                    >
                      <FadeInImage
                        src={item.src || ''}
                        alt={item.alt || `Gallery image ${i + 1}`}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      />
                      <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300' />
                      {item.caption && (
                        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                          <p className='text-white text-sm font-medium truncate'>{item.caption}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Lightbox — always mounted so it can animate correctly              */}
      {/* ------------------------------------------------------------------ */}
      <Transition show={selectedImageIndex !== null} as={React.Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeLightbox}>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/80 backdrop-blur-sm' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={React.Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center outline-none'>
                  {selectedImageIndex !== null && data.gallery && data.gallery[selectedImageIndex] && (
                    <>
                      <button
                        onClick={closeLightbox}
                        className='absolute -top-10 right-0 p-2 text-white/70 hover:text-white hover:scale-110 transition-all focus:outline-none'
                      >
                        <X className='h-8 w-8' />
                      </button>

                      <button
                        onClick={showPrev}
                        className='absolute left-0 top-1/2 -translate-y-1/2 -ml-12 p-2 text-white/70 hover:text-white hover:scale-110 transition-all focus:outline-none hidden md:block'
                      >
                        <ChevronLeft className='h-10 w-10' />
                      </button>
                      <button
                        onClick={showNext}
                        className='absolute right-0 top-1/2 -translate-y-1/2 -mr-12 p-2 text-white/70 hover:text-white hover:scale-110 transition-all focus:outline-none hidden md:block'
                      >
                        <ChevronRight className='h-10 w-10' />
                      </button>

                      {data.gallery[selectedImageIndex].src && (
                        <div className='relative w-full max-h-[80vh] flex items-center justify-center'>
                          <Image
                            src={data.gallery[selectedImageIndex].src}
                            alt={data.gallery[selectedImageIndex].alt || ''}
                            width={1200}
                            height={800}
                            sizes='(max-width: 768px) 100vw, 80vw'
                            className='max-h-[80vh] w-auto mx-auto object-contain rounded-md'
                          />
                        </div>
                      )}

                      {data.gallery[selectedImageIndex].caption && (
                        <p className='mt-4 text-white/90 text-lg font-medium text-center italic'>{data.gallery[selectedImageIndex].caption}</p>
                      )}
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Section>
  );
};

// ---------------------------------------------------------------------------
// TinaCMS block schema — no schema changes needed, tabs are pure UI
// ---------------------------------------------------------------------------

export const aboutBlockSchema: Template = {
  name: 'about',
  label: 'About Page',
  ui: {
    previewSrc: '/blocks/about.png',
    defaultItem: {
      title: 'Hark Singh',
      subtitle: 'Software Engineer',
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'rich-text',
      label: 'Subtitle',
      name: 'subtitle',
    },
    {
      type: 'image',
      label: 'Profile Image',
      name: 'profileImage',
    },
    {
      type: 'string',
      label: 'Image Caption',
      name: 'imageCaption',
    },
    {
      type: 'rich-text',
      label: 'Summary Blurb',
      name: 'summary',
    },
    {
      type: 'object',
      label: 'Sections',
      name: 'sections',
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.title };
        },
      },
      fields: [
        {
          type: 'string',
          label: 'Section Title',
          name: 'title',
        },
        {
          type: 'rich-text',
          label: 'Content',
          name: 'content',
          templates: [
            {
              name: 'Image',
              label: 'Image',
              fields: [
                {
                  name: 'url',
                  label: 'URL',
                  type: 'image',
                },
                {
                  name: 'alt',
                  label: 'Alt Text',
                  type: 'string',
                },
                {
                  name: 'caption',
                  label: 'Caption',
                  type: 'string',
                },
              ],
            },
            {
              name: 'ImagePair',
              label: 'Image Pair (2-column)',
              fields: [
                { name: 'leftUrl', label: 'Left Image', type: 'image' as const },
                { name: 'leftAlt', label: 'Left Alt Text', type: 'string' as const },
                { name: 'leftCaption', label: 'Left Caption', type: 'string' as const },
                { name: 'rightUrl', label: 'Right Image', type: 'image' as const },
                { name: 'rightAlt', label: 'Right Alt Text', type: 'string' as const },
                { name: 'rightCaption', label: 'Right Caption', type: 'string' as const },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Gallery Images',
      name: 'gallery',
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.caption || 'Image' };
        },
      },
      fields: [
        { type: 'image', name: 'src', label: 'Image' },
        { type: 'string', name: 'alt', label: 'Alt Text' },
        { type: 'string', name: 'caption', label: 'Caption' },
      ],
    },
  ],
};
