// src/lib/contentful.ts
import { createClient } from 'contentful'
import type { Entry, Asset, EntryFieldTypes } from 'contentful'

if (!process.env.CONTENTFUL_SPACE_ID) {
  throw new Error('CONTENTFUL_SPACE_ID is required')
}

if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
  throw new Error('CONTENTFUL_ACCESS_TOKEN is required')
}

// Create the Contentful client
export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  // Use preview API for draft content
  host: process.env.CONTENTFUL_PREVIEW === 'true' ? 'preview.contentful.com' : 'cdn.contentful.com',
})

// TypeScript interfaces for your blog content using Contentful's type system
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

export interface BlogPost extends Entry<BlogPostFields> {}

export interface AuthorFields {
  name: EntryFieldTypes.Text
  bio?: EntryFieldTypes.Text
  avatar?: Asset
  socialLinks?: EntryFieldTypes.Object
}

export interface Author extends Entry<AuthorFields> {}

// Helper function to get blog posts
export async function getBlogPosts(limit: number = 10, skip: number = 0): Promise<BlogPost[]> {
  try {
    const response = await contentfulClient.getEntries<BlogPostFields>({
      content_type: 'blogPost',
      limit,
      skip,
      order: ['-fields.publishDate'],
      include: 2, // Include linked entries
    })
    
    return response.items
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

// Helper function to get a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await contentfulClient.getEntries<BlogPostFields>({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
      include: 2,
    })
    
    return response.items[0] || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

// Helper function to get featured blog posts
export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  try {
    const response = await contentfulClient.getEntries<BlogPostFields>({
      content_type: 'blogPost',
      'fields.featured': true,
      limit,
      order: ['-fields.publishDate'],
      include: 2,
    })
    
    return response.items
  } catch (error) {
    console.error('Error fetching featured blog posts:', error)
    return []
  }
}

// Helper function to get blog posts by tag
export async function getBlogPostsByTag(tag: string, limit: number = 10): Promise<BlogPost[]> {
  try {
    const response = await contentfulClient.getEntries<BlogPostFields>({
      content_type: 'blogPost',
      'fields.tags[in]': tag,
      limit,
      order: ['-fields.publishDate'],
      include: 2,
    })
    
    return response.items
  } catch (error) {
    console.error('Error fetching blog posts by tag:', error)
    return []
  }
}

// Helper function to search blog posts
export async function searchBlogPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
  try {
    const response = await contentfulClient.getEntries<BlogPostFields>({
      content_type: 'blogPost',
      query,
      limit,
      order: ['-fields.publishDate'],
      include: 2,
    })
    
    return response.items
  } catch (error) {
    console.error('Error searching blog posts:', error)
    return []
  }
}

// Helper function to get all unique tags
export async function getAllTags(): Promise<string[]> {
  try {
    const response = await contentfulClient.getEntries<BlogPostFields>({
      content_type: 'blogPost',
      limit: 1000, // Get all posts to extract tags
      select: ['fields.tags'],
    })
    
    const allTags = response.items
      .flatMap(item => item.fields.tags || [])
      .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
      .sort()
    
    return allTags
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}