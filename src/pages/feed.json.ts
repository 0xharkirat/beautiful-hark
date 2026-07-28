import { listPosts } from '../lib/data';

export async function GET(context: { site: URL | undefined }) {
  const posts = await listPosts();
  const site = (context.site ?? new URL('http://localhost:4321')).toString().replace(/\/$/, '');

  return new Response(
    JSON.stringify({
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Tales of Hark',
      home_page_url: site,
      feed_url: `${site}/feed.json`,
      items: posts.map((p) => ({
        id: `${site}/posts/${p._sys.filename}`,
        url: `${site}/posts/${p._sys.filename}`,
        title: p.title ?? '',
        date_published: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
      })),
    }),
    { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } },
  );
}
