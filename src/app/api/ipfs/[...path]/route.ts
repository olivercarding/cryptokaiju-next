// src/app/api/ipfs/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const IPFS_GATEWAYS = [
  'https://cryptokaiju.mypinata.cloud/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://dweb.link/ipfs'
]

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const ipfsPath = params.path.join('/')
  
  // Try each gateway in order
  for (const gateway of IPFS_GATEWAYS) {
    try {
      console.log(`🔄 Trying IPFS gateway: ${gateway}/${ipfsPath}`)
      
      const response = await fetch(`${gateway}/${ipfsPath}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
        next: { revalidate: 3600 } // Cache in Next.js
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ IPFS fetch successful via ${gateway}`)
        
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
    } catch (error) {
      console.warn(`⚠️ Gateway ${gateway} failed:`, error.message)
      continue
    }
  }
  
  console.error(`❌ All IPFS gateways failed for path: ${ipfsPath}`)
  return NextResponse.json(
    { error: 'Failed to fetch from IPFS' }, 
    { status: 404 }
  )
}