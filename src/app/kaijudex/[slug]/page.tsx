// src/app/kaijudex/[slug]/page.tsx - UPDATED FOR CONTENTFUL WITH BEAUTIFUL DESIGN
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KaijuBatchService from '@/lib/services/KaijuBatchService'
import BatchDetailPageClient from '@/components/pages/BatchDetailPageClient'

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
      }
    }

    return {
      title: `${batch.name} | CryptoKaiju Kaijudex`,
      description: batch.characterDescription,
      openGraph: {
        title: `${batch.name} | CryptoKaiju`,
        description: batch.characterDescription,
        images: [
          {
            url: KaijuBatchService.getBatchPrimaryImage(batch),
            width: 800,
            height: 600,
            alt: batch.name,
          },
        ],
        type: 'website',
      },
    }
  } catch (error) {
    console.error('Error generating metadata for batch:', error)
    return {
      title: 'Batch | CryptoKaiju',
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

    // Use the beautiful client component with Contentful data
    return <BatchDetailPageClient batch={batch} />
    
  } catch (error) {
    console.error('Error loading batch detail:', error)
    notFound()
  }
}