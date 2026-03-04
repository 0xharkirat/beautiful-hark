'use client';

import ErrorBoundary from '@/components/error-boundary';
import { Section } from '@/components/layout/section';
import type { PoemConnectionQuery, PoemConnectionQueryVariables } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Link from 'next/link';

interface PoemsClientPageProps {
  data: PoemConnectionQuery;
  variables: PoemConnectionQueryVariables;
  query: string;
}

function PoemsContent({ data }: { data: PoemConnectionQuery }) {
  const poems = (data?.poemConnection.edges ?? [])
    .map((edge) => {
      const poem = edge?.node;
      if (!poem) return null;
      const date = poem.date ? new Date(poem.date) : null;
      const formattedDate = date && !Number.isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '';
      // First few non-empty lines for the preview
      const previewLines = (poem.lines ?? [])
        .map((l) => l?.text ?? '')
        .filter((t) => t.trim().length > 0)
        .slice(0, 3);

      return {
        id: poem.id,
        title: poem.title,
        date: formattedDate,
        language: poem.language ?? 'English',
        previewLines,
        url: `/poems/${poem._sys.breadcrumbs.join('/')}`,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <div className='mx-auto max-w-2xl py-16'>
      <div className='mb-14 text-center'>
        <h1 className='mb-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl'>Poems</h1>
        <p className='text-lg text-muted-foreground'>Words written in quiet moments, in two languages.</p>
      </div>

      {poems.length === 0 ? (
        <p className='text-center text-muted-foreground'>No poems yet.</p>
      ) : (
        <div className='space-y-12'>
          {poems.map((poem) => (
            <Link key={poem.id} href={poem.url} className='group block'>
              <article className='border-b border-border pb-12 last:border-0 last:pb-0'>
                <div className='mb-3 flex flex-wrap items-baseline gap-3'>
                  <h2 className='font-serif text-2xl font-semibold transition-colors group-hover:text-accent-red'>{poem.title}</h2>
                  {poem.language === 'Punjabi' && <span className='rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground'>Punjabi</span>}
                </div>

                {poem.date && <p className='mb-4 text-sm text-muted-foreground'>{poem.date}</p>}

                <div className='space-y-1 font-serif text-base leading-relaxed text-muted-foreground'>
                  {poem.previewLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  <p className='text-sm text-accent-red opacity-0 transition-opacity group-hover:opacity-100'>Read more &rarr;</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PoemsClientPage(props: PoemsClientPageProps) {
  return (
    <ErrorBoundary>
      <Section>
        <PoemsContent data={props.data} />
      </Section>
    </ErrorBoundary>
  );
}
