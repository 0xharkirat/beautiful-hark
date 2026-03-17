'use client';
import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { TagChip } from '@/components/posts/tag-chip';
import { TagSidebar } from '@/components/posts/tag-sidebar';
import { Card } from '@/components/ui/card';
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
    <div className='container mx-auto max-w-6xl px-4 py-16'>
      <div className='mb-12 text-center'>
        <h1 className='mb-3 text-4xl font-semibold tracking-tight md:text-5xl'>Chronicles of His Holy Harkness</h1>
        <p className='text-lg text-muted-foreground'>Sacred scriptures of code, tabla beats, and digital adventures from the realm of Hark</p>
      </div>

      <div className='flex flex-col gap-10 lg:flex-row lg:gap-12'>
        <TagSidebar tags={sortedTags} activeTag={activeTag} />

        <div className='min-w-0 flex-1'>
          {activeTag && (
            <p className='mb-6 text-sm text-muted-foreground'>
              Showing {visiblePosts.length} post{visiblePosts.length !== 1 ? 's' : ''} tagged <span className='font-medium text-foreground'>{activeTag}</span>
            </p>
          )}

          {visiblePosts.length === 0 ? (
            <p className='text-muted-foreground'>No posts found for this tag.</p>
          ) : (
            <div className='space-y-10'>
              {visiblePosts.map((post) => (
                <Card key={post.id} className='group overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
                  <div className='flex flex-col gap-6 p-8 sm:flex-row sm:gap-8'>
                    <div className='flex-1'>
                      <Link href={post.url}>
                        <h2 className='mb-3 text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent-red md:text-3xl'>
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <div className='prose prose-sm mb-4 max-w-none text-muted-foreground'>
                          <TinaMarkdown content={post.excerpt} />
                        </div>
                      )}
                      <div className='flex flex-wrap items-center gap-3'>
                        <span className='text-sm text-muted-foreground'>{post.published}</span>
                        <span className='text-sm text-muted-foreground'>
                          {post.comments} comment{post.comments === 1 ? '' : 's'}
                        </span>
                        {post.updatedAt && (
                          <span className='inline-flex items-center rounded-sm border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground'>
                            Updated {post.updatedAt}
                          </span>
                        )}
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
                      <div className='shrink-0 sm:w-56'>
                        <Link href={post.url} className='block'>
                          <div className='aspect-video overflow-hidden rounded-md border border-border'>
                            <Image
                              width={400}
                              height={225}
                              src={post.heroImg}
                              alt={post.title}
                              className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
                            />
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
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
      <Section>
        <Suspense fallback={null}>
          <PostsContent data={props.data} commentCounts={props.commentCounts} />
        </Suspense>
      </Section>
    </ErrorBoundary>
  );
}
