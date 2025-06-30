// src/lib/services/CryptoKaijuApiService.ts
import axios from 'axios'

// OpenSea API endpoints
const OPENSEA_API_URL = 'https://api.opensea.io/api/v2/collections/cryptokaiju/nfts'
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

const OPENSEA_CONFIG = {
  headers: {
    'X-API-KEY': OPENSEA_API_KEY,
    'Accept': 'application/json'
  }
}

class CryptoKaijuApiService {
  private nfcMappingCache: NFCMapping | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  /**
   * Build and cache NFC ID mappings from OpenSea + IPFS
   */
  private async buildNFCMapping(): Promise<NFCMapping> {
    console.log('Building NFC mapping from OpenSea + IPFS...')
    const mapping: NFCMapping = {}
    let next = ""
    let processedCount = 0

    try {
      do {
        // Fetch batch of NFTs from OpenSea
        const params: any = { limit: 50 }
        if (next) params.next = next

        console.log(`Fetching batch from OpenSea... (processed: ${processedCount})`)
        const response = await axios.get(OPENSEA_API_URL, {
          ...OPENSEA_CONFIG,
          params
        })

        const { nfts, next: nextToken } = response.data
        next = nextToken

        // Process each NFT to extract NFC ID
        const batch = await Promise.all(
          nfts.map(async (nft: any) => {
            try {
              // Get NFC ID from OpenSea traits first (faster)
              const nfcTrait = nft.traits?.find((trait: any) => 
                trait.trait_type?.toLowerCase() === 'nfc' || 
                trait.trait_type?.toLowerCase() === 'nfc_id'
              )
              
              let nfcId = nfcTrait?.value

              // If not in traits, fetch from IPFS metadata
              if (!nfcId && nft.metadata_url) {
                try {
                  const ipfsHash = this.extractIPFSHash(nft.metadata_url)
                  if (ipfsHash) {
                    const metadata = await this.fetchIpfsMetadata(ipfsHash)
                    nfcId = metadata?.attributes?.nfc
                  }
                } catch (error) {
                  console.warn(`Failed to fetch metadata for token ${nft.identifier}:`, error)
                }
              }

              if (nfcId) {
                return { nfcId: nfcId.toLowerCase(), tokenId: nft.identifier }
              }
              return null
            } catch (error) {
              console.warn(`Error processing NFT ${nft.identifier}:`, error)
              return null
            }
          })
        )

        // Add to mapping
        batch.forEach(item => {
          if (item) {
            mapping[item.nfcId] = item.tokenId
          }
        })

        processedCount += nfts.length
        console.log(`Processed ${processedCount} NFTs, found ${Object.keys(mapping).length} with NFC IDs`)

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } while (next && processedCount < 5000) // Safety limit

      console.log(`NFC mapping built: ${Object.keys(mapping).length} entries`)
      return mapping

    } catch (error) {
      console.error('Error building NFC mapping:', error)
      throw error
    }
  }

  /**
   * Get cached NFC mapping or build new one
   */
  private async getNFCMapping(): Promise<NFCMapping> {
    const now = Date.now()
    
    if (this.nfcMappingCache && now < this.cacheExpiry) {
      return this.nfcMappingCache
    }

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
      return metadataUrl.split('/ipfs/')[1]
    }
    
    // Handle direct hash
    if (metadataUrl.match(/^[a-zA-Z0-9]{46,}$/)) {
      return metadataUrl
    }
    
