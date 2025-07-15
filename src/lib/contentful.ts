// src/lib/contentful.ts
import type {
  Asset,
  AssetFile,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
} from 'contentful'
import type { Document } from '@contentful/rich-text-types'

/* ------------------------------------------------------------------ */
/*  Environment setup                                                 */
/* ------------------------------------------------------------------ */

// Only create client on server side using dynamic import
let contentfulClient: any = null

async function getContentfulClient() {
  if (typeof window !== 'undefined') {
    // On client side, return null
    return null
  }

  if (!contentfulClient) {
    if (!process.env.CONTENTFUL_SPACE_ID) {
      throw new Error('CONTENTFUL_SPACE_ID environment variable is required')
    }

    if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
      throw new Error('CONTENTFUL_ACCESS_TOKEN environment variable is required')
    }

    // Dynamic import to avoid including contentful in client bundle
    const { createClient } = await import('contentful')
    
    contentfulClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      host:
        process.env.CONTENTFUL_PREVIEW === 'true'
          ? 'preview.contentful.com'
          : 'cdn.contentful.com',
    })
  }

  return contentfulClient
}

/* ------------------------------------------------------------------ */
/*  Content models - FIXED: Updated content type ID                  */
/* ------------------------------------------------------------------ */

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogpost' // Changed from 'blogPost' to 'blogpost'
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

export type BlogPostFields = BlogPostSkeleton['fields']
export type AuthorFields = AuthorSkeleton['fields']

/* ------------------------------------------------------------------ */
/*  Localisation helpers                                              */
/* ------------------------------------------------------------------ */

type LocalizedAssetFile = { [locale: string]: AssetFile | undefined }

function isLocalizedFile(
  file: AssetFile | LocalizedAssetFile,
): file is LocalizedAssetFile {
  return typeof file === 'object' && file && !('url' in file)
}

function unwrapLocalizedFile(
  file: AssetFile | LocalizedAssetFile,
): AssetFile | undefined {
  if (isLocalizedFile(file)) {
    const firstLocale = Object.keys(file)[0]
    return file[firstLocale]
  }
  return file
}

function extractLocalizedValue(field: any): any {
  if (!field) return null

  if (
    typeof field !== 'object' ||
    field.nodeType ||
    Array.isArray(field)
  ) {
    return field
  }

  /* Field looks like { "en US": value } */
  const keys = Object.keys(field)
  if (keys.length > 0 && !field.url && !field.sys) {
    return field[keys[0]]
  }

  return field
}

/* ------------------------------------------------------------------ */
/*  Asset helpers                                                     */
/* ------------------------------------------------------------------ */

export function getAssetUrl(
  asset: Asset | undefined,
  options?: { w?: number; h?: number; fit?: string },
): string | null {
  if (!asset?.fields?.file) return null

  const fileData = unwrapLocalizedFile(asset.fields.file)
  if (!fileData?.url) return null

  const baseUrl = `https:${fileData.url}`

  if (options) {
    const params = new URLSearchParams()
    if (options.w) params.set('w', options.w.toString())
    if (options.h) params.set('h', options.h.toString())
    if (options.fit) params.set('fit', options.fit)
    const query = params.toString()
    return query ? `${baseUrl}?${query}` : baseUrl
  }

  return baseUrl
}

export function getAssetTitle(asset: Asset | undefined): string {
  if (!asset?.fields) return ''

  const pick = (field: any): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    if (typeof field === 'object') {
      const firstLocale = Object.keys(field)[0]
      return field[firstLocale] || ''
    }
    return ''
  }

  return pick(asset.fields.title) || pick(asset.fields.description)
}

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                   */
/* ------------------------------------------------------------------ */

export function toStringValue(value: any): string {
  if (value == null) return ''
  const extracted = extractLocalizedValue(value)
  if (extracted == null) return ''
  if (typeof extracted === 'string') return extracted
  if (typeof extracted === 'object' && extracted.toString)
    return extracted.toString()
  return String(extracted)
}

export function toStringArray(value: any): string[] {
  if (!value) return []
  const extracted = extractLocalizedValue(value)
  if (!Array.isArray(extracted)) return []
  return extracted.map(toStringValue).filter(Boolean)
}

/* ------------------------------------------------------------------ */
/*  Type guards                                                       */
/* ------------------------------------------------------------------ */

