import type { Metadata } from 'next'
import { Oswald, Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import CustomCursor from '@/components/ui/CustomCursor'
import { Toaster } from 'sonner'

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

export const metadata: Metadata = {
  title: 'Riaz Ahmed — Senior Software Engineer',
  description: 'Building immersive digital products with React, Next.js & React Native. 5+ years · 40+ projects · Chennai, India.',
  openGraph: {
    title: 'Riaz Ahmed — Senior Software Engineer',
    description: 'Building immersive digital products with React, Next.js & React Native.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body style={{ background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
        <ThemeProvider>
          <CustomCursor />
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
