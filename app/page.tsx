import { LatestPosts } from '@/components/home/latest-posts';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import React from 'react';
import ClientPage from './[...urlSegments]/client-page';

export const revalidate = 300;

export default async function Home() {
  const data = await client.queries.page({
    relativePath: `home.mdx`,
  });
  const latestPosts = await client.queries.postConnection({
    sort: 'date',
    last: 3,
  });

  return (
    <Layout rawPageData={data}>
      <ClientPage {...data} />
      <LatestPosts posts={latestPosts.data.postConnection.edges} />
    </Layout>
  );
}
