import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'Flüxa CRM', description: 'CRM multiempresa' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-[#070C18] text-white antialiased overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
