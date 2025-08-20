// src/app/kaijudex/[slug]/page.tsx - ENHANCED WITH CONTENTFUL SEO
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import KaijuBatchService from '@/lib/services/KaijuBatchService'
import BatchDetailPageClient from '@/components/pages/BatchDetailPageClient'
import { generateBatchMetadata, generateBatchStructuredData } from '@/lib/seo'

interface BatchPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BatchPageProps): Promise<Metadata> {
  try {
    const batch = await KaijuBatchService.getBatchBySlug(params.slug)
    
    if (!batch) {
      return {
        title: 'Batch Not Found | CryptoKaiju',
        description: 'The requested CryptoKaiju batch could not be found.',
      }
    }

    // 🆕 Use enhanced SEO generation with Contentful data
    return generateBatchMetadata(batch)
    
  } catch (error) {
    console.error('Error generating metadata for batch:', error)
    return {
      title: 'Batch | CryptoKaiju',
      description: 'Explore CryptoKaiju connected collectibles.',
    }
  }
}

export async function generateStaticParams() {
  try {
    const batches = await KaijuBatchService.getAllBatches()
    
    return batches.map((batch) => ({
      slug: batch.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for batches:', error)
    return []
  }
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function BatchDetailPage({ params }: BatchPageProps) {
  try {
    const batch = await KaijuBatchService.getBatchBySlug(params.slug)
    
    if (!batch) {
      notFound()
    }

    // 🆕 Generate structured data for SEO
    const structuredData = generateBatchStructuredData(batch)

    return (
      <>
        {/* 🆕 JSON-LD Structured Data */}
        <Script
          id={`batch-structured-data-${batch.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />

        {/* 🆕 Additional meta tags for product-specific SEO */}
        <head>
          {/* Product-specific meta tags */}
          <meta property="product:availability" content={batch.availability} />
          <meta property="product:condition" content={batch.productInfo?.condition || 'new'} />
          <meta property="product:category" content="Collectibles" />
          <meta property="product:brand" content={batch.productInfo?.brand || 'CryptoKaiju'} />
          
          {/* Price information if available */}
          {batch.productInfo?.price && (
            <>
              <meta property="product:price:amount" content={batch.productInfo.price.toString()} />
              <meta property="product:price:currency" content={batch.productInfo.currency || 'ETH'} />
            </>
          )}
          
          {/* GTIN/MPN if available */}
          {batch.productInfo?.gtin && (
            <meta property="product:retailer_item_id" content={batch.productInfo.gtin} />
          )}
          {batch.productInfo?.mpn && (
            <meta property="product:item_group_id" content={batch.productInfo.mpn} />
          )}
          
          {/* Marketing tagline as additional description */}
          {batch.marketing?.tagline && (
            <meta name="description" content={`${batch.characterDescription} ${batch.marketing.tagline}`} />
          )}
          
          {/* Featured/priority hints for crawlers */}
          {batch.featured && (
            <meta name="priority" content="high" />
          )}
          
          {/* Series information */}
          {batch.series?.isPartOfSeries && batch.series.name && (
            <meta property="article:section" content={batch.series.name} />
          )}
        </head>

        <BatchDetailPageClient batch={batch} />
      </>
    )
    
  } catch (error) {
    console.error('Error loading batch detail:', error)
    notFound()
  }
}