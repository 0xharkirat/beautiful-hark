import { PageBlocksVideo } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import React from 'react';
import type { Components, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { Prism } from 'tinacms/dist/rich-text/prism';
import { Mermaid } from './blocks/mermaid';
import { Video } from './blocks/video';
import { FadeInImage } from './ui/fade-in-image';

/** Converts heading text to a URL-safe anchor ID, e.g. "Hello World!" → "hello-world" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}

/**
 * Heading wrapper that stamps a stable `id` derived from the rendered text content.
 *
 * TinaMarkdown passes `children` as a rendered <TinaMarkdown> element (not a string),
 * so we cannot extract text at render time. Instead we use a ref to read `textContent`
 * from the real DOM node after mount and set the id then.
 */
function AnchoredHeading({ as: Tag, children }: { as: 'h2' | 'h3'; children: React.ReactNode }) {
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useLayoutEffect(() => {
    if (ref.current && !ref.current.id) {
      ref.current.id = slugify(ref.current.textContent ?? '');
    }
  }, []);

  return <Tag ref={ref}>{children}</Tag>;
}

// Separate client component so it can use useState/useEffect safely
// without causing hydration mismatches in the parent server component.
function DateTimeWidget({ format: fmt }: { format?: string }) {
  const [dt, setDt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setDt(new Date());
  }, []);

  if (!dt) return null;

  switch (fmt) {
    case 'iso':
      return <span>{format(dt, 'yyyy-MM-dd')}</span>;
    case 'utc':
      return <span>{format(dt, 'eee, dd MMM yyyy HH:mm:ss OOOO')}</span>;
    case 'local':
      return <span>{format(dt, 'P')}</span>;
    default:
      return <span>{format(dt, 'P')}</span>;
  }
}

export const components: Components<{
  BlockQuote: {
    children: TinaMarkdownContent;
    authorName: string;
  };
  DateTime: {
    format?: string;
  };
  NewsletterSignup: {
    placeholder: string;
    buttonText: string;
    children: TinaMarkdownContent;
    disclaimer?: TinaMarkdownContent;
  };
  video: PageBlocksVideo;
}> = {
  code_block: (props) => {
    if (!props) {
      return <></>;
    }

    if (props.lang === 'mermaid') {
      return <Mermaid value={props.value} />;
    }

    return <Prism lang={props.lang} value={props.value} />;
  },
  // Heading renderers that attach stable anchor IDs for the TOC to link to.
  h2: (props: { children: JSX.Element } | undefined) => {
    if (!props) return <></>;
    return <AnchoredHeading as='h2'>{props.children}</AnchoredHeading>;
  },
  h3: (props: { children: JSX.Element } | undefined) => {
    if (!props) return <></>;
    return <AnchoredHeading as='h3'>{props.children}</AnchoredHeading>;
  },
  BlockQuote: (props: {
    children: TinaMarkdownContent;
    authorName: string;
  }) => {
    return (
      <div className='my-8'>
        <blockquote className='border-l-2 border-accent-red/40 pl-5 italic text-muted-foreground'>
          <TinaMarkdown content={props.children} />
          <footer className='mt-3 font-sans text-xs not-italic tracking-wide text-muted-foreground'>- {props.authorName}</footer>
        </blockquote>
      </div>
    );
  },
  DateTime: (props) => {
    return <DateTimeWidget format={props.format} />;
  },
  NewsletterSignup: (props) => {
    return (
      <div className='rounded-sm border border-border bg-card'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className=''>
            <TinaMarkdown content={props.children} />
          </div>
          <div className='mt-8 '>
            <form className='sm:flex'>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email-address'
                type='email'
                autoComplete='email'
                required
                className='w-full rounded-sm border border-border bg-background px-5 py-3 font-sans placeholder:text-muted-foreground focus:border-accent-red sm:max-w-xs'
                placeholder={props.placeholder}
              />
              <div className='mt-3 rounded-sm sm:ml-3 sm:mt-0 sm:shrink-0'>
                <button
                  type='submit'
                  className='flex w-full items-center justify-center rounded-sm border border-accent-red bg-accent-red px-5 py-3 font-sans text-base font-medium text-primary-foreground hover:bg-accent-red/90 focus:outline-hidden'
                >
                  {props.buttonText}
                </button>
              </div>
            </form>
            <div className='mt-3 text-sm text-muted-foreground'>{props.disclaimer && <TinaMarkdown content={props.disclaimer} />}</div>
          </div>
        </div>
      </div>
    );
  },


  img: (props) => {
    if (!props) {
      return <></>;
    }
    return (
      <span className='my-6 flex items-center justify-center relative overflow-hidden rounded-sm border border-border'>
        <FadeInImage
          src={props.url}
          alt={props.alt || ''}
          width={500}
          height={500}
          className='w-auto h-auto max-h-[500px] object-contain'
        />
      </span>
    );
  },
  mermaid: (props: any) => <Mermaid {...props} />,
  video: (props) => {
    return <Video data={props} />;
  },
};
