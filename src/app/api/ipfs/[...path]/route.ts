// src/app/api/ipfs/[...path]/route.ts - UPDATED WITH OPTIMIZED GATEWAY STRATEGY
import { NextRequest, NextResponse } from 'next/server'

// OPTIMIZED: Primary gateway first, then fallbacks - matches service strategy
const IPFS_GATEWAYS = [
  // PRIMARY: Your pinned content (should handle 99%+ of requests)
  { 
    url: 'https://cryptokaiju.mypinata.cloud/ipfs', 
    timeout: 5000,  // Quick timeout since content is pinned
    priority: 1, 
    isPrimary: true,
    maxRetries: 2
  },
  
  // FALLBACKS: Only use if primary fails
  { url: 'https://gateway.pinata.cloud/ipfs', timeout: 8000, priority: 2 },
  { url: 'https://cloudflare-ipfs.com/ipfs', timeout: 8000, priority: 3 },
  { url: 'https://ipfs.io/ipfs', timeout: 10000, priority: 4 }
  // Removed slower/unreliable gateways since primary should handle almost all requests
]

// Enhanced cache with better performance tracking
const cache = new Map<string, { 
  data: any; 
  timestamp: number; 
  contentType: string;
  gatewayUsed: string;
  responseTime: number;
}>()

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ENHANCED: Gateway performance tracking
const gatewayMetrics = new Map<string, {
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastSuccess: number;
  lastFailure: number;
}>()

// Initialize gateway metrics
IPFS_GATEWAYS.forEach(gateway => {
  gatewayMetrics.set(gateway.url, {
    successCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
    lastSuccess: 0,
    lastFailure: 0
  })
})

// Gateway usage tracking
const gatewayUsage = {
  primary: 0,
  fallback: 0,
  failed: 0
}

// Helper function to safely extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

// BigInt-safe JSON serialization
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

// Track gateway performance
function trackGatewaySuccess(gatewayUrl: string, responseTime: number): void {
  const metrics = gatewayMetrics.get(gatewayUrl)
  if (metrics) {
    metrics.successCount++
    metrics.lastSuccess = Date.now()
    metrics.avgResponseTime = metrics.avgResponseTime > 0 ? 
      (metrics.avgResponseTime + responseTime) / 2 : responseTime
    gatewayMetrics.set(gatewayUrl, metrics)
  }
}

function trackGatewayFailure(gatewayUrl: string): void {
  const metrics = gatewayMetrics.get(gatewayUrl)
  if (metrics) {
    metrics.failureCount++
    metrics.lastFailure = Date.now()
    gatewayMetrics.set(gatewayUrl, metrics)
  }
}

