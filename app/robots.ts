import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://harksingh.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/search-index.json'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Bytespider', 'PetalBot', 'Amazonbot', 'FacebookBot'],
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
