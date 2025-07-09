// src/lib/services/CryptoKaijuApiService.ts
import { getContract, readContract } from 'thirdweb'
import { thirdwebClient } from '../thirdweb'
import { ethereum } from 'thirdweb/chains'

// CryptoKaiju contract address
export const CRYPTO_KAIJU_CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0'

// API constraints
const OPENSEA_MAX_LIMIT = 100
const DEFAULT_LIMIT = 50
const MAX_PAGES = 20 // Safety limit for pagination
const REQUEST_DELAY = 100 // ms between requests

export interface KaijuNFT {
  tokenId: string
  owner: string
  name?: string
  description?: string
  image?: string
  tokenURI?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  nfcId?: string
  batch?: string
  ipfsData?: any
  openSeaData?: any
  lastUpdated?: string
  birthDate?: number
  _meta?: {
    source: string
    fetchedAt: string
    hasIpfsData: boolean
    hasOpenSeaData: boolean
  }
}

export interface OpenSeaAsset {
  identifier: string
  name: string
  description: string
  image_url: string
  display_image_url?: string
  animation_url?: string
  metadata_url?: string
  opensea_url?: string
  traits: Array<{
    trait_type: string
    value: string | number
  }>
  collection: string
  contract: string
  last_sale?: {
    total_price: string
    payment_token: {
      symbol: string
      decimals: number
    }
  }
  creator?: string
  owner?: string
  rarity?: {
    rank: number
    score: number
  }
}

export interface CollectionStats {
  totalSupply: number
  owners?: number
  floorPrice?: number
  volume?: number
  sales?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    hasMore: boolean
    nextCursor?: string
  }
  meta: {
    fetchedAt: string
    source: string
  }
}

