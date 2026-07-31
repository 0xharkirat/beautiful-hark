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
import Checklist from '../components/richtext/Checklist.astro';
import ImagePair from '../components/richtext/ImagePair.astro';
import MarkdownImage from '../components/richtext/MarkdownImage.astro';
import MarkdownLink from '../components/richtext/MarkdownLink.astro';
import Table from '../components/richtext/Table.astro';
import Video from '../components/richtext/Video.astro';

export const richTextComponents = {
  // `a` and `img` override default node types. The capitalised ones are
  // dispatched by name for the MDX element of the same name, each declared as a
  // template on some body's schema.
  a: MarkdownLink,
  img: MarkdownImage,
  Video,
  ImagePair,
  Checklist,
  // Same renderer as a markdown image: the Image template's fields are
  // url/alt/caption, which is exactly MarkdownImage's contract.
  Image: MarkdownImage,
  // Not a schema template. withTables below rewrites parsed table nodes into an
  // mdx element with this name, because that is the only dispatch path the
  // package offers for a node type it does not know.
  Table,
};

/**
 * Rewrites parsed `table` nodes into mdx elements named `Table`.
 *
 * Markdown tables were being dropped silently, and had been since the site
 * moved to Astro. Tina's parser handles them fine and emits `table` > `tr` >
 * `td` > `p`, but @tinacms/astro's Node.astro has no branch for those types:
 * it reads `components[node.type]` into an `Override` and then only uses that
 * for `hr`, `break` and `html`. Every other unrecognised type hits the final
 * `: null`. So the rows parsed correctly and then rendered to nothing, with no
 * error and no red "No component provided" box to notice.
 *
 * The published git-worktrees post has six table rows in its source and has
 * been serving none of them.
 *
 * Registering `table` on the map does not help, because the dispatcher never
 * consults the map for that type. Rewriting to an mdx element does, because
 * MdxNode dispatches on `node.name` and spreads `node.props`.
 *
 * Returns new objects rather than mutating. The AST comes from the page's data
 * and Tina's editor re-renders from the same object, so mutating it would make
 * the transform run against its own output on the second pass.
 */
export const withTables = (content: any): any => {
  if (Array.isArray(content)) return content.map(withTables);
  if (!content || typeof content !== 'object') return content;
  if (content.type === 'table') {
    return {
      type: 'mdxJsxFlowElement',
      name: 'Table',
      props: { rows: content.children ?? [] },
    };
  }
  if (!Array.isArray(content.children)) return content;
  return { ...content, children: content.children.map(withTables) };
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
