// src/app/api/ipfs/[...path]/route.ts - OPTIMIZED FOR RELIABLE PRIMARY GATEWAY
import { NextRequest, NextResponse } from 'next/server'

// OPTIMIZED: Primary gateway first, simple fallbacks
const PRIMARY_GATEWAY = {
  url: 'https://cryptokaiju.mypinata.cloud/ipfs',
  timeout: 5000,
  maxRetries: 2
}

const FALLBACK_GATEWAYS = [
  { url: 'https://gateway.pinata.cloud/ipfs', timeout: 8000 },
  { url: 'https://cloudflare-ipfs.com/ipfs', timeout: 8000 }
]

// Simple cache
const cache = new Map<string, { 
  data: any
  timestamp: number
  contentType: string
  source: string
}>()

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// Simple usage tracking
const usageStats = {
  primary: 0,
  fallback: 0,
  failed: 0
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

function safeParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch (error) {
    return text
  }
}

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  })
}

/**
 * Try primary gateway with retry logic
 */
async function fetchFromPrimaryGateway(ipfsPath: string, retryCount = 0): Promise<{ data: any; contentType: string } | null> {
  const startTime = Date.now()

  try {
    console.log(`🎯 Primary gateway (attempt ${retryCount + 1}): ${PRIMARY_GATEWAY.url}/${ipfsPath}`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PRIMARY_GATEWAY.timeout)
    
    const response = await fetch(`${PRIMARY_GATEWAY.url}/${ipfsPath}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, image/*, */*',
        'User-Agent': 'CryptoKaiju-API/2.0',
      }
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const contentType = response.headers.get('content-type') || 'application/octet-stream'
      const duration = Date.now() - startTime
      
      let data: any
      if (contentType.includes('application/json')) {
        const text = await response.text()
        data = safeParse(text)
      } else if (contentType.includes('image/')) {
        data = await response.arrayBuffer()
      } else {
        const text = await response.text()
        data = safeParse(text)
      }
      
      console.log(`✅ Primary gateway success in ${duration}ms`)
      return { data, contentType }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Retry for transient errors
    if (retryCount < PRIMARY_GATEWAY.maxRetries && !isAbortError(error)) {
      console.log(`🔄 Retrying primary gateway (attempt ${retryCount + 2}/${PRIMARY_GATEWAY.maxRetries + 1})`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return fetchFromPrimaryGateway(ipfsPath, retryCount + 1)
    }
    
    console.warn(`❌ Primary gateway failed after ${retryCount + 1} attempts in ${duration}ms: ${getErrorMessage(error)}`)
    return null
  }
}

/**
 * Try fallback gateways sequentially
 */
async function fetchFromFallbackGateways(ipfsPath: string): Promise<{ data: any; contentType: string } | null> {
  console.log(`🔄 Trying ${FALLBACK_GATEWAYS.length} fallback gateways`)
  
  for (const gateway of FALLBACK_GATEWAYS) {
    const startTime = Date.now()
    
    try {
      console.log(`🌐 Fallback: ${gateway.url}/${ipfsPath}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), gateway.timeout)
      
      const response = await fetch(`${gateway.url}/${ipfsPath}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, image/*, */*',
          'User-Agent': 'CryptoKaiju-API/2.0',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'application/octet-stream'
        const duration = Date.now() - startTime
        
        let data: any
        if (contentType.includes('application/json')) {
          const text = await response.text()
          data = safeParse(text)
        } else if (contentType.includes('image/')) {
          data = await response.arrayBuffer()
        } else {
          const text = await response.text()
          data = safeParse(text)
        }
        
        console.log(`✅ Fallback success: ${gateway.url} in ${duration}ms`)
        return { data, contentType }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.warn(`⚠️ Fallback failed: ${gateway.url} in ${duration}ms - ${getErrorMessage(error)}`)
    }
  }
  
  console.error(`❌ All fallback gateways failed`)
  return null
}

function isAbortError(error: any): boolean {
  return error instanceof Error && error.name === 'AbortError'
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
    console.log(`💾 Cache hit: ${ipfsPath} (via ${cached.source})`)
    
    const responseHeaders = {
      'Content-Type': cached.contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Cache': 'HIT',
      'X-Source': cached.source,
    }
    
    if (cached.contentType.includes('image/')) {
      return new NextResponse(cached.data, {
        status: 200,
        headers: {
          ...responseHeaders,
          'Content-Length': cached.data.byteLength?.toString() || '0'
        }
      })
    } else {
      return new NextResponse(safeStringify(cached.data), {
        status: 200,
        headers: responseHeaders
      })
    }
  }

  console.log(`🔄 Fetching IPFS content: ${ipfsPath}`)

  const overallStartTime = Date.now()
  let result: { data: any; contentType: string } | null = null
  let source = 'unknown'

  // Strategy 1: Try primary gateway first (should work 95%+ of time)
  const primaryResult = await fetchFromPrimaryGateway(ipfsPath)
  if (primaryResult) {
    result = primaryResult
    source = 'primary'
    usageStats.primary++
  } else {
    // Strategy 2: Try fallback gateways
    const fallbackResult = await fetchFromFallbackGateways(ipfsPath)
    if (fallbackResult) {
      result = fallbackResult
      source = 'fallback'
      usageStats.fallback++
    }
  }

  if (!result) {
    usageStats.failed++
    console.error(`❌ All IPFS gateways failed for: ${ipfsPath}`)
    return createFallbackResponse(request, ipfsPath)
  }

  const overallDuration = Date.now() - overallStartTime
  console.log(`✅ IPFS fetch successful in ${overallDuration}ms via ${source}`)
  
  // Cache successful result
  cache.set(cacheKey, { 
    data: result.data, 
    timestamp: Date.now(), 
    contentType: result.contentType,
    source
  })

  // Clean old cache entries periodically
  if (cache.size > 1000) {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }
  }
  
  const responseHeaders = {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': result.contentType,
    'X-Cache': 'MISS',
    'X-Source': source,
    'X-Response-Time': `${overallDuration}ms`
  }
  
  if (result.contentType.includes('application/json')) {
    return new NextResponse(safeStringify(result.data), { 
      status: 200,
      headers: responseHeaders 
    })
  } else if (result.contentType.includes('image/')) {
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        ...responseHeaders,
        'Content-Length': result.data.byteLength?.toString() || '0'
      }
    })
  } else {
    // Handle other content types
    try {
      const parsed = safeParse(result.data)
      return new NextResponse(safeStringify(parsed), { 
        status: 200,
        headers: {
          ...responseHeaders,
          'Content-Type': 'application/json'
        }
      })
    } catch {
      return new NextResponse(result.data, {
        status: 200,
        headers: {
          ...responseHeaders,
          'Content-Type': 'text/plain'
        }
      })
    }
  }
}

function createFallbackResponse(request: NextRequest, ipfsPath: string) {
  // Check if this looks like metadata vs an image
  const isMetadata = !ipfsPath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
  
  if (isMetadata) {
    // Return structured fallback metadata for NFTs
    const fallbackData = {
      error: 'IPFS_FETCH_FAILED',
      message: 'IPFS content is currently unavailable',
      ipfsPath,
      fallback: {
        name: `CryptoKaiju #${ipfsPath.slice(-4)}`,
        description: "This is a unique CryptoKaiju NFT. Metadata temporarily unavailable due to IPFS network issues.",
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
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(fallbackData, { 
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-Fallback': 'true',
      }
    })
  } else {
    // For images, redirect to placeholder
    return NextResponse.redirect(new URL('/images/placeholder-kaiju.png', request.url), 302)
  }
}

// Enhanced OPTIONS handler with stats endpoint
export async function OPTIONS(request: NextRequest) {
  // Check if this is a stats request
  if (request.nextUrl.searchParams.get('stats') === 'true') {
    const totalRequests = Object.values(usageStats).reduce((a, b) => a + b, 0)
    
    const stats = {
      usageStats: totalRequests > 0 ? {
        primary: `${((usageStats.primary / totalRequests) * 100).toFixed(1)}% (${usageStats.primary} requests)`,
        fallback: `${((usageStats.fallback / totalRequests) * 100).toFixed(1)}% (${usageStats.fallback} requests)`,
        failed: `${((usageStats.failed / totalRequests) * 100).toFixed(1)}% (${usageStats.failed} requests)`
      } : 'No requests yet',
      
      cacheStats: {
        size: cache.size,
        hitRate: 'Not tracked in optimized version'
      },
      
      gateways: {
        primary: PRIMARY_GATEWAY.url,
        fallbacks: FALLBACK_GATEWAYS.map(g => g.url)
      },
      
      version: 'optimized',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(stats, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    })
  }
  
  // Regular CORS preflight
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