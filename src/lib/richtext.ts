/**
 * Overrides for rich-text rendering: one map, every TinaMarkdown.
 *
 * TinaMarkdown takes a `components` map and dispatches default tags through it
 * before falling back to its own. Nothing passed one, so every body rendered
 * package defaults, and the image default drops captions.
 *
 * Kept here rather than inline at each call site because there are four of them
 * across posts, pages and the About block, and per-site fixes are how three of
 * them end up behaving differently. Add future overrides to this map.
 */
import ImagePair from '../components/richtext/ImagePair.astro';
import MarkdownImage from '../components/richtext/MarkdownImage.astro';
import MarkdownLink from '../components/richtext/MarkdownLink.astro';
import Video from '../components/richtext/Video.astro';

export const richTextComponents = {
  // `a` and `img` override default node types. The capitalised ones are
  // dispatched by name for the MDX element of the same name, each declared as a
  // template on some body's schema.
  a: MarkdownLink,
  img: MarkdownImage,
  Video,
  ImagePair,
  // Same renderer as a markdown image: the Image template's fields are
  // url/alt/caption, which is exactly MarkdownImage's contract.
  Image: MarkdownImage,
};

/*
  Every rich-text template declared in the schema needs an entry above.

  An unregistered element does not fail the build and does not warn in the
  console. TinaMarkdown renders it as a literal red "No component provided for X"
  box in the page, which is how the About page shipped a broken ImagePair to
  production and stayed that way: the template was declared during the Next.js
  era and the migration never ported the component that drew it.

  Still unregistered, and therefore still landmines: BlockQuote and DateTime.
  Both are declared on the post body and neither appears in any content yet, so
  each will print that same red box the first time someone inserts one in Tina.
  They want real designs rather than a hasty alias to something image-shaped,
  which is why they are named here instead of quietly pointed somewhere wrong.
*/
