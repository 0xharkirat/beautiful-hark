'use client';
import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { TagChip } from '@/components/posts/tag-chip';
import { TagSidebar } from '@/components/posts/tag-sidebar';
import type { PostConnectionQuery, PostConnectionQueryVariables } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface ClientPostProps {
  data: PostConnectionQuery;
  variables: PostConnectionQueryVariables;
  query: string;
  commentCounts: Record<string, number>;
}

function normalizeDiscussionTerm(term: string): string {
  return term.replace(/^\/+/, '').replace(/\/+$/, '');
}

function PostsContent({ data, commentCounts }: { data: PostConnectionQuery; commentCounts: Record<string, number> }) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');

  const allPosts = (data?.postConnection.edges ?? [])
    .map((postData) => {
      const post = postData?.node;
      if (!post) return null;
      const date = post.date ? new Date(post.date) : null;
      const formattedDate = date && !Number.isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '';
      const updatedAt = post.updatedAt ? new Date(post.updatedAt) : null;
      const formattedUpdatedAt = updatedAt && !Number.isNaN(updatedAt.getTime()) ? format(updatedAt, 'MMM dd, yyyy') : null;
      return {
        id: post.id,
        published: formattedDate,
        updatedAt: formattedUpdatedAt,
        title: post.title,
        tags: (post.tags ?? []).map((t) => t?.tag?.name).filter((n): n is string => Boolean(n)),
        url: `/posts/${post._sys.breadcrumbs.join('/')}`,
        comments: commentCounts[normalizeDiscussionTerm(`/posts/${post._sys.breadcrumbs.join('/')}`)] ?? 0,
        excerpt: post.excerpt,
        heroImg: post.heroImg,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Build tag counts across all posts
  const tagCounts = allPosts.reduce<Record<string, number>>((acc, post) => {
    for (const tag of post.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const visiblePosts = activeTag ? allPosts.filter((post) => post.tags.includes(activeTag)) : allPosts;

  return (
    <div className='py-2 md:py-4'>
      <div className='mx-auto max-w-3xl pb-8 text-center md:pb-10'>
        <h1 className='font-serif text-5xl leading-none tracking-[-0.04em] text-foreground md:text-6xl'>All blogs</h1>
        <p className='mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg'>
          Sharing is caring. Whatever I learn, I try to share clearly.
        </p>
      </div>

      <div className='mt-10 flex flex-col gap-10 lg:flex-row lg:gap-14'>
        <TagSidebar tags={sortedTags} activeTag={activeTag} />

        <div className='min-w-0 flex-1'>
          {activeTag && (
            <p className='mb-8 text-sm text-muted-foreground'>
              Showing {visiblePosts.length} post{visiblePosts.length !== 1 ? 's' : ''} tagged <span className='font-medium text-foreground'>{activeTag}</span>
            </p>
          )}

          {visiblePosts.length === 0 ? (
            <p className='text-muted-foreground'>No posts found for this tag.</p>
          ) : (
            <div className='space-y-10'>
              {visiblePosts.map((post, index) => {
                const hasImage = Boolean(post.heroImg);

                return (
                  <article key={post.id} className='grid gap-5 pt-2 md:grid-cols-[auto_minmax(0,1fr)]'>
                    <div className='font-sans text-[0.68rem] font-medium uppercase tracking-[0.24em] text-muted-foreground'>
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className={hasImage ? 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start xl:gap-8' : 'grid gap-5'}>
                      <div>
                        <div className='flex flex-wrap items-center gap-3 font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                          <span>{post.published}</span>
                          <span className='h-1 w-1 rounded-full bg-border' />
                          <span>
                            {post.comments} comment{post.comments === 1 ? '' : 's'}
                          </span>
                          {post.updatedAt && (
                            <>
                              <span className='h-1 w-1 rounded-full bg-border' />
                              <span>Updated {post.updatedAt}</span>
                            </>
                          )}
                        </div>

                        <h2 className='mt-3 max-w-[18ch] font-serif text-3xl leading-tight tracking-[-0.035em] text-foreground transition-colors hover:text-accent-red md:text-[2.35rem]'>
                          <Link href={post.url}>{post.title}</Link>
                        </h2>

                        {post.excerpt && (
                          <div className='prose prose-sm mt-4 max-w-none text-muted-foreground'>
                            <TinaMarkdown content={post.excerpt} />
                          </div>
                        )}

                        <div className='mt-5 flex flex-wrap items-center gap-3'>
                          <Link href={post.url} className='font-sans text-sm font-medium text-link transition-colors hover:text-accent-red'>
                            Read article
                          </Link>
                          {post.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1.5'>
                              {post.tags.map((tag) => (
                                <TagChip key={tag} name={tag} isActive={activeTag === tag} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {post.heroImg && (
                        <Link href={post.url} className='group block xl:justify-self-end'>
                          <div className='relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-border/60 bg-[var(--surface-strong)]'>
                            <Image
                              width={320}
                              height={400}
                              src={post.heroImg}
                              alt={post.title}
                              className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105'
                            />
                          </div>
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostsClientPage(props: ClientPostProps) {
  return (
    <ErrorBoundary>
      <Section size='wide'>
        <Suspense fallback={null}>
          <PostsContent data={props.data} commentCounts={props.commentCounts} />
        </Suspense>
      </Section>
    </ErrorBoundary>
  );
}
