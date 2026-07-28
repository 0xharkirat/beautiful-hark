import rss from '@astrojs/rss';
import { listPosts } from '../lib/data';

const SITE_TITLE = 'Tales of Hark';
const SITE_DESC = 'Essays, engineering notes, and small dispatches.';

export async function GET(context: { site: URL | undefined }) {
  const posts = await listPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESC,
    site: context.site ?? 'http://localhost:4321',
    items: posts.map((p) => ({
      title: p.title ?? '',
      link: `/posts/${p._sys.filename}`,
      pubDate: p.date ? new Date(p.date) : new Date(),
      description: '',
    })),
  });
}
