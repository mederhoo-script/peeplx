import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'PeeplX - Secure Escrow Platform for Safe Transactions in Nigeria',
  description: 'Trade with strangers. Keep your peace of mind. PeeplX holds funds until both sides confirm delivery—so you can buy, sell, and swap without the stress.',
  keywords: ['escrow', 'nigeria', 'safe transactions', 'peeplx', 'trust score', 'secure payments'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="grain-overlay" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
