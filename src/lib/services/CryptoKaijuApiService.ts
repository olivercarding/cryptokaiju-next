// src/lib/services/CryptoKaijuApiService.ts
import axios from 'axios'

// OpenSea API endpoints - FIXED URLs
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const COLLECTION_SLUG = 'cryptokaiju' // Verify this is correct
const CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0' // Your actual contract address

// Use contract address instead of collection slug for more reliable API calls
const OPENSEA_NFT_ENDPOINT = `${OPENSEA_BASE_URL}/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts`
const OPENSEA_COLLECTION_ENDPOINT = `${OPENSEA_BASE_URL}/collections/${COLLECTION_SLUG}`

const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY || 'a221b5fb89fb4ffeb5fbf4fa42cc6532'

// Types
export interface KaijuNFT {
  tokenId: string
  nfcId: string
  owner: string
  tokenURI: string
  birthDate?: number
  ipfsData?: {
    name: string
    description: string
    image: string
    attributes: {
      nfc?: string
      colour?: string
      gender?: string
      batch?: string
      class?: string
      skill?: string
      dob?: string
      [key: string]: any
    }
  }
}

export interface OpenSeaAsset {
  identifier: string
  collection: string
  contract: string
  token_standard: string
  name: string
  description: string
  image_url: string
  display_image_url: string
  metadata_url: string
  opensea_url: string
  updated_at: string
  is_disabled: boolean
  is_nsfw: boolean
  animation_url?: string
  is_suspicious: boolean
  creator: string
  traits: Array<{
    trait_type: string
    display_type?: string
    max_value?: any
    value: any
    order?: any
  }>
  owners: Array<{
    address: string
    quantity: number
  }>
  rarity?: {
    strategy_id: string
    strategy_version: string
    rank: number
    score: number
    calculated_at: string
    max_rank: number
    tokens_scored: number
    ranking_features: any
  }
}

interface NFCMapping {
  [nfcId: string]: string // nfcId -> tokenId
}

