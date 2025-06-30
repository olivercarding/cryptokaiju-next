{/* Debug Section - Only in development - UPDATED */}
{process.env.NODE_ENV === 'development' && (
  <div className="px-6 mb-8">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-4"
      >
        <h3 className="text-orange-200 font-bold mb-3 text-center">🧪 Debug Tools (Development Only)</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          
          {/* API Connectivity Test */}
          <button 
            onClick={async () => {
              console.log('🧪 Testing API connectivity...')
              try {
                const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                await CryptoKaijuApiService.testAPI()
                alert('✅ API test passed! Check console for details.')
              } catch (error) {
                console.error('❌ API test failed:', error)
                alert('❌ API test failed. Check console.')
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded text-sm"
          >
            🔌 Test API
          </button>

          {/* Quick NFC Test */}
          <button 
            onClick={async () => {
              console.log('🧪 Testing specific NFC lookup...')
              try {
                const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                await CryptoKaijuApiService.testNFCLookup('043821FA4E6E80')
                alert('✅ NFC test complete! Check console.')
              } catch (error) {
                console.error('❌ NFC test failed:', error)
                alert('❌ NFC test failed. Check console.')
              }
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded text-sm"
          >
            🏷️ Test NFC Lookup
          </button>
          
          {/* Fast Token Sample */}
          <button 
            onClick={async () => {
              try {
                const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                
                console.log('🔍 Testing quick token samples...')
                
                // Test a few specific tokens
                const testTokens = ['1', '100', '1300']
                
                for (const tokenId of testTokens) {
                  try {
                    console.log(`\n--- Testing Token ${tokenId} ---`)
                    const token = await CryptoKaijuApiService.getTokenDetails(tokenId)
                    if (token) {
                      console.log(`✅ Token ${tokenId}:`, {
                        name: token.ipfsData?.name,
                        nfcId: token.nfcId,
                        owner: token.owner
                      })
                    } else {
                      console.log(`❌ Token ${tokenId} not found`)
                    }
                  } catch (error) {
                    console.log(`❌ Token ${tokenId} failed:`, error.message)
                  }
                }
                
                alert('✅ Token test complete! Check console.')
                
              } catch (error) {
                console.error('❌ Token test failed:', error)
                alert('❌ Test failed. Check console.')
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm"
          >
            🎨 Test Tokens
          </button>

          {/* Clear Cache */}
          <button 
            onClick={async () => {
              try {
                const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                CryptoKaijuApiService.clearCache()
                console.log('🗑️ Cache cleared successfully')
                alert('✅ Cache cleared!')
              } catch (error) {
                console.error('❌ Clear cache failed:', error)
                alert('❌ Clear cache failed.')
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded text-sm"
          >
            🗑️ Clear Cache
          </button>

          {/* Quick Search Test */}
          <button 
            onClick={async () => {
              const searchQuery = prompt('Enter NFC ID or Token ID to test:')
              if (!searchQuery) return
              
              try {
                const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                
                console.log(`🔍 Testing search for: "${searchQuery}"`)
                const results = await CryptoKaijuApiService.searchTokens(searchQuery)
                
                console.log(`📊 Search results (${results.length}):`, results)
                
                if (results.length > 0) {
                  alert(`✅ Found ${results.length} result(s)! Check console for details.`)
                } else {
                  alert('❌ No results found.')
                }
                
              } catch (error) {
                console.error('❌ Search test failed:', error)
                alert('❌ Search failed. Check console.')
              }
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded text-sm"
          >
            🔍 Custom Search
          </button>
          
        </div>
        <p className="text-orange-300 text-xs mt-3 text-center">
          These tools help debug the OpenSea API integration. The service now uses optimized endpoints and better error handling.
        </p>
      </motion.div>
    </div>
  </div>
)}