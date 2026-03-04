import type { Metadata } from 'next';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { getSiteUrl } from '@/lib/feed-config';
import PoemClientPage from './client-page';

export const revalidate = 86400; // 24hr - cache is busted on every deploy anyway

export async function generateMetadata({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join('/');
  try {
    const data = await client.queries.poem({
      relativePath: `${filepath}.json`,
    });
    const poem = data.data.poem;
    const siteUrl = getSiteUrl();
    const canonicalPath = `/poems/${filepath}`;
    const absoluteUrl = `${siteUrl}${canonicalPath}`;
    const description = `"${poem.title}" - a poem by Hark Singh`;
    return {
      title: poem.title,
      description,
      alternates: {
        canonical: absoluteUrl,
      },
      openGraph: {
        title: `${poem.title} | Tales of Hark`,
        description,
        url: absoluteUrl,
        type: 'article',
      },
      twitter: {
        card: 'summary',
        site: '@0xharkirat',
        creator: '@0xharkirat',
        title: poem.title,
        description,
      },
    };
  } catch {
    return { title: 'Poem' };
  }
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join('/');
  const data = await client.queries.poem({
    relativePath: `${filepath}.json`,
  });

  return (
    <Layout rawPageData={data}>
      <PoemClientPage {...data} />
    </Layout>
  );
}

export async function generateStaticParams() {
  let poems = await client.queries.poemConnection();
  const allPoems = poems;

  if (!allPoems.data.poemConnection.edges) {
    return [];
  }

  while (poems.data?.poemConnection.pageInfo.hasNextPage) {
    poems = await client.queries.poemConnection({
      after: poems.data.poemConnection.pageInfo.endCursor,
    });

    if (!poems.data.poemConnection.edges) {
      break;
    }

    allPoems.data.poemConnection.edges.push(...poems.data.poemConnection.edges);
  }

  return (
    allPoems.data?.poemConnection.edges.map((edge) => ({
      urlSegments: edge?.node?._sys.breadcrumbs,
    })) ?? []
  );
}
