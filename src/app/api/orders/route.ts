// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface MintedNFT {
  nfcId: string
  name: string
  tokenUri: string
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
  specialInstructions: string
}

interface OrderData {
  orderNumber: string
  mintedNFTs: MintedNFT[]
  shippingInfo: ShippingInfo
  shippingCost: number
  currency: string
  status: string
  createdAt: string
}

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Orders'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
  console.warn('⚠️ Airtable credentials not configured. Orders will be logged to console.')
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json()

    // Validate required fields
    if (!orderData.orderNumber || !orderData.mintedNFTs || !orderData.shippingInfo) {
      return NextResponse.json(
        { error: 'Missing required order data' },
        { status: 400 }
      )
    }

    // Validate shipping info
    const { shippingInfo } = orderData
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || !shippingInfo.address1) {
      return NextResponse.json(
        { error: 'Missing required shipping information' },
        { status: 400 }
      )
    }

    // Prepare NFTs data for Airtable
    const nftsString = orderData.mintedNFTs.map(nft => 
      `${nft.name} (NFC: ${nft.nfcId})`
    ).join(', ')

    // Prepare full address
    const fullAddress = [
      shippingInfo.address1,
      shippingInfo.address2,
      shippingInfo.city,
      shippingInfo.state,
      shippingInfo.postalCode,
      shippingInfo.country
    ].filter(Boolean).join(', ')

    // Prepare record for Airtable
    const airtableRecord = {
      fields: {
        'Order Number': orderData.orderNumber,
        'Status': orderData.status,
        'Customer Name': `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        'Email': shippingInfo.email,
        'Phone': shippingInfo.phone || '',
        'Shipping Address': fullAddress,
        'Special Instructions': shippingInfo.specialInstructions || '',
        'NFTs': nftsString,
        'NFT Count': orderData.mintedNFTs.length,
        'Shipping Cost': orderData.shippingCost,
        'Currency': orderData.currency,
        'Created At': orderData.createdAt,
        'NFC IDs': orderData.mintedNFTs.map(nft => nft.nfcId).join(', '),
        'Token URIs': orderData.mintedNFTs.map(nft => nft.tokenUri).join(', ')
      }
    }

    // If Airtable is configured, send to Airtable
    if (AIRTABLE_BASE_ID && AIRTABLE_API_KEY) {
      console.log('📤 Sending order to Airtable...')
      
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(airtableRecord)
        }
      )

      if (!airtableResponse.ok) {
        const errorData = await airtableResponse.text()
        console.error('❌ Airtable API error:', errorData)
        throw new Error(`Airtable API error: ${airtableResponse.status}`)
      }

      const airtableResult = await airtableResponse.json()
      console.log('✅ Order saved to Airtable:', airtableResult.id)

      // Return success response with Airtable record ID
      return NextResponse.json({
        success: true,
        orderNumber: orderData.orderNumber,
        airtableId: airtableResult.id,
        message: 'Order submitted successfully'
      })

    } else {
      // Fallback: Log to console if Airtable not configured
      console.log('📋 DEMO MODE - Order would be saved to Airtable:')
      console.log('Order Number:', orderData.orderNumber)
      console.log('Customer:', `${shippingInfo.firstName} ${shippingInfo.lastName}`)
      console.log('Email:', shippingInfo.email)
      console.log('Address:', fullAddress)
      console.log('NFTs:', nftsString)
      console.log('Shipping Cost:', `${orderData.shippingCost} ${orderData.currency}`)
      console.log('Created:', orderData.createdAt)

      // Return success response for demo
      return NextResponse.json({
        success: true,
        orderNumber: orderData.orderNumber,
        demo: true,
        message: 'Order logged successfully (demo mode)'
      })
    }

  } catch (error) {
    console.error('❌ Error processing order:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve orders (optional - for admin/status checking)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number required' },
        { status: 400 }
      )
    }

    // If Airtable is configured, fetch from Airtable
    if (AIRTABLE_BASE_ID && AIRTABLE_API_KEY) {
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={Order Number}='${orderNumber}'`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        }
      )

      if (!airtableResponse.ok) {
        throw new Error(`Airtable API error: ${airtableResponse.status}`)
      }

      const airtableResult = await airtableResponse.json()
      
      if (airtableResult.records.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      const record = airtableResult.records[0]
      return NextResponse.json({
        success: true,
        order: {
          orderNumber: record.fields['Order Number'],
          status: record.fields['Status'],
          customerName: record.fields['Customer Name'],
          email: record.fields['Email'],
          shippingCost: record.fields['Shipping Cost'],
          currency: record.fields['Currency'],
          createdAt: record.fields['Created At'],
          nftCount: record.fields['NFT Count']
        }
      })

    } else {
      return NextResponse.json({
        success: false,
        demo: true,
        message: 'Demo mode - Airtable not configured'
      })
    }

  } catch (error) {
    console.error('❌ Error fetching order:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}