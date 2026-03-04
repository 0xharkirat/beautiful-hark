import type { Metadata } from 'next';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { getSiteUrl } from '@/lib/feed-config';
import { richTextToPlainText } from '@/lib/rich-text-utils';
import PostClientPage from './client-page';

export const revalidate = 86400; // 24hr - cache is busted on every deploy anyway

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
    const siteUrl = getSiteUrl();
    const canonicalPath = `/posts/${filepath}`;
    const absoluteUrl = `${siteUrl}${canonicalPath}`;
    const description = post.excerpt ? richTextToPlainText(post.excerpt) : `Read "${post.title}" on Tales of Hark`;
    const heroImgAbsolute = post.heroImg ? `${siteUrl}${post.heroImg}` : undefined;
    return {
      title: post.title,
      description,
      alternates: {
        canonical: absoluteUrl,
      },
      openGraph: {
        title: post.title,
        description,
        url: absoluteUrl,
        ...(heroImgAbsolute && {
          images: [{ url: heroImgAbsolute, alt: post.title }],
        }),
        type: 'article',
      },
      twitter: {
        card: post.heroImg ? 'summary_large_image' : 'summary',
        site: '@0xharkirat',
        creator: '@0xharkirat',
        title: post.title,
        description,
        ...(heroImgAbsolute && { images: [heroImgAbsolute] }),
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
