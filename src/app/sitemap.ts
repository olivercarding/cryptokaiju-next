// src/app/sitemap.ts - FIXED: Proper sitemap data export
import { MetadataRoute } from 'next'
import KaijuBatchService from '@/lib/services/KaijuBatchService'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptokaiju.io'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kaijudex`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/my-kaiju`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/nft`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Dynamic batch pages
  let batchPages: MetadataRoute.Sitemap = []
  
  try {
    const batches = await KaijuBatchService.getAllBatches()
    
    batchPages = batches.map(batch => ({
      url: `${baseUrl}/kaijudex/${batch.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: batch.featured ? 0.8 : 0.6,
    }))
    
    console.log(`📄 Generated sitemap with ${batchPages.length} batch pages`)
  } catch (error) {
    console.error('❌ Error generating batch pages for sitemap:', error)
    // Continue without batch pages if there's an error
  }

  // Combine all pages
  return [...staticPages, ...batchPages]
}

// Export revalidate for static generation
export const revalidate = 3600 // Revalidate every hour