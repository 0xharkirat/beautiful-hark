'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

interface GiscusCommentsProps {
  /** Post path used as the discussion mapping term (e.g. "/posts/my-slug") */
  term: string;
}

const GISCUS_REPO = '0xharkirat/beautiful-hark';
const GISCUS_REPO_ID = 'R_kgDOQph0Xw';
const GISCUS_CATEGORY = 'General';
const GISCUS_CATEGORY_ID = 'DIC_kwDOQph0X84C3gWD';

export function GiscusComments({ term }: GiscusCommentsProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove any previously injected iframe/script so we get a fresh widget
    // when the post slug changes or theme flips.
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', GISCUS_REPO);
    script.setAttribute('data-repo-id', GISCUS_REPO_ID);
    script.setAttribute('data-category', GISCUS_CATEGORY);
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-term', term);
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', resolvedTheme === 'dark' ? 'dark' : 'light');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');

    container.appendChild(script);
  }, [term, resolvedTheme]);

  return (
    <div className='mt-16 pt-10 border-t border-border'>
      <h2 className='mb-2 font-serif text-2xl font-semibold'>Comments</h2>
      <p className='mb-6 text-sm text-muted-foreground'>
        To edit a comment, click its timestamp. It will open the GitHub Discussion where you can edit your comment.
      </p>
      <div ref={containerRef} />
    </div>
  );
}
