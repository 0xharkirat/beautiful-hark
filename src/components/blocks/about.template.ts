import type { Template } from 'tinacms';

export const aboutBlockSchema: Template = {
  name: 'about',
  label: 'About Page',
  fields: [
    { type: 'string', label: 'Title', name: 'title' },
    { type: 'rich-text', label: 'Subtitle', name: 'subtitle' },
    { type: 'image', label: 'Profile Image', name: 'profileImage' },
    { type: 'string', label: 'Image Caption', name: 'imageCaption' },
    { type: 'rich-text', label: 'Summary', name: 'summary' },
    {
      type: 'object',
      label: 'Sections',
      name: 'sections',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.title ?? 'Section' }),
      },
      fields: [
        { type: 'string', label: 'Section Title', name: 'title' },
        {
          type: 'rich-text',
          label: 'Content',
          name: 'content',
          templates: [
            {
              name: 'Image',
              label: 'Image',
              fields: [
                { name: 'url', label: 'URL', type: 'image' },
                { name: 'alt', label: 'Alt Text', type: 'string' },
                { name: 'caption', label: 'Caption', type: 'string' },
              ],
            },
            {
              name: 'ImagePair',
              label: 'Image Pair',
              fields: [
                { name: 'leftUrl', label: 'Left Image', type: 'image' },
                { name: 'leftAlt', label: 'Left Alt', type: 'string' },
                { name: 'leftCaption', label: 'Left Caption', type: 'string' },
                { name: 'rightUrl', label: 'Right Image', type: 'image' },
                { name: 'rightAlt', label: 'Right Alt', type: 'string' },
                { name: 'rightCaption', label: 'Right Caption', type: 'string' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'object',
      label: 'Gallery',
      name: 'gallery',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.caption ?? 'Image' }),
      },
      fields: [
        { type: 'image', label: 'URL', name: 'url' },
        { type: 'string', label: 'Alt', name: 'alt' },
        { type: 'string', label: 'Caption', name: 'caption' },
      ],
    },
  ],
};
