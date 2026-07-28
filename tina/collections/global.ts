import type { Collection } from 'tinacms';

export const GlobalCollection: Collection = {
  label: 'Global',
  name: 'global',
  path: 'src/content/global',
  format: 'json',
  ui: { global: true },
  fields: [
    {
      type: 'object',
      label: 'Header',
      name: 'header',
      fields: [
        { type: 'image', label: 'Logo', name: 'logo' },
        { type: 'string', label: 'Name', name: 'name' },
        {
          type: 'object',
          label: 'Nav Links',
          name: 'nav',
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label ?? 'Link' }) },
          fields: [
            { type: 'string', label: 'Label', name: 'label' },
            { type: 'string', label: 'Href', name: 'href' },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Footer',
      name: 'footer',
      fields: [
        {
          type: 'object',
          label: 'Columns',
          name: 'columns',
          list: true,
          ui: { itemProps: (item) => ({ label: item?.heading ?? 'Column' }) },
          fields: [
            { type: 'string', label: 'Heading', name: 'heading' },
            {
              type: 'object',
              label: 'Links',
              name: 'links',
              list: true,
              ui: { itemProps: (item) => ({ label: item?.label ?? 'Link' }) },
              fields: [
                { type: 'string', label: 'Label', name: 'label' },
                { type: 'string', label: 'Href', name: 'href' },
              ],
            },
          ],
        },
        {
          type: 'object',
          label: 'Social Links',
          name: 'social',
          list: true,
          ui: { itemProps: (item) => ({ label: item?.url ?? 'Link' }) },
          fields: [
            {
              type: 'object',
              label: 'Icon',
              name: 'icon',
              fields: [{ type: 'string', label: 'Name', name: 'name' }],
            },
            { type: 'string', label: 'URL', name: 'url' },
          ],
        },
        {
          type: 'object',
          label: 'Tagline (Memento Homo)',
          name: 'tagline',
          fields: [
            { type: 'string', label: 'Link Label', name: 'label' },
            { type: 'string', label: 'Link URL', name: 'url' },
            { type: 'string', label: 'Suffix Text', name: 'suffix' },
          ],
        },
        {
          type: 'object',
          label: 'Colophon (Built with…)',
          name: 'colophon',
          fields: [
            { type: 'string', label: 'Prefix Text', name: 'prefix' },
            { type: 'string', label: 'Link Label', name: 'label' },
            { type: 'string', label: 'Link URL', name: 'url' },
          ],
        },
      ],
    },
  ],
};
