// src/lib/services/BlockchainCryptoKaijuService.ts - OPTIMIZED VERSION
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'

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

// LRU Cache implementation
class LRUCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  private readonly maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // Move to end (most recently used)
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
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

class BlockchainCryptoKaijuService {
  private contract: any
  private cache = new LRUCache<any>(200) // Limit cache size
  private pendingRequests = new Map<string, Promise<any>>()
  
  // IPFS gateways for racing
  private readonly IPFS_GATEWAYS = [
    'https://cryptokaiju.mypinata.cloud/ipfs',
    'https://gateway.pinata.cloud/ipfs',
    'https://cloudflare-ipfs.com/ipfs',
    'https://ipfs.io/ipfs'
  ]
  
  // Optimized timeouts
  private readonly TIMEOUTS = {
    CONTRACT: 5000,     // 5s for blockchain calls
    IPFS_RACE: 3000,    // 3s for each IPFS gateway
    OPENSEA: 8000,      // 8s for OpenSea API
    CACHE_TTL: 300000   // 5 minutes cache
  }

  // Debug mode
  private readonly DEBUG = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === 'true'

  constructor() {
    this.contract = getContract({
      client: thirdwebClient,
      chain: ethereum,
      address: KAIJU_NFT_ADDRESS,
      abi: KAIJU_NFT_ABI,
    })
  }

  private log(...args: any[]): void {
    if (this.DEBUG) {
      console.log(...args)
    }
  }

  private warn(...args: any[]): void {
    if (this.DEBUG) {
      console.warn(...args)
    }
  }

  private error(...args: any[]): void {
    console.error(...args)
  }

  /**
   * Request deduplication
   */
  private async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    const promise = request().finally(() => {
      this.pendingRequests.delete(key)
    })
    
    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Convert NFC ID to bytes32 format
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
    if (!bytes32 || bytes32 === '0'.repeat(64)) return ''
    
    const hex = bytes32.replace(/^0x/, '')
    
    // Try ASCII decoding first
    let asciiResult = ''
    let isValidAscii = true
    
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break
      
      const charCode = parseInt(hexPair, 16)
      
