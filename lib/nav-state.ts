/** Sections that have a way back to the Hub. */
export const SECTIONS = ['art', 'shop', 'movies', 'blog', 'places']

/**
 * True once the visit has moved between pages inside the site, so `history.back()` stays inside it. Tracked by the
 * floating button (always mounted) and read by the in-nav back button.
 */
export const navState = { inApp: false }

export const sectionParts = (pathname: string) => pathname.split('/').filter(Boolean)

/** Whether the back control applies on this path (a section's pages, but not the blog's admin). */
export const hasBackControl = (pathname: string) => SECTIONS.includes(sectionParts(pathname)[0]) && !pathname.startsWith('/blog/admin')
