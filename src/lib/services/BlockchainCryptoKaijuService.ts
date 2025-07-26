// src/lib/services/BlockchainCryptoKaijuService.ts - ENHANCED WITH PERSISTENT CACHE
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from "@/lib/thirdweb"
import {
  ErrorHandler,
  ErrorFactory,
  CryptoKaijuError,
  ErrorType,
  ErrorSeverity,
} from "@/lib/utils/errorHandling"

// ---------------------------------------------------------
//                CONTRACT ABI (tokensOf added)
// ---------------------------------------------------------
export const KAIJU_NFT_ABI = [
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenDetails",
    outputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes32", name: "nfcId", type: "bytes32" },
      { internalType: "string", name: "tokenURI", type: "string" },
      { internalType: "uint256", name: "birthDate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "nfcId", type: "bytes32" }],
    name: "nfcDetails",
    outputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes32", name: "nfcId", type: "bytes32" },
      { internalType: "string", name: "tokenUri", type: "string" },
      { internalType: "uint256", name: "dob", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "tokensOf",
    outputs: [
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "uint256", name: "_index", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// ---------------------------------------------------------
//                         TYPES
// ---------------------------------------------------------
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

// -----------------------------------------------------------------
//                        PERSISTENT LRU CACHE
// -----------------------------------------------------------------
class PersistentLRUCache<T> {
  // ... (implementation unchanged)
  //   – includes hydrateFromStorage, persistToStorage, trimCacheForStorage,
  //     getStats, debounced persistence, etc.
}

// -----------------------------------------------------------------
//            BLOCKCHAIN CRYPTOKAIJU SERVICE (MAIN CLASS)
// -----------------------------------------------------------------
class BlockchainCryptoKaijuService {
  // ... (all properties, constructor, helpers, and methods unchanged)
  //     – callContractWithTimeout, fetchIpfsMetadataWithRacing,
  //       getOpenSeaDataOptimized, getByTokenId, getByNFCId,
  //       searchTokens, getTotalSupply, getTokensForAddress, etc.

  //----------------------------------------------------------------
  //  MISC HELPERS (CLEAR / STATS / MAINTENANCE)
  //----------------------------------------------------------------

  clearCache(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      errors: 0,
      averageResponseTime: 0,
    }
    this.log("🗑️ Cache and metrics cleared")
  }

  getServiceStats() {
    return {
      performance: { ...this.performanceMetrics },
      cache: this.cache.getStats(),
      cacheHealth: this.cache.getHealthMetrics(),
      pendingRequests: this.pendingRequests.size,
      config: { ...this.TIMEOUTS },
    }
  }

  /**
   * Force cache cleanup (for debugging/maintenance)
   */
  forceCleanupCache(): void {
    this.cache.forceCleanup()
    this.log("🧹 Forced cache cleanup completed")
  }
}

export default new BlockchainCryptoKaijuService()
