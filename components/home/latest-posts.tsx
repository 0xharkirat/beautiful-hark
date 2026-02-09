import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import type { PostConnectionQuery } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Link from 'next/link';

interface LatestPostsProps {
  posts: PostConnectionQuery['postConnection']['edges'];
}

export function LatestPosts({ posts }: LatestPostsProps) {
  const latestPosts = (posts ?? [])
    .map((edge) => edge?.node)
    .filter((post): post is NonNullable<typeof post> => Boolean(post))
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;

      return bDate - aDate;
    })
    .slice(0, 3);

  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <Section>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex items-end justify-between gap-4'>
          <h2 className='text-2xl font-semibold md:text-3xl'>Latest from the Blog</h2>
          <Link href='/posts' className='font-sans text-sm text-link hover:text-accent-red hover:underline'>
            View all posts
          </Link>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {latestPosts.map((post) => {
            const published = post.date ? format(new Date(post.date), 'MMM dd, yyyy') : '';
            const href = `/posts/${post._sys.breadcrumbs.join('/')}`;

            return (
              <Card key={post.id} className='h-full border border-border bg-card p-5'>
                <p className='mb-3 font-sans text-xs uppercase tracking-wide text-muted-foreground'>{published}</p>
                <h3 className='text-xl font-semibold leading-tight'>
                  <Link href={href} className='hover:text-accent-red'>
                    {post.title}
                  </Link>
                </h3>
                <div className='mt-5'>
                  <Link href={href} className='font-sans text-sm text-link hover:text-accent-red hover:underline'>
                    Read post
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
