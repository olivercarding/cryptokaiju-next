// src/app/kaijudex/page.tsx - FIXED VERSION
import { Metadata } from 'next'
import KaijudexPageClient from '@/components/pages/KaijudexPageClient'
import KaijuBatchService from '@/lib/services/KaijuBatchService'

export const metadata: Metadata = {
  title: 'Kaijudex | CryptoKaiju',
  description: 'Discover all unique CryptoKaiju designs and find out more about your favourite characters. Browse our complete collection of collectible designs.',
  openGraph: {
    title: 'Kaijudex | CryptoKaiju',
    description: 'Discover all unique CryptoKaiju designs and find out more about your favourite characters.',
    type: 'website',
  },
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function KaijudexPage() {
  // Debug environment variables
  console.log('🔧 Environment check:', {
    hasSpaceId: !!process.env.CONTENTFUL_SPACE_ID,
    hasToken: !!process.env.CONTENTFUL_ACCESS_TOKEN,
    spaceIdPrefix: process.env.CONTENTFUL_SPACE_ID?.substring(0, 8) + '...',
    environment: process.env.NODE_ENV
  })

  try {
    console.log('🔄 Starting Kaijudex data fetch...')
    
    // Fetch data from Contentful
    const [batches, stats] = await Promise.all([
      KaijuBatchService.getAllBatches(),
      KaijuBatchService.getCollectionStats()
    ])

    console.log('📊 Kaijudex fetch results:', {
      batchesCount: batches.length,
      stats,
      firstBatch: batches[0] ? {
        id: batches[0].id,
        name: batches[0].name,
        type: batches[0].type,
        rarity: batches[0].rarity
      } : 'No batches found'
    })

    return (
      <KaijudexPageClient 
        initialBatches={batches}
        initialStats={stats}
      />
    )
  } catch (error) {
    console.error('❌ Error loading Kaijudex data:', error)
    
    // Return page with empty data if Contentful fails
    return (
      <KaijudexPageClient 
        initialBatches={[]}
        initialStats={{
          totalBatches: 0,
          plushCount: 0,
          vinylCount: 0,
          legendaryCount: 0
        }}
      />
    )
  }
}