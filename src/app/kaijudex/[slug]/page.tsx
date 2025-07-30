// src/app/kaijudex/[slug]/page.tsx - UPDATED FOR CONTENTFUL
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KaijuBatchService from '@/lib/services/KaijuBatchService'
// Import your existing batch detail component here
// import BatchDetailPageClient from '@/components/pages/BatchDetailPageClient'

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

    // TODO: Create and use your batch detail component
    // return <BatchDetailPageClient batch={batch} />
    
    // Temporary return for now
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{batch.name}</h1>
          <p className="text-lg text-gray-700 mb-6">{batch.essence}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img 
                src={KaijuBatchService.getBatchPrimaryImage(batch)}
                alt={batch.name}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Character Description</h2>
                <p className="text-gray-700">{batch.characterDescription}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Physical Description</h2>
                <p className="text-gray-700">{batch.physicalDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Type:</span> {batch.type}
                </div>
                <div>
                  <span className="font-semibold">Rarity:</span> {batch.rarity}
                </div>
                <div>
                  <span className="font-semibold">Supply:</span> ~{batch.estimatedSupply}
                </div>
                <div>
                  <span className="font-semibold">Discovered:</span> {batch.discoveredDate}
                </div>
              </div>
              
              {batch.features && batch.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {batch.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading batch detail:', error)
    notFound()
  }
}