import type { Collection } from 'tinacms';

/**
 * The /tea page.
 *
 * One document, edited at /admin. Every word the page says comes from here, so
 * swapping a cafe or rewriting the invitation is a form edit rather than a
 * deploy.
 *
 * What is deliberately not editable here is the cal.com event slug. It has to
 * match the event's URL on cal.com character for character, and a free text box
 * is one typo away from a booking panel that 404s with nothing on the page to
 * say why. It is a fixed choice below instead, and src/pages/tea.astro ignores
 * any value that is not one of them.
 */

/**
 * Must stay in step with SLUGS in src/pages/tea.astro, and with the event URLs
 * on cal.com. Three places, because the middle one is the only one that can
 * refuse a bad value at the point somebody types it.
 */
const SLUGS = [
  { value: 'weekday-tea-coffee', label: 'Weekday  (cal.com/talesofhark/weekday-tea-coffee)' },
  { value: 'saturday-tea-coffee', label: 'Saturday  (cal.com/talesofhark/saturday-tea-coffee)' },
  { value: 'virtual-tea-coffee', label: 'Virtual  (cal.com/talesofhark/virtual-tea-coffee)' },
];

export const TeaCollection: Collection = {
  name: 'tea',
  label: 'Tea page',
  path: 'src/content/tea',
  format: 'json',
  ui: {
    // Opens side-by-side visual editing. /tea renders its editable half inside
    // <TinaIsland name="tea">, registered in src/lib/islands.ts.
    router: () => '/tea',
    // One document. Creating or deleting it would break the page.
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Heading',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'quote',
      label: 'Quote',
      ui: { component: 'textarea' },
      description: 'The line at the top. Quotation marks are drawn by the page, so leave them out.',
    },
    {
      type: 'string',
      name: 'quoteSource',
      label: 'Who said it',
      description: 'e.g. Uncle Iroh',
    },
    {
      type: 'string',
      name: 'quoteWork',
      label: 'What it is from',
      description: 'The linked words after the name, e.g. Avatar: The Last Airbender',
    },
    {
      type: 'string',
      name: 'quoteUrl',
      label: 'Link to the clip',
    },
    {
      type: 'rich-text',
      name: 'intro',
      label: 'Intro',
      description: 'The paragraphs under the quote. Links work here.',
    },
    {
      type: 'object',
      name: 'teas',
      label: 'The teas',
      list: true,
      description: 'Shown top to bottom in this order. Drag to reorder.',
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.name || 'Tea' }) },
      fields: [
        {
          type: 'string',
          name: 'slug',
          label: 'Which cal.com event',
          options: SLUGS,
          required: true,
          description: 'Picks the calendar this opens. Set the real times and cafes on cal.com.',
        },
        { type: 'string', name: 'name', label: 'Name', required: true },
        {
          type: 'string',
          name: 'where',
          label: 'Where and when',
          ui: { component: 'textarea' },
          description: 'The grey line underneath. Naming the cafes here is just words; cal.com decides what a booker can actually choose.',
        },
        {
          type: 'string',
          name: 'length',
          label: 'Length',
          description: 'The small label on the right, e.g. 30m. Cosmetic. The real duration is set on cal.com.',
        },
      ],
    },
    {
      type: 'string',
      name: 'faq',
      label: 'Small print',
      list: true,
      description: 'One line each, at the bottom of the page.',
    },
  ],
};
