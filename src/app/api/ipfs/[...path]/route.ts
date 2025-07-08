// src/app/api/ipfs/[...path]/route.ts - IMPROVED VERSION
import { NextRequest, NextResponse } from 'next/server'

const IPFS_GATEWAYS = [
  { url: 'https://cryptokaiju.mypinata.cloud/ipfs', timeout: 5000 },
  { url: 'https://gateway.pinata.cloud/ipfs', timeout: 8000 },
  { url: 'https://ipfs.io/ipfs', timeout: 10000 },
  { url: 'https://dweb.link/ipfs', timeout: 10000 },
  { url: 'https://cf-ipfs.com/ipfs', timeout: 8000 }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const ipfsPath = params.path.join('/')
  
  // Try each gateway in order with timeout control
  for (const gateway of IPFS_GATEWAYS) {
    try {
      console.log(`🔄 Trying IPFS gateway: ${gateway.url}/${ipfsPath}`)
      
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), gateway.timeout)
      
      const response = await fetch(`${gateway.url}/${ipfsPath}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
        next: { revalidate: 3600 }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ IPFS fetch successful via ${gateway.url}`)
        
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          }
        })
      } else {
        console.warn(`⚠️ Gateway ${gateway.url} returned ${response.status}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`⚠️ Gateway ${gateway.url} failed: ${errorMessage}`)
      
      // Continue to next gateway
      continue
    }
  }
  
  console.error(`❌ All IPFS gateways failed for path: ${ipfsPath}`)
  
  // Return a more helpful fallback response
  return NextResponse.json({
    error: 'Failed to fetch from IPFS',
    message: 'All IPFS gateways are currently unavailable',
    fallback: {
      name: `CryptoKaiju #${ipfsPath.slice(-4)}`,
      description: "Metadata temporarily unavailable",
      image: "/images/placeholder-kaiju.png",
      attributes: []
    }
  }, { status: 404 })
}