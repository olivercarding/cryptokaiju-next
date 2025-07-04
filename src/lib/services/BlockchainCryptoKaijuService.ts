// src/lib/services/BlockchainCryptoKaijuService.ts - FULLY FIXED VERSION
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS } from '@/lib/thirdweb'
import axios from 'axios'

// ... keep existing ABI and interfaces ...

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

  // ... keep existing helper methods ...

  /**
   * FIXED: Use Next.js API proxy for IPFS to avoid CORS
   */
  private async fetchIpfsMetadata(tokenURI: string): Promise<any> {
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
      
      // Use our Next.js API proxy instead of direct IPFS calls
      const proxyUrl = `/api/ipfs/${ipfsHash}`
      console.log(`🔄 Using proxy URL: ${proxyUrl}`)
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Proxy returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`✅ IPFS metadata fetched successfully via proxy`)
      return data
      
    } catch (error) {
      console.error(`❌ IPFS proxy fetch failed:`, error)
      return null
    }
  }

  /**
   * FIXED: Better OpenSea error handling and fallback
   */
  private async getOpenSeaData(tokenId: string): Promise<OpenSeaAsset | null> {
    try {
      // Try OpenSea API with better error handling
      const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
      console.log(`🌊 Fetching OpenSea data from: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(process.env.NEXT_PUBLIC_OPENSEA_API_KEY && {
            'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY
          })
        },
      })
      
      if (response.status === 401) {
        console.warn(`⚠️ OpenSea API unauthorized (401) - API key may be invalid or missing`)
        // Continue without OpenSea data instead of failing
        return this.createFallbackOpenSeaData(tokenId)
      }
      
      if (!response.ok) {
        console.warn(`⚠️ OpenSea API returned ${response.status}, creating fallback data`)
        return this.createFallbackOpenSeaData(tokenId)
      }
      
      const data = await response.json()
      if (data?.nft) {
        const nft = data.nft
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
      console.warn(`⚠️ OpenSea fetch failed, using fallback:`, error.message)
      return this.createFallbackOpenSeaData(tokenId)
    }
  }

  /**
   * NEW: Create fallback OpenSea data when API fails
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
   * ENHANCED: Better error handling for main lookup methods
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

      const [contractTokenId, nfcIdBytes32, tokenDetailsURI, birthDate] = tokenDetails.value
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

      // Fetch metadata and OpenSea data in parallel, don't let failures stop the whole process
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

  // ... keep other existing methods with similar error handling improvements ...
}

export default new BlockchainCryptoKaijuService()