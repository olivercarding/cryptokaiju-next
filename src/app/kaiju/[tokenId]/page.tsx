// src/app/kaiju/[tokenId]/page.tsx - REPLACE EXISTING FILE
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import { createJsonLd } from '@/lib/structured-data'
import KaijuDetailsPageClient from '@/components/pages/KaijuDetailsPageClient'
import { notFound } from 'next/navigation'

interface KaijuDetailsPageProps {
  params: {
    tokenId: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: KaijuDetailsPageProps): Promise<Metadata> {
  const { tokenId } = params
  
  // Validate tokenId
  if (!tokenId || isNaN(Number(tokenId))) {
    return generatePageMetadata('/kaiju/not-found')
  }

  // Try to fetch basic info for metadata (you might want to add a lightweight API call here)
  const title = `CryptoKaiju #${tokenId} | Blockchain Collectible`
  const description = `View details for CryptoKaiju #${tokenId} - a unique NFT collectible on the Ethereum blockchain. See traits, ownership history, and marketplace data.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/kaiju/${tokenId}`,
      images: [
        {
          url: '/images/og-kaiju-detail.jpg',
          width: 1200,
          height: 630,
          alt: `CryptoKaiju #${tokenId}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-kaiju-detail.jpg'],
    },
    alternates: {
      canonical: `/kaiju/${tokenId}`,
    },
    other: {
      'ethereum:contract': '0x102c527714ab7e652630cac7a30abb482b041fd0',
      'ethereum:token_id': tokenId,
    }
  }
}

// Generate structured data for the NFT
function generateNFTStructuredData(tokenId: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `https://cryptokaiju.io/kaiju/${tokenId}`,
    name: `CryptoKaiju #${tokenId}`,
    description: `A unique CryptoKaiju NFT collectible with token ID ${tokenId} on the Ethereum blockchain.`,
    url: `https://cryptokaiju.io/kaiju/${tokenId}`,
    image: `https://cryptokaiju.mypinata.cloud/ipfs/QmTokenIdMetadata/${tokenId}`,
    creator: {
      '@type': 'Organization',
      name: 'CryptoKaiju',
      url: 'https://cryptokaiju.io'
    },
    dateCreated: '2018-01-01', // You might want to fetch the actual mint date
    additionalType: 'NFT',
    identifier: {
      '@type': 'PropertyValue',
      name: 'Ethereum Token ID',
      value: tokenId
    },
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: 'CryptoKaiju Collection',
      url: 'https://cryptokaiju.io/kaijudex'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cryptokaiju.io/kaiju/${tokenId}`
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      category: 'Digital Collectible',
      eligibleRegion: 'Worldwide'
    }
  }
}

// Breadcrumb structured data
function generateBreadcrumbStructuredData(tokenId: string) {
  return {
    '@context': 'https://schema.org',
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
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `CryptoKaiju #${tokenId}`,
        item: `https://cryptokaiju.io/kaiju/${tokenId}`
      }
    ]
  }
}

export default function KaijuDetailsPage({ params }: KaijuDetailsPageProps) {
  const { tokenId } = params

  // Validate tokenId on server side
  if (!tokenId || isNaN(Number(tokenId)) || Number(tokenId) < 1) {
    notFound()
  }

  // Generate structured data
  const nftSchema = generateNFTStructuredData(tokenId)
  const breadcrumbSchema = generateBreadcrumbStructuredData(tokenId)

  return (
    <>
      {/* NFT Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(nftSchema)}
      />
      
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(breadcrumbSchema)}
      />
      
      {/* Client-side component with all interactivity */}
      <KaijuDetailsPageClient tokenId={tokenId} />
    </>
  )
}