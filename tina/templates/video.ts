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
    {
      name: 'poster',
      label: 'Poster image',
      type: 'string',
      // Worth filling in every time, and not only so there is something to look
      // at while the file downloads. A <video> with no poster and no dimensions
      // has nothing to compute `height: auto` from, so it lays out at the
      // browser's default 150px and then jumps to its real height when metadata
      // arrives - a 252px shove of everything below it on the hawky page. The
      // browser takes its intrinsic size from the poster until then, so one
      // field fixes the blank box and the layout shift together.
      description: 'A path under public/. Also reserves the right space before the video loads.',
    },
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
