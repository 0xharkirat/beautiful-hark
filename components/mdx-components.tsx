import { PageBlocksVideo } from '@/tina/__generated__/types';
import { format } from 'date-fns';
import Image from 'next/image';
import React from 'react';
import type { Components, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { Prism } from 'tinacms/dist/rich-text/prism';
import { Mermaid } from './blocks/mermaid';
import { Video } from './blocks/video';

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
    const dt = React.useMemo(() => {
      return new Date();
    }, []);

    switch (props.format) {
      case 'iso':
        return <span>{format(dt, 'yyyy-MM-dd')}</span>;
      case 'utc':
        return <span>{format(dt, 'eee, dd MMM yyyy HH:mm:ss OOOO')}</span>;
      case 'local':
        return <span>{format(dt, 'P')}</span>;
      default:
        return <span>{format(dt, 'P')}</span>;
    }
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
      <span className='my-6 flex items-center justify-center'>
        <Image src={props.url} alt={props.alt || ''} width={500} height={500} className='rounded-sm border border-border' />
      </span>
    );
  },
  mermaid: (props: any) => <Mermaid {...props} />,
  video: (props) => {
    return <Video data={props} />;
  },
};
