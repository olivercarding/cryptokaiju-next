// src/app/sitemap.ts - FIXED: Proper trailing slashes and complete page coverage
import { MetadataRoute } from 'next'
import KaijuBatchService from '@/lib/services/KaijuBatchService'
import { getBlogPosts } from '@/lib/contentful'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptokaiju.io'
  
  // Helper to ensure trailing slash
  const withTrailingSlash = (url: string) => url.endsWith('/') ? url : `${url}/`
  
  // Static pages - WITH trailing slashes
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: withTrailingSlash(baseUrl),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: withTrailingSlash(`${baseUrl}/about`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: withTrailingSlash(`${baseUrl}/kaijudex`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: withTrailingSlash(`${baseUrl}/my-kaiju`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: withTrailingSlash(`${baseUrl}/nft`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: withTrailingSlash(`${baseUrl}/faq`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: withTrailingSlash(`${baseUrl}/blog`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Dynamic batch pages - WITH trailing slashes
  let batchPages: MetadataRoute.Sitemap = []
  
  try {
    const batches = await KaijuBatchService.getAllBatches()
    
    batchPages = batches.map(batch => ({
      url: withTrailingSlash(`${baseUrl}/kaijudex/${batch.slug}`),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: batch.featured ? 0.8 : 0.6,
    }))
    
    console.log(`📄 Generated sitemap with ${batchPages.length} batch pages`)
  } catch (error) {
    console.error('❌ Error generating batch pages for sitemap:', error)
  }

  // Blog post pages - WITH trailing slashes
  let blogPages: MetadataRoute.Sitemap = []
  
  try {
    const blogPosts = await getBlogPosts(100) // Get up to 100 blog posts
    
    blogPages = blogPosts.map(post => ({
      url: withTrailingSlash(`${baseUrl}/blog/${post.fields.slug}`),
      lastModified: new Date(post.fields.publishDate || post.sys.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: post.fields.featured ? 0.7 : 0.5,
    }))
    
    console.log(`📄 Generated sitemap with ${blogPages.length} blog pages`)
  } catch (error) {
    console.error('❌ Error generating blog pages for sitemap:', error)
  }

  // Individual Kaiju pages - FIRST 1000 TOKEN IDs
  let kaijuPages: MetadataRoute.Sitemap = []
  
  try {
    // Include the first 1000 token IDs
    const tokenIds = Array.from({length: 1000}, (_, i) => i + 1) // First 1000 tokens
    
    kaijuPages = tokenIds.map(tokenId => ({
      url: withTrailingSlash(`${baseUrl}/kaiju/${tokenId}`),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))
    
    console.log(`📄 Generated sitemap with ${kaijuPages.length} kaiju pages`)
  } catch (error) {
    console.error('❌ Error generating kaiju pages for sitemap:', error)
  }

  // Combine all pages
  const allPages = [...staticPages, ...batchPages, ...blogPages, ...kaijuPages]
  
  console.log(`📄 Generated complete sitemap with ${allPages.length} total pages`)
  
  return allPages
}

// Export revalidate for static generation
export const revalidate = 3600 // Revalidate every hour