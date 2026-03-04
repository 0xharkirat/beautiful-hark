import type { Metadata } from 'next';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import PoemsClientPage from './client-page';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Poems',
  description: 'Poems by Hark Singh, written in English and Punjabi, with translations.',
  openGraph: {
    title: 'Poems | Tales of Hark',
    description: 'Poems by Hark Singh, written in English and Punjabi, with translations.',
  },
};

export default async function PoemsPage() {
  let poems = await client.queries.poemConnection({
    sort: 'date',
    last: 1,
  });
  const allPoems = poems;

  if (!allPoems.data.poemConnection.edges) {
    return [];
  }

  while (poems.data?.poemConnection.pageInfo.hasPreviousPage) {
    poems = await client.queries.poemConnection({
      sort: 'date',
      before: poems.data.poemConnection.pageInfo.endCursor,
    });

    if (!poems.data.poemConnection.edges) {
      break;
    }

    allPoems.data.poemConnection.edges.push(...poems.data.poemConnection.edges.reverse());
  }

  return (
    <Layout rawPageData={allPoems.data}>
      <PoemsClientPage {...allPoems} />
    </Layout>
  );
}
