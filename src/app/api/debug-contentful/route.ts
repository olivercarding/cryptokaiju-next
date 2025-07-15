// src/app/api/debug-contentful/route.ts
import { NextResponse } from 'next/server'
import { contentfulClient } from '@/lib/contentful'

export async function GET() {
  try {
    console.log('🔍 Debugging Contentful content types...')
    
    // Get all content types in your space
    const contentTypes = await contentfulClient.getContentTypes()
    
    const contentTypeInfo = contentTypes.items.map(ct => ({
      id: ct.sys.id,
      name: ct.name,
      description: ct.description,
      fields: ct.fields.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        required: f.required
      }))
    }))
    
    console.log('📋 Available content types:')
    contentTypeInfo.forEach(ct => {
      console.log(`- ID: "${ct.id}", Name: "${ct.name}"`)
      console.log(`  Fields:`, ct.fields.map(f => `${f.id} (${f.type})`).join(', '))
    })
    
    // Test common variations
    const testContentTypes = ['blogPost', 'blogpost', 'blog-post', 'blog_post']
    const testResults = []
    
    for (const contentTypeId of testContentTypes) {
      try {
        const result = await contentfulClient.getEntries({
          content_type: contentTypeId,
          limit: 1
        })
        
        testResults.push({
          contentType: contentTypeId,
          exists: true,
          entryCount: result.total,
          sampleFields: result.items.length > 0 ? Object.keys(result.items[0].fields) : []
        })
        
        console.log(`✅ Content type "${contentTypeId}" exists with ${result.total} entries`)
      } catch (error) {
        testResults.push({
          contentType: contentTypeId,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.log(`❌ Content type "${contentTypeId}" does not exist`)
      }
    }
    
    return NextResponse.json({
      success: true,
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      contentTypes: contentTypeInfo,
      testResults
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error debugging Contentful:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      spaceId: process.env.CONTENTFUL_SPACE_ID,
    }, { status: 500 })
  }
}