// src/lib/services/BlockchainCryptoKaijuService.ts - COMPLETE FIXED VERSION
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'
import axios from 'axios'

// Complete CryptoKaiju NFT Contract ABI
export const KAIJU_NFT_ABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenDetails",
    "outputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "bytes32", "name": "nfcId", "type": "bytes32"},
      {"internalType": "string", "name": "tokenURI", "type": "string"},
      {"internalType": "uint256", "name": "birthDate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "nfcId", "type": "bytes32"}],
    "name": "nfcDetails",
    "outputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "bytes32", "name": "nfcId", "type": "bytes32"},
      {"internalType": "string", "name": "tokenUri", "type": "string"},
      {"internalType": "uint256", "name": "dob", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "index", "type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Types
export interface KaijuNFT {
  tokenId: string
  nfcId?: string
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

export interface CollectionStats {
  totalSupply: number
  owners?: number
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
   * Convert human-readable NFC ID to bytes32 format for contract calls
   * Example: "047923BA4E6E80" -> "0x3034313233383441453236323830000000000000000000000000000000000000"
   */
  private nfcToBytes32(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    // Remove any 0x prefix and ensure uppercase
    const cleanNfc = nfcId.replace(/^0x/, '').toUpperCase()
    
    console.log(`🔄 Converting NFC "${cleanNfc}" to bytes32...`)
    
    // Convert each character to its ASCII hex representation
    let asciiHex = ''
    for (let i = 0; i < cleanNfc.length; i++) {
      const char = cleanNfc[i]
      const asciiCode = char.charCodeAt(0)
      const hexCode = asciiCode.toString(16).padStart(2, '0')
      asciiHex += hexCode
      console.log(`  "${char}" -> ASCII ${asciiCode} -> hex ${hexCode}`)
    }
    
    // Pad to 64 characters (32 bytes) with zeros
    const paddedHex = asciiHex.padEnd(64, '0')
    const bytes32 = '0x' + paddedHex
    
    console.log(`✅ Final bytes32: ${bytes32}`)
    return bytes32
  }

  /**
   * Convert bytes32 to readable NFC hex string
   */
  private bytes32ToNFC(bytes32: string): string {
    if (!bytes32 || bytes32 === '0'.repeat(64)) return ''
    
    const hex = bytes32.replace(/^0x/, '')
    
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break // Stop at null bytes
      const charCode = parseInt(hexPair, 16)
      if (charCode > 0) {
        result += String.fromCharCode(charCode)
      }
    }
    
    return result
  }

  /**
   * Fetch IPFS metadata via our Next.js proxy with timeout
   */
  private async fetchIpfsMetadata(tokenURI: string, timeoutMs: number = 8000): Promise<any> {
    try {
      console.log(`📡 Fetching IPFS metadata via proxy for: ${tokenURI}`)
      
      // Extract IPFS hash from various URI formats
      let ipfsHash = ''
      if (tokenURI.startsWith('ipfs://')) {
        ipfsHash = tokenURI.replace('ipfs://', '')
      } else if (tokenURI.includes('/ipfs/')) {
        ipfsHash = tokenURI.split('/ipfs/')[1]
      } else {
        ipfsHash = tokenURI
      }
      
      // Use our Next.js API proxy with timeout
      const proxyUrl = `/api/ipfs/${ipfsHash}`
      console.log(`🔄 Using proxy URL: ${proxyUrl} (timeout: ${timeoutMs}ms)`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Proxy returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`✅ IPFS metadata fetched successfully via proxy`)
      return data
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`⏰ IPFS proxy fetch timed out after ${timeoutMs}ms`)
      } else {
        console.error(`❌ IPFS proxy fetch failed:`, error)
      }
      return null
    }
  }

  /**
   * Get OpenSea data with fallback and timeout
   * Uses OpenSea API endpoint: https://api.opensea.io/api/v2/chain/ethereum/contract/{address}/nfts/{tokenId}
   * Direct OpenSea link format: https://opensea.io/assets/ethereum/{address}/{tokenId}
   */
  private async getOpenSeaData(tokenId: string, timeoutMs: number = 10000): Promise<OpenSeaAsset | null> {
    try {
      const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
      console.log(`🌊 Fetching OpenSea data from: ${url} (timeout: ${timeoutMs}ms)`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(process.env.NEXT_PUBLIC_OPENSEA_API_KEY && {
            'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY
          })
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.status === 401) {
        console.warn(`⚠️ OpenSea API unauthorized (401) - API key may be invalid or missing`)
        return this.createFallbackOpenSeaData(tokenId)
      }
      
      if (!response.ok) {
        console.warn(`⚠️ OpenSea API returned ${response.status}, creating fallback data`)
        return this.createFallbackOpenSeaData(tokenId)
      }
      
      const data = await response.json()
      if (data?.nft) {
        const nft = data.nft
        console.log(`✅ OpenSea data fetched successfully: ${nft.name || 'Unnamed'}`)
        return {
          identifier: nft.identifier || tokenId,
          name: nft.name || '',
          description: nft.description || '',
          image_url: nft.image_url || '',
          display_image_url: nft.display_image_url || nft.image_url || '',
          opensea_url: nft.opensea_url || `https://opensea.io/assets/ethereum/${KAIJU_NFT_ADDRESS}/${tokenId}`,
          traits: nft.traits || [],
          rarity: nft.rarity
        }
      }
      
      return this.createFallbackOpenSeaData(tokenId)
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`⏰ OpenSea fetch timed out after ${timeoutMs}ms, using fallback`)
      } else {
        console.warn(`⚠️ OpenSea fetch failed, using fallback:`, error.message)
      }
      return this.createFallbackOpenSeaData(tokenId)
    }
  }

  /**
   * Create fallback OpenSea data when API fails
   * Uses the correct OpenSea URL format: https://opensea.io/assets/ethereum/{contract}/{tokenId}
   */
  private createFallbackOpenSeaData(tokenId: string): OpenSeaAsset {
    return {
      identifier: tokenId,
      name: `CryptoKaiju #${tokenId}`,
      description: 'A unique CryptoKaiju NFT with physical collectible counterpart.',
      image_url: '',
      display_image_url: '',
      opensea_url: `https://opensea.io/assets/ethereum/${KAIJU_NFT_ADDRESS}/${tokenId}`,
      traits: [],
      rarity: undefined
    }
  }

  /**
   * Get NFT by Token ID
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🔍 Looking up Token ID ${tokenId} on blockchain...`)

      // Validate token ID
      const tokenIdNum = parseInt(tokenId)
      if (isNaN(tokenIdNum) || tokenIdNum < 0) {
        throw new Error(`Invalid token ID: ${tokenId}`)
      }

      // Get basic contract data with better error handling
      const [tokenDetails, owner, standardTokenURI] = await Promise.allSettled([
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

      // Check if token exists
      if (tokenDetails.status === 'rejected' || owner.status === 'rejected') {
        console.log(`❌ Token ${tokenId} does not exist on blockchain`)
        return { nft: null, openSeaData: null }
      }

      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetails.value as any
      const ownerAddress = owner.value as string
      const tokenURI = standardTokenURI.status === 'fulfilled' ? 
        (standardTokenURI.value as string) : (tokenDetailsURI as string)

      const nfcId = this.bytes32ToNFC(nfcIdBytes32)

      console.log(`✅ Found on chain: Token ${tokenId}, Owner: ${ownerAddress}`)

      const kaiju: KaijuNFT = {
        tokenId: contractTokenId.toString(),
        nfcId,
        owner: ownerAddress,
        tokenURI: tokenURI,
        birthDate: Number(birthDate)
      }

      // Fetch metadata and OpenSea data in parallel
      const [ipfsData, openSeaData] = await Promise.allSettled([
        tokenURI ? this.fetchIpfsMetadata(tokenURI) : Promise.resolve(null),
        this.getOpenSeaData(tokenId)
      ])

      if (ipfsData.status === 'fulfilled' && ipfsData.value) {
        kaiju.ipfsData = ipfsData.value
        console.log(`✅ IPFS metadata loaded`)
      } else {
        console.warn(`⚠️ IPFS metadata failed or empty`)
      }

      const finalOpenSeaData = openSeaData.status === 'fulfilled' ? 
        openSeaData.value : this.createFallbackOpenSeaData(tokenId)

      return { nft: kaiju, openSeaData: finalOpenSeaData }

    } catch (error) {
      console.error(`❌ Critical error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get NFT by NFC ID - EFFICIENT VERSION using nfcDetails contract method
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      console.log(`🏷️ Looking up NFC ID: ${nfcId}`)
      
      // Convert human-readable NFC ID to bytes32 format
      const nfcBytes32 = this.nfcToBytes32(nfcId)
      console.log(`🔄 Converted to bytes32: ${nfcBytes32}`)
      
      // Call nfcDetails directly on the contract - MUCH more efficient!
      console.log(`📞 Calling contract nfcDetails method...`)
      const nfcDetails = await readContract({
        contract: this.contract,
        method: "nfcDetails",
        params: [nfcBytes32]
      })
      
      console.log(`📋 Contract response:`, nfcDetails)
      
      const [tokenId, returnedNfcId, tokenUri, dob] = nfcDetails as [bigint, string, string, bigint]
      
      // Check if we got a valid result (tokenId > 0)
      if (Number(tokenId) === 0) {
        console.log(`❌ NFC ID ${nfcId} not found in contract`)
        return { nft: null, openSeaData: null }
      }
      
      console.log(`✅ Found Token ID ${tokenId} for NFC ID ${nfcId}`)
      
      // Get the owner
      const owner = await readContract({
        contract: this.contract,
        method: "ownerOf",
        params: [tokenId]
      })
      
      // Create the NFT object
      const kaiju: KaijuNFT = {
        tokenId: tokenId.toString(),
        nfcId: this.bytes32ToNFC(returnedNfcId),
        owner: owner as string,
        tokenURI: tokenUri,
        birthDate: Number(dob)
      }
      
      // Fetch metadata and OpenSea data in parallel with short timeouts
      console.log(`📡 Fetching metadata and OpenSea data in parallel...`)
      const [ipfsData, openSeaData] = await Promise.allSettled([
        tokenUri ? this.fetchIpfsMetadata(tokenUri, 6000) : Promise.resolve(null), // 6 second timeout for IPFS
        this.getOpenSeaData(tokenId.toString(), 8000) // 8 second timeout for OpenSea
      ])
      
      if (ipfsData.status === 'fulfilled' && ipfsData.value) {
        kaiju.ipfsData = ipfsData.value
        console.log(`✅ IPFS metadata loaded: ${kaiju.ipfsData.name}`)
      } else {
        console.warn(`⚠️ IPFS metadata failed or timed out`)
      }
      
      const finalOpenSeaData = openSeaData.status === 'fulfilled' ? 
        openSeaData.value : this.createFallbackOpenSeaData(tokenId.toString())
      
      console.log(`✅ NFC lookup completed for ${nfcId} -> Token ${tokenId}`)
      return { nft: kaiju, openSeaData: finalOpenSeaData }
      
    } catch (error) {
      console.error(`❌ Error looking up NFC ID ${nfcId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get total supply from contract
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await readContract({
        contract: this.contract,
        method: "totalSupply",
        params: []
      })
      return Number(supply)
    } catch (error) {
      console.error('Error fetching total supply:', error)
      return 0
    }
  }

  /**
   * Get tokens owned by address
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    try {
      console.log(`👤 Fetching tokens for address: ${address}`)
      
      const balance = await readContract({
        contract: this.contract,
        method: "balanceOf",
        params: [address]
      })
      
      const tokenCount = Number(balance)
      console.log(`📦 Address ${address} owns ${tokenCount} tokens`)
      
      if (tokenCount === 0) {
        return []
      }
      
      // Get all token IDs owned by this address
      const tokenPromises = []
      for (let i = 0; i < tokenCount; i++) {
        tokenPromises.push(
          readContract({
            contract: this.contract,
            method: "tokenOfOwnerByIndex",
            params: [address, BigInt(i)]
          })
        )
      }
      
      const tokenIds = await Promise.all(tokenPromises)
      
      // Fetch full details for each token
      const tokenDetails = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const result = await this.getByTokenId(tokenId.toString())
          return result.nft
        })
      )
      
      const validTokens = tokenDetails.filter((token): token is KaijuNFT => token !== null)
      console.log(`✅ Successfully fetched ${validTokens.length} tokens for ${address}`)
      
      return validTokens
      
    } catch (error) {
      console.error(`❌ Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Search tokens (simplified implementation)
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    const isTokenId = /^\d+$/.test(query.trim())
    
    if (isTokenId) {
      const result = await this.getByTokenId(query.trim())
      return result.nft ? [result.nft] : []
    }
    
    // For NFC searches or other queries, try NFC lookup
    const result = await this.getByNFCId(query.trim())
    return result.nft ? [result.nft] : []
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const totalSupply = await this.getTotalSupply()
      return {
        totalSupply,
        owners: undefined // Would need to implement owner counting
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error)
      return { totalSupply: 0 }
    }
  }

  /**
   * Find known NFC IDs (for testing/discovery)
   */
  async findKnownNFCs(maxTokens: number = 20): Promise<Array<{tokenId: string, nfcId: string}>> {
    console.log(`🔍 Scanning first ${maxTokens} tokens for NFC IDs...`)
    const nfcs: Array<{tokenId: string, nfcId: string}> = []
    
    const totalSupply = await this.getTotalSupply()
    const scanLimit = Math.min(maxTokens, totalSupply)
    
    for (let i = 0; i < scanLimit; i++) {
      try {
        const result = await this.getByTokenId(i.toString())
        if (result.nft && result.nft.nfcId) {
          nfcs.push({
            tokenId: result.nft.tokenId,
            nfcId: result.nft.nfcId
          })
          console.log(`🏷️ Found: Token ${result.nft.tokenId} -> NFC ${result.nft.nfcId}`)
        }
      } catch (error) {
        // Continue scanning
      }
    }
    
    console.log(`✅ Found ${nfcs.length} tokens with NFC IDs`)
    return nfcs
  }

  /**
   * Test service connectivity with the new efficient NFC lookup
   */
  async testService(): Promise<void> {
    console.log('🧪 Testing Efficient Blockchain Service...')
    
    try {
      // Test 1: Get total supply
      console.log('📊 Testing total supply...')
      const totalSupply = await this.getTotalSupply()
      console.log(`✅ Total supply: ${totalSupply}`)
      
      // Test 2: Try to fetch token 0 or 1
      console.log('🎨 Testing token lookup...')
      const testTokenId = '1'
      const result = await this.getByTokenId(testTokenId)
      
      if (result.nft) {
        console.log(`✅ Token lookup successful: ${result.nft.ipfsData?.name || 'Unnamed'}`)
        
        // Test 3: If we found an NFC ID, test the EFFICIENT reverse lookup
        if (result.nft.nfcId) {
          console.log(`🏷️ Testing EFFICIENT NFC lookup with found NFC ID: ${result.nft.nfcId}`)
          console.log(`🔄 This should be instant using nfcDetails contract method!`)
          
          const startTime = Date.now()
          const nfcResult = await this.getByNFCId(result.nft.nfcId)
          const endTime = Date.now()
          
          if (nfcResult.nft && nfcResult.nft.tokenId === result.nft.tokenId) {
            console.log(`✅ EFFICIENT NFC lookup successful in ${endTime - startTime}ms!`)
            console.log(`🎯 Cross-validation: Both lookups returned Token ${result.nft.tokenId}`)
          } else {
            console.log('❌ NFC reverse lookup failed')
          }
        } else {
          console.log('ℹ️ Token has no NFC ID, testing with a known example...')
          // Test with the example you provided
          console.log('🧪 Testing with example NFC ID: 047923BA4E6E80')
          const exampleResult = await this.getByNFCId('047923BA4E6E80')
          if (exampleResult.nft) {
            console.log(`✅ Example NFC lookup found Token ${exampleResult.nft.tokenId}`)
          } else {
            console.log('ℹ️ Example NFC ID not found (may not exist in this contract)') 
          }
        }
      } else {
        console.log('❌ Token lookup failed')
      }
      
      // Test 4: Test NFC conversion
      console.log('🔧 Testing NFC to bytes32 conversion...')
      const testNfc = '047923BA4E6E80'
      const bytes32 = this.nfcToBytes32(testNfc)
      const backToNfc = this.bytes32ToNFC(bytes32)
      console.log(`🔄 ${testNfc} -> ${bytes32} -> ${backToNfc}`)
      if (backToNfc === testNfc) {
        console.log('✅ NFC conversion test passed!')
      } else {
        console.log('❌ NFC conversion test failed!')
      }
      
      console.log('🎉 Efficient blockchain service test completed!')
      
    } catch (error) {
      console.error('❌ Blockchain service test failed:', error)
      throw error
    }
  }
}

export default new BlockchainCryptoKaijuService()