      if (charCode >= 48 && charCode <= 70) {
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
   * OPTIMIZED: Race multiple IPFS gateways for fastest response
   */
  private async fetchIpfsMetadataWithRacing(tokenURI: string): Promise<any> {
    const cacheKey = `ipfs:${tokenURI}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    return this.deduplicate(cacheKey, async () => {
      try {
        // First try the contract URL directly (often fastest)
        const directPromise = fetch(tokenURI, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_RACE)
        }).then(res => res.ok ? res.json() : Promise.reject('Direct fetch failed'))

        // Extract IPFS hash if present
        let ipfsRacePromises: Promise<any>[] = [directPromise]
        
        if (tokenURI.includes('/ipfs/')) {
          const ipfsHash = tokenURI.split('/ipfs/')[1]
          
          // Race all IPFS gateways
          const gatewayPromises = this.IPFS_GATEWAYS.map(gateway => 
            fetch(`${gateway}/${ipfsHash}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_RACE)
            }).then(res => res.ok ? res.json() : Promise.reject(`${gateway} failed`))
          )
          
          ipfsRacePromises = [...ipfsRacePromises, ...gatewayPromises]
        }

        // Race all requests
        const data = await Promise.race(ipfsRacePromises)
        
        this.cache.set(cacheKey, data, 24 * 60 * 60 * 1000) // 24hr cache
        return data
        
      } catch (error) {
        this.warn(`IPFS fetch failed for ${tokenURI}`)
        
        // Final fallback: API proxy
        if (tokenURI.includes('/ipfs/')) {
          try {
            const ipfsHash = tokenURI.split('/ipfs/')[1]
            const proxyUrl = `/api/ipfs/${ipfsHash}`
            
            const proxyResponse = await fetch(proxyUrl, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(this.TIMEOUTS.IPFS_RACE)
            })
            
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json()
              this.cache.set(cacheKey, proxyData, 24 * 60 * 60 * 1000)
              return proxyData
            }
          } catch (proxyError) {
            // Silent fail
          }
        }
        
        return null
      }
    })
  }

  /**
   * Get OpenSea data with caching
   */
  private async getOpenSeaDataOptimized(tokenId: string): Promise<OpenSeaAsset | null> {
    const cacheKey = `opensea:${tokenId}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    return this.deduplicate(cacheKey, async () => {
      try {
        const proxyUrl = `/api/opensea/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.OPENSEA)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.status === 503) {
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
          
          this.cache.set(cacheKey, result, 60 * 60 * 1000) // 1hr cache
          return result
        }
        
        return this.createFallbackOpenSeaData(tokenId)
        
      } catch (error) {
        return this.createFallbackOpenSeaData(tokenId)
      }
    })
  }

  /**
   * Create fallback OpenSea data
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
   * Blockchain calls with timeout and caching
   */
  private async callContractWithTimeout<T>(method: string, params: any[], cacheKey?: string): Promise<T> {
    if (cacheKey) {
      const cached = this.cache.get(cacheKey)
      if (cached) return cached
    }

    const key = cacheKey || `${method}:${JSON.stringify(params)}`
    return this.deduplicate(key, async () => {
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
          this.cache.set(cacheKey, result as T, this.TIMEOUTS.CACHE_TTL)
        }
        
        return result as T
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Contract call ${method} timed out`)
        }
        throw error
      }
    })
  }

  /**
   * OPTIMIZED: Get NFT by Token ID with parallel calls
   */
  async getByTokenId(tokenId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      const tokenIdNum = parseInt(tokenId)
      if (isNaN(tokenIdNum) || tokenIdNum < 0) {
        throw new Error(`Invalid token ID: ${tokenId}`)
      }

      // Launch all requests in parallel
      const [tokenDetailsResult, ownerResult, tokenURIResult] = await Promise.allSettled([
        this.callContractWithTimeout("tokenDetails", [BigInt(tokenId)], `tokenDetails:${tokenId}`),
        this.callContractWithTimeout("ownerOf", [BigInt(tokenId)], `owner:${tokenId}`),
        this.callContractWithTimeout("tokenURI", [BigInt(tokenId)], `tokenURI:${tokenId}`)
      ])

      // Check if token exists
      if (tokenDetailsResult.status === 'rejected' || ownerResult.status === 'rejected') {
        return { nft: null, openSeaData: null }
      }

      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetailsResult.value as any
      const ownerAddress = ownerResult.value as string
      const tokenURI = tokenURIResult.status === 'fulfilled' ? 
        (tokenURIResult.value as string) : (tokenDetailsURI as string)

      const nfcId = this.bytes32ToNFC(nfcIdBytes32)

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

      if (ipfsResult.status === 'fulfilled' && ipfsResult.value) {
        kaiju.ipfsData = ipfsResult.value
      }

      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId)

      // Extract batch from OpenSea
      if (finalOpenSeaData?.traits) {
        const batchTrait = finalOpenSeaData.traits.find(trait => 
          trait.trait_type?.toLowerCase() === 'batch'
        )
        if (batchTrait?.value) {
          kaiju.batch = String(batchTrait.value).trim()
        }
      }

      return { nft: kaiju, openSeaData: finalOpenSeaData }

    } catch (error) {
      this.error(`Error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * Get NFT by NFC ID
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    try {
      const nfcBytes32ASCII = this.nfcToBytes32ASCII(nfcId)
      const nfcBytes32Direct = this.nfcToBytes32Direct(nfcId)
      
      let nfcDetails: any
      let usedEncoding = 'ASCII'
      
      try {
        nfcDetails = await this.callContractWithTimeout(
          "nfcDetails", 
          [nfcBytes32ASCII], 
          `nfcDetails:${nfcId}:ascii`
        )
        
        const [tokenId] = nfcDetails as [bigint, string, string, bigint]
        if (Number(tokenId) === 0) {
          throw new Error('Not found with ASCII encoding')
        }
        
      } catch (asciiError) {
        try {
          nfcDetails = await this.callContractWithTimeout(
            "nfcDetails", 
            [nfcBytes32Direct], 
            `nfcDetails:${nfcId}:direct`
          )
          
          const [tokenId] = nfcDetails as [bigint, string, string, bigint]
          if (Number(tokenId) === 0) {
            throw new Error('Not found with direct encoding either')
          }
          
          usedEncoding = 'Direct'
          
        } catch (directError) {
          return { nft: null, openSeaData: null }
        }
      }
      
      const [tokenId, returnedNfcId, tokenUri, dob] = nfcDetails as [bigint, string, string, bigint]
      
      // Launch all parallel operations
      const [ownerResult, ipfsResult, openSeaResult] = await Promise.allSettled([
        this.callContractWithTimeout("ownerOf", [tokenId], `owner:${tokenId}`),
        tokenUri ? this.fetchIpfsMetadataWithRacing(tokenUri) : Promise.resolve(null),
        this.getOpenSeaDataOptimized(tokenId.toString())
      ])
      
      const kaiju: KaijuNFT = {
        tokenId: tokenId.toString(),
        nfcId: this.bytes32ToNFC(returnedNfcId),
        owner: ownerResult.status === 'fulfilled' ? (ownerResult.value as string) : '',
        tokenURI: tokenUri,
        birthDate: Number(dob)
      }
      
      if (ipfsResult.status === 'fulfilled' && ipfsResult.value) {
        kaiju.ipfsData = ipfsResult.value
      }
      
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
      
      return { nft: kaiju, openSeaData: finalOpenSeaData }
      
    } catch (error) {
      this.error(`Error looking up NFC ID ${nfcId}:`, error)
      return { nft: null, openSeaData: null }
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
      this.error('Error fetching total supply:', error)
      return 0
    }
  }

  /**
   * OPTIMIZED: Get tokens owned by address
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    const cacheKey = `tokens:${address}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    try {
      // Try OpenSea first (faster for most users)
      const openSeaResults = await this.getTokensForAddressFromOpenSea(address)
      
      if (openSeaResults.length > 0) {
        this.cache.set(cacheKey, openSeaResults, this.TIMEOUTS.CACHE_TTL)
        return openSeaResults
      }
      
      // Fallback to blockchain
      return this.getTokensForAddressFromBlockchain(address)
      
    } catch (error) {
      this.error(`Error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * Get tokens from OpenSea API
   */
  private async getTokensForAddressFromOpenSea(address: string): Promise<KaijuNFT[]> {
    try {
      const allCryptoKaijuNFTs: KaijuNFT[] = []
      let currentCursor = ''
      let pageCount = 0
      const maxPages = 20 // Keep higher limit for collectors with many NFTs
      let consecutivePagesWithoutKaiju = 0
      const maxConsecutiveEmpty = 3 // Stop after 3 pages with no CryptoKaiju
      
      while (pageCount < maxPages) {
        const url = `/api/opensea/chain/ethereum/account/${address}/nfts?limit=100${currentCursor ? `&next=${currentCursor}` : ''}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.OPENSEA)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.status === 503 || !response.ok) {
          throw new Error('OpenSea API not available')
        }
        
        const data = await response.json()
        
        if (!data.nfts || !Array.isArray(data.nfts)) {
          break
        }
        
        // Filter and convert CryptoKaiju NFTs
        const pageKaijus = data.nfts
          .filter((nft: OpenSeaAccountNFT) => 
            nft.contract?.toLowerCase() === KAIJU_NFT_ADDRESS.toLowerCase()
          )
          .map((nft: OpenSeaAccountNFT) => this.convertOpenSeaNFTToKaiju(nft, address))
        
        if (pageKaijus.length > 0) {
          allCryptoKaijuNFTs.push(...pageKaijus)
          consecutivePagesWithoutKaiju = 0 // Reset counter
        } else {
          consecutivePagesWithoutKaiju++
          
          // Optimization: Stop if we've had several pages without any CryptoKaiju
          // This handles the case where all CryptoKaiju are likely in the first few pages
          if (consecutivePagesWithoutKaiju >= maxConsecutiveEmpty && allCryptoKaijuNFTs.length > 0) {
            this.log(`Stopping after ${consecutivePagesWithoutKaiju} pages without CryptoKaiju`)
            break
          }
        }
        
        currentCursor = data.next || ''
        if (!currentCursor || data.nfts.length < 100) {
          break
        }
        
        pageCount++
        
        // Small delay between requests to be respectful
        if (currentCursor && pageCount < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      this.log(`Found ${allCryptoKaijuNFTs.length} CryptoKaiju NFTs across ${pageCount} pages`)
      return allCryptoKaijuNFTs
      
    } catch (error) {
      throw error
    }
  }

  /**
   * Convert OpenSea NFT to KaijuNFT
   */
  private convertOpenSeaNFTToKaiju(osNft: OpenSeaAccountNFT, ownerAddress: string): KaijuNFT {
    const nfcId = this.extractNFCFromTraits(osNft.traits)
    const batch = this.extractBatchFromTraits(osNft.traits)
    
    const attributes: { [key: string]: any } = {}
    if (osNft.traits) {
      osNft.traits.forEach(trait => {
        if (trait.trait_type && trait.value !== undefined) {
          attributes[trait.trait_type.toLowerCase()] = trait.value
        }
      })
    }

    return {
      tokenId: osNft.identifier,
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
  }

  /**
   * Extract NFC from traits
   */
  private extractNFCFromTraits(traits: Array<{ trait_type: string; value: any }>): string | undefined {
    if (!traits || !Array.isArray(traits)) return undefined
    
    const nfcTrait = traits.find(trait => 
      trait.trait_type?.toLowerCase() === 'nfc' ||
      trait.trait_type?.toLowerCase() === 'nfc_id' ||
      trait.trait_type?.toLowerCase() === 'nfcid'
    )
    
    return nfcTrait?.value ? String(nfcTrait.value).trim().toUpperCase() : undefined
  }

  /**
   * Extract batch from traits
   */
  private extractBatchFromTraits(traits: Array<{ trait_type: string; value: any }>): string | undefined {
    if (!traits || !Array.isArray(traits)) return undefined
    
    const batchTrait = traits.find(trait => 
      trait.trait_type?.toLowerCase() === 'batch'
    )
    
    return batchTrait?.value ? String(batchTrait.value).trim() : undefined
  }

  /**
   * Fallback: Get tokens from blockchain
   */
  private async getTokensForAddressFromBlockchain(address: string): Promise<KaijuNFT[]> {
    try {
      const tokenIds = await this.callContractWithTimeout<bigint[]>("tokensOf", [address], `tokensOf:${address}`)
      
      if (tokenIds.length === 0) return []
      
      // Process in batches for speed
      const BATCH_SIZE = 10
      const results: KaijuNFT[] = []
      
      for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
        const batch = tokenIds.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(async (tokenId) => {
          const result = await this.getByTokenId(tokenId.toString())
          return result.nft
        })
        
        const batchResults = await Promise.allSettled(batchPromises)
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<KaijuNFT>).value)
        
        results.push(...validResults)
      }
      
      return results
      
    } catch (error) {
      // Final fallback using tokenOfOwnerByIndex
      return this.getTokensForAddressFinalFallback(address)
    }
  }

  /**
   * Final fallback method
   */
  private async getTokensForAddressFinalFallback(address: string): Promise<KaijuNFT[]> {
    try {
      const balance = await this.callContractWithTimeout<bigint>("balanceOf", [address], `balance:${address}`)
      const tokenCount = Number(balance)
      
      if (tokenCount === 0) return []
      
      const tokenIdPromises = Array.from({ length: tokenCount }, (_, i) =>
        this.callContractWithTimeout<bigint>("tokenOfOwnerByIndex", [address, BigInt(i)])
      )
      
      const tokenIds = await Promise.allSettled(tokenIdPromises)
      const validTokenIds = tokenIds
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<bigint>).value.toString())
      
      // Process in batches
      const BATCH_SIZE = 10
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
      }
      
      return results
      
    } catch (error) {
      this.error('Final fallback method failed:', error)
      return []
    }
  }

  /**
   * Search tokens
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
   * Get collection stats
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const totalSupply = await this.getTotalSupply()
      return { totalSupply }
    } catch (error) {
      this.error('Error fetching collection stats:', error)
      return { totalSupply: 0 }
    }
  }

  /**
   * Test service
   */
  async testService(): Promise<void> {
    if (!this.DEBUG) return
    
    this.log('🚀 Testing Optimized Service...')
    
    try {
      // Test 1: Total supply
      const totalSupply = await this.getTotalSupply()
      this.log(`✅ Total supply: ${totalSupply}`)
      
      // Test 2: Token lookup with racing IPFS
      const result = await this.getByTokenId('1')
      if (result.nft) {
        this.log(`✅ Token lookup: ${result.nft.ipfsData?.name || 'Unnamed'}`)
      }
      
      // Test 3: Cache effectiveness
      const cacheStart = Date.now()
      await this.getByTokenId('1') // Should be instant from cache
      this.log(`✅ Cached lookup: ${Date.now() - cacheStart}ms`)
      
      this.log(`📊 Cache size: ${this.cache.size} entries`)
      
    } catch (error) {
      this.error('❌ Service test failed:', error)
      throw error
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }
}

export default new BlockchainCryptoKaijuService()