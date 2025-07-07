// src/lib/services/NFCMappingService.ts
// TypeScript version of the NFC mapping service

interface OpenSeaTrait {
  trait_type?: string
  value?: any
}

interface NFCMappingEntry {
  tokenId: string
  name?: string
  discoveredAt: string
}

interface NFCMapping {
  [nfcId: string]: NFCMappingEntry
}

interface OpenSeaNFT {
  identifier: string
  name?: string
  traits?: OpenSeaTrait[]
  metadata_url?: string
}

interface IPFSMetadata {
  name?: string
  nfc?: string
  attributes?: {
    [key: string]: any
  } | OpenSeaTrait[]
}

/**
 * Extract NFC ID from OpenSea traits
 */
function extractNFCFromTraits(traits: OpenSeaTrait[] | undefined): string | null {
  if (!traits || !Array.isArray(traits)) return null
  
  const nfcTrait = traits.find((trait) => {
    if (!trait.trait_type) return false
    const traitName = trait.trait_type.toLowerCase()
    return traitName === 'nfc' || 
           traitName === 'nfc_id' || 
           traitName === 'nfcid' ||
           traitName.includes('nfc')
  })
  
  return nfcTrait?.value ? String(nfcTrait.value).trim() : null
}

/**
 * Extract IPFS hash from metadata URL
 */
function extractIPFSHash(metadataUrl: string | undefined): string | null {
  if (!metadataUrl) return null
  
  if (metadataUrl.startsWith('ipfs://')) {
    return metadataUrl.replace('ipfs://', '')
  }
  
  if (metadataUrl.includes('/ipfs/')) {
    const parts = metadataUrl.split('/ipfs/')
    return parts[1]?.split('/')[0] || null
  }
  
  return null
}

/**
 * Fetch IPFS metadata with error handling
 */
async function fetchIpfsMetadata(ipfsHash: string): Promise<IPFSMetadata | null> {
  try {
    const response = await fetch(
      `https://cryptokaiju.mypinata.cloud/ipfs/${ipfsHash}`,
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.warn(`Failed to fetch IPFS ${ipfsHash}:`, error)
    return null
  }
}

/**
 * Extract NFC ID from IPFS metadata
 */
function extractNFCFromMetadata(metadata: IPFSMetadata | null): string | null {
  if (!metadata) return null
  
  // Check direct nfc field
  if (metadata.nfc) return String(metadata.nfc).trim()
  
  // Check attributes object
  if (metadata.attributes) {
    if (typeof metadata.attributes === 'object' && !Array.isArray(metadata.attributes)) {
      if (metadata.attributes.nfc) return String(metadata.attributes.nfc).trim()
      if (metadata.attributes.nfc_id) return String(metadata.attributes.nfc_id).trim()
      if (metadata.attributes.nfcId) return String(metadata.attributes.nfcId).trim()
      
      // Check all attribute keys for NFC-like values
      for (const [key, value] of Object.entries(metadata.attributes)) {
        if (key.toLowerCase().includes('nfc') && value) {
          return String(value).trim()
        }
      }
    }
    
    // Check attributes array
    if (Array.isArray(metadata.attributes)) {
      const nfcAttr = metadata.attributes.find((attr: any) => 
        attr.trait_type?.toLowerCase().includes('nfc')
      )
      if (nfcAttr?.value) return String(nfcAttr.value).trim()
    }
  }
  
  return null
}

/**
 * NFCMappingService class for browser/client use
 */
export class NFCMappingService {
  private cache: Map<string, string> = new Map()
  
  /**
   * Get token ID by NFC ID (normalized)
   */
  getTokenIdByNFC(nfcId: string): string | null {
    const normalized = nfcId.toLowerCase().trim()
    return this.cache.get(normalized) || null
  }
  
  /**
   * Add mapping to cache
   */
  addMapping(nfcId: string, tokenId: string): void {
    const normalized = nfcId.toLowerCase().trim()
    this.cache.set(normalized, tokenId)
  }
  
  /**
   * Get all NFC IDs
   */
  getAllNFCIds(): string[] {
    return Array.from(this.cache.keys())
  }
  
  /**
   * Get mapping stats
   */
  getMappingStats() {
    return {
      totalMappings: this.cache.size,
      lastUpdated: new Date().toISOString()
    }
  }
  
  /**
   * Clear all mappings
   */
  clearMappings(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const nfcMappingService = new NFCMappingService()
export default nfcMappingService

// Export helper functions for use in other modules
export {
  extractNFCFromTraits,
  extractIPFSHash,
  fetchIpfsMetadata,
  extractNFCFromMetadata
}

// Export types
export type {
  OpenSeaTrait,
  NFCMappingEntry,
  NFCMapping,
  OpenSeaNFT,
  IPFSMetadata
}