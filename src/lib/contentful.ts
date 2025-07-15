// src/lib/contentful.ts
import { createClient } from 'contentful'
import type { Entry, Asset, EntryFieldTypes, EntrySkeletonType } from 'contentful'
import type { Document } from '@contentful/rich-text-types'

// Environment variable validation
if (!process.env.CONTENTFUL_SPACE_ID) {
  throw new Error('CONTENTFUL_SPACE_ID environment variable is required')
}

if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
  throw new Error('CONTENTFUL_ACCESS_TOKEN environment variable is required')
}

// Create the Contentful client
export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  // Use preview API for draft content in development
  host: process.env.CONTENTFUL_PREVIEW === 'true' ? 'preview.contentful.com' : 'cdn.contentful.com',
})

// TypeScript interfaces for blog content - properly typed for newer Contentful SDK
export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogPost'
  fields: {
    title: EntryFieldTypes.Text
    slug: EntryFieldTypes.Symbol
    excerpt: EntryFieldTypes.Text
    content: Document
    featuredImage?: Asset
    author: EntryFieldTypes.Symbol
    publishDate: EntryFieldTypes.Date
    tags?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    metaDescription?: EntryFieldTypes.Text
    readingTime?: EntryFieldTypes.Number
    featured?: EntryFieldTypes.Boolean
  }
}

// Type alias for BlogPost
export type BlogPost = Entry<BlogPostSkeleton, undefined, string>

export interface AuthorSkeleton extends EntrySkeletonType {
  contentTypeId: 'author'
  fields: {
    name: EntryFieldTypes.Symbol
    bio?: EntryFieldTypes.Text
    avatar?: Asset
    socialLinks?: EntryFieldTypes.Object
  }
}

export type Author = Entry<AuthorSkeleton, undefined, string>

// Helper type to extract field types for easier usage
export type BlogPostFields = BlogPostSkeleton['fields']
export type AuthorFields = AuthorSkeleton['fields']

// Helper function to extract value from potentially localized field
function extractLocalizedValue(field: any): any {
  if (!field) return null
  
  // If it's not an object or has a direct value property, return as-is
  if (typeof field !== 'object' || field.nodeType || Array.isArray(field)) {
    return field
  }
  
  // Check if it's a localized field (has locale keys)
  const keys = Object.keys(field)
  if (keys.length > 0 && !field.url && !field.sys) {
    // Looks like a localized field, return the first locale's value
    // In production, you might want to specify a default locale
    return field[keys[0]]
  }
  
  return field
}

// Helper function to safely access asset URL
export function getAssetUrl(asset: Asset | undefined, options?: { w?: number; h?: number; fit?: string }): string | null {
  if (!asset?.fields?.file) return null
  
  let fileData = asset.fields.file
  
  // Handle localized file field
  if (typeof fileData === 'object' && !fileData.url) {
    // It's a localized object, get the first locale
    const locales = Object.keys(fileData)
    if (locales.length > 0 && fileData[locales[0]]) {
      fileData = fileData[locales[0]]
    } else {
      return null
    }
  }
  
  if (!fileData?.url) return null
  
  const baseUrl = `https:${fileData.url}`
  
  if (options) {
    const params = new URLSearchParams()
    if (options.w) params.set('w', options.w.toString())
    if (options.h) params.set('h', options.h.toString())
    if (options.fit) params.set('fit', options.fit)
    
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }
  
  return baseUrl
}

// Helper function to safely get asset title/description
export function getAssetTitle(asset: Asset | undefined): string {
  if (!asset?.fields) return ''
  
  // Handle both localized and non-localized fields
  const title = asset.fields.title
  const description = asset.fields.description
  
  // If title exists
  if (title) {
    if (typeof title === 'string') return title
    if (typeof title === 'object') {
      // Get the first available locale value
      const locales = Object.keys(title)
      if (locales.length > 0 && title[locales[0]]) {
        return title[locales[0]] || ''
      }
    }
  }
  
  // If description exists
  if (description) {
    if (typeof description === 'string') return description
    if (typeof description === 'object') {
      // Get the first available locale value
      const locales = Object.keys(description)
      if (locales.length > 0 && description[locales[0]]) {
        return description[locales[0]] || ''
      }
    }
  }
  
  return ''
}

// Utility function to safely convert Contentful field types to strings
export function toStringValue(value: any): string {
  if (value == null) return ''
  
  // Extract from localized field if needed
  const extractedValue = extractLocalizedValue(value)
  
  if (extractedValue == null) return ''
  if (typeof extractedValue === 'string') return extractedValue
  if (typeof extractedValue === 'object' && extractedValue.toString) return extractedValue.toString()
  return String(extractedValue)
}

