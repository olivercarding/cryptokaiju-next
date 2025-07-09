// src/lib/services/BlockchainCryptoKaijuService.ts - COMPLETE REWRITE WITH ENHANCED DEBUGGING
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'

// Complete CryptoKaiju NFT Contract ABI - OPTIMIZED with tokensOf
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

class BlockchainCryptoKaijuService {
  private contract: any
  
  // 🚀 PERFORMANCE OPTIMIZATIONS
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private pendingRequests = new Map<string, Promise<any>>()
  
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
    OPENSEA: 12000,    // 12s for OpenSea account endpoint (can return many NFTs)
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
   * Convert human-readable NFC ID to bytes32 format for contract calls (ASCII encoding)
   */
  private nfcToBytes32ASCII(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    const cleanNfc = nfcId.replace(/^0x/, '').toUpperCase()
    console.log(`🔄 Converting NFC "${cleanNfc}" to bytes32 (ASCII)...`)
    
    let asciiHex = ''
    for (let i = 0; i < cleanNfc.length; i++) {
      const char = cleanNfc[i]
      const asciiCode = char.charCodeAt(0)
      const hexCode = asciiCode.toString(16).padStart(2, '0')
      asciiHex += hexCode
    }
    
    const paddedHex = asciiHex.padEnd(64, '0')
    const bytes32 = '0x' + paddedHex
    
    console.log(`✅ ASCII bytes32: ${bytes32}`)
    return bytes32
  }

  /**
   * Convert human-readable NFC ID to bytes32 format for contract calls (Direct hex encoding)
   */
  private nfcToBytes32Direct(nfcId: string): string {
    if (!nfcId) return '0x' + '0'.repeat(64)
    
    const cleanNfc = nfcId.replace(/^0x/, '').toLowerCase()
    console.log(`🔄 Converting NFC "${cleanNfc}" to bytes32 (Direct)...`)
    
    const paddedHex = cleanNfc.padEnd(64, '0')
    const bytes32 = '0x' + paddedHex
    
    console.log(`✅ Direct bytes32: ${bytes32}`)
    return bytes32
  }

  /**
   * Backward-compatible function - tries ASCII encoding (most common)
   */
  private nfcToBytes32(nfcId: string): string {
    return this.nfcToBytes32ASCII(nfcId)
  }

  /**
   * Convert bytes32 to readable NFC hex string - UPDATED to handle both encoding schemes
   */
  private bytes32ToNFC(bytes32: string): string {
    if (!bytes32 || bytes32 === '0'.repeat(64)) return ''
    
    const hex = bytes32.replace(/^0x/, '')
    
    // Try ASCII decoding first (current method)
    let asciiResult = ''
    let isValidAscii = true
    
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break
      
      const charCode = parseInt(hexPair, 16)
      
      // Check if it's a valid printable ASCII character (0-9, A-F typically)
      if (charCode >= 48 && charCode <= 70) { // '0'-'9' (48-57) and 'A'-'F' (65-70) range
        asciiResult += String.fromCharCode(charCode)
      } else {
        // If we hit non-ASCII, this is probably direct hex encoding
        isValidAscii = false
        break
      }
    }
    
    // If ASCII decoding worked and gave us a reasonable NFC-like result, use it
    if (isValidAscii && asciiResult.length >= 8 && /^[0-9A-F]+$/.test(asciiResult)) {
      console.log(`✅ Decoded as ASCII: ${asciiResult}`)
      return asciiResult
    }
    
