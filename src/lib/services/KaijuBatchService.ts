// src/lib/services/KaijuBatchService.ts - ENHANCED WITH DEBUG LOGGING
import { 
  getAllKaijuBatches, 
  getKaijuBatchBySlug, 
  getKaijuBatchById,
  getKaijuBatchesByType,
  getKaijuBatchesByRarity,
  convertContentfulBatchToLocal,
  type LocalKaijuBatch,
  type KaijuBatch as ContentfulKaijuBatch
} from '@/lib/contentful'
import type { Document } from '@contentful/rich-text-types'

// Helper function to extract plain text from rich text or string
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

class KaijuBatchService {
  private cache = new Map<string, LocalKaijuBatch[]>()
  private batchCache = new Map<string, LocalKaijuBatch>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private lastFetch = 0

  /**
   * Get all batches with caching and enhanced debugging
   */
  async getAllBatches(): Promise<LocalKaijuBatch[]> {
    const cacheKey = 'all-batches'
    const now = Date.now()
    
    // Check cache first
    if (this.cache.has(cacheKey) && (now - this.lastFetch) < this.CACHE_TTL) {
      console.log('📦 Using cached batches:', this.cache.get(cacheKey)!.length)
      return this.cache.get(cacheKey)!
    }

    try {
      console.log('🔄 Fetching batches from Contentful...')
      console.log('🔧 Service Environment check:', {
        hasSpaceId: !!process.env.CONTENTFUL_SPACE_ID,
        hasAccessToken: !!process.env.CONTENTFUL_ACCESS_TOKEN,
        spaceIdPrefix: process.env.CONTENTFUL_SPACE_ID?.substring(0, 8),
        environment: process.env.NODE_ENV
      })

      const contentfulBatches = await getAllKaijuBatches()
      console.log(`📦 Raw Contentful response: ${contentfulBatches.length} batches`)
      
      if (contentfulBatches.length === 0) {
        console.warn('⚠️ No batches returned from Contentful - checking possible issues:')
        console.warn('   - Are there published entries in Contentful?')
        console.warn('   - Is the content type ID exactly "kaijuBatch"?')
        console.warn('   - Are you using the correct Space ID and API token?')
        return []
      }

      // Log first batch for debugging
      if (contentfulBatches[0]) {
        console.log('🔍 First batch raw data:', {
          id: contentfulBatches[0].sys.id,
          contentType: contentfulBatches[0].sys.contentType?.sys?.id,
          fieldCount: Object.keys(contentfulBatches[0].fields || {}).length,
          fields: Object.keys(contentfulBatches[0].fields || {}),
          sampleFieldValues: {
            batchId: contentfulBatches[0].fields.batchId,
            name: contentfulBatches[0].fields.name,
            type: contentfulBatches[0].fields.type,
            discoveredDate: contentfulBatches[0].fields.discoveredDate,
            discoveredDateType: typeof contentfulBatches[0].fields.discoveredDate
          }
        })
      }
      
      // Convert to local format with error handling
      const localBatches: LocalKaijuBatch[] = []
      const conversionErrors: Array<{index: number, error: string, batchId?: string}> = []

      for (let i = 0; i < contentfulBatches.length; i++) {
        try {
          const localBatch = convertContentfulBatchToLocal(contentfulBatches[i])
          localBatches.push(localBatch)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown conversion error'
          conversionErrors.push({
            index: i,
            error: errorMessage,
            batchId: contentfulBatches[i].fields.batchId
          })
          console.error(`❌ Failed to convert batch ${i}:`, errorMessage)
        }
      }

      if (conversionErrors.length > 0) {
        console.error(`❌ ${conversionErrors.length} batches failed to convert:`, conversionErrors)
      }

      console.log(`✅ Successfully converted ${localBatches.length}/${contentfulBatches.length} batches`)
      
      if (localBatches.length > 0) {
        console.log('🔍 First converted batch:', {
          id: localBatches[0].id,
          name: localBatches[0].name,
          type: localBatches[0].type,
          rarity: localBatches[0].rarity,
          discoveredDate: localBatches[0].discoveredDate,
          imageCount: localBatches[0].images.physical.length,
          hasNftImages: !!localBatches[0].images.nft
        })
      }
      
      // Update caches
      this.cache.set(cacheKey, localBatches)
      this.lastFetch = now
      
      // Update individual batch cache
      localBatches.forEach(batch => {
        this.batchCache.set(batch.slug, batch)
        this.batchCache.set(batch.id, batch)
      })
      
      console.log(`✅ Cached ${localBatches.length} batches successfully`)
      return localBatches
      
    } catch (error) {
      console.error('❌ Error fetching batches from Contentful:', error)
      
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        })
      }
      
      // Return cached data if available, even if stale
      if (this.cache.has(cacheKey)) {
        console.log('⚠️ Using stale cached data due to error')
        return this.cache.get(cacheKey)!
      }
      
      // Final fallback to empty array
      console.warn('⚠️ Returning empty array - no cached data available')
      return []
    }
  }

  /**
   * Get batch by slug with caching and enhanced debugging
   */
  async getBatchBySlug(slug: string): Promise<LocalKaijuBatch | undefined> {
    console.log(`🔍 Looking for batch with slug: "${slug}"`)
    
    // Check individual cache first
    if (this.batchCache.has(slug)) {
      console.log(`📦 Using cached batch: ${slug}`)
      return this.batchCache.get(slug)
    }

    try {
      console.log(`🔄 Fetching batch "${slug}" from Contentful...`)
      const contentfulBatch = await getKaijuBatchBySlug(slug)
      
      if (contentfulBatch) {
        console.log(`📦 Found batch in Contentful:`, {
          id: contentfulBatch.sys.id,
          batchId: contentfulBatch.fields.batchId,
          name: contentfulBatch.fields.name
        })
        
        const localBatch = convertContentfulBatchToLocal(contentfulBatch)
        this.batchCache.set(slug, localBatch)
        this.batchCache.set(localBatch.id, localBatch)
        
        console.log(`✅ Converted and cached batch: ${localBatch.name}`)
        return localBatch
      }
      
      console.log(`❌ Batch not found in Contentful: "${slug}"`)
      return undefined
    } catch (error) {
      console.error(`❌ Error fetching batch "${slug}":`, error)
      return undefined
    }
  }

  /**
   * Get batch by ID with caching and enhanced debugging
   */
  async getBatchById(id: string): Promise<LocalKaijuBatch | undefined> {
    console.log(`🔍 Looking for batch with ID: "${id}"`)
    
    // Check individual cache first
    if (this.batchCache.has(id)) {
      console.log(`📦 Using cached batch: ${id}`)
      return this.batchCache.get(id)
    }

    try {
      console.log(`🔄 Fetching batch "${id}" from Contentful...`)
      const contentfulBatch = await getKaijuBatchById(id)
      
      if (contentfulBatch) {
        console.log(`📦 Found batch in Contentful:`, {
          sysId: contentfulBatch.sys.id,
          batchId: contentfulBatch.fields.batchId,
          name: contentfulBatch.fields.name
        })
        
        const localBatch = convertContentfulBatchToLocal(contentfulBatch)
        this.batchCache.set(id, localBatch)
        this.batchCache.set(localBatch.slug, localBatch)
        
        console.log(`✅ Converted and cached batch: ${localBatch.name}`)
        return localBatch
      }
      
      console.log(`❌ Batch not found in Contentful: "${id}"`)
      return undefined
    } catch (error) {
      console.error(`❌ Error fetching batch "${id}":`, error)
      return undefined
    }
  }

  /**
   * Get batches by type
   */
  async getBatchesByType(type: 'Plush' | 'Vinyl'): Promise<LocalKaijuBatch[]> {
    const cacheKey = `type-${type}`
    
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Using cached ${type} batches:`, this.cache.get(cacheKey)!.length)
      return this.cache.get(cacheKey)!
    }

    try {
      console.log(`🔄 Fetching ${type} batches from Contentful...`)
      const contentfulBatches = await getKaijuBatchesByType(type)
      const localBatches = contentfulBatches.map(convertContentfulBatchToLocal)
      
      this.cache.set(cacheKey, localBatches)
      console.log(`✅ Fetched and cached ${localBatches.length} ${type} batches`)
      return localBatches
    } catch (error) {
      console.error(`❌ Error fetching ${type} batches:`, error)
      
      // Fallback: filter from all batches if available
      console.log(`🔄 Fallback: filtering from all batches...`)
      const allBatches = await this.getAllBatches()
      const filtered = allBatches.filter(batch => batch.type === type)
      console.log(`✅ Fallback found ${filtered.length} ${type} batches`)
      return filtered
    }
  }

  /**
   * Get batches by rarity
   */
  async getBatchesByRarity(rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'): Promise<LocalKaijuBatch[]> {
    const cacheKey = `rarity-${rarity}`
    
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Using cached ${rarity} batches:`, this.cache.get(cacheKey)!.length)
      return this.cache.get(cacheKey)!
    }

    try {
      console.log(`🔄 Fetching ${rarity} batches from Contentful...`)
      const contentfulBatches = await getKaijuBatchesByRarity(rarity)
      const localBatches = contentfulBatches.map(convertContentfulBatchToLocal)
      
      this.cache.set(cacheKey, localBatches)
      console.log(`✅ Fetched and cached ${localBatches.length} ${rarity} batches`)
      return localBatches
    } catch (error) {
      console.error(`❌ Error fetching ${rarity} batches:`, error)
      
      // Fallback: filter from all batches if available
      console.log(`🔄 Fallback: filtering from all batches...`)
      const allBatches = await this.getAllBatches()
      const filtered = allBatches.filter(batch => batch.rarity === rarity)
      console.log(`✅ Fallback found ${filtered.length} ${rarity} batches`)
      return filtered
    }
  }

  /**
   * Get statistics about the collection
   */
  async getCollectionStats(): Promise<{
    totalBatches: number
    plushCount: number
    vinylCount: number
    legendaryCount: number
  }> {
    try {
      console.log('📊 Calculating collection stats...')
      const allBatches = await this.getAllBatches()
      
      const stats = {
        totalBatches: allBatches.length,
        plushCount: allBatches.filter(b => b.type === 'Plush').length,
        vinylCount: allBatches.filter(b => b.type === 'Vinyl').length,
        legendaryCount: allBatches.filter(b => b.rarity === 'Legendary').length,
      }

      console.log('📊 Collection stats calculated:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error getting collection stats:', error)
      return {
        totalBatches: 0,
        plushCount: 0,
        vinylCount: 0,
        legendaryCount: 0,
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
    this.batchCache.clear()
    this.lastFetch = 0
    console.log('🗑️ Batch caches cleared')
  }

  /**
   * Preload all batches (useful for performance)
   */
  async preloadBatches(): Promise<void> {
    try {
      console.log('🚀 Preloading batches...')
      await this.getAllBatches()
      console.log('🚀 Batches preloaded successfully')
    } catch (error) {
      console.error('❌ Error preloading batches:', error)
    }
  }

  /**
   * Check if batch exists by slug
   */
  async batchExists(slug: string): Promise<boolean> {
    try {
      const batch = await this.getBatchBySlug(slug)
      return !!batch
    } catch (error) {
      return false
    }
  }

  /**
   * Get the primary image for a batch
   */
  getBatchPrimaryImage(batch: LocalKaijuBatch): string {
    return batch.images?.physical?.[0] || '/images/placeholder-kaiju.png'
  }

  /**
   * Get the NFT image for a batch - UPDATED for multiple NFT support
   * @param batch - The batch to get NFT image for
   * @returns The first NFT image URL or undefined if none exists
   */
  getBatchNFTImage(batch: LocalKaijuBatch): string | undefined {
    if (!batch.images?.nft) return undefined
    
    // Handle both single and multiple NFT images
    if (Array.isArray(batch.images.nft)) {
      // If it's an array, return the first NFT image
      return batch.images.nft[0] || undefined
    } else {
      // If it's a single string, return it
      return batch.images.nft
    }
  }

  /**
   * Get all NFT images for a batch - NEW method for multiple NFT support
   * @param batch - The batch to get NFT images for
   * @returns Array of NFT image URLs
   */
  getBatchAllNFTImages(batch: LocalKaijuBatch): string[] {
    if (!batch.images?.nft) return []
    
    // Handle both single and multiple NFT images
    if (Array.isArray(batch.images.nft)) {
      return batch.images.nft.filter(Boolean) // Filter out empty strings
    } else {
      return batch.images.nft ? [batch.images.nft] : []
    }
  }

  /**
   * Convert batch name to slug (for backward compatibility)
   */
  batchNameToSlug(batchName: string): string {
    if (!batchName) return ''
    
    return batchName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // SEO-RELATED METHODS

  /**
   * Get batches optimized for SEO (featured first, then by priority)
   */
  async getFeaturedBatches(limit: number = 6): Promise<LocalKaijuBatch[]> {
    try {
      const allBatches = await this.getAllBatches()
      
      return allBatches
        .filter(batch => batch.featured)
        .sort((a, b) => {
          const priorityA = a.marketing?.featuredPriority || 999
          const priorityB = b.marketing?.featuredPriority || 999
          return priorityA - priorityB
        })
        .slice(0, limit)
    } catch (error) {
      console.error('❌ Error getting featured batches:', error)
      return []
    }
  }

  /**
   * Get batches with best SEO optimization (have custom SEO fields)
   */
  async getSEOOptimizedBatches(): Promise<LocalKaijuBatch[]> {
    try {
      const allBatches = await this.getAllBatches()
      
      return allBatches.filter(batch => 
        batch.seo?.title || 
        batch.seo?.description || 
        batch.seo?.keywords?.length
      )
    } catch (error) {
      console.error('❌ Error getting SEO optimized batches:', error)
      return []
    }
  }

  /**
   * Get the best SEO title for a batch (custom or generated)
   */
  getBatchSEOTitle(batch: LocalKaijuBatch): string {
    return batch.seo?.title || `${batch.name} - ${batch.type} Collectible | CryptoKaiju`
  }

  /**
   * Get the best SEO description for a batch (custom or generated) - with rich text support
   */
  getBatchSEODescription(batch: LocalKaijuBatch): string {
    return batch.seo?.description || 
      `Discover ${batch.name}, a ${batch.rarity.toLowerCase()} ${batch.type.toLowerCase()} collectible. ${batch.essence}. ${extractPlainText(batch.characterDescription).substring(0, 100)}...`
  }

  /**
   * Get all SEO keywords for a batch (custom + generated)
   */
  getBatchSEOKeywords(batch: LocalKaijuBatch): string[] {
    const customKeywords = batch.seo?.keywords || []
    const generatedKeywords = [
      'Physical NFT',
      'Connected Collectible', 
      'NFC Authentication',
      batch.name,
      batch.type,
      batch.rarity,
      'CryptoKaiju'
    ]
    
    // Combine and deduplicate
    return [...new Set([...customKeywords, ...generatedKeywords])]
  }

  /**
   * Get the best Open Graph image for a batch
   */
  getBatchOGImage(batch: LocalKaijuBatch): string {
    return batch.seo?.openGraph?.image ||
      batch.images.physical[0] ||
      (typeof batch.images.nft === 'string' ? batch.images.nft : batch.images.nft?.[0]) ||
      '/images/og-default.jpg'
  }

  /**
   * Search batches by SEO-friendly terms - with rich text support
   */
  async searchBatchesBySEO(searchTerm: string): Promise<LocalKaijuBatch[]> {
    if (!searchTerm.trim()) return []
    
    try {
      const allBatches = await this.getAllBatches()
      const term = searchTerm.toLowerCase().trim()
      
      return allBatches.filter(batch => {
        const searchableText = [
          batch.name,
          batch.essence,
          extractPlainText(batch.characterDescription),
          batch.seo?.title,
          batch.seo?.description,
          ...(batch.seo?.keywords || []),
          batch.marketing?.tagline,
          extractPlainText(batch.marketing?.collectorsNote || ''),
          batch.series?.name,
          extractPlainText(batch.series?.description || '')
        ].filter(Boolean).join(' ').toLowerCase()
        
        return searchableText.includes(term)
      })
    } catch (error) {
      console.error('❌ Error searching batches by SEO:', error)
      return []
    }
  }

  /**
   * Get series batches (useful for related content SEO)
   */
  async getSeriesBatches(seriesName: string): Promise<LocalKaijuBatch[]> {
    try {
      const allBatches = await this.getAllBatches()
      
      return allBatches.filter(batch => 
        batch.series?.isPartOfSeries && 
        batch.series?.name?.toLowerCase() === seriesName.toLowerCase()
      ).sort((a, b) => {
        const posA = a.series?.position || 999
        const posB = b.series?.position || 999
        return posA - posB
      })
    } catch (error) {
      console.error('❌ Error getting series batches:', error)
      return []
    }
  }

  /**
   * Get batch marketing summary for social sharing
   */
  getBatchMarketingSummary(batch: LocalKaijuBatch): {
    tagline?: string
    collectorsNote?: string
    isHighValue: boolean
    hasSpecialFeatures: boolean
  } {
    return {
      tagline: batch.marketing?.tagline,
      collectorsNote: extractPlainText(batch.marketing?.collectorsNote || ''),
      isHighValue: batch.rarity === 'Legendary' || batch.rarity === 'Ultra Rare',
      hasSpecialFeatures: (batch.features?.length || 0) > 0
    }
  }
}

export default new KaijuBatchService()
export { type LocalKaijuBatch as KaijuBatch }