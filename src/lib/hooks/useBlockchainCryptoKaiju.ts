// src/lib/hooks/useBlockchainCryptoKaiju.ts - ENHANCED WITH PERFORMANCE TRACKING
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import BlockchainCryptoKaijuService, {
  type KaijuNFT,
  type SearchResult,
  type ServiceStats,
} from '@/lib/services/BlockchainCryptoKaijuService'
import { ErrorHandler, ErrorFactory, CryptoKaijuError } from '@/lib/utils/errorHandling'

/* ======================================================================= */
/*  ENHANCED MY-KAIJU HOOK WITH PERFORMANCE INSIGHTS                      */
/* ======================================================================= */

export function useBlockchainMyKaiju() {
  const account = useActiveAccount()

  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // ENHANCED: Performance tracking
  const [performanceStats, setPerformanceStats] = useState<{
    fetchDuration?: number
    ipfsPerformance?: {
      primaryUsage: number
      fallbackUsage: number
      failedRequests: number
    }
  }>({})

  /* Enhanced fetching with performance tracking */
  const fetchKaijus = useCallback(async () => {
    const address = account?.address
    if (!address) {
      setKaijus([])
      setError(null)
      setPerformanceStats({})
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
      
      // ENHANCED: Get performance stats
      const serviceStats = BlockchainCryptoKaijuService.getServiceStats()
      setPerformanceStats({
        fetchDuration,
        ipfsPerformance: {
          primaryUsage: serviceStats.gatewayUsage.primary,
          fallbackUsage: serviceStats.gatewayUsage.fallback,
          failedRequests: serviceStats.gatewayUsage.failed
        }
      })
      
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
      setPerformanceStats({ fetchDuration })
      
      // Auto-retry for retryable errors (with exponential backoff)
      if (enhancedError.retryable && retryCount < 3) {
        const retryDelay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        console.log(`🔄 Auto-retrying in ${retryDelay}ms (attempt ${retryCount + 1}/3)`)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchKaijus()
        }, retryDelay)
      }
    } finally {
      setIsLoading(false)
    }
  }, [account?.address, retryCount])

  /* Refetch every time the wallet address changes */
  useEffect(() => {
    fetchKaijus()
  }, [fetchKaijus])

  /* Manual retry function */
  const retry = useCallback(() => {
    setRetryCount(0)
    fetchKaijus()
  }, [fetchKaijus])

  /* Clear data function */
  const clearData = useCallback(() => {
    setKaijus([])
    setError(null)
    setIsLoading(false)
    setLastFetchTime(null)
    setRetryCount(0)
    setPerformanceStats({})
  }, [])

  /* ENHANCED: Get detailed service statistics */
  const getServiceStats = useCallback((): ServiceStats => {
    return BlockchainCryptoKaijuService.getServiceStats()
  }, [])

  /* ENHANCED: Get gateway performance report */
  const getGatewayReport = useCallback(() => {
    return BlockchainCryptoKaijuService.getGatewayPerformanceReport()
  }, [])

  /* Check if data is stale (older than 5 minutes) */
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
    
    // ENHANCED: Performance data
    performanceStats,
    
    // Methods
    refetch: fetchKaijus,
    retry,
    clearData,
    
    // ENHANCED: Diagnostic methods
    getServiceStats,
    getGatewayReport,
  }
}

/* ======================================================================= */
/*  ENHANCED SEARCH HOOK WITH PERFORMANCE INSIGHTS                        */
/* ======================================================================= */

export function useBlockchainKaijuSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [query, setQuery] = useState<string>('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [lastSearchTime, setLastSearchTime] = useState<number | null>(null)
  
  // ENHANCED: Search performance tracking
  const [searchStats, setSearchStats] = useState<{
    searchDuration?: number
    searchType?: 'tokenId' | 'nfcId'
    cacheHit?: boolean
    gatewayUsed?: string
  }>({})

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError(ErrorFactory.validationError('search query', searchQuery))
      return
    }

    const trimmedQuery = searchQuery.trim()
    
    // Prevent duplicate searches
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
      
      // ENHANCED: Track search performance
      setSearchStats({
        searchDuration,
        searchType: isTokenId ? 'tokenId' : 'nfcId',
        cacheHit: searchDuration < 100, // Heuristic: very fast = likely cache hit
      })
      
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
      setSearchStats({ 
        searchDuration, 
        searchType: isTokenId ? 'tokenId' : 'nfcId' 
      })
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
    setSearchStats({})
  }, [])

  const retry = useCallback(() => {
    if (query) {
      search(query)
    }
  }, [query, search])

  /* ENHANCED: Get search analytics */
  const getSearchAnalytics = useCallback(() => {
    const serviceStats = BlockchainCryptoKaijuService.getServiceStats()
    return {
      currentSearch: searchStats,
      searchHistory,
      servicePerformance: {
        totalRequests: serviceStats.performance.totalRequests,
        cacheHitRate: serviceStats.performance.cacheHits / serviceStats.performance.totalRequests * 100,
        avgResponseTime: serviceStats.performance.averageResponseTime
      },
      gatewayHealth: serviceStats.gatewayUsage
    }
  }, [searchStats, searchHistory])

  return { 
    results, 
    isLoading, 
    error, 
    query,
    searchHistory,
    hasQuery: query.length > 0, 
    canRetry: error?.retryable || false,
    
    // ENHANCED: Performance data
    searchStats,
    
    // Methods
    search, 
    clear,
    retry,
    
    // ENHANCED: Analytics
    getSearchAnalytics
  }
}

