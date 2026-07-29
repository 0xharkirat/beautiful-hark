/**
 * The Video embed, shared by every rich-text body that wants one.
 *
 * Extracted from post.ts so pages get the same embed instead of a second copy
 * that drifts. Rendered by src/components/richtext/Video.astro, registered in
 * src/lib/richtext.ts.
 */
import type { Template } from 'tinacms';

export const videoTemplate: Template = {
  name: 'Video',
  label: 'Video',
  fields: [
    { name: 'url', label: 'URL', type: 'string' },
    { name: 'autoPlay', label: 'Auto Play', type: 'boolean' },
    { name: 'loop', label: 'Loop', type: 'boolean' },
    {
      name: 'caption',
      label: 'Caption',
      type: 'string',
      // Markdown, matching image captions, which take theirs from the markdown
      // image title. FigCaption parses both the same way, so a link works here
      // without a second syntax to remember.
      description: 'Supports markdown, so [links](https://example.com) work.',
      ui: { component: 'textarea' },
    },
  ],
};
