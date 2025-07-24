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
/*  Content models                                                    */
/* ------------------------------------------------------------------ */

export interface ImageGallerySkeleton extends EntrySkeletonType {
  contentTypeId: 'imageGallery'
  fields: {
    title: EntryFieldTypes.Text
    galleryStyle: EntryFieldTypes.Symbol // 'two-column' | 'grid' | 'carousel' | 'masonry'
    images: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    captions?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
  }
}

export interface ProductShowcaseSkeleton extends EntrySkeletonType {
  contentTypeId: 'productShowcase'
  fields: {
    name: EntryFieldTypes.Text
    description: EntryFieldTypes.Text
    image: EntryFieldTypes.AssetLink | any
    price?: EntryFieldTypes.Text
    mintPrice?: EntryFieldTypes.Text
    status: EntryFieldTypes.Symbol // 'available' | 'sold-out' | 'coming-soon' | 'minting'
    mintUrl?: EntryFieldTypes.Symbol
    collectionName?: EntryFieldTypes.Symbol
    rarity?: EntryFieldTypes.Symbol
    edition?: EntryFieldTypes.Text
    specifications?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
  }
}

export interface VideoEmbedSkeleton extends EntrySkeletonType {
  contentTypeId: 'videoEmbed'
  fields: {
    title: EntryFieldTypes.Text
    videoUrl: EntryFieldTypes.Symbol // YouTube, Vimeo, etc.
    thumbnail?: EntryFieldTypes.AssetLink | any
    description?: EntryFieldTypes.Text
    autoplay?: EntryFieldTypes.Boolean
  }
}

export interface SocialEmbedSkeleton extends EntrySkeletonType {
  contentTypeId: 'socialEmbed'
  fields: {
    platform: EntryFieldTypes.Symbol // 'twitter' | 'instagram' | 'discord' | 'tiktok'
    embedUrl: EntryFieldTypes.Symbol
    caption?: EntryFieldTypes.Text
    showCaption?: EntryFieldTypes.Boolean
  }
}

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogpost'
  fields: {
    title: EntryFieldTypes.Text
    slug: EntryFieldTypes.Symbol
    excerpt: EntryFieldTypes.Text
    content: Document
    featuredImage?: EntryFieldTypes.AssetLink | any
    author: EntryFieldTypes.Symbol
    publishDate: EntryFieldTypes.Date
    tags?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    metaDescription?: EntryFieldTypes.Text
    readingTime?: EntryFieldTypes.Number
    featured?: EntryFieldTypes.Boolean
    // Gallery references (optional, for backward compatibility)
    galleries?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<ImageGallerySkeleton>>
  }
}

export interface AuthorSkeleton extends EntrySkeletonType {
  contentTypeId: 'author'
  fields: {
    name: EntryFieldTypes.Symbol
    bio?: EntryFieldTypes.Text
    avatar?: EntryFieldTypes.AssetLink | any
    socialLinks?: EntryFieldTypes.Object
  }
}

// Type exports
export type ImageGallery = Entry<ImageGallerySkeleton, undefined, string>
export type ProductShowcase = Entry<ProductShowcaseSkeleton, undefined, string>
export type VideoEmbed = Entry<VideoEmbedSkeleton, undefined, string>
export type SocialEmbed = Entry<SocialEmbedSkeleton, undefined, string>
export type BlogPost = Entry<BlogPostSkeleton, undefined, string>
export type Author = Entry<AuthorSkeleton, undefined, string>

// Field types
export type BlogPostFields = BlogPostSkeleton['fields']
export type AuthorFields = AuthorSkeleton['fields']
export type ImageGalleryFields = ImageGallerySkeleton['fields']
export type ProductShowcaseFields = ProductShowcaseSkeleton['fields']
export type VideoEmbedFields = VideoEmbedSkeleton['fields']
export type SocialEmbedFields = SocialEmbedSkeleton['fields']

// Re-export Asset type for use in components
export type { Asset } from 'contentful'

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

// Export for use in other components
export { extractLocalizedValue }

/* ------------------------------------------------------------------ */
/*  Asset helpers                                                     */
/* ------------------------------------------------------------------ */

