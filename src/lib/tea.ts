/**
 * Facts about /tea that both the page and the island registry need.
 *
 * They live here because the editable region is rendered twice from two
 * different places: once by src/pages/tea.astro on the server, and again by
 * /tina-island/tea when the CMS bridge refetches it mid-edit. The registry has
 * no page to read them off, so a constant in tea.astro would be invisible to
 * half the renders.
 */

/** cal.com handle. Every booking link on the page is built from this. */
export const CAL_USER = 'talesofhark';

/**
 * The event slugs the page will build a calendar for.
 *
 * Kept out of the CMS on purpose: each one has to match an event URL on
 * cal.com character for character, and a typo produces a booking panel that
 * 404s with nothing on the page to say why. Tina offers these as a fixed
 * choice (see tina/collections/tea.ts) and anything else is dropped.
 */
export const TEA_SLUGS = [
  'weekday-tea-coffee',
  'saturday-tea-coffee',
  'virtual-tea-coffee',
] as const;
