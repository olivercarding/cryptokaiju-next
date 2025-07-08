// src/app/api/opensea/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

// OpenSea API limits and constraints
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 50
const REQUEST_TIMEOUT = 30000 // 30 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the OpenSea API path
    const apiPath = params.path.join('/')
    const url = new URL(request.url)
    
    // Handle and validate query parameters
    const searchParams = new URLSearchParams(url.searchParams)
    
    // Enforce OpenSea's limit restrictions
    const limit = searchParams.get('limit')
    if (limit) {
      const limitNum = parseInt(limit)
      if (limitNum > MAX_LIMIT) {
        console.log(`⚠️ Limiting request from ${limit} to ${MAX_LIMIT} (OpenSea max)`)
        searchParams.set('limit', MAX_LIMIT.toString())
      } else if (limitNum <= 0) {
        console.log(`⚠️ Invalid limit ${limit}, setting to default ${DEFAULT_LIMIT}`)
        searchParams.set('limit', DEFAULT_LIMIT.toString())
      }
    }
    
    // Remove any invalid parameters that might cause issues
    const validParams = new URLSearchParams()
    for (const [key, value] of searchParams) {
      // Only allow known valid parameters
      if (['limit', 'next', 'cursor', 'order_by', 'order_direction'].includes(key)) {
        validParams.set(key, value)
      }
    }
    
    const searchParamsString = validParams.toString()
    const openSeaUrl = `${OPENSEA_BASE_URL}/${apiPath}${searchParamsString ? `?${searchParamsString}` : ''}`
    
    console.log(`🌊 Proxying OpenSea request: ${openSeaUrl}`)
    console.log(`🔍 API Path: ${apiPath}`)
    console.log(`🔍 Search Params: ${searchParamsString}`)

    // Validate API key
    if (!OPENSEA_API_KEY) {
      console.error('❌ OpenSea API key not configured')
      return NextResponse.json(
        { 
          error: 'OpenSea API not configured',
          message: 'API key missing. Please configure OPENSEA_API_KEY environment variable.',
          code: 'MISSING_API_KEY'
        }, 
        { status: 503 }
      )
    }

    // Validate API key format
    if (OPENSEA_API_KEY.length < 30) {
      console.error('❌ OpenSea API key appears invalid (too short)')
      return NextResponse.json(
        { 
          error: 'Invalid API configuration',
          message: 'API key appears to be invalid.',
          code: 'INVALID_API_KEY'
        }, 
        { status: 503 }
      )
    }

    console.log(`🔑 Using API key: ${OPENSEA_API_KEY.substring(0, 10)}...`)

    // Prepare request headers
    const headers = {
      'Accept': 'application/json',
      'X-API-KEY': OPENSEA_API_KEY,
      'User-Agent': 'CryptoKaiju/1.0',
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.error(`⏰ Request timeout after ${REQUEST_TIMEOUT}ms for: ${openSeaUrl}`)
    }, REQUEST_TIMEOUT)

    // Make the request to OpenSea
    const response = await fetch(openSeaUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
      next: { revalidate: 60 }
    })

    clearTimeout(timeoutId)

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ OpenSea API error: ${response.status} ${response.statusText}`)
      console.error(`❌ Error details: ${errorText}`)
      console.error(`❌ Request URL: ${openSeaUrl}`)
      
      // Try to parse error as JSON for structured error info
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        console.error(`❌ Parsed error:`, errorJson)
        errorDetails = errorJson
      } catch (e) {
        console.error(`❌ Raw error text: ${errorText}`)
      }
      
      // Handle specific error cases
      let userMessage = 'OpenSea API request failed'
      let errorCode = 'OPENSEA_ERROR'
      
      switch (response.status) {
        case 400:
          userMessage = 'Invalid request parameters'
          errorCode = 'BAD_REQUEST'
          if (typeof errorDetails === 'object' && errorDetails.errors) {
            if (errorDetails.errors.includes('Limit must be a maximum of 100')) {
              userMessage = 'Request limit too high. Maximum 100 items per request.'
              errorCode = 'LIMIT_EXCEEDED'
            }
          }
          break
        case 401:
          userMessage = 'Invalid or expired API key'
          errorCode = 'UNAUTHORIZED'
          break
        case 403:
          userMessage = 'Access forbidden - API key may lack permissions'
          errorCode = 'FORBIDDEN'
          break
        case 404:
          userMessage = 'Resource not found'
          errorCode = 'NOT_FOUND'
          break
        case 429:
          userMessage = 'Rate limit exceeded. Please try again later.'
          errorCode = 'RATE_LIMITED'
          break
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = 'OpenSea service temporarily unavailable'
          errorCode = 'SERVICE_UNAVAILABLE'
          break
      }
      
      return NextResponse.json(
        { 
          error: userMessage,
          code: errorCode,
          status: response.status,
          details: errorDetails,
          timestamp: new Date().toISOString()
        }, 
        { status: response.status }
      )
    }

    // Parse successful response
    const data = await response.json()
    
    console.log(`✅ OpenSea API response received successfully`)
    console.log(`📊 Response data keys:`, Object.keys(data))
    
    if (data.nfts) {
      console.log(`📊 Found ${data.nfts.length} NFTs`)
    } else if (data.nft) {
      console.log(`📊 Found individual NFT: ${data.nft.name || data.nft.identifier}`)
    }
    
    // Add metadata about the request
    const responseWithMeta = {
      ...data,
      _meta: {
        timestamp: new Date().toISOString(),
        requestPath: apiPath,
        requestParams: Object.fromEntries(validParams),
        source: 'opensea-api-v2'
      }
    }
    
    return NextResponse.json(responseWithMeta, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Response-Time': new Date().toISOString(),
      }
    })

  } catch (error) {
    // Handle network errors, timeouts, etc.
    const isAbortError = error instanceof Error && error.name === 'AbortError'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (isAbortError) {
      console.error('⏰ OpenSea request timed out')
      return NextResponse.json(
        { 
          error: 'Request timeout',
          message: 'OpenSea API request took too long to respond',
          code: 'TIMEOUT',
          timestamp: new Date().toISOString()
        }, 
        { status: 504 }
      )
    }
    
    console.error('❌ OpenSea proxy error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to communicate with OpenSea API',
        code: 'INTERNAL_ERROR',
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
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