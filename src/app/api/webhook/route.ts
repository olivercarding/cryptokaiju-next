// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Webhook endpoint - GET method not supported',
    timestamp: new Date().toISOString()
  }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    // Placeholder webhook handler
    const body = await request.json()
    
    console.log('Webhook received:', body)
    
    // Here you would handle webhook events
    // For now, just return success
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Invalid webhook payload'
    }, { status: 400 })
  }
}