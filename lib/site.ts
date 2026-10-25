/**
 * Canonical site URL, used for metadata, sitemap and robots. In order of preference:
 *  1. NEXT_PUBLIC_SITE_URL, an explicit override
 *  2. Vercel's production domain (the shortest one on the project), so adding a custom domain later needs no code change
 *  3. the default below, for local development
 */
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? vercelDomain ?? 'https://riazz.vercel.app').replace(/\/$/, '')

export const SITE_NAME = 'Riaz Ahmed'

export const SITE_DESCRIPTION =
  'Building immersive digital products with React, Next.js & React Native. 5+ years · 40+ projects · Chennai, India.'
