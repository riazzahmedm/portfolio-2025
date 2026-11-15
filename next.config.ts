import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  // The dev server is opened inside a cross-origin preview frame. Without these the browser gets a 403 for every
  // /_next/* dev resource, no JavaScript loads, and the page stays on the intro loader forever. Development only.
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '0.0.0.0',
    ...(process.env.NEXT_DEV_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) ?? []),
  ],
  async redirects() {
    // Likely mistyped or legacy URLs go to the real section instead of a 404
    return [
      { source: '/blogs',         destination: '/blog',   permanent: false },
      { source: '/blogs/:slug',   destination: '/blog/:slug', permanent: false },
      { source: '/portfolio',     destination: '/',       permanent: false },
      { source: '/watched',       destination: '/movies', permanent: false },
      { source: '/watchlog',      destination: '/movies', permanent: false },
      { source: '/watchlist',     destination: '/movies', permanent: false },
    ]
  },
  async rewrites() {
    // The Everest Base Camp flythrough is a standalone page in /public
    return [{ source: '/flythrough/ebc', destination: '/flythrough/ebc.html' }]
  },
  async headers() {
    // In development the app is embedded in a cross-origin preview frame, so SAMEORIGIN would render it blank.
    // Production keeps the full set.
    const headers = process.env.NODE_ENV === 'production'
      ? securityHeaders
      : securityHeaders.filter(h => h.key !== 'X-Frame-Options')
    return [{ source: '/:path*', headers }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
