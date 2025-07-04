// src/lib/services/BlockchainCryptoKaijuService.ts - FIXED VERSION
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'
import axios from 'axios'

// Complete Kaiju NFT ABI
const KAIJU_NFT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "nfcIdOf",
    "outputs": [{"name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_nfcId", "type": "bytes32"}],
    "name": "tokenOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "tokenDetails",
    "outputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "nfcId", "type": "bytes32"},
      {"name": "tokenUri", "type": "string"},
      {"name": "dob", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_nfcId", "type": "bytes32"}],
    "name": "nfcDetails",
    "outputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "nfcId", "type": "bytes32"},
      {"name": "tokenUri", "type": "string"},
      {"name": "dob", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "tokensOf",
    "outputs": [{"name": "_tokenIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

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

class BlockchainCryptoKaijuService {
  private contract: any

  constructor() {
    this.contract = getContract({
      client: thirdwebClient,
      chain: ethereum,
      address: KAIJU_NFT_ADDRESS,
      abi: KAIJU_NFT_ABI,
    })
  }

  /**
   * Convert NFC hex string to bytes32 format (for contract calls)
   */
  private nfcToBytes32(nfcHex: string): string {
    console.log(`🔄 Converting NFC "${nfcHex}" to bytes32...`)
    
    const cleanHex = nfcHex.replace(/^0x/, '').toUpperCase().trim()
    console.log(`   Clean hex: "${cleanHex}"`)
    
    let asciiHex = ''
    for (let i = 0; i < cleanHex.length; i++) {
      const char = cleanHex[i]
      const asciiCode = char.charCodeAt(0)
      const hexCode = asciiCode.toString(16).padStart(2, '0')
      asciiHex += hexCode
    }
    
    const paddedHex = asciiHex.padEnd(64, '0')
    const result = `0x${paddedHex}`
    
    console.log(`   Final bytes32: ${result}`)
    return result
  }

  /**
   * Convert bytes32 to readable NFC hex string
   */
  private bytes32ToNFC(bytes32: string): string {
    if (!bytes32 || bytes32 === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return ''
    }
    
    const hex = bytes32.replace(/^0x/, '')
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break
      const charCode = parseInt(hexPair, 16)
      if (charCode > 0) {
        result += String.fromCharCode(charCode)
      }
    }
    
    return result
  }

  /**
   * Improved IPFS URL formation
   */
  private formatIPFSUrl(tokenURI: string): string {
    if (!tokenURI) return ''
    
    console.log(`🔗 Formatting IPFS URL from: "${tokenURI}"`)
    
    // If it's already a full HTTP URL, return as-is
    if (tokenURI.startsWith('https://') || tokenURI.startsWith('http://')) {
      console.log(`   Already HTTP URL: ${tokenURI}`)
      return tokenURI
    }
    
    // If it starts with ipfs://, replace with gateway
    if (tokenURI.startsWith('ipfs://')) {
      const hash = tokenURI.replace('ipfs://', '')
      const url = `https://cryptokaiju.mypinata.cloud/ipfs/${hash}`
      console.log(`   Converted IPFS protocol to gateway: ${url}`)
      return url
    }
    
    // If it looks like just a hash, prepend gateway
    if (tokenURI.match(/^[a-zA-Z0-9]{46,}$/)) {
      const url = `https://cryptokaiju.mypinata.cloud/ipfs/${tokenURI}`
      console.log(`   Treated as hash, added gateway: ${url}`)
      return url
    }
    
    // Otherwise assume it's a path and add to gateway
    const url = `https://cryptokaiju.mypinata.cloud/ipfs/${tokenURI}`
    console.log(`   Default gateway formatting: ${url}`)
    return url
  }

  /**
   * Get Kaiju details by Token ID (ENHANCED with better error handling)
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🔍 Looking up Token ID ${tokenId} on blockchain...`)

      // Get token details from contract - FIXED: use tokenURI method primarily
      const [tokenDetails, owner, standardTokenURI] = await Promise.all([
        readContract({
          contract: this.contract,
          method: "tokenDetails",
          params: [BigInt(tokenId)]
        }),
        readContract({
          contract: this.contract,
          method: "ownerOf", 
          params: [BigInt(tokenId)]
        }),
        readContract({
          contract: this.contract,
          method: "tokenURI",
          params: [BigInt(tokenId)]
        })
      ])

      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetails
      const nfcId = this.bytes32ToNFC(nfcIdBytes32)

      console.log(`✅ Found on chain: Token ${tokenId}, NFC: ${nfcId}, Owner: ${owner}`)
      console.log(`📝 Token URIs - tokenDetails: "${tokenDetailsURI}", tokenURI: "${standardTokenURI}"`)

      // Use the standard tokenURI method as primary source
      const tokenURI = (standardTokenURI as string) || (tokenDetailsURI as string)
      console.log(`🎯 Using token URI: "${tokenURI}"`)

      const kaiju: KaijuNFT = {
        tokenId: contractTokenId.toString(),
        nfcId,
        owner: owner as string,
        tokenURI: tokenURI,
        birthDate: Number(birthDate)
      }

      // Fetch IPFS metadata with improved error handling
      if (tokenURI) {
        console.log(`📡 Fetching IPFS metadata...`)
        try {
          const metadata = await this.fetchIpfsMetadata(tokenURI)
          if (metadata) {
            kaiju.ipfsData = metadata
            console.log(`✅ IPFS metadata loaded: "${metadata.name || 'Unnamed'}"`)
          } else {
            console.warn('⚠️ IPFS metadata was null')
          }
        } catch (metadataError) {
          console.error('❌ IPFS metadata fetch failed:', metadataError)
        }
      } else {
        console.warn('⚠️ No token URI available for IPFS metadata')
      }

      // Fetch OpenSea data with improved error handling  
      console.log(`🌊 Fetching OpenSea data...`)
      let openSeaData = null
      try {
        openSeaData = await this.getOpenSeaData(tokenId)
        if (openSeaData) {
          console.log(`✅ OpenSea data loaded: "${openSeaData.name || 'Unnamed'}"`)
        } else {
          console.warn('⚠️ OpenSea data was null')
        }
      } catch (osError) {
        console.error('❌ OpenSea fetch failed:', osError)
      }

      return { nft: kaiju, openSeaData }

    } catch (error) {
      console.error(`❌ Error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get Kaiju details by NFC ID
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🏷️ Looking up NFC ID ${nfcId} on blockchain...`)

      const nfcBytes32 = this.nfcToBytes32(nfcId)
      
      // Try direct tokenOf method first
      try {
        const directTokenId = await readContract({
          contract: this.contract,
          method: "tokenOf",
          params: [nfcBytes32]
        })
        
        if (Number(directTokenId) > 0) {
          console.log(`✅ Found via tokenOf: NFC ${nfcId} -> Token ${directTokenId}`)
          return await this.getByTokenId(directTokenId.toString())
        }
      } catch (tokenOfError) {
        console.log(`⚠️ tokenOf method failed, trying nfcDetails...`)
      }
      
      // Fall back to nfcDetails method
      const nfcDetails = await readContract({
        contract: this.contract,
        method: "nfcDetails",
        params: [nfcBytes32]
      })

      const [tokenId, returnedNfcId, ipfsHash, birthDate] = nfcDetails
      
      if (Number(tokenId) === 0) {
        console.log(`❌ NFC ID ${nfcId} not found on blockchain`)
        return { nft: null, openSeaData: null }
      }

      console.log(`✅ Found via nfcDetails: NFC ${nfcId} -> Token ${tokenId}`)
      return await this.getByTokenId(tokenId.toString())

    } catch (error) {
      console.error(`❌ Error fetching NFC ID ${nfcId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get all tokens owned by an address
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    try {
      console.log(`👤 Fetching tokens for address: ${address}`)

      const tokenIds = await readContract({
        contract: this.contract,
        method: "tokensOf",
        params: [address]
      }) as bigint[]

      console.log(`📦 Found ${tokenIds.length} tokens for address`)

      const batchSize = 10
      const kaijus: KaijuNFT[] = []

      for (let i = 0; i < tokenIds.length; i += batchSize) {
        const batch = tokenIds.slice(i, i + batchSize)
        
        const batchResults = await Promise.all(
          batch.map(async (tokenId) => {
            try {
              const result = await this.getByTokenId(tokenId.toString())
              return result.nft
            } catch (error) {
              console.warn(`⚠️ Failed to fetch token ${tokenId}:`, error)
              return null
            }
          })
        )

        const validResults = batchResults.filter(Boolean) as KaijuNFT[]
        kaijus.push(...validResults)

        if (i + batchSize < tokenIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`✅ Successfully fetched ${kaijus.length} tokens with metadata`)
      return kaijus

    } catch (error) {
      console.error(`❌ Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Search for tokens
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    const searchQuery = query.toLowerCase().trim()
    
    if (/^\d+$/.test(searchQuery)) {
      console.log(`🔢 Searching by Token ID: ${searchQuery}`)
      const result = await this.getByTokenId(searchQuery)
      return result.nft ? [result.nft] : []
    }
    
    if (/^[0-9a-f]{8,}$/i.test(searchQuery)) {
      console.log(`🏷️ Searching by NFC ID: ${searchQuery}`)
      const result = await this.getByNFCId(searchQuery)
      return result.nft ? [result.nft] : []
    }

    console.log(`❌ Name search not supported with blockchain-only approach`)
    return []
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<{ totalSupply: number; owners?: number }> {
    try {
      const totalSupply = await readContract({
        contract: this.contract,
        method: "totalSupply",
        params: []
      })

      return {
        totalSupply: Number(totalSupply)
      }
    } catch (error) {
      console.error('❌ Error fetching collection stats:', error)
      return { totalSupply: 0 }
    }
  }

  /**
   * ENHANCED: Fetch metadata from IPFS with better error handling and multiple attempts
   */
  private async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    const maxRetries = 3
    const timeout = 10000 // Increased timeout to 10 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const ipfsUrl = this.formatIPFSUrl(tokenURI)
        console.log(`📡 Attempt ${attempt}/${maxRetries}: Fetching IPFS metadata from: ${ipfsUrl}`)
        
        const response = await axios.get(ipfsUrl, { 
          timeout,
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'CryptoKaiju-App/1.0'
          }
        })
        
        console.log(`✅ IPFS fetch successful on attempt ${attempt}`)
        return response.data
        
      } catch (error) {
        console.warn(`⚠️ IPFS fetch attempt ${attempt} failed:`, error.message)
        
        if (attempt === maxRetries) {
          console.error(`❌ All IPFS fetch attempts failed for: ${tokenURI}`)
          // Try alternative gateway as last resort
          try {
            const hash = tokenURI.replace(/^(ipfs:\/\/|https?:\/\/[^\/]+\/ipfs\/)/, '')
            const altUrl = `https://ipfs.io/ipfs/${hash}`
            console.log(`🔄 Trying alternative gateway: ${altUrl}`)
            
            const response = await axios.get(altUrl, { 
              timeout: 8000,
              headers: { 'Accept': 'application/json' }
            })
            console.log(`✅ Alternative gateway successful`)
            return response.data
          } catch (altError) {
            console.error(`❌ Alternative gateway also failed:`, altError.message)
          }
          
          return null
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    
    return null
  }

  /**
   * ENHANCED: Get OpenSea data with better error handling and correct URL formation
   */
  private async getOpenSeaData(tokenId: string): Promise<OpenSeaAsset | null> {
    try {
      const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
      console.log(`🌊 Fetching OpenSea data from: ${url}`)
      
      const response = await axios.get(url, {
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY || 'a221b5fb89fb4ffeb5fbf4fa42cc6532',
          'Accept': 'application/json',
          'User-Agent': 'CryptoKaiju-App/1.0'
        },
        timeout: 10000
      })
      
      console.log(`✅ OpenSea API response status: ${response.status}`)
      
      if (response.data && response.data.nft) {
        const nft = response.data.nft
        
        // Construct the OpenSea URL since it might not be in the response
        const openSeaUrl = nft.opensea_url || `https://opensea.io/assets/ethereum/${KAIJU_NFT_ADDRESS}/${tokenId}`
        
        const asset: OpenSeaAsset = {
          identifier: nft.identifier || tokenId,
          name: nft.name || '',
          description: nft.description || '',
          image_url: nft.image_url || '',
          display_image_url: nft.display_image_url || nft.image_url || '',
          opensea_url: openSeaUrl,
          traits: nft.traits || [],
          rarity: nft.rarity
        }
        
        console.log(`✅ OpenSea data parsed successfully for "${asset.name}"`)
        return asset
      } else {
        console.warn('⚠️ OpenSea response missing nft data')
        return null
      }
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ OpenSea API error:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
      } else {
        console.error(`❌ OpenSea fetch error:`, error)
      }
      return null
    }
  }

  /**
   * Find known NFC IDs for testing
   */
  async findKnownNFCs(maxTokens: number = 10): Promise<Array<{tokenId: string, nfcId: string}>> {
    console.log(`🔍 Scanning first ${maxTokens} tokens for NFC IDs...`)
    const knownNFCs: Array<{tokenId: string, nfcId: string}> = []
    
    try {
      for (let tokenId = 0; tokenId < maxTokens; tokenId++) {
        try {
          const nfcIdBytes32 = await readContract({
            contract: this.contract,
            method: "nfcIdOf",
            params: [BigInt(tokenId)]
          })
          
          const nfcId = this.bytes32ToNFC(nfcIdBytes32)
          if (nfcId) {
            console.log(`✅ Token ${tokenId} has NFC ID: ${nfcId}`)
            knownNFCs.push({ tokenId: tokenId.toString(), nfcId })
          }
        } catch (error) {
          // Token doesn't exist or has no NFC
        }
      }
      
      console.log(`🎯 Found ${knownNFCs.length} tokens with NFC IDs`)
      return knownNFCs
      
    } catch (error) {
      console.error('❌ Error scanning for NFC IDs:', error)
      return []
    }
  }

  /**
   * Test the blockchain service
   */
  async testService(): Promise<void> {
    console.log('🧪 Testing Enhanced Blockchain CryptoKaiju Service...')
    
    try {
      const stats = await this.getCollectionStats()
      console.log(`✅ Total supply: ${stats.totalSupply}`)
      
      // Test a specific token that should exist
      console.log('🧪 Testing Token ID 1503 (from your search)...')
      const tokenResult = await this.getByTokenId('1503')
      if (tokenResult.nft) {
        console.log(`✅ Token 1503 found:`, {
          name: tokenResult.nft.ipfsData?.name,
          nfcId: tokenResult.nft.nfcId,
          hasOpenSeaData: !!tokenResult.openSeaData
        })
      } else {
        console.log('❌ Token 1503 not found')
      }
      
      console.log('🎉 Blockchain service test completed!')
      
    } catch (error) {
      console.error('❌ Blockchain service test failed:', error)
      throw error
    }
  }
}

export default new BlockchainCryptoKaijuService()