import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flüxa CRM',
  description: 'CRM multiempresa Flüxa',
  icons: { icon: '/favicon.png', shortcut: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png"/>
      </head>
      <body className="bg-[#070C18] text-white antialiased overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
