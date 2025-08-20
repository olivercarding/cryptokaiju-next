// src/app/sitemap.ts - DYNAMIC SITEMAP WITH CONTENTFUL DATA
import { MetadataRoute } from 'next'
import KaijuBatchService from '@/lib/services/KaijuBatchService'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptokaiju.io'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kaijudex`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nft`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]

  try {
    // Get all batches from Contentful
    const batches = await KaijuBatchService.getAllBatches()
    
    // Generate batch pages
    const batchPages: MetadataRoute.Sitemap = batches.map(batch => ({
      url: `${baseUrl}/kaijudex/${batch.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: batch.featured ? 0.9 : 0.7,
    }))

    return [...staticPages, ...batchPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}

// src/lib/utils/seoHelpers.ts - SEO UTILITY FUNCTIONS
export class SEOHelpers {
  /**
   * Validate SEO title length and quality
   */
  static validateTitle(title: string): {
    isValid: boolean
    length: number
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []
    
    if (title.length < 30) {
      warnings.push('Title is too short (less than 30 characters)')
      suggestions.push('Add more descriptive words to reach 50-60 characters')
    }
    
    if (title.length > 60) {
      warnings.push('Title may be truncated in search results (over 60 characters)')
      suggestions.push('Shorten to under 60 characters for optimal display')
    }
    
    if (!title.includes('CryptoKaiju')) {
      suggestions.push('Consider including "CryptoKaiju" for brand recognition')
    }
    
    if (!title.match(/Physical NFT|Connected Collectible|NFC/i)) {
      suggestions.push('Include key terms like "Physical NFT" or "Connected Collectible"')
    }
    
    return {
      isValid: warnings.length === 0,
      length: title.length,
      warnings,
      suggestions
    }
  }

  /**
   * Validate SEO description length and quality
   */
  static validateDescription(description: string): {
    isValid: boolean
    length: number
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []
    
    if (description.length < 120) {
      warnings.push('Description is too short (less than 120 characters)')
      suggestions.push('Expand to 150-160 characters for better search visibility')
    }
    
    if (description.length > 160) {
      warnings.push('Description may be truncated (over 160 characters)')
      suggestions.push('Shorten to under 160 characters')
    }
    
    if (!description.match(/Physical NFT|Connected Collectible|NFC|blockchain/i)) {
      suggestions.push('Include key terms that describe your unique value proposition')
    }
    
    return {
      isValid: warnings.length === 0,
      length: description.length,
      warnings,
      suggestions
    }
  }

  /**
   * Generate SEO-friendly slug from text
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Extract keywords from text content
   */
  static extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ])
    
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
    
    const wordCount = new Map<string, number>()
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word)
  }

  /**
   * Generate social media preview text
   */
  static generateSocialPreview(title: string, description: string): {
    facebook: { title: string; description: string }
    twitter: { title: string; description: string }
  } {
    return {
      facebook: {
        title: title.length > 60 ? title.substring(0, 57) + '...' : title,
        description: description.length > 155 ? description.substring(0, 152) + '...' : description
      },
      twitter: {
        title: title.length > 70 ? title.substring(0, 67) + '...' : title,
        description: description.length > 200 ? description.substring(0, 197) + '...' : description
      }
    }
  }

  /**
   * Calculate SEO score based on various factors
   */
  static calculateSEOScore(seoData: {
    title?: string
    description?: string
    keywords?: string[]
    hasImages?: boolean
    hasStructuredData?: boolean
    hasOpenGraph?: boolean
    hasTwitterCards?: boolean
  }): {
    score: number
    maxScore: number
    percentage: number
    improvements: string[]
  } {
    let score = 0
    const maxScore = 100
    const improvements: string[] = []
    
    // Title (25 points)
    if (seoData.title) {
      if (seoData.title.length >= 30 && seoData.title.length <= 60) {
        score += 25
      } else {
        score += 15
        improvements.push('Optimize title length (30-60 characters)')
      }
    } else {
      improvements.push('Add SEO title')
    }
    
    // Description (25 points)
    if (seoData.description) {
      if (seoData.description.length >= 120 && seoData.description.length <= 160) {
        score += 25
      } else {
        score += 15
        improvements.push('Optimize description length (120-160 characters)')
      }
    } else {
      improvements.push('Add SEO description')
    }
    
    // Keywords (15 points)
    if (seoData.keywords && seoData.keywords.length > 0) {
      score += Math.min(15, seoData.keywords.length * 3)
    } else {
      improvements.push('Add relevant keywords')
    }
    
    // Images (10 points)
    if (seoData.hasImages) {
      score += 10
    } else {
      improvements.push('Add optimized images')
    }
    
    // Structured Data (10 points)
    if (seoData.hasStructuredData) {
      score += 10
    } else {
      improvements.push('Add structured data (JSON-LD)')
    }
    
    // Open Graph (8 points)
    if (seoData.hasOpenGraph) {
      score += 8
    } else {
      improvements.push('Add Open Graph meta tags')
    }
    
    // Twitter Cards (7 points)
    if (seoData.hasTwitterCards) {
      score += 7
    } else {
      improvements.push('Add Twitter Card meta tags')
    }
    
    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      improvements
    }
  }
}

// src/components/admin/SEOPreview.tsx - SEO PREVIEW COMPONENT FOR CONTENT EDITORS
'use client'

import React from 'react'
import { LocalKaijuBatch } from '@/lib/contentful'
import { SEOHelpers } from '@/lib/utils/seoHelpers'

interface SEOPreviewProps {
  batch: LocalKaijuBatch
}

export function SEOPreview({ batch }: SEOPreviewProps) {
  const title = batch.seo?.title || `${batch.name} - ${batch.type} Collectible | CryptoKaiju`
  const description = batch.seo?.description || batch.characterDescription
  
  const titleValidation = SEOHelpers.validateTitle(title)
  const descriptionValidation = SEOHelpers.validateDescription(description)
  const socialPreview = SEOHelpers.generateSocialPreview(title, description)
  
  const seoScore = SEOHelpers.calculateSEOScore({
    title: batch.seo?.title,
    description: batch.seo?.description,
    keywords: batch.seo?.keywords,
    hasImages: batch.images.physical.length > 0,
    hasStructuredData: true, // We generate this automatically
    hasOpenGraph: !!batch.seo?.openGraph?.title,
    hasTwitterCards: !!batch.seo?.twitter?.title
  })
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">SEO Preview</h3>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            seoScore.percentage >= 80 ? 'bg-green-100 text-green-800' :
            seoScore.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            SEO Score: {seoScore.percentage}%
          </div>
        </div>
      </div>
      
      {/* Google Search Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Google Search Preview</h4>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">cryptokaiju.io › kaijudex › {batch.slug}</div>
          <div className="text-xl text-blue-600 hover:underline cursor-pointer">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      
      {/* Facebook Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Facebook Preview</h4>
        <div className="flex space-x-3">
          <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
            {batch.images.physical[0] ? (
              <img 
                src={batch.images.physical[0]} 
                alt="" 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <span className="text-xs text-gray-500">No Image</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 uppercase">CRYPTOKAIJU.IO</div>
            <div className="font-semibold text-gray-900 truncate">{socialPreview.facebook.title}</div>
            <div className="text-sm text-gray-600 line-clamp-2">{socialPreview.facebook.description}</div>
          </div>
        </div>
      </div>
      
      {/* Twitter Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Twitter Preview</h4>
        <div className="border rounded-lg overflow-hidden">
          {batch.images.physical[0] && (
            <div className="h-32 bg-gray-200">
              <img 
                src={batch.images.physical[0]} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-3">
            <div className="font-semibold text-gray-900">{socialPreview.twitter.title}</div>
            <div className="text-sm text-gray-600 mt-1">{socialPreview.twitter.description}</div>
            <div className="text-xs text-gray-500 mt-2">cryptokaiju.io</div>
          </div>
        </div>
      </div>
      
      {/* Validation Warnings */}
      {(titleValidation.warnings.length > 0 || descriptionValidation.warnings.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">SEO Recommendations</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {titleValidation.warnings.map((warning, index) => (
              <li key={`title-${index}`}>• {warning}</li>
            ))}
            {descriptionValidation.warnings.map((warning, index) => (
              <li key={`desc-${index}`}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* SEO Improvements */}
      {seoScore.improvements.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested Improvements</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {seoScore.improvements.map((improvement, index) => (
              <li key={index}>• {improvement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}