// src/lib/hooks/useBlockchainCryptoKaiju.ts - COMPLETE HOOKS WITH ENHANCED DEBUGGING
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
    console.log('🚀 useBlockchainMyKaiju: Starting fetch for address:', address)
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📡 Calling BlockchainCryptoKaijuService.getTokensForAddress...')
      const startTime = Date.now()
      const fetchedKaijus = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      const endTime = Date.now()
      
      console.log('✅ useBlockchainMyKaiju: Fetch complete!')
      console.log(`   📊 Time taken: ${endTime - startTime}ms`)
      console.log(`   🎯 NFTs found: ${fetchedKaijus.length}`)
      console.log(`   📋 NFT details:`, fetchedKaijus)
      
      setKaijus(fetchedKaijus)
      
      // Log individual NFTs for debugging
      fetchedKaijus.forEach((kaiju, index) => {
        console.log(`   ${index + 1}. Token ${kaiju.tokenId}: ${kaiju.ipfsData?.name || 'Unnamed'} (NFC: ${kaiju.nfcId || 'None'})`)
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ useBlockchainMyKaiju: Error fetching kaijus:', err)
      setError(errorMessage)
      setKaijus([]) // Clear any previous results
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🔄 useBlockchainMyKaiju: Effect triggered')
    console.log('   👤 Account:', account?.address)
    console.log('   🔌 Account connected:', !!account)
    
    if (account?.address) {
      console.log('✅ Account found, fetching kaijus...')
      fetchKaijus(account.address)
    } else {
      console.log('⏸️ No account connected, clearing state...')
      setKaijus([])
      setError(null)
      setIsLoading(false)
    }
  }, [account?.address, fetchKaijus])

  // Debug logging whenever state changes
  useEffect(() => {
    console.log('🐛 useBlockchainMyKaiju State Update:')
    console.log('   isLoading:', isLoading)
    console.log('   error:', error)
    console.log('   kaijus.length:', kaijus.length)
    console.log('   isConnected:', !!account?.address)
  }, [isLoading, error, kaijus.length, account?.address])

  return {
    kaijus,
    isLoading,
    error,
    isConnected: !!account?.address,
    refresh: () => {
      if (account?.address) {
        console.log('🔄 Manual refresh triggered')
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
    console.log('🔍 useBlockchainKaijuSearch: Starting search for:', searchQuery)
    setIsLoading(true)
    setError(null)
    setQuery(searchQuery)
    
    try {
      console.log('📡 Calling BlockchainCryptoKaijuService.searchTokens...')
      const startTime = Date.now()
      const searchResults = await BlockchainCryptoKaijuService.searchTokens(searchQuery)
      const endTime = Date.now()
      
      console.log('✅ useBlockchainKaijuSearch: Search complete!')
      console.log(`   📊 Time taken: ${endTime - startTime}ms`)
      console.log(`   🎯 Results found: ${searchResults.length}`)
      console.log(`   📋 Results:`, searchResults)
      
      setResults(searchResults)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ useBlockchainKaijuSearch: Error searching:', err)
      setError(errorMessage)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    console.log('🧹 useBlockchainKaijuSearch: Clearing search results')
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

// Hook for getting individual Kaiju by token ID
export function useBlockchainKaiju(tokenId: string | null) {
  const [kaiju, setKaiju] = useState<KaijuNFT | null>(null)
  const [openSeaData, setOpenSeaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaiju = useCallback(async (id: string) => {
    console.log('🚀 useBlockchainKaiju: Starting fetch for token ID:', id)
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📡 Calling BlockchainCryptoKaijuService.getByTokenId...')
      const startTime = Date.now()
      const result = await BlockchainCryptoKaijuService.getByTokenId(id)
      const endTime = Date.now()
      
      console.log('✅ useBlockchainKaiju: Fetch complete!')
      console.log(`   📊 Time taken: ${endTime - startTime}ms`)
      console.log(`   🎯 NFT found:`, !!result.nft)
      console.log(`   📋 NFT details:`, result.nft)
      
      setKaiju(result.nft)
      setOpenSeaData(result.openSeaData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ useBlockchainKaiju: Error fetching kaiju:', err)
      setError(errorMessage)
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🔄 useBlockchainKaiju: Effect triggered for token ID:', tokenId)
    
    if (tokenId) {
      console.log('✅ Token ID provided, fetching kaiju...')
      fetchKaiju(tokenId)
    } else {
      console.log('⏸️ No token ID provided, clearing state...')
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
        console.log('🔄 Manual refresh triggered for token ID:', tokenId)
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
    console.log('🚀 useBlockchainKaijuByNFC: Starting fetch for NFC ID:', id)
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📡 Calling BlockchainCryptoKaijuService.getByNFCId...')
      const startTime = Date.now()
      const result = await BlockchainCryptoKaijuService.getByNFCId(id)
      const endTime = Date.now()
      
      console.log('✅ useBlockchainKaijuByNFC: Fetch complete!')
      console.log(`   📊 Time taken: ${endTime - startTime}ms`)
      console.log(`   🎯 NFT found:`, !!result.nft)
      console.log(`   📋 NFT details:`, result.nft)
      
      setKaiju(result.nft)
      setOpenSeaData(result.openSeaData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ useBlockchainKaijuByNFC: Error fetching kaiju:', err)
      setError(errorMessage)
      setKaiju(null)
      setOpenSeaData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🔄 useBlockchainKaijuByNFC: Effect triggered for NFC ID:', nfcId)
    
    if (nfcId) {
      console.log('✅ NFC ID provided, fetching kaiju...')
      fetchKaiju(nfcId)
    } else {
      console.log('⏸️ No NFC ID provided, clearing state...')
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
        console.log('🔄 Manual refresh triggered for NFC ID:', nfcId)
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
    console.log('🚀 useBlockchainCollectionStats: Starting fetch...')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📡 Calling BlockchainCryptoKaijuService.getCollectionStats...')
      const startTime = Date.now()
      const collectionStats = await BlockchainCryptoKaijuService.getCollectionStats()
      const endTime = Date.now()
      
      console.log('✅ useBlockchainCollectionStats: Fetch complete!')
      console.log(`   📊 Time taken: ${endTime - startTime}ms`)
      console.log(`   📋 Stats:`, collectionStats)
      
      setStats(collectionStats)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ useBlockchainCollectionStats: Error fetching stats:', err)
      setError(errorMessage)
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🔄 useBlockchainCollectionStats: Effect triggered, fetching stats...')
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refresh: () => {
      console.log('🔄 Manual refresh triggered for collection stats')
      fetchStats()
    }
  }
}