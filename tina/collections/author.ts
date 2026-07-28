import type { Collection } from 'tinacms';

export const AuthorCollection: Collection = {
  label: 'Authors',
  name: 'author',
  path: 'src/content/authors',
  format: 'md',
  fields: [
    {
      type: 'string',
      label: 'Name',
      name: 'name',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      label: 'Avatar',
      name: 'avatar',
      // @ts-ignore — runtime-supported field
      uploadDir: () => 'authors',
    },
    {
      type: 'string',
      label: 'Bio',
      name: 'bio',
      description: 'One-line tagline shown under the author name on each post.',
    },
  ],
};
