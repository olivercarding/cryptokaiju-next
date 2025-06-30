// src/lib/hooks/useCryptoKaiju.ts
import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import CryptoKaijuApiService, { KaijuNFT, OpenSeaAsset } from '../services/CryptoKaijuApiService'

/**
 * Hook for managing user's owned Kaiju
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
      console.log('Fetching Kaiju for address:', account.address)
      const userKaijus = await CryptoKaijuApiService.getTokensForAddress(1, account.address)
      
      // Enrich with IPFS metadata if missing
      const enrichedKaijus = await Promise.all(
        userKaijus.map(async (kaiju) => {
          if (!kaiju.ipfsData && kaiju.tokenURI) {
            const metadata = await CryptoKaijuApiService.fetchIpfsMetadata(kaiju.tokenURI)
            return { ...kaiju, ipfsData: metadata }
          }
          return kaiju
        })
      )

      setKaijus(enrichedKaijus)
    } catch (err) {
      console.error('Error fetching user Kaiju:', err)
      setError('Failed to load your Kaiju collection')
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
 * Hook for searching Kaiju
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
      const searchResults = await CryptoKaijuApiService.searchTokens(query)
      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
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
 * Hook for getting specific Kaiju details
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
      let kaijuData: KaijuNFT | null = null

      if (tokenId) {
        kaijuData = await CryptoKaijuApiService.getTokenDetails(1, tokenId)
      } else if (nfcId) {
        kaijuData = await CryptoKaijuApiService.getNfcDetails(1, nfcId)
      }

      if (kaijuData) {
        // Fetch IPFS metadata if missing
        if (!kaijuData.ipfsData && kaijuData.tokenURI) {
          const metadata = await CryptoKaijuApiService.fetchIpfsMetadata(kaijuData.tokenURI)
          kaijuData.ipfsData = metadata
        }

        setKaiju(kaijuData)

        // Fetch OpenSea data in parallel
        if (kaijuData.tokenId) {
          const osData = await CryptoKaijuApiService.getOpenSeaDetails(kaijuData.tokenId)
          setOpenSeaData(osData)
        }
      } else {
        setError('Kaiju not found')
      }
    } catch (err) {
      console.error('Error fetching Kaiju details:', err)
      setError('Failed to load Kaiju details')
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
 * Hook for collection statistics
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
        const collectionStats = await CryptoKaijuApiService.getCollectionStats()
        setStats(prev => ({
          ...prev,
          ...collectionStats
        }))
      } catch (error) {
        console.error('Error fetching collection stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading }
}

/**
 * Hook for all Kaiju (paginated)
 */
export function useAllKaiju() {
  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllKaiju = async () => {
      try {
        const allKaijus = await CryptoKaijuApiService.getAllTokens()
        
        // Enrich with metadata for the first 50 (to avoid too many requests)
        const enrichedKaijus = await Promise.all(
          allKaijus.slice(0, 50).map(async (kaiju) => {
            if (!kaiju.ipfsData && kaiju.tokenURI) {
              const metadata = await CryptoKaijuApiService.fetchIpfsMetadata(kaiju.tokenURI)
              return { ...kaiju, ipfsData: metadata }
            }
            return kaiju
          })
        )

        setKaijus(enrichedKaijus)
      } catch (err) {
        console.error('Error fetching all Kaiju:', err)
        setError('Failed to load Kaiju database')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllKaiju()
  }, [])

  return { kaijus, isLoading, error }
}