import type { Metadata } from 'next';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import PostsClientPage from './client-page';

export const revalidate = 86400; // 24hr - cache is busted on every deploy anyway

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest posts from Tales of Hark — software engineering, creative code, and thoughtful engineering.',
  openGraph: {
    title: 'Blog | Tales of Hark',
    description: 'Read the latest posts from Tales of Hark.',
  },
};

export default async function PostsPage() {
  let posts = await client.queries.postConnection({
    sort: 'date',
    last: 1
  });
  const allPosts = posts;

  if (!allPosts.data.postConnection.edges) {
    return [];
  }

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

  return (
    <Layout rawPageData={allPosts.data}>
      <PostsClientPage {...allPosts} />
    </Layout>
  );
}
