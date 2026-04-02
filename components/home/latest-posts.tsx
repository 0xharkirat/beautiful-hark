import { ScrollReveal } from '@/components/motion-primitives/scroll-reveal';
import { Section } from '@/components/layout/section';
import type { PostConnectionQuery } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
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

  const [leadPost, ...supportingPosts] = latestPosts;

  return (
    <Section size='wide' className='pb-24 pt-6 md:pt-10'>
      <div className='grid gap-8 border-t border-border/70 pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-12'>
        <ScrollReveal>
          <div className='max-w-xl'>
            <h2 className='font-serif text-4xl leading-none tracking-[-0.04em] text-foreground md:text-5xl'>Recent blogs</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className='flex items-end justify-between gap-4 border-t border-border/60 pt-5 lg:h-full lg:border-t-0 lg:border-l lg:pl-8'>
            <Link href='/posts' className='font-sans text-sm font-medium text-link transition-colors hover:text-accent-red'>
              Browse the archive
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <div className='mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)] lg:gap-12'>
        <ScrollReveal delay={0.12}>
          <article className='overflow-hidden rounded-[2rem] border border-border/70 bg-[var(--surface-soft)] shadow-[0_20px_80px_-52px_rgba(44,26,15,0.55)]'>
            <Link href={`/posts/${leadPost._sys.breadcrumbs.join('/')}`} className='block'>
              {leadPost.heroImg ? (
                <div className='relative aspect-[16/10] overflow-hidden border-b border-border/60'>
                  <Image
                    src={leadPost.heroImg}
                    alt={leadPost.title}
                    fill
                    className='object-cover transition-transform duration-700 ease-out hover:scale-[1.03]'
                  />
                </div>
              ) : (
                <div className='aspect-[16/10] border-b border-border/60 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--accent-red)_20%,transparent),transparent_65%),linear-gradient(180deg,var(--surface-soft),var(--surface-strong))]' />
              )}
            </Link>

            <div className='grid gap-6 p-6 md:p-8'>
              <div className='flex flex-wrap items-center gap-3 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                <span>{formatPostDate(leadPost.date)}</span>
                <span className='h-1 w-1 rounded-full bg-border' />
                <span>Lead story</span>
              </div>

              <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.62fr)] md:gap-8'>
                <div>
                  <h3 className='max-w-[14ch] font-serif text-3xl leading-tight tracking-[-0.035em] text-foreground md:text-[2.35rem]'>
                    <Link href={`/posts/${leadPost._sys.breadcrumbs.join('/')}`} className='transition-colors hover:text-accent-red'>
                      {leadPost.title}
                    </Link>
                  </h3>
                </div>

                <div className='space-y-4 self-end'>
                  <Link href={`/posts/${leadPost._sys.breadcrumbs.join('/')}`} className='inline-flex items-center font-sans text-sm font-medium text-link transition-colors hover:text-accent-red'>
                    Read the story
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </ScrollReveal>

        <div className='grid gap-8'>
          {supportingPosts.map((post, index) => {
            const href = `/posts/${post._sys.breadcrumbs.join('/')}`;

            return (
              <ScrollReveal key={post.id} delay={0.18 + index * 0.08}>
                <article className='grid gap-4 border-t border-border/70 pt-5 md:grid-cols-[auto_minmax(0,1fr)] md:gap-5'>
                  <div className='font-sans text-[0.68rem] font-medium uppercase tracking-[0.24em] text-muted-foreground'>
                    {String(index + 2).padStart(2, '0')}
                  </div>

                  <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:items-start'>
                    <div>
                      <p className='font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground'>{formatPostDate(post.date)}</p>
                      <h3 className='mt-3 font-serif text-2xl leading-tight tracking-[-0.03em] text-foreground'>
                        <Link href={href} className='transition-colors hover:text-accent-red'>
                          {post.title}
                        </Link>
                      </h3>
                    </div>

                    <Link href={href} className='group block'>
                      {post.heroImg ? (
                        <div className='relative aspect-[4/5] overflow-hidden rounded-[1.35rem] border border-border/60 bg-[var(--surface-strong)]'>
                          <Image src={post.heroImg} alt={post.title} fill className='object-cover transition-transform duration-500 ease-out group-hover:scale-105' />
                        </div>
                      ) : (
                        <div className='aspect-[4/5] rounded-[1.35rem] border border-border/60 bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-strong))]' />
                      )}
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
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