// Export alias for compatibility
export const useBlockchainNFTSearch = useBlockchainKaijuSearch

/* ======================================================================= */
/*  ENHANCED SINGLE KAIJU HOOK WITH DETAILED PERFORMANCE TRACKING         */
/* ======================================================================= */

export function useBlockchainKaiju(tokenId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // ENHANCED: Detailed performance tracking
  const [fetchMetrics, setFetchMetrics] = useState<{
    totalDuration?: number
    blockchainDuration?: number
    ipfsDuration?: number
    openSeaDuration?: number
    cacheHits?: number
    gatewayUsed?: string
    dataQuality?: {
      hasBlockchainData: boolean
      hasIpfsData: boolean
      hasOpenSeaData: boolean
    }
  }>({})

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
        
        // ENHANCED: Detailed performance metrics
        const serviceStats = BlockchainCryptoKaijuService.getServiceStats()
        setFetchMetrics({
          totalDuration,
          cacheHits: serviceStats.performance.cacheHits,
          dataQuality: {
            hasBlockchainData: !!res.nft,
            hasIpfsData: !!res.nft?.ipfsData,
            hasOpenSeaData: !!res.openSeaData && Object.keys(res.openSeaData).length > 0
          }
        })
        
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
        setFetchMetrics({ totalDuration })
        
        // Auto-retry for network errors
        if (enhancedError.retryable && retryCount < 2) {
          const retryDelay = Math.pow(2, retryCount) * 1500 // 1.5s, 3s
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
      setFetchMetrics({})
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

  /* ENHANCED: Get detailed fetch analytics */
  const getFetchAnalytics = useCallback(() => {
    const serviceStats = BlockchainCryptoKaijuService.getServiceStats()
    return {
      currentFetch: fetchMetrics,
      serviceHealth: {
        totalRequests: serviceStats.performance.totalRequests,
        errorRate: serviceStats.performance.errors / serviceStats.performance.totalRequests * 100,
        avgResponseTime: serviceStats.performance.averageResponseTime,
        cacheEfficiency: serviceStats.performance.cacheHits / serviceStats.performance.totalRequests * 100
      },
      gatewayPerformance: serviceStats.gatewayUsage,
      cacheHealth: serviceStats.cacheHealth
    }
  }, [fetchMetrics])

  /* Check if data is stale */
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
    
    // ENHANCED: Performance data
    fetchMetrics,
    
    // Methods
    refresh,
    retry,
    
    // ENHANCED: Analytics
    getFetchAnalytics
  }
}

/* ======================================================================= */
/*  ENHANCED NFC KAIJU HOOK WITH ENCODING PERFORMANCE TRACKING            */
/* ======================================================================= */

