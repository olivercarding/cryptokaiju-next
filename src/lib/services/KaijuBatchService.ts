// src/lib/services/KaijuBatchService.ts - UPDATED FOR NEW CONTENTFUL SCHEMA
import {
  getAllKaijuBatches,
  getKaijuBatchBySlug as getContentfulBatchBySlug,
  getKaijuBatchById as getContentfulBatchById,
  getKaijuBatchesByType,
  getKaijuBatchesByRarity,
  getFeaturedKaijuBatches,
  getKaijuBatchesBySeries,
  convertContentfulBatchToLocal,
  type LocalKaijuBatch,
  type KaijuBatch as ContentfulKaijuBatch,
} from '@/lib/contentful'

// Re-export the LocalKaijuBatch type for components to use
export type KaijuBatch = LocalKaijuBatch

// Collection stats interface
export interface CollectionStats {
  totalBatches: number
  plushCount: number
  vinylCount: number
  legendaryCount: number
  commonCount: number
  rareCount: number
  ultraRareCount: number
  featuredCount: number
  seriesCount: number
}

// Search/filter options
export interface BatchFilters {
  type?: 'Plush' | 'Vinyl'
  rarity?: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  availability?: 'Secondary' | 'Mintable'
  featured?: boolean
  seriesName?: string
  hasNftImages?: boolean
}

class KaijuBatchService {
  
  /* ------------------------------------------------------------------ */
  /*  Basic CRUD Operations                                             */
  /* ------------------------------------------------------------------ */
  
  /**
   * Get all Kaiju batches converted to local format
   */
  async getAllBatches(): Promise<KaijuBatch[]> {
    try {
      const contentfulBatches = await getAllKaijuBatches()
      return contentfulBatches.map(convertContentfulBatchToLocal)
    } catch (error) {
      console.error('Error fetching all batches:', error)
      return []
    }
  }

  /**
   * Get Kaiju batch by slug
   */
  async getBatchBySlug(slug: string): Promise<KaijuBatch | null> {
    try {
      if (!slug) return null
      
      const contentfulBatch = await getContentfulBatchBySlug(slug)
      return contentfulBatch ? convertContentfulBatchToLocal(contentfulBatch) : null
    } catch (error) {
      console.error(`Error fetching batch by slug ${slug}:`, error)
      return null
    }
  }

