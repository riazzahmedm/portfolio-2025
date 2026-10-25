import type { Metadata } from 'next'
import { Oswald, Space_Grotesk, Space_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import CustomCursor from '@/components/ui/CustomCursor'
import PullToRefresh from '@/components/ui/PullToRefresh'
import { Toaster } from 'sonner'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--ff-serif',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--ff-display',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--ff-body',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--ff-mono',
  display: 'swap',
})

const TITLE = `${SITE_NAME} — Senior Software Engineer`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:       TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors:     [{ name: SITE_NAME, url: SITE_URL }],
  creator:     SITE_NAME,
  keywords:    ['Riaz Ahmed', 'senior software engineer', 'React', 'Next.js', 'React Native', 'Chennai'],
  verification: { google: 'ZtSCsUokD1uugZl8YRbwnqPH9xrGmL6Uwvq4fv5_xgc' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title:       TITLE,
    description: SITE_DESCRIPTION,
    url:         SITE_URL,
    siteName:    SITE_NAME,
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       TITLE,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${playfair.variable}`}>
      <body style={{ background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
        <ThemeProvider>
          <CustomCursor />
          <PullToRefresh />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background:  '#1a1a1a',
                border:      '1px solid rgba(184,160,255,0.2)',
                color:       '#fff',
                fontFamily:  'var(--ff-body)',
                fontSize:    '14px',
                borderRadius:'12px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
