export async function GET(context: { site: URL | undefined }) {
  const site = (context.site ?? new URL('http://localhost:4321')).toString().replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${site}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
