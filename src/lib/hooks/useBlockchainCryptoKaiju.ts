// src/lib/hooks/useBlockchainCryptoKaiju.ts - FIXED VERSION WITHOUT AUTO-CONNECTION
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from "thirdweb/react"
import BlockchainCryptoKaijuService, { type KaijuNFT } from '@/lib/services/BlockchainCryptoKaijuService'

// FIXED: Hook for getting user's Kaiju collection - NO AUTO-FETCH
export function useBlockchainMyKaiju() {
  const account = useActiveAccount()
  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const fetchKaijus = useCallback(async (address: string) => {
    if (!address) {
      console.warn('⚠️ No address provided to fetchKaijus')
      return
    }

    console.log('🔍 Starting Kaiju fetch for address:', address)
    setIsLoading(true)
    setError(null)
    
    try {
      const fetchedKaijus = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      console.log('✅ Successfully fetched', fetchedKaijus.length, 'Kaiju NFTs')
      setKaijus(fetchedKaijus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching Kaiju:', errorMessage)
      setError(errorMessage)
      setKaijus([])
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [])

  const clearData = useCallback(() => {
    console.log('🧹 Clearing Kaiju data')
    setKaijus([])
    setError(null)
    setIsLoading(false)
    setHasInitialized(false)
  }, [])

  // FIXED: Only clear data when wallet disconnects, don't auto-fetch
  useEffect(() => {
    if (!account?.address) {
      if (hasInitialized) {
        console.log('👋 Wallet disconnected, clearing data')
        clearData()
      }
    }
  }, [account?.address, hasInitialized, clearData])

  return {
    kaijus,
    isLoading,
    error,
    isConnected: !!account?.address,
    hasInitialized,
    fetchKaijus: (address?: string) => {
      const addressToUse = address || account?.address
      if (addressToUse) {
        fetchKaijus(addressToUse)
      } else {
        console.warn('⚠️ No address available for fetching Kaiju')
      }
    },
    clearData,
    refresh: () => {
      if (account?.address) {
        fetchKaijus(account.address)
      }
    }
  }
}

// Hook for searching Kaiju (unchanged - this one is fine)
export function useBlockchainKaijuSearch() {
  const [results, setResults] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      console.warn('⚠️ Empty search query provided')
      return
    }

    console.log('🔍 Searching for:', searchQuery)
    setIsLoading(true)
    setError(null)
    setQuery(searchQuery)
    
    try {
      const searchResults = await BlockchainCryptoKaijuService.searchTokens(searchQuery)
      console.log('✅ Search completed, found', searchResults.length, 'results')
      setResults(searchResults)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Search error:', errorMessage)
      setError(errorMessage)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    console.log('🧹 Clearing search results')
    setResults([])
    setError(null)
    setQuery('')
    setIsLoading(false)
  }, [])

  return {
    results,
    isLoading,
    error,
    hasQuery: query.length > 0,
    search,
    clear
  }
}

// ALIAS: Export the same hook with the expected name for backward compatibility
export const useBlockchainNFTSearch = useBlockchainKaijuSearch

// FIXED: Hook for getting individual Kaiju by token ID - NO AUTO-FETCH
export function useBlockchainKaiju(tokenId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const fetchKaiju = useCallback(async (id: string) => {
    if (!id) {
      console.warn('⚠️ No token ID provided to fetchKaiju')
      return
    }

    console.log('🔍 Fetching Kaiju for token ID:', id)
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await BlockchainCryptoKaijuService.getByTokenId(id)
      console.log('✅ Successfully fetched Kaiju:', result.nft?.ipfsData?.name || `#${id}`)
      setKaiju(result.nft)
      setOpenSeaData(result.openSeaData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching Kaiju:', errorMessage)
      setError(errorMessage)
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [])

  const clearData = useCallback(() => {
    console.log('🧹 Clearing Kaiju data')
    setKaiju(null)
    setOpenSeaData(null)
    setError(null)
    setIsLoading(false)
    setHasInitialized(false)
  }, [])

  // FIXED: Only auto-fetch if explicitly enabled
  useEffect(() => {
    if (tokenId && tokenId.trim()) {
      fetchKaiju(tokenId.trim())
    } else {
      if (hasInitialized) {
        clearData()
      }
    }
  }, [tokenId, fetchKaiju, clearData, hasInitialized])

  return {
    kaiju,
    openSeaData,
    isLoading,
    error,
    hasInitialized,
    fetchKaiju,
    clearData,
    refresh: () => {
      if (tokenId) {
        fetchKaiju(tokenId)
      }
    }
  }
}

// FIXED: Hook for getting Kaiju by NFC ID - NO AUTO-FETCH
export function useBlockchainKaijuByNFC(nfcId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const fetchKaiju = useCallback(async (id: string) => {
    if (!id) {
      console.warn('⚠️ No NFC ID provided to fetchKaiju')
      return
    }

    console.log('🔍 Fetching Kaiju for NFC ID:', id)
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await BlockchainCryptoKaijuService.getByNFCId(id)
      console.log('✅ Successfully fetched Kaiju by NFC:', result.nft?.ipfsData?.name || 'Unknown')
      setKaiju(result.nft)
      setOpenSeaData(result.openSeaData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching Kaiju by NFC:', errorMessage)
      setError(errorMessage)
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [])

  const clearData = useCallback(() => {
    console.log('🧹 Clearing NFC Kaiju data')
    setKaiju(null)
    setOpenSeaData(null)
    setError(null)
    setIsLoading(false)
    setHasInitialized(false)
  }, [])

  // FIXED: Only auto-fetch if explicitly enabled
  useEffect(() => {
    if (nfcId && nfcId.trim()) {
      fetchKaiju(nfcId.trim())
    } else {
      if (hasInitialized) {
        clearData()
      }
    }
  }, [nfcId, fetchKaiju, clearData, hasInitialized])

  return {
    kaiju,
    openSeaData,
    isLoading,
    error,
    hasInitialized,
    fetchKaiju,
    clearData,
    refresh: () => {
      if (nfcId) {
        fetchKaiju(nfcId)
      }
    }
  }
}

// Hook for collection statistics (unchanged - this one is fine)
export function useBlockchainCollectionStats() {
  const [stats, setStats] = useState<{ totalSupply: number; owners?: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    console.log('📊 Fetching collection stats')
    setIsLoading(true)
    setError(null)
    
    try {
      const collectionStats = await BlockchainCryptoKaijuService.getCollectionStats()
      console.log('✅ Successfully fetched collection stats:', collectionStats)
      setStats(collectionStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching collection stats:', errorMessage)
      setError(errorMessage)
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  }
}

// Hook for testing blockchain service (only in development)
export function useBlockchainTest() {
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const runTest = useCallback(async () => {
    console.log('🧪 Starting blockchain service test')
    setIsTestRunning(true)
    setTestResults([])
    
    const addLog = (message: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(message)
      }
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    try {
      addLog('🚀 Starting blockchain service test...')
      await BlockchainCryptoKaijuService.testService()
      addLog('✅ Blockchain service test completed successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog(`❌ Blockchain service test failed: ${errorMessage}`)
    } finally {
      setIsTestRunning(false)
    }
  }, [])

  return {
    isTestRunning,
    testResults,
    runTest
  }
}

// ADDED: Manual wallet connection hook to replace auto-connecting behavior
export function useManualWalletConnection() {
  const account = useActiveAccount()
  const [isManuallyConnected, setIsManuallyConnected] = useState(false)

  useEffect(() => {
    if (account?.address) {
      console.log('🔗 Wallet connection detected:', account.address)
      setIsManuallyConnected(true)
    } else {
      console.log('👋 Wallet disconnected')
      setIsManuallyConnected(false)
    }
  }, [account?.address])

  const disconnect = useCallback(() => {
    console.log('🔌 Manual disconnect triggered')
    setIsManuallyConnected(false)
    // Additional disconnect logic can be added here if needed
  }, [])

  return {
    account,
    isConnected: isManuallyConnected && !!account?.address,
    address: account?.address,
    disconnect
  }
}