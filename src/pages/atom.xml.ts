import { listPosts } from '../lib/data';

const SITE_TITLE = 'Tales of Hark';

export async function GET(context: { site: URL | undefined }) {
  const posts = await listPosts();
  const site = (context.site ?? new URL('http://localhost:4321')).toString().replace(/\/$/, '');
  const updated = posts[0]?.date ? new Date(posts[0].date).toISOString() : new Date().toISOString();
  const entries = posts
    .map((p) => {
      const url = `${site}/posts/${p._sys.filename}`;
      const pub = p.date ? new Date(p.date).toISOString() : updated;
      return `  <entry>
    <title>${escape(p.title ?? '')}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <updated>${pub}</updated>
    <published>${pub}</published>
  </entry>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_TITLE}</title>
  <link href="${site}" />
  <link rel="self" href="${site}/atom.xml" type="application/atom+xml" />
  <updated>${updated}</updated>
  <id>${site}/</id>
${entries}
</feed>`;
  return new Response(body, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}

function escape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
