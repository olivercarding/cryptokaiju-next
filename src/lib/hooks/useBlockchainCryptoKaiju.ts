// src/lib/hooks/useBlockchainCryptoKaiju.ts - OPTIMIZED WITH SIMPLIFIED TRACKING
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import BlockchainCryptoKaijuService, {
  type KaijuNFT,
  type SearchResult,
  type ServiceStats,
} from '@/lib/services/BlockchainCryptoKaijuService'
import { ErrorHandler, ErrorFactory, CryptoKaijuError } from '@/lib/utils/errorHandling'

// Helper function to safely extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

/* ======================================================================= */
/*  OPTIMIZED MY-KAIJU HOOK                                               */
/* ======================================================================= */

export function useBlockchainMyKaiju() {
  const account = useActiveAccount()

  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchKaijus = useCallback(async () => {
    const address = account?.address
    if (!address) {
      setKaijus([])
      setError(null)
      return
    }

    console.log('🔍 Fetching Kaiju for address:', address)
    setIsLoading(true)
    setError(null)
    
    const startTime = Date.now()

    try {
      const data = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      const fetchDuration = Date.now() - startTime
      
      console.log('✅ Successfully fetched', data.length, 'Kaiju in', fetchDuration, 'ms')
      setKaijus(data)
      setLastFetchTime(Date.now())
      setRetryCount(0)
      
    } catch (err) {
      console.error('❌ fetchKaijus error:', err)
      const fetchDuration = Date.now() - startTime
      
      const enhancedError = ErrorHandler.normalize(err, {
        address,
        action: 'fetchMyKaiju',
        retryCount,
        duration: fetchDuration
      })
      
      setError(enhancedError as CryptoKaijuError)
      setKaijus([])
      
      // Auto-retry for retryable errors (simplified logic)
      if (enhancedError.retryable && retryCount < 2) {
        const retryDelay = Math.pow(2, retryCount) * 1000 // 1s, 2s
        console.log(`🔄 Auto-retrying in ${retryDelay}ms (attempt ${retryCount + 1}/2)`)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchKaijus()
        }, retryDelay)
      }
    } finally {
      setIsLoading(false)
    }
  }, [account?.address, retryCount])

  useEffect(() => {
    fetchKaijus()
  }, [fetchKaijus])

  const retry = useCallback(() => {
    setRetryCount(0)
    fetchKaijus()
  }, [fetchKaijus])

  const clearData = useCallback(() => {
    setKaijus([])
    setError(null)
    setIsLoading(false)
    setLastFetchTime(null)
    setRetryCount(0)
  }, [])

  // Simplified service stats (for backward compatibility)
  const getServiceStats = useCallback((): ServiceStats => {
    return BlockchainCryptoKaijuService.getServiceStats()
  }, [])

  // Check if data is stale (older than 5 minutes)
  const isStale = lastFetchTime ? (Date.now() - lastFetchTime) > 5 * 60 * 1000 : false

  return {
    kaijus,
    isLoading,
    error,
    isConnected: !!account?.address,
    lastFetchTime,
    isStale,
    retryCount,
    canRetry: error?.retryable || false,
    
    // Methods
    refetch: fetchKaijus,
    retry,
    clearData,
    
    // Simplified stats (for backward compatibility)
    getServiceStats,
  }
}

/* ======================================================================= */
/*  OPTIMIZED SEARCH HOOK                                                 */
/* ======================================================================= */

export function useBlockchainKaijuSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [query, setQuery] = useState<string>('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [lastSearchTime, setLastSearchTime] = useState<number | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError(ErrorFactory.validationError('search query', searchQuery))
      return
    }

    const trimmedQuery = searchQuery.trim()
    
    // Prevent duplicate searches within 30 seconds
    if (trimmedQuery === query && results.length > 0 && lastSearchTime && (Date.now() - lastSearchTime) < 30000) {
      console.log('🔄 Skipping duplicate search within 30 seconds')
      return
    }

    setIsLoading(true)
    setError(null)
    setQuery(trimmedQuery)

    const startTime = Date.now()
    const isTokenId = /^\d+$/.test(trimmedQuery)

    try {
      console.log(`🔍 Searching for: "${trimmedQuery}" (${isTokenId ? 'Token ID' : 'NFC ID'})`)
      
      const data = await BlockchainCryptoKaijuService.searchTokens(trimmedQuery)
      
      const searchDuration = Date.now() - startTime
      console.log(`✅ Search completed in ${searchDuration}ms, found ${data.length} results`)
      
      setResults(data)
      setLastSearchTime(Date.now())
      
      // Add to search history (keep last 10)
      setSearchHistory(prev => {
        const newHistory = [trimmedQuery, ...prev.filter(q => q !== trimmedQuery)]
        return newHistory.slice(0, 10)
      })
      
    } catch (err) {
      const searchDuration = Date.now() - startTime
      console.error(`❌ Search failed after ${searchDuration}ms:`, err)
      
      const enhancedError = ErrorHandler.normalize(err, {
        query: trimmedQuery,
        action: 'search',
        duration: searchDuration,
        searchType: isTokenId ? 'tokenId' : 'nfcId'
      })
      
      setError(enhancedError as CryptoKaijuError)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, results.length, lastSearchTime])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
    setQuery('')
    setIsLoading(false)
    setLastSearchTime(null)
  }, [])

  const retry = useCallback(() => {
    if (query) {
      search(query)
    }
  }, [query, search])

  return { 
    results, 
    isLoading, 
    error, 
    query,
    searchHistory,
    hasQuery: query.length > 0, 
    canRetry: error?.retryable || false,
    
    // Methods
    search, 
    clear,
    retry,
  }
}

