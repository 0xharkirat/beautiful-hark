import type { Collection } from 'tinacms';

/**
 * The unlisted /dating page.
 *
 * One document, edited at /admin. Everything the page renders comes from it,
 * so adding a testimonial or a prompt is a form edit, not a code change.
 * The page reads the JSON directly at build time (see src/data/dating.ts).
 */

const CHIP_ICONS = [
  'age', 'gender', 'orientation', 'height', 'location',
  'children', 'familyPlans', 'drinking', 'smoking', 'marijuana', 'drugs',
];

const DETAIL_ICONS = ['work', 'school', 'home', 'looking', 'relationship'];

/** Which part of a photo stays in frame once it is cropped to the card. */
const FOCUS = [
  { value: 'center', label: 'Middle' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top left', label: 'Top left' },
  { value: 'top right', label: 'Top right' },
  { value: 'bottom left', label: 'Bottom left' },
  { value: 'bottom right', label: 'Bottom right' },
];

const SHAPE = [
  { value: '4 / 5', label: 'Portrait (default)' },
  { value: '3 / 4', label: 'Taller portrait' },
  { value: '1 / 1', label: 'Square' },
  { value: '3 / 2', label: 'Landscape' },
  { value: '16 / 9', label: 'Wide' },
];

/** Shown as the row title in Tina's list editor, so rows are identifiable. */
const rowLabel = (key: string, fallback: string) => ({
  itemProps: (item: Record<string, string>) => ({ label: item?.[key] || fallback }),
});

export const DatingCollection: Collection = {
  name: 'dating',
  label: 'Dating page',
  path: 'src/content/dating',
  format: 'json',
  ui: {
    // Opens side-by-side visual editing. /dating renders its editable half
    // inside <TinaIsland name="dating">, registered in src/lib/islands.ts, so
    // the form binds and the preview updates as you type.
    router: () => '/dating',
    // One document. Creating or deleting it would break the page.
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: 'string',
      name: 'name',
      label: 'Name',
      isTitle: true,
      required: true,
      description: 'Shown in the header and the browser tab.',
    },
    {
      type: 'string',
      name: 'instagram',
      label: 'Instagram handle',
      required: true,
      description: 'Handle only, no @ and no URL. The button at the bottom opens this account.',
    },
    {
      type: 'string',
      name: 'cta',
      label: 'Button at the bottom',
      description: 'The one way anyone can reply. Keep it warm and short.',
    },
    {
      type: 'object',
      name: 'chips',
      label: 'The basics',
      list: true,
      description: 'The row that scrolls sideways at the top of the info card.',
      ui: rowLabel('text', 'Basic'),
      fields: [
        { type: 'string', name: 'icon', label: 'Icon', options: CHIP_ICONS, required: true },
        { type: 'string', name: 'text', label: 'Text', required: true },
      ],
    },
    {
      type: 'object',
      name: 'details',
      label: 'More about me',
      list: true,
      description: 'The stacked list under the basics.',
      ui: rowLabel('text', 'Detail'),
      fields: [
        { type: 'string', name: 'icon', label: 'Icon', options: DETAIL_ICONS, required: true },
        { type: 'string', name: 'text', label: 'Text', required: true },
        { type: 'string', name: 'note', label: 'Small grey line underneath' },
      ],
    },
    {
      type: 'object',
      name: 'feed',
      label: 'The profile',
      list: true,
      description: 'Cards render top to bottom in this order. Drag to reorder.',
      ui: { visualSelector: true },
      templates: [
        {
          name: 'photo',
          label: 'Photo',
          ui: rowLabel('label', 'Photo'),
          fields: [
            { type: 'string', name: 'label', label: 'Prompt above the photo' },
            {
              type: 'image',
              name: 'src',
              label: 'Photo',
              required: true,
              // @ts-ignore — runtime-supported field
              uploadDir: () => 'dating',
            },
            {
              type: 'string',
              name: 'alt',
              label: 'Describe the photo',
              required: true,
              description: 'Read aloud by screen readers. Say what is in the picture.',
            },
            {
              type: 'string',
              name: 'caption',
              label: 'Hidden caption',
              ui: { component: 'textarea' },
              description: 'Stays hidden until someone taps the badge on the photo.',
            },
            {
              type: 'string',
              name: 'focus',
              label: 'Keep this part in frame',
              options: FOCUS,
              description: 'Photos are cropped to fit the card. Pick where the crop holds. Faces near the top usually want Top.',
            },
            {
              type: 'string',
              name: 'shape',
              label: 'Shape',
              options: SHAPE,
              description: 'How tall or wide the card crops the photo.',
            },
          ],
        },
        {
          name: 'text',
          label: 'Written prompt',
          ui: rowLabel('q', 'Written prompt'),
          fields: [
            { type: 'string', name: 'q', label: 'Prompt', required: true },
            {
              type: 'string',
              name: 'a',
              label: 'Answer',
              required: true,
              ui: { component: 'textarea' },
              description:
                'Line breaks are kept exactly as you type them. Wrap a word in ~~double tildes~~ to strike it out.',
            },
            {
              type: 'boolean',
              name: 'lead',
              label: 'Long answer',
              description: 'Sets it in smaller, paragraph-sized type. Use it when the answer is more than a line or two.',
            },
          ],
        },
        {
          name: 'voice',
          label: 'Voice prompt',
          ui: rowLabel('q', 'Voice prompt'),
          fields: [
            { type: 'string', name: 'q', label: 'Prompt', required: true },
            {
              // Named `audio`, not `src`: Tina unions the feed templates, and a
              // shared field name must agree on nullability across all of them.
              // photo and video both require `src`; this one is optional.
              type: 'image',
              name: 'audio',
              label: 'Audio file',
              description:
                'Optional. Hinge records straight from the mic and gives you no way to export it, so this has to be a fresh recording. Leave it empty and the card shows the words on their own.',
              // @ts-ignore — runtime-supported field
              uploadDir: () => 'dating',
            },
            {
              type: 'string',
              name: 'transcript',
              label: 'Transcript',
              ui: { component: 'textarea' },
              description: 'Shown under the waveform, for anyone who cannot play audio.',
            },
          ],
        },
        {
          name: 'video',
          label: 'Video prompt',
          ui: rowLabel('q', 'Video prompt'),
          fields: [
            { type: 'string', name: 'q', label: 'Prompt', required: true },
            {
              type: 'image',
              name: 'src',
              label: 'Video file',
              required: true,
              // @ts-ignore — runtime-supported field
              uploadDir: () => 'dating',
            },
            {
              type: 'image',
              name: 'poster',
              label: 'Still frame',
              description: 'Shown before the video loads. Keeps the card from flashing black.',
              // @ts-ignore — runtime-supported field
              uploadDir: () => 'dating',
            },
            { type: 'string', name: 'caption', label: 'Text over the video' },
          ],
        },
        {
          name: 'vitals',
          label: 'Info card',
          fields: [
            {
              type: 'string',
              name: 'note',
              label: 'Nothing to fill in',
              description:
                'This card renders "The basics" and "More about me" from the top of this form. Add it once, wherever you want it to appear.',
            },
          ],
        },
        {
          name: 'people',
          label: 'From people close to me',
          ui: rowLabel('heading', 'Testimonials'),
          fields: [
            { type: 'string', name: 'heading', label: 'Heading', required: true },
            {
              type: 'object',
              name: 'items',
              label: 'What they wrote',
              list: true,
              description: 'Each one becomes a card in the sideways scroller.',
              ui: rowLabel('by', 'Friend'),
              fields: [
                { type: 'string', name: 'q', label: 'Question they answered', required: true },
                {
                  type: 'string',
                  name: 'body',
                  label: 'Their answer',
                  required: true,
                  ui: { component: 'textarea' },
                },
                {
                  type: 'string',
                  name: 'by',
                  label: 'Who said it',
                  required: true,
                  description: 'Written as "Name, how you know them". For example "Penny, Friend".',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
