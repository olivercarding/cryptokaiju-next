// src/lib/seo.ts
import type { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}

// Base configuration
const baseConfig = {
  siteName: 'CryptoKaiju',
  siteUrl: 'https://cryptokaiju.io',
  defaultOgImage: '/images/og-default.jpg',
  twitterHandle: '@cryptokaijuio'
}

// Page-specific configurations targeting our keywords
export const seoPages: Record<string, SEOConfig> = {
  '/': {
    title: 'CryptoKaiju - Physical NFTs & Connected Collectibles | Blockchain Toys with NFC',
    description: 'World\'s first connected collectibles combining physical toys with NFTs. Each CryptoKaiju features NFC authentication linking your physical collectible to blockchain ownership. Mint unique connected objects.',
    keywords: ['Physical NFTs', 'Connected Objects', 'Connected Collectibles', 'NFC NFTs', 'Blockchain Toys', 'Physical Blockchain Assets'],
    ogImage: '/images/og-homepage.jpg'
  },
  
  '/about': {
    title: 'About CryptoKaiju - Pioneers of Physical NFTs & Connected Objects Since 2018',
    description: 'Learn how CryptoKaiju created the world\'s first connected collectibles. We bridge physical toys with blockchain technology through NFC-enabled objects, revolutionizing how you own and verify collectibles.',
    keywords: ['Physical NFTs History', 'Connected Objects Pioneer', 'NFC Collectibles', 'Blockchain Innovation'],
    ogImage: '/images/og-about.jpg'
  },
  
  '/kaijudex': {
    title: 'Kaijudex - Complete Physical NFT Collection | Connected Objects Database',
    description: 'Explore all CryptoKaiju connected collectibles. Browse physical NFTs with NFC authentication, unique traits, and blockchain verification. Discover connected objects that prove ownership.',
    keywords: ['Physical NFT Collection', 'Connected Collectibles Database', 'NFC Verified Objects'],
    ogImage: '/images/og-kaijudex.jpg'
  },
  
  '/my-kaiju': {
    title: 'My Kaiju Collection - Your Physical NFTs & Connected Objects Portfolio',
    description: 'View your CryptoKaiju. Manage physical NFTs with blockchain verification, check NFC authentication status, and track your collection.',
    keywords: ['Physical NFT Portfolio', 'Connected Objects Collection', 'NFC Authentication Dashboard'],
    ogImage: '/images/og-my-collection.jpg'
  },
  
  '/nft': {
    title: 'NFT Lookup - Verify Physical NFTs & Connected Objects | Blockchain Search',
    description: 'Search and verify CryptoKaiju physical NFTs by token ID or NFC chip. Instantly verify Kaiju authenticity and provenance and view blockchain ownership records.',
    keywords: ['Physical NFT Verification', 'Connected Objects Search', 'NFC Authentication', 'Blockchain Verification'],
    ogImage: '/images/og-nft-lookup.jpg'
  },
  
  '/faq': {
    title: 'FAQ - Physical NFTs & Connected Collectibles Questions Answered',
    description: 'Get answers about physical NFTs, connected objects, and NFC authentication. Learn how CryptoKaiju connected collectibles work and why they matter.',
    keywords: ['Physical NFTs FAQ', 'Connected Objects Questions', 'NFC Collectibles Help'],
    ogImage: '/images/og-faq.jpg'
  }
}

// Generate metadata for any page
export function generatePageMetadata(path: string, customConfig?: Partial<SEOConfig>): Metadata {
  const pageConfig = seoPages[path] || seoPages['/'] // Fallback to homepage
  const config = { ...pageConfig, ...customConfig }
  
  const fullTitle = config.title.includes(baseConfig.siteName) 
    ? config.title 
    : `${config.title} | ${baseConfig.siteName}`
  
  const canonicalUrl = `${baseConfig.siteUrl}${path}`
  const ogImageUrl = config.ogImage ? `${baseConfig.siteUrl}${config.ogImage}` : `${baseConfig.siteUrl}${baseConfig.defaultOgImage}`

  return {
    title: fullTitle,
    description: config.description,
    keywords: config.keywords?.join(', '),
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description: config.description,
      url: canonicalUrl,
      siteName: baseConfig.siteName,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: config.title
        }
      ]
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      site: baseConfig.twitterHandle,
      title: fullTitle,
      description: config.description,
      images: [ogImageUrl]
    },
    
    // Canonical
    alternates: {
      canonical: canonicalUrl
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
    }
  }
}

// Dynamic metadata for parameterized routes
export function generateKaijuMetadata(tokenId: string, kaijuName?: string): Metadata {
  const title = kaijuName 
    ? `${kaijuName} - Physical NFT #${tokenId} | Connected Collectible Details`
    : `CryptoKaiju #${tokenId} - Physical NFT & Connected Object Details`
    
  const description = kaijuName
    ? `View ${kaijuName}, a unique physical NFT and connected object. Verify NFC authentication, explore traits, and confirm blockchain ownership of this connected collectible.`
    : `View CryptoKaiju #${tokenId} details including physical NFT verification, connected object authentication, and blockchain ownership records.`

  return generatePageMetadata(`/kaiju/${tokenId}`, {
    title,
    description,
    keywords: ['Physical NFT Details', 'Connected Object Info', 'NFC Verification', `CryptoKaiju ${tokenId}`],
    ogImage: `/api/og/kaiju/${tokenId}` // Dynamic OG image
  })
}

export function generateBatchMetadata(slug: string, batchName?: string): Metadata {
  const title = batchName 
    ? `${batchName} Batch - Physical NFTs & Connected Collectibles Collection`
    : `Kaiju Batch ${slug} - Connected Objects Collection Details`
    
  const description = batchName
    ? `Explore the ${batchName} collection of physical NFTs and connected collectibles. Each connected object features unique traits, NFC authentication, and blockchain verification.`
    : `Discover connected collectibles from the ${slug} batch. View physical NFTs with NFC chips linking toys to blockchain ownership.`

  return generatePageMetadata(`/kaijudex/${slug}`, {
    title,
    description,
    keywords: ['Physical NFT Collection', 'Connected Collectibles Batch', 'NFC Objects Series', batchName || slug],
    ogImage: `/api/og/batch/${slug}` // Dynamic OG image
  })
}

// Import and re-export createKaijuProductSchema for convenience
export { createKaijuProductSchema } from './structured-data'