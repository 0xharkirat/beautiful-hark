import type { FeedOptions } from 'feed';

export function getFeedConfig(): FeedOptions {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://harksingh.com';

  return {
    title: 'Tales of Hark',
    description: 'His Holy Harkness: High Priest of Vibes, Creative Code & Thoughtful Engineering.',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: `${siteUrl}/uploads/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Tales of Hark`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      json: `${siteUrl}/feed.json`,
      atom: `${siteUrl}/atom.xml`,
    },
    author: {
      name: 'Tales of Hark',
      link: siteUrl,
    },
  };
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://harksingh.com';
}
