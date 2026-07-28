/**
 * Island registry — single source of truth for editable regions.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';

import type { GlobalQuery, PageQuery, PoemQuery, PostQuery } from '../../tina/__generated__/types';
import type { CmsGlobal, CmsPage, CmsPoem, CmsPost } from './data';
import PageBody from '../components/islands/PageBody.astro';
import PostBody from '../components/islands/PostBody.astro';
import PoemBody from '../components/islands/PoemBody.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getGlobal, getPage, getPoem, getPost } from './data';

export const islands: IslandRegistry = {
  page: {
    fetch: (_request, params) => getPage(params.get('slug') ?? 'home'),
    component: PageBody,
    wrapper: { tag: 'main' },
    propsFromData: (data) => ({
      data: (data as QueryResult<PageQuery>).data?.page as CmsPage | undefined,
    }),
  },
  post: {
    fetch: (_request, params) => getPost(params.get('slug') ?? ''),
    component: PostBody,
    wrapper: { tag: 'article' },
    propsFromData: (data) => ({
      data: (data as QueryResult<PostQuery>).data?.post as CmsPost | undefined,
    }),
  },
  poem: {
    fetch: (_request, params) => getPoem(params.get('slug') ?? ''),
    component: PoemBody,
    wrapper: { tag: 'article' },
    propsFromData: (data) => ({
      data: (data as QueryResult<PoemQuery>).data?.poem as CmsPoem | undefined,
    }),
  },
  global: {
    fetch: () => getGlobal(),
    component: Header,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      config: (data as QueryResult<GlobalQuery>).data?.global as CmsGlobal | undefined,
    }),
  },
  'global-footer': {
    fetch: () => getGlobal(),
    component: Footer,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      config: (data as QueryResult<GlobalQuery>).data?.global as CmsGlobal | undefined,
    }),
  },
};