    return null
  }

  /**
   * Lookup Kaiju by NFC ID
   */
  async lookupByNFC(nfcId: string): Promise<KaijuNFT | null> {
    try {
      console.log('Looking up NFC ID:', nfcId)
      const normalizedNFC = nfcId.toLowerCase().trim()
      
      const mapping = await this.getNFCMapping()
      const tokenId = mapping[normalizedNFC]
      
      if (!tokenId) {
        console.log('NFC ID not found in mapping')
        return null
      }

      console.log(`Found token ID ${tokenId} for NFC ${normalizedNFC}`)
      return await this.getTokenDetails(tokenId)
      
    } catch (error) {
      console.error('Error looking up NFC:', error)
      return null
    }
  }

  /**
   * Get token details by token ID from OpenSea
   */
  async getTokenDetails(tokenId: string): Promise<KaijuNFT | null> {
    try {
      const response = await axios.get(
        `${OPENSEA_API_URL}/${tokenId}`,
        OPENSEA_CONFIG
      )
      
      const nft = response.data.nft
      if (!nft) return null

      // Convert OpenSea data to our format
      const kaiju: KaijuNFT = {
        tokenId: nft.identifier,
        nfcId: '', // Will be filled from metadata
        owner: nft.owners?.[0]?.address || '',
        tokenURI: this.extractIPFSHash(nft.metadata_url) || '',
        ipfsData: null
      }

      // Fetch IPFS metadata
      if (kaiju.tokenURI) {
        try {
          const metadata = await this.fetchIpfsMetadata(kaiju.tokenURI)
          if (metadata) {
            kaiju.ipfsData = metadata
            kaiju.nfcId = metadata.attributes?.nfc || ''
            
            // Parse birthday if available
            if (metadata.attributes?.dob) {
              const birthday = Date.parse(metadata.attributes.dob)
              if (!isNaN(birthday)) {
                kaiju.birthDate = Math.floor(birthday / 1000)
              }
            }
          }
        } catch (metadataError) {
          console.warn('Failed to fetch IPFS metadata:', metadataError)
        }
      }

      return kaiju
      
    } catch (error) {
      console.error(`Error fetching token details for ${tokenId}:`, error)
      return null
    }
  }

  /**
   * Get tokens owned by an address
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    try {
      const response = await axios.get(OPENSEA_API_URL, {
        ...OPENSEA_CONFIG,
        params: {
          owner: address,
          limit: 50 // Adjust as needed
        }
      })

      const nfts = response.data.nfts || []
      
      // Convert to our format and enrich with IPFS data
      const kaijus = await Promise.all(
        nfts.map(async (nft: any) => {
          const kaiju: KaijuNFT = {
            tokenId: nft.identifier,
            nfcId: '',
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
                kaiju.nfcId = metadata.attributes?.nfc || ''
                
                if (metadata.attributes?.dob) {
                  const birthday = Date.parse(metadata.attributes.dob)
                  if (!isNaN(birthday)) {
                    kaiju.birthDate = Math.floor(birthday / 1000)
                  }
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch metadata for token ${nft.identifier}`)
            }
          }

          return kaiju
        })
      )

      return kaijus.filter(k => k.ipfsData) // Only return ones with metadata
      
    } catch (error) {
      console.error(`Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Search tokens by name, token ID, or NFC ID
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    try {
      const searchQuery = query.toLowerCase().trim()
      
      // If query looks like NFC ID (hex format), try direct NFC lookup first
      if (/^[0-9a-f]{8,}$/i.test(searchQuery)) {
        console.log('Attempting direct NFC lookup for:', searchQuery)
        const nfcResult = await this.lookupByNFC(searchQuery)
        if (nfcResult) {
          return [nfcResult]
        }
      }
      
      // If direct NFC lookup fails, try searching OpenSea collection
      // This is more limited but can search by name/traits
      const response = await axios.get(OPENSEA_API_URL, {
        ...OPENSEA_CONFIG,
        params: {
          limit: 20 // Limit for search results
        }
      })

      const nfts = response.data.nfts || []
      
      // Filter and convert results
      const results = await Promise.all(
        nfts
          .filter((nft: any) => {
            // Basic filtering by name
            return nft.name?.toLowerCase().includes(searchQuery) ||
                   nft.identifier === searchQuery
          })
          .slice(0, 10) // Limit results
          .map(async (nft: any) => {
            return await this.getTokenDetails(nft.identifier)
          })
      )

      return results.filter(Boolean) as KaijuNFT[]
      
    } catch (error) {
      console.error('Error searching tokens:', error)
      return []
    }
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchIpfsMetadata(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://cryptokaiju.mypinata.cloud/ipfs/${ipfsHash}`,
        { timeout: 5000 }
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching IPFS metadata for ${ipfsHash}:`, error)
      return null
    }
  }

  /**
   * Get OpenSea details for a token
   */
  async getOpenSeaDetails(tokenId: string): Promise<OpenSeaAsset | null> {
    try {
      const response = await axios.get(
        `${OPENSEA_API_URL}/${tokenId}`,
        OPENSEA_CONFIG
      )
      return response.data.nft
    } catch (error) {
      console.error(`Error fetching OpenSea details for token ${tokenId}:`, error)
      return null
    }
  }

  /**
   * Get all tokens (limited for performance)
   */
  async getAllTokens(): Promise<KaijuNFT[]> {
    try {
      const response = await axios.get(OPENSEA_API_URL, {
        ...OPENSEA_CONFIG,
        params: {
          limit: 50 // Reasonable limit for "all tokens" view
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
      console.error('Error fetching all tokens:', error)
      return []
    }
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<{totalSupply: number, owners: number}> {
    try {
      // This would need to be expanded to get full collection stats
      // For now, return basic stats
      return {
        totalSupply: 3000, // Approximate - could be fetched from contract
        owners: 800 // Approximate
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error)
      return { totalSupply: 0, owners: 0 }
    }
  }

  /**
   * Clear NFC mapping cache (useful for testing)
   */
  clearCache(): void {
    this.nfcMappingCache = null
    this.cacheExpiry = 0
    console.log('NFC mapping cache cleared')
  }
}

export default new CryptoKaijuApiService()