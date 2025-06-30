// src/lib/services/CryptoKaijuApiService.ts
import axios from 'axios'

// API endpoints
const API_URL = 'https://dapp.cryptokaiju.io/api'
const OPENSEA_API_URL = 'https://api.opensea.io/api/v2/collections/cryptokaiju/nfts'
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY || 'a221b5fb89fb4ffeb5fbf4fa42cc6532'

// Types
export interface KaijuNFT {
  tokenId: string
  nfcId: string
  owner: string
  tokenURI: string
  birthDate: number
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
  rarity: {
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

const AXIOS_CONFIG = {
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}

const OPENSEA_CONFIG = {
  headers: {
    'X-API-KEY': OPENSEA_API_KEY,
    'Accept': 'application/json'
  }
}

class CryptoKaijuApiService {
  
  /**
   * Get token details by token ID from the legacy API
   */
  async getTokenDetails(network: number = 1, tokenId: string): Promise<KaijuNFT | null> {
    try {
      const response = await axios.get(
        `${API_URL}/network/${network}/token/id/${tokenId}`, 
        AXIOS_CONFIG
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching token details for ID ${tokenId}:`, error)
      return null
    }
  }

  /**
   * Get token details by NFC ID
   */
  async getNfcDetails(network: number = 1, nfcId: string): Promise<KaijuNFT | null> {
    try {
      const response = await axios.get(
        `${API_URL}/network/${network}/token/nfc/${nfcId}`, 
        AXIOS_CONFIG
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching NFC details for ID ${nfcId}:`, error)
      return null
    }
  }

  /**
   * Get all tokens owned by an address
   */
  async getTokensForAddress(network: number = 1, address: string): Promise<KaijuNFT[]> {
    try {
      const response = await axios.get(
        `${API_URL}/network/${network}/token/account/${address}`, 
        AXIOS_CONFIG
      )
      return response.data || []
    } catch (error) {
      console.error(`Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Get all tokens (with pagination)
   */
  async getAllTokens(network: number = 1): Promise<KaijuNFT[]> {
    try {
      const response = await axios.get(
        `${API_URL}/network/${network}/token/all`, 
        AXIOS_CONFIG
      )
      return response.data || []
    } catch (error) {
      console.error('Error fetching all tokens:', error)
      return []
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
   * Get multiple OpenSea assets by owner address
   */
  async getOpenSeaAssetsByOwner(ownerAddress: string, limit: number = 50): Promise<OpenSeaAsset[]> {
    try {
      const response = await axios.get(OPENSEA_API_URL, {
        ...OPENSEA_CONFIG,
        params: {
          owner: ownerAddress,
          limit: limit
        }
      })
      return response.data.nfts || []
    } catch (error) {
      console.error(`Error fetching OpenSea assets for owner ${ownerAddress}:`, error)
      return []
    }
  }

  /**
   * Search tokens by name, token ID, or NFC ID
   */
  async searchTokens(query: string, network: number = 1): Promise<KaijuNFT[]> {
    try {
      const searchQuery = query.toLowerCase().trim()
      
      // First, try direct NFC ID lookup if query looks like an NFC ID (hex format)
      if (/^[0-9a-f]{8,}$/i.test(searchQuery)) {
        console.log('Trying direct NFC lookup for:', searchQuery)
        const nfcResult = await this.getNfcDetails(network, searchQuery)
        if (nfcResult) {
          return [nfcResult]
        }
      }
      
      // If direct lookup fails or query doesn't look like NFC, search all tokens
      const allTokens = await this.getAllTokens(network)
      
      return allTokens.filter(token => {
        // Search by token ID
        if (token.tokenId.toString().includes(searchQuery)) {
          return true
        }
        
        // Search by NFC ID (case insensitive)
        if (token.nfcId.toLowerCase().includes(searchQuery)) {
          return true
        }
        
        // Search by name in IPFS data
        if (token.ipfsData?.name?.toLowerCase().includes(searchQuery)) {
          return true
        }
        
        // Search by attributes
        if (token.ipfsData?.attributes) {
          const attributes = token.ipfsData.attributes
          return Object.values(attributes).some(value => 
            value?.toString().toLowerCase().includes(searchQuery)
          )
        }
        
        return false
      })
    } catch (error) {
      console.error('Error searching tokens:', error)
      return []
    }
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    try {
      const response = await axios.get(`https://cryptokaiju.mypinata.cloud/ipfs/${tokenURI}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching IPFS metadata for ${tokenURI}:`, error)
      return null
    }
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<{totalSupply: number, owners: number}> {
    try {
      // This would typically come from your backend or OpenSea
      const allTokens = await this.getAllTokens()
      const uniqueOwners = new Set(allTokens.map(token => token.owner)).size
      
      return {
        totalSupply: allTokens.length,
        owners: uniqueOwners
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error)
      return { totalSupply: 0, owners: 0 }
    }
  }
}

export default new CryptoKaijuApiService()