export function isValidBlogPost(entry: any): entry is BlogPost {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.title &&
    entry.fields.slug &&
    entry.fields.excerpt &&
    // Only validate content structure if content exists (it's optional)
    (!entry.fields.content || (
      entry.fields.content.nodeType === 'document' &&
      Array.isArray(entry.fields.content.content)
    ))
  )
}

export function isValidDocument(content: any): content is Document {
  return (
    content &&
    typeof content === 'object' &&
    content.nodeType === 'document' &&
    Array.isArray(content.content) &&
    content.data !== undefined
  )
}

/* ------------------------------------------------------------------ */
/*  Internal helper                                                   */
/* ------------------------------------------------------------------ */

function sortPostsNewestFirst(items: BlogPost[]): BlogPost[] {
  return items.sort(
    (a, b) =>
      new Date(b.fields.publishDate).getTime() -
      new Date(a.fields.publishDate).getTime(),
  )
}

async function safeContentfulCall<T>(
  operation: (client: any) => Promise<T>,
  fallback: T,
  message: string,
): Promise<T> {
  try {
    const client = await getContentfulClient()
    
    // Return fallback immediately if on client side or no client
    if (!client) {
      return fallback
    }

    return await operation(client)
  } catch (error) {
    console.error(`${message}:`, error)

    if (process.env.NODE_ENV === 'development') {
      console.error('Contentful error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
    }

    return fallback
  }
}

/* ------------------------------------------------------------------ */
/*  Public API - FIXED: Updated all content_type references          */
/* ------------------------------------------------------------------ */

export async function getBlogPosts(
  limit = 10,
  skip = 0,
): Promise<BlogPost[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        limit: Math.min(limit, 1000),
        skip,
        include: 2,
      })
      return sortPostsNewestFirst(res.items.filter(isValidBlogPost))
    },
    [],
    'Error fetching blog posts',
  )
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  if (!slug) {
    console.error('Invalid slug for getBlogPostBySlug:', slug)
    return null
  }

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        'fields.slug': slug,
        limit: 1,
        include: 2,
      })
      const entry = res.items[0]
      return isValidBlogPost(entry) ? entry : null
    },
    null,
    `Error fetching blog post with slug: ${slug}`,
  )
}

export async function getFeaturedBlogPosts(
  limit = 3,
): Promise<BlogPost[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        'fields.featured': true,
        limit: Math.min(limit, 100),
        include: 2,
      })
      return sortPostsNewestFirst(res.items.filter(isValidBlogPost))
    },
    [],
    'Error fetching featured posts',
  )
}

export async function getBlogPostsByTag(
  tag: string,
  limit = 10,
): Promise<BlogPost[]> {
  if (!tag) {
    console.error('Invalid tag for getBlogPostsByTag:', tag)
    return []
  }

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        'fields.tags[in]': [tag],
        limit: Math.min(limit, 1000),
        include: 2,
      })
      return sortPostsNewestFirst(res.items.filter(isValidBlogPost))
    },
    [],
    `Error fetching posts by tag: ${tag}`,
  )
}

export async function searchBlogPosts(
  query: string,
  limit = 10,
): Promise<BlogPost[]> {
  if (!query.trim()) return []

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        query: query.trim(),
        limit: Math.min(limit, 1000),
        include: 2,
      })
      return sortPostsNewestFirst(res.items.filter(isValidBlogPost))
    },
    [],
    `Error searching posts with query: ${query}`,
  )
}

export async function getAllTags(): Promise<string[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        limit: 1000,
        select: ['fields.tags'],
      })
      const tags = res.items
        .filter((item: any) => item && item.fields && item.fields.tags)
        .flatMap((item: any) => toStringArray(item.fields.tags))
        .filter(Boolean)
        .filter((t, idx, arr) => arr.indexOf(t) === idx)
        .sort()
      return tags
    },
    [],
    'Error fetching tags',
  )
}

export async function getBlogPostsCount(): Promise<number> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        limit: 0,
      })
      return res.total
    },
    0,
    'Error fetching post count',
  )
}

export async function getRecentBlogPosts(
  limit = 50,
): Promise<BlogPost[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'blogpost',
        limit: Math.min(limit, 1000),
        select: [
          'fields.title',
          'fields.slug',
          'fields.excerpt',
          'fields.publishDate',
          'fields.author',
        ],
      })
      return sortPostsNewestFirst(res.items.filter(isValidBlogPost))
    },
    [],
    'Error fetching recent posts',
  )
}