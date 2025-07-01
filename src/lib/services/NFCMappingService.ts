// src/scripts/buildNFCMapping.js
// Simple JavaScript version - no TypeScript compilation issues
// Run with: node src/scripts/buildNFCMapping.js

const axios = require('axios')
const fs = require('fs')
const path = require('path')

const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0'
const OPENSEA_NFT_ENDPOINT = `${OPENSEA_BASE_URL}/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts`

// You can set your API key here or use environment variable
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY || 'a221b5fb89fb4ffeb5fbf4fa42cc6532'

const OPENSEA_CONFIG = {
  headers: {
    'X-API-KEY': OPENSEA_API_KEY,
    'Accept': 'application/json'
  },
  timeout: 30000
}

function extractNFCFromTraits(traits) {
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

function extractIPFSHash(metadataUrl) {
  if (!metadataUrl) return null
  
  if (metadataUrl.startsWith('ipfs://')) {
    return metadataUrl.replace('ipfs://', '')
  }
  
  if (metadataUrl.includes('/ipfs/')) {
    const parts = metadataUrl.split('/ipfs/')
    return parts[1]?.split('/')[0]
  }
  
  return null
}

async function fetchIpfsMetadata(ipfsHash) {
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
    return null
  }
}

function extractNFCFromMetadata(metadata) {
  if (!metadata) return null
  
  // Check direct nfc field
  if (metadata.nfc) return String(metadata.nfc).trim()
  
  // Check attributes object
  if (metadata.attributes) {
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
    const nfcAttr = metadata.attributes.find((attr) => 
      attr.trait_type?.toLowerCase().includes('nfc')
    )
    if (nfcAttr?.value) return String(nfcAttr.value).trim()
  }
  
  return null
}

async function buildMapping(maxNFTs = 2000) {
  console.log(`🏗️ Building NFC mapping for up to ${maxNFTs} NFTs...`)
  console.log(`📡 Using OpenSea API with contract: ${CONTRACT_ADDRESS}`)
  
  const mapping = {}
  let next = ""
  let processed = 0
  let nfcsFound = 0
  let errors = 0

  try {
    while (processed < maxNFTs) {
      const batchSize = Math.min(50, maxNFTs - processed)
      const params = { limit: batchSize }
      if (next) params.next = next

      console.log(`\n📦 Batch ${Math.floor(processed/50) + 1}: Processing NFTs ${processed + 1}-${processed + batchSize}`)
      
      const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params
      })

      const nfts = response.data.nfts || []
      if (nfts.length === 0) {
        console.log('⚠️ No more NFTs returned, stopping...')
        break
      }

      // Process this batch
      console.log(`   Processing ${nfts.length} NFTs...`)
      
      for (const nft of nfts) {
        try {
          let nfcId = null
          let name = nft.name || `Token ${nft.identifier}`

          // Method 1: Check traits first (fastest)
          nfcId = extractNFCFromTraits(nft.traits)

          // Method 2: If not in traits, try IPFS metadata (slower)
          if (!nfcId && nft.metadata_url) {
            const ipfsHash = extractIPFSHash(nft.metadata_url)
            if (ipfsHash) {
              const metadata = await fetchIpfsMetadata(ipfsHash)
              if (metadata) {
                nfcId = extractNFCFromMetadata(metadata)
                if (metadata.name) {
                  name = metadata.name
                }
              }
            }
          }

          if (nfcId) {
            const normalizedNFC = nfcId.toLowerCase()
            mapping[normalizedNFC] = {
              tokenId: nft.identifier,
              name,
              discoveredAt: new Date().toISOString()
            }
            nfcsFound++
            console.log(`     ✅ ${nfcId} -> Token ${nft.identifier}`)
          }

        } catch (err) {
          errors++
          console.log(`     ⚠️ Error with token ${nft.identifier}`)
        }
      }

      processed += nfts.length
      next = response.data.next

      const successRate = processed > 0 ? ((nfcsFound / processed) * 100).toFixed(1) : '0'
      console.log(`   📊 Found ${nfcsFound} NFC IDs so far (${successRate}% success rate, ${errors} errors)`)

      if (!next) {
        console.log('✅ Reached end of collection')
        break
      }
      
      // Rate limiting
      console.log('   ⏳ Waiting 500ms...')
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`\n🎉 Mapping build complete!`)
    console.log(`📊 Final Results:`)
    console.log(`   - NFTs processed: ${processed}`)
    console.log(`   - NFC IDs found: ${nfcsFound}`)
    const finalSuccessRate = processed > 0 ? ((nfcsFound / processed) * 100).toFixed(1) : '0'
    console.log(`   - Success rate: ${finalSuccessRate}%`)
    console.log(`   - Errors: ${errors}`)

    return mapping

  } catch (error) {
    console.error('❌ Error building mapping:', error.message || error)
    throw error
  }
}

async function saveMapping(mapping) {
  const outputDir = path.join(process.cwd(), 'src/lib/data')
  const outputPath = path.join(outputDir, 'nfc-mapping.ts')
  
  console.log(`\n💾 Saving mapping to ${outputPath}...`)
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Generate TypeScript file
  const tsContent = `// Auto-generated NFC mapping
// Generated at: ${new Date().toISOString()}
// Total mappings: ${Object.keys(mapping).length}

export interface NFCMappingEntry {
  tokenId: string
  name?: string
  discoveredAt: string
}

export interface NFCMapping {
  [nfcId: string]: NFCMappingEntry
}

export const NFC_MAPPING: NFCMapping = ${JSON.stringify(mapping, null, 2)}

// Helper function to get token ID by NFC ID
export function getTokenIdByNFC(nfcId: string): string | null {
  const normalized = nfcId.toLowerCase().trim()
  return NFC_MAPPING[normalized]?.tokenId || null
}

// Get all NFC IDs
export function getAllNFCIds(): string[] {
  return Object.keys(NFC_MAPPING)
}

// Get mapping stats
export function getMappingStats() {
  return {
    totalMappings: Object.keys(NFC_MAPPING).length,
    generatedAt: '${new Date().toISOString()}'
  }
}
`

  fs.writeFileSync(outputPath, tsContent, 'utf8')
  
  console.log(`✅ Mapping saved successfully!`)
  console.log(`📁 File: ${outputPath}`)
  console.log(`📊 Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`)
  console.log(`\n🚀 You can now import this in your app:`)
  console.log(`   import { getTokenIdByNFC } from '@/lib/data/nfc-mapping'`)
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting NFC mapping build...')
    console.log(`🔑 Using API key: ${OPENSEA_API_KEY.slice(0, 8)}...`)
    
    // Build the mapping (adjust the number as needed)
    const mapping = await buildMapping(2000) // Start with 2000 NFTs
    
    if (Object.keys(mapping).length === 0) {
      console.log('⚠️ No NFC IDs found! Check your API key and contract address.')
      return
    }
    
    // Save the mapping
    await saveMapping(mapping)
    
    console.log('\n🎉 Build complete!')
    console.log('   Run your app and test NFC lookups - they should be much faster now!')
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message || error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)