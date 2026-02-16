'use client';

import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { components } from '@/components/mdx-components';
import type { PostQuery } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
import React from 'react';
import { motion } from 'motion/react';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface ClientPostProps {
  data: PostQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function PostClientPage(props: ClientPostProps) {
  const { data } = useTina({ ...props });
  const post = data.post;

  const date = new Date(post.date!);
  let formattedDate = '';
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy');
  }

  return (
    <ErrorBoundary>
      <Section>
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className='mx-auto max-w-3xl px-4 py-16'
        >
          <h1 data-tina-field={tinaField(post, 'title')} className='mb-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl'>
            {post.title}
          </h1>

          <div className='mb-12 flex items-center gap-3 text-sm text-muted-foreground'>
            <span data-tina-field={tinaField(post, 'date')}>{formattedDate}</span>
          </div>

          {post.heroImg && (
            <div className='mb-12'>
              <div data-tina-field={tinaField(post, 'heroImg')} className='overflow-hidden rounded-lg border border-border'>
                <Image priority src={post.heroImg} alt={post.title} width={1200} height={630} className='h-auto w-full object-cover' />
              </div>
            </div>
          )}

          <div data-tina-field={tinaField(post, '_body')} className='prose prose-lg dark:prose-invert max-w-none'>
            <TinaMarkdown
              content={post._body}
              components={{
                ...components,
              }}
            />
          </div>
        </motion.article>
      </Section>
    </ErrorBoundary>
  );
}
