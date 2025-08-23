// src/app/api/debug-contentful/route.ts
import { NextResponse } from 'next/server'
import { getAllKaijuBatches, convertContentfulBatchToLocal } from '@/lib/contentful'

export async function GET() {
  try {
    console.log('🔧 Debug Contentful Connection')
    console.log('Environment check:', {
      CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID ? 'SET (' + process.env.CONTENTFUL_SPACE_ID.substring(0, 8) + '...)' : 'MISSING',
      CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN ? 'SET (' + process.env.CONTENTFUL_ACCESS_TOKEN.substring(0, 8) + '...)' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV
    })

    console.log('🔄 Attempting to fetch batches from Contentful...')
    const contentfulBatches = await getAllKaijuBatches()
    console.log(`📦 Raw Contentful response: ${contentfulBatches.length} batches`)
    
    // Try to convert the first batch to see if there are conversion issues
    let conversionTest = null
    let conversionError = null
    
    if (contentfulBatches.length > 0) {
      try {
        conversionTest = convertContentfulBatchToLocal(contentfulBatches[0])
        console.log('✅ Batch conversion successful')
      } catch (error) {
        conversionError = error instanceof Error ? error.message : 'Unknown conversion error'
        console.error('❌ Batch conversion failed:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        CONTENTFUL_SPACE_ID: !!process.env.CONTENTFUL_SPACE_ID,
        CONTENTFUL_ACCESS_TOKEN: !!process.env.CONTENTFUL_ACCESS_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
        spaceIdPreview: process.env.CONTENTFUL_SPACE_ID?.substring(0, 8) + '...',
        tokenPreview: process.env.CONTENTFUL_ACCESS_TOKEN?.substring(0, 8) + '...'
      },
      stats: {
        totalBatches: contentfulBatches.length,
        firstBatchId: contentfulBatches[0]?.sys?.id,
        firstBatchContentType: contentfulBatches[0]?.sys?.contentType?.sys?.id,
        firstBatchFields: contentfulBatches[0] ? Object.keys(contentfulBatches[0].fields || {}) : []
      },
      sampleBatch: contentfulBatches[0] ? {
        sys: {
          id: contentfulBatches[0].sys.id,
          contentType: contentfulBatches[0].sys.contentType?.sys?.id,
          createdAt: contentfulBatches[0].sys.createdAt,
          updatedAt: contentfulBatches[0].sys.updatedAt
        },
        fields: {
          batchId: contentfulBatches[0].fields.batchId,
          name: contentfulBatches[0].fields.name,
          type: contentfulBatches[0].fields.type,
          rarity: contentfulBatches[0].fields.rarity,
          essence: contentfulBatches[0].fields.essence,
          availability: contentfulBatches[0].fields.availability,
          discoveredDate: contentfulBatches[0].fields.discoveredDate,
          discoveredDateType: typeof contentfulBatches[0].fields.discoveredDate,
          estimatedSupply: contentfulBatches[0].fields.estimatedSupply,
          estimatedSupplyType: typeof contentfulBatches[0].fields.estimatedSupply,
          hasCharacterDescription: !!contentfulBatches[0].fields.characterDescription,
          characterDescriptionType: typeof contentfulBatches[0].fields.characterDescription,
          hasPhysicalDescription: !!contentfulBatches[0].fields.physicalDescription,
          hasPhysicalImages: !!contentfulBatches[0].fields.physicalImages,
          physicalImagesCount: Array.isArray(contentfulBatches[0].fields.physicalImages) ? contentfulBatches[0].fields.physicalImages.length : 0,
          hasNftImages: !!contentfulBatches[0].fields.nftImages,
          nftImagesCount: Array.isArray(contentfulBatches[0].fields.nftImages) ? contentfulBatches[0].fields.nftImages.length : 0
        }
      } : null,
      conversionTest: conversionTest ? {
        success: true,
        convertedBatch: {
          id: conversionTest.id,
          name: conversionTest.name,
          type: conversionTest.type,
          rarity: conversionTest.rarity,
          discoveredDate: conversionTest.discoveredDate,
          estimatedSupply: conversionTest.estimatedSupply,
          hasCharacterDescription: !!conversionTest.characterDescription,
          characterDescriptionLength: typeof conversionTest.characterDescription === 'string' 
            ? conversionTest.characterDescription.length 
            : 'rich-text-object',
          imageCount: conversionTest.images.physical.length,
          hasNftImages: !!conversionTest.images.nft
        }
      } : {
        success: false,
        error: conversionError
      },
      allBatchesSummary: contentfulBatches.slice(0, 5).map((batch, index) => ({
        index,
        id: batch.sys.id,
        batchId: batch.fields.batchId,
        name: batch.fields.name,
        type: batch.fields.type,
        rarity: batch.fields.rarity,
        hasAllRequiredFields: !!(
          batch.fields.batchId &&
          batch.fields.slug &&
          batch.fields.name &&
          batch.fields.type &&
          batch.fields.rarity &&
          batch.fields.characterDescription &&
          batch.fields.estimatedSupply !== undefined &&
          batch.fields.discoveredDate
        )
      }))
    })
    
  } catch (error) {
    console.error('❌ Debug API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
      timestamp: new Date().toISOString(),
      environment: {
        CONTENTFUL_SPACE_ID: !!process.env.CONTENTFUL_SPACE_ID,
        CONTENTFUL_ACCESS_TOKEN: !!process.env.CONTENTFUL_ACCESS_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
        spaceIdPreview: process.env.CONTENTFUL_SPACE_ID?.substring(0, 8) + '...',
        tokenPreview: process.env.CONTENTFUL_ACCESS_TOKEN?.substring(0, 8) + '...'
      }
    }, { status: 500 })
  }
}