  /**
   * Get Kaiju batch by batch ID
   */
  async getBatchById(batchId: string): Promise<KaijuBatch | null> {
    try {
      if (!batchId) return null
      
      const contentfulBatch = await getContentfulBatchById(batchId)
      return contentfulBatch ? convertContentfulBatchToLocal(contentfulBatch) : null
    } catch (error) {
      console.error(`Error fetching batch by ID ${batchId}:`, error)
      return null
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Filtered Queries                                                  */
  /* ------------------------------------------------------------------ */

  /**
   * Get batches by type
   */
  async getBatchesByType(type: 'Plush' | 'Vinyl'): Promise<KaijuBatch[]> {
    try {
      const contentfulBatches = await getKaijuBatchesByType(type)
      return contentfulBatches.map(convertContentfulBatchToLocal)
    } catch (error) {
      console.error(`Error fetching batches by type ${type}:`, error)
      return []
    }
  }

  /**
   * Get batches by rarity
   */
  async getBatchesByRarity(rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'): Promise<KaijuBatch[]> {
    try {
      const contentfulBatches = await getKaijuBatchesByRarity(rarity)
      return contentfulBatches.map(convertContentfulBatchToLocal)
    } catch (error) {
      console.error(`Error fetching batches by rarity ${rarity}:`, error)
      return []
    }
  }

  /**
   * Get featured batches
   */
  async getFeaturedBatches(limit = 10): Promise<KaijuBatch[]> {
    try {
      const contentfulBatches = await getFeaturedKaijuBatches(limit)
      return contentfulBatches.map(convertContentfulBatchToLocal)
    } catch (error) {
      console.error('Error fetching featured batches:', error)
      return []
    }
  }

  /**
   * Get batches by series name
   */
  async getBatchesBySeries(seriesName: string): Promise<KaijuBatch[]> {
    try {
      const contentfulBatches = await getKaijuBatchesBySeries(seriesName)
      return contentfulBatches.map(convertContentfulBatchToLocal)
    } catch (error) {
      console.error(`Error fetching batches by series ${seriesName}:`, error)
      return []
    }
  }

  /**
   * Get batches with advanced filtering (client-side filtering)
   */
  async getBatchesFiltered(filters: BatchFilters): Promise<KaijuBatch[]> {
    try {
      let batches = await this.getAllBatches()

      if (filters.type) {
        batches = batches.filter(batch => batch.type === filters.type)
      }

      if (filters.rarity) {
        batches = batches.filter(batch => batch.rarity === filters.rarity)
      }

      if (filters.availability) {
        batches = batches.filter(batch => batch.availability === filters.availability)
      }

      if (filters.featured !== undefined) {
        batches = batches.filter(batch => batch.marketing?.featured === filters.featured)
      }

      if (filters.seriesName) {
        batches = batches.filter(batch => 
          batch.series?.isPartOfSeries && 
          batch.series?.name === filters.seriesName
        )
      }

      if (filters.hasNftImages !== undefined) {
        batches = batches.filter(batch => {
          const hasNft = batch.images.nft && batch.images.nft.length > 0
          return filters.hasNftImages ? hasNft : !hasNft
        })
      }

      return batches
    } catch (error) {
      console.error('Error filtering batches:', error)
      return []
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Statistics and Analytics                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const batches = await this.getAllBatches()

      const stats: CollectionStats = {
        totalBatches: batches.length,
        plushCount: batches.filter(b => b.type === 'Plush').length,
        vinylCount: batches.filter(b => b.type === 'Vinyl').length,
        commonCount: batches.filter(b => b.rarity === 'Common').length,
        rareCount: batches.filter(b => b.rarity === 'Rare').length,
        ultraRareCount: batches.filter(b => b.rarity === 'Ultra Rare').length,
        legendaryCount: batches.filter(b => b.rarity === 'Legendary').length,
        featuredCount: batches.filter(b => b.marketing?.featured).length,
        seriesCount: batches.filter(b => b.series?.isPartOfSeries).length,
      }

      return stats
    } catch (error) {
      console.error('Error calculating collection stats:', error)
      return {
        totalBatches: 0,
        plushCount: 0,
        vinylCount: 0,
        commonCount: 0,
        rareCount: 0,
        ultraRareCount: 0,
        legendaryCount: 0,
        featuredCount: 0,
        seriesCount: 0,
      }
    }
  }

  /**
   * Get rarity distribution
   */
  async getRarityDistribution(): Promise<Record<string, number>> {
    try {
      const batches = await this.getAllBatches()
      const distribution: Record<string, number> = {}

      batches.forEach(batch => {
        distribution[batch.rarity] = (distribution[batch.rarity] || 0) + 1
      })

      return distribution
    } catch (error) {
      console.error('Error calculating rarity distribution:', error)
      return {}
    }
  }

  /**
   * Get all unique series names
   */
  async getAllSeries(): Promise<string[]> {
    try {
      const batches = await this.getAllBatches()
      const seriesNames = batches
        .filter(batch => batch.series?.isPartOfSeries && batch.series?.name)
        .map(batch => batch.series!.name!)
        .filter((name, index, arr) => arr.indexOf(name) === index)
        .sort()

      return seriesNames
    } catch (error) {
      console.error('Error fetching series names:', error)
      return []
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Image Helper Methods                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Get primary image for a batch (first physical image)
   */
  getBatchPrimaryImage(batch: KaijuBatch): string {
    if (batch.images.physical && batch.images.physical.length > 0) {
      return batch.images.physical[0]
    }
    return '/images/placeholder-kaiju.png'
  }

  /**
   * Get first NFT image for a batch (backward compatibility)
   */
  getBatchNFTImage(batch: KaijuBatch): string | null {
    if (batch.images.nft && batch.images.nft.length > 0) {
      return batch.images.nft[0]
    }
    return null
  }

  /**
   * Get all NFT images for a batch
   */
  getBatchNFTImages(batch: KaijuBatch): string[] {
    return batch.images.nft || []
  }

  /**
   * Get image for a specific category
   */
  getBatchImagesByCategory(batch: KaijuBatch, category: keyof KaijuBatch['images']): string[] {
    return batch.images[category] || []
  }

  /**
   * Check if batch has NFT images
   */
  batchHasNFTImages(batch: KaijuBatch): boolean {
    return batch.images.nft && batch.images.nft.length > 0
  }

  /**
   * Get best available image for display (primary physical or first NFT)
   */
  getBatchDisplayImage(batch: KaijuBatch): string {
    // First try physical images
    if (batch.images.physical && batch.images.physical.length > 0) {
      return batch.images.physical[0]
    }
    
    // Then try NFT images
    if (batch.images.nft && batch.images.nft.length > 0) {
      return batch.images.nft[0]
    }
    
    // Finally fallback to placeholder
    return '/images/placeholder-kaiju.png'
  }

  /* ------------------------------------------------------------------ */
  /*  SEO and Metadata Helpers                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Get SEO-optimized title for a batch
   */
  getBatchSEOTitle(batch: KaijuBatch): string {
    if (batch.seo?.title) {
      return batch.seo.title
    }
    return `${batch.name} | ${batch.type} ${batch.rarity} | CryptoKaiju`
  }

  /**
   * Get SEO-optimized description for a batch
   */
  getBatchSEODescription(batch: KaijuBatch): string {
    if (batch.seo?.description) {
      return batch.seo.description
    }
    return batch.characterDescription.substring(0, 160)
  }

  /**
   * Get Open Graph data for a batch
   */
  getBatchOpenGraphData(batch: KaijuBatch) {
    return {
      title: batch.openGraph?.title || this.getBatchSEOTitle(batch),
      description: batch.openGraph?.description || this.getBatchSEODescription(batch),
      image: batch.openGraph?.image || this.getBatchPrimaryImage(batch),
      type: 'website' as const,
    }
  }

  /**
   * Get Twitter Card data for a batch
   */
  getBatchTwitterData(batch: KaijuBatch) {
    return {
      title: batch.twitter?.title || this.getBatchSEOTitle(batch),
      description: batch.twitter?.description || this.getBatchSEODescription(batch),
      image: this.getBatchPrimaryImage(batch),
      card: 'summary_large_image' as const,
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Search and Discovery                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Search batches by name, description, or characteristics
   */
  async searchBatches(query: string): Promise<KaijuBatch[]> {
    try {
      if (!query.trim()) return []

      const batches = await this.getAllBatches()
      const searchTerm = query.toLowerCase().trim()

      return batches.filter(batch => {
        const searchableText = [
          batch.name,
          batch.characterDescription,
          batch.physicalDescription,
          batch.essence,
          batch.type,
          batch.rarity,
          batch.habitat,
          batch.materials,
          ...batch.colors,
          ...(batch.features || []),
          batch.marketing?.tagline,
          batch.series?.name,
        ].filter(Boolean).join(' ').toLowerCase()

        return searchableText.includes(searchTerm)
      })
    } catch (error) {
      console.error(`Error searching batches with query "${query}":`, error)
      return []
    }
  }

  /**
   * Get similar batches based on characteristics
   */
  async getSimilarBatches(batch: KaijuBatch, limit = 4): Promise<KaijuBatch[]> {
    try {
      const allBatches = await this.getAllBatches()
      
      // Filter out the current batch
      const otherBatches = allBatches.filter(b => b.id !== batch.id)
      
      // Score batches by similarity
      const scoredBatches = otherBatches.map(otherBatch => {
        let score = 0
        
        // Same type = +3 points
        if (otherBatch.type === batch.type) score += 3
        
        // Same rarity = +2 points
        if (otherBatch.rarity === batch.rarity) score += 2
        
        // Same series = +5 points
        if (batch.series?.isPartOfSeries && 
            otherBatch.series?.isPartOfSeries && 
            batch.series.name === otherBatch.series.name) {
          score += 5
        }
        
        // Shared colors = +1 point per shared color
        const sharedColors = batch.colors.filter(color => 
          otherBatch.colors.includes(color)
        )
        score += sharedColors.length
        
        // Same availability = +1 point
        if (otherBatch.availability === batch.availability) score += 1
        
        return { batch: otherBatch, score }
      })
      
      // Sort by score and return top results
      return scoredBatches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.batch)
        
    } catch (error) {
      console.error('Error finding similar batches:', error)
      return []
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Utility Methods                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Get formatted price for a batch
   */
  getBatchFormattedPrice(batch: KaijuBatch): string | null {
    if (!batch.product?.price || !batch.product?.currency) {
      return null
    }

    const { price, currency } = batch.product
    
    switch (currency) {
      case 'ETH':
        return `${price} ETH`
      case 'USD':
        return `$${price.toFixed(2)}`
      case 'EUR':
        return `€${price.toFixed(2)}`
      case 'GBP':
        return `£${price.toFixed(2)}`
      default:
        return `${price} ${currency}`
    }
  }

  /**
   * Check if a batch is currently available
   */
  isBatchAvailable(batch: KaijuBatch): boolean {
    return batch.product?.availability === 'InStock' || 
           batch.availability === 'Mintable'
  }

  /**
   * Get batch status for display
   */
  getBatchStatus(batch: KaijuBatch): string {
    if (batch.product?.availability === 'InStock') return 'Available'
    if (batch.product?.availability === 'PreOrder') return 'Pre-Order'
    if (batch.product?.availability === 'OutOfStock') return 'Sold Out'
    if (batch.availability === 'Mintable') return 'Mintable'
    if (batch.availability === 'Secondary') return 'Secondary Market'
    return 'Unknown'
  }

  /**
   * Get batch rarity color for UI
   */
  getBatchRarityColor(batch: KaijuBatch): string {
    switch (batch.rarity) {
      case 'Common':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Rare':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'Ultra Rare':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'Legendary':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
}

// Export singleton instance
const kaijuBatchService = new KaijuBatchService()
export default kaijuBatchService