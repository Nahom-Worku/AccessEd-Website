import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'AccessEd - Master Your Materials',
    template: '%s | AccessEd',
  },
  description:
    'Transform your PDFs into a personalized learning engine with page-verified answers, adaptive quizzes, and real-time mastery tracking.',
  metadataBase: new URL('https://accessed.app'),
  openGraph: {
    title: 'AccessEd - Master Your Materials',
    description:
      'Transform your PDFs into a personalized learning engine with page-verified answers, adaptive quizzes, and real-time mastery tracking.',
    url: 'https://accessed.app',
    siteName: 'AccessEd',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'bg-card text-foreground border-border',
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