// Export alias for compatibility
export const useBlockchainNFTSearch = useBlockchainKaijuSearch

/* ======================================================================= */
/*  OPTIMIZED SINGLE KAIJU HOOK                                          */
/* ======================================================================= */

export function useBlockchainKaiju(tokenId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchKaiju = useCallback(
    async (id: string) => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      const startTime = Date.now()

      try {
        console.log(`🔍 Fetching Kaiju token ID: ${id}`)
        
        const res = await BlockchainCryptoKaijuService.getByTokenId(id)
        
        const totalDuration = Date.now() - startTime
        console.log(`✅ Kaiju fetched in ${totalDuration}ms: ${res.nft?.ipfsData?.name || 'Unnamed'}`)
        
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
        setLastFetchTime(Date.now())
        setRetryCount(0)
        
      } catch (err) {
        const totalDuration = Date.now() - startTime
        console.error(`❌ Kaiju fetch failed after ${totalDuration}ms:`, err)
        
        const enhancedError = ErrorHandler.normalize(err, {
          tokenId: id,
          action: 'fetchKaiju',
          duration: totalDuration,
          retryCount
        })
        
        setError(enhancedError as CryptoKaijuError)
        setKaiju(null)
        setOpenSeaData(null)
        
        // Auto-retry for network errors (simplified)
        if (enhancedError.retryable && retryCount < 1) {
          const retryDelay = 2000 // 2 seconds
          console.log(`🔄 Auto-retrying in ${retryDelay}ms`)
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            fetchKaiju(id)
          }, retryDelay)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [retryCount],
  )

  useEffect(() => {
    if (tokenId) {
      fetchKaiju(tokenId)
    } else {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
      setLastFetchTime(null)
      setRetryCount(0)
    }
  }, [tokenId, fetchKaiju])

  const retry = useCallback(() => {
    if (tokenId) {
      setRetryCount(0)
      fetchKaiju(tokenId)
    }
  }, [tokenId, fetchKaiju])

  const refresh = useCallback(() => {
    if (tokenId) {
      setRetryCount(0)
      fetchKaiju(tokenId)
    }
  }, [tokenId, fetchKaiju])

  // Check if data is stale
  const isStale = lastFetchTime ? (Date.now() - lastFetchTime) > 10 * 60 * 1000 : false

  return { 
    kaiju, 
    openSeaData, 
    isLoading, 
    error,
    lastFetchTime,
    isStale,
    retryCount,
    canRetry: error?.retryable || false,
    
    // Methods
    refresh,
    retry,
  }
}

/* ======================================================================= */
/*  OPTIMIZED NFC KAIJU HOOK                                             */
/* ======================================================================= */

export function useBlockchainKaijuByNFC(nfcId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)

  const fetchKaiju = useCallback(
    async (id: string) => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      const startTime = Date.now()

      try {
        console.log(`🏷️ Fetching Kaiju by NFC: ${id}`)
        
        const res = await BlockchainCryptoKaijuService.getByNFCId(id)
        
        const totalDuration = Date.now() - startTime
        console.log(`✅ NFC Kaiju fetched in ${totalDuration}ms: ${res.nft?.ipfsData?.name || 'Unnamed'}`)
        
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
        
      } catch (err) {
        const totalDuration = Date.now() - startTime
        console.error(`❌ NFC Kaiju fetch failed after ${totalDuration}ms:`, err)
        
        const enhancedError = ErrorHandler.normalize(err, {
          nfcId: id,
          action: 'fetchKaijuByNFC',
          duration: totalDuration
        })
        
        setError(enhancedError as CryptoKaijuError)
        setKaiju(null)
        setOpenSeaData(null)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (nfcId) {
      fetchKaiju(nfcId)
    } else {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
    }
  }, [nfcId, fetchKaiju])

  const retry = useCallback(() => {
    if (nfcId) {
      fetchKaiju(nfcId)
    }
  }, [nfcId, fetchKaiju])

  const refresh = useCallback(() => retry(), [retry])

  return { 
    kaiju, 
    openSeaData, 
    isLoading, 
    error,
    canRetry: error?.retryable || false,
    
    // Methods
    refresh,
    retry
  }
}

