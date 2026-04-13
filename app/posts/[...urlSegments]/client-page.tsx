'use client';

import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { components } from '@/components/mdx-components';
import { GiscusComments } from '@/components/posts/giscus-comments';
import { TableOfContents } from '@/components/posts/table-of-contents';
import { TagChip } from '@/components/posts/tag-chip';
import { ShareBar } from '@/components/ui/share-bar';
import type { PostQuery } from '@/tina/__generated__/types';
import { getSiteUrl } from '@/lib/feed-config';
import { format } from 'date-fns';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

const ARTICLE_ID = 'post-article';

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
  const pathname = usePathname();

  const date = post.date ? new Date(post.date) : null;
  const formattedDate = date && !Number.isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '';

  const updatedAt = post.updatedAt ? new Date(post.updatedAt) : null;
  const formattedUpdatedAt = updatedAt && !Number.isNaN(updatedAt.getTime()) ? format(updatedAt, 'MMM dd, yyyy') : null;

  const tags = (post.tags ?? []).map((t) => t?.tag?.name).filter((n): n is string => Boolean(n));

  const postUrl = `${getSiteUrl()}${pathname}`;

  return (
    <ErrorBoundary>
      {/* No className override — keep Section's default max-w-5xl px-6 to align with the navbar */}
      <Section>
        {/*
         * Two-column layout on xl+:
         *   left  — article capped at max-w-2xl for comfortable line length
         *   right — sticky TOC aside (hidden below xl, handled inside TableOfContents)
         *
         * The outer flex container is intentionally wider than the article column
         * so the TOC has room to sit beside it without squeezing the content.
         */}
        <div className='flex gap-12 xl:gap-16'>
          <motion.article
            id={ARTICLE_ID}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className='min-w-0 flex-1 max-w-2xl py-16'
          >
            <h1 data-tina-field={tinaField(post, 'title')} className='mb-4 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl'>
              {post.title}
            </h1>

            <div className='mb-12 flex flex-wrap items-center gap-3'>
              <span data-tina-field={tinaField(post, 'date')} className='font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                {formattedDate}
              </span>
              {formattedUpdatedAt && (
                <span
                  data-tina-field={tinaField(post, 'updatedAt')}
                  className='inline-flex items-center rounded-sm bg-[var(--surface-strong)] px-2 py-0.5 text-xs font-medium text-muted-foreground'
                >
                  Updated {formattedUpdatedAt}
                </span>
              )}
              {tags.length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                  {tags.map((tag) => (
                    <TagChip key={tag} name={tag} />
                  ))}
                </div>
              )}
            </div>

            <ShareBar title={post.title} url={postUrl} className='mb-12' />

            {post.heroImg && (
              <div className='mb-12'>
                <div data-tina-field={tinaField(post, 'heroImg')} className='overflow-hidden rounded-lg bg-[var(--surface-strong)]'>
                  <Image priority src={post.heroImg} alt={post.title} width={1200} height={630} className='h-auto w-full object-cover' />
                </div>
              </div>
            )}

            <div data-tina-field={tinaField(post, '_body')} className='prose max-w-none'>
              <TinaMarkdown
                content={post._body}
                components={{
                  ...components,
                }}
              />
            </div>

            <GiscusComments term={pathname} />
          </motion.article>

          {/* TOC — desktop sticky aside + mobile floating dropdown */}
          <TableOfContents articleSelector={`#${ARTICLE_ID}`} />
        </div>
      </Section>
    </ErrorBoundary>
  );
}
