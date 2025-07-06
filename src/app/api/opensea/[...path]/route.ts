// src/app/api/opensea/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2'
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY // Server-side only, no NEXT_PUBLIC_

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

    // Check if API key is available
    if (!OPENSEA_API_KEY) {
      console.warn('⚠️ OpenSea API key not configured')
      return NextResponse.json(
        { error: 'OpenSea API not configured' }, 
        { status: 503 }
      )
    }

    const response = await fetch(openSeaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_API_KEY,
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error(`OpenSea API error: ${response.status} ${response.statusText}`)
      
      // Return structured error without exposing internal details
      if (response.status === 404) {
        return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
      
      return NextResponse.json(
        { error: 'OpenSea API unavailable' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      }
    })

  } catch (error) {
    console.error('❌ OpenSea proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}