// OPTIMIZED: Primary-first fetching strategy
async function fetchFromPrimaryGateway(ipfsPath: string, retryCount = 0): Promise<Response | null> {
  const primaryGateway = IPFS_GATEWAYS.find(g => g.isPrimary)!
  const maxRetries = primaryGateway.maxRetries || 2
  const startTime = Date.now()

  try {
    console.log(`🎯 API: Trying primary gateway: ${primaryGateway.url}/${ipfsPath}`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), primaryGateway.timeout)
    
    const response = await fetch(`${primaryGateway.url}/${ipfsPath}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, image/*, */*',
        'User-Agent': 'CryptoKaiju-API/1.0',
      }
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const responseTime = Date.now() - startTime
      trackGatewaySuccess(primaryGateway.url, responseTime)
      gatewayUsage.primary++
      console.log(`✅ API: Primary gateway success in ${responseTime}ms`)
      return response
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    trackGatewayFailure(primaryGateway.url)
    
    // Retry for transient issues
    if (retryCount < maxRetries && !isAbortError(error)) {
      console.log(`🔄 API: Retrying primary gateway (attempt ${retryCount + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return fetchFromPrimaryGateway(ipfsPath, retryCount + 1)
    }
    
    console.warn(`❌ API: Primary gateway failed after ${retryCount + 1} attempts: ${getErrorMessage(error)}`)
    return null
  }
}

// Sequential fallback through backup gateways
async function fetchFromFallbackGateways(ipfsPath: string): Promise<Response | null> {
  const fallbackGateways = IPFS_GATEWAYS.filter(g => !g.isPrimary)
  
  console.log(`🔄 API: Primary failed, trying ${fallbackGateways.length} fallback gateways`)
  
  for (const gateway of fallbackGateways) {
    const startTime = Date.now()
    
    try {
      console.log(`🌐 API: Trying fallback: ${gateway.url}/${ipfsPath}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), gateway.timeout)
      
      const response = await fetch(`${gateway.url}/${ipfsPath}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, image/*, */*',
          'User-Agent': 'CryptoKaiju-API/1.0',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const responseTime = Date.now() - startTime
        trackGatewaySuccess(gateway.url, responseTime)
        gatewayUsage.fallback++
        console.log(`✅ API: Fallback success: ${gateway.url} in ${responseTime}ms`)
        return response
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      trackGatewayFailure(gateway.url)
      console.warn(`⚠️ API: Fallback failed: ${gateway.url} - ${getErrorMessage(error)}`)
      // Continue to next gateway
    }
  }
  
  console.error(`❌ API: All fallback gateways failed for: ${ipfsPath}`)
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
    console.log(`💾 API: Cache hit for IPFS: ${ipfsPath} (via ${cached.gatewayUsed})`)
    
    if (cached.contentType.includes('image/')) {
      // For images, return the data directly
      return new NextResponse(cached.data, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Gateway-Used': cached.gatewayUsed,
          'X-Response-Time': `${cached.responseTime}ms`,
        }
      })
    } else {
      return new NextResponse(safeStringify(cached.data), {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'X-Gateway-Used': cached.gatewayUsed,
          'X-Response-Time': `${cached.responseTime}ms`,
        }
      })
    }
  }

  console.log(`🔄 API: Fetching IPFS content: ${ipfsPath}`)

  // Special handling for known problematic hashes
  const problematicHashes = [
    'QmUdJsxjEkTre1X9DPqsLvgoocWyRspwepZptk9VLrgcms',
    // Add other known problematic hashes
  ]

  if (problematicHashes.includes(ipfsPath)) {
    console.log(`⚠️ API: Known problematic IPFS hash: ${ipfsPath}, returning fallback`)
    return createFallbackResponse(request, ipfsPath)
  }

  const overallStartTime = Date.now()
  let workingGateway: string | null = null
  let finalResponse: Response | null = null

  // STRATEGY 1: Try primary gateway first
  const primaryResponse = await fetchFromPrimaryGateway(ipfsPath)
  if (primaryResponse) {
    finalResponse = primaryResponse
    workingGateway = IPFS_GATEWAYS.find(g => g.isPrimary)!.url
  } else {
    // STRATEGY 2: Try fallback gateways sequentially
    const fallbackResponse = await fetchFromFallbackGateways(ipfsPath)
    if (fallbackResponse) {
      finalResponse = fallbackResponse
      // Find which fallback gateway was used (would need to track this in the function)
      workingGateway = 'fallback-gateway'
    }
  }

  if (!finalResponse) {
    gatewayUsage.failed++
    console.error(`❌ API: All IPFS gateways failed for path: ${ipfsPath}`)
    return createFallbackResponse(request, ipfsPath)
  }

  const overallResponseTime = Date.now() - overallStartTime
  const contentType = finalResponse.headers.get('content-type') || 'application/octet-stream'
  
  try {
    // Handle different content types
    let data: any
    let responseHeaders: Record<string, string> = {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': contentType,
      'X-Gateway-Used': workingGateway || 'unknown',
      'X-Response-Time': `${overallResponseTime}ms`
    }
    
    if (contentType.includes('application/json')) {
      const text = await finalResponse.text()
      data = safeParse(text)
      
      // Cache successful JSON responses
      cache.set(cacheKey, { 
        data, 
        timestamp: Date.now(), 
        contentType,
        gatewayUsed: workingGateway || 'unknown',
        responseTime: overallResponseTime
      })
      
      return new NextResponse(safeStringify(data), { headers: responseHeaders })
      
    } else if (contentType.includes('image/')) {
      // For images, return the blob directly
      const arrayBuffer = await finalResponse.arrayBuffer()
      
      // Cache image data
      cache.set(cacheKey, { 
        data: arrayBuffer, 
        timestamp: Date.now(), 
        contentType,
        gatewayUsed: workingGateway || 'unknown',
        responseTime: overallResponseTime
      })
      
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
      const text = await finalResponse.text()
      
      try {
        // Try to parse as JSON if possible
        data = safeParse(text)
        cache.set(cacheKey, { 
          data, 
          timestamp: Date.now(), 
          contentType: 'application/json',
          gatewayUsed: workingGateway || 'unknown',
          responseTime: overallResponseTime
        })
        return new NextResponse(safeStringify(data), { headers: responseHeaders })
      } catch {
        // Return as plain text
        cache.set(cacheKey, { 
          data: text, 
          timestamp: Date.now(), 
          contentType: 'text/plain',
          gatewayUsed: workingGateway || 'unknown',
          responseTime: overallResponseTime
        })
        return new NextResponse(text, {
          status: 200,
          headers: {
            ...responseHeaders,
            'Content-Type': 'text/plain'
          }
        })
      }
    }
    
  } catch (error) {
    console.error(`❌ API: Error processing response for ${ipfsPath}:`, error)
    gatewayUsage.failed++
    return createFallbackResponse(request, ipfsPath, error)
  }
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
      last_error: getErrorMessage(lastError),
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
        'Content-Type': 'application/json',
        'X-Gateway-Used': 'fallback-generator',
      }
    })
  } else {
    // For images, redirect to placeholder
    return NextResponse.redirect(new URL('/images/placeholder-kaiju.png', request.url), 302)
  }
}

