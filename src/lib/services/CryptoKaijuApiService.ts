// src/lib/services/CryptoKaijuApiService.ts - Safe configuration section
import axios from 'axios'

// OpenSea API endpoints - FIXED URLs
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const COLLECTION_SLUG = 'cryptokaiju'
const CONTRACT_ADDRESS = '0x102c527714ab7e652630cac7a30abb482b041fd0'

// Use contract address instead of collection slug for more reliable API calls
const OPENSEA_NFT_ENDPOINT = `${OPENSEA_BASE_URL}/chain/ethereum/contract/${CONTRACT_ADDRESS}/nfts`
const OPENSEA_COLLECTION_ENDPOINT = `${OPENSEA_BASE_URL}/collections/${COLLECTION_SLUG}`

// ✅ SECURE: No hardcoded fallback API key
const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY

// ✅ SECURE: Check if API key is available and warn if missing
const OPENSEA_CONFIG = {
  headers: {
    'Accept': 'application/json',
    ...(OPENSEA_API_KEY && { 'X-API-KEY': OPENSEA_API_KEY })
  },
  timeout: 30000
}

// Warn if API key is missing (only in development)
if (!OPENSEA_API_KEY && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ NEXT_PUBLIC_OPENSEA_API_KEY not configured - OpenSea API calls may be rate limited')
}

class CryptoKaijuApiService {
  // ... rest of the service remains the same

  /**
   * Test API connectivity and configuration
   */
  async testAPI(): Promise<void> {
    console.log('🧪 Testing OpenSea API connectivity...')
    
    // Check if API key is configured
    if (!OPENSEA_API_KEY) {
      console.warn('⚠️ No OpenSea API key configured - requests may be rate limited')
    }
    
    try {
      // Test 1: Check collection exists
      console.log('📋 Testing collection endpoint...')
      const collectionResponse = await axios.get(OPENSEA_COLLECTION_ENDPOINT, OPENSEA_CONFIG)
      console.log('✅ Collection found:', collectionResponse.data.name)
      
      // ... rest of test method remains the same
      
    } catch (error) {
      console.error('❌ API test failed:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error('🔑 API key may be missing or invalid')
        }
        console.error('Status:', error.response?.status)
        console.error('Status Text:', error.response?.statusText)
      }
      throw error
    }
  }
}