/* ======================================================================= */
/*  OPTIMIZED COLLECTION STATS HOOK                                      */
/* ======================================================================= */

export function useBlockchainCollectionStats() {
  const [stats, setStats] = useState<{ totalSupply: number; owners?: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('📊 Fetching collection stats...')
      
      const data = await BlockchainCryptoKaijuService.getCollectionStats()
      
      console.log('✅ Collection stats fetched:', data)
      setStats(data)
      setLastFetchTime(Date.now())
    } catch (err) {
      console.error('❌ Collection stats fetch failed:', err)
      
      const enhancedError = ErrorHandler.normalize(err, {
        action: 'fetchCollectionStats'
      })
      
      setError(enhancedError as CryptoKaijuError)
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const retry = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  const refresh = useCallback(() => fetchStats(), [fetchStats])

  // Check if data is stale (older than 30 minutes)
  const isStale = lastFetchTime ? (Date.now() - lastFetchTime) > 30 * 60 * 1000 : false

  return { 
    stats, 
    isLoading, 
    error,
    lastFetchTime,
    isStale,
    canRetry: error?.retryable || false,
    refresh,
    retry
  }
}

/* ======================================================================= */
/*  SIMPLIFIED TEST HOOK                                                  */
/* ======================================================================= */

export function useBlockchainTest() {
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [testErrors, setTestErrors] = useState<CryptoKaijuError[]>([])

  const log = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${msg}`
    setTestResults(prev => [...prev, logEntry])
    console.log('[Test]', logEntry)
  }, [])

  const logError = useCallback((error: any) => {
    const enhancedError = ErrorHandler.normalize(error, { context: 'testing' })
    setTestErrors(prev => [...prev, enhancedError as CryptoKaijuError])
    log(`❌ ${enhancedError.userMessage}`)
  }, [log])

  const runTest = useCallback(async () => {
    setIsTestRunning(true)
    setTestResults([])
    setTestErrors([])

    try {
      log('🚀 Starting optimized blockchain service test')

      // Test 1: Service validation
      log('📋 Test 1: Service validation')
      await BlockchainCryptoKaijuService.testService()
      log('✅ Service validation passed')

      // Test 2: Token lookup
      log('📋 Test 2: Token lookup test')
      try {
        const result = await BlockchainCryptoKaijuService.getByTokenId('1')
        if (result.nft) {
          log(`✅ Token 1: ${result.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        logError(error)
      }

      // Test 3: Invalid token test
      log('📋 Test 3: Invalid token test')
      try {
        await BlockchainCryptoKaijuService.getByTokenId('999999999')
      } catch (error) {
        log(`✅ Invalid token error handled: ${ErrorHandler.getUserMessage(error)}`)
      }

      // Test 4: Service statistics
      log('📋 Test 4: Service statistics')
      const stats = BlockchainCryptoKaijuService.getServiceStats()
      log(`📊 Performance: ${stats.performance.totalRequests} requests, ${stats.performance.cacheHits} cache hits`)
      log(`📈 IPFS success rate: ${(stats.performance.ipfsSuccessRate * 100).toFixed(1)}%`)
      log(`🔄 OpenSea fallbacks: ${stats.performance.openSeaFallbacks}`)

      log('🎉 Optimized test completed successfully!')

    } catch (err) {
      logError(err)
      log('❌ Test suite failed')
    } finally {
      setIsTestRunning(false)
    }
  }, [log, logError])

  const clearResults = useCallback(() => {
    setTestResults([])
    setTestErrors([])
  }, [])

  return { 
    isTestRunning, 
    testResults, 
    testErrors,
    totalErrors: testErrors.length,
    runTest,
    clearResults
  }
}

/* ======================================================================= */
/*  SIMPLIFIED WALLET CONNECTION HOOK                                    */
/* ======================================================================= */

export function useManualWalletConnection() {
  const account = useActiveAccount()
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<CryptoKaijuError | null>(null)

  useEffect(() => {
    const isConnected = !!account?.address
    setConnected(isConnected)
    
    if (isConnected) {
      setConnectionError(null)
      console.log('✅ Wallet connected:', account.address)
    } else {
      console.log('ℹ️ Wallet disconnected')
    }
  }, [account?.address])

  const validateConnection = useCallback(() => {
    if (!account?.address) {
      const error = ErrorFactory.walletError('No wallet connected')
      setConnectionError(error)
      throw error
    }
    
    setConnectionError(null)
    return true
  }, [account?.address])

  return { 
    account, 
    isConnected: connected, 
    address: account?.address,
    connectionError,
    validateConnection
  }
}