// ENHANCED: Stats endpoint for monitoring gateway performance
export async function OPTIONS(request: NextRequest) {
  // If it's a stats request
  if (request.nextUrl.searchParams.get('stats') === 'true') {
    const totalUsage = Object.values(gatewayUsage).reduce((a, b) => a + b, 0)
    
    const stats = {
      gatewayUsage: totalUsage > 0 ? {
        primary: `${((gatewayUsage.primary / totalUsage) * 100).toFixed(1)}% (${gatewayUsage.primary} requests)`,
        fallback: `${((gatewayUsage.fallback / totalUsage) * 100).toFixed(1)}% (${gatewayUsage.fallback} requests)`,
        failed: `${((gatewayUsage.failed / totalUsage) * 100).toFixed(1)}% (${gatewayUsage.failed} requests)`
      } : 'No requests yet',
      
      gatewayMetrics: Object.fromEntries(
        Array.from(gatewayMetrics.entries()).map(([url, metrics]) => {
          const total = metrics.successCount + metrics.failureCount
          const successRate = total > 0 ? (metrics.successCount / total) * 100 : 0
          
          return [url, {
            successRate: successRate.toFixed(1) + '%',
            totalRequests: total,
            avgResponseTime: metrics.avgResponseTime.toFixed(0) + 'ms',
            lastSuccess: metrics.lastSuccess ? new Date(metrics.lastSuccess).toISOString() : 'Never',
            lastFailure: metrics.lastFailure ? new Date(metrics.lastFailure).toISOString() : 'Never'
          }]
        })
      ),
      
      cacheStats: {
        size: cache.size,
        oldestEntry: cache.size > 0 ? Math.min(...Array.from(cache.values()).map(v => v.timestamp)) : null
      },
      
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