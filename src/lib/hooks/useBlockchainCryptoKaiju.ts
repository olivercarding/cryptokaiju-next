// src/lib/hooks/useBlockchainCryptoKaiju.ts - FIXED WITH OPENSEA DATA IN SEARCH RESULTS
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import BlockchainCryptoKaijuService, {
  type KaijuNFT,
  type SearchResult,
} from '@/lib/services/BlockchainCryptoKaijuService'

/* ======================================================================= */
/*  MY-KAIJU HOOK — AUTOMATICALLY REFETCHES WHEN THE CONNECTED ADDRESS      */
/*  CHANGES.  NOTHING ELSE IN THIS FILE HAS BEEN TOUCHED.                  */
/* ======================================================================= */

export function useBlockchainMyKaiju() {
  const account = useActiveAccount()

  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* fetches the collection for the current address */
  const fetchKaijus = useCallback(async () => {
    const address = account?.address
    if (!address) {
      setKaijus([])
      return
    }

    console.log('🔍 fetching Kaiju for', address)
    setIsLoading(true)
    setError(null)

    try {
      const data = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      console.log('✅ fetched', data.length, 'Kaiju')
      setKaijus(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ fetchKaijus:', message)
      setError(message)
      setKaijus([])
    } finally {
      setIsLoading(false)
    }
  }, [account?.address])

  /* refetch every time the wallet address changes */
  useEffect(() => {
    fetchKaijus()
  }, [fetchKaijus])

  /* clear on explicit call if needed */
  const clearData = useCallback(() => {
    setKaijus([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    kaijus,
    isLoading,
    error,
    isConnected: !!account?.address,
    refetch: fetchKaijus,
    clearData,
  }
}

/* ======================================================================= */
/*  SEARCH HOOK — FIXED TO INCLUDE OPENSEA DATA                           */
/* ======================================================================= */
export function useBlockchainKaijuSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setQuery(searchQuery)

    try {
      const data = await BlockchainCryptoKaijuService.searchTokens(searchQuery)
      setResults(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
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

  return { results, isLoading, error, hasQuery: query.length > 0, search, clear }
}

export const useBlockchainNFTSearch = useBlockchainKaijuSearch

/* ======================================================================= */
/*  SINGLE KAIJU BY TOKEN ID — UNCHANGED                                   */
/* ======================================================================= */
export function useBlockchainKaiju(tokenId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaiju = useCallback(
    async (id: string) => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const res = await BlockchainCryptoKaijuService.getByTokenId(id)
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setKaiju(null)
        setOpenSeaData(null)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (tokenId) fetchKaiju(tokenId)
    else {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
    }
  }, [tokenId, fetchKaiju])

  return { kaiju, openSeaData, isLoading, error, refresh: () => tokenId && fetchKaiju(tokenId) }
}

/* ======================================================================= */
/*  SINGLE KAIJU BY NFC ID — UNCHANGED                                     */
/* ======================================================================= */
export function useBlockchainKaijuByNFC(nfcId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaiju = useCallback(
    async (id: string) => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const res = await BlockchainCryptoKaijuService.getByNFCId(id)
        setKaiju(res.nft)
        setOpenSeaData(res.openSeaData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setKaiju(null)
        setOpenSeaData(null)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (nfcId) fetchKaiju(nfcId)
    else {
      setKaiju(null)
      setOpenSeaData(null)
      setError(null)
    }
  }, [nfcId, fetchKaiju])

  return { kaiju, openSeaData, isLoading, error, refresh: () => nfcId && fetchKaiju(nfcId) }
}

/* ======================================================================= */
/*  COLLECTION STATS HOOK — UNCHANGED                                      */
/* ======================================================================= */
export function useBlockchainCollectionStats() {
  const [stats, setStats] = useState<{ totalSupply: number; owners?: number } | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await BlockchainCryptoKaijuService.getCollectionStats()
      setStats(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refresh: fetchStats }
}

/* ======================================================================= */
/*  TEST HOOK — UNCHANGED                                                 */
/* ======================================================================= */
export function useBlockchainTest() {
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const runTest = useCallback(async () => {
    setIsTestRunning(true)
    setTestResults([])

    const log = (msg: string) =>
      setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])

    try {
      log('🚀 starting blockchain service test')
      await BlockchainCryptoKaijuService.testService()
      log('✅ blockchain service test completed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      log(`❌ blockchain service test failed: ${message}`)
    } finally {
      setIsTestRunning(false)
    }
  }, [])

  return { isTestRunning, testResults, runTest }
}

/* ======================================================================= */
/*  MANUAL WALLET CONNECTION FLAG — UNCHANGED                             */
/* ======================================================================= */
export function useManualWalletConnection() {
  const account = useActiveAccount()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    setConnected(!!account?.address)
  }, [account?.address])

  return { account, isConnected: connected, address: account?.address }
}