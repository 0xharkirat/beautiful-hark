import { getFeedConfig, getSiteUrl } from '@/lib/feed-config';
import client from '@/tina/__generated__/client';
import { Feed } from 'feed';

export const revalidate = 86400; // 24hr - cache is busted on every deploy anyway

export async function GET() {
  const siteUrl = getSiteUrl();

  // Initialize the feed
  const feed = new Feed(getFeedConfig());

  try {
    // Fetch all posts from TinaCMS
    let posts = await client.queries.postConnection({
      sort: 'date',
      last: 100, // Adjust based on your needs
    });
    const allPosts = posts;

    if (!allPosts.data.postConnection.edges) {
      return new Response(feed.json1(), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
        },
      });
    }

    // Paginate through all posts if there are more
    while (posts.data?.postConnection.pageInfo.hasPreviousPage) {
      posts = await client.queries.postConnection({
        sort: 'date',
        before: posts.data.postConnection.pageInfo.endCursor,
      });

      if (!posts.data.postConnection.edges) {
        break;
      }

      allPosts.data.postConnection.edges.push(...posts.data.postConnection.edges.reverse());
    }

    // Add each post to the feed
    for (const edge of allPosts.data.postConnection.edges || []) {
      const post = edge?.node;
      if (!post) continue;

      const postUrl = `${siteUrl}/posts/${post._sys.breadcrumbs.join('/')}`;
      const postDate = post.date ? new Date(post.date) : new Date();

      // Extract plain text from excerpt if it's rich-text
      let description = '';
      if (post.excerpt) {
        if (typeof post.excerpt === 'string') {
          description = post.excerpt;
        } else if (typeof post.excerpt === 'object') {
          // Handle TinaMarkdown rich-text format
          description = JSON.stringify(post.excerpt).substring(0, 200);
        }
      }

      feed.addItem({
        title: post.title || 'Untitled',
        id: postUrl,
        link: postUrl,
        description: description || post.title || '',
        content: description || post.title || '',
        date: postDate,
        image: post.heroImg ? `${siteUrl}${post.heroImg}` : undefined,
      });
    }

    return new Response(feed.json1(), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error generating JSON feed:', error);
    return new Response(feed.json1(), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}
