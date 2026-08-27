import { defineConfig } from 'tinacms';
import { PoemCollection } from './collections/poem';
import { PostCollection } from './collections/post';
import { PageCollection } from './collections/page';
import { TagCollection } from './collections/tag';
import { AuthorCollection } from './collections/author';
import { GlobalCollection } from './collections/global';
import { DatingCollection } from './collections/dating';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      PostCollection,
      PoemCollection,
      PageCollection,
      AuthorCollection,
      TagCollection,
      GlobalCollection,
      DatingCollection,
    ],
  },
});
