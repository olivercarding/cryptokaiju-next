// src/lib/services/CryptoKaijuApiService.ts - Complete Service
import axios from 'axios'

// OpenSea API endpoints - FIXED URLs
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const COLLECTION_SLUG = 'cryptokaiju'
const CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0'

// Use contract address instead of collection slug for more reliable API calls
const OPENSEA_NFT_ENDPOINT = `${OPENSEA_BASE_URL}/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts`
const OPENSEA_COLLECTION_ENDPOINT = `${OPENSEA_BASE_URL}/collections/${COLLECTION_SLUG}`

// ✅ SECURE: No hardcoded fallback API key
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

// ✅ SECURE: Check if API key is available and warn if missing
const OPENSEA_CONFIG = {
  headers: {
    'Accept': 'application/json',
    ...(OPENSEA_API_KEY && { 'X-API-KEY': OPENSEA_API_KEY })
  },
  timeout: 30000
}

// Warn if API key is missing (only in development)
if (!OPENSEA_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ NEXT_PUBLIC_OPENSEA_API_KEY not configured - OpenSea API calls may be rate limited')
}

// Types
export interface KaijuNFT {
  tokenId: string
  nfcId?: string
  owner: string
  tokenURI: string
  birthDate?: number
  batch?: string
  ipfsData?: {
    name: string
    description: string
    image: string
    attributes: {
      [key: string]: any
    }
  }
}

export interface OpenSeaAsset {
  identifier: string
  name: string
  description: string
  image_url: string
  display_image_url: string
  opensea_url: string
  traits: Array<{
    trait_type: string
    value: any
  }>
  rarity?: {
    rank: number
    score: number
  }
}

class CryptoKaijuApiService {
  /**
   * Fetch IPFS metadata with fallback
   */
  async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    try {
      console.log(`📡 Fetching IPFS metadata: ${tokenURI}`)
      
      const response = await fetch(tokenURI, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      })
      
      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`✅ IPFS metadata loaded: ${data.name || 'Unnamed'}`)
      return data
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`⚠️ IPFS fetch failed: ${errorMessage}`)
      return null
    }
  }

  /**
   * Get OpenSea details for a token
   */
  async getOpenSeaDetails(tokenId: string): Promise<OpenSeaAsset | null> {
    try {
      const response = await axios.get(`${OPENSEA_NFT_ENDPOINT}/${tokenId}`, OPENSEA_CONFIG)
      
      if (response.data?.nft) {
        return {
          identifier: response.data.nft.identifier || tokenId,
          name: response.data.nft.name || '',
          description: response.data.nft.description || '',
          image_url: response.data.nft.image_url || '',
          display_image_url: response.data.nft.display_image_url || '',
          opensea_url: response.data.nft.opensea_url || '',
          traits: response.data.nft.traits || [],
          rarity: response.data.nft.rarity
        }
      }
      
      return null
    } catch (error) {
      console.warn('OpenSea API error:', error)
      return null
    }
  }

  /**
   * Get token details by ID (placeholder - replace with actual blockchain calls)
   */
  async getTokenDetails(chainId: number, tokenId: string): Promise<KaijuNFT | null> {
    // This is a placeholder - you should implement actual blockchain calls here
    console.warn('getTokenDetails not implemented - use BlockchainCryptoKaijuService instead')
    return null
  }

  /**
   * Get NFC details (placeholder)
   */
  async getNfcDetails(chainId: number, nfcId: string): Promise<KaijuNFT | null> {
    console.warn('getNfcDetails not implemented - use BlockchainCryptoKaijuService instead')
    return null
  }

  /**
   * Get tokens for address (placeholder)
   */
  async getTokensForAddress(chainId: number, address: string): Promise<KaijuNFT[]> {
    console.warn('getTokensForAddress not implemented - use BlockchainCryptoKaijuService instead')
    return []
  }

  /**
   * Search tokens (placeholder)
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    console.warn('searchTokens not implemented - use BlockchainCryptoKaijuService instead')
    return []
  }

  /**
   * Get all tokens (placeholder)
   */
  async getAllTokens(): Promise<KaijuNFT[]> {
    console.warn('getAllTokens not implemented - use BlockchainCryptoKaijuService instead')
    return []
  }

  /**
   * Get collection stats (placeholder)
   */
  async getCollectionStats(): Promise<{ totalSupply: number; owners?: number; floorPrice?: number }> {
    console.warn('getCollectionStats not implemented - use BlockchainCryptoKaijuService instead')
    return { totalSupply: 0 }
  }

  /**
   * Test API connectivity and configuration
   */
  async testAPI(): Promise<void> {
    console.log('🧪 Testing OpenSea API connectivity...')
    
    // Check if API key is configured
    if (!OPENSEA_API_KEY) {
      console.warn('⚠️ No OpenSea API key configured - requests may be rate limited')
    }
    
    try {
      // Test 1: Check collection exists
      console.log('📋 Testing collection endpoint...')
      const collectionResponse = await axios.get(OPENSEA_COLLECTION_ENDPOINT, OPENSEA_CONFIG)
      console.log('✅ Collection found:', collectionResponse.data.name)
      
    } catch (error) {
      console.error('❌ API test failed:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error('🔑 API key may be missing or invalid')
        }
        console.error('Status:', error.response?.status)
        console.error('Status Text:', error.response?.statusText)
      }
      throw error
    }
  }
}

// Export both named and default exports for compatibility
export const cryptoKaijuApiService = new CryptoKaijuApiService()
export default cryptoKaijuApiService