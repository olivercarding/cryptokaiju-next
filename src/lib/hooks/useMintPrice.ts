// src/lib/hooks/useMintPrice.ts
import { useState, useEffect } from 'react'
import { getContract, readContract } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, MERKLE_MINTER_ADDRESS, MERKLE_MINTER_ABI } from '@/lib/thirdweb'

export function useMintPrice() {
  const [priceInETH, setPriceInETH] = useState<string>('0.055')
  const [priceInWei, setPriceInWei] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const contract = getContract({
          client: thirdwebClient,
          chain: ethereum,
          address: MERKLE_MINTER_ADDRESS,
          abi: MERKLE_MINTER_ABI,
        })

        // Fetch price from contract (returns price in wei)
        const priceWei = await readContract({
          contract,
          method: "pricePerNFTInETH",
          params: []
        })

        setPriceInWei(priceWei)
        
        // Convert wei to ETH for display (1 ETH = 1e18 wei)
        const priceETH = (Number(priceWei) / 1e18).toString()
        setPriceInETH(priceETH)

      } catch (err) {
        console.error('Error fetching mint price:', err)
        setError('Failed to fetch mint price')
        // Fallback to default price if the call fails
        setPriceInETH('0.055')
        setPriceInWei(BigInt('55000000000000000')) // 0.055 ETH in wei
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrice()

    // Refresh price every 60 seconds (prices change less frequently than supply)
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  return { 
    priceInETH, 
    priceInWei, 
    priceFormatted: `${parseFloat(priceInETH).toFixed(3)} Ξ`,
    isLoading, 
    error 
  }
}