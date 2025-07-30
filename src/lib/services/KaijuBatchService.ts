// src/lib/services/KaijuBatchService.ts
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
  
  class KaijuBatchService {
    private cache = new Map<string, LocalKaijuBatch[]>()
    private batchCache = new Map<string, LocalKaijuBatch>()
    private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
    private lastFetch = 0
  
    /**
     * Get all batches with caching
     */
    async getAllBatches(): Promise<LocalKaijuBatch[]> {
      const cacheKey = 'all-batches'
      const now = Date.now()
      
      // Check cache first
      if (this.cache.has(cacheKey) && (now - this.lastFetch) < this.CACHE_TTL) {
        console.log('📦 Using cached batches')
        return this.cache.get(cacheKey)!
      }
  
      try {
        console.log('🔄 Fetching batches from Contentful...')
        const contentfulBatches = await getAllKaijuBatches()
        const localBatches = contentfulBatches.map(convertContentfulBatchToLocal)
        
        // Update caches
        this.cache.set(cacheKey, localBatches)
        this.lastFetch = now
        
        // Update individual batch cache
        localBatches.forEach(batch => {
          this.batchCache.set(batch.slug, batch)
          this.batchCache.set(batch.id, batch)
        })
        
        console.log(`✅ Fetched ${localBatches.length} batches from Contentful`)
        return localBatches
      } catch (error) {
        console.error('❌ Error fetching batches from Contentful:', error)
        
        // Return cached data if available, even if stale
        if (this.cache.has(cacheKey)) {
          console.log('⚠️ Using stale cached data due to error')
          return this.cache.get(cacheKey)!
        }
        
        // Final fallback to empty array
        return []
      }
    }
  
    /**
     * Get batch by slug with caching
     */
    async getBatchBySlug(slug: string): Promise<LocalKaijuBatch | undefined> {
      // Check individual cache first
      if (this.batchCache.has(slug)) {
        console.log(`📦 Using cached batch: ${slug}`)
        return this.batchCache.get(slug)
      }
  
      try {
        console.log(`🔄 Fetching batch ${slug} from Contentful...`)
        const contentfulBatch = await getKaijuBatchBySlug(slug)
        
        if (contentfulBatch) {
          const localBatch = convertContentfulBatchToLocal(contentfulBatch)
          this.batchCache.set(slug, localBatch)
          this.batchCache.set(localBatch.id, localBatch)
          
          console.log(`✅ Fetched batch: ${localBatch.name}`)
          return localBatch
        }
        
        console.log(`❌ Batch not found: ${slug}`)
        return undefined
      } catch (error) {
        console.error(`❌ Error fetching batch ${slug}:`, error)
        return undefined
      }
    }
  
    /**
     * Get batch by ID with caching
     */
    async getBatchById(id: string): Promise<LocalKaijuBatch | undefined> {
      // Check individual cache first
      if (this.batchCache.has(id)) {
        console.log(`📦 Using cached batch: ${id}`)
        return this.batchCache.get(id)
      }
  
      try {
        console.log(`🔄 Fetching batch ${id} from Contentful...`)
        const contentfulBatch = await getKaijuBatchById(id)
        
        if (contentfulBatch) {
          const localBatch = convertContentfulBatchToLocal(contentfulBatch)
          this.batchCache.set(id, localBatch)
          this.batchCache.set(localBatch.slug, localBatch)
          
          console.log(`✅ Fetched batch: ${localBatch.name}`)
          return localBatch
        }
        
        console.log(`❌ Batch not found: ${id}`)
        return undefined
      } catch (error) {
        console.error(`❌ Error fetching batch ${id}:`, error)
        return undefined
      }
    }
  
    /**
     * Get batches by type
     */
    async getBatchesByType(type: 'Plush' | 'Vinyl'): Promise<LocalKaijuBatch[]> {
      const cacheKey = `type-${type}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!
      }
  
      try {
        const contentfulBatches = await getKaijuBatchesByType(type)
        const localBatches = contentfulBatches.map(convertContentfulBatchToLocal)
        
        this.cache.set(cacheKey, localBatches)
        return localBatches
      } catch (error) {
        console.error(`❌ Error fetching ${type} batches:`, error)
        
        // Fallback: filter from all batches if available
        const allBatches = await this.getAllBatches()
        return allBatches.filter(batch => batch.type === type)
      }
    }
  
    /**
     * Get batches by rarity
     */
    async getBatchesByRarity(rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'): Promise<LocalKaijuBatch[]> {
      const cacheKey = `rarity-${rarity}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!
      }
  
      try {
        const contentfulBatches = await getKaijuBatchesByRarity(rarity)
        const localBatches = contentfulBatches.map(convertContentfulBatchToLocal)
        
        this.cache.set(cacheKey, localBatches)
        return localBatches
      } catch (error) {
        console.error(`❌ Error fetching ${rarity} batches:`, error)
        
        // Fallback: filter from all batches if available
        const allBatches = await this.getAllBatches()
        return allBatches.filter(batch => batch.rarity === rarity)
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
        const allBatches = await this.getAllBatches()
        
        return {
          totalBatches: allBatches.length,
          plushCount: allBatches.filter(b => b.type === 'Plush').length,
          vinylCount: allBatches.filter(b => b.type === 'Vinyl').length,
          legendaryCount: allBatches.filter(b => b.rarity === 'Legendary').length,
        }
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
     * Get the NFT image for a batch
     */
    getBatchNFTImage(batch: LocalKaijuBatch): string | undefined {
      return batch.images?.nft
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
  }
  
  export default new KaijuBatchService()
  export { type LocalKaijuBatch as KaijuBatch }