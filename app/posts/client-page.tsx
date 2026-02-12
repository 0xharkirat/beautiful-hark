'use client';
import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { PostConnectionQuery, PostConnectionQueryVariables } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface ClientPostProps {
  data: PostConnectionQuery;
  variables: PostConnectionQueryVariables;
  query: string;
}

export default function PostsClientPage(props: ClientPostProps) {
  const posts = props.data?.postConnection.edges!.map((postData) => {
    const post = postData!.node!;
    const date = new Date(post.date!);
    let formattedDate = '';
    if (!isNaN(date.getTime())) {
      formattedDate = format(date, 'MMM dd, yyyy');
    }

    return {
      id: post.id,
      published: formattedDate,
      title: post.title,
      tags: post.tags?.map((tag) => tag?.tag?.name) || [],
      url: `/posts/${post._sys.breadcrumbs.join('/')}`,
      excerpt: post.excerpt,
      heroImg: post.heroImg,
    };
  });

  return (
    <ErrorBoundary>
      <Section>
        <div className='container mx-auto max-w-5xl px-4 py-16'>
          <div className='mb-16'>
            <h1 className='mb-3 text-4xl font-semibold tracking-tight md:text-5xl'>Chronicles of His Holy Harkness</h1>
            <p className='text-lg text-muted-foreground'>Sacred scriptures of code, tabla beats, and digital adventures from the realm of Hark</p>
          </div>

          <div className='space-y-12'>
            {posts.map((post) => (
              <Card key={post.id} className='group overflow-hidden border-border bg-card transition-all duration-200 hover:shadow-lg'>
                <div className='flex flex-col gap-6 p-8 sm:flex-row sm:gap-8'>
                  <div className='flex-1'>
                    <Link href={post.url}>
                      <h2 className='mb-3 text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent-red md:text-3xl'>
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <div className='prose prose-sm mb-5 max-w-none text-muted-foreground'>
                        <TinaMarkdown content={post.excerpt} />
                      </div>
                    )}
                    <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                      <span>{post.published}</span>
                    </div>
                  </div>
                  {post.heroImg && (
                    <div className='shrink-0 sm:w-64'>
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
        </div>
      </Section>
    </ErrorBoundary>
  );
}
