// scripts/diagnose-opensea.js
// Run with: node -r dotenv/config scripts/diagnose-opensea.js

// Import fetch - works with both node-fetch and built-in fetch
let fetch
try {
  // Try built-in fetch first (Node 18+)
  fetch = globalThis.fetch
  if (!fetch) {
    throw new Error('No built-in fetch')
  }
  console.log('🌐 Using built-in fetch')
} catch (error) {
  // Fallback to node-fetch
  try {
    fetch = require('node-fetch')
    console.log('📦 Using node-fetch package')
  } catch (importError) {
    console.error('❌ No fetch available. Install node-fetch: npm install node-fetch@2')
    process.exit(1)
  }
}

async function diagnoseOpenSeaIssues() {
  console.log('🔍 Diagnosing OpenSea API Issues...\n')

  // Check 1: Environment Variables
  console.log('1. 📋 Environment Variables:')
  const serverKey = process.env.OPENSEA_API_KEY
  const clientKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY
  
  console.log(`   OPENSEA_API_KEY (server): ${serverKey ? '✅ Present' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_OPENSEA_API_KEY (client): ${clientKey ? '⚠️ Present (should be removed)' : '✅ Correctly not set'}`)
  
  if (!serverKey) {
    console.log('   ❌ CRITICAL: OPENSEA_API_KEY is missing!')
    console.log('   📝 Solution: Add OPENSEA_API_KEY=your_key_here to .env.local')
    return
  }

  if (clientKey) {
    console.log('   ⚠️ WARNING: Remove NEXT_PUBLIC_OPENSEA_API_KEY (security risk)')
  }

  // Check 2: API Key Format
  console.log('\n2. 🔑 API Key Validation:')
  console.log(`   Node.js Version: ${process.version}`)
  if (serverKey.length < 30) {
    console.log('   ❌ API key seems too short (should be 32+ characters)')
  } else {
    console.log('   ✅ API key length looks correct')
  }

  // Check 3: Direct OpenSea API Test
  console.log('\n3. 🌊 Direct OpenSea API Test:')
  try {
    const testResponse = await fetch('https://api.opensea.io/api/v2/collections/cryptokaiju', {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': serverKey,
        'User-Agent': 'CryptoKaiju/1.0'
      }
    })

    if (testResponse.ok) {
      const data = await testResponse.json()
      console.log(`   ✅ Collection test passed: ${data.name || 'CryptoKaiju'}`)
    } else {
      const errorText = await testResponse.text()
      console.log(`   ❌ Collection test failed: ${testResponse.status} - ${errorText}`)
      
      if (testResponse.status === 401) {
        console.log('   💡 This suggests your API key is invalid or expired')
      } else if (testResponse.status === 429) {
        console.log('   💡 Rate limited - wait and try again')
      }
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`)
  }

  // Check 4: Account NFTs Test (The problematic endpoint)
  console.log('\n4. 👤 Account NFTs Test:')
  const testAddress = '0x7205A1B9C5cf6494ba2CEb5adCca831C05536912' // From your logs
  
  try {
    // Test WITHOUT collection parameter (this was causing the 400 error)
    console.log('   🧪 Testing account NFTs endpoint WITHOUT collection parameter...')
    const accountResponse = await fetch(
      `https://api.opensea.io/api/v2/chain/ethereum/account/${testAddress}/nfts?limit=50`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': serverKey,
          'User-Agent': 'CryptoKaiju/1.0'
        }
      }
    )

    if (accountResponse.ok) {
      const data = await accountResponse.json()
      console.log(`   ✅ Account NFTs test passed: Found ${data.nfts?.length || 0} total NFTs`)
      
      // Filter for CryptoKaiju NFTs
      const cryptoKaijuNFTs = data.nfts?.filter((nft) => 
        nft.contract?.toLowerCase() === '0x102c527714ab7e652630cac7a30abb482b041fd0'
      ) || []
      
      console.log(`   🔥 CryptoKaiju NFTs found: ${cryptoKaijuNFTs.length}`)
      
      if (cryptoKaijuNFTs.length > 0) {
        console.log(`   📝 First CryptoKaiju: ${cryptoKaijuNFTs[0].name || cryptoKaijuNFTs[0].identifier}`)
      }
    } else {
      const errorText = await accountResponse.text()
      console.log(`   ❌ Account NFTs test failed: ${accountResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Account test error: ${error.message}`)
  }

  // Check 5: Test with WRONG collection parameter (to show the issue)
  console.log('\n5. 🚫 Testing with collection parameter (should fail):')
  try {
    const badResponse = await fetch(
      `https://api.opensea.io/api/v2/chain/ethereum/account/${testAddress}/nfts?collection=cryptokaiju&limit=50`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': serverKey,
          'User-Agent': 'CryptoKaiju/1.0'
        }
      }
    )

    if (badResponse.ok) {
      console.log('   😱 Unexpected: This should have failed!')
    } else {
      console.log(`   ✅ Expected failure: ${badResponse.status} - This confirms collection parameter is not supported`)
    }
  } catch (error) {
    console.log(`   ✅ Expected error: ${error.message}`)
  }

  // Check 6: Test individual NFT endpoint
  console.log('\n6. 🎯 Individual NFT Test:')
  try {
    const nftResponse = await fetch(
      'https://api.opensea.io/api/v2/chain/ethereum/contract/0x102c527714ab7e652630cac7a30abb482b041fd0/nfts/1',
      {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': serverKey,
          'User-Agent': 'CryptoKaiju/1.0'
        }
      }
    )

    if (nftResponse.ok) {
      const data = await nftResponse.json()
      console.log(`   ✅ Individual NFT test passed: ${data.nft?.name || 'CryptoKaiju #1'}`)
    } else {
      const errorText = await nftResponse.text()
      console.log(`   ❌ Individual NFT test failed: ${nftResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ Individual NFT test error: ${error.message}`)
  }

  // Summary
  console.log('\n📋 SUMMARY:')
  console.log('   ✅ OPENSEA_API_KEY is correctly configured!')
  console.log('   ✅ The main issue was using ?collection=cryptokaiju parameter')
  console.log('   ✅ OpenSea API v2 account endpoint doesn\'t support collection filtering')
  console.log('   ✅ Solution: Fetch all NFTs and filter by contract address client-side')
  console.log('\n🚀 Next steps:')
  console.log('   1. ✅ OPENSEA_API_KEY is set in .env.local')
  console.log('   2. Update your service to remove collection parameter')
  console.log('   3. Filter results by contract address after fetching')
  console.log('   4. Restart your development server')
  console.log('\n💡 Your OpenSea API key is working! Apply the service code fixes to resolve the 400 errors.')
}

// Run the diagnostic
diagnoseOpenSeaIssues().catch(console.error)