    // Otherwise, treat as direct hex encoding (like token 1414)
    const directHex = hex.replace(/0+$/, '').toUpperCase() // Remove trailing zeros
    console.log(`✅ Decoded as direct hex: ${directHex}`)
    return directHex
  }

  /**
   * 🆕 NEW: Extract NFC ID from OpenSea traits
   */
  private extractNFCFromOpenSeaTraits(traits: Array<{ trait_type: string; value: any }>): string | undefined {
    if (!traits || !Array.isArray(traits)) return undefined
    
    const nfcTrait = traits.find(trait => 
      trait.trait_type?.toLowerCase() === 'nfc' ||
      trait.trait_type?.toLowerCase() === 'nfc_id' ||
      trait.trait_type?.toLowerCase() === 'nfcid'
    )
    
    if (nfcTrait?.value) {
      const nfcId = String(nfcTrait.value).trim().toUpperCase()
      console.log(`✅ Extracted NFC from OpenSea traits: ${nfcId}`)
      return nfcId
    }
    
    return undefined
  }

  /**
   * 🆕 NEW: Extract batch from OpenSea traits
   */
  private extractBatchFromOpenSeaTraits(traits: Array<{ trait_type: string; value: any }>): string | undefined {
    if (!traits || !Array.isArray(traits)) return undefined
    
    const batchTrait = traits.find(trait => 
      trait.trait_type?.toLowerCase() === 'batch'
    )
    
    if (batchTrait?.value) {
      const batch = String(batchTrait.value).trim()
      console.log(`✅ Extracted batch from OpenSea traits: ${batch}`)
      return batch
    }
    
    return undefined
  }

  /**
   * 🆕 NEW: Convert OpenSea NFT to KaijuNFT format
   */
  private convertOpenSeaNFTToKaiju(osNft: OpenSeaAccountNFT, ownerAddress: string): KaijuNFT {
    const nfcId = this.extractNFCFromOpenSeaTraits(osNft.traits)
    const batch = this.extractBatchFromOpenSeaTraits(osNft.traits)
    
    // Convert OpenSea traits to attributes format
    const attributes: { [key: string]: any } = {}
    if (osNft.traits) {
      osNft.traits.forEach(trait => {
        if (trait.trait_type && trait.value !== undefined) {
          attributes[trait.trait_type.toLowerCase()] = trait.value
        }
      })
    }

    const kaiju: KaijuNFT = {
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

    console.log(`✅ Converted OpenSea NFT: ${kaiju.ipfsData?.name} (NFC: ${nfcId || 'None'})`)
    return kaiju
  }

  /**
   * 🆕 ENHANCED: Get tokens for address from OpenSea API with full pagination and debugging
   */
  private async getTokensForAddressFromOpenSea(address: string): Promise<KaijuNFT[]> {
    const cacheKey = `opensea-account:${address}`
    const cached = this.getCached<KaijuNFT[]>(cacheKey)
    if (cached) return cached

    return this.deduplicate(cacheKey, async () => {
      const startTime = Date.now()
      let allCryptoKaijuNFTs: KaijuNFT[] = []
      
      try {
        console.log(`🚀 ENHANCED DEBUG: Searching for CryptoKaiju NFTs for address: ${address}`)
        console.log(`🔍 Target contract: ${KAIJU_NFT_ADDRESS.toLowerCase()}`)
        
        // Fetch multiple pages to find CryptoKaiju NFTs
        let currentCursor = ''
        let pageCount = 0
        const maxPages = 20 // Check up to 1200 NFTs
        let totalNFTsChecked = 0
        
        while (pageCount < maxPages) {
          const url = `/api/opensea/chain/ethereum/account/${address}/nfts?limit=100${currentCursor ? `&next=${currentCursor}` : ''}`
          console.log(`🌊 Page ${pageCount + 1}: ${url}`)
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.OPENSEA)
          
          const response = await fetch(url, {
            method: 'GET',
            headers: { 
              'Accept': 'application/json',
              'User-Agent': 'CryptoKaiju/1.0'
            },
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (response.status === 503) {
            console.warn(`⚠️ OpenSea API not configured, falling back to blockchain`)
            throw new Error('OpenSea API not configured')
          }
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ OpenSea API error on page ${pageCount + 1}: ${response.status} - ${errorText}`)
            break
          }
          
          const data = await response.json()
          
          if (!data.nfts || !Array.isArray(data.nfts)) {
            console.warn(`⚠️ Invalid OpenSea response format on page ${pageCount + 1}`)
            break
          }
          
          console.log(`📊 Page ${pageCount + 1}: Found ${data.nfts.length} NFTs`)
          totalNFTsChecked += data.nfts.length
          
          // 🔍 ENHANCED DEBUG: Show sample contracts on this page
          if (data.nfts.length > 0) {
            const contractCounts = new Map<string, number>()
            // FIXED: Add explicit type annotation for nft parameter
            data.nfts.forEach((nft: OpenSeaAccountNFT) => {
              const contract = nft.contract?.toLowerCase() || 'unknown'
              contractCounts.set(contract, (contractCounts.get(contract) || 0) + 1)
            })
            
            console.log(`🔍 Page ${pageCount + 1} contract distribution (top 5):`)
            Array.from(contractCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .forEach(([contract, count]) => {
                const isCryptoKaiju = contract === KAIJU_NFT_ADDRESS.toLowerCase()
                const shortContract = contract === 'unknown' ? 'unknown' : `${contract.slice(0, 10)}...${contract.slice(-6)}`
                console.log(`  ${isCryptoKaiju ? '🎯' : '📄'} ${shortContract}: ${count} NFTs${isCryptoKaiju ? ' <- CRYPTOKAIJU FOUND!' : ''}`)
              })
          }
          
          // Look for CryptoKaiju NFTs on this page
          const pageKaijus = data.nfts
            .filter((nft: OpenSeaAccountNFT) => {
              const isCorrectContract = nft.contract?.toLowerCase() === KAIJU_NFT_ADDRESS.toLowerCase()
              if (isCorrectContract) {
                console.log(`✅ FOUND CryptoKaiju NFT: ${nft.name || nft.identifier} (Contract: ${nft.contract})`)
              }
              return isCorrectContract
            })
            .map((nft: OpenSeaAccountNFT) => this.convertOpenSeaNFTToKaiju(nft, address))
          
          if (pageKaijus.length > 0) {
            console.log(`🎉 Page ${pageCount + 1}: Found ${pageKaijus.length} CryptoKaiju NFTs!`)
            allCryptoKaijuNFTs.push(...pageKaijus)
          }
          
          // Check if there are more pages
          currentCursor = data.next || ''
          if (!currentCursor || data.nfts.length < 100) {
            console.log(`📄 Reached end of NFTs (no more pages)`)
            break
          }
          
          pageCount++
          
          // Add small delay between pages to be respectful
          if (pageCount < maxPages && currentCursor) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
        
        console.log(`🎉 OPENSEA SCAN COMPLETE:`)
        console.log(`   📊 Total pages checked: ${pageCount + 1}`)
        console.log(`   📊 Total NFTs checked: ${totalNFTsChecked}`)
        console.log(`   🎯 CryptoKaiju NFTs found: ${allCryptoKaijuNFTs.length}`)
        console.log(`   ⏱️ Time taken: ${Date.now() - startTime}ms`)
        
        // If we still found 0, provide helpful debugging info
        if (allCryptoKaijuNFTs.length === 0) {
          console.log(`❌ NO CRYPTOKAIJU NFTS FOUND FOR ADDRESS: ${address}`)
          console.log(`💡 This could mean:`)
          console.log(`   1. The address doesn't own any CryptoKaiju NFTs`)
          console.log(`   2. There are more than ${maxPages * 100} NFTs and CryptoKaiju are further down`)
          console.log(`   3. The contract address is different than expected`)
          console.log(`🔍 Manual verification:`)
          console.log(`   Check: https://opensea.io/${address}`)
          console.log(`   Search for "cryptokaiju" in the collections filter`)
        }
        
        // Cache for 3 minutes (shorter than blockchain cache since OpenSea updates faster)
        this.setCache(cacheKey, allCryptoKaijuNFTs, 3 * 60 * 1000)
        
        return allCryptoKaijuNFTs
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ OpenSea account API failed: ${errorMessage}`)
        throw error
      }
    })
  }

  /**
   * 🎯 SIMPLE: Just use the exact URL the contract gives us!
   */
  private async fetchIpfsMetadata(tokenURI: string): Promise<any> {
    const cacheKey = `ipfs:${tokenURI}`
    const cached = this.getCached(cacheKey)
    if (cached) return cached

    return this.deduplicate(cacheKey, async () => {
      try {
        console.log(`📡 Fetching IPFS metadata from contract URL: ${tokenURI}`)
        
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`⚠️ Contract IPFS URL failed: ${errorMessage}`)
        
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
            const proxyErrorMessage = proxyError instanceof Error ? proxyError.message : 'Unknown error'
            console.warn(`❌ API proxy fallback also failed: ${proxyErrorMessage}`)
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
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`⏰ OpenSea timed out after ${this.TIMEOUTS.OPENSEA}ms`)
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.warn(`⚠️ OpenSea failed:`, errorMessage)
        }
        return this.createFallbackOpenSeaData(tokenId)
      }
    })
  }

  /**
   * Extract batch information from OpenSea traits
   */
  private extractBatchFromOpenSea(openSeaData: OpenSeaAsset | null): string | undefined {
    if (!openSeaData?.traits) return undefined
    
    const batchTrait = openSeaData.traits.find(trait => 
      trait.trait_type?.toLowerCase() === 'batch'
    )
    
    if (batchTrait?.value) {
      const batch = String(batchTrait.value).trim()
      console.log(`✅ Found batch: ${batch}`)
      return batch
    }
    
    return undefined
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
        if (error instanceof Error && error.name === 'AbortError') {
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
        console.log(`✅ IPFS: ${kaiju.ipfsData?.name || 'Unnamed'}`)
      } else {
        console.warn(`⚠️ IPFS failed or timed out`)
      }

      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId)

      // Extract batch information from OpenSea data
      kaiju.batch = this.extractBatchFromOpenSea(finalOpenSeaData)

      console.log(`🎉 Total lookup time: ${Date.now() - startTime}ms`)
      return { nft: kaiju, openSeaData: finalOpenSeaData }

    } catch (error) {
      console.error(`❌ Critical error fetching Token ID ${tokenId}:`, error)
      return { nft: null, openSeaData: null }
    }
  }

  /**
   * 🚀 OPTIMIZED: Get NFT by NFC ID with maximum parallelization - UPDATED to try both encoding schemes
   */
  async getByNFCId(nfcId: string): Promise<{ nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 PARALLEL NFC lookup: ${nfcId}`)
      
      // Try BOTH encoding schemes since we don't know which one was used
      const nfcBytes32ASCII = this.nfcToBytes32ASCII(nfcId)
      const nfcBytes32Direct = this.nfcToBytes32Direct(nfcId)
      
      console.log(`🔄 Trying both encoding schemes...`)
      
      // 🚀 STEP 1: Try ASCII encoding first (most common)
      console.log(`⚡ Contract nfcDetails call (ASCII encoding)...`)
      let nfcDetails: any
      let usedEncoding = 'ASCII'
      
      try {
        nfcDetails = await this.callContractWithTimeout(
          "nfcDetails", 
          [nfcBytes32ASCII], 
          `nfcDetails:${nfcId}:ascii`
        )
        
        // Check if we found something
        const [tokenId] = nfcDetails as [bigint, string, string, bigint]
        if (Number(tokenId) === 0) {
          throw new Error('Not found with ASCII encoding')
        }
        
        console.log(`✅ Found with ASCII encoding: Token ${tokenId}`)
        
      } catch (asciiError) {
        console.log(`⚠️ ASCII encoding failed, trying direct hex...`)
        
        // 🚀 STEP 2: Try direct hex encoding
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
          
          console.log(`✅ Found with direct hex encoding: Token ${tokenId}`)
          usedEncoding = 'Direct'
          
        } catch (directError) {
          console.log(`❌ NFC ID ${nfcId} not found with either encoding scheme`)
          return { nft: null, openSeaData: null }
        }
      }
      
      const [tokenId, returnedNfcId, tokenUri, dob] = nfcDetails as [bigint, string, string, bigint]
      
      console.log(`✅ Found Token ID ${tokenId} using ${usedEncoding} encoding in ${Date.now() - startTime}ms`)
      
      // 🚀 STEP 3: Launch owner lookup + IPFS + OpenSea ALL in parallel
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
        console.log(`✅ IPFS: ${kaiju.ipfsData?.name || 'Unnamed'}`)
      }
      
      const finalOpenSeaData = openSeaResult.status === 'fulfilled' ? 
        openSeaResult.value : this.createFallbackOpenSeaData(tokenId.toString())
      
      // Extract batch information from OpenSea data
      kaiju.batch = this.extractBatchFromOpenSea(finalOpenSeaData)
      
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
   * 🚀 SUPER EFFICIENT: Get tokens owned by address - NOW WITH ENHANCED OPENSEA API!
   * Uses OpenSea API first (1 fast call), blockchain fallback if needed
   */
  async getTokensForAddress(address: string): Promise<KaijuNFT[]> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 ENHANCED OPENSEA FIRST approach for address: ${address}`)
      
      // 🌊 STEP 1: Try OpenSea API first (should be super fast!)
      try {
        const openSeaResults = await this.getTokensForAddressFromOpenSea(address)
        
        if (openSeaResults.length > 0) {
          console.log(`🎉 OpenSea API SUCCESS: ${openSeaResults.length} NFTs in ${Date.now() - startTime}ms`)
          return openSeaResults
        } else {
          console.log(`📭 OpenSea returned 0 NFTs for address ${address} - might be legitimate`)
          return []
        }
        
      } catch (openSeaError) {
        const errorMessage = openSeaError instanceof Error ? openSeaError.message : 'Unknown error'
        console.warn(`⚠️ OpenSea API failed: ${errorMessage}`)
        console.log(`🔄 Falling back to blockchain approach...`)
        
        // 🔗 STEP 2: Fallback to blockchain approach
        return this.getTokensForAddressFromBlockchain(address)
      }
      
    } catch (error) {
      console.error(`❌ Critical error fetching tokens for address ${address}:`, error)
      return []
    }
  }

  /**
   * 🔗 FALLBACK: Original blockchain approach (when OpenSea fails)
   */
  private async getTokensForAddressFromBlockchain(address: string): Promise<KaijuNFT[]> {
    const startTime = Date.now()
    
    try {
      console.log(`🔗 BLOCKCHAIN FALLBACK for address: ${address}`)
      
      // Use the tokensOf function to get ALL token IDs in one call! 🎯
      console.log(`⚡ Getting all token IDs with tokensOf()...`)
      const tokenIds = await this.callContractWithTimeout<bigint[]>("tokensOf", [address], `tokensOf:${address}`)
      
      console.log(`✅ Got ${tokenIds.length} token IDs in ${Date.now() - startTime}ms`)
      
      if (tokenIds.length === 0) return []
      
      // 🚀 STEP 2: Fetch ALL token details in parallel (with batching to avoid overwhelming APIs)
      console.log(`⚡ Fetching details for ${tokenIds.length} tokens in parallel...`)
      const BATCH_SIZE = 10 // Process 10 at a time to avoid overwhelming APIs
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
        console.log(`✅ Blockchain batch ${Math.floor(i/BATCH_SIZE) + 1} completed (${validResults.length} tokens)`)
      }
      
      console.log(`🎉 Blockchain fallback completed: ${results.length} tokens in ${Date.now() - startTime}ms`)
      return results
      
    } catch (error) {
      console.error(`❌ Blockchain fallback also failed:`, error)
      
      // Final fallback to tokenOfOwnerByIndex if tokensOf fails
      console.log(`🔄 Final fallback to tokenOfOwnerByIndex approach...`)
      return this.getTokensForAddressFinalFallback(address)
    }
  }

  /**
   * Final fallback method using tokenOfOwnerByIndex (still much better than scanning)
   */
  private async getTokensForAddressFinalFallback(address: string): Promise<KaijuNFT[]> {
    const startTime = Date.now()
    
    try {
      console.log(`🔄 FINAL FALLBACK: Using tokenOfOwnerByIndex for ${address}`)
      
      const balance = await this.callContractWithTimeout<bigint>("balanceOf", [address], `balance:${address}`)
      const tokenCount = Number(balance)
      
      console.log(`📦 Address ${address} owns ${tokenCount} tokens`)
      
      if (tokenCount === 0) return []
      
      // Get all token IDs using tokenOfOwnerByIndex
      console.log(`⚡ Fetching ${tokenCount} token IDs with tokenOfOwnerByIndex...`)
      const tokenIdPromises = Array.from({ length: tokenCount }, (_, i) =>
        this.callContractWithTimeout<bigint>("tokenOfOwnerByIndex", [address, BigInt(i)])
      )
      
      const tokenIds = await Promise.allSettled(tokenIdPromises)
      const validTokenIds = tokenIds
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<bigint>).value.toString())
      
      console.log(`✅ Got ${validTokenIds.length} token IDs in ${Date.now() - startTime}ms`)
      
      // Fetch ALL token details in parallel (with batching)
      console.log(`⚡ Fetching all token details in parallel...`)
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
        console.log(`✅ Final fallback batch ${Math.floor(i/BATCH_SIZE) + 1} completed (${validResults.length} tokens)`)
      }
      
      console.log(`🎉 Final fallback total time: ${Date.now() - startTime}ms`)
      return results
      
    } catch (error) {
      console.error(`❌ Final fallback method also failed:`, error)
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
   * Test service with performance timing - Updated for enhanced OpenSea approach
   */
  async testService(): Promise<void> {
    console.log('🚀 Testing ENHANCED OPENSEA-OPTIMIZED Service...')
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
        
        // Test 4: Enhanced OpenSea account NFTs speed test
        if (result.nft.owner) {
          console.log('🌊 Testing ENHANCED OpenSea account NFTs API...')
          const openSeaStartTime = Date.now()
          try {
            const accountNFTs = await this.getTokensForAddressFromOpenSea(result.nft.owner)
            console.log(`✅ Enhanced OpenSea account test: Found ${accountNFTs.length} NFTs (${Date.now() - openSeaStartTime}ms)`)
          } catch (error) {
            console.log(`⚠️ OpenSea account test failed - blockchain fallback available`)
          }
        }
      }
      
      // Test 5: Cache effectiveness
      console.log('💾 Testing cache effectiveness...')
      const cacheStartTime = Date.now()
      await this.getByTokenId('1') // Should be instant from cache
      console.log(`✅ Cached lookup: ${Date.now() - cacheStartTime}ms`)
      
      console.log(`🎉 Total test time: ${Date.now() - totalStartTime}ms`)
      console.log(`📊 Cache size: ${this.cache.size} entries`)
      
    } catch (error) {
      console.error('❌ Enhanced OpenSea-optimized service test failed:', error)
      throw error
    }
  }
}

export default new BlockchainCryptoKaijuService()