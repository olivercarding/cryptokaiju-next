// src/lib/services/BlockchainCryptoKaijuService.ts - ENHANCED VERSION
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
   * ENHANCED: Better debugging and validation
   */
  private nfcToBytes32(nfcHex: string): string {
    console.log(`🔄 Converting NFC "${nfcHex}" to bytes32...`)
    
    // Remove 0x prefix if present and normalize
    const cleanHex = nfcHex.replace(/^0x/, '').toUpperCase().trim()
    console.log(`   Clean hex: "${cleanHex}"`)
    
    // Validate hex format
    if (!/^[0-9A-F]+$/.test(cleanHex)) {
      console.warn(`⚠️ Invalid hex format: ${cleanHex}`)
    }
    
    // Convert to ASCII bytes (each character becomes its ASCII code in hex)
    let asciiHex = ''
    for (let i = 0; i < cleanHex.length; i++) {
      const char = cleanHex[i]
      const asciiCode = char.charCodeAt(0)
      const hexCode = asciiCode.toString(16).padStart(2, '0')
      asciiHex += hexCode
      console.log(`   "${char}" -> ASCII ${asciiCode} -> hex ${hexCode}`)
    }
    
    // Pad to 64 characters (32 bytes)
    const paddedHex = asciiHex.padEnd(64, '0')
    const result = `0x${paddedHex}`
    
    console.log(`   ASCII hex: ${asciiHex}`)
    console.log(`   Padded: ${paddedHex}`)
    console.log(`   Final bytes32: ${result}`)
    
    return result
  }

  /**
   * Convert bytes32 to readable NFC hex string
   * ENHANCED: Better debugging
   */
  private bytes32ToNFC(bytes32: string): string {
    console.log(`🔄 Converting bytes32 "${bytes32}" to NFC...`)
    
    if (!bytes32 || bytes32 === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log(`   Empty/null bytes32`)
      return ''
    }
    
    // Remove 0x prefix
    const hex = bytes32.replace(/^0x/, '')
    console.log(`   Hex without prefix: ${hex}`)
    
    // Convert from ASCII hex back to readable string
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break // Stop at null padding
      const charCode = parseInt(hexPair, 16)
      if (charCode > 0) {
        const char = String.fromCharCode(charCode)
        result += char
        console.log(`   ${hexPair} -> ASCII ${charCode} -> "${char}"`)
      }
    }
    
    console.log(`   Final NFC: "${result}"`)
    return result
  }

  /**
   * ENHANCED: Find known NFC IDs for testing
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
          } else {
            console.log(`   Token ${tokenId}: no NFC ID`)
          }
        } catch (error) {
          console.log(`   Token ${tokenId}: error or doesn't exist`)
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
   * Get Kaiju details by Token ID (FAST - direct blockchain call)
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🔍 Looking up Token ID ${tokenId} on blockchain...`)

      // Get token details from contract
      const [tokenDetails, owner, tokenURI] = await Promise.all([
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

      const [contractTokenId, nfcIdBytes32, ipfsHash, birthDate] = tokenDetails
      const nfcId = this.bytes32ToNFC(nfcIdBytes32)

      console.log(`✅ Found on chain: Token ${tokenId}, NFC: ${nfcId}, Owner: ${owner}`)

      const kaiju: KaijuNFT = {
        tokenId: contractTokenId.toString(),
        nfcId,
        owner: owner as string,
        tokenURI: ipfsHash as string,
        birthDate: Number(birthDate)
      }

      // Fetch IPFS metadata if available
      if (kaiju.tokenURI) {
        try {
          const metadata = await this.fetchIpfsMetadata(kaiju.tokenURI)
          if (metadata) {
            kaiju.ipfsData = metadata
          }
        } catch (metadataError) {
          console.warn('⚠️ Failed to fetch IPFS metadata:', metadataError)
        }
      }

      // Optionally fetch OpenSea data (for rarity, etc.)
      let openSeaData = null
      try {
        openSeaData = await this.getOpenSeaData(tokenId)
      } catch (osError) {
        console.warn('⚠️ Failed to fetch OpenSea data:', osError)
      }

      return { nft: kaiju, openSeaData }

    } catch (error) {
      console.error(`❌ Error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get Kaiju details by NFC ID (ENHANCED with debugging)
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🏷️ Looking up NFC ID ${nfcId} on blockchain...`)

      // Convert NFC ID to bytes32 format
      const nfcBytes32 = this.nfcToBytes32(nfcId)
      console.log(`   Converted to bytes32: ${nfcBytes32}`)
      
      // ENHANCED: First try direct tokenOf method
      console.log(`   Trying tokenOf method...`)
      try {
        const directTokenId = await readContract({
          contract: this.contract,
          method: "tokenOf",
          params: [nfcBytes32]
        })
        
        console.log(`   tokenOf returned: ${directTokenId}`)
        
        if (Number(directTokenId) > 0) {
          console.log(`✅ Found via tokenOf: NFC ${nfcId} -> Token ${directTokenId}`)
          return await this.getByTokenId(directTokenId.toString())
        }
      } catch (tokenOfError) {
        console.log(`   tokenOf failed:`, tokenOfError)
      }
      
      // ENHANCED: Fall back to nfcDetails method
      console.log(`   Trying nfcDetails method...`)
      const nfcDetails = await readContract({
        contract: this.contract,
        method: "nfcDetails",
        params: [nfcBytes32]
      })

      const [tokenId, returnedNfcId, ipfsHash, birthDate] = nfcDetails
      console.log(`   nfcDetails returned: tokenId=${tokenId}, returnedNfcId=${returnedNfcId}`)
      
      // Check if token exists (tokenId will be 0 if not found)
      if (Number(tokenId) === 0) {
        console.log(`❌ NFC ID ${nfcId} not found on blockchain (tokenId = 0)`)
        
        // ENHANCED: Suggest checking known NFC IDs
        console.log(`💡 Run findKnownNFCs() to see available NFC IDs`)
        return { nft: null, openSeaData: null }
      }

      console.log(`✅ Found on chain: NFC ${nfcId} -> Token ${tokenId}`)

      // Get owner
      const owner = await readContract({
        contract: this.contract,
        method: "ownerOf",
        params: [tokenId]
      })

      const kaiju: KaijuNFT = {
        tokenId: tokenId.toString(),
        nfcId: this.bytes32ToNFC(returnedNfcId),
        owner: owner as string,
        tokenURI: ipfsHash as string,
        birthDate: Number(birthDate)
      }

      // Fetch IPFS metadata if available
      if (kaiju.tokenURI) {
        try {
          const metadata = await this.fetchIpfsMetadata(kaiju.tokenURI)
          if (metadata) {
            kaiju.ipfsData = metadata
          }
        } catch (metadataError) {
          console.warn('⚠️ Failed to fetch IPFS metadata:', metadataError)
        }
      }

      // Optionally fetch OpenSea data
      let openSeaData = null
      try {
        openSeaData = await this.getOpenSeaData(tokenId.toString())
      } catch (osError) {
        console.warn('⚠️ Failed to fetch OpenSea data:', osError)
      }

      return { nft: kaiju, openSeaData }

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

      // Get token IDs owned by address
      const tokenIds = await readContract({
        contract: this.contract,
        method: "tokensOf",
        params: [address]
      }) as bigint[]

      console.log(`📦 Found ${tokenIds.length} tokens for address`)

      // Fetch details for each token (in batches to avoid overwhelming)
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

        // Small delay between batches
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
   * Search for tokens by name or token ID (simple version)
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    const searchQuery = query.toLowerCase().trim()
    
    // If query is numeric, try direct token ID lookup
    if (/^\d+$/.test(searchQuery)) {
      console.log(`🔢 Searching by Token ID: ${searchQuery}`)
      const result = await this.getByTokenId(searchQuery)
      return result.nft ? [result.nft] : []
    }
    
    // If query looks like hex (NFC ID), try NFC lookup
    if (/^[0-9a-f]{8,}$/i.test(searchQuery)) {
      console.log(`🏷️ Searching by NFC ID: ${searchQuery}`)
      const result = await this.getByNFCId(searchQuery)
      return result.nft ? [result.nft] : []
    }

    // For name searches, we'd need to implement a different approach
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
   * Fetch metadata from IPFS (reusable utility)
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
   * Get OpenSea data (optional, for enhanced info)
   */
  private async getOpenSeaData(tokenId: string): Promise<OpenSeaAsset | null> {
    try {
      const response = await axios.get(
        `https://api.opensea.io/api/v2/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`,
        {
          headers: {
            'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY || 'a221b5fb89fb4ffeb5fbf4fa42cc6532',
            'Accept': 'application/json'
          },
          timeout: 5000
        }
      )
      return response.data.nft
    } catch (error) {
      // OpenSea is optional, so don't throw
      return null
    }
  }

  /**
   * ENHANCED Test the blockchain service with NFC discovery
   */
  async testService(): Promise<void> {
    console.log('🧪 Testing Enhanced Blockchain CryptoKaiju Service...')
    
    try {
      // Test 1: Get total supply
      console.log('📊 Testing total supply...')
      const stats = await this.getCollectionStats()
      console.log(`✅ Total supply: ${stats.totalSupply}`)
      
      // Test 2: Find some known NFC IDs
      console.log('🔍 Finding known NFC IDs...')
      const knownNFCs = await this.findKnownNFCs(5)
      
      if (knownNFCs.length > 0) {
        console.log(`✅ Found ${knownNFCs.length} tokens with NFC IDs:`)
        knownNFCs.forEach(({tokenId, nfcId}) => {
          console.log(`   Token ${tokenId}: ${nfcId}`)
        })
        
        // Test 3: Test NFC lookup with a known good NFC ID
        const testNFC = knownNFCs[0]
        console.log(`🧪 Testing NFC lookup with known good NFC: ${testNFC.nfcId}`)
        
        const nfcResult = await this.getByNFCId(testNFC.nfcId)
        if (nfcResult.nft && nfcResult.nft.tokenId === testNFC.tokenId) {
          console.log('✅ NFC lookup test PASSED!')
        } else {
          console.log('❌ NFC lookup test FAILED!')
        }
      } else {
        console.log('⚠️ No NFC IDs found in first 5 tokens')
        
        // Test with a random token
        console.log('🎲 Testing with Token ID 1...')
        const tokenResult = await this.getByTokenId('1')
        if (tokenResult.nft) {
          console.log(`✅ Token #1 found:`, tokenResult.nft.ipfsData?.name || 'Unnamed')
        } else {
          console.log('❌ Token #1 not found')
        }
      }
      
      console.log('🎉 Enhanced blockchain service test completed!')
      
    } catch (error) {
      console.error('❌ Enhanced blockchain service test failed:', error)
      throw error
    }
  }
}

export default new BlockchainCryptoKaijuService()