// src/app/kaijudex/page.tsx - UPDATED FOR ENHANCED STRUCTURE
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import { createJsonLd } from '@/lib/structured-data'
import KaijudexPageClient from '@/components/pages/KaijudexPageClient'
import { KAIJU_BATCHES, getBatchesByType, getBatchesByRarity, KaijuBatch } from '@/config/batches'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Kaijudex - Complete CryptoKaiju Collection Database | All Designs & Characters',
  description: 'Explore all CryptoKaiju designs in our complete database. Discover unique NFT collectibles, view character traits, rarity information, and find your perfect Kaiju companion.',
  keywords: [
    'CryptoKaiju database',
    'NFT collection',
    'Ethereum collectibles',
    'digital toys',
    'blockchain characters',
    'Kaiju designs',
    'crypto collectibles',
    'NFT traits',
    'character gallery'
  ],
  openGraph: {
    title: 'Kaijudex - Complete CryptoKaiju Database',
    description: 'Browse all unique CryptoKaiju designs. Each character is both a digital NFT and physical collectible with unique traits and backstory.',
    type: 'website',
    url: '/kaijudex',
    images: [
      {
        url: '/images/og-kaijudex.jpg',
        width: 1200,
        height: 630,
        alt: 'CryptoKaiju Collection Database',
      }
    ],
    siteName: 'CryptoKaiju',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaijudex - Complete CryptoKaiju Database',
    description: 'Browse all unique CryptoKaiju designs. Each character is both a digital NFT and physical collectible.',
    images: ['/images/og-kaijudex.jpg'],
  },
  alternates: {
    canonical: '/kaijudex',
  },
  other: {
    'ethereum:contract': '0x102c527714ab7e652630cac7a30abb482b041fd0',
    'collection:size': KAIJU_BATCHES.length.toString(),
  }
}

// Helper function to get image for enhanced batch structure
const getBatchImage = (batch: KaijuBatch) => {
  return batch.images?.physical?.[0] || batch.images?.nft || '/images/placeholder-kaiju.png'
}

// Generate structured data for the collection
function generateCollectionStructuredData() {
  const totalBatches = KAIJU_BATCHES.length
  const plushCount = getBatchesByType('Plush').length
  const vinylCount = getBatchesByType('Vinyl').length
  const legendaryCount = getBatchesByRarity('Legendary').length

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://cryptokaiju.io/kaijudex',
    name: 'CryptoKaiju Collection Database',
    description: `Complete database of all ${totalBatches} CryptoKaiju character designs. Each design represents both a digital NFT and physical collectible.`,
    url: 'https://cryptokaiju.io/kaijudex',
    mainEntity: {
      '@type': 'Collection',
      name: 'CryptoKaiju Collection',
      description: 'A collection of unique digital and physical collectible characters on the Ethereum blockchain.',
      size: totalBatches,
      collectionSize: totalBatches,
      creator: {
        '@type': 'Organization',
        name: 'CryptoKaiju',
        url: 'https://cryptokaiju.io'
      }
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://cryptokaiju.io'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Kaijudex',
          item: 'https://cryptokaiju.io/kaijudex'
        }
      ]
    },
    hasPart: KAIJU_BATCHES.slice(0, 20).map((batch, index) => ({
      '@type': 'CreativeWork',
      '@id': `https://cryptokaiju.io/kaijudex/${batch.slug}`,
      name: batch.name,
      description: batch.characterDescription,
      url: `https://cryptokaiju.io/kaijudex/${batch.slug}`,
      image: getBatchImage(batch),
      position: index + 1,
      additionalType: batch.type + ' Collectible',
      category: batch.rarity,
      keywords: [batch.colors[0] || 'Collectible', batch.essence, batch.type]
    }))
  }
}

// Generate ItemList structured data for featured characters
function generateFeaturedItemsStructuredData() {
  const featuredBatches = KAIJU_BATCHES.filter(batch => 
    ['Legendary', 'Ultra Rare'].includes(batch.rarity)
  ).slice(0, 10)

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured CryptoKaiju Characters',
    description: 'Legendary and Ultra Rare CryptoKaiju characters in the collection.',
    numberOfItems: featuredBatches.length,
    itemListElement: featuredBatches.map((batch, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        '@id': `https://cryptokaiju.io/kaijudex/${batch.slug}`,
        name: batch.name,
        description: batch.characterDescription,
        url: `https://cryptokaiju.io/kaijudex/${batch.slug}`,
        image: getBatchImage(batch),
        additionalType: batch.type + ' Collectible',
        category: batch.rarity
      }
    }))
  }
}

// FAQ structured data for Kaijudex
function generateKaijudexFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How many different CryptoKaiju designs are there?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `There are currently ${KAIJU_BATCHES.length} unique CryptoKaiju character designs in the collection, each with their own backstory, traits, and rarity level.`
        }
      },
      {
        '@type': 'Question',
        name: 'What types of CryptoKaiju collectibles are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `CryptoKaiju come in two main types: Plush collectibles (${getBatchesByType('Plush').length} designs) and Vinyl figures (${getBatchesByType('Vinyl').length} designs). Each physical collectible has a corresponding NFT on the Ethereum blockchain.`
        }
      },
      {
        '@type': 'Question',
        name: 'What makes some Kaiju rarer than others?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CryptoKaiju have different rarity levels: Common, Rare, Ultra Rare, and Legendary. Rarity is determined by the character design, elemental attributes, and the limited nature of each batch release.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I see all the traits and details for each Kaiju?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Each Kaiju in the database shows detailed information including their essence, habitat, estimated supply, and discovery date. You can also filter by type and rarity to find specific characters.'
        }
      }
    ]
  }
}

export default function KaijudexPage() {
  // Calculate stats for structured data and initial page load
  const totalBatches = KAIJU_BATCHES.length
  const plushCount = getBatchesByType('Plush').length
  const vinylCount = getBatchesByType('Vinyl').length
  const legendaryCount = getBatchesByRarity('Legendary').length

  // Generate structured data
  const collectionSchema = generateCollectionStructuredData()
  const featuredItemsSchema = generateFeaturedItemsStructuredData()
  const faqSchema = generateKaijudexFAQStructuredData()

  return (
    <>
      {/* Collection Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(collectionSchema)}
      />
      
      {/* Featured Items Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(featuredItemsSchema)}
      />
      
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(faqSchema)}
      />
      
      {/* Client-side component with all interactivity */}
      <KaijudexPageClient 
        initialStats={{
          totalBatches,
          plushCount,
          vinylCount,
          legendaryCount
        }}
      />
    </>
  )
}