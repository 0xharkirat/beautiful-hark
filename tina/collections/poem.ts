import type { Collection } from 'tinacms';

export const PoemCollection: Collection = {
  label: 'Poems',
  name: 'poem',
  path: 'src/content/poems',
  format: 'json',
  ui: {
    router: ({ document }) => `/poems/${document._sys.filename}`,
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
      type: 'datetime',
      label: 'Date Written',
      name: 'date',
      ui: { dateFormat: 'MMMM DD YYYY' },
    },
    {
      type: 'string',
      label: 'Language',
      name: 'language',
      options: ['English', 'Punjabi'],
      ui: { defaultValue: 'English' },
    },
    {
      type: 'rich-text',
      label: 'About this poem (optional)',
      name: 'description',
      overrides: { toolbar: ['bold', 'italic', 'link'] },
    },
    {
      type: 'object',
      label: 'Lines',
      name: 'lines',
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.text
            ? `${item.text.slice(0, 40)}${item.text.length > 40 ? '...' : ''}`
            : 'Line',
        }),
      },
      fields: [
        {
          type: 'string',
          label: 'Line',
          name: 'text',
          required: true,
          ui: { component: 'textarea' },
        },
        {
          type: 'string',
          label: 'English Translation (optional)',
          name: 'translation',
          ui: { component: 'textarea' },
        },
      ],
    },
  ],
};
