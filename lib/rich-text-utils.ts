/**
 * Extracts plain text from a TinaCMS rich-text (Slate AST) value.
 * The rich-text field is stored as a JSON object with a `children` array.
 * Each child node may itself have `children` (paragraphs, headings, etc.)
 * or a `text` property (leaf text nodes).
 *
 * `any` is intentional: the rich-text field is typed as Scalar JSON
 * in the TinaCMS GraphQL schema so no generated type is available.
 */
function extractText(node: any): string {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join(' ');
  }
  return '';
}

export function richTextToPlainText(richText: any): string {
  if (!richText) return '';
  if (typeof richText === 'string') return richText;

  const raw = Array.isArray(richText.children) ? richText.children.map(extractText).join(' ') : extractText(richText);

  // Collapse extra whitespace and trim
  return raw.replace(/\s+/g, ' ').trim();
}
