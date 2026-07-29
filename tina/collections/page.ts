import type { Collection } from 'tinacms';
import { heroBlockSchema } from '../../src/components/blocks/hero.template';
import { aboutBlockSchema } from '../../src/components/blocks/about.template';
import { videoTemplate } from '../templates/video';
import { figureTemplate } from '../templates/figure';

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
      name: 'description',
      label: 'Search and social description',
      type: 'string',
      ui: { component: 'textarea' },
    },
    {
      type: 'object',
      list: true,
      name: 'blocks',
      label: 'Sections',
      ui: { visualSelector: true },
      templates: [heroBlockSchema, aboutBlockSchema],
    },
    // A page is either assembled from blocks or written as prose, and this is
    // the prose half. Home and About are block pages, built out of a visual
    // selector because they are layout. A page that is only writing does not
    // want a block editor between the author and the words, so it gets the same
    // rich-text body a post has.
    //
    // Both fields exist on every page rather than being split into two
    // collections, because the routing, the Tina router and [...slug].astro are
    // identical either way, and a second collection would duplicate all three
    // to gain nothing. Fill in whichever half the page needs.
    {
      name: 'body',
      label: 'Body',
      type: 'rich-text',
      isBody: true,
      // Same embeds a post body gets, so a page is not a second-class place to
      // write. Shared from tina/templates rather than copied.
      templates: [videoTemplate, figureTemplate],
    },
  ],
};
