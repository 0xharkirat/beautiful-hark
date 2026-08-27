/**
 * Per-collection Tina data loaders + derived types.
 */
import type { TinaRichTextContent } from '@tinacms/astro';
import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';

export const getGlobal = () =>
  requestWithMetadata(client.queries.global({ relativePath: 'index.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: `${slug}.mdx` }), { priority: 'primary' });

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: `${slug}.mdx` }), { priority: 'primary' });

export const getPoem = (slug: string) =>
  requestWithMetadata(client.queries.poem({ relativePath: `${slug}.json` }), { priority: 'primary' });

/** The unlisted /dating page. One document, so no slug. */
export const getDating = () =>
  requestWithMetadata(client.queries.dating({ relativePath: 'profile.json' }), {
    priority: 'primary',
  });

export async function listPosts() {
  const result = await client.queries.postConnection();
  return (result.data.postConnection.edges ?? [])
    .flatMap((edge) => (edge?.node ? [edge.node] : []))
    .sort((a, b) => {
      const ad = a.date ? new Date(a.date).valueOf() : 0;
      const bd = b.date ? new Date(b.date).valueOf() : 0;
      return bd - ad;
    });
}

export async function listPoems() {
  const result = await client.queries.poemConnection();
  return (result.data.poemConnection.edges ?? [])
    .flatMap((edge) => (edge?.node ? [edge.node] : []))
    .sort((a, b) => {
      const ad = a.date ? new Date(a.date).valueOf() : 0;
      const bd = b.date ? new Date(b.date).valueOf() : 0;
      return bd - ad;
    });
}

export async function listPages() {
  const result = await client.queries.pageConnection();
  return (result.data.pageConnection.edges ?? [])
    .flatMap((edge) => (edge?.node ? [edge.node] : []));
}

export type CmsGlobal = Awaited<ReturnType<typeof getGlobal>>['data']['global'];
export type CmsPage = Awaited<ReturnType<typeof getPage>>['data']['page'];
export type CmsPost = Awaited<ReturnType<typeof getPost>>['data']['post'];
export type CmsPoem = Awaited<ReturnType<typeof getPoem>>['data']['poem'];
export type CmsDating = Awaited<ReturnType<typeof getDating>>['data']['dating'];

export type DatingChip = NonNullable<NonNullable<CmsDating['chips']>[number]>;
export type DatingDetail = NonNullable<NonNullable<CmsDating['details']>[number]>;
export type DatingCard = NonNullable<NonNullable<CmsDating['feed']>[number]>;
export type DatingPeople = Extract<DatingCard, { __typename: 'DatingFeedPeople' }>;
export type DatingTestimonial = NonNullable<NonNullable<DatingPeople['items']>[number]>;

export type PageBlock = NonNullable<NonNullable<CmsPage['blocks']>[number]>;
export type HeroBlock = Extract<PageBlock, { __typename: 'PageBlocksHero' }>;
export type AboutBlock = Extract<PageBlock, { __typename: 'PageBlocksAbout' }>;
export type CalloutBlock = Extract<PageBlock, { __typename: 'PageBlocksCallout' }>;
export type FeaturesBlock = Extract<PageBlock, { __typename: 'PageBlocksFeatures' }>;
export type StatsBlock = Extract<PageBlock, { __typename: 'PageBlocksStats' }>;
export type CtaBlock = Extract<PageBlock, { __typename: 'PageBlocksCta' }>;
export type ContentBlock = Extract<PageBlock, { __typename: 'PageBlocksContent' }>;
export type TestimonialBlock = Extract<PageBlock, { __typename: 'PageBlocksTestimonial' }>;
export type VideoBlock = Extract<PageBlock, { __typename: 'PageBlocksVideo' }>;
export type SplitBlock = Extract<PageBlock, { __typename: 'PageBlocksSplit' }>;

export type CmsGlobalNav = NonNullable<NonNullable<NonNullable<CmsGlobal['header']>['nav']>[number]>;
export type CmsGlobalSocial = NonNullable<NonNullable<NonNullable<CmsGlobal['footer']>['social']>[number]>;

export type ImageField = NonNullable<HeroBlock['image']>;
export type FeatureItem = NonNullable<NonNullable<FeaturesBlock['items']>[number]>;
export type StatItem = NonNullable<NonNullable<StatsBlock['stats']>[number]>;
export type TestimonialItem = NonNullable<NonNullable<TestimonialBlock['testimonials']>[number]>;

export type RichText = TinaRichTextContent;
