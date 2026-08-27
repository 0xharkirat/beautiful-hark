/**
 * Island registry — single source of truth for editable regions.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';

import type { DatingQuery, GlobalQuery, PageQuery, PoemQuery, PostQuery } from '../../tina/__generated__/types';
import type { CmsDating, CmsGlobal, CmsPage, CmsPoem, CmsPost } from './data';
import PageBody from '../components/islands/PageBody.astro';
import PostBody from '../components/islands/PostBody.astro';
import PoemBody from '../components/islands/PoemBody.astro';
import DatingBody from '../components/islands/DatingBody.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getDating, getGlobal, getPage, getPoem, getPost } from './data';

export const islands: IslandRegistry = {
  page: {
    fetch: (_request, params) => getPage(params.get('slug') ?? 'home'),
    component: PageBody,
    // div, not main. Base.astro already wraps every page in <main id="main">, so
    // this wrapper rendered a second <main> nested inside the first: invalid
    // HTML, and two `main` landmarks for a screen reader to choose between.
    //
    // It also broke view transitions. Naming <main> as a transition group found
    // two elements with the same name, which makes the API reject the whole
    // transition rather than degrade, so navigation silently lost its crossfade
    // on exactly the three pages that use this island.
    wrapper: { tag: 'div' },
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
  dating: {
    fetch: () => getDating(),
    component: DatingBody,
    // div, not main. DatingBody renders its own <header> and <main>, and the
    // wrapper sits outside both.
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<DatingQuery>).data?.dating as CmsDating | undefined,
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
