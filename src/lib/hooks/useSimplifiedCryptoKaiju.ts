// src/lib/hooks/useSimplifiedCryptoKaiju.ts
import { useState, useEffect, useCallback } from 'react'
import SimplifiedCryptoKaijuApi, { KaijuNFT, OpenSeaAsset } from '../services/SimplifiedCryptoKaijuApi'

/**
 * Hook for looking up individual NFTs by Token ID or NFC ID
 * This replaces the complex useKaijuDetails hook with a simpler version
 */
export function useKaijuLookup(tokenId?: string, nfcId?: string) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<OpenSeaAsset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = useCallback(async () => {
    // Only lookup if we have either tokenId or nfcId
    if (!tokenId && !nfcId) {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let result: { nft: KaijuNFT | null; openSeaData: OpenSeaAsset | null }

      if (tokenId) {
        console.log('🔍 Looking up by Token ID:', tokenId)
        result = await SimplifiedCryptoKaijuApi.getByTokenId(tokenId)
      } else if (nfcId) {
        console.log('🏷️ Looking up by NFC ID:', nfcId)
        result = await SimplifiedCryptoKaijuApi.getByNFCId(nfcId)
      } else {
        result = { nft: null, openSeaData: null }
      }

      if (result.nft) {
        setKaiju(result.nft)
        setOpenSeaData(result.openSeaData)
        setError(null)
      } else {
        setKaiju(null)
        setOpenSeaData(null)
        setError('NFT not found')
      }
    } catch (err) {
      console.error('Error looking up NFT:', err)
      setKaiju(null)
      setOpenSeaData(null)
      setError('Failed to lookup NFT')
    } finally {
      setIsLoading(false)
    }
  }, [tokenId, nfcId])

  useEffect(() => {
    lookup()
  }, [lookup])

  return {
    kaiju,
    openSeaData,
    isLoading,
    error,
    refetch: lookup
  }
}

/**
 * Hook for manually searching NFTs
 * Used by the search form in the NFT lookup page
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
        console.log('🔢 Searching by Token ID:', query)
        searchResult = await SimplifiedCryptoKaijuApi.getByTokenId(query.trim())
      } else {
        console.log('🏷️ Searching by NFC ID:', query)
        searchResult = await SimplifiedCryptoKaijuApi.getByNFCId(query.trim())
      }

      setResult(searchResult)
      
      if (!searchResult.nft) {
        setError('NFT not found')
      } else {
        setError(null)
      }
    } catch (err) {
      console.error('Search error:', err)
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
 * Hook for testing the API
 * Useful for development and debugging
 */
export function useAPITest() {
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
      await SimplifiedCryptoKaijuApi.testAPI()
      setTestResults([...logs, '✅ Test completed successfully'])
    } catch (error) {
      setTestResults([...logs, `❌ Test failed: ${error}`])
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

// Re-export the original hook name for backward compatibility
// This allows existing components to keep working
export const useKaijuDetails = useKaijuLookup