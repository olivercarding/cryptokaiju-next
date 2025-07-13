// src/app/layout.tsx
import './globals.css'
import { Open_Sans } from 'next/font/google'
import type { Metadata } from 'next'
import { ThirdwebProvider } from "thirdweb/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from '@/components/layout/Footer'
import { GoogleTagManager, GoogleTagManagerNoScript } from '@/components/analytics/GoogleTagManager'
import { organizationSchema, websiteSchema, createJsonLd } from '@/lib/structured-data'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-primary',
})

// GTM Container ID
const GTM_ID = 'GTM-PF4KKMF'

// Default metadata (will be overridden by page-specific metadata)
export const metadata: Metadata = {
  metadataBase: new URL('https://cryptokaiju.io'),
  title: {
    template: '%s | CryptoKaiju',
    default: 'CryptoKaiju - Physical NFTs & Connected Collectibles'
  },
  description: 'World\'s first connected collectibles combining physical toys with NFTs. Each CryptoKaiju features NFC authentication linking your physical collectible to blockchain ownership.',
  keywords: ['Physical NFTs', 'Connected Objects', 'Connected Collectibles', 'NFC NFTs', 'Blockchain Toys'],
  authors: [{ name: 'CryptoKaiju Team' }],
  creator: 'CryptoKaiju',
  publisher: 'Big Monster Ltd',
  
  // Open Graph defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cryptokaiju.io',
    siteName: 'CryptoKaiju',
    title: 'CryptoKaiju - Physical NFTs & Connected Collectibles',
    description: 'World\'s first connected collectibles combining physical toys with NFTs.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'CryptoKaiju Connected Collectibles'
      }
    ]
  },
  
  // Twitter defaults  
  twitter: {
    card: 'summary_large_image',
    site: '@cryptokaiju',
    creator: '@cryptokaiju'
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <head>
        {/* Google Tag Manager */}
        <GoogleTagManager gtmId={GTM_ID} />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={createJsonLd(organizationSchema)}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={createJsonLd(websiteSchema)}
        />
        
        {/* Additional head elements */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cryptokaiju.mypinata.cloud" />
        <link rel="preconnect" href="https://api.opensea.io" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript gtmId={GTM_ID} />
        
        <ThirdwebProvider>
          {children}
          <Footer />
          <SpeedInsights />
        </ThirdwebProvider>
      </body>
    </html>
  )
}