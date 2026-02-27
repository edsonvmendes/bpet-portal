import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BPet Analytics',
  description: 'Portal de relatórios BPet',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
