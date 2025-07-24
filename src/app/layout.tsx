import './globals.css'
import { Open_Sans } from 'next/font/google'
import type { Metadata } from 'next'
import { ThirdwebProvider } from 'thirdweb/react'
import { ethereum } from 'thirdweb/chains'
import { thirdwebClient } from '@/lib/thirdweb'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import Footer from '@/components/layout/Footer'
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/GoogleTagManager'
import {
  organizationSchema,
  websiteSchema,
  createJsonLd,
} from '@/lib/structured-data'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-primary',
})

const GTM_ID = 'GTM-PF4KKMF'

export const metadata: Metadata = {
  metadataBase: new URL('https://cryptokaiju.io'),
  title: {
    template: '%s | CryptoKaiju',
    default: 'CryptoKaiju - Physical NFTs & Connected Collectibles',
  },
  description:
    "World's first connected collectibles combining physical toys with NFTs. Each CryptoKaiju features NFC authentication linking your physical collectible to blockchain ownership.",
  keywords: [
    'Physical NFTs',
    'Connected Objects',
    'Connected Collectibles',
    'NFC NFTs',
    'Blockchain Toys',
  ],
  authors: [{ name: 'CryptoKaiju Team' }],
  creator: 'CryptoKaiju',
  publisher: 'Big Monster Ltd',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cryptokaiju.io',
    siteName: 'CryptoKaiju',
    title: 'CryptoKaiju - Physical NFTs & Connected Collectibles',
    description:
      "World's first connected collectibles combining physical toys with NFTs.",
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'CryptoKaiju Connected Collectibles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cryptokaijuio',
    creator: '@cryptokaijuio',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
  // Add icon metadata for better favicon support
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#ff005c' },
    ],
  },
  manifest: '/manifest.json',
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

        {/* Structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={createJsonLd(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={createJsonLd(websiteSchema)}
        />

        {/* Enhanced favicon configuration for better browser support */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ff005c" />
        <meta name="msapplication-TileColor" content="#ff005c" />
        <meta name="theme-color" content="#ff005c" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cryptokaiju.mypinata.cloud" />
        <link rel="preconnect" href="https://api.opensea.io" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript gtmId={GTM_ID} />

        {/* Thirdweb context uses the shared client so WalletConnect Core starts once */}
        {/* @ts-expect-error thirdweb/react typings do not yet expose a "client" prop */}
        <ThirdwebProvider client={thirdwebClient} activeChain={ethereum}>
          {children}
          <Footer />
          <SpeedInsights />
          <Analytics />
        </ThirdwebProvider>
      </body>
    </html>
  )
}