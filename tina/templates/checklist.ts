/**
 * A per-reader checklist over the lists in a page body.
 *
 * No fields: dropping it in is the whole configuration. It upgrades every list
 * item in the same rich-text container, and the ticks live in the reader's own
 * localStorage rather than on a server, so it needs no accounts and stores
 * nothing about anybody.
 */
import type { Template } from 'tinacms';

export const checklistTemplate: Template = {
  name: 'Checklist',
  label: 'Checklist',
  fields: [
    {
      name: 'note',
      label: 'Note',
      type: 'string',
      description:
        'Unused. Tina requires at least one field on a template, and this one has nothing to configure.',
    },
  ],
};
