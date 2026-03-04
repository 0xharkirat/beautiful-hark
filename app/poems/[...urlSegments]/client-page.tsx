'use client';

import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import type { PoemQuery } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'motion/react';
import { tinaField, useTina } from 'tinacms/dist/react';

interface PoemClientPageProps {
  data: PoemQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function PoemClientPage(props: PoemClientPageProps) {
  const { data } = useTina({ ...props });
  const poem = data.poem;

  const date = poem.date ? new Date(poem.date) : null;
  const formattedDate = date && !Number.isNaN(date.getTime()) ? format(date, 'MMMM dd, yyyy') : '';
  const isPunjabi = poem.language === 'Punjabi';

  return (
    <ErrorBoundary>
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className='mx-auto max-w-xl py-16'
        >
          {/* Back link */}
          <Link href='/poems' className='mb-10 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent-red'>
            &larr; All poems
          </Link>

          {/* Title */}
          <h1 data-tina-field={tinaField(poem, 'title')} className='mb-3 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl'>
            {poem.title}
          </h1>

          {/* Meta */}
          <div className='mb-10 flex flex-wrap items-center gap-3'>
            {formattedDate && (
              <span data-tina-field={tinaField(poem, 'date')} className='text-sm text-muted-foreground'>
                {formattedDate}
              </span>
            )}
            {isPunjabi && <span className='rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground'>Punjabi</span>}
          </div>

          {/* Poem body */}
          <div data-tina-field={tinaField(poem, 'lines')} className='space-y-0'>
            {(poem.lines ?? []).map((line, i) => {
              const text = line?.text ?? '';
              const translation = line?.translation ?? '';
              const isEmpty = text.trim().length === 0;

              if (isEmpty) {
                // Blank line = stanza break
                return <div key={i} className='h-5' aria-hidden='true' />;
              }

              return (
                <div key={i} className='leading-relaxed'>
                  <p className='font-serif text-xl text-foreground'>{text}</p>
                  {translation && translation.trim().length > 0 && <p className='font-serif text-base text-foreground/60 italic'>{translation}</p>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </Section>
    </ErrorBoundary>
  );
}
