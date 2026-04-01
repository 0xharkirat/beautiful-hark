import client from '@/tina/__generated__/client';

export const revalidate = 86400; // 24hr - cache is busted on every deploy anyway

export interface SearchIndexEntry {
  type: 'post' | 'poem';
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
    // ── Posts ──────────────────────────────────────────────────────────────
    let posts = await client.queries.postConnection({ sort: 'date', first: 100 });
    const allPostEdges = [...(posts.data?.postConnection.edges ?? [])];

    while (posts.data?.postConnection.pageInfo.hasNextPage) {
      posts = await client.queries.postConnection({
        sort: 'date',
        first: 100,
        after: posts.data.postConnection.pageInfo.endCursor,
      });
      allPostEdges.push(...(posts.data?.postConnection.edges ?? []));
    }

    const postEntries = allPostEdges
      .map((edge) => {
        const post = edge?.node;
        if (!post) return null;

        const slug = post._sys.breadcrumbs.join('/');
        const excerptText = extractPlainText(post.excerpt);

        return {
          type: 'post' as const,
          title: post.title ?? '',
          slug,
          url: `/posts/${slug}`,
          excerpt: excerptText.trim(),
          tags: (post.tags ?? []).map((t) => t?.tag?.name ?? '').filter(Boolean),
          date: post.date ?? '',
          heroImg: post.heroImg ?? null,
        } satisfies SearchIndexEntry;
      })
      .filter((entry) => entry !== null);

    // ── Poems ──────────────────────────────────────────────────────────────
    let poems = await client.queries.poemConnection({ sort: 'date', first: 100 });
    const allPoemEdges = [...(poems.data?.poemConnection.edges ?? [])];

    while (poems.data?.poemConnection.pageInfo.hasNextPage) {
      poems = await client.queries.poemConnection({
        sort: 'date',
        first: 100,
        after: poems.data.poemConnection.pageInfo.endCursor,
      });
      allPoemEdges.push(...(poems.data?.poemConnection.edges ?? []));
    }

    const poemEntries = allPoemEdges
      .map((edge) => {
        const poem = edge?.node;
        if (!poem) return null;

        const slug = poem._sys.breadcrumbs.join('/');

        // Build excerpt from English translations only so that searching
        // English words matches Punjabi poems via their translation lines.
        const excerpt = (poem.lines ?? [])
          .map((line) => line?.translation?.trim() ?? '')
          .filter(Boolean)
          .join(' ');

        return {
          type: 'poem' as const,
          title: poem.title ?? '',
          slug,
          url: `/poems/${slug}`,
          excerpt,
          tags: [],
          date: poem.date ?? '',
          heroImg: null,
        } satisfies SearchIndexEntry;
      })
      .filter((entry) => entry !== null);

    const index: SearchIndexEntry[] = [...postEntries, ...poemEntries];

    return Response.json(index, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[search-index] Failed to build search index:', error);
    return Response.json([], { status: 500 });
  }
}
