// src/app/api/opensea/[...path]/route.ts - DEBUG VERSION
import { NextRequest, NextResponse } from 'next/server'

const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the OpenSea API path
    const apiPath = params.path.join('/')
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    
    const openSeaUrl = `${OPENSEA_BASE_URL}/${apiPath}${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`🌊 Proxying OpenSea request: ${openSeaUrl}`)
    
    // DEBUG: Log all the details
    console.log(`🔍 API Path: ${apiPath}`)
    console.log(`🔍 Search Params: ${searchParams}`)
    console.log(`🔍 Full URL: ${openSeaUrl}`)

    // Check if API key is available
    if (!OPENSEA_API_KEY) {
      console.error('❌ OpenSea API key not configured. Please set OPENSEA_API_KEY environment variable.')
      return NextResponse.json(
        { 
          error: 'OpenSea API not configured',
          message: 'API key missing. Please configure OPENSEA_API_KEY environment variable.'
        }, 
        { status: 503 }
      )
    }

    // DEBUG: Log API key (first 10 chars only for security)
    console.log(`🔑 Using API key: ${OPENSEA_API_KEY.substring(0, 10)}...`)

    const headers = {
      'Accept': 'application/json',
      'X-API-KEY': OPENSEA_API_KEY,
      'User-Agent': 'CryptoKaiju/1.0',
    }
    
    // DEBUG: Log headers (without full API key)
    console.log(`📋 Request headers:`, {
      'Accept': headers.Accept,
      'X-API-KEY': `${OPENSEA_API_KEY.substring(0, 10)}...`,
      'User-Agent': headers['User-Agent']
    })

    const response = await fetch(openSeaUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    })

    // DEBUG: Enhanced error details
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ OpenSea API error: ${response.status} ${response.statusText}`)
      console.error(`❌ Error details: ${errorText}`)
      console.error(`❌ Request URL: ${openSeaUrl}`)
      console.error(`❌ Request headers:`, headers)
      
      // Try to parse error as JSON for more details
      try {
        const errorJson = JSON.parse(errorText)
        console.error(`❌ Parsed error:`, errorJson)
      } catch (e) {
        console.error(`❌ Raw error text: ${errorText}`)
      }
      
      // Return structured error with more details for debugging
      return NextResponse.json(
        { 
          error: 'OpenSea API error',
          status: response.status,
          message: response.statusText,
          details: errorText,
          url: openSeaUrl
        }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // DEBUG: Log successful response details
    console.log(`✅ OpenSea API response received successfully`)
    console.log(`📊 Response data keys:`, Object.keys(data))
    if (data.nfts) {
      console.log(`📊 Found ${data.nfts.length} NFTs`)
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('❌ OpenSea proxy error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch from OpenSea API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}