// FIXED: Updated OpenSea configuration with correct headers (removed User-Agent - browsers block it)
const OPENSEA_CONFIG = {
  headers: {
    'X-API-KEY': OPENSEA_API_KEY,
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 second timeout
}

class CryptoKaijuApiService {
  private nfcMappingCache: NFCMapping | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  /**
   * Test API connectivity and configuration
   */
  async testAPI(): Promise<void> {
    console.log('🧪 Testing OpenSea API connectivity...')
    
    try {
      // Test 1: Check collection exists
      console.log('📋 Testing collection endpoint...')
      const collectionResponse = await axios.get(OPENSEA_COLLECTION_ENDPOINT, OPENSEA_CONFIG)
      console.log('✅ Collection found:', collectionResponse.data.name)
      
      // Test 2: Try fetching a single NFT by token ID
      console.log('🎨 Testing single NFT fetch...')
      const singleNftUrl = `${OPENSEA_NFT_ENDPOINT}/1`
      const nftResponse = await axios.get(singleNftUrl, OPENSEA_CONFIG)
      console.log('✅ Single NFT fetch successful:', nftResponse.data.nft?.name)
      
      // Test 3: Try fetching a small batch
      console.log('📦 Testing batch fetch...')
      const batchResponse = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params: { limit: 5 }
      })
      console.log('✅ Batch fetch successful, got', batchResponse.data.nfts?.length, 'NFTs')
      
      // Test 4: Check if any NFTs have NFC traits
      console.log('🏷️ Testing NFC trait detection...')
      const nfts = batchResponse.data.nfts || []
      let nfcFound = 0
      for (const nft of nfts.slice(0, 3)) {
        const nfcId = this.extractNFCFromTraits(nft.traits)
        if (nfcId) {
          console.log(`✅ Found NFC ID "${nfcId}" in token ${nft.identifier}`)
          nfcFound++
        } else {
          console.log(`ℹ️ No NFC trait found in token ${nft.identifier}`)
        }
      }
      
      if (nfcFound === 0) {
        console.log('⚠️ No NFC traits found in sample - may need to check IPFS metadata')
      }
      
      console.log('🎉 All API tests passed!')
      
    } catch (error) {
      console.error('❌ API test failed:', error)
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status)
        console.error('Status Text:', error.response?.statusText)
        console.error('Response:', error.response?.data)
        console.error('Request URL:', error.config?.url)
      }
      throw error
    }
  }

  /**
   * Test a specific NFC ID lookup (for debugging)
   */
  async testNFCLookup(nfcId: string): Promise<void> {
    console.log(`🧪 Testing NFC lookup for: ${nfcId}`)
    
    try {
      const result = await this.lookupByNFC(nfcId)
      if (result) {
        console.log('✅ NFC lookup successful!')
        console.log('Token ID:', result.tokenId)
        console.log('Name:', result.ipfsData?.name)
        console.log('NFC ID from result:', result.nfcId)
      } else {
        console.log('❌ NFC lookup failed - no result found')
      }
    } catch (error) {
      console.error('❌ NFC lookup test failed:', error)
    }
  }

  /**
   * Build and cache NFC ID mappings from OpenSea + IPFS (OPTIMIZED)
   */
  private async buildNFCMapping(): Promise<NFCMapping> {
    console.log('🗺️ Building NFC mapping from OpenSea + IPFS...')
    const mapping: NFCMapping = {}
    let next = ""
    let processedCount = 0
    const maxProcessed = 500 // Reduced limit for faster initial mapping
    let nfcFoundCount = 0

    try {
      do {
        // FIXED: Use contract-based endpoint with proper parameters
        const params: any = { limit: 50 }
        if (next) params.next = next

        console.log(`📦 Fetching batch from OpenSea... (processed: ${processedCount}, NFC found: ${nfcFoundCount})`)
        
        const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
          ...OPENSEA_CONFIG,
          params
        })

        if (!response.data || !response.data.nfts) {
          console.log('⚠️ No NFTs in response')
          break
        }

        const { nfts, next: nextToken } = response.data
        next = nextToken

        console.log(`📋 Processing ${nfts.length} NFTs from this batch...`)

        // Process NFTs in smaller chunks to avoid overwhelming IPFS
        const chunkSize = 10
        for (let i = 0; i < nfts.length; i += chunkSize) {
          const chunk = nfts.slice(i, i + chunkSize)
          
          const batchResults = await Promise.all(
            chunk.map(async (nft: any) => {
              try {
                // Method 1: Check OpenSea traits first (fastest)
                let nfcId = this.extractNFCFromTraits(nft.traits)
                
                // Method 2: If not in traits and we have reasonable NFC coverage, skip IPFS for performance
                if (!nfcId && nfcFoundCount < 100) { // Only fetch IPFS for first 100 missing NFCs
                  if (nft.metadata_url) {
                    try {
                      const ipfsHash = this.extractIPFSHash(nft.metadata_url)
                      if (ipfsHash) {
                        const metadata = await this.fetchIpfsMetadata(ipfsHash)
                        nfcId = this.extractNFCFromMetadata(metadata)
                      }
                    } catch (metadataError) {
                      // Silently continue - IPFS timeouts are common
                    }
                  }
                }

                if (nfcId) {
                  console.log(`🏷️ Found NFC ID ${nfcId} for token ${nft.identifier}`)
                  nfcFoundCount++
                  return { nfcId: nfcId.toLowerCase(), tokenId: nft.identifier }
                }
                
                return null
              } catch (error) {
                console.warn(`⚠️ Error processing NFT ${nft.identifier}:`, error.message)
                return null
              }
            })
          )

          // Add successful mappings
          batchResults.forEach(item => {
            if (item) {
              mapping[item.nfcId] = item.tokenId
            }
          })

          // Small delay between chunks
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        processedCount += nfts.length
        console.log(`📊 Processed ${processedCount} NFTs total, found ${Object.keys(mapping).length} with NFC IDs`)

        // Rate limiting: delay between batches
        if (next) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        // Early exit if we have a good amount of mappings
        if (Object.keys(mapping).length >= 100) {
          console.log('🎯 Found sufficient NFC mappings, stopping early for performance')
          break
        }

      } while (next && processedCount < maxProcessed)

      console.log(`🎯 NFC mapping complete: ${Object.keys(mapping).length} entries`)
      return mapping

    } catch (error) {
      console.error('❌ Error building NFC mapping:', error)
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data
        })
      }
      throw error
    }
  }

  /**
   * Extract NFC ID from OpenSea traits
   */
  private extractNFCFromTraits(traits: any[]): string | null {
    if (!traits || !Array.isArray(traits)) return null
    
    const nfcTrait = traits.find((trait: any) => {
      if (!trait.trait_type) return false
      const traitName = trait.trait_type.toLowerCase()
      return traitName === 'nfc' || 
             traitName === 'nfc_id' || 
             traitName === 'nfcid' ||
             traitName.includes('nfc')
    })
    
    return nfcTrait?.value ? String(nfcTrait.value).trim() : null
  }

  /**
   * Extract NFC ID from IPFS metadata
   */
  private extractNFCFromMetadata(metadata: any): string | null {
    if (!metadata) return null
    
    // Check direct nfc field
    if (metadata.nfc) return String(metadata.nfc).trim()
    
    // Check attributes object
    if (metadata.attributes) {
      if (metadata.attributes.nfc) return String(metadata.attributes.nfc).trim()
      if (metadata.attributes.nfc_id) return String(metadata.attributes.nfc_id).trim()
      if (metadata.attributes.nfcId) return String(metadata.attributes.nfcId).trim()
      
      // Check all attribute keys for NFC-like values
      for (const [key, value] of Object.entries(metadata.attributes)) {
        if (key.toLowerCase().includes('nfc') && value) {
          return String(value).trim()
        }
      }
    }
    
    // Check attributes array (some NFTs use array format)
    if (Array.isArray(metadata.attributes)) {
      const nfcAttr = metadata.attributes.find((attr: any) => 
        attr.trait_type?.toLowerCase().includes('nfc')
      )
      if (nfcAttr?.value) return String(nfcAttr.value).trim()
    }
    
    return null
  }

  /**
   * Get cached NFC mapping or build new one
   */
  async getNFCMapping(): Promise<NFCMapping> {
    const now = Date.now()
    
    if (this.nfcMappingCache && now < this.cacheExpiry) {
      console.log('📋 Using cached NFC mapping')
      return this.nfcMappingCache
    }

    console.log('🔄 Building new NFC mapping...')
    this.nfcMappingCache = await this.buildNFCMapping()
    this.cacheExpiry = now + this.CACHE_DURATION
    
    return this.nfcMappingCache
  }

  /**
   * Extract IPFS hash from various metadata URL formats
   */
  private extractIPFSHash(metadataUrl: string): string | null {
    if (!metadataUrl) return null
    
    // Handle different IPFS URL formats
    if (metadataUrl.startsWith('ipfs://')) {
      return metadataUrl.replace('ipfs://', '')
    }
    
    if (metadataUrl.includes('/ipfs/')) {
      const parts = metadataUrl.split('/ipfs/')
      return parts[1]?.split('/')[0] // Get just the hash, ignore any path
    }
    
    // Handle direct hash (46+ characters is typical for IPFS)
    if (metadataUrl.match(/^[a-zA-Z0-9]{46,}$/)) {
      return metadataUrl
    }
    
    return null
  }

  /**
   * Lookup Kaiju by NFC ID (OPTIMIZED)
   */
  async lookupByNFC(nfcId: string): Promise<KaijuNFT | null> {
    try {
      console.log('🔍 Looking up NFC ID:', nfcId)
      const normalizedNFC = nfcId.toLowerCase().trim()
      
      // Method 1: Try to search recent NFTs directly for this NFC (faster for recent mints)
      console.log('⚡ Trying direct search for recent NFTs...')
      const recentNfts = await this.searchRecentNFTsForNFC(normalizedNFC)
      if (recentNfts) {
        console.log('✅ Found via direct search!')
        return recentNfts
      }
      
      // Method 2: Fall back to full mapping if direct search fails
      console.log('📋 Falling back to NFC mapping...')
      const mapping = await this.getNFCMapping()
      const tokenId = mapping[normalizedNFC]
      
      if (!tokenId) {
        console.log('❌ NFC ID not found in mapping')
        return null
      }

      console.log(`✅ Found token ID ${tokenId} for NFC ${normalizedNFC}`)
      return await this.getTokenDetails(tokenId)
      
    } catch (error) {
      console.error('❌ Error looking up NFC:', error)
      return null
    }
  }

  /**
   * Search recent NFTs directly for NFC ID (faster than building full mapping)
   */
  private async searchRecentNFTsForNFC(nfcId: string): Promise<KaijuNFT | null> {
    try {
      // Search just the first 200 most recent NFTs
      const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params: { 
          limit: 50,
          order_by: 'created_date',
          order_direction: 'desc'
        }
      })

      const nfts = response.data.nfts || []
      
      for (const nft of nfts) {
        // Check traits first
        const nfcFromTraits = this.extractNFCFromTraits(nft.traits)
        if (nfcFromTraits && nfcFromTraits.toLowerCase() === nfcId) {
          console.log(`🎯 Found NFC ${nfcId} in recent NFT ${nft.identifier} via traits`)
          return await this.getTokenDetails(nft.identifier)
        }
        
        // For very recent NFTs, also try IPFS (but with short timeout)
        if (!nfcFromTraits && nft.metadata_url) {
          try {
            const ipfsHash = this.extractIPFSHash(nft.metadata_url)
            if (ipfsHash) {
              const response = await axios.get(
                `https://cryptokaiju.mypinata.cloud/ipfs/${ipfsHash}`,
                { timeout: 3000 } // Very short timeout for direct search
              )
              const nfcFromMetadata = this.extractNFCFromMetadata(response.data)
              if (nfcFromMetadata && nfcFromMetadata.toLowerCase() === nfcId) {
                console.log(`🎯 Found NFC ${nfcId} in recent NFT ${nft.identifier} via metadata`)
                return await this.getTokenDetails(nft.identifier)
              }
            }
          } catch (error) {
            // Silently continue for timeouts in direct search
          }
        }
      }
      
      return null
    } catch (error) {
      console.warn('⚠️ Direct NFC search failed:', error.message)
      return null
    }
  }

  /**
   * Get token details by token ID from OpenSea
   */
  async getTokenDetails(tokenId: string): Promise<KaijuNFT | null> {
    try {
      console.log(`🎨 Fetching token details for ${tokenId}`)
      
      // FIXED: Use contract-based endpoint for single token
      const tokenUrl = `${OPENSEA_NFT_ENDPOINT}/${tokenId}`
      const response = await axios.get(tokenUrl, OPENSEA_CONFIG)
      
      const nft = response.data.nft
      if (!nft) {
        console.log('❌ NFT not found in response')
        return null
      }

      // Convert OpenSea data to our format
      const kaiju: KaijuNFT = {
        tokenId: nft.identifier,
        nfcId: '',
        owner: nft.owners?.[0]?.address || '',
        tokenURI: this.extractIPFSHash(nft.metadata_url) || '',
        ipfsData: null
      }

      // Extract NFC ID from traits first
      kaiju.nfcId = this.extractNFCFromTraits(nft.traits) || ''

      // Fetch IPFS metadata if available
      if (kaiju.tokenURI) {
        try {
          const metadata = await this.fetchIpfsMetadata(kaiju.tokenURI)
          if (metadata) {
            kaiju.ipfsData = metadata
            
            // If NFC wasn't in traits, try to get it from metadata
            if (!kaiju.nfcId) {
              kaiju.nfcId = this.extractNFCFromMetadata(metadata) || ''
            }
            
            // Parse birthday if available
            if (metadata.attributes?.dob) {
              const birthday = Date.parse(metadata.attributes.dob)
              if (!isNaN(birthday)) {
                kaiju.birthDate = Math.floor(birthday / 1000)
              }
            }
          }
        } catch (metadataError) {
          console.warn('⚠️ Failed to fetch IPFS metadata:', metadataError.message)
        }
      }

      console.log(`✅ Successfully fetched token ${tokenId}:`, kaiju.ipfsData?.name || 'Unnamed')
      return kaiju
      
    } catch (error) {
      console.error(`❌ Error fetching token details for ${tokenId}:`, error)
      if (axios.isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data
        })
      }
      return null
    }
  }

  /**
   * Get tokens owned by an address - FIXED method signature
   */
  async getTokensForAddress(chainId: number = 1, address: string): Promise<KaijuNFT[]> {
    try {
      console.log(`👤 Fetching tokens for address: ${address}`)
      
      const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params: {
          owner: address,
          limit: 50
        }
      })

      const nfts = response.data.nfts || []
      console.log(`📦 Found ${nfts.length} NFTs for address ${address}`)
      
      // Convert to our format and enrich with IPFS data
      const kaijus = await Promise.all(
        nfts.map(async (nft: any) => {
          const kaiju: KaijuNFT = {
            tokenId: nft.identifier,
            nfcId: this.extractNFCFromTraits(nft.traits) || '',
            owner: address,
            tokenURI: this.extractIPFSHash(nft.metadata_url) || '',
            ipfsData: null
          }

          // Fetch IPFS metadata
          if (kaiju.tokenURI) {
            try {
              const metadata = await this.fetchIpfsMetadata(kaiju.tokenURI)
              if (metadata) {
                kaiju.ipfsData = metadata
                
                // Update NFC if not found in traits
                if (!kaiju.nfcId) {
                  kaiju.nfcId = this.extractNFCFromMetadata(metadata) || ''
                }
                
                if (metadata.attributes?.dob) {
                  const birthday = Date.parse(metadata.attributes.dob)
                  if (!isNaN(birthday)) {
                    kaiju.birthDate = Math.floor(birthday / 1000)
                  }
                }
              }
            } catch (error) {
              console.warn(`⚠️ Failed to fetch metadata for token ${nft.identifier}`)
            }
          }

          return kaiju
        })
      )

      const validKaijus = kaijus.filter(k => k.ipfsData)
      console.log(`✅ Successfully processed ${validKaijus.length} NFTs with metadata`)
      return validKaijus
      
    } catch (error) {
      console.error(`❌ Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Search tokens by name, token ID, or NFC ID
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    try {
      const searchQuery = query.toLowerCase().trim()
      console.log(`🔍 Searching for: "${searchQuery}"`)
      
      // If query looks like NFC ID (hex format), try direct NFC lookup first
      if (/^[0-9a-f]{8,}$/i.test(searchQuery)) {
        console.log('🏷️ Query looks like NFC ID, trying direct lookup...')
        const nfcResult = await this.lookupByNFC(searchQuery)
        if (nfcResult) {
          console.log('✅ Found via NFC lookup')
          return [nfcResult]
        }
        console.log('❌ NFC lookup failed, trying general search...')
      }
      
      // If query is numeric, try token ID lookup
      if (/^\d+$/.test(searchQuery)) {
        console.log('🔢 Query looks like token ID, trying direct lookup...')
        const tokenResult = await this.getTokenDetails(searchQuery)
        if (tokenResult) {
          console.log('✅ Found via token ID lookup')
          return [tokenResult]
        }
        console.log('❌ Token ID lookup failed')
      }
      
      // Fallback: search collection (limited capabilities)
      console.log('🔍 Falling back to collection search...')
      const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params: {
          limit: 20
        }
      })

      const nfts = response.data.nfts || []
      
      // Filter and convert results
      const filteredNfts = nfts.filter((nft: any) => {
        return nft.name?.toLowerCase().includes(searchQuery) ||
               nft.identifier === searchQuery ||
               nft.description?.toLowerCase().includes(searchQuery)
      }).slice(0, 10)

      const results = await Promise.all(
        filteredNfts.map(async (nft: any) => {
          return await this.getTokenDetails(nft.identifier)
        })
      )

      const validResults = results.filter(Boolean) as KaijuNFT[]
      console.log(`✅ Search completed, found ${validResults.length} results`)
      return validResults
      
    } catch (error) {
      console.error('❌ Error searching tokens:', error)
      return []
    }
  }

  /**
   * Fetch metadata from IPFS with better error handling and retry logic
   */
  async fetchIpfsMetadata(ipfsHash: string): Promise<any> {
    const maxRetries = 2
    const timeout = 5000 // Reduced timeout to 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(
          `https://cryptokaiju.mypinata.cloud/ipfs/${ipfsHash}`,
          { 
            timeout,
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        return response.data
      } catch (error) {
        if (attempt === maxRetries) {
          // Only log final failure to reduce noise
          console.warn(`❌ Failed to fetch IPFS metadata for ${ipfsHash} after ${maxRetries} attempts`)
          return null
        }
        
        // Short delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return null
  }

  /**
   * ADDED: Missing methods for compatibility
   */
  async getTokenDetails(chainId: number, tokenId: string): Promise<KaijuNFT | null> {
    return this.getTokenDetails(tokenId)
  }

  async getNfcDetails(chainId: number, nfcId: string): Promise<KaijuNFT | null> {
    return this.lookupByNFC(nfcId)
  }

  async getOpenSeaDetails(tokenId: string): Promise<OpenSeaAsset | null> {
    try {
      const response = await axios.get(`${OPENSEA_NFT_ENDPOINT}/${tokenId}`, OPENSEA_CONFIG)
      return response.data.nft
    } catch (error) {
      console.error(`❌ Error fetching OpenSea details for token ${tokenId}:`, error)
      return null
    }
  }

  async getAllTokens(): Promise<KaijuNFT[]> {
    try {
      const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params: {
          limit: 50
        }
      })

      const nfts = response.data.nfts || []
      
      const kaijus = await Promise.all(
        nfts.map(async (nft: any) => {
          return await this.getTokenDetails(nft.identifier)
        })
      )

      return kaijus.filter(Boolean) as KaijuNFT[]
      
    } catch (error) {
      console.error('❌ Error fetching all tokens:', error)
      return []
    }
  }

  async getCollectionStats(): Promise<{totalSupply: number, owners: number}> {
    try {
      const response = await axios.get(OPENSEA_COLLECTION_ENDPOINT, OPENSEA_CONFIG)
      const collection = response.data.collection
      
      return {
        totalSupply: collection?.total_supply || 3000,
        owners: collection?.unique_owners || 800
      }
    } catch (error) {
      console.error('❌ Error fetching collection stats:', error)
      return { totalSupply: 3000, owners: 800 }
    }
  }

  /**
   * Clear NFC mapping cache (useful for testing)
   */
  clearCache(): void {
    this.nfcMappingCache = null
    this.cacheExpiry = 0
    console.log('🗑️ NFC mapping cache cleared')
  }
}

export default new CryptoKaijuApiService()