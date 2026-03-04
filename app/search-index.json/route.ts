import client from '@/tina/__generated__/client';

export const revalidate = 86400; // 24hr - cache is busted on every deploy anyway

export interface SearchIndexEntry {
  title: string;
  slug: string;
  url: string;
  excerpt: string;
  tags: string[];
  date: string;
  heroImg: string | null;
}

/**
 * Extracts a plain-text string from TinaCMS rich-text excerpt nodes.
 * Walks the AST and concatenates all `text` leaf values.
 */
function extractPlainText(richText: unknown): string {
  if (!richText || typeof richText !== 'object') return '';
  const node = richText as Record<string, unknown>;

  // Leaf text node
  if (typeof node.text === 'string') return node.text;

  // Recurse into children
  if (Array.isArray(node.children)) {
    return (node.children as unknown[]).map(extractPlainText).join(' ');
  }

  return '';
}

export async function GET() {
  try {
    let posts = await client.queries.postConnection({ sort: 'date', first: 100 });
    const allEdges = [...(posts.data?.postConnection.edges ?? [])];

    while (posts.data?.postConnection.pageInfo.hasNextPage) {
      posts = await client.queries.postConnection({
        sort: 'date',
        first: 100,
        after: posts.data.postConnection.pageInfo.endCursor,
      });
      allEdges.push(...(posts.data?.postConnection.edges ?? []));
    }

    const index: SearchIndexEntry[] = allEdges
      .map((edge) => {
        const post = edge?.node;
        if (!post) return null;

        const slug = post._sys.breadcrumbs.join('/');
        const excerptText = extractPlainText(post.excerpt);

        return {
          title: post.title ?? '',
          slug,
          url: `/posts/${slug}`,
          excerpt: excerptText.trim(),
          tags: (post.tags ?? []).map((t) => t?.tag?.name ?? '').filter(Boolean),
          date: post.date ?? '',
          heroImg: post.heroImg ?? null,
        } satisfies SearchIndexEntry;
      })
      .filter((entry): entry is SearchIndexEntry => entry !== null);

    return Response.json(index, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[search-index] Failed to build search index:', error);
    return Response.json([], { status: 500 });
  }
}
