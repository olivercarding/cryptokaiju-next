// src/lib/contentful.ts
import { createClient } from 'contentful'
import type { Entry, Asset, EntryFieldTypes } from 'contentful'

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

// TypeScript interfaces for blog content - properly typed
export interface BlogPostFields {
  title: EntryFieldTypes.Text
  slug: EntryFieldTypes.Text
  excerpt: EntryFieldTypes.Text
  content: EntryFieldTypes.RichText
  featuredImage?: Asset
  author: EntryFieldTypes.Text
  publishDate: EntryFieldTypes.Date
  tags?: EntryFieldTypes.Array<EntryFieldTypes.Text>
  metaDescription?: EntryFieldTypes.Text
  readingTime?: EntryFieldTypes.Number
  featured?: EntryFieldTypes.Boolean
}

// Properly extend Entry with our fields
export interface BlogPost extends Entry<BlogPostFields, undefined, string> {
  fields: BlogPostFields
}

export interface AuthorFields {
  name: EntryFieldTypes.Text
  bio?: EntryFieldTypes.Text
  avatar?: Asset
  socialLinks?: EntryFieldTypes.Object
}

export interface Author extends Entry<AuthorFields, undefined, string> {
  fields: AuthorFields
}

// Type guard to check if an entry is a valid blog post
export function isValidBlogPost(entry: any): entry is BlogPost {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    typeof entry.fields === 'object' &&
    typeof entry.fields.title === 'string' &&
    typeof entry.fields.slug === 'string' &&
    typeof entry.fields.content === 'object' &&
    typeof entry.fields.author === 'string' &&
    typeof entry.fields.publishDate === 'string'
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
        content_type: 'blogPost',
        limit: 1000, // Get all posts to extract tags
        select: ['fields.tags'],
      })
      
      const allTags = response.items
        .filter(item => item.fields && Array.isArray(item.fields.tags))
        .flatMap(item => item.fields.tags || [])
        .filter((tag): tag is string => Boolean(tag && typeof tag === 'string'))
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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
      const response = await contentfulClient.getEntries<BlogPostFields>({
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