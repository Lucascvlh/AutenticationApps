import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Autentication Apps',
  description: 'Autentications apps at Lucas Carvalho',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {children}
        <Analytics />
        </body>
    </html>
  )
}
