/**
 * Overrides for rich-text rendering — one map, every TinaMarkdown.
 *
 * TinaMarkdown takes a `components` map and dispatches default tags through it
 * before falling back to its own. Nothing passed one, so every body rendered
 * package defaults, and the image default drops captions.
 *
 * Kept here rather than inline at each call site because there are four of them
 * across posts, pages and the About block, and per-site fixes are how three of
 * them end up behaving differently. Add future overrides to this map.
 */
import MarkdownImage from '../components/richtext/MarkdownImage.astro';
import MarkdownLink from '../components/richtext/MarkdownLink.astro';
import Video from '../components/richtext/Video.astro';

export const richTextComponents = {
  // `a` and `img` override default node types. `Video` is dispatched by name
  // for the MDX element of the same name, declared as a template on the body's
  // schema.
  a: MarkdownLink,
  img: MarkdownImage,
  // Same renderer as `img`. Only the source of the path differs: see
  // tina/templates/figure.ts for why a build asset cannot use `img`.
  Figure: MarkdownImage,
  Video,
};
