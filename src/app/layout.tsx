// src/app/layout.tsx
import './globals.css'
import { Open_Sans } from 'next/font/google'
import type { Metadata } from 'next'
import { ThirdwebProvider } from "thirdweb/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from '@/components/layout/Footer'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-primary',
})

export const metadata: Metadata = {
  title: 'CryptoKaiju - Collectible NFTs Linked to Toys',
  description: 'Unique collectible plush toys linked to NFTs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body>
        <ThirdwebProvider>
          {children}
          <Footer />
          <SpeedInsights />
        </ThirdwebProvider>
      </body>
    </html>
  )
}