// src/lib/seo.ts - FIXED FOR RICH TEXT SUPPORT
import type { Metadata } from 'next'
import type { LocalKaijuBatch } from '@/lib/contentful'
import type { Document } from '@contentful/rich-text-types'

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

// 🆕 NEW: Helper function to extract plain text from rich text or string
function extractPlainText(content: string | Document): string {
  if (typeof content === 'string') {
    return content
  }
  
  // If it's a Document (rich text), extract plain text from all nodes
  if (content && typeof content === 'object' && content.nodeType === 'document') {
    const extractTextFromNode = (node: any): string => {
      if (!node) return ''
      
      // Handle text nodes
      if (node.nodeType === 'text') {
        return node.value || ''
      }
      
      // Handle other nodes with content
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractTextFromNode).join('')
      }
      
      return ''
    }
    
    return content.content ? content.content.map(extractTextFromNode).join(' ') : ''
  }
  
  return ''
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
    title: 'NFT Lookup - Verify your CryptoKaiju Physical NFTs',
    description: 'Search and verify CryptoKaiju physical NFTs by token ID or NFC chip. Instantly verify Kaiju authenticity and provenance and view blockchain ownership records.',
    keywords: ['Physical NFT Verification', 'Connected Objects Search', 'NFC Authentication', 'Blockchain Verification'],
    ogImage: '/images/og-nft-lookup.jpg'
  },
  
  '/faq': {
    title: 'CryptoKaiju FAQs - CryptoKaiju',
    description: 'Learn how CryptoKaiju connected collectibles work and why they matter in our FAQs section.',
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
      type: 'website', // Use valid Next.js OpenGraph type
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

// 🆕 UPDATED: Enhanced batch metadata generation with rich text support
export function generateBatchMetadata(batch: LocalKaijuBatch): Metadata {
  // Use Contentful SEO fields if available, otherwise generate from batch data
  const seoTitle = batch.seo?.title || 
    `${batch.name} - ${batch.type} Collectible | CryptoKaiju`
  
  // 🆕 FIXED: Extract plain text from characterDescription whether it's string or Document
  const characterDescriptionText = extractPlainText(batch.characterDescription)
  const seoDescription = batch.seo?.description || 
    `Discover ${batch.name}, a ${batch.rarity.toLowerCase()} ${batch.type.toLowerCase()} collectible from CryptoKaiju. ${batch.essence}. ${characterDescriptionText.substring(0, 100)}...`
  
  const seoKeywords = batch.seo?.keywords?.length ? batch.seo.keywords : [
    'Physical NFT',
    'Connected Collectible',
    'NFC Authentication',
    batch.name,
    batch.type,
    batch.rarity,
    'CryptoKaiju'
  ]
  
  // Open Graph
  const ogTitle = batch.seo?.openGraph?.title || seoTitle
  const ogDescription = batch.seo?.openGraph?.description || seoDescription
  const ogImage = batch.seo?.openGraph?.image || 
    batch.images.physical[0] || 
    (typeof batch.images.nft === 'string' ? batch.images.nft : batch.images.nft?.[0]) ||
    `${baseConfig.siteUrl}/api/og/batch/${batch.slug}`
  
  // Twitter
  const twitterTitle = batch.seo?.twitter?.title || ogTitle
  const twitterDescription = batch.seo?.twitter?.description || ogDescription
  
  const canonicalUrl = `${baseConfig.siteUrl}/kaijudex/${batch.slug}`
  
  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords.join(', '),
    
    // Open Graph - Use 'website' instead of 'product' (Next.js doesn't support 'product')
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: baseConfig.siteName,
      type: 'website', // FIXED: Use valid Next.js OpenGraph type
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${baseConfig.siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: batch.name
        }
      ]
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      site: baseConfig.twitterHandle,
      title: twitterTitle,
      description: twitterDescription,
      images: [ogImage.startsWith('http') ? ogImage : `${baseConfig.siteUrl}${ogImage}`]
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

// Dynamic metadata for parameterized routes (legacy - keeping for backward compatibility)
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

// Legacy function renamed to avoid conflicts
export function generateLegacyBatchMetadata(slug: string, batchName?: string): Metadata {
  const title = batchName 
    ? `${batchName} Batch - Physical NFTs & Connected Collectibles Collection`
    : `Kaiju Batch ${slug} - Connected Objects Collection Details`
    
  const description = batchName
    ? `Explore the ${batchName} collection of physical NFTs and connected collectibles. Each connected object features unique traits, NFC authentication, and blockchain verification.`
    : `Discover connected collectibles from the ${slug} batch. View physical NFTs with NFC chips linking toys to blockchain ownership.`

  return generatePageMetadata(`/kaijudx/${slug}`, {
    title,
    description,
    keywords: ['Physical NFT Collection', 'Connected Collectibles Batch', 'NFC Objects Series', batchName || slug],
    ogImage: `/api/og/batch/${slug}` // Dynamic OG image
  })
}

// 🆕 UPDATED: Generate JSON-LD structured data with rich text support
export function generateBatchStructuredData(batch: LocalKaijuBatch): object {
  // Extract plain text for structured data
  const characterDescriptionText = extractPlainText(batch.characterDescription)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: batch.name,
    description: characterDescriptionText,
    image: batch.images.physical[0] || (typeof batch.images.nft === 'string' ? batch.images.nft : batch.images.nft?.[0]),
    brand: {
      '@type': 'Brand',
      name: batch.productInfo?.brand || 'CryptoKaiju'
    },
    manufacturer: {
      '@type': 'Organization',
      name: batch.productInfo?.manufacturer || 'CryptoKaiju'
    },
    category: 'Digital Collectibles',
    sku: `CK-${batch.id}`,
    gtin: batch.productInfo?.gtin,
    mpn: batch.productInfo?.mpn,
    url: `${baseConfig.siteUrl}/kaijudex/${batch.slug}`,
    offers: {
      '@type': 'Offer',
      availability: batch.availability === 'Mintable' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: batch.productInfo?.price,
      priceCurrency: batch.productInfo?.currency || 'ETH',
      itemCondition: `https://schema.org/${batch.productInfo?.condition === 'New' ? 'NewCondition' : 'UsedCondition'}`,
      seller: {
        '@type': 'Organization',
        name: 'CryptoKaiju'
      }
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Rarity',
        value: batch.rarity
      },
      {
        '@type': 'PropertyValue',
        name: 'Type',
        value: batch.type
      },
      {
        '@type': 'PropertyValue',
        name: 'Estimated Supply',
        value: batch.estimatedSupply
      },
      {
        '@type': 'PropertyValue',
        name: 'Authentication Method',
        value: 'NFC Chip + Blockchain'
      }
    ],
    ...(batch.series?.isPartOfSeries && {
      isPartOf: {
        '@type': 'CollectionPage',
        name: batch.series.name,
        description: extractPlainText(batch.series.description || '')
      }
    })
  }
}

// 🆕 UPDATED: Helper to get the best available title/description with rich text support
export function getBestSEOValue(
  contentfulValue: string | Document | undefined,
  fallbackValue: string,
  maxLength?: number
): string {
  let value: string
  
  if (contentfulValue) {
    value = extractPlainText(contentfulValue)
  } else {
    value = fallbackValue
  }
  
  return maxLength ? value.substring(0, maxLength) : value
}

// 🆕 UPDATED: Generate social media preview data with rich text support
export function generateSocialPreview(batch: LocalKaijuBatch): {
  title: string
  description: string
  image: string
  url: string
} {
  const characterDescriptionText = extractPlainText(batch.characterDescription)
  
  return {
    title: getBestSEOValue(batch.seo?.openGraph?.title, `${batch.name} | CryptoKaiju`, 60),
    description: getBestSEOValue(batch.seo?.openGraph?.description, characterDescriptionText, 160),
    image: batch.seo?.openGraph?.image || batch.images.physical[0] || '/images/og-default.jpg',
    url: `${baseConfig.siteUrl}/kaijudex/${batch.slug}`
  }
}