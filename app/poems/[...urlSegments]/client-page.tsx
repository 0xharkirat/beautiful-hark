'use client';

import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { GiscusComments } from '@/components/posts/giscus-comments';
import type { PoemQuery } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface PoemClientPageProps {
  data: PoemQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

type RichTextNode = {
  type: string;
  children?: RichTextNode[];
  text?: string;
};

function isRichTextNode(value: unknown): value is RichTextNode {
  return Boolean(value && typeof value === 'object' && 'type' in value);
}

function resolveDescription(primary: unknown, fallback: unknown): { kind: 'text'; value: string } | { kind: 'rich'; value: RichTextNode } | null {
  const candidates = [primary, fallback];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (isRichTextNode(candidate)) {
      return { kind: 'rich', value: candidate };
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed || trimmed === '[object Object]') continue;

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (isRichTextNode(parsed)) {
            return { kind: 'rich', value: parsed };
          }
        } catch {
          // Keep plain text fallback below.
        }
      }

      return { kind: 'text', value: candidate };
    }
  }

  return null;
}

export default function PoemClientPage(props: PoemClientPageProps) {
  const { data } = useTina({ ...props });
  const poem = data.poem;
  const pathname = usePathname();

  const date = poem.date ? new Date(poem.date) : null;
  const formattedDate = date && !Number.isNaN(date.getTime()) ? format(date, 'MMMM dd, yyyy') : '';
  const isPunjabi = poem.language === 'Punjabi';
  const description = resolveDescription(poem.description, props.data.poem.description);
  const hasDescription = Boolean(description);

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
          {hasDescription && (
            <details data-tina-field={tinaField(poem, 'description')} className='group mb-8 rounded-md border border-border bg-card/60'>
              <summary className='flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-sans text-sm font-medium text-foreground marker:content-none'>
                <span>Read the story behind this poem</span>
                <ChevronDown className='size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180' aria-hidden='true' />
              </summary>
              <div className='border-t border-border px-4 py-4'>
                {description?.kind === 'text' ? (
                  <p className='whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/85'>{description.value}</p>
                ) : (
                  <div className='prose prose-sm max-w-none dark:prose-invert'>
                    <TinaMarkdown content={description?.value ?? { type: 'root', children: [] }} />
                  </div>
                )}
              </div>
            </details>
          )}

          <div data-tina-field={tinaField(poem, 'lines')} className='space-y-0'>
            {(poem.lines ?? []).map((line, i) => {
              const text = line?.text ?? '';
              const translation = line?.translation ?? '';
              const isEmpty = text.trim().length === 0;

              if (isEmpty) {
                // Blank line = stanza break
                return (
                  <div key={i} className='py-3 text-center text-sm tracking-widest text-foreground/35 select-none' aria-hidden='true'>
                    ...
                  </div>
                );
              }

              return (
                <div key={i} className='max-w-[90%] leading-relaxed text-left'>
                  <p className='font-serif text-xl text-foreground'>{text}</p>
                  {translation && translation.trim().length > 0 && <p className='font-serif text-base text-foreground/75 italic dark:text-foreground/85'>{translation}</p>}
                </div>
              );
            })}
          </div>

          <GiscusComments term={pathname} />
        </motion.div>
      </Section>
    </ErrorBoundary>
  );
}
