// src/lib/services/SimplifiedCryptoKaijuApi.ts
import axios from 'axios'
import NFCMappingService from './NFCMappingService'

// OpenSea API configuration
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0'
const OPENSEA_NFT_ENDPOINT = `${OPENSEA_BASE_URL}/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts`
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY || 'a221b5fb89fb4ffeb5fbf4fa42cc6532'

const OPENSEA_CONFIG = {
  headers: {
    'X-API-KEY': OPENSEA_API_KEY,
    'Accept': 'application/json'
  },
  timeout: 15000
}

// Simplified types - only what we need for individual NFT lookup
export interface KaijuNFT {
  tokenId: string
  nfcId?: string
  owner?: string
  tokenURI?: string
  birthDate?: number
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
  owners: Array<{
    address: string
    quantity: number
  }>
}

class SimplifiedCryptoKaijuApi {
  /**
   * Get NFT details by token ID (fast and reliable)
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🔍 Looking up Token ID: ${tokenId}`)
      
      const response = await axios.get(`${OPENSEA_NFT_ENDPOINT}/${tokenId}`, OPENSEA_CONFIG)
      const openSeaData = response.data.nft
      
      if (!openSeaData) {
        console.log('❌ NFT not found on OpenSea')
        return { nft: null, openSeaData: null }
      }

      // Convert to our format
      const nft: KaijuNFT = {
        tokenId: openSeaData.identifier,
        owner: openSeaData.owners?.[0]?.address || '',
        tokenURI: this.extractIPFSHash(openSeaData.metadata_url) || '',
        nfcId: this.extractNFCFromTraits(openSeaData.traits)
      }

      // Fetch IPFS metadata if available
      if (nft.tokenURI) {
        try {
          const metadata = await this.fetchIpfsMetadata(nft.tokenURI)
          if (metadata) {
            nft.ipfsData = metadata
            
            // Try to get NFC from metadata if not in traits
            if (!nft.nfcId) {
              nft.nfcId = this.extractNFCFromMetadata(metadata)
            }
            
            // Parse birthday if available
            if (metadata.attributes?.dob) {
              const birthday = Date.parse(metadata.attributes.dob)
              if (!isNaN(birthday)) {
                nft.birthDate = Math.floor(birthday / 1000)
              }
            }
          }
        } catch (metadataError) {
          console.warn('⚠️ Failed to fetch IPFS metadata:', metadataError)
        }
      }

      console.log(`✅ Successfully found Token ID ${tokenId}:`, nft.ipfsData?.name || 'Unnamed')
      return { nft, openSeaData }
      
    } catch (error) {
      console.error(`❌ Error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Search for NFT by NFC ID using the mapping service (much faster!)
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🏷️ Looking up NFC ID: ${nfcId}`)
      
      // Use the mapping service to find the token ID
      const tokenId = await NFCMappingService.getTokenIdByNFC(nfcId)
      
      if (!tokenId) {
        console.log(`❌ NFC ID ${nfcId} not found`)
        return { nft: null, openSeaData: null }
      }
      
      // Now fetch the NFT details using the token ID
      console.log(`🎯 Found Token ID ${tokenId} for NFC ${nfcId}, fetching details...`)
      return await this.getByTokenId(tokenId)
      
    } catch (error) {
      console.error(`❌ Error searching for NFC ID ${nfcId}:`, error)
      return { nft: null, openSeaData: null }
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
    
    // Check attributes array
    if (Array.isArray(metadata.attributes)) {
      const nfcAttr = metadata.attributes.find((attr: any) => 
        attr.trait_type?.toLowerCase().includes('nfc')
      )
      if (nfcAttr?.value) return String(nfcAttr.value).trim()
    }
    
    return null
  }

  /**
   * Extract IPFS hash from metadata URL
   */
  private extractIPFSHash(metadataUrl: string): string | null {
    if (!metadataUrl) return null
    
    if (metadataUrl.startsWith('ipfs://')) {
      return metadataUrl.replace('ipfs://', '')
    }
    
    if (metadataUrl.includes('/ipfs/')) {
      const parts = metadataUrl.split('/ipfs/')
      return parts[1]?.split('/')[0]
    }
    
    if (metadataUrl.match(/^[a-zA-Z0-9]{46,}$/)) {
      return metadataUrl
    }
    
    return null
  }

  /**
   * Fetch metadata from IPFS
   */
  private async fetchIpfsMetadata(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://cryptokaiju.mypinata.cloud/ipfs/${ipfsHash}`,
        { 
          timeout: 5000,
          headers: { 'Accept': 'application/json' }
        }
      )
      return response.data
    } catch (error) {
      console.warn(`⚠️ Failed to fetch IPFS metadata for ${ipfsHash}`)
      return null
    }
  }

  /**
   * Test the API service
   */
  async testAPI(): Promise<void> {
    console.log('🧪 Testing Simplified API...')
    
    try {
      // Test token lookup
      console.log('📋 Testing Token ID lookup...')
      const tokenResult = await this.getByTokenId('1')
      if (tokenResult.nft) {
        console.log('✅ Token lookup successful:', tokenResult.nft.ipfsData?.name)
        
        // If this NFT has an NFC ID, test NFC lookup too
        if (tokenResult.nft.nfcId) {
          console.log('🏷️ Testing NFC lookup with found NFC ID:', tokenResult.nft.nfcId)
          const nfcResult = await this.getByNFCId(tokenResult.nft.nfcId)
          if (nfcResult.nft) {
            console.log('✅ NFC lookup successful')
          } else {
            console.log('❌ NFC lookup failed')
          }
        }
      } else {
        console.log('❌ Token lookup failed')
      }
      
      console.log('🎉 API test completed!')
      
    } catch (error) {
      console.error('❌ API test failed:', error)
      throw error
    }
  }

  /**
   * Helper method to add an NFC mapping (for when you discover new ones)
   */
  addNFCMapping(nfcId: string, tokenId: string): void {
    NFCMappingService.addToCache(nfcId, tokenId)
    console.log(`📝 Added NFC mapping: ${nfcId} -> ${tokenId}`)
  }

  /**
   * Build NFC mapping file (run this occasionally to update your static mapping)
   */
  async buildNFCMappingFile(maxNFTs: number = 1000): Promise<any> {
    console.log('🏗️ Building NFC mapping file...')
    return await NFCMappingService.buildMappingFile(maxNFTs)
  }
}

export default new SimplifiedCryptoKaijuApi()