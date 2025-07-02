// src/lib/hooks/useBlockchainCryptoKaiju.ts
import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import BlockchainCryptoKaijuService, { KaijuNFT, OpenSeaAsset } from '../services/BlockchainCryptoKaijuService'

/**
 * Hook for managing user's owned Kaiju (blockchain-based)
 */
export function useMyKaiju() {
  const account = useActiveAccount()
  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyKaiju = useCallback(async () => {
    if (!account?.address) {
      setKaijus([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔗 Fetching Kaiju from blockchain for address:', account.address)
      const userKaijus = await BlockchainCryptoKaijuService.getTokensForAddress(account.address)
      setKaijus(userKaijus)
      console.log(`✅ Found ${userKaijus.length} Kaiju on blockchain`)
    } catch (err) {
      console.error('Error fetching user Kaiju from blockchain:', err)
      setError('Failed to load your Kaiju collection from blockchain')
    } finally {
      setIsLoading(false)
    }
  }, [account?.address])

  useEffect(() => {
    fetchMyKaiju()
  }, [fetchMyKaiju])

  return {
    kaijus,
    isLoading,
    error,
    refetch: fetchMyKaiju,
    isConnected: !!account?.address
  }
}

/**
 * Hook for searching Kaiju (blockchain-based)
 */
export function useKaijuSearch() {
  const [results, setResults] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState('')

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setLastQuery('')
      return
    }

    if (query === lastQuery) return // Avoid duplicate searches

    setIsLoading(true)
    setError(null)
    setLastQuery(query)

    try {
      console.log('🔍 Searching blockchain for:', query)
      const searchResults = await BlockchainCryptoKaijuService.searchTokens(query)
      setResults(searchResults)
      console.log(`✅ Found ${searchResults.length} results on blockchain`)
    } catch (err) {
      console.error('Blockchain search error:', err)
      setError('Search failed')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [lastQuery])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
    setLastQuery('')
  }, [])

  return {
    results,
    isLoading,
    error,
    search,
    clear,
    hasQuery: !!lastQuery
  }
}

/**
 * Hook for getting specific Kaiju details (blockchain-based)
 */
export function useKaijuDetails(tokenId?: string, nfcId?: string) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<OpenSeaAsset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!tokenId && !nfcId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔗 Fetching Kaiju details from blockchain...')
      let result: { nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }

      if (tokenId) {
        result = await BlockchainCryptoKaijuService.getByTokenId(tokenId)
      } else if (nfcId) {
        result = await BlockchainCryptoKaijuService.getByNFCId(nfcId)
      } else {
        result = { nft: null, openSeaData: null }
      }

      if (result.nft) {
        setKaiju(result.nft)
        setOpenSeaData(result.openSeaData)
        setError(null)
        console.log('✅ Successfully fetched Kaiju from blockchain')
      } else {
        setKaiju(null)
        setOpenSeaData(null)
        setError('Kaiju not found on blockchain')
      }
    } catch (err) {
      console.error('Error fetching Kaiju details from blockchain:', err)
      setError('Failed to load Kaiju details from blockchain')
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
    }
  }, [tokenId, nfcId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return {
    kaiju,
    openSeaData,
    isLoading,
    error,
    refetch: fetchDetails
  }
}

/**
 * Hook for manual NFT search (used by search forms)
 */
export function useNFTSearch() {
  const [result, setResult] = useState<{
    nft: KaijuNFT | null
    openSeaData: OpenSeaAsset | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState('')

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResult(null)
      setError(null)
      setLastQuery('')
      return
    }

    if (query === lastQuery && result) {
      // Don't re-search the same query
      return
    }

    setIsLoading(true)
    setError(null)
    setLastQuery(query)

    try {
      let searchResult: { nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }

      // Determine if query is Token ID (numeric) or NFC ID
      const isTokenId = /^\d+$/.test(query.trim())
      
      if (isTokenId) {
        console.log('🔢 Searching blockchain by Token ID:', query)
        searchResult = await BlockchainCryptoKaijuService.getByTokenId(query.trim())
      } else {
        console.log('🏷️ Searching blockchain by NFC ID:', query)
        searchResult = await BlockchainCryptoKaijuService.getByNFCId(query.trim())
      }

      setResult(searchResult)
      
      if (!searchResult.nft) {
        setError('NFT not found on blockchain')
      } else {
        setError(null)
        console.log('✅ Found NFT on blockchain')
      }
    } catch (err) {
      console.error('Blockchain search error:', err)
      setError('Search failed')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }, [lastQuery, result])

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
    setLastQuery('')
  }, [])

  return {
    result,
    isLoading,
    error,
    search,
    clear,
    hasQuery: !!lastQuery
  }
}

/**
 * Hook for collection statistics (blockchain-based)
 */
export function useKaijuStats() {
  const [stats, setStats] = useState({
    totalSupply: 0,
    owners: 0,
    floorPrice: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('📊 Fetching collection stats from blockchain...')
        const blockchainStats = await BlockchainCryptoKaijuService.getCollectionStats()
        setStats(prev => ({
          ...prev,
          totalSupply: blockchainStats.totalSupply,
          owners: blockchainStats.owners || prev.owners
        }))
        console.log('✅ Collection stats loaded from blockchain')
      } catch (error) {
        console.error('Error fetching collection stats from blockchain:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading }
}

/**
 * Hook for testing the blockchain service
 */
export function useBlockchainTest() {
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const runTest = useCallback(async () => {
    setIsTestRunning(true)
    setTestResults([])

    // Capture console.log output
    const originalLog = console.log
    const logs: string[] = []
    
    console.log = (...args) => {
      const message = args.join(' ')
      logs.push(message)
      originalLog(...args)
    }

    try {
      await BlockchainCryptoKaijuService.testService()
      setTestResults([...logs, '✅ Blockchain test completed successfully'])
    } catch (error) {
      setTestResults([...logs, `❌ Blockchain test failed: ${error}`])
    } finally {
      console.log = originalLog
      setIsTestRunning(false)
    }
  }, [])

  return {
    runTest,
    isTestRunning,
    testResults
  }
}

// Export the main hooks with clear names
export {
  useKaijuDetails as useBlockchainKaijuDetails,
  useNFTSearch as useBlockchainNFTSearch,
  useMyKaiju as useBlockchainMyKaiju,
  useKaijuSearch as useBlockchainKaijuSearch,
  useKaijuStats as useBlockchainKaijuStats
}