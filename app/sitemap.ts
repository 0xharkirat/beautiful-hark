import client from '@/tina/__generated__/client';
import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://harksingh.com';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/posts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/poems`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    // Posts
    const posts = await client.queries.postConnection({ sort: 'date', first: 100 });
    for (const edge of posts.data?.postConnection.edges ?? []) {
      const post = edge?.node;
      if (!post) continue;
      const slug = post._sys.breadcrumbs.join('/');
      entries.push({
        url: `${siteUrl}/posts/${slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    // Poems
    const poems = await client.queries.poemConnection({ sort: 'date', first: 100 });
    for (const edge of poems.data?.poemConnection.edges ?? []) {
      const poem = edge?.node;
      if (!poem) continue;
      const slug = poem._sys.breadcrumbs.join('/');
      entries.push({
        url: `${siteUrl}/poems/${slug}`,
        lastModified: poem.date ? new Date(poem.date) : new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }

    // Pages (excluding home which is already the root entry)
    const pages = await client.queries.pageConnection({ first: 100 });
    for (const edge of pages.data?.pageConnection.edges ?? []) {
      const page = edge?.node;
      if (!page || page._sys.filename === 'home') continue;
      const slug = page._sys.breadcrumbs.join('/');
      entries.push({
        url: `${siteUrl}/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch content:', error);
  }

  return entries;
}
