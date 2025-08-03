// src/lib/services/BlockchainCryptoKaijuService.ts - OPTIMIZED FOR RELIABLE PRIMARY IPFS
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'
import { ErrorHandler, ErrorFactory, CryptoKaijuError, ErrorType, ErrorSeverity } from '@/lib/utils/errorHandling'

// Helper function to safely extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

// CryptoKaiju NFT Contract ABI
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
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "tokensOf", 
    "outputs": [{"internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_owner", "type": "address"},
      {"internalType": "uint256", "name": "_index", "type": "uint256"}
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

export interface SearchResult {
  nft: KaijuNFT
  openSeaData: OpenSeaAsset | null
}

export interface CollectionStats {
  totalSupply: number
  owners?: number
}

// Simplified performance tracking
export interface PerformanceMetrics {
  totalRequests: number
  cacheHits: number
  errors: number
  averageResponseTime: number
  ipfsSuccessRate: number
  openSeaFallbacks: number
}

export interface ServiceStats {
  performance: PerformanceMetrics
  cache: {
    size: number
    keys: string[]
  }
  pendingRequests: number
}

// Simple LRU Cache
class SimpleLRUCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  private readonly maxSize: number

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize
    this.loadFromStorage()
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // Move to end (LRU behavior)
    this.cache.delete(key)
    this.cache.set(key, item)
    return item.data
  }

  set(key: string, data: T, ttl: number): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
    this.saveToStorage()
  }

  clear(): void {
    this.cache.clear()
    this.clearStorage()
  }

  get size(): number {
    return this.cache.size
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('kaiju_simple_cache')
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()
        
        for (const [key, item] of Object.entries(parsed)) {
          const cacheItem = item as { data: T; timestamp: number; ttl: number }
          if (now - cacheItem.timestamp < cacheItem.ttl) {
            this.cache.set(key, cacheItem)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const cacheObject: any = {}
      for (const [key, value] of this.cache.entries()) {
        cacheObject[key] = value
      }
      localStorage.setItem('kaiju_simple_cache', JSON.stringify(cacheObject))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('kaiju_simple_cache')
    } catch (error) {
      console.warn('Failed to clear cache storage:', error)
    }
  }
}

class BlockchainCryptoKaijuService {
  private contract: any
  private cache = new SimpleLRUCache<any>(500)
  private pendingRequests = new Map<string, Promise<any>>()
  
