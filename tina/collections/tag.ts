import type { Collection } from 'tinacms';

export const TagCollection: Collection = {
  label: 'Tags',
  name: 'tag',
  path: 'src/content/tags',
  format: 'mdx',
  fields: [
    {
      type: 'string',
      label: 'Name',
      name: 'name',
      isTitle: true,
      required: true,
    },
  ],
};
