import type { Collection } from 'tinacms';
import { videoTemplate } from '../templates/video';

export const PostCollection: Collection = {
  label: 'Blog Posts',
  name: 'post',
  path: 'src/content/posts',
  format: 'mdx',
  ui: {
    router: ({ document }) => `/posts/${document._sys.filename}`,
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      name: 'heroImg',
      label: 'Hero Image',
      // @ts-ignore
      uploadDir: () => 'posts',
    },
    {
      type: 'string',
      name: 'heroImgWidth',
      label: 'Hero Image Width',
      description: 'Max width of hero image. Default: full.',
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Large', value: 'lg' },
        { label: 'Medium', value: 'md' },
        { label: 'Small', value: 'sm' },
      ],
    },
    {
      type: 'rich-text',
      label: 'Excerpt',
      name: 'excerpt',
      overrides: { toolbar: ['bold', 'italic', 'link'] },
    },
    {
      type: 'reference',
      label: 'Author',
      name: 'author',
      collections: ['author'],
    },
    {
      type: 'datetime',
      label: 'Posted Date',
      name: 'date',
      ui: { dateFormat: 'MMMM DD YYYY', timeFormat: 'hh:mm A' },
    },
    {
      type: 'datetime',
      label: 'Last Updated',
      name: 'updatedAt',
      ui: { dateFormat: 'MMMM DD YYYY', timeFormat: 'hh:mm A' },
    },
    {
      type: 'object',
      label: 'Tags',
      name: 'tags',
      list: true,
      fields: [
        {
          type: 'reference',
          label: 'Tag',
          name: 'tag',
          collections: ['tag'],
        },
      ],
      ui: {
        itemProps: (item) => ({ label: item?.tag ?? 'Tag' }),
      },
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
      templates: [
        {
          name: 'BlockQuote',
          label: 'Block Quote',
          fields: [
            {
              name: 'children',
              label: 'Quote',
              type: 'rich-text',
              overrides: { toolbar: ['bold', 'italic', 'link'] },
            },
            { name: 'authorName', label: 'Author', type: 'string' },
          ],
        },
        {
          name: 'DateTime',
          label: 'Date & Time',
          inline: true,
          fields: [
            {
              name: 'format',
              label: 'Format',
              type: 'string',
              options: ['utc', 'iso', 'local'],
            },
          ],
        },
        videoTemplate,
      ],
    },
  ],
};
