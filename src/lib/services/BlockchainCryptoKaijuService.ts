// src/lib/services/BlockchainCryptoKaijuService.ts - ENHANCED WITH PERSISTENT CACHE
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'
import { ErrorHandler, ErrorFactory, CryptoKaijuError, ErrorType, ErrorSeverity } from '@/lib/utils/errorHandling'

// CryptoKaiju NFT Contract ABI - OPTIMIZED with tokensOf
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

// OpenSea Account NFTs Response Format
interface OpenSeaAccountNFT {
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
  traits: Array<{
    trait_type: string
    display_type?: string
    max_value?: number
    value: any
  }>
}

interface OpenSeaAccountResponse {
  nfts: OpenSeaAccountNFT[]
  next?: string
}

// ENHANCED: Persistent LRU Cache with Browser Storage
class PersistentLRUCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  private readonly maxSize: number
  private readonly storageKey: string
  private readonly version: number = 2 // Increment to invalidate old cache formats
  private readonly maxStorageSize: number = 5 * 1024 * 1024 // 5MB limit
  private lastCleanup: number = 0
  private readonly cleanupInterval: number = 60 * 60 * 1000 // 1 hour

  constructor(maxSize: number = 200, storageKey: string = 'kaiju_cache') {
    this.maxSize = maxSize
    this.storageKey = storageKey
    
    // Load existing cache from storage on initialization
    this.hydrateFromStorage()
    
    // Set up periodic cleanup
    this.scheduleCleanup()
  }

  get(key: string): T | null {
    try {
      const item = this.cache.get(key)
      if (!item) return null
      
      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key)
        this.persistToStorage() // Update storage
        return null
      }
      
      // Move to end (LRU behavior)
      this.cache.delete(key)
      this.cache.set(key, item)
      
      return item.data
    } catch (error) {
      console.warn('Cache retrieval error:', error)
      return null
    }
  }

  set(key: string, data: T, ttl: number): void {
    try {
      // Remove oldest items if at capacity
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        const firstKey = this.cache.keys().next().value
        if (firstKey) this.cache.delete(firstKey)
      }
      
      this.cache.set(key, { data, timestamp: Date.now(), ttl })
      
      // Persist to storage (debounced)
      this.debouncedPersist()
      
    } catch (error) {
      console.warn('Cache storage error:', error)
    }
  }

  clear(): void {
    this.cache.clear()
    this.clearStorage()
  }

  get size(): number {
    return this.cache.size
  }

  getStats(): { 
    size: number
    keys: string[]
    oldestEntry?: number
    storageSize?: number
    version: number
  } {
    const keys = Array.from(this.cache.keys())
    let oldestTimestamp = Date.now()
    
    for (const item of this.cache.values()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
      }
    }

    return {
      size: this.cache.size,
      keys,
      oldestEntry: oldestTimestamp,
      storageSize: this.getStorageSize(),
      version: this.version
    }
  }

  /**
   * Load cache from localStorage on initialization
   */
  private hydrateFromStorage(): void {
    if (typeof window === 'undefined') return // Server-side safety
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return

      const parsed = JSON.parse(stored)
      
      // Check version compatibility
      if (parsed.version !== this.version) {
        console.log(`🔄 Cache version mismatch (${parsed.version} vs ${this.version}), clearing old cache`)
        this.clearStorage()
        return
      }

      // Restore cache entries with expiration check
      const now = Date.now()
      let restoredCount = 0
      let expiredCount = 0

      for (const [key, item] of Object.entries(parsed.cache || {})) {
        const cacheItem = item as { data: T; timestamp: number; ttl: number }
        
        // Skip expired items
        if (now - cacheItem.timestamp > cacheItem.ttl) {
          expiredCount++
          continue
        }

        this.cache.set(key, cacheItem)
        restoredCount++
      }

      console.log(`💾 Cache hydrated: ${restoredCount} items restored, ${expiredCount} expired items skipped`)
      
      // Clean up if we skipped expired items
      if (expiredCount > 0) {
        this.persistToStorage()
      }

    } catch (error) {
      console.warn('⚠️ Cache hydration failed, starting fresh:', error)
      this.clearStorage()
    }
  }

  /**
   * Persist cache to localStorage
   */
  private persistToStorage(): void {
    if (typeof window === 'undefined') return // Server-side safety
    
    try {
      const cacheObject: any = {}
      
      // Convert Map to plain object
      for (const [key, value] of this.cache.entries()) {
        cacheObject[key] = value
      }

      const payload = {
        version: this.version,
        timestamp: Date.now(),
        cache: cacheObject
      }

      const serialized = JSON.stringify(payload)
      
      // Check storage size limit
      if (serialized.length > this.maxStorageSize) {
        console.warn('⚠️ Cache too large for storage, trimming...')
        this.trimCacheForStorage()
        return // Retry after trimming
      }

      localStorage.setItem(this.storageKey, serialized)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded, trimming cache...')
        this.trimCacheForStorage()
      } else {
        console.warn('⚠️ Cache persistence failed:', error)
      }
    }
  }

  /**
   * Debounced persistence to avoid excessive localStorage writes
   */
  private persistTimeout: NodeJS.Timeout | null = null
  private debouncedPersist(): void {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout)
    }
    
    this.persistTimeout = setTimeout(() => {
      this.persistToStorage()
      this.persistTimeout = null
    }, 1000) // 1 second debounce
  }

  /**
   * Trim cache when storage is full
   */
  private trimCacheForStorage(): void {
    const targetSize = Math.floor(this.maxSize * 0.7) // Trim to 70% capacity
    
    // Sort by timestamp (oldest first)
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Keep only the newest entries
    const toKeep = entries.slice(-targetSize)
    
    this.cache.clear()
    for (const [key, value] of toKeep) {
      this.cache.set(key, value)
    }
    
    console.log(`🗑️ Cache trimmed from ${entries.length} to ${targetSize} items`)
    
    // Try persisting again
    this.persistToStorage()
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('⚠️ Failed to clear cache storage:', error)
    }
  }

  /**
   * Get current storage size in bytes
   */
  private getStorageSize(): number {
    if (typeof window === 'undefined') return 0
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? stored.length : 0
    } catch (error) {
      return 0
    }
  }

  /**
   * Schedule periodic cleanup of expired items
   */
  private scheduleCleanup(): void {
    if (typeof window === 'undefined') return
    
    setInterval(() => {
      this.cleanupExpiredItems()
    }, this.cleanupInterval)
  }

  /**
   * Remove expired items from cache
   */
  private cleanupExpiredItems(): void {
    const now = Date.now()
    let removedCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Cleanup: Removed ${removedCount} expired cache items`)
      this.persistToStorage()
    }
    
    this.lastCleanup = now
  }

  /**
   * Force cleanup (useful for debugging)
   */
  public forceCleanup(): void {
    this.cleanupExpiredItems()
  }

  /**
   * Get cache health metrics
   */
  public getHealthMetrics(): {
    totalItems: number
    expiredItems: number
    storageUsage: number
    lastCleanup: number
    version: number
  } {
    const now = Date.now()
    let expiredCount = 0
    
    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expiredCount++
      }
    }
    
    return {
      totalItems: this.cache.size,
      expiredItems: expiredCount,
      storageUsage: this.getStorageSize(),
      lastCleanup: this.lastCleanup,
      version: this.version
    }
  }
}

class BlockchainCryptoKaijuService {
  private contract: any
  private cache = new PersistentLRUCache<any>(200, 'cryptokaiju_cache') // ENHANCED: Now persistent!
  private pendingRequests = new Map<string, Promise<any>>()
  
  // IPFS gateways for racing
  private readonly IPFS_GATEWAYS = [
    'https://cryptokaiju.mypinata.cloud/ipfs',
    'https://gateway.pinata.cloud/ipfs',
    'https://cloudflare-ipfs.com/ipfs',
    'https://ipfs.io/ipfs',
    'https://dweb.link/ipfs'
  ]
  
  // Optimized timeouts
  private readonly TIMEOUTS = {
    CONTRACT: 8000,     // 8s for blockchain calls (increased)
    IPFS_RACE: 4000,    // 4s for each IPFS gateway
    OPENSEA: 10000,     // 10s for OpenSea API
    CACHE_TTL: 300000   // 5 minutes cache
  }

  // Enhanced debug mode
  private readonly DEBUG = process.env.NODE_ENV === 'development'
  private readonly VERBOSE = process.env.NEXT_PUBLIC_DEBUG === 'true'

  // Performance tracking
  private performanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    errors: 0,
    averageResponseTime: 0
  }

  constructor() {
    try {
      this.contract = getContract({
        client: thirdwebClient,
        chain: ethereum,
        address: KAIJU_NFT_ADDRESS,
        abi: KAIJU_NFT_ABI,
      })
      
      this.log('🚀 BlockchainCryptoKaijuService initialized with persistent cache')
      this.log(`📊 Cache configured: ${this.cache.size}/${200} max entries`)
      
      // Log cache restoration stats
      const cacheStats = this.cache.getStats()
      if (cacheStats.size > 0) {
        this.log(`💾 Restored ${cacheStats.size} items from persistent cache`)
      }
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

  private verbose(...args: any[]): void {
    if (this.VERBOSE) {
      console.log('[BlockchainService][VERBOSE]', ...args)
    }
  }

  /**
   * Enhanced request deduplication with error handling
   */
  private async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      this.verbose(`🔄 Deduplicating request: ${key}`)
      return this.pendingRequests.get(key)!
    }

    const promise = request()
      .catch(error => {
        // Convert to enhanced error before throwing
        throw ErrorHandler.normalize(error, { requestKey: key })
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })
    
    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * IMPROVED: Smart NFC encoding detection with comprehensive logic
   */
  private detectNFCEncoding(nfcId: string): 'direct' | 'ascii' {
    if (!nfcId) return 'ascii'
    
    const cleanNfc = nfcId.replace(/^0x/, '').toUpperCase()
    
    // Check if it looks like direct hex encoding:
    // - Only contains hex characters (0-9, A-F)
    // - Has reasonable length (8+ characters, even number)
    // - Doesn't contain obvious ASCII patterns
    const isHexPattern = /^[0-9A-F]+$/.test(cleanNfc)
    const hasEvenLength = cleanNfc.length % 2 === 0
    const isReasonableLength = cleanNfc.length >= 8 && cleanNfc.length <= 32
    
    this.verbose(`🧠 NFC Analysis: ${cleanNfc}`)
    this.verbose(`   Hex pattern: ${isHexPattern}`)
    this.verbose(`   Even length: ${hasEvenLength}`)
    this.verbose(`   Reasonable length: ${isReasonableLength}`)
    
    if (isHexPattern && hasEvenLength && isReasonableLength) {
      // Additional check: if it doesn't look like ASCII-encoded text
      // ASCII encoding would have patterns like 30-39 (0-9) and 41-46 (A-F)
      try {
        let hasNonHexAscii = false
        let asciiChars = ''
        
        for (let i = 0; i < Math.min(cleanNfc.length - 1, 16); i += 2) {
          const hexPair = cleanNfc.substr(i, 2)
          const charCode = parseInt(hexPair, 16)
          
          // Check if this looks like encoded ASCII
          if (charCode >= 32 && charCode <= 126) {
            asciiChars += String.fromCharCode(charCode)
            // Check if it's outside of typical hex range
            if (!(charCode >= 48 && charCode <= 70)) {
              hasNonHexAscii = true
            }
          }
        }
        
        this.verbose(`   ASCII interpretation: "${asciiChars}"`)
        this.verbose(`   Has non-hex ASCII: ${hasNonHexAscii}`)
        
        // If we found clear ASCII patterns, likely ASCII encoding
        if (hasNonHexAscii && asciiChars.length >= 4) {
          return 'ascii'
        }
        
        // If no ASCII patterns detected, likely direct hex
        return 'direct'
        
      } catch (e) {
        this.verbose(`   ASCII analysis failed: ${e}`)
        // If parsing fails, fall back to ASCII as it's more common
        return 'ascii'
      }
    }
    
    this.verbose(`   Defaulting to ASCII encoding`)
    return 'ascii'
  }

  /**
   * Convert NFC ID to bytes32 format (ASCII encoding)
   */
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
    
    const paddedHex = asciiHex.padEnd(64, '0')
    return '0x' + paddedHex
  }

  /**
   * Convert NFC ID to bytes32 format (Direct hex encoding)
   */
  private nfcToBytes32Direct(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    const cleanNfc = nfcId.replace(/^0x/, '').toLowerCase()
    const paddedHex = cleanNfc.padEnd(64, '0')
    return '0x' + paddedHex
  }

  /**
   * Convert bytes32 to NFC hex string
   */
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
    
    // Otherwise, treat as direct hex encoding
    const directHex = hex.replace(/0+$/, '').toUpperCase()
    return directHex
  }

  /**
   * Enhanced blockchain calls with timeout and comprehensive error handling
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
        this.verbose(`💾 Cache hit: ${cacheKey}`)
        return cached
      }
    }

    const key = cacheKey || `${method}:${JSON.stringify(params)}`
    
    return this.deduplicate(key, async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        this.warn(`⏰ Contract call ${method} timed out after ${this.TIMEOUTS.CONTRACT}ms`)
      }, this.TIMEOUTS.CONTRACT)
      
      try {
        this.performanceMetrics.totalRequests++
        this.verbose(`📞 Contract call: ${method}(${params.map(p => p.toString()).join(', ')})`)
        
        const result = await readContract({
          contract: this.contract,
          method: method as any,
          params: params as any
        })
        
        clearTimeout(timeoutId)
        
        const duration = Date.now() - startTime
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + duration) / 2
        
        this.verbose(`✅ Contract call completed in ${duration}ms`)
        
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
            technicalDetails: `Contract method ${method} exceeded ${this.TIMEOUTS.CONTRACT}ms timeout`,
            suggestions: [
              'Check your internet connection',
              'Try again in a few moments',
              'The Ethereum network might be congested'
            ],
            retryable: true,
            context: { method, params, timeout: this.TIMEOUTS.CONTRACT }
          })
        }
        
        // Network or contract-specific errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        if (errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
          throw new CryptoKaijuError({
            type: ErrorType.CONTRACT,
            severity: ErrorSeverity.MEDIUM,
            message: `Contract execution reverted: ${method}`,
            userMessage: 'The requested data was not found on the blockchain.',
            technicalDetails: errorMessage,
            suggestions: [
              'Double-check the Token ID or NFC ID',
              'This Kaiju might not exist',
              'Try searching in the Kaijudex instead'
            ],
            retryable: false,
            context: { method, params, contractError: true }
          })
        }
        
        throw ErrorHandler.normalize(error, { method, params, contractCall: true })
      }
    })
  }

  /**
   * ENHANCED: Race multiple IPFS gateways with sophisticated error handling
   */
  private async fetchIpfsMetadataWithRacing(tokenURI: string): Promise<any> {
    const cacheKey = `ipfs:${tokenURI}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      this.verbose(`💾 IPFS cache hit: ${tokenURI}`)
      return cached
    }

    return this.deduplicate(cacheKey, async () => {
      try {
        this.log(`📁 Fetching IPFS metadata: ${tokenURI}`)

        // First try the contract URL directly (often fastest)
        const directPromise = fetch(tokenURI, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_RACE)
        }).then(res => {
          if (!res.ok) throw new Error(`Direct fetch failed: ${res.status}`)
          return res.json()
        })

        // Extract IPFS hash if present
        let ipfsRacePromises: Promise<any>[] = [directPromise]
        let ipfsHash = ''
        
        if (tokenURI.includes('/ipfs/')) {
          ipfsHash = tokenURI.split('/ipfs/')[1].split('?')[0] // Remove query params
          
          // Race all IPFS gateways
          const gatewayPromises = this.IPFS_GATEWAYS.map((gateway, index) => 
            fetch(`${gateway}/${ipfsHash}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_RACE)
            }).then(res => {
              if (!res.ok) throw new Error(`${gateway} returned ${res.status}`)
              this.verbose(`🏆 IPFS race winner: ${gateway}`)
              return res.json()
            }).catch(error => {
              this.verbose(`🐌 IPFS gateway failed: ${gateway} - ${error.message}`)
              throw error
            })
          )
          
          ipfsRacePromises = [...ipfsRacePromises, ...gatewayPromises]
        }

        // Race all requests
        const data = await Promise.race(ipfsRacePromises)
        
        this.cache.set(cacheKey, data, 24 * 60 * 60 * 1000) // 24hr cache
        this.log(`✅ IPFS metadata fetched successfully`)
        return data
        
      } catch (error) {
        this.warn(`⚠️ IPFS fetch failed for ${tokenURI}`)
        
        // Final fallback: API proxy
        if (tokenURI.includes('/ipfs/')) {
          try {
            const ipfsHash = tokenURI.split('/ipfs/')[1].split('?')[0]
            const proxyUrl = `/api/ipfs/${ipfsHash}`
            
            this.verbose(`🔄 Trying IPFS proxy: ${proxyUrl}`)
            
            const proxyResponse = await fetch(proxyUrl, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_RACE)
            })
            
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json()
              
              // Check if it's a fallback response
              if (proxyData.fallback) {
                this.warn(`📦 Using IPFS fallback data for ${ipfsHash}`)
                this.cache.set(cacheKey, proxyData.fallback, 60 * 60 * 1000) // 1hr cache for fallbacks
                return proxyData.fallback
              }
              
              this.log(`✅ IPFS data fetched via proxy`)
              this.cache.set(cacheKey, proxyData, 24 * 60 * 60 * 1000)
              return proxyData
            }
          } catch (proxyError) {
            this.verbose(`🚫 IPFS proxy also failed: ${proxyError}`)
          }
        }
        
        // Create specific IPFS error with helpful context
        const ipfsHash = tokenURI.includes('/ipfs/') ? 
          tokenURI.split('/ipfs/')[1].split('?')[0] : tokenURI
          
        throw ErrorFactory.ipfsError(ipfsHash)
      }
    })
  }

  /**
   * ENHANCED: Get OpenSea data with comprehensive error handling
   */
  private async getOpenSeaDataOptimized(tokenId: string): Promise<OpenSeaAsset | null> {
    const cacheKey = `opensea:${tokenId}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      this.verbose(`💾 OpenSea cache hit: ${tokenId}`)
      return cached
    }

    return this.deduplicate(cacheKey, async () => {
      try {
        const proxyUrl = `/api/opensea/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
          this.warn(`⏰ OpenSea request timeout for token ${tokenId}`)
        }, this.TIMEOUTS.OPENSEA)
        
        this.verbose(`🌊 Fetching OpenSea data for token ${tokenId}`)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        // Handle specific HTTP status codes
        if (response.status === 503) {
          this.warn(`🚫 OpenSea service unavailable for token ${tokenId}`)
          return this.createFallbackOpenSeaData(tokenId)
        }
        
        if (response.status === 429) {
          this.warn(`⏰ OpenSea rate limit exceeded for token ${tokenId}`)
          throw ErrorFactory.rateLimitError('opensea')
        }
        
        if (response.status === 404) {
          this.warn(`🔍 Token ${tokenId} not found on OpenSea`)
          return this.createFallbackOpenSeaData(tokenId)
        }
        
        if (!response.ok) {
          throw new Error(`OpenSea API returned ${response.status}: ${response.statusText}`)
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
          this.log(`✅ OpenSea data fetched for token ${tokenId}`)
          return result
        }
        
        this.warn(`📦 No NFT data in OpenSea response for token ${tokenId}`)
        return this.createFallbackOpenSeaData(tokenId)
        
      } catch (error) {
        if (error instanceof CryptoKaijuError) {
          throw error
        }
        
        // Log but don't fail - OpenSea is supplementary data
        const osError = ErrorHandler.normalize(error, { 
          service: 'opensea', 
          tokenId,
          action: 'getOpenSeaData'
        })
        
        // Only log high severity errors to avoid spam
        if (osError.severity === ErrorSeverity.HIGH || osError.severity === ErrorSeverity.CRITICAL) {
          ErrorHandler.log(osError)
        }
        
        return this.createFallbackOpenSeaData(tokenId)
      }
    })
  }

  /**
   * Create enhanced fallback OpenSea data
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
   * ENHANCED: Get NFT by Token ID with comprehensive error handling and performance optimization
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      // Comprehensive input validation
      if (!tokenId || typeof tokenId !== 'string') {
        throw ErrorFactory.validationError('tokenId', tokenId)
      }
      
      const tokenIdNum = parseInt(tokenId.trim())
      if (isNaN(tokenIdNum) || tokenIdNum < 0 || tokenIdNum > 1000000) {
        throw ErrorFactory.validationError('tokenId', tokenId)
      }

      this.log(`🔍 Fetching Token ID: ${tokenId}`)

      // Launch all requests in parallel for maximum speed
      const [tokenDetailsResult, ownerResult, tokenURIResult] = await Promise.allSettled([
        this.callContractWithTimeout("tokenDetails", [BigInt(tokenId)], `tokenDetails:${tokenId}`),
        this.callContractWithTimeout("ownerOf", [BigInt(tokenId)], `owner:${tokenId}`),
        this.callContractWithTimeout("tokenURI", [BigInt(tokenId)], `tokenURI:${tokenId}`)
      ])

      // Enhanced error checking with specific error messages
      if (tokenDetailsResult.status === 'rejected') {
        this.warn(`Contract call failed for token ${tokenId}:`, tokenDetailsResult.reason)
        
        // Check if it's a "doesn't exist" error vs network error
        const reason = tokenDetailsResult.reason
        if (reason?.message?.includes('execution reverted') || 
            reason?.message?.includes('ERC721: invalid token ID')) {
          throw ErrorFactory.nftNotFound(tokenId)
        }
        
        throw ErrorHandler.normalize(reason, { tokenId, action: 'tokenDetails' })
      }

      if (ownerResult.status === 'rejected') {
        this.warn(`Owner lookup failed for token ${tokenId}:`, ownerResult.reason)
        throw ErrorFactory.nftNotFound(tokenId)
      }

      // Extract contract data
      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetailsResult.value as any
      const ownerAddress = ownerResult.value as string
      const tokenURI = tokenURIResult.status === 'fulfilled' ? 
        (tokenURIResult.value as string) : (tokenDetailsURI as string)

      const nfcId = this.bytes32ToNFC(nfcIdBytes32)

      this.verbose(`📊 Contract data extracted:`)
      this.verbose(`   Token ID: ${contractTokenId}`)
      this.verbose(`   Owner: ${ownerAddress}`)
      this.verbose(`   NFC ID: ${nfcId || 'None'}`)
      this.verbose(`   Birth Date: ${birthDate}`)
      this.verbose(`   Token URI: ${tokenURI}`)

      // Launch IPFS (with racing) and OpenSea in parallel
      const [ipfsResult, openSeaResult] = await Promise.allSettled([
        tokenURI ? this.fetchIpfsMetadataWithRacing(tokenURI) : Promise.resolve(null),
        this.getOpenSeaDataOptimized(tokenId)
      ])

      // Build final NFT object
      const kaiju: KaijuNFT = {
        tokenId: contractTokenId.toString(),
        nfcId,
        owner: ownerAddress,
        tokenURI: tokenURI,
        birthDate: Number(birthDate)
      }

      // Handle IPFS data with error context
      if (ipfsResult.status === 'fulfilled' && ipfsResult.value) {
        kaiju.ipfsData = ipfsResult.value
        this.verbose(`✅ IPFS data loaded: ${ipfsResult.value.name}`)
      } else if (ipfsResult.status === 'rejected') {
        // Log IPFS error but don't fail the whole request
        const ipfsError = ErrorHandler.normalize(ipfsResult.reason, { 
          service: 'ipfs', 
          tokenUri: tokenURI,
          tokenId 
        })
        
        // Only log if it's not a common IPFS issue
        if (ipfsError.type !== ErrorType.IPFS) {
          ErrorHandler.log(ipfsError)
        }
        
        this.warn(`⚠️ IPFS metadata unavailable for token ${tokenId}`)
      }

      // Handle OpenSea data
      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId)

      // Extract batch from OpenSea traits with validation
      if (finalOpenSeaData?.traits && Array.isArray(finalOpenSeaData.traits)) {
        const batchTrait = finalOpenSeaData.traits.find(trait => 
          trait.trait_type?.toLowerCase() === 'batch'
        )
        if (batchTrait?.value) {
          kaiju.batch = String(batchTrait.value).trim()
          this.verbose(`📦 Batch extracted: ${kaiju.batch}`)
        }
      }

      const duration = Date.now() - startTime
      this.log(`✅ Successfully fetched Token ID ${tokenId} in ${duration}ms: ${kaiju.ipfsData?.name || 'Unnamed'}`)
      
      return { nft: kaiju, openSeaData: finalOpenSeaData }

    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ Failed to fetch Token ID ${tokenId} after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      const enhancedError = ErrorHandler.normalize(error, { 
        tokenId, 
        action: 'getByTokenId',
        duration 
      })
      throw enhancedError
    }
  }

  /**
   * ENHANCED: Get NFT by NFC ID with smart encoding detection and comprehensive error handling
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      // Input validation
      if (!nfcId || typeof nfcId !== 'string') {
        throw ErrorFactory.validationError('nfcId', nfcId)
      }
      
      const cleanNfcId = nfcId.trim()
      if (cleanNfcId.length < 4 || cleanNfcId.length > 32) {
        throw ErrorFactory.validationError('nfcId', nfcId)
      }

      this.log(`🔍 Looking up NFC ID: ${cleanNfcId}`)
      
      // Smart encoding detection
      const likelyEncoding = this.detectNFCEncoding(cleanNfcId)
      this.log(`🧠 Detected likely encoding: ${likelyEncoding}`)
      
      const nfcBytes32ASCII = this.nfcToBytes32ASCII(cleanNfcId)
      const nfcBytes32Direct = this.nfcToBytes32Direct(cleanNfcId)
      
      let nfcDetails: any
      let usedEncoding = likelyEncoding
      let attemptCount = 0
      
      // Try the likely encoding first
      const primaryBytes32 = likelyEncoding === 'direct' ? nfcBytes32Direct : nfcBytes32ASCII
      const fallbackBytes32 = likelyEncoding === 'direct' ? nfcBytes32ASCII : nfcBytes32Direct
      const fallbackEncoding = likelyEncoding === 'direct' ? 'ascii' : 'direct'
      
      this.verbose(`🔑 Primary encoding (${likelyEncoding}): ${primaryBytes32}`)
      this.verbose(`🔑 Fallback encoding (${fallbackEncoding}): ${fallbackBytes32}`)
      
      try {
        attemptCount++
        this.log(`🎯 Attempt ${attemptCount}: Trying ${likelyEncoding} encoding first`)
        
        nfcDetails = await this.callContractWithTimeout(
          "nfcDetails", 
          [primaryBytes32], 
          `nfcDetails:${cleanNfcId}:${likelyEncoding}`
        )
        
        const [tokenId] = nfcDetails as [bigint, string, string, bigint]
        if (Number(tokenId) === 0) {
          throw new Error(`Not found with ${likelyEncoding} encoding`)
        }
        
        this.log(`✅ Found with ${likelyEncoding} encoding on first try!`)
        
      } catch (primaryError) {
        this.log(`⚠️ ${likelyEncoding} encoding failed, trying ${fallbackEncoding}`)
        
        try {
          attemptCount++
          this.log(`🎯 Attempt ${attemptCount}: Trying ${fallbackEncoding} encoding`)
          
          nfcDetails = await this.callContractWithTimeout(
            "nfcDetails", 
            [fallbackBytes32], 
            `nfcDetails:${cleanNfcId}:${fallbackEncoding}`
          )
          
          const [tokenId] = nfcDetails as [bigint, string, string, bigint]
          if (Number(tokenId) === 0) {
            throw new Error(`Not found with ${fallbackEncoding} encoding either`)
          }
          
          usedEncoding = fallbackEncoding
          this.log(`✅ Found with ${fallbackEncoding} encoding on second try`)
          
        } catch (fallbackError) {
          this.log(`❌ Both encodings failed for NFC ID: ${cleanNfcId}`)
          throw ErrorFactory.nfcScanError(cleanNfcId)
        }
      }
      
      const [tokenId, returnedNfcId, tokenUri, dob] = nfcDetails as [bigint, string, string, bigint]
      
      this.log(`📊 NFC Lookup Stats: Found token ${tokenId} using ${usedEncoding} encoding in ${attemptCount} attempt(s)`)
      
      // Launch all parallel operations
      const [ownerResult, ipfsResult, openSeaResult] = await Promise.allSettled([
        this.callContractWithTimeout("ownerOf", [tokenId], `owner:${tokenId}`),
        tokenUri ? this.fetchIpfsMetadataWithRacing(tokenUri) : Promise.resolve(null),
        this.getOpenSeaDataOptimized(tokenId.toString())
      ])
      
      // Build NFT object
      const kaiju: KaijuNFT = {
        tokenId: tokenId.toString(),
        nfcId: this.bytes32ToNFC(returnedNfcId),
        owner: ownerResult.status === 'fulfilled' ? (ownerResult.value as string) : '',
        tokenURI: tokenUri,
        birthDate: Number(dob)
      }
      
      // Handle IPFS data
      if (ipfsResult.status === 'fulfilled' && ipfsResult.value) {
        kaiju.ipfsData = ipfsResult.value
      } else if (ipfsResult.status === 'rejected') {
        const ipfsError = ErrorHandler.normalize(ipfsResult.reason, { 
          service: 'ipfs', 
          tokenUri,
          nfcId: cleanNfcId 
        })
        
        if (ipfsError.type !== ErrorType.IPFS) {
          ErrorHandler.log(ipfsError)
        }
      }
      
      // Handle OpenSea data
      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId.toString())
      
      // Extract batch from OpenSea
      if (finalOpenSeaData?.traits) {
        const batchTrait = finalOpenSeaData.traits.find(trait => 
          trait.trait_type?.toLowerCase() === 'batch'
        )
        if (batchTrait?.value) {
          kaiju.batch = String(batchTrait.value).trim()
        }
      }
      
      const duration = Date.now() - startTime
      this.log(`✅ Successfully found NFC ${cleanNfcId} -> Token ${tokenId} in ${duration}ms: ${kaiju.ipfsData?.name || 'Unnamed'}`)
      
      return { nft: kaiju, openSeaData: finalOpenSeaData }
      
    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ NFC lookup failed for ${nfcId} after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      const enhancedError = ErrorHandler.normalize(error, { 
        nfcId, 
        action: 'getByNFCId',
        duration 
      })
      throw enhancedError
    }
  }

  /**
   * ENHANCED: Search tokens with better error context and performance tracking
   */
  async searchTokens(query: string): Promise<SearchResult[]> {
    const startTime = Date.now()
    const trimmedQuery = query.trim()
    
    if (!trimmedQuery) {
      return []
    }
    
    this.log(`🔍 Searching for: "${trimmedQuery}"`)
    
    const isTokenId = /^\d+$/.test(trimmedQuery)
    
    try {
      if (isTokenId) {
        this.log(`🎯 Detected Token ID search: ${trimmedQuery}`)
        const result = await this.getByTokenId(trimmedQuery)
        
        if (result.nft) {
          const duration = Date.now() - startTime
          this.log(`✅ Token ID search successful in ${duration}ms: Found ${result.nft.ipfsData?.name || 'Unnamed Kaiju'}`)
          return [{ nft: result.nft, openSeaData: result.openSeaData }]
        } else {
          this.log(`❌ Token ID search failed: Token ${trimmedQuery} not found`)
          return []
        }
      } else {
        this.log(`🏷️ Detected NFC ID search: ${trimmedQuery}`)
        const result = await this.getByNFCId(trimmedQuery)
        
        if (result.nft) {
          const duration = Date.now() - startTime
          this.log(`✅ NFC ID search successful in ${duration}ms: Found ${result.nft.ipfsData?.name || 'Unnamed Kaiju'}`)
          return [{ nft: result.nft, openSeaData: result.openSeaData }]
        } else {
          this.log(`❌ NFC ID search failed: NFC ${trimmedQuery} not found`)
          return []
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ Search error for query "${trimmedQuery}" after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      const enhancedError = ErrorHandler.normalize(error, { 
        query: trimmedQuery, 
        action: 'searchTokens',
        duration,
        searchType: isTokenId ? 'tokenId' : 'nfcId'
      })
      throw enhancedError
    }
  }

  /**
   * Get total supply with enhanced error handling
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.callContractWithTimeout<bigint>("totalSupply", [], "totalSupply")
      const result = Number(supply)
      this.log(`📊 Total supply: ${result}`)
      return result
    } catch (error) {
      this.error('❌ Error fetching total supply:', error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      throw ErrorHandler.normalize(error, { action: 'getTotalSupply' })
    }
  }

  /**
   * ENHANCED: Get tokens owned by address with comprehensive error handling and progress tracking
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    const startTime = Date.now()
    const cacheKey = `tokens:${address}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      this.log(`💾 Cache hit for address ${address}: ${cached.length} tokens`)
      return cached
    }

    try {
      // Enhanced address validation
      if (!address || typeof address !== 'string') {
        throw ErrorFactory.validationError('address', address)
      }
      
      const cleanAddress = address.trim().toLowerCase()
      if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
        throw ErrorFactory.validationError('address', address)
      }

      this.log(`🔍 Fetching tokens for address: ${cleanAddress}`)

      // Try OpenSea first (faster for most users and provides rich metadata)
      try {
        this.log(`🌊 Attempting OpenSea lookup for ${cleanAddress}`)
        const openSeaResults = await this.getTokensForAddressFromOpenSea(cleanAddress)
        
        if (openSeaResults.length > 0) {
          const duration = Date.now() - startTime
          this.log(`✅ Found ${openSeaResults.length} tokens via OpenSea in ${duration}ms`)
          this.cache.set(cacheKey, openSeaResults, this.TIMEOUTS.CACHE_TTL)
          return openSeaResults
        }
        
        this.log(`ℹ️ No tokens found via OpenSea, trying blockchain...`)
      } catch (openSeaError) {
        const osError = ErrorHandler.normalize(openSeaError, { 
          service: 'opensea', 
          address: cleanAddress,
          action: 'getTokensForAddress'
        })
        
        // Only log high severity OpenSea errors
        if (osError.severity === ErrorSeverity.HIGH || osError.severity === ErrorSeverity.CRITICAL) {
          ErrorHandler.log(osError)
        }
        
        this.log(`⚠️ OpenSea failed (${osError.type}), falling back to blockchain lookup`)
      }
      
      // Fallback to blockchain with progress tracking
      this.log(`⛓️ Starting blockchain lookup for ${cleanAddress}`)
      const blockchainResults = await this.getTokensForAddressFromBlockchain(cleanAddress)
      
      const duration = Date.now() - startTime
      this.log(`✅ Found ${blockchainResults.length} tokens via blockchain in ${duration}ms`)
      
      this.cache.set(cacheKey, blockchainResults, this.TIMEOUTS.CACHE_TTL)
      return blockchainResults
      
    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`❌ Failed to fetch tokens for address ${address} after ${duration}ms:`, error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      const enhancedError = ErrorHandler.normalize(error, { 
        address, 
        action: 'getTokensForAddress',
        duration
      })
      throw enhancedError
    }
  }

  /**
   * Get tokens from OpenSea API with enhanced error handling and rate limiting respect
   */
  private async getTokensForAddressFromOpenSea(address: string): Promise<KaijuNFT[]> {
    try {
      const allCryptoKaijuNFTs: KaijuNFT[] = []
      let currentCursor = ''
      let pageCount = 0
      const maxPages = 20
      let consecutivePagesWithoutKaiju = 0
      const maxConsecutiveEmpty = 3
      
      this.verbose(`🌊 Starting OpenSea pagination for ${address}`)
      
      while (pageCount < maxPages) {
        const url = `/api/opensea/chain/ethereum/account/${address}/nfts?limit=100${currentCursor ? `&next=${currentCursor}` : ''}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.OPENSEA)
        
        this.verbose(`📄 Fetching OpenSea page ${pageCount + 1}: ${url}`)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.status === 503 || response.status >= 500) {
          throw new CryptoKaijuError({
            type: ErrorType.OPENSEA,
            severity: ErrorSeverity.MEDIUM,
            message: 'OpenSea service unavailable',
            userMessage: 'OpenSea marketplace is temporarily unavailable.',
            suggestions: ['Using blockchain data instead', 'Try again in a few minutes'],
            retryable: true,
            context: { status: response.status, address }
          })
        }
        
        if (response.status === 429) {
          throw ErrorFactory.rateLimitError('opensea')
        }
        
        if (!response.ok) {
          throw new Error(`OpenSea API returned ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.nfts || !Array.isArray(data.nfts)) {
          this.warn(`⚠️ Unexpected OpenSea response format on page ${pageCount + 1}`)
          break
        }
        
        // Filter and convert CryptoKaiju NFTs with error handling
        const pageKaijus: KaijuNFT[] = []
        
        for (const nft of data.nfts) {
          try {
            if (nft.contract?.toLowerCase() === KAIJU_NFT_ADDRESS.toLowerCase()) {
              const convertedKaiju = this.convertOpenSeaNFTToKaiju(nft, address)
              pageKaijus.push(convertedKaiju)
            }
          } catch (conversionError) {
            this.warn(`⚠️ Failed to convert OpenSea NFT ${nft.identifier}:`, conversionError)
            // Continue with other NFTs instead of failing the whole batch
          }
        }
        
        this.verbose(`📊 Page ${pageCount + 1}: Found ${pageKaijus.length} CryptoKaiju out of ${data.nfts.length} total NFTs`)
        
        if (pageKaijus.length > 0) {
          allCryptoKaijuNFTs.push(...pageKaijus)
          consecutivePagesWithoutKaiju = 0
        } else {
          consecutivePagesWithoutKaiju++
          
          // Optimization: Stop if we've had several pages without any CryptoKaiju
          if (consecutivePagesWithoutKaiju >= maxConsecutiveEmpty && allCryptoKaijuNFTs.length > 0) {
            this.log(`🛑 Stopping after ${consecutivePagesWithoutKaiju} pages without CryptoKaiju`)
            break
          }
        }
        
        currentCursor = data.next || ''
        if (!currentCursor || data.nfts.length < 100) {
          this.log(`📄 Reached end of OpenSea pagination`)
          break
        }
        
        pageCount++
        
        // Respectful delay between requests
        if (currentCursor && pageCount < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      this.log(`🎯 OpenSea summary: ${allCryptoKaijuNFTs.length} CryptoKaiju NFTs found across ${pageCount} pages`)
      return allCryptoKaijuNFTs
      
    } catch (error) {
      // Re-throw CryptoKaijuErrors as-is
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      // Convert other errors to OpenSea-specific errors
      throw ErrorFactory.openSeaError('collection_fetch')
    }
  }

  /**
   * Convert OpenSea NFT to KaijuNFT with enhanced error handling
   */
  private convertOpenSeaNFTToKaiju(osNft: OpenSeaAccountNFT, ownerAddress: string): KaijuNFT {
    try {
      const nfcId = this.extractNFCFromTraits(osNft.traits)
      const batch = this.extractBatchFromTraits(osNft.traits)
      
      // Build attributes object with error handling
      const attributes: { [key: string]: any } = {}
      if (osNft.traits && Array.isArray(osNft.traits)) {
        osNft.traits.forEach(trait => {
          if (trait.trait_type && trait.value !== undefined) {
            attributes[trait.trait_type.toLowerCase()] = trait.value
          }
        })
      }

      return {
        tokenId: osNft.identifier || 'unknown',
        nfcId,
        owner: ownerAddress,
        tokenURI: osNft.metadata_url || '',
        batch,
        ipfsData: {
          name: osNft.name || `CryptoKaiju #${osNft.identifier}`,
          description: osNft.description || 'A unique CryptoKaiju NFT with physical collectible counterpart.',
          image: osNft.display_image_url || osNft.image_url || '',
          attributes
        }
      }
    } catch (error) {
      this.warn(`⚠️ Error converting OpenSea NFT ${osNft.identifier}:`, error)
      
      // Return minimal fallback instead of failing
      return {
        tokenId: osNft.identifier || 'unknown',
        owner: ownerAddress,
        tokenURI: '',
        ipfsData: {
          name: `CryptoKaiju #${osNft.identifier}`,
          description: 'NFT data temporarily unavailable',
          image: '/images/placeholder-kaiju.png',
          attributes: {}
        }
      }
    }
  }

  /**
   * Extract NFC ID from traits with validation
   */
  private extractNFCFromTraits(traits: Array<{ trait_type: string; value: any }>): string | undefined {
    if (!traits || !Array.isArray(traits)) return undefined
    
    const nfcTrait = traits.find(trait => {
      const traitType = trait.trait_type?.toLowerCase() || ''
      return traitType === 'nfc' || 
             traitType === 'nfc_id' || 
             traitType === 'nfcid' ||
             traitType === 'chip_id'
    })
    
    if (nfcTrait?.value) {
      const nfcValue = String(nfcTrait.value).trim().toUpperCase()
      // Validate NFC format
      if (nfcValue.length >= 4 && /^[0-9A-F]+$/.test(nfcValue.replace(/^0x/, ''))) {
        return nfcValue
      }
    }
    
    return undefined
  }

  /**
   * Extract batch from traits with validation
   */
  private extractBatchFromTraits(traits: Array<{ trait_type: string; value: any }>): string | undefined {
    if (!traits || !Array.isArray(traits)) return undefined
    
    const batchTrait = traits.find(trait => 
      trait.trait_type?.toLowerCase() === 'batch'
    )
    
    return batchTrait?.value ? String(batchTrait.value).trim() : undefined
  }

  /**
   * Fallback: Get tokens from blockchain with enhanced error handling
   */
  private async getTokensForAddressFromBlockchain(address: string): Promise<KaijuNFT[]> {
    try {
      this.log(`⛓️ Trying tokensOf method for ${address}`)
      
      const tokenIds = await this.callContractWithTimeout<bigint[]>(
        "tokensOf", 
        [address], 
        `tokensOf:${address}`
      )
      
      if (tokenIds.length === 0) {
        this.log(`ℹ️ No tokens found for address ${address}`)
        return []
      }
      
      this.log(`📊 Found ${tokenIds.length} token IDs, fetching details...`)
      
      // Process in batches for speed and reliability
      const BATCH_SIZE = 8 // Reduced for better reliability
      const results: KaijuNFT[] = []
      
      for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
        const batch = tokenIds.slice(i, i + BATCH_SIZE)
        this.verbose(`📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(tokenIds.length/BATCH_SIZE)}`)
        
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
        
        // Small delay between batches to be respectful
        if (i + BATCH_SIZE < tokenIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      this.log(`✅ Successfully fetched ${results.length}/${tokenIds.length} tokens from blockchain`)
      return results
      
    } catch (error) {
      this.warn(`⚠️ tokensOf method failed, trying fallback approach`)
      return this.getTokensForAddressFinalFallback(address)
    }
  }

  /**
   * Final fallback method with enhanced error handling
   */
  private async getTokensForAddressFinalFallback(address: string): Promise<KaijuNFT[]> {
    try {
      this.log(`🔧 Using final fallback method for ${address}`)
      
      const balance = await this.callContractWithTimeout<bigint>(
        "balanceOf", 
        [address], 
        `balance:${address}`
      )
      const tokenCount = Number(balance)
      
      if (tokenCount === 0) {
        this.log(`ℹ️ Balance is 0 for address ${address}`)
        return []
      }
      
      if (tokenCount > 100) {
        this.warn(`⚠️ Address ${address} has ${tokenCount} tokens, limiting to first 100`)
      }
      
      const limitedCount = Math.min(tokenCount, 100)
      
      const tokenIdPromises = Array.from({ length: limitedCount }, (_, i) =>
        this.callContractWithTimeout<bigint>("tokenOfOwnerByIndex", [address, BigInt(i)])
          .catch(error => {
            this.warn(`⚠️ Failed to get token at index ${i}:`, error)
            return null
          })
      )
      
      const tokenIds = await Promise.allSettled(tokenIdPromises)
      const validTokenIds = tokenIds
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<bigint>).value.toString())
      
      this.log(`📊 Found ${validTokenIds.length} valid token IDs via fallback`)
      
      // Process in smaller batches for fallback method
      const BATCH_SIZE = 5
      const results: KaijuNFT[] = []
      
      for (let i = 0; i < validTokenIds.length; i += BATCH_SIZE) {
        const batch = validTokenIds.slice(i, i + BATCH_SIZE)
        
        const batchPromises = batch.map(async (tokenId) => {
          try {
            const result = await this.getByTokenId(tokenId)
            return result.nft
          } catch (error) {
            this.warn(`⚠️ Failed to fetch token ${tokenId} in fallback:`, error)
            return null
          }
        })
        
        const batchResults = await Promise.allSettled(batchPromises)
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<KaijuNFT>).value)
        
        results.push(...validResults)
        
        // Longer delay for fallback method
        if (i + BATCH_SIZE < validTokenIds.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      this.log(`✅ Fallback method completed: ${results.length} tokens`)
      return results
      
    } catch (error) {
      this.error('❌ Final fallback method failed:', error)
      
      throw new CryptoKaijuError({
        type: ErrorType.CONTRACT,
        severity: ErrorSeverity.HIGH,
        message: 'All token fetching methods failed',
        userMessage: 'Unable to load your NFT collection at this time.',
        technicalDetails: `Blockchain lookup failed: ${error}`,
        suggestions: [
          'Check your internet connection',
          'Try again in a few minutes',
          'The Ethereum network might be experiencing issues'
        ],
        retryable: true,
        context: { address, method: 'final_fallback' }
      })
    }
  }

  /**
   * Get collection stats with enhanced error handling
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const totalSupply = await this.getTotalSupply()
      return { totalSupply }
    } catch (error) {
      this.error('❌ Error fetching collection stats:', error)
      
      if (error instanceof CryptoKaijuError) {
        throw error
      }
      
      throw ErrorHandler.normalize(error, { action: 'getCollectionStats' })
    }
  }

  /**
   * Enhanced service testing with comprehensive error scenarios
   */
  async testService(): Promise<void> {
    if (!this.DEBUG) return
    
    this.log('🧪 Testing Enhanced Blockchain Service...')
    
    try {
      // Test 1: Performance metrics baseline
      const initialMetrics = { ...this.performanceMetrics }
      this.log(`📊 Initial metrics: ${JSON.stringify(initialMetrics)}`)
      
      // Test 2: Cache health check
      const cacheHealth = this.cache.getHealthMetrics()
      this.log(`💾 Cache health: ${JSON.stringify(cacheHealth)}`)
      
      // Test 3: Total supply (should always work)
      const totalSupply = await this.getTotalSupply()
      this.log(`✅ Total supply: ${totalSupply}`)
      
      // Test 4: Token lookup with error handling
      try {
        const result = await this.getByTokenId('1')
        if (result.nft) {
          this.log(`✅ Token lookup: ${result.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        this.log(`⚠️ Token lookup error (expected for testing):`, ErrorHandler.getUserMessage(error))
      }
      
      // Test 5: NFC lookup with encoding detection
      try {
        const nfcResult = await this.getByNFCId('042C0A8A9F6580')
        if (nfcResult.nft) {
          this.log(`✅ NFC lookup: ${nfcResult.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        this.log(`⚠️ NFC lookup error (expected for testing):`, ErrorHandler.getUserMessage(error))
      }
      
      // Test 6: Error factory validation
      try {
        throw ErrorFactory.validationError('test_field', 'test_value')
      } catch (error) {
        this.log(`✅ Error handling: ${ErrorHandler.getUserMessage(error)}`)
      }
      
      // Test 7: Cache effectiveness
      const cacheStart = Date.now()
      await this.getByTokenId('1') // Should be faster from cache
      const cacheTime = Date.now() - cacheStart
      this.log(`✅ Cached lookup: ${cacheTime}ms`)
      
      // Test 8: Performance summary
      const finalMetrics = this.performanceMetrics
      const finalCacheHealth = this.cache.getHealthMetrics()
      this.log(`📈 Performance Summary:`)
      this.log(`   Total requests: ${finalMetrics.totalRequests}`)
      this.log(`   Cache hits: ${finalMetrics.cacheHits}`)
      this.log(`   Errors: ${finalMetrics.errors}`)
      this.log(`   Avg response time: ${finalMetrics.averageResponseTime.toFixed(2)}ms`)
      this.log(`   Cache size: ${finalCacheHealth.totalItems} entries`)
      this.log(`   Storage usage: ${finalCacheHealth.storageUsage} bytes`)
      this.log(`   Cache version: v${finalCacheHealth.version}`)
      
      this.log('🎉 Enhanced service test completed successfully!')
      
    } catch (error) {
      this.error('❌ Service test failed:', error)
      throw ErrorHandler.normalize(error, { action: 'testService' })
    }
  }

  /**
   * Clear cache and reset performance metrics
   */
  clearCache(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      errors: 0,
      averageResponseTime: 0
    }
    this.log('🗑️ Cache and metrics cleared')
  }
  getServiceStats() {
    return {
      performance: { ...this.performanceMetrics },
      cache: this.cache.getStats(),
      cacheHealth: this.cache.getHealthMetrics(),
      pendingRequests: this.pendingRequests.size,
      config: { ...this.TIMEOUTS },
    };
  }

  /**
   * Force cache cleanup (for debugging/maintenance)
   */
  forceCleanupCache(): void {
    this.cache.forceCleanup()
    this.log('🧹 Forced cache cleanup completed')
  }
}
  /**
   * Force cache cleanup (for debugging/maintenance)
   */
  forceCleanupCache(): void {
    this.cache.forceCleanup()
    this.log('🧹 Forced cache cleanup completed')
  }
}

export default new BlockchainCryptoKaijuService()