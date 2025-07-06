// src/lib/services/BlockchainCryptoKaijuService.ts - OPTIMIZED PARALLEL EXECUTION VERSION
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'

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
  
  // 🚀 PERFORMANCE OPTIMIZATIONS
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private pendingRequests = new Map<string, Promise<any>>() // Request deduplication
  
  // Multiple IPFS gateways for racing
  private readonly IPFS_GATEWAYS = [
    'https://cryptokaiju.mypinata.cloud/ipfs',
    'https://gateway.pinata.cloud/ipfs', 
    'https://cloudflare-ipfs.com/ipfs',
    'https://ipfs.io/ipfs',
    'https://dweb.link/ipfs'
  ]
  
  // Balanced timeouts for speed + reliability
  private readonly TIMEOUTS = {
    CONTRACT: 3000,    // 3s for blockchain calls
    IPFS: 5000,        // 5s for IPFS (need time for metadata)
    OPENSEA: 4000,     // 4s for OpenSea (was failing at 3s)
    CACHE_TTL: 300000  // 5 minutes cache
  }

  constructor() {
    this.contract = getContract({
      client: thirdwebClient,
      chain: ethereum,
      address: KAIJU_NFT_ADDRESS,
      abi: KAIJU_NFT_ABI,
    })
  }

  /**
   * 🚀 OPTIMIZED: In-memory cache with TTL
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`⚡ Cache HIT: ${key}`)
      return cached.data as T
    }
    if (cached) {
      this.cache.delete(key) // Expired
    }
    return null
  }

  private setCache<T>(key: string, data: T, ttl: number = this.TIMEOUTS.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
  }

  /**
   * 🚀 OPTIMIZED: Request deduplication
   */
  private async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Deduplicating request: ${key}`)
      return this.pendingRequests.get(key)!
    }

    const promise = request().finally(() => {
      this.pendingRequests.delete(key)
    })
    
    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Convert human-readable NFC ID to bytes32 format for contract calls
   */
  private nfcToBytes32(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    const cleanNfc = nfcId.replace(/^0x/, '').toUpperCase()
    console.log(`🔄 Converting NFC "${cleanNfc}" to bytes32...`)
    
    let asciiHex = ''
    for (let i = 0; i < cleanNfc.length; i++) {
      const char = cleanNfc[i]
      const asciiCode = char.charCodeAt(0)
      const hexCode = asciiCode.toString(16).padStart(2, '0')
      asciiHex += hexCode
    }
    
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
      if (hexPair === '00') break
      const charCode = parseInt(hexPair, 16)
      if (charCode > 0) {
        result += String.fromCharCode(charCode)
      }
    }
    
    return result
  }

  /**
   * 🎯 SIMPLE: Just use the exact URL the contract gives us!
   * The contract returns the full IPFS URL (e.g., "https://ipfs.infura.io/ipfs/QmjhPr3M...")
   * No need to race multiple gateways - just use what the contract tells us!
   */
  private async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    const cacheKey = `ipfs:${tokenURI}`
    const cached = this.getCached(cacheKey)
    if (cached) return cached

    return this.deduplicate(cacheKey, async () => {
      try {
        console.log(`📡 Fetching IPFS metadata from contract URL: ${tokenURI}`)
        
        // The contract gives us the EXACT URL - just use it!
        const response = await fetch(tokenURI, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(this.TIMEOUTS.IPFS)
        })
        
        if (!response.ok) {
          throw new Error(`Contract URL returned ${response.status}`)
        }
        
        const data = await response.json()
        this.setCache(cacheKey, data, 24 * 60 * 60 * 1000) // 24hr cache for IPFS
        console.log(`✅ IPFS metadata loaded: ${data.name || 'Unnamed'}`)
        return data
        
      } catch (error) {
        console.warn(`⚠️ Contract IPFS URL failed: ${error.message}`)
        
        // Only if the contract URL fails, try our API proxy as fallback
        if (tokenURI.includes('/ipfs/')) {
          try {
            const ipfsHash = tokenURI.split('/ipfs/')[1]
            const proxyUrl = `/api/ipfs/${ipfsHash}`
            console.log(`🔄 Trying API proxy fallback: ${proxyUrl}`)
            
            const proxyResponse = await fetch(proxyUrl, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(this.TIMEOUTS.IPFS)
            })
            
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json()
              console.log(`✅ API proxy fallback succeeded`)
              this.setCache(cacheKey, proxyData, 24 * 60 * 60 * 1000)
              return proxyData
            }
          } catch (proxyError) {
            console.warn(`❌ API proxy fallback also failed: ${proxyError.message}`)
          }
        }
        
        return null
      }
    })
  }

  /**
   * 🚀 OPTIMIZED: OpenSea with caching and shorter timeout
   */
  private async getOpenSeaDataOptimized(tokenId: string): Promise<OpenSeaAsset | null> {
    const cacheKey = `opensea:${tokenId}`
    const cached = this.getCached<OpenSeaAsset>(cacheKey)
    if (cached) return cached

    return this.deduplicate(cacheKey, async () => {
      try {
        // Use your proxy endpoint for CORS-free access
        const proxyUrl = `/api/opensea/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
        console.log(`🌊 OpenSea proxy: ${proxyUrl} (timeout: ${this.TIMEOUTS.OPENSEA}ms)`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.OPENSEA)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.status === 503) {
          console.warn(`⚠️ OpenSea API not configured`)
          return this.createFallbackOpenSeaData(tokenId)
        }
        
        if (!response.ok) {
          throw new Error(`OpenSea proxy returned ${response.status}`)
        }
        
        const data = await response.json()
        if (data?.nft) {
          const result = {
            identifier: data.nft.identifier || tokenId,
            name: data.nft.name || '',
            description: data.nft.description || '',
            image_url: data.nft.image_url || '',
            display_image_url: data.nft.display_image_url || data.nft.image_url || '',
            opensea_url: data.nft.opensea_url || `https://opensea.io/assets/ethereum/${KAIJU_NFT_ADDRESS}/${tokenId}`,
            traits: data.nft.traits || [],
            rarity: data.nft.rarity
          }
          
          this.setCache(cacheKey, result, 60 * 60 * 1000) // 1hr cache for OpenSea
          console.log(`✅ OpenSea cached: ${result.name || 'Unnamed'}`)
          return result
        }
        
        return this.createFallbackOpenSeaData(tokenId)
        
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`⏰ OpenSea timed out after ${this.TIMEOUTS.OPENSEA}ms`)
        } else {
          console.warn(`⚠️ OpenSea failed:`, error.message)
        }
        return this.createFallbackOpenSeaData(tokenId)
      }
    })
  }

  /**
   * Create fallback OpenSea data when API fails
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
   * 🚀 OPTIMIZED: Blockchain calls with timeout and caching
   */
  private async callContractWithTimeout<T>(method: string, params: any[], cacheKey?: string): Promise<T> {
    if (cacheKey) {
      const cached = this.getCached<T>(cacheKey)
      if (cached) return cached
    }

    return this.deduplicate(cacheKey || `${method}:${JSON.stringify(params)}`, async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.CONTRACT)
      
      try {
        const result = await readContract({
          contract: this.contract,
          method: method as any,
          params: params as any
        })
        
        clearTimeout(timeoutId)
        
        if (cacheKey) {
          this.setCache(cacheKey, result as T)
        }
        
        return result as T
      } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          throw new Error(`Contract call ${method} timed out after ${this.TIMEOUTS.CONTRACT}ms`)
        }
        throw error
      }
    })
  }

  /**
   * 🚀 OPTIMIZED: Get NFT by Token ID with maximum parallelization
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 PARALLEL lookup for Token ID ${tokenId}...`)

      const tokenIdNum = parseInt(tokenId)
      if (isNaN(tokenIdNum) || tokenIdNum < 0) {
        throw new Error(`Invalid token ID: ${tokenId}`)
      }

      // 🚀 STEP 1: Launch ALL contract calls in parallel with timeouts
      console.log(`⚡ Launching parallel contract calls...`)
      const [tokenDetailsResult, ownerResult, tokenURIResult] = await Promise.allSettled([
        this.callContractWithTimeout("tokenDetails", [BigInt(tokenId)], `tokenDetails:${tokenId}`),
        this.callContractWithTimeout("ownerOf", [BigInt(tokenId)], `owner:${tokenId}`),
        this.callContractWithTimeout("tokenURI", [BigInt(tokenId)], `tokenURI:${tokenId}`)
      ])

      // Check if token exists
      if (tokenDetailsResult.status === 'rejected' || ownerResult.status === 'rejected') {
        console.log(`❌ Token ${tokenId} does not exist`)
        return { nft: null, openSeaData: null }
      }

      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetailsResult.value as any
      const ownerAddress = ownerResult.value as string
      const tokenURI = tokenURIResult.status === 'fulfilled' ? 
        (tokenURIResult.value as string) : (tokenDetailsURI as string)

      const nfcId = this.bytes32ToNFC(nfcIdBytes32)
      console.log(`✅ Contract data loaded in ${Date.now() - startTime}ms`)

      // 🚀 STEP 2: Launch IPFS and OpenSea in parallel immediately
      console.log(`⚡ Launching parallel API calls (using contract URLs)...`)
      const apiStartTime = Date.now()
      
      const [ipfsResult, openSeaResult] = await Promise.allSettled([
        tokenURI ? this.fetchIpfsMetadata(tokenURI) : Promise.resolve(null),
        this.getOpenSeaDataOptimized(tokenId)
      ])

      console.log(`✅ API calls completed in ${Date.now() - apiStartTime}ms`)

      // Build final NFT object
      const kaiju: KaijuNFT = {
        tokenId: contractTokenId.toString(),
        nfcId,
        owner: ownerAddress,
        tokenURI: tokenURI,
        birthDate: Number(birthDate)
      }

      if (ipfsResult.status === 'fulfilled' && ipfsResult.value) {
        kaiju.ipfsData = ipfsResult.value
        console.log(`✅ IPFS: ${kaiju.ipfsData.name || 'Unnamed'}`)
      } else {
        console.warn(`⚠️ IPFS failed or timed out`)
      }

      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId)

      console.log(`🎉 Total lookup time: ${Date.now() - startTime}ms`)
      return { nft: kaiju, openSeaData: finalOpenSeaData }

    } catch (error) {
      console.error(`❌ Critical error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * 🚀 OPTIMIZED: Get NFT by NFC ID with maximum parallelization
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 PARALLEL NFC lookup: ${nfcId}`)
      
      // Convert NFC ID
      const nfcBytes32 = this.nfcToBytes32(nfcId)
      
      // 🚀 STEP 1: Call nfcDetails with timeout and caching
      console.log(`⚡ Contract nfcDetails call...`)
      const nfcDetails = await this.callContractWithTimeout(
        "nfcDetails", 
        [nfcBytes32], 
        `nfcDetails:${nfcId}`
      )
      
      const [tokenId, returnedNfcId, tokenUri, dob] = nfcDetails as [bigint, string, string, bigint]
      
      if (Number(tokenId) === 0) {
        console.log(`❌ NFC ID ${nfcId} not found`)
        return { nft: null, openSeaData: null }
      }
      
      console.log(`✅ Found Token ID ${tokenId} in ${Date.now() - startTime}ms`)
      
      // 🚀 STEP 2: Launch owner lookup + IPFS + OpenSea ALL in parallel
      console.log(`⚡ Launching parallel data fetch (using contract URLs)...`)
      const parallelStartTime = Date.now()
      
      const [ownerResult, ipfsResult, openSeaResult] = await Promise.allSettled([
        this.callContractWithTimeout("ownerOf", [tokenId], `owner:${tokenId}`),
        tokenUri ? this.fetchIpfsMetadata(tokenUri) : Promise.resolve(null),
        this.getOpenSeaDataOptimized(tokenId.toString())
      ])
      
      console.log(`✅ Parallel fetch completed in ${Date.now() - parallelStartTime}ms`)
      
      // Build NFT object
      const kaiju: KaijuNFT = {
        tokenId: tokenId.toString(),
        nfcId: this.bytes32ToNFC(returnedNfcId),
        owner: ownerResult.status === 'fulfilled' ? (ownerResult.value as string) : '',
        tokenURI: tokenUri,
        birthDate: Number(dob)
      }
      
      if (ipfsResult.status === 'fulfilled' && ipfsResult.value) {
        kaiju.ipfsData = ipfsResult.value
        console.log(`✅ IPFS: ${kaiju.ipfsData.name || 'Unnamed'}`)
      }
      
      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId.toString())
      
      console.log(`🎉 Total NFC lookup time: ${Date.now() - startTime}ms`)
      return { nft: kaiju, openSeaData: finalOpenSeaData }
      
    } catch (error) {
      console.error(`❌ Error looking up NFC ID ${nfcId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get total supply with caching
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.callContractWithTimeout<bigint>("totalSupply", [], "totalSupply")
      return Number(supply)
    } catch (error) {
      console.error('Error fetching total supply:', error)
      return 0
    }
  }

  /**
   * 🚀 OPTIMIZED: Get tokens owned by address with parallel processing
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 PARALLEL fetch for address: ${address}`)
      
      const balance = await this.callContractWithTimeout<bigint>("balanceOf", [address], `balance:${address}`)
      const tokenCount = Number(balance)
      
      console.log(`📦 Address ${address} owns ${tokenCount} tokens`)
      
      if (tokenCount === 0) return []
      
      // 🚀 STEP 1: Get all token IDs in parallel
      console.log(`⚡ Fetching ${tokenCount} token IDs in parallel...`)
      const tokenIdPromises = Array.from({ length: tokenCount }, (_, i) =>
        this.callContractWithTimeout<bigint>("tokenOfOwnerByIndex", [address, BigInt(i)])
      )
      
      const tokenIds = await Promise.allSettled(tokenIdPromises)
      const validTokenIds = tokenIds
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<bigint>).value.toString())
      
      console.log(`✅ Got ${validTokenIds.length} token IDs in ${Date.now() - startTime}ms`)
      
      // 🚀 STEP 2: Fetch ALL token details in parallel (limited batches to avoid overwhelming)
      console.log(`⚡ Fetching all token details in parallel...`)
      const BATCH_SIZE = 10 // Process 10 at a time to avoid overwhelming APIs
      const results: KaijuNFT[] = []
      
      for (let i = 0; i < validTokenIds.length; i += BATCH_SIZE) {
        const batch = validTokenIds.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(async (tokenId) => {
          const result = await this.getByTokenId(tokenId)
          return result.nft
        })
        
        const batchResults = await Promise.allSettled(batchPromises)
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<KaijuNFT>).value)
        
        results.push(...validResults)
        console.log(`✅ Batch ${Math.floor(i/BATCH_SIZE) + 1} completed (${validResults.length} tokens)`)
      }
      
      console.log(`🎉 Total fetch time for ${results.length} tokens: ${Date.now() - startTime}ms`)
      return results
      
    } catch (error) {
      console.error(`❌ Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Search tokens (optimized)
   */
  async searchTokens(query: string): Promise<KaijuNFT[]> {
    const isTokenId = /^\d+$/.test(query.trim())
    
    if (isTokenId) {
      const result = await this.getByTokenId(query.trim())
      return result.nft ? [result.nft] : []
    }
    
    const result = await this.getByNFCId(query.trim())
    return result.nft ? [result.nft] : []
  }

  /**
   * Get collection stats with caching
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const totalSupply = await this.getTotalSupply()
      return { totalSupply }
    } catch (error) {
      console.error('Error fetching collection stats:', error)
      return { totalSupply: 0 }
    }
  }

  /**
   * 🚀 OPTIMIZED: Find known NFC IDs with parallel processing
   */
  async findKnownNFCs(maxTokens: number = 20): Promise<Array<{tokenId: string, nfcId: string}>> {
    console.log(`🚀 PARALLEL NFC scanning for ${maxTokens} tokens...`)
    const startTime = Date.now()
    
    const totalSupply = await this.getTotalSupply()
    const scanLimit = Math.min(maxTokens, totalSupply)
    
    // Process in parallel batches
    const BATCH_SIZE = 5
    const nfcs: Array<{tokenId: string, nfcId: string}> = []
    
    for (let i = 0; i < scanLimit; i += BATCH_SIZE) {
      const batch = Array.from(
        { length: Math.min(BATCH_SIZE, scanLimit - i) }, 
        (_, index) => i + index
      )
      
      console.log(`⚡ Scanning batch: tokens ${batch[0]}-${batch[batch.length - 1]}`)
      
      const batchPromises = batch.map(async (tokenId) => {
        try {
          const result = await this.getByTokenId(tokenId.toString())
          if (result.nft && result.nft.nfcId) {
            return { tokenId: result.nft.tokenId, nfcId: result.nft.nfcId }
          }
        } catch (error) {
          // Continue
        }
        return null
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      const validResults = batchResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => (result as PromiseFulfilledResult<{tokenId: string, nfcId: string}>).value)
      
      nfcs.push(...validResults)
      
      if (validResults.length > 0) {
        console.log(`🏷️ Batch found ${validResults.length} NFCs`)
      }
    }
    
    console.log(`🎉 Parallel scan completed in ${Date.now() - startTime}ms - found ${nfcs.length} NFCs`)
    return nfcs
  }

  /**
   * Test service with performance timing
   */
  async testService(): Promise<void> {
    console.log('🚀 Testing OPTIMIZED Parallel Service...')
    const totalStartTime = Date.now()
    
    try {
      // Test 1: Total supply
      console.log('📊 Testing cached total supply...')
      const startTime1 = Date.now()
      const totalSupply = await this.getTotalSupply()
      console.log(`✅ Total supply: ${totalSupply} (${Date.now() - startTime1}ms)`)
      
      // Test 2: Token lookup with parallel execution
      console.log('🚀 Testing parallel token lookup...')
      const startTime2 = Date.now()
      const result = await this.getByTokenId('1')
      
      if (result.nft) {
        console.log(`✅ Parallel token lookup: ${result.nft.ipfsData?.name || 'Unnamed'} (${Date.now() - startTime2}ms)`)
        
        // Test 3: NFC lookup efficiency
        if (result.nft.nfcId) {
          console.log('🏷️ Testing optimized NFC lookup...')
          const startTime3 = Date.now()
          const nfcResult = await this.getByNFCId(result.nft.nfcId)
          
          if (nfcResult.nft && nfcResult.nft.tokenId === result.nft.tokenId) {
            console.log(`✅ NFC lookup: ${Date.now() - startTime3}ms (with caching!)`)
          }
        }
      }
      
      // Test 4: Cache effectiveness
      console.log('💾 Testing cache effectiveness...')
      const cacheStartTime = Date.now()
      await this.getByTokenId('1') // Should be instant from cache
      console.log(`✅ Cached lookup: ${Date.now() - cacheStartTime}ms`)
      
      console.log(`🎉 Total test time: ${Date.now() - totalStartTime}ms`)
      console.log(`📊 Cache size: ${this.cache.size} entries`)
      
    } catch (error) {
      console.error('❌ Optimized service test failed:', error)
      throw error
    }
  }
}

export default new BlockchainCryptoKaijuService()