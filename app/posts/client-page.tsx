'use client';
import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { PostConnectionQuery, PostConnectionQueryVariables } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import { ArrowRight, UserRound } from 'lucide-react';
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
      author: {
        name: post.author?.name || 'Anonymous',
        avatar: post.author?.avatar,
      },
    };
  });

  return (
    <ErrorBoundary>
      <Section>
        <div className='container flex flex-col items-center gap-14'>
          <div className='text-center'>
            <h2 className='mx-auto mb-4 max-w-3xl text-balance text-3xl font-semibold md:text-4xl'>My Tales</h2>
            <p className='mx-auto max-w-2xl text-muted-foreground md:text-lg'>
              Stories from the code trenches, creative experiments, and everything in between.
            </p>
          </div>

          <div className='grid gap-y-12 sm:grid-cols-12 md:gap-y-14'>
            {posts.map((post) => (
              <Card
                key={post.id}
                className='order-last border-b border-x-0 border-t-0 bg-transparent py-8 sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2'
              >
                <div className='grid gap-y-6 sm:grid-cols-10 sm:gap-x-6 sm:gap-y-0 md:items-start md:gap-x-8'>
                  <div className='sm:col-span-6'>
                    <div className='mb-4'>
                      <div className='font-sans flex flex-wrap gap-3 text-[11px] uppercase tracking-wider text-muted-foreground md:gap-4'>
                        {post.tags?.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <h3 className='text-2xl font-semibold md:text-3xl'>
                      <Link href={post.url} className='transition-colors hover:text-accent-red'>
                        {post.title}
                      </Link>
                    </h3>
                    <div className='prose prose-sm mt-4 max-w-[62ch] text-muted-foreground md:mt-5'>
                      <TinaMarkdown content={post.excerpt} />
                    </div>
                    <div className='font-sans mt-6 flex items-center space-x-4 text-sm'>
                      <Avatar>
                        {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} className='h-8 w-8' />}
                        <AvatarFallback>
                          <UserRound size={16} strokeWidth={2} className='opacity-60' aria-hidden='true' />
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-muted-foreground'>{post.author.name}</span>
                      <span className='text-muted-foreground'>•</span>
                      <span className='text-muted-foreground'>{post.published}</span>
                    </div>
                    <div className='mt-5 flex items-center space-x-2 font-sans'>
                      <Link
                        href={post.url}
                        className='inline-flex items-center text-sm font-semibold text-link hover:text-accent-red hover:underline md:text-base'
                      >
                        <span>Read more</span>
                        <ArrowRight className='ml-2 size-4 transition-transform' />
                      </Link>
                    </div>
                  </div>
                  {post.heroImg && (
                    <div className='order-first sm:order-last sm:col-span-4'>
                      <Link href={post.url} className='block'>
                        <div className='aspect-[16/9] overflow-clip rounded-sm border border-border'>
                          <Image
                            width={533}
                            height={300}
                            src={post.heroImg}
                            alt={post.title}
                            className='h-full w-full object-cover transition-opacity duration-200 hover:opacity-85'
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
