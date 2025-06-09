// src/lib/hooks/useTotalSupply.ts
import { useState, useEffect } from 'react'
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, KAIJU_NFT_ADDRESS, ERC721_ABI } from '@/lib/thirdweb'

export function useTotalSupply() {
  const [totalSupply, setTotalSupply] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTotalSupply = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const contract = getContract({
          client: thirdwebClient,
          chain: ethereum,
          address: KAIJU_NFT_ADDRESS,
          abi: ERC721_ABI,
        })

        const supply = await readContract({
          contract,
          method: "totalSupply",
          params: []
        })

        // Convert BigInt to number
        setTotalSupply(Number(supply))
      } catch (err) {
        console.error('Error fetching total supply:', err)
        setError('Failed to fetch minted count')
        // Fallback to a reasonable estimate if the call fails
        setTotalSupply(2847)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTotalSupply()

    // Refresh every 30 seconds
    const interval = setInterval(fetchTotalSupply, 30000)
    return () => clearInterval(interval)
  }, [])

  return { totalSupply, isLoading, error }
}