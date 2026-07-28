import type { Collection } from 'tinacms';
import { heroBlockSchema } from '../../src/components/blocks/hero.template';
import { aboutBlockSchema } from '../../src/components/blocks/about.template';

export const PageCollection: Collection = {
  name: 'page',
  label: 'Pages',
  path: 'src/content/pages',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const filename = document._sys.filename;
      return filename === 'home' ? '/' : `/${filename}`;
    },
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
      isTitle: true,
      required: true,
    },
    {
      type: 'object',
      list: true,
      name: 'blocks',
      label: 'Sections',
      ui: { visualSelector: true },
      templates: [heroBlockSchema, aboutBlockSchema],
    },
  ],
};