// Utility function to safely convert Contentful arrays to string arrays
export function toStringArray(value: any): string[] {
  if (!value) return []
  
  // Extract from localized field if needed
  const extractedValue = extractLocalizedValue(value)
  
  if (!Array.isArray(extractedValue)) return []
  return extractedValue.map(toStringValue).filter(Boolean)
}

// Type guard to check if an entry is a valid blog post
export function isValidBlogPost(entry: any): entry is BlogPost {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    typeof entry.fields === 'object' &&
    entry.fields.title &&
    entry.fields.slug &&
    entry.fields.content &&
    entry.fields.author &&
    entry.fields.publishDate &&
    // Validate that content is a proper rich text document
    entry.fields.content.nodeType === 'document' &&
    Array.isArray(entry.fields.content.content)
  )
}

// Helper function to validate rich text content
export function isValidDocument(content: any): content is Document {
  return (
    content &&
    typeof content === 'object' &&
    content.nodeType === 'document' &&
    Array.isArray(content.content) &&
    content.data !== undefined
  )
}

// Helper function to safely handle Contentful API calls
async function safeContentfulCall<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    
    // In development, you might want to throw the error to see what's wrong
    if (process.env.NODE_ENV === 'development') {
      console.error('Contentful Error Details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
    
    return fallback
  }
}

// Get blog posts with pagination and sorting
export async function getBlogPosts(limit: number = 10, skip: number = 0): Promise<BlogPost[]> {
  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        limit: Math.min(limit, 1000), // Contentful max limit
        skip,
        order: ['-fields.publishDate'],
        include: 2, // Include linked entries
      })
      
      // Filter and validate entries
      return response.items.filter(isValidBlogPost)
    },
    [],
    'Error fetching blog posts'
  )
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug || typeof slug !== 'string') {
    console.error('Invalid slug provided to getBlogPostBySlug:', slug)
    return null
  }

  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        'fields.slug': slug,
        limit: 1,
        include: 2,
      })
      
      const entry = response.items[0]
      
      // Validate the entry using our type guard
      if (!isValidBlogPost(entry)) {
        console.warn(`Blog post with slug "${slug}" is not valid or missing required fields`)
        return null
      }
      
      return entry
    },
    null,
    `Error fetching blog post with slug: ${slug}`
  )
}

// Get featured blog posts
export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        'fields.featured': true,
        limit: Math.min(limit, 100),
        order: ['-fields.publishDate'],
        include: 2,
      })
      
      return response.items.filter(isValidBlogPost)
    },
    [],
    'Error fetching featured blog posts'
  )
}

// Get blog posts by tag
export async function getBlogPostsByTag(tag: string, limit: number = 10): Promise<BlogPost[]> {
  if (!tag || typeof tag !== 'string') {
    console.error('Invalid tag provided to getBlogPostsByTag:', tag)
    return []
  }

  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        'fields.tags[in]': tag,
        limit: Math.min(limit, 1000),
        order: ['-fields.publishDate'],
        include: 2,
      })
      
      return response.items.filter(isValidBlogPost)
    },
    [],
    `Error fetching blog posts by tag: ${tag}`
  )
}

// Search blog posts
export async function searchBlogPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return []
  }

  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        query: query.trim(),
        limit: Math.min(limit, 1000),
        order: ['-fields.publishDate'],
        include: 2,
      })
      
      return response.items.filter(isValidBlogPost)
    },
    [],
    `Error searching blog posts with query: ${query}`
  )
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        limit: 1000, // Get all posts to extract tags
        select: ['fields.tags'],
      })
      
      const allTags = response.items
        .filter(item => item.fields && Array.isArray(item.fields.tags))
        .flatMap(item => toStringArray(item.fields.tags))
        .filter(Boolean)
        .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
        .sort()
      
      return allTags
    },
    [],
    'Error fetching tags'
  )
}

// Get total count of blog posts (useful for pagination)
export async function getBlogPostsCount(): Promise<number> {
  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        limit: 0, // Don't return items, just count
      })
      
      return response.total
    },
    0,
    'Error fetching blog posts count'
  )
}

// Get recent blog posts for RSS/sitemap
export async function getRecentBlogPosts(limit: number = 50): Promise<BlogPost[]> {
  return safeContentfulCall(
    async () => {
      const response = await contentfulClient.getEntries<BlogPostSkeleton>({
        content_type: 'blogPost',
        limit: Math.min(limit, 1000),
        order: ['-fields.publishDate'],
        select: ['fields.title', 'fields.slug', 'fields.excerpt', 'fields.publishDate', 'fields.author'],
      })
      
      return response.items.filter(isValidBlogPost)
    },
    [],
    'Error fetching recent blog posts'
  )
}