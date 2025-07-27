// src/app/api/ipfs/[...path]/route.ts - FIXED VERSION WITH CORRECTED SCOPING
import { NextRequest, NextResponse } from 'next/server'

const IPFS_GATEWAYS = [
  { url: 'https://cryptokaiju.mypinata.cloud/ipfs', timeout: 8000, priority: 1 },
  { url: 'https://gateway.pinata.cloud/ipfs', timeout: 10000, priority: 2 },
  { url: 'https://ipfs.io/ipfs', timeout: 15000, priority: 3 },
  { url: 'https://dweb.link/ipfs', timeout: 12000, priority: 4 },
  { url: 'https://cf-ipfs.com/ipfs', timeout: 12000, priority: 5 },
  // Add more reliable gateways
  { url: 'https://cloudflare-ipfs.com/ipfs', timeout: 10000, priority: 6 },
  { url: 'https://4everland.io/ipfs', timeout: 12000, priority: 7 }
]

// Cache for successful responses with BigInt-safe serialization
const cache = new Map<string, { data: any; timestamp: number; contentType: string }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// BigInt-safe JSON serialization
function safeParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch (error) {
    // If JSON parsing fails, return the text as-is
    return text
  }
}

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    // Handle BigInt serialization
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  })
}

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
    
    if (cached.contentType.includes('image/')) {
      // For images, we can't return JSON, so we need to fetch again
      // But we can skip to the working gateway
    } else {
      return new NextResponse(safeStringify(cached.data), {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
  }

  console.log(`🔄 Fetching IPFS content: ${ipfsPath}`)

  // Special handling for known problematic hashes
  const problematicHashes = [
    'QmUdJsxjEkTre1X9DPqsLvgoocWyRspwepZptk9VLrgcms', // Example from your log
    // Add other known problematic hashes
  ]

  if (problematicHashes.includes(ipfsPath)) {
    console.log(`⚠️ Known problematic IPFS hash: ${ipfsPath}, returning fallback`)
    return createFallbackResponse(request, ipfsPath)
  }

  let lastError: any = null
  let workingGateway: string | null = null

  // Try each gateway in priority order with better error handling
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
        // Remove the Next.js cache to avoid issues
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log(`✅ Success via ${gateway.url} (${response.status})`)
        workingGateway = gateway.url
        
        const contentType = response.headers.get('content-type') || 'application/octet-stream'
        
        // Handle different content types
        let data: any
        let responseHeaders: Record<string, string> = {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'Content-Type': contentType
        }
        
        if (contentType.includes('application/json')) {
          const text = await response.text()
          data = safeParse(text)
          
          // Cache successful JSON responses
          cache.set(cacheKey, { data, timestamp: Date.now(), contentType })
          
          return new NextResponse(safeStringify(data), { headers: responseHeaders })
          
        } else if (contentType.includes('image/')) {
          // For images, return the blob directly
          const arrayBuffer = await response.arrayBuffer()
          
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              ...responseHeaders,
              'Content-Type': contentType,
              'Content-Length': arrayBuffer.byteLength.toString()
            }
          })
          
        } else {
          // For other content types, try to parse as text first
          const text = await response.text()
          
          try {
            // Try to parse as JSON if possible
            data = safeParse(text)
            cache.set(cacheKey, { data, timestamp: Date.now(), contentType: 'application/json' })
            return new NextResponse(safeStringify(data), { headers: responseHeaders })
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
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`⚠️ Gateway ${gateway.url} failed: ${errorMessage}`)
      lastError = error
      
      // If it's an abort error, we know it timed out
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`⏰ ${gateway.url} request was aborted (timeout)`)
      }
      
      // Continue to next gateway
      continue
    }
  }
  
  console.error(`❌ All IPFS gateways failed for path: ${ipfsPath}`)
  console.error(`❌ Last error:`, lastError)
  
  // Return a more helpful fallback response
  return createFallbackResponse(request, ipfsPath, lastError)
}

function createFallbackResponse(request: NextRequest, ipfsPath: string, lastError?: any) {
  // Check if this looks like it should be metadata vs an image
  const isMetadata = !ipfsPath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
  
  if (isMetadata) {
    // Return structured fallback metadata for NFTs
    const fallbackData = {
      error: 'IPFS_FETCH_FAILED',
      message: 'IPFS content is currently unavailable',
      ipfsPath,
      fallback: {
        name: `CryptoKaiju #${ipfsPath.slice(-4)}`,
        description: "This is a unique CryptoKaiju NFT. Metadata temporarily unavailable due to IPFS gateway issues.",
        image: "/images/placeholder-kaiju.png",
        attributes: [
          {
            trait_type: "Status",
            value: "Metadata Loading"
          }
        ],
        _fallback: true,
        _timestamp: new Date().toISOString(),
        _originalHash: ipfsPath
      },
      gateways_tried: IPFS_GATEWAYS.map(g => g.url),
      last_error: lastError?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      troubleshooting: {
        suggestions: [
          "This content may have been removed from IPFS",
          "Try again later as IPFS networks can be unstable",
          "Some older NFTs may have deprecated IPFS hashes"
        ],
        alternatives: [
          "Check OpenSea for additional metadata",
          "View the NFT on the blockchain directly"
        ]
      }
    }

    return NextResponse.json(fallbackData, { 
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Shorter cache for failures
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  } else {
    // For images, redirect to placeholder
    return NextResponse.redirect(new URL('/images/placeholder-kaiju.png', request.url), 302)
  }
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
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }
  }, 60 * 60 * 1000) // Clean up every hour
}