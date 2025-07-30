// src/app/kaijudex/page.tsx - UPDATED FOR CONTENTFUL
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
  try {
    // Fetch data from Contentful
    const [batches, stats] = await Promise.all([
      KaijuBatchService.getAllBatches(),
      KaijuBatchService.getCollectionStats()
    ])

    return (
      <KaijudexPageClient 
        initialBatches={batches}
        initialStats={stats}
      />
    )
  } catch (error) {
    console.error('Error loading Kaijudex data:', error)
    
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