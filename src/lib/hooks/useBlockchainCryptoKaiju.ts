// src/lib/hooks/useBlockchainCryptoKaiju.ts - OPTIMIZED VERSION
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from "thirdweb/react"
import BlockchainCryptoKaijuService, { type KaijuNFT } from '@/lib/services/BlockchainCryptoKaijuService'

// Hook for getting user's Kaiju collection
export function useBlockchainMyKaiju() {
  const account = useActiveAccount()
  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaijus = useCallback(async (address: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const fetchedKaijus = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      setKaijus(fetchedKaijus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setKaijus([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (account?.address) {
      fetchKaijus(account.address)
    } else {
      setKaijus([])
      setError(null)
      setIsLoading(false)
    }
  }, [account?.address, fetchKaijus])

  return {
    kaijus,
    isLoading,
    error,
    isConnected: !!account?.address,
    refresh: () => {
      if (account?.address) {
        fetchKaijus(account.address)
      }
    }
  }
}

// Hook for searching Kaiju
export function useBlockchainKaijuSearch() {
  const [results, setResults] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  const search = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)
    setQuery(searchQuery)
    
    try {
      const searchResults = await BlockchainCryptoKaijuService.searchTokens(searchQuery)
      setResults(searchResults)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
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

// Hook for getting individual Kaiju by token ID
export function useBlockchainKaiju(tokenId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaiju = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await BlockchainCryptoKaijuService.getByTokenId(id)
      setKaiju(result.nft)
      setOpenSeaData(result.openSeaData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tokenId) {
      fetchKaiju(tokenId)
    } else {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
      setIsLoading(false)
    }
  }, [tokenId, fetchKaiju])

  return {
    kaiju,
    openSeaData,
    isLoading,
    error,
    refresh: () => {
      if (tokenId) {
        fetchKaiju(tokenId)
      }
    }
  }
}

// Hook for getting Kaiju by NFC ID
export function useBlockchainKaijuByNFC(nfcId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaiju = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await BlockchainCryptoKaijuService.getByNFCId(id)
      setKaiju(result.nft)
      setOpenSeaData(result.openSeaData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (nfcId) {
      fetchKaiju(nfcId)
    } else {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
      setIsLoading(false)
    }
  }, [nfcId, fetchKaiju])

  return {
    kaiju,
    openSeaData,
    isLoading,
    error,
    refresh: () => {
      if (nfcId) {
        fetchKaiju(nfcId)
      }
    }
  }
}

// Hook for collection statistics
export function useBlockchainCollectionStats() {
  const [stats, setStats] = useState<{ totalSupply: number; owners?: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const collectionStats = await BlockchainCryptoKaijuService.getCollectionStats()
      setStats(collectionStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
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