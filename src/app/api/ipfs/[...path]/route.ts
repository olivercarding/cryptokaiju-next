// src/app/api/ipfs/[...path]/route.ts - IMPROVED VERSION WITH BETTER ERROR HANDLING
import { NextRequest, NextResponse } from 'next/server'

const IPFS_GATEWAYS = [
  { url: 'https://cryptokaiju.mypinata.cloud/ipfs', timeout: 8000, priority: 1 },
  { url: 'https://gateway.pinata.cloud/ipfs', timeout: 10000, priority: 2 },
  { url: 'https://cf-ipfs.com/ipfs', timeout: 12000, priority: 3 },
  { url: 'https://ipfs.io/ipfs', timeout: 15000, priority: 4 },
  { url: 'https://dweb.link/ipfs', timeout: 12000, priority: 5 }
]

// Cache for successful responses
const cache = new Map<string, { data: any; timestamp: number; contentType: string }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const ipfsPath = params.path.join('/')
  const cacheKey = `ipfs:${ipfsPath}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 Cache hit for IPFS: ${ipfsPath}`)
    return new NextResponse(JSON.stringify(cached.data), {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }

  console.log(`🔄 Fetching IPFS content: ${ipfsPath}`)

  // Try each gateway in priority order
  for (const gateway of IPFS_GATEWAYS) {
    try {
      console.log(`🌐 Trying gateway: ${gateway.url}/${ipfsPath}`)
      
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log(`⏰ Gateway ${gateway.url} timed out after ${gateway.timeout}ms`)
      }, gateway.timeout)
      
      const response = await fetch(`${gateway.url}/${ipfsPath}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, image/*, */*',
          'User-Agent': 'CryptoKaiju/1.0',
        },
        next: { revalidate: 86400 } // 24 hour revalidation
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log(`✅ Success via ${gateway.url} (${response.status})`)
        
        const contentType = response.headers.get('content-type') || 'application/json'
        
        // Handle different content types
        let data: any
        let responseHeaders: Record<string, string> = {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'Content-Type': contentType
        }
        
        if (contentType.includes('application/json')) {
          data = await response.json()
          
          // Cache successful JSON responses
          cache.set(cacheKey, { data, timestamp: Date.now(), contentType })
          
          return NextResponse.json(data, { headers: responseHeaders })
          
        } else if (contentType.includes('image/')) {
          // For images, return the blob directly
          const blob = await response.blob()
          const buffer = await blob.arrayBuffer()
          
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              ...responseHeaders,
              'Content-Type': contentType,
              'Content-Length': buffer.byteLength.toString()
            }
          })
          
        } else {
          // For other content types, try to parse as text first
          const text = await response.text()
          
          try {
            // Try to parse as JSON if possible
            data = JSON.parse(text)
            cache.set(cacheKey, { data, timestamp: Date.now(), contentType: 'application/json' })
            return NextResponse.json(data, { headers: responseHeaders })
          } catch {
            // Return as plain text
            return new NextResponse(text, {
              status: 200,
              headers: {
                ...responseHeaders,
                'Content-Type': 'text/plain'
              }
            })
          }
        }
        
      } else {
        console.warn(`⚠️ Gateway ${gateway.url} returned ${response.status}: ${response.statusText}`)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`⚠️ Gateway ${gateway.url} failed: ${errorMessage}`)
      
      // If it's an abort error, we know it timed out
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`⏰ ${gateway.url} request was aborted (timeout)`)
      }
      
      // Continue to next gateway
      continue
    }
  }
  
  console.error(`❌ All IPFS gateways failed for path: ${ipfsPath}`)
  
  // Return a structured fallback response for NFT metadata
  const fallbackData = {
    error: 'IPFS_FETCH_FAILED',
    message: 'All IPFS gateways are currently unavailable',
    ipfsPath,
    fallback: {
      name: `CryptoKaiju #${ipfsPath.slice(-4)}`,
      description: "Metadata temporarily unavailable due to IPFS gateway issues. This is a fallback response.",
      image: "/images/placeholder-kaiju.png",
      attributes: [],
      _fallback: true,
      _timestamp: new Date().toISOString()
    },
    gateways_tried: IPFS_GATEWAYS.map(g => g.url),
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(fallbackData, { 
    status: 404,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300', // Shorter cache for failures
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  })
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean up every hour