export function getAssetUrl(
  asset: Asset | EntryFieldTypes.AssetLink | any | undefined,
  options?: { w?: number; h?: number; fit?: string },
): string | null {
  if (!asset) return null
  
  // Handle unresolved links
  if (asset.sys && asset.sys.type === 'Link') {
    return null // Can't get URL from unresolved link
  }
  
  // Handle both Asset and AssetLink types
  const assetFields = asset.fields
  if (!assetFields?.file) return null

  const fileData = unwrapLocalizedFile(assetFields.file)
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

export function getAssetTitle(asset: Asset | EntryFieldTypes.AssetLink | any | undefined): string {
  if (!asset) return ''
  
  // Handle unresolved links
  if (asset.sys && asset.sys.type === 'Link') {
    return '' // Can't get title from unresolved link
  }
  
  if (!asset.fields) return ''

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

export function toAssetArray(value: any): Asset[] {
  if (!value) return []
  const extracted = extractLocalizedValue(value)
  if (!Array.isArray(extracted)) return []
  return extracted.filter(item => {
    // Skip unresolved links
    if (item && item.sys && item.sys.type === 'Link') {
      return false
    }
    // Handle both direct Asset objects and AssetLink references
    if (item && item.fields && item.fields.file) {
      return true // Direct Asset
    }
    if (item && item.sys && item.sys.type === 'Asset' && item.fields && item.fields.file) {
      return true // AssetLink resolved to Asset
    }
    return false
  })
}

/* ------------------------------------------------------------------ */
/*  Type guards                                                       */
/* ------------------------------------------------------------------ */

export function isValidBlogPost(entry: any): entry is BlogPost {
  const isValid = (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.title &&
    entry.fields.slug &&
    entry.fields.excerpt &&
    entry.fields.author &&
    entry.fields.publishDate &&
    // Only validate content structure if content exists (it's optional)
    (!entry.fields.content || (
      entry.fields.content.nodeType === 'document' &&
      Array.isArray(entry.fields.content.content)
    ))
  )
  
  // Debug logging for invalid posts
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.log('Invalid blog post:', {
      hasEntry: !!entry,
      hasFields: !!entry?.fields,
      hasTitle: !!entry?.fields?.title,
      hasSlug: !!entry?.fields?.slug,
      hasExcerpt: !!entry?.fields?.excerpt,
      hasAuthor: !!entry?.fields?.author,
      hasPublishDate: !!entry?.fields?.publishDate,
      entry: entry
    })
  }
  
  return isValid
}

export function isValidImageGallery(entry: any): entry is ImageGallery {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.title &&
    entry.fields.galleryStyle &&
    entry.fields.images &&
    Array.isArray(extractLocalizedValue(entry.fields.images))
  )
}

export function isValidProductShowcase(entry: any): entry is ProductShowcase {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.name &&
    entry.fields.description &&
    entry.fields.status
  )
}

export function isValidVideoEmbed(entry: any): entry is VideoEmbed {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.title &&
    entry.fields.videoUrl
  )
}

export function isValidSocialEmbed(entry: any): entry is SocialEmbed {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.platform &&
    entry.fields.embedUrl
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
/*  Public API                                                        */
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
        include: 3, // Increased to include gallery references
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
        include: 3, // Increased to include gallery references
      })
      const entry = res.items[0]
      return isValidBlogPost(entry) ? entry : null
    },
    null,
    `Error fetching blog post with slug: ${slug}`,
  )
}

export async function getImageGalleryById(
  id: string,
): Promise<ImageGallery | null> {
  if (!id) {
    console.error('Invalid id for getImageGalleryById:', id)
    return null
  }

  return safeContentfulCall(
    async (client) => {
      const entry = await client.getEntry(id, { include: 2 })
      return isValidImageGallery(entry) ? entry : null
    },
    null,
    `Error fetching image gallery with id: ${id}`,
  )
}

export async function getImageGalleries(
  limit = 10,
): Promise<ImageGallery[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'imageGallery',
        limit: Math.min(limit, 1000),
        include: 2,
      })
      return res.items.filter(isValidImageGallery)
    },
    [],
    'Error fetching image galleries',
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
        include: 3,
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
        include: 3,
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
        include: 3,
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
        .filter((t: any, idx: number, arr: any[]) => arr.indexOf(t) === idx)
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