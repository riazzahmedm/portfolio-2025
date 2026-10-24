/**
 * Canonical site URL, used for metadata, sitemap and robots.
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://riazahmed.com) when a custom domain is live;
 * otherwise the Vercel alias from vercel.json is used.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://riazz-portfolio.vercel.app').replace(/\/$/, '')

export const SITE_NAME = 'Riaz Ahmed'

export const SITE_DESCRIPTION =
  'Building immersive digital products with React, Next.js & React Native. 5+ years · 40+ projects · Chennai, India.'
