/**
 * Is this href leaving the site?
 *
 * One function so the rich-text renderer and the hand-written anchors cannot
 * disagree. They already did: every hardcoded link in the footer opened in a
 * new tab, and every link written inside body text opened in the same one,
 * because the two were decided in different files.
 */

/**
 * Compared against `Astro.site` rather than a hardcoded domain, because `site`
 * is the localhost fallback in dev and the Vercel URL in CI. A link to
 * harksingh.com is internal in production and would otherwise be treated as
 * external when built locally.
 *
 * Anything that is not an absolute http(s) URL is internal: relative paths,
 * anchors, `mailto:` and `tel:` all stay in place. mailto and tel in particular
 * must never get target="_blank" - it opens a blank tab that never navigates.
 */
export function isExternal(href: string | null | undefined, site?: URL | string | null): boolean {
  if (!href) return false;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const target = new URL(href);
    if (!site) return true;
    const self = new URL(String(site));
    // www is the same site to a reader, so it is not an external link.
    const bare = (h: string) => h.replace(/^www\./i, '').toLowerCase();
    return bare(target.host) !== bare(self.host);
  } catch {
    return false;
  }
}