class CryptoKaijuApiService {
  private contract: any
  private cache = new Map<string, { data: any; expires: number }>()
  private readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.contract = getContract({
      client: thirdwebClient,
      chain: ethereum,
      address: CRYPTO_KAIJU_CONTRACT_ADDRESS
    })
  }

  /**
   * Get all tokens for a specific address with robust pagination
   */
  async getTokensForAddress(chainId: number, address: string): Promise<KaijuNFT[]> {
    const cacheKey = `tokens-${address}-${chainId}`
    
    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log(`💾 Cache hit for address ${address}`)
      return cached
    }

    try {
      console.log(`🔍 Fetching tokens for address: ${address}`)
      
      let allNFTs: any[] = []
      let cursor = ''
      let hasMore = true
      let pageCount = 0
      
      // Paginate through results with proper error handling
      while (hasMore && pageCount < MAX_PAGES) {
        try {
          const limit = Math.min(OPENSEA_MAX_LIMIT, 100)
          const url = `/api/opensea/chain/ethereum/account/${address}/nfts?limit=${limit}${cursor ? `&next=${cursor}` : ''}`
          
          console.log(`🌊 Fetching page ${pageCount + 1}: ${url}`)
          
          const response = await fetch(url)
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error(`❌ OpenSea API error on page ${pageCount + 1}:`, errorData)
            
            // If it's a rate limit, wait and retry once
            if (response.status === 429) {
              console.log('⏳ Rate limited, waiting 2 seconds...')
              await this.delay(2000)
              continue
            }
            
            // For other errors, break the loop but don't fail completely
            console.warn(`⚠️ Stopping pagination due to error: ${response.status}`)
            break
          }

          const data = await response.json()
          
          if (data.nfts && data.nfts.length > 0) {
            allNFTs.push(...data.nfts)
            console.log(`📊 Page ${pageCount + 1}: Found ${data.nfts.length} NFTs, total: ${allNFTs.length}`)
          } else {
            console.log(`📄 Page ${pageCount + 1}: No NFTs found`)
          }
          
          // Check for pagination
          cursor = data.next || ''
          hasMore = !!cursor && data.nfts?.length === limit
          pageCount++
          
          if (!hasMore) {
            console.log('📄 Reached end of pagination')
          }
          
          // Add delay between requests to be respectful
          if (hasMore) {
            await this.delay(REQUEST_DELAY)
          }
          
        } catch (pageError) {
          console.error(`❌ Error on page ${pageCount + 1}:`, pageError)
          // Continue with next page instead of failing completely
          pageCount++
          await this.delay(1000) // Wait longer on error
        }
      }

      if (pageCount >= MAX_PAGES) {
        console.warn(`⚠️ Reached maximum page limit (${MAX_PAGES}), there might be more NFTs`)
      }

      // Filter for CryptoKaiju NFTs only
      const cryptoKaijuNFTs = allNFTs.filter(nft => 
        nft.contract?.toLowerCase() === CRYPTO_KAIJU_CONTRACT_ADDRESS.toLowerCase()
      )

      console.log(`🔥 Found ${cryptoKaijuNFTs.length} CryptoKaiju NFTs out of ${allNFTs.length} total NFTs`)

      // Convert to our format with robust error handling
      const convertedNFTs: KaijuNFT[] = []
      
      for (const [index, nft] of cryptoKaijuNFTs.entries()) {
        try {
          console.log(`🔄 Converting NFT ${index + 1}/${cryptoKaijuNFTs.length}: ${nft.identifier}`)
          const converted = await this.convertOpenSeaNFT(nft, address)
          convertedNFTs.push(converted)
        } catch (error) {
          console.warn(`⚠️ Failed to convert NFT ${nft.identifier}:`, error)
          
          // Create a minimal fallback NFT instead of skipping
          const fallbackNFT: KaijuNFT = {
            tokenId: nft.identifier || 'unknown',
            owner: address,
            name: nft.name || `CryptoKaiju #${nft.identifier}`,
            description: 'Metadata temporarily unavailable',
            image: '/images/placeholder-kaiju.png',
            attributes: [],
            lastUpdated: new Date().toISOString(),
            _meta: {
              source: 'opensea-fallback',
              fetchedAt: new Date().toISOString(),
              hasIpfsData: false,
              hasOpenSeaData: !!nft
            }
          }
          convertedNFTs.push(fallbackNFT)
        }
      }

      console.log(`✅ Successfully converted ${convertedNFTs.length} CryptoKaiju NFTs`)
      
      // Cache the results
      this.setCache(cacheKey, convertedNFTs)
      
      return convertedNFTs

    } catch (error) {
      console.error('❌ Error fetching tokens for address:', error)
      throw new Error(`Failed to fetch tokens for address ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get OpenSea details for a specific token
   */
  async getOpenSeaDetails(tokenId: string): Promise<OpenSeaAsset | null> {
    const cacheKey = `opensea-${tokenId}`
    
    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      console.log(`🌊 Fetching OpenSea details for token ${tokenId}`)
      
      const response = await fetch(
        `/api/opensea/chain/ethereum/contract/${CRYPTO_KAIJU_CONTRACT_ADDRESS}/nfts/${tokenId}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ Token ${tokenId} not found on OpenSea`)
          return null
        }
        console.warn(`⚠️ OpenSea API error for token ${tokenId}: ${response.status}`)
        return null
      }

      const data = await response.json()
      
      if (data.nft) {
        // Ensure the data has the required properties
        const openSeaAsset: OpenSeaAsset = {
          identifier: data.nft.identifier || tokenId,
          name: data.nft.name || '',
          description: data.nft.description || '',
          image_url: data.nft.image_url || '',
          display_image_url: data.nft.display_image_url || data.nft.image_url || '',
          animation_url: data.nft.animation_url,
          metadata_url: data.nft.metadata_url,
          opensea_url: data.nft.opensea_url || `https://opensea.io/assets/ethereum/${CRYPTO_KAIJU_CONTRACT_ADDRESS}/${tokenId}`,
          traits: data.nft.traits || [],
          collection: data.nft.collection || 'cryptokaiju',
          contract: data.nft.contract || CRYPTO_KAIJU_CONTRACT_ADDRESS,
          last_sale: data.nft.last_sale,
          creator: data.nft.creator,
          owner: data.nft.owner,
          rarity: data.nft.rarity
        }
        
        console.log(`✅ OpenSea data found for token ${tokenId}`)
        this.setCache(cacheKey, openSeaAsset)
        return openSeaAsset
      }

      return null
    } catch (error) {
      console.warn(`⚠️ Failed to fetch OpenSea details for token ${tokenId}:`, error)
      return null
    }
  }

  /**
   * Fetch IPFS metadata using the existing IPFS API route
   */
  async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    if (!tokenURI) {
      console.warn('⚠️ No tokenURI provided')
      return null
    }

    const cacheKey = `ipfs-${tokenURI}`
    
    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Extract IPFS hash from various formats
      let ipfsHash = tokenURI
      if (tokenURI.startsWith('ipfs://')) {
        ipfsHash = tokenURI.replace('ipfs://', '')
      } else if (tokenURI.includes('ipfs/')) {
        ipfsHash = tokenURI.split('ipfs/')[1]
      }

      console.log(`📁 Fetching IPFS metadata: ${ipfsHash}`)
      
      const response = await fetch(`/api/ipfs/${ipfsHash}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      })

      if (response.ok) {
        const metadata = await response.json()
        
        // If it's a fallback response, handle it appropriately
        if (metadata.fallback) {
          console.warn(`⚠️ IPFS fallback data for: ${ipfsHash}`)
          this.setCache(cacheKey, metadata.fallback)
          return metadata.fallback
        }
        
        console.log(`✅ IPFS metadata fetched for: ${ipfsHash}`)
        this.setCache(cacheKey, metadata)
        return metadata
      } else {
        console.warn(`⚠️ IPFS fetch failed for: ${ipfsHash} (${response.status})`)
        return null
      }
    } catch (error) {
      console.warn(`⚠️ IPFS fetch error for ${tokenURI}:`, error)
      return null
    }
  }

  /**
   * Convert OpenSea NFT format to our KaijuNFT format
   */
  private async convertOpenSeaNFT(openSeaNFT: any, owner?: string): Promise<KaijuNFT> {
    const tokenId = openSeaNFT.identifier || openSeaNFT.token_id
    const fetchedAt = new Date().toISOString()
    
    // Try to get IPFS metadata if available
    let ipfsData = null
    if (openSeaNFT.metadata_url || openSeaNFT.token_uri) {
      const metadataUrl = openSeaNFT.metadata_url || openSeaNFT.token_uri
      ipfsData = await this.fetchIpfsMetadata(metadataUrl)
    }

    // Extract and normalize attributes
    const rawTraits = openSeaNFT.traits || openSeaNFT.attributes || []
    const attributes = rawTraits.map((trait: any) => ({
      trait_type: trait.trait_type || trait.key || 'Unknown',
      value: trait.value || trait.val || ''
    }))

    // Find specific attributes
    const nfcIdAttr = attributes.find((attr: any) => 
      attr.trait_type?.toLowerCase().includes('nfc') || 
      attr.trait_type?.toLowerCase().includes('chip') ||
      attr.trait_type?.toLowerCase() === 'id'
    )
    
    const batchAttr = attributes.find((attr: any) => 
      attr.trait_type?.toLowerCase().includes('batch') ||
      attr.trait_type?.toLowerCase().includes('series')
    )

    // Determine the best name, description, and image
    const name = openSeaNFT.name || 
                 ipfsData?.name || 
                 `CryptoKaiju #${tokenId}`
                 
    const description = openSeaNFT.description || 
                       ipfsData?.description || 
                       'A mysterious and powerful Kaiju from the blockchain realm.'
                       
    const image = openSeaNFT.display_image_url || 
                  openSeaNFT.image_url || 
                  openSeaNFT.image || 
                  ipfsData?.image || 
                  '/images/placeholder-kaiju.png'

    return {
      tokenId: tokenId.toString(),
      owner: owner || openSeaNFT.owner || '',
      name,
      description,
      image,
      tokenURI: openSeaNFT.metadata_url || openSeaNFT.token_uri || '',
      attributes,
      nfcId: nfcIdAttr?.value?.toString(),
      batch: batchAttr?.value?.toString(),
      ipfsData,
      openSeaData: openSeaNFT,
      lastUpdated: fetchedAt,
      _meta: {
        source: 'opensea-api',
        fetchedAt,
        hasIpfsData: !!ipfsData,
        hasOpenSeaData: true
      }
    }
  }

  /**
   * Get token details by token ID
   */
  async getTokenDetails(chainId: number, tokenId: string): Promise<KaijuNFT | null> {
    try {
      console.log(`🔍 Fetching details for token ${tokenId}`)
      
      const openSeaData = await this.getOpenSeaDetails(tokenId)
      if (!openSeaData) {
        console.warn(`⚠️ No OpenSea data found for token ${tokenId}`)
        return null
      }

      const converted = await this.convertOpenSeaNFT(openSeaData)
      console.log(`✅ Token details fetched for ${tokenId}`)
      return converted
    } catch (error) {
      console.error(`❌ Error fetching token details for ${tokenId}:`, error)
      return null
    }
  }

  /**
   * Get token details by NFC ID
   */
  async getNfcDetails(chainId: number, nfcId: string): Promise<KaijuNFT | null> {
    try {
      console.log(`🏷️ Searching for NFC ID: ${nfcId}`)
      
      // Since OpenSea doesn't support searching by attributes directly,
      // this would require either:
      // 1. A database/indexing service
      // 2. Iterating through tokens (expensive)
      // 3. A custom API endpoint
      
      console.warn('⚠️ getNfcDetails not fully implemented - requires indexing service')
      console.warn('💡 Consider implementing a database to map NFC IDs to token IDs')
      
      return null
    } catch (error) {
      console.error(`❌ Error fetching NFC details for ${nfcId}:`, error)
      return null
    }
  }

  /**
   * Search tokens by various criteria
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    try {
      console.log(`🔍 Searching for: ${query}`)
      
      // If query is numeric, assume it's a token ID
      if (/^\d+$/.test(query.trim())) {
        const tokenDetails = await this.getTokenDetails(1, query.trim())
        return tokenDetails ? [tokenDetails] : []
      }

      // For text searches, we'd need a database or different API
      console.warn('⚠️ Text search not implemented - requires indexing service')
      console.warn('💡 Consider implementing full-text search with a database')
      
      return []
    } catch (error) {
      console.error('❌ Error searching tokens:', error)
      return []
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<CollectionStats> {
    const cacheKey = 'collection-stats'
    
    // Check cache first (longer cache for stats)
    const cached = this.getFromCache(cacheKey, 15 * 60 * 1000) // 15 minutes
    if (cached) {
      return cached
    }

    try {
      console.log('📊 Fetching collection statistics')
      
      // Try to get total supply from contract
      let totalSupply = 0
      try {
        const supply = await readContract({
          contract: this.contract,
          method: 'function totalSupply() view returns (uint256)',
          params: []
        })
        totalSupply = Number(supply)
        console.log(`📈 Contract total supply: ${totalSupply}`)
      } catch (contractError) {
        console.warn('⚠️ Could not fetch total supply from contract:', contractError)
        
        // Fallback: try to get collection info from OpenSea
        try {
          const response = await fetch('/api/opensea/collections/cryptokaiju')
          if (response.ok) {
            const data = await response.json()
            totalSupply = data.total_supply || 0
            console.log(`📈 OpenSea total supply: ${totalSupply}`)
          }
        } catch (openSeaError) {
          console.warn('⚠️ Could not fetch total supply from OpenSea:', openSeaError)
        }
      }

      const stats: CollectionStats = {
        totalSupply,
        owners: 0, // Would need to calculate from ownership data
        floorPrice: 0, // Would need to get from OpenSea collection stats
        volume: 0, // Would need to get from OpenSea collection stats
        sales: 0 // Would need to get from OpenSea collection stats
      }

      // Cache the results
      this.setCache(cacheKey, stats, 15 * 60 * 1000) // 15 minutes
      
      return stats
    } catch (error) {
      console.error('❌ Error fetching collection stats:', error)
      return {
        totalSupply: 0,
        owners: 0,
        floorPrice: 0,
        volume: 0,
        sales: 0
      }
    }
  }

  /**
   * Get all tokens (limited implementation)
   */
  async getAllTokens(limit: number = 100): Promise<KaijuNFT[]> {
    try {
      console.log(`🔍 Fetching all tokens (limit: ${limit})`)
      
      // This would require either:
      // 1. Iterating through all token IDs (expensive)
      // 2. Using a collection endpoint (if available)
      // 3. Using an indexing service
      
      console.warn('⚠️ getAllTokens has limited implementation')
      console.warn('💡 Consider implementing pagination or using an indexing service')
      
      return []
    } catch (error) {
      console.error('❌ Error fetching all tokens:', error)
      return []
    }
  }

  /**
   * Test the service with various endpoints
   */
  async testService(): Promise<void> {
    console.log('🧪 Testing CryptoKaiju API Service...')
    
    try {
      // Test 1: Collection stats
      console.log('📊 Testing collection stats...')
      const stats = await this.getCollectionStats()
      console.log('✅ Collection stats:', stats)
      
      // Test 2: Individual token
      console.log('🎯 Testing individual token fetch...')
      const tokenDetails = await this.getTokenDetails(1, '1')
      console.log('✅ Token details:', tokenDetails?.name || 'Not found')
      
      // Test 3: Search
      console.log('🔍 Testing search...')
      const searchResults = await this.searchTokens('1')
      console.log('✅ Search results:', searchResults.length)
      
      console.log('🎉 Service test completed successfully!')
      
    } catch (error) {
      console.error('❌ Service test failed:', error)
      throw error
    }
  }

  // Cache management methods
  private getFromCache(key: string, customTimeout?: number): any {
    const item = this.cache.get(key)
    if (!item) return null
    
    const timeout = customTimeout || this.cacheTimeout
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  private setCache(key: string, data: any, customTimeout?: number): void {
    const timeout = customTimeout || this.cacheTimeout
    this.cache.set(key, {
      data,
      expires: Date.now() + timeout
    })
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ Service cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export default new CryptoKaijuApiService()