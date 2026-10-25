import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
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