  // OPTIMIZED: Focus on primary gateway with simple fallbacks
  private readonly PRIMARY_IPFS_GATEWAY = 'https://cryptokaiju.mypinata.cloud/ipfs'
  private readonly FALLBACK_GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs',
    'https://cloudflare-ipfs.com/ipfs'
  ]
  
  // Simplified timeouts
  private readonly TIMEOUTS = {
    CONTRACT: 8000,
    IPFS_PRIMARY: 5000,
    IPFS_FALLBACK: 8000,
    OPENSEA: 10000,
    CACHE_TTL: 300000  // 5 minutes
  }

  // Simplified performance tracking
  private performanceMetrics: PerformanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    errors: 0,
    averageResponseTime: 0,
    ipfsSuccessRate: 0,
    openSeaFallbacks: 0
  }

  private readonly DEBUG = process.env.NODE_ENV === 'development'

  constructor() {
    try {
      this.contract = getContract({
        client: thirdwebClient,
        chain: ethereum,
        address: KAIJU_NFT_ADDRESS,
        abi: KAIJU_NFT_ABI,
      })
      
      this.log('🚀 Optimized BlockchainCryptoKaijuService initialized')
      this.log(`🎯 Primary IPFS: ${this.PRIMARY_IPFS_GATEWAY}`)
      this.log(`💾 Cache: ${this.cache.size} entries loaded`)
    } catch (error) {
      throw ErrorFactory.securityError('Failed to initialize blockchain service')
    }
  }

  private log(...args: any[]): void {
    if (this.DEBUG) {
      console.log('[BlockchainService]', ...args)
    }
  }

  private warn(...args: any[]): void {
    if (this.DEBUG) {
      console.warn('[BlockchainService]', ...args)
    }
  }

  private error(...args: any[]): void {
    console.error('[BlockchainService]', ...args)
  }

  /**
   * Request deduplication
   */
  private async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    const promise = request()
      .catch(error => {
        throw ErrorHandler.normalize(error, { requestKey: key })
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })
    
    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * NFC encoding detection and conversion (simplified but still robust)
   */
  private detectNFCEncoding(nfcId: string): 'direct' | 'ascii' {
    if (!nfcId) return 'ascii'
    
    const cleanNfc = nfcId.replace(/^0x/, '').toUpperCase()
    const isHexPattern = /^[0-9A-F]+$/.test(cleanNfc)
    const hasEvenLength = cleanNfc.length % 2 === 0
    const isReasonableLength = cleanNfc.length >= 8 && cleanNfc.length <= 32
    
    if (isHexPattern && hasEvenLength && isReasonableLength) {
      // Simple heuristic: if it looks like pure hex data, use direct
      return 'direct'
    }
    
    return 'ascii'
  }

  private nfcToBytes32ASCII(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    const cleanNfc = nfcId.replace(/^0x/, '').toUpperCase()
    let asciiHex = ''
    
    for (let i = 0; i < cleanNfc.length; i++) {
      const char = cleanNfc[i]
      const asciiCode = char.charCodeAt(0)
      const hexCode = asciiCode.toString(16).padStart(2, '0')
      asciiHex += hexCode
    }
    
    return '0x' + asciiHex.padEnd(64, '0')
  }

  private nfcToBytes32Direct(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    const cleanNfc = nfcId.replace(/^0x/, '').toLowerCase()
    return '0x' + cleanNfc.padEnd(64, '0')
  }

  private bytes32ToNFC(bytes32: string): string {
    if (!bytes32 || bytes32 === '0x' + '0'.repeat(64)) return ''
    
    const hex = bytes32.replace(/^0x/, '')
    
    // Try ASCII decoding first
    let asciiResult = ''
    let isValidAscii = true
    
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break
      
      const charCode = parseInt(hexPair, 16)
      
      if (charCode >= 48 && charCode <= 70) { // 0-9, A-F
        asciiResult += String.fromCharCode(charCode)
      } else {
        isValidAscii = false
        break
      }
    }
    
    if (isValidAscii && asciiResult.length >= 8 && /^[0-9A-F]+$/.test(asciiResult)) {
      return asciiResult
    }
    
    // Otherwise, treat as direct hex
    return hex.replace(/0+$/, '').toUpperCase()
  }

  /**
   * Blockchain calls with timeout and caching
   */
  private async callContractWithTimeout<T>(
    method: string, 
    params: any[], 
    cacheKey?: string
  ): Promise<T> {
    const startTime = Date.now()
    
    if (cacheKey) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        this.performanceMetrics.cacheHits++
        return cached
      }
    }

    const key = cacheKey || `${method}:${JSON.stringify(params)}`
    
    return this.deduplicate(key, async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.CONTRACT)
      
      try {
        this.performanceMetrics.totalRequests++
        
        const result = await readContract({
          contract: this.contract,
          method: method as any,
          params: params as any
        })
        
        clearTimeout(timeoutId)
        
        const duration = Date.now() - startTime
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + duration) / 2
        
        if (cacheKey) {
          this.cache.set(cacheKey, result as T, this.TIMEOUTS.CACHE_TTL)
        }
        
        return result as T
      } catch (error) {
        clearTimeout(timeoutId)
        this.performanceMetrics.errors++
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new CryptoKaijuError({
            type: ErrorType.NETWORK,
            severity: ErrorSeverity.HIGH,
            message: `Contract call ${method} timed out`,
            userMessage: 'Blockchain request timed out. Please try again.',
            suggestions: [
              'Check your internet connection',
              'Try again in a few moments'
            ],
            retryable: true,
            context: { method, params }
          })
        }
        
        throw ErrorHandler.normalize(error, { method, params })
      }
    })
  }

  /**
   * OPTIMIZED: Primary IPFS first, then simple fallbacks
   */
  private async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    const cacheKey = `ipfs:${tokenURI}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    return this.deduplicate(cacheKey, async () => {
      let ipfsHash = ''
      if (tokenURI.includes('/ipfs/')) {
        ipfsHash = tokenURI.split('/ipfs/')[1].split('?')[0]
      } else if (tokenURI.startsWith('ipfs://')) {
        ipfsHash = tokenURI.replace('ipfs://', '')
      }

      if (!ipfsHash) {
        // Try direct URL
        return await this.fetchFromDirectURL(tokenURI)
      }

      // Step 1: Try primary gateway (should work 95%+ of time)
      try {
        const result = await this.fetchFromGateway(this.PRIMARY_IPFS_GATEWAY, ipfsHash, this.TIMEOUTS.IPFS_PRIMARY)
        this.performanceMetrics.ipfsSuccessRate = 
          (this.performanceMetrics.ipfsSuccessRate * 0.9) + (1.0 * 0.1) // Rolling average
        
        this.cache.set(cacheKey, result, 24 * 60 * 60 * 1000) // 24hr cache for successful IPFS
        this.log(`✅ Primary IPFS success: ${ipfsHash}`)
        return result
      } catch (primaryError) {
        this.warn(`⚠️ Primary IPFS failed: ${getErrorMessage(primaryError)}`)
      }

      // Step 2: Try fallback gateways sequentially
      for (const gateway of this.FALLBACK_GATEWAYS) {
        try {
          const result = await this.fetchFromGateway(gateway, ipfsHash, this.TIMEOUTS.IPFS_FALLBACK)
          this.performanceMetrics.ipfsSuccessRate = 
            (this.performanceMetrics.ipfsSuccessRate * 0.9) + (0.8 * 0.1) // Slightly lower for fallback
          
          this.cache.set(cacheKey, result, 6 * 60 * 60 * 1000) // 6hr cache for fallback
          this.log(`✅ Fallback IPFS success: ${gateway}`)
          return result
        } catch (fallbackError) {
          this.warn(`⚠️ Fallback ${gateway} failed: ${getErrorMessage(fallbackError)}`)
        }
      }

      // Step 3: Try API proxy as final fallback
      try {
        const result = await this.fetchFromAPIProxy(ipfsHash)
        this.cache.set(cacheKey, result, 1 * 60 * 60 * 1000) // 1hr cache for proxy
        this.log(`✅ API proxy success: ${ipfsHash}`)
        return result
      } catch (proxyError) {
        this.warn(`⚠️ API proxy failed: ${getErrorMessage(proxyError)}`)
      }

      // All IPFS sources failed
      this.performanceMetrics.ipfsSuccessRate = 
        (this.performanceMetrics.ipfsSuccessRate * 0.9) + (0.0 * 0.1)
      
      throw ErrorFactory.ipfsError(ipfsHash)
    })
  }

  private async fetchFromDirectURL(tokenURI: string): Promise<any> {
    const response = await fetch(tokenURI, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_PRIMARY)
    })
    
    if (response.ok) {
      return await response.json()
    }
    
    throw new Error(`Direct URL failed: ${response.status}`)
  }

  private async fetchFromGateway(gateway: string, ipfsHash: string, timeout: number): Promise<any> {
    const response = await fetch(`${gateway}/${ipfsHash}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoKaiju/1.0',
      },
      signal: AbortSignal.timeout(timeout)
    })
    
    if (response.ok) {
      return await response.json()
    }
    
    throw new Error(`Gateway ${gateway} returned ${response.status}`)
  }

  private async fetchFromAPIProxy(ipfsHash: string): Promise<any> {
    const response = await fetch(`/api/ipfs/${ipfsHash}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.fallback || data
    }
    
    throw new Error(`API proxy failed: ${response.status}`)
  }

  /**
   * OPTIMIZED: OpenSea as fallback metadata source only
   */
  private async getOpenSeaDataAsFallback(tokenId: string): Promise<OpenSeaAsset | null> {
    const cacheKey = `opensea_fallback:${tokenId}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    return this.deduplicate(cacheKey, async () => {
      try {
        this.performanceMetrics.openSeaFallbacks++
        
        const response = await fetch(`/api/opensea/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(this.TIMEOUTS.OPENSEA)
        })
        
        if (!response.ok) {
          throw new Error(`OpenSea returned ${response.status}`)
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
          
          this.cache.set(cacheKey, result, 60 * 60 * 1000) // 1hr cache
          return result
        }
        
        return null
      } catch (error) {
        this.warn(`OpenSea fallback failed for token ${tokenId}:`, error)
        return null
      }
    })
  }

  /**
   * OPTIMIZED: Get NFT by Token ID - Primary IPFS with OpenSea fallback
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      if (!tokenId || typeof tokenId !== 'string') {
        throw ErrorFactory.validationError('tokenId', tokenId)
      }
      
      const tokenIdNum = parseInt(tokenId.trim())
      if (isNaN(tokenIdNum) || tokenIdNum < 0 || tokenIdNum > 1000000) {
        throw ErrorFactory.validationError('tokenId', tokenId)
      }

      this.log(`🔍 Fetching Token ID: ${tokenId}`)

      // Get blockchain data
      const [tokenDetailsResult, ownerResult, tokenURIResult] = await Promise.allSettled([
        this.callContractWithTimeout("tokenDetails", [BigInt(tokenId)], `tokenDetails:${tokenId}`),
        this.callContractWithTimeout("ownerOf", [BigInt(tokenId)], `owner:${tokenId}`),
        this.callContractWithTimeout("tokenURI", [BigInt(tokenId)], `tokenURI:${tokenId}`)
      ])

      if (tokenDetailsResult.status === 'rejected') {
        throw ErrorFactory.nftNotFound(tokenId)
      }

      if (ownerResult.status === 'rejected') {
        throw ErrorFactory.nftNotFound(tokenId)
      }

      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetailsResult.value as any
      const ownerAddress = ownerResult.value as string
      const tokenURI = tokenURIResult.status === 'fulfilled' ? 
        (tokenURIResult.value as string) : (tokenDetailsURI as string)

      const nfcId = this.bytes32ToNFC(nfcIdBytes32)

      // Build NFT object
      const kaiju: KaijuNFT = {
        tokenId: contractTokenId.toString(),
        nfcId,
        owner: ownerAddress,
        tokenURI: tokenURI,
        birthDate: Number(birthDate)
      }

      // Try IPFS metadata first
      let openSeaData: OpenSeaAsset | null = null
      
      if (tokenURI) {
        try {
          const ipfsData = await this.fetchIpfsMetadata(tokenURI)
          kaiju.ipfsData = ipfsData
          this.log(`✅ IPFS data loaded: ${ipfsData.name}`)
        } catch (ipfsError) {
          this.warn(`⚠️ IPFS failed, trying OpenSea fallback`)
          
          // IPFS failed, use OpenSea as metadata fallback
          openSeaData = await this.getOpenSeaDataAsFallback(tokenId)
          
          if (openSeaData) {
            // Build IPFS-like data from OpenSea
            kaiju.ipfsData = {
              name: openSeaData.name,
              description: openSeaData.description,
              image: openSeaData.display_image_url || openSeaData.image_url,
              attributes: this.convertOpenSeaTraitsToAttributes(openSeaData.traits)
            }
            this.log(`✅ Using OpenSea as metadata fallback`)
          }
        }
      }

      // Extract batch from traits if available
      if (openSeaData?.traits || kaiju.ipfsData?.attributes) {
        const traits = openSeaData?.traits || this.attributesToTraits(kaiju.ipfsData?.attributes)
        const batchTrait = traits?.find((trait: any) => 
          trait.trait_type?.toLowerCase() === 'batch'
        )
        if (batchTrait?.value) {
          kaiju.batch = String(batchTrait.value).trim()
        }
      }

      const duration = Date.now() - startTime
      this.log(`✅ Token ${tokenId} fetched in ${duration}ms`)
      
      return { nft: kaiju, openSeaData }

    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ Failed to fetch token ${tokenId} after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      throw ErrorHandler.normalize(error, { tokenId, action: 'getByTokenId', duration })
    }
  }

  /**
   * Helper methods for OpenSea trait conversion
   */
  private convertOpenSeaTraitsToAttributes(traits: any[]): { [key: string]: any } {
    const attributes: { [key: string]: any } = {}
    if (traits && Array.isArray(traits)) {
      traits.forEach(trait => {
        if (trait.trait_type && trait.value !== undefined) {
          attributes[trait.trait_type.toLowerCase()] = trait.value
        }
      })
    }
    return attributes
  }

  private attributesToTraits(attributes: any): any[] {
    if (!attributes) return []
    return Object.entries(attributes).map(([key, value]) => ({
      trait_type: key,
      value
    }))
  }

  /**
   * OPTIMIZED: Get NFT by NFC ID
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      if (!nfcId || typeof nfcId !== 'string') {
        throw ErrorFactory.validationError('nfcId', nfcId)
      }
      
      const cleanNfcId = nfcId.trim()
      if (cleanNfcId.length < 4 || cleanNfcId.length > 32) {
        throw ErrorFactory.validationError('nfcId', nfcId)
      }

      this.log(`🔍 Looking up NFC ID: ${cleanNfcId}`)
      
      const likelyEncoding = this.detectNFCEncoding(cleanNfcId)
      const primaryBytes32 = likelyEncoding === 'direct' ? 
        this.nfcToBytes32Direct(cleanNfcId) : this.nfcToBytes32ASCII(cleanNfcId)
      const fallbackBytes32 = likelyEncoding === 'direct' ? 
        this.nfcToBytes32ASCII(cleanNfcId) : this.nfcToBytes32Direct(cleanNfcId)
      
      let nfcDetails: any
      
      try {
        nfcDetails = await this.callContractWithTimeout("nfcDetails", [primaryBytes32])
        const [tokenId] = nfcDetails as [bigint, string, string, bigint]
        if (Number(tokenId) === 0) {
          throw new Error('Not found with primary encoding')
        }
      } catch {
        try {
          nfcDetails = await this.callContractWithTimeout("nfcDetails", [fallbackBytes32])
          const [tokenId] = nfcDetails as [bigint, string, string, bigint]
          if (Number(tokenId) === 0) {
            throw new Error('Not found with fallback encoding')
          }
        } catch {
          throw ErrorFactory.nfcScanError(cleanNfcId)
        }
      }
      
      const [tokenId] = nfcDetails as [bigint, string, string, bigint]
      return await this.getByTokenId(tokenId.toString())
      
    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ NFC lookup failed for ${nfcId} after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      throw ErrorHandler.normalize(error, { nfcId, action: 'getByNFCId', duration })
    }
  }

  /**
   * Search tokens
   */
  async searchTokens(query: string): Promise<SearchResult[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return []
    
    const isTokenId = /^\d+$/.test(trimmedQuery)
    
    try {
      if (isTokenId) {
        const result = await this.getByTokenId(trimmedQuery)
        return result.nft ? [{ nft: result.nft, openSeaData: result.openSeaData }] : []
      } else {
        const result = await this.getByNFCId(trimmedQuery)
        return result.nft ? [{ nft: result.nft, openSeaData: result.openSeaData }] : []
      }
    } catch (error) {
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      throw ErrorHandler.normalize(error, { 
        query: trimmedQuery, 
        action: 'searchTokens',
        searchType: isTokenId ? 'tokenId' : 'nfcId'
      })
    }
  }

  /**
   * Get total supply
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.callContractWithTimeout<bigint>("totalSupply", [], "totalSupply")
      return Number(supply)
    } catch (error) {
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      throw ErrorHandler.normalize(error, { action: 'getTotalSupply' })
    }
  }

  /**
   * OPTIMIZED: Get tokens for address - try OpenSea first for speed, blockchain as fallback
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    const startTime = Date.now()
    const cacheKey = `tokens:${address}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      if (!address || typeof address !== 'string') {
        throw ErrorFactory.validationError('address', address)
      }
      
      const cleanAddress = address.trim().toLowerCase()
      if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
        throw ErrorFactory.validationError('address', address)
      }

      this.log(`🔍 Fetching tokens for address: ${cleanAddress}`)

      // Try OpenSea first (usually faster and has metadata)
      try {
        const openSeaResults = await this.getTokensFromOpenSea(cleanAddress)
        if (openSeaResults.length > 0) {
          const duration = Date.now() - startTime
          this.log(`✅ Found ${openSeaResults.length} tokens via OpenSea in ${duration}ms`)
          this.cache.set(cacheKey, openSeaResults, this.TIMEOUTS.CACHE_TTL)
          return openSeaResults
        }
      } catch (openSeaError) {
        this.warn(`⚠️ OpenSea failed, trying blockchain: ${getErrorMessage(openSeaError)}`)
      }
      
      // Fallback to blockchain
      const blockchainResults = await this.getTokensFromBlockchain(cleanAddress)
      
      const duration = Date.now() - startTime
      this.log(`✅ Found ${blockchainResults.length} tokens via blockchain in ${duration}ms`)
      
      this.cache.set(cacheKey, blockchainResults, this.TIMEOUTS.CACHE_TTL)
      return blockchainResults
      
    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ Failed to fetch tokens for ${address} after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      throw ErrorHandler.normalize(error, { address, action: 'getTokensForAddress', duration })
    }
  }

  private async getTokensFromOpenSea(address: string): Promise<KaijuNFT[]> {
    const allNFTs: KaijuNFT[] = []
    let cursor = ''
    let pageCount = 0
    const maxPages = 10
    
    while (pageCount < maxPages) {
      const url = `/api/opensea/chain/ethereum/account/${address}/nfts?limit=100${cursor ? `&next=${cursor}` : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(this.TIMEOUTS.OPENSEA)
      })
      
      if (!response.ok) {
        throw new Error(`OpenSea returned ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.nfts || !Array.isArray(data.nfts)) break
      
      // Filter for CryptoKaiju NFTs
      const pageKaijus: KaijuNFT[] = []
      for (const nft of data.nfts) {
        if (nft.contract?.toLowerCase() === KAIJU_NFT_ADDRESS.toLowerCase()) {
          pageKaijus.push(this.convertOpenSeaNFTToKaiju(nft, address))
        }
      }
      
      if (pageKaijus.length > 0) {
        allNFTs.push(...pageKaijus)
      }
      
      cursor = data.next || ''
      if (!cursor || data.nfts.length < 100) break
      
      pageCount++
      if (cursor && pageCount < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return allNFTs
  }

  private convertOpenSeaNFTToKaiju(osNft: any, ownerAddress: string): KaijuNFT {
    const attributes: { [key: string]: any } = {}
    if (osNft.traits && Array.isArray(osNft.traits)) {
      osNft.traits.forEach((trait: any) => {
        if (trait.trait_type && trait.value !== undefined) {
          attributes[trait.trait_type.toLowerCase()] = trait.value
        }
      })
    }

    const nfcTrait = osNft.traits?.find((t: any) => 
      ['nfc', 'nfc_id', 'nfcid', 'chip_id'].includes(t.trait_type?.toLowerCase())
    )
    const batchTrait = osNft.traits?.find((t: any) => 
      t.trait_type?.toLowerCase() === 'batch'
    )

    return {
      tokenId: osNft.identifier || 'unknown',
      nfcId: nfcTrait?.value ? String(nfcTrait.value).trim().toUpperCase() : undefined,
      owner: ownerAddress,
      tokenURI: osNft.metadata_url || '',
      batch: batchTrait?.value ? String(batchTrait.value).trim() : undefined,
      ipfsData: {
        name: osNft.name || `CryptoKaiju #${osNft.identifier}`,
        description: osNft.description || 'A unique CryptoKaiju NFT with physical collectible counterpart.',
        image: osNft.display_image_url || osNft.image_url || '',
        attributes
      }
    }
  }

  private async getTokensFromBlockchain(address: string): Promise<KaijuNFT[]> {
    try {
      const tokenIds = await this.callContractWithTimeout<bigint[]>("tokensOf", [address])
      
      if (tokenIds.length === 0) return []
      
      const BATCH_SIZE = 6
      const results: KaijuNFT[] = []
      
      for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
        const batch = tokenIds.slice(i, i + BATCH_SIZE)
        
        const batchPromises = batch.map(async (tokenId) => {
          try {
            const result = await this.getByTokenId(tokenId.toString())
            return result.nft
          } catch (error) {
            this.warn(`⚠️ Failed to fetch token ${tokenId}:`, error)
            return null
          }
        })
        
        const batchResults = await Promise.allSettled(batchPromises)
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<KaijuNFT>).value)
        
        results.push(...validResults)
        
        if (i + BATCH_SIZE < tokenIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      return results
    } catch (error) {
      throw new CryptoKaijuError({
        type: ErrorType.CONTRACT,
        severity: ErrorSeverity.HIGH,
        message: 'Blockchain token lookup failed',
        userMessage: 'Unable to load your NFT collection from the blockchain.',
        suggestions: [
          'Check your internet connection',
          'Try again in a few minutes'
        ],
        retryable: true,
        context: { address }
      })
    }
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const totalSupply = await this.getTotalSupply()
      return { totalSupply }
    } catch (error) {
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      throw ErrorHandler.normalize(error, { action: 'getCollectionStats' })
    }
  }

  /**
   * Service management methods
   */
  getServiceStats(): ServiceStats {
    return {
      performance: { ...this.performanceMetrics },
      cache: {
        size: this.cache.size,
        keys: []
      },
      pendingRequests: this.pendingRequests.size
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      errors: 0,
      averageResponseTime: 0,
      ipfsSuccessRate: 0,
      openSeaFallbacks: 0
    }
    this.log('🗑️ Cache cleared')
  }

  async testService(): Promise<void> {
    if (!this.DEBUG) return
    
    this.log('🧪 Testing Optimized Service...')
    
    try {
      const totalSupply = await this.getTotalSupply()
      this.log(`✅ Total supply: ${totalSupply}`)
      
      try {
        const result = await this.getByTokenId('1')
        if (result.nft) {
          this.log(`✅ Token lookup: ${result.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        this.log(`⚠️ Token lookup test:`, ErrorHandler.getUserMessage(error))
      }
      
      const stats = this.getServiceStats()
      this.log(`📊 Stats: ${stats.performance.totalRequests} requests, ${stats.performance.cacheHits} cache hits`)
      this.log(`📈 IPFS success rate: ${(stats.performance.ipfsSuccessRate * 100).toFixed(1)}%`)
      this.log(`🔄 OpenSea fallbacks: ${stats.performance.openSeaFallbacks}`)
      
      this.log('🎉 Optimized service test completed!')
      
    } catch (error) {
      this.error('❌ Service test failed:', error)
      throw ErrorHandler.normalize(error, { action: 'testService' })
    }
  }
}

export default new BlockchainCryptoKaijuService()