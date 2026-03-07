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
    <div className='mx-auto max-w-4xl py-16'>
      <div className='mb-14 text-center'>
        <h1 className='mb-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl'>Poems</h1>
        <p className='text-lg text-muted-foreground'>Simple poems written with heart. Some based on real life.</p>
      </div>

      {poems.length === 0 ? (
        <p className='text-center text-muted-foreground'>No poems yet.</p>
      ) : (
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2'>
          {poems.map((poem) => (
            <Link key={poem.id} href={poem.url} className='group block'>
              <article className='h-full rounded-lg border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent-red hover:shadow-lg'>
                <div className='mb-2 flex flex-wrap items-baseline gap-2'>
                  <h2 className='font-serif text-xl font-semibold leading-snug transition-colors group-hover:text-accent-red'>{poem.title}</h2>
                  {poem.language === 'Punjabi' && <span className='rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground'>Punjabi</span>}
                </div>

                {poem.date && <p className='mb-4 text-sm text-muted-foreground'>{poem.date}</p>}

                <div className='space-y-1 font-serif text-sm leading-relaxed text-muted-foreground'>
                  {poem.previewLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                <p className='mt-4 text-sm text-accent-red opacity-0 transition-opacity group-hover:opacity-100'>Read &rarr;</p>
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