export function useBlockchainKaijuByNFC(nfcId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [encodingUsed, setEncodingUsed] = useState<'ascii' | 'direct' | null>(null)
  const [attemptsCount, setAttemptsCount] = useState(0)
  
  // ENHANCED: NFC-specific performance tracking
  const [nfcMetrics, setNfcMetrics] = useState<{
    totalDuration?: number
    encodingAttempts?: number
    successfulEncoding?: 'ascii' | 'direct'
    fallbacksUsed?: number
  }>({})

  const fetchKaiju = useCallback(
    async (id: string) => {
      if (!id) return

      setIsLoading(true)
      setError(null)
      setEncodingUsed(null)
      setAttemptsCount(0)

      const startTime = Date.now()

      try {
        console.log(`🏷️ Fetching Kaiju by NFC: ${id}`)
        
        const res = await BlockchainCryptoKaijuService.getByNFCId(id)
        
        const totalDuration = Date.now() - startTime
        console.log(`✅ NFC Kaiju fetched in ${totalDuration}ms: ${res.nft?.ipfsData?.name || 'Unnamed'}`)
        
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
        
        // ENHANCED: NFC-specific metrics
        setNfcMetrics({
          totalDuration,
          encodingAttempts: 1, // Could be enhanced to track actual attempts
          successfulEncoding: 'ascii', // This would need to be returned from service
          fallbacksUsed: 0
        })
        
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
        setNfcMetrics({ totalDuration })
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
      setEncodingUsed(null)
      setAttemptsCount(0)
      setNfcMetrics({})
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
    encodingUsed,
    attemptsCount,
    canRetry: error?.retryable || false,
    
    // ENHANCED: NFC-specific performance data
    nfcMetrics,
    
    // Methods
    refresh,
    retry
  }
}

/* ======================================================================= */
/*  ENHANCED COLLECTION STATS HOOK                                        */
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

  /* Check if data is stale (older than 30 minutes) */
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
/*  ENHANCED TEST HOOK WITH GATEWAY PERFORMANCE TESTING                   */
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
      log('🚀 Starting comprehensive blockchain service test with gateway performance analysis')

      // Test 1: Service initialization and gateway health
      log('📋 Test 1: Service validation and gateway setup')
      await BlockchainCryptoKaijuService.testService()
      log('✅ Service validation passed')

      // Test 2: Gateway performance baseline
      log('📋 Test 2: Gateway performance baseline')
      const initialGatewayReport = BlockchainCryptoKaijuService.getGatewayPerformanceReport()
      log(`🌐 Gateway status: ${Object.keys(initialGatewayReport).length} gateways configured`)

      // Test 3: Error handling validation
      log('📋 Test 3: Error handling validation')
      try {
        throw ErrorFactory.validationError('test', 'invalid')
      } catch (error) {
        const normalized = ErrorHandler.normalize(error)
        log(`✅ Error handling: ${normalized.userMessage}`)
      }

      // Test 4: Token lookup with performance tracking
      log('📋 Test 4: Token lookup with performance tracking')
      const tokenStart = Date.now()
      try {
        const result = await BlockchainCryptoKaijuService.getByTokenId('1')
        const tokenDuration = Date.now() - tokenStart
        if (result.nft) {
          log(`✅ Token 1 (${tokenDuration}ms): ${result.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        logError(error)
      }

      // Test 5: Invalid token lookup
      log('📋 Test 5: Invalid token test')
      try {
        await BlockchainCryptoKaijuService.getByTokenId('999999999')
      } catch (error) {
        log(`✅ Invalid token error handled: ${ErrorHandler.getUserMessage(error)}`)
      }

      // Test 6: NFC lookup test
      log('📋 Test 6: NFC lookup test')
      try {
        const nfcResult = await BlockchainCryptoKaijuService.getByNFCId('042C0A8A9F6580')
        if (nfcResult.nft) {
          log(`✅ NFC lookup: ${nfcResult.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        log(`ℹ️ NFC lookup result: ${ErrorHandler.getUserMessage(error)}`)
      }

      // Test 7: Service statistics and gateway performance
      log('📋 Test 7: Service statistics and gateway performance')
      const stats = BlockchainCryptoKaijuService.getServiceStats()
      log(`📊 Performance: ${stats.performance.totalRequests} requests, ${stats.performance.cacheHits} cache hits`)
      log(`📦 Cache: ${stats.cache.size} entries`)
      log(`🌐 Gateway usage: Primary=${stats.gatewayUsage.primary}, Fallback=${stats.gatewayUsage.fallback}, Failed=${stats.gatewayUsage.failed}`)

      // Test 8: Gateway performance report
      log('📋 Test 8: Gateway performance analysis')
      const finalGatewayReport = BlockchainCryptoKaijuService.getGatewayPerformanceReport()
      Object.entries(finalGatewayReport).forEach(([url, metrics]) => {
        log(`🌐 ${url}: ${metrics.successRate} success rate, ${metrics.avgResponseTime} avg response`)
      })

      // Test 9: API route stats (if available)
      log('📋 Test 9: API route performance check')
      try {
        const apiStatsResponse = await fetch('/api/ipfs/stats?stats=true')
        if (apiStatsResponse.ok) {
          const apiStats = await apiStatsResponse.json()
          log(`🔗 API Gateway usage: ${JSON.stringify(apiStats.gatewayUsage)}`)
        }
      } catch (error) {
        log(`ℹ️ API stats not available: ${error.message}`)
      }

      log('🎉 Comprehensive test with gateway performance analysis completed successfully!')

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
/*  ENHANCED WALLET CONNECTION HOOK                                       */
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