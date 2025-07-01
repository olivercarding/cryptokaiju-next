// src/scripts/buildNFCMapping.js
// Enhanced version that checks both traits AND IPFS metadata
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0'
const OPENSEA_NFT_ENDPOINT = `${OPENSEA_BASE_URL}/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts`

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
        timeout: 8000,
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

async function buildMapping(maxNFTs = 300) {
  console.log(`🏗️ Building NFC mapping for up to ${maxNFTs} NFTs...`)
  console.log(`📡 Using OpenSea API with contract: ${CONTRACT_ADDRESS}`)
  
  const mapping = {}
  let next = ""
  let processed = 0
  let nfcsFound = 0
  let traitsChecked = 0
  let ipfsChecked = 0
  let errors = 0

  try {
    while (processed < maxNFTs) {
      const batchSize = Math.min(25, maxNFTs - processed) // Smaller batches for IPFS calls
      const params = { limit: batchSize }
      if (next) params.next = next

      console.log(`\n📦 Batch ${Math.floor(processed/25) + 1}: Processing NFTs ${processed + 1}-${processed + batchSize}`)
      
      const response = await axios.get(OPENSEA_NFT_ENDPOINT, {
        ...OPENSEA_CONFIG,
        params
      })

      const nfts = response.data.nfts || []
      if (nfts.length === 0) {
        console.log('⚠️ No more NFTs returned, stopping...')
        break
      }

      console.log(`   Processing ${nfts.length} NFTs...`)
      
      for (const nft of nfts) {
        try {
          let nfcId = null
          let name = nft.name || `Token ${nft.identifier}`

          // Method 1: Check traits first (faster)
          nfcId = extractNFCFromTraits(nft.traits)
          traitsChecked++
          
          if (nfcId) {
            console.log(`     ✅ Found in traits: ${nfcId} -> Token ${nft.identifier}`)
          }

          // Method 2: If not in traits, try IPFS metadata
          if (!nfcId && nft.metadata_url) {
            const ipfsHash = extractIPFSHash(nft.metadata_url)
            if (ipfsHash) {
              console.log(`     🔍 Checking IPFS for token ${nft.identifier}...`)
              const metadata = await fetchIpfsMetadata(ipfsHash)
              ipfsChecked++
              
              if (metadata) {
                nfcId = extractNFCFromMetadata(metadata)
                if (metadata.name) {
                  name = metadata.name
                }
                
                if (nfcId) {
                  console.log(`     ✅ Found in IPFS: ${nfcId} -> Token ${nft.identifier}`)
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
          }

        } catch (err) {
          errors++
          console.log(`     ⚠️ Error with token ${nft.identifier}`)
        }
      }

      processed += nfts.length
      next = response.data.next

      console.log(`   📊 Progress: ${nfcsFound} NFC IDs found so far`)
      console.log(`   📋 Checked ${traitsChecked} traits, ${ipfsChecked} IPFS metadata`)

      if (!next) {
        console.log('✅ Reached end of collection')
        break
      }
      
      // Rate limiting for IPFS calls
      console.log('   ⏳ Waiting 1 second...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n🎉 Mapping build complete!`)
    console.log(`📊 Final Results:`)
    console.log(`   - NFTs processed: ${processed}`)
    console.log(`   - NFC IDs found: ${nfcsFound}`)
    console.log(`   - Traits checked: ${traitsChecked}`)
    console.log(`   - IPFS checked: ${ipfsChecked}`)
    console.log(`   - Errors: ${errors}`)

    if (nfcsFound > 0) {
      console.log(`\n🎯 Found NFC IDs:`)
      Object.entries(mapping).forEach(([nfc, data]) => {
        console.log(`   ${nfc} -> Token ${data.tokenId}`)
      })
    }

    return mapping

  } catch (error) {
    console.error('❌ Error building mapping:', error.message)
    throw error
  }
}

async function saveMapping(mapping) {
  const outputDir = path.join(process.cwd(), 'src/lib/data')
  const outputPath = path.join(outputDir, 'nfc-mapping.ts')
  
  console.log(`\n💾 Saving mapping to ${outputPath}...`)
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const tsContent = `// Auto-generated NFC mapping
// Generated at: ${new Date().toISOString()}
// Total mappings: ${Object.keys(mapping).length}

export const NFC_MAPPING = ${JSON.stringify(mapping, null, 2)}

export function getTokenIdByNFC(nfcId: string): string | null {
  const normalized = nfcId.toLowerCase().trim()
  return NFC_MAPPING[normalized]?.tokenId || null
}

export function getAllNFCIds(): string[] {
  return Object.keys(NFC_MAPPING)
}

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
}

async function main() {
  try {
    console.log('🚀 Starting enhanced NFC mapping build...')
    console.log(`🔑 Using API key: ${OPENSEA_API_KEY.slice(0, 8)}...`)
    
    // Build the mapping (smaller number for testing)
    const mapping = await buildMapping(100) // Test with 100 NFTs first
    
    if (Object.keys(mapping).length === 0) {
      console.log('\n⚠️ No NFC IDs found in the tested NFTs!')
      console.log('This could mean:')
      console.log('1. NFC IDs might be in later tokens (try increasing maxNFTs)')
      console.log('2. NFC IDs might be stored differently than expected')
      console.log('3. API might be having issues')
      console.log('\n💡 You can manually add known NFC mappings to src/lib/data/nfc-mapping.ts')
      return
    }
    
    await saveMapping(mapping)
    
    console.log('\n🎉 Build complete!')
    console.log('   Your NFC lookups should now work instantly!')
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)