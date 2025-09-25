import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atria Africa - Admin Dashboard',
  description: 'Administrative dashboard for Atria Africa real estate tokenization platform',
  icons: {
    icon: '/favicon.ico',
  },
}

/**
 * Root layout component that provides the top-level HTML structure and applies global styles and fonts.
 *
 * @param children - The page or application content to render inside the document body
 * @returns The HTML element tree (html > body) that wraps the provided `children`
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}