import React from 'react';
import type { Metadata } from 'next';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import PostClientPage from './client-page';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join('/');
  try {
    const data = await client.queries.post({
      relativePath: `${filepath}.mdx`,
    });
    const post = data.data.post;
    return {
      title: post.title,
      description: post.excerpt || `Read "${post.title}" on Tales of Hark`,
      openGraph: {
        title: post.title,
        description: post.excerpt || `Read "${post.title}" on Tales of Hark`,
        ...(post.heroImg && {
          images: [{ url: post.heroImg, alt: post.title }],
        }),
        type: 'article',
      },
      twitter: {
        card: post.heroImg ? 'summary_large_image' : 'summary',
        title: post.title,
        description: post.excerpt || `Read "${post.title}" on Tales of Hark`,
        ...(post.heroImg && { images: [post.heroImg] }),
      },
    };
  } catch {
    return { title: 'Post' };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join('/');
  const data = await client.queries.post({
    relativePath: `${filepath}.mdx`,
  });

  return (
    <Layout rawPageData={data}>
      <PostClientPage {...data} />
    </Layout>
  );
}

export async function generateStaticParams() {
  let posts = await client.queries.postConnection();
  const allPosts = posts;

  if (!allPosts.data.postConnection.edges) {
    return [];
  }

  while (posts.data?.postConnection.pageInfo.hasNextPage) {
    posts = await client.queries.postConnection({
      after: posts.data.postConnection.pageInfo.endCursor,
    });

    if (!posts.data.postConnection.edges) {
      break;
    }

    allPosts.data.postConnection.edges.push(...posts.data.postConnection.edges);
  }

  const params =
    allPosts.data?.postConnection.edges.map((edge) => ({
      urlSegments: edge?.node?._sys.breadcrumbs,
    })) || [];

  return params;
}
