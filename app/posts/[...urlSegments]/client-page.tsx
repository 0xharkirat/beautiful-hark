'use client';

import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { components } from '@/components/mdx-components';
import type { PostQuery } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
import React from 'react';
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
        <article className='mx-auto max-w-[70ch]'>
          <h2 data-tina-field={tinaField(post, 'title')} className='mb-6 text-balance text-4xl font-semibold tracking-tight md:text-5xl'>
            {post.title}
          </h2>

          <div data-tina-field={tinaField(post, 'author')} className='mb-10 flex items-center text-sm font-sans text-muted-foreground'>
            {post.author && (
              <>
                {post.author.avatar && (
                  <div className='mr-3 shrink-0'>
                    <Image
                      data-tina-field={tinaField(post.author, 'avatar')}
                      priority
                      className='h-10 w-10 rounded-full border border-border object-cover'
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={500}
                      height={500}
                    />
                  </div>
                )}
                <p data-tina-field={tinaField(post.author, 'name')} className='text-sm text-muted-foreground'>
                  {post.author.name}
                </p>
                <span className='mx-2 text-border'>-</span>
              </>
            )}

            <p data-tina-field={tinaField(post, 'date')} className='text-sm text-muted-foreground'>
              {formattedDate}
            </p>
          </div>

          {post.heroImg && (
            <div className='mb-10 w-full'>
              <div data-tina-field={tinaField(post, 'heroImg')} className='mx-auto max-w-[70ch]'>
                <Image
                  priority
                  src={post.heroImg}
                  alt={post.title}
                  width={500}
                  height={500}
                  className='mx-auto block h-auto w-full rounded-sm border border-border'
                />
              </div>
            </div>
          )}

          <div data-tina-field={tinaField(post, '_body')} className='prose prose-lg dark:prose-invert max-w-[70ch]'>
            <TinaMarkdown
              content={post._body}
              components={{
                ...components,
              }}
            />
          </div>
        </article>
      </Section>
    </ErrorBoundary>
  );
}
