import { ScrollReveal } from '@/components/motion-primitives/scroll-reveal';
import { Section } from '@/components/layout/section';
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
    <Section size='wide' className='pb-24 pt-6 md:pt-10'>
      <div className='flex items-end justify-between mb-12'>
        <ScrollReveal>
          <h2 className='font-sans text-3xl font-bold tracking-tight text-foreground'>Recent blogs</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <Link
            href='/posts'
            className='font-sans text-xs uppercase tracking-widest text-muted-foreground hover:text-accent-red transition-colors'
          >
            Browse all
          </Link>
        </ScrollReveal>
      </div>

      <div>
        {latestPosts.map((post, index) => {
          const href = `/posts/${post._sys.breadcrumbs.join('/')}`;

          return (
            <ScrollReveal key={post.id} delay={0.1 + index * 0.07}>
              <article className='group -mx-4 px-4 py-10 transition-colors hover:bg-[var(--surface-soft)]'>
                <Link href={href} className='block'>
                  <span className='mb-2 block font-sans text-[10px] uppercase tracking-widest text-muted-foreground/60'>
                    {formatPostDate(post.date)}
                  </span>
                  <h3 className='font-sans text-2xl font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent-red md:text-3xl'>
                    {post.title}
                  </h3>
                </Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </Section>
  );
}

function formatPostDate(date?: string | null) {
  if (!date) {
    return 'Undated';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Undated';
  }

  return format(parsed, 'MMM dd, yyyy');
}
