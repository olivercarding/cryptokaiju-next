// src/lib/hooks/useBlockchainCryptoKaiju.ts - COMPLETE REWRITE WITH ENHANCED ERROR HANDLING
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import BlockchainCryptoKaijuService, {
  type KaijuNFT,
  type SearchResult,
} from '@/lib/services/BlockchainCryptoKaijuService'
import { ErrorHandler, ErrorFactory, CryptoKaijuError } from '@/lib/utils/errorHandling'

/* ======================================================================= */
/*  ENHANCED MY-KAIJU HOOK WITH COMPREHENSIVE ERROR HANDLING               */
/* ======================================================================= */

export function useBlockchainMyKaiju() {
  const account = useActiveAccount()

  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  /* Enhanced fetching with comprehensive error handling */
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

    try {
      const data = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      console.log('✅ Successfully fetched', data.length, 'Kaiju')
      setKaijus(data)
      setLastFetchTime(Date.now())
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error('❌ fetchKaijus error:', err)
      
      const enhancedError = ErrorHandler.normalize(err, {
        address,
        action: 'fetchMyKaiju',
        retryCount
      })
      
      setError(enhancedError as CryptoKaijuError)
      setKaijus([])
      
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
    refetch: fetchKaijus,
    retry,
    clearData,
  }
}

/* ======================================================================= */
/*  ENHANCED SEARCH HOOK WITH SMART ERROR HANDLING                        */
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
    
    // Prevent duplicate searches
    if (trimmedQuery === query && results.length > 0 && lastSearchTime && (Date.now() - lastSearchTime) < 30000) {
      console.log('🔄 Skipping duplicate search within 30 seconds')
      return
    }

    setIsLoading(true)
    setError(null)
    setQuery(trimmedQuery)

    const startTime = Date.now()

    try {
      console.log(`🔍 Searching for: "${trimmedQuery}"`)
      
      const data = await BlockchainCryptoKaijuService.searchTokens(trimmedQuery)
      
      const duration = Date.now() - startTime
      console.log(`✅ Search completed in ${duration}ms, found ${data.length} results`)
      
      setResults(data)
      setLastSearchTime(Date.now())
      
      // Add to search history (keep last 10)
      setSearchHistory(prev => {
        const newHistory = [trimmedQuery, ...prev.filter(q => q !== trimmedQuery)]
        return newHistory.slice(0, 10)
      })
      
    } catch (err) {
      const duration = Date.now() - startTime
      console.error(`❌ Search failed after ${duration}ms:`, err)
      
      const enhancedError = ErrorHandler.normalize(err, {
        query: trimmedQuery,
        action: 'search',
        duration,
        searchType: /^\d+$/.test(trimmedQuery) ? 'tokenId' : 'nfcId'
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
    search, 
    clear,
    retry
  }
}

// Export alias for compatibility
export const useBlockchainNFTSearch = useBlockchainKaijuSearch

/* ======================================================================= */
/*  ENHANCED SINGLE KAIJU HOOK WITH COMPREHENSIVE ERROR HANDLING          */
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
        
        const duration = Date.now() - startTime
        console.log(`✅ Kaiju fetched in ${duration}ms: ${res.nft?.ipfsData?.name || 'Unnamed'}`)
        
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
        setLastFetchTime(Date.now())
        setRetryCount(0)
      } catch (err) {
        const duration = Date.now() - startTime
        console.error(`❌ Kaiju fetch failed after ${duration}ms:`, err)
        
        const enhancedError = ErrorHandler.normalize(err, {
          tokenId: id,
          action: 'fetchKaiju',
          duration,
          retryCount
        })
        
        setError(enhancedError as CryptoKaijuError)
        setKaiju(null)
        setOpenSeaData(null)
        
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
    refresh,
    retry
  }
}

/* ======================================================================= */
/*  ENHANCED NFC KAIJU HOOK WITH SMART ENCODING DETECTION                 */
/* ======================================================================= */

export function useBlockchainKaijuByNFC(nfcId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CryptoKaijuError | null>(null)
  const [encodingUsed, setEncodingUsed] = useState<'ascii' | 'direct' | null>(null)
  const [attemptsCount, setAttemptsCount] = useState(0)

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
        
        const duration = Date.now() - startTime
        console.log(`✅ NFC Kaiju fetched in ${duration}ms: ${res.nft?.ipfsData?.name || 'Unnamed'}`)
        
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
        
        // Note: The service handles encoding detection internally
        // We could expose this information if needed
        
      } catch (err) {
        const duration = Date.now() - startTime
        console.error(`❌ NFC Kaiju fetch failed after ${duration}ms:`, err)
        
        const enhancedError = ErrorHandler.normalize(err, {
          nfcId: id,
          action: 'fetchKaijuByNFC',
          duration
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
      setEncodingUsed(null)
      setAttemptsCount(0)
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
/*  ENHANCED TEST HOOK WITH COMPREHENSIVE ERROR SCENARIOS                 */
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
      log('🚀 Starting comprehensive blockchain service test')

      // Test 1: Service initialization
      log('📋 Test 1: Service validation')
      await BlockchainCryptoKaijuService.testService()
      log('✅ Service validation passed')

      // Test 2: Error handling validation
      log('📋 Test 2: Error handling validation')
      try {
        throw ErrorFactory.validationError('test', 'invalid')
      } catch (error) {
        const normalized = ErrorHandler.normalize(error)
        log(`✅ Error handling: ${normalized.userMessage}`)
      }

      // Test 3: Token lookup with error scenarios
      log('📋 Test 3: Token lookup tests')
      try {
        const result = await BlockchainCryptoKaijuService.getByTokenId('1')
        if (result.nft) {
          log(`✅ Token 1: ${result.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        logError(error)
      }

      // Test 4: Invalid token lookup
      log('📋 Test 4: Invalid token test')
      try {
        await BlockchainCryptoKaijuService.getByTokenId('999999999')
      } catch (error) {
        log(`✅ Invalid token error handled: ${ErrorHandler.getUserMessage(error)}`)
      }

      // Test 5: NFC lookup test
      log('📋 Test 5: NFC lookup test')
      try {
        const nfcResult = await BlockchainCryptoKaijuService.getByNFCId('042C0A8A9F6580')
        if (nfcResult.nft) {
          log(`✅ NFC lookup: ${nfcResult.nft.ipfsData?.name || 'Unnamed'}`)
        }
      } catch (error) {
        log(`ℹ️ NFC lookup result: ${ErrorHandler.getUserMessage(error)}`)
      }

      // Test 6: Service statistics
      log('📋 Test 6: Service statistics')
      const stats = BlockchainCryptoKaijuService.getServiceStats()
      log(`📊 Performance: ${stats.performance.totalRequests} requests, ${stats.performance.cacheHits} cache hits`)
      log(`📦 Cache: ${stats.cache.size} entries`)

      log('🎉 Comprehensive test completed successfully!')

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