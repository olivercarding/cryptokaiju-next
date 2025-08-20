// src/lib/contentful.ts - UPDATED FOR COMPLETE KAIJU BATCH SCHEMA
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

// UPDATED: Complete Kaiju Batch Content Model matching your schema
export interface KaijuBatchSkeleton extends EntrySkeletonType {
  contentTypeId: 'kaijuBatch'
  fields: {
    // Core identification
    batchId: EntryFieldTypes.Symbol
    slug: EntryFieldTypes.Symbol
    name: EntryFieldTypes.Symbol
    type: EntryFieldTypes.Symbol // 'Plush' | 'Vinyl'
    rarity: EntryFieldTypes.Symbol // 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
    essence: EntryFieldTypes.Symbol
    availability: EntryFieldTypes.Symbol // 'Secondary' | 'Mintable'
    colors: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    
    // Descriptions
    characterDescription: EntryFieldTypes.Text
    physicalDescription: EntryFieldTypes.Text
    
    // Supply and discovery
    estimatedSupply: EntryFieldTypes.Integer
    discoveredDate: EntryFieldTypes.Date
    
    // Optional details
    habitat?: EntryFieldTypes.Symbol
    materials?: EntryFieldTypes.Text
    dimensions?: EntryFieldTypes.Symbol
    features?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    packagingStyle?: EntryFieldTypes.Symbol
    productionNotes?: EntryFieldTypes.Text
    secondaryMarketUrl?: EntryFieldTypes.Symbol
    backgroundColor?: EntryFieldTypes.Symbol
    
    // Image arrays
    physicalImages: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    nftImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    lifestyleImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    detailImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    conceptImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    packagingImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    
    // SEO fields
    seoTitle?: EntryFieldTypes.Symbol
    seoDescription?: EntryFieldTypes.Text
    seoKeywords?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    
    // Open Graph fields
    openGraphTitle?: EntryFieldTypes.Symbol
    openGraphDescription?: EntryFieldTypes.Text
    openGraphImage?: EntryFieldTypes.AssetLink | any
    
    // Twitter fields
    twitterTitle?: EntryFieldTypes.Symbol
    twitterDescription?: EntryFieldTypes.Text
    
    // Product information
    productPrice?: EntryFieldTypes.Number
    productCurrency?: EntryFieldTypes.Symbol // 'ETH' | 'USD' | 'EUR' | 'GBP'
    productCondition?: EntryFieldTypes.Symbol // 'New' | 'Used' | 'Refurbished'
    productAvailability?: EntryFieldTypes.Symbol // 'InStock' | 'OutOfStock' | 'PreOrder'
    productBrand?: EntryFieldTypes.Symbol
    productGtin?: EntryFieldTypes.Symbol
    productMpn?: EntryFieldTypes.Symbol
    productManufacturer?: EntryFieldTypes.Symbol
    
    // Marketing and featured content
    featured?: EntryFieldTypes.Boolean
    featuredPriority?: EntryFieldTypes.Integer
    marketingTagline?: EntryFieldTypes.Symbol
    collectorsNote?: EntryFieldTypes.Text
    
    // Series information
    isPartOfSeries?: EntryFieldTypes.Boolean
    seriesName?: EntryFieldTypes.Symbol
    seriesDescription?: EntryFieldTypes.Text
    seriesPosition?: EntryFieldTypes.Integer
  }
}

// Type exports
export type ImageGallery = Entry<ImageGallerySkeleton, undefined, string>
export type ProductShowcase = Entry<ProductShowcaseSkeleton, undefined, string>
export type VideoEmbed = Entry<VideoEmbedSkeleton, undefined, string>
export type SocialEmbed = Entry<SocialEmbedSkeleton, undefined, string>
export type BlogPost = Entry<BlogPostSkeleton, undefined, string>
export type Author = Entry<AuthorSkeleton, undefined, string>
export type KaijuBatch = Entry<KaijuBatchSkeleton, undefined, string>

// Field types
export type BlogPostFields = BlogPostSkeleton['fields']
export type AuthorFields = AuthorSkeleton['fields']
export type ImageGalleryFields = ImageGallerySkeleton['fields']
export type ProductShowcaseFields = ProductShowcaseSkeleton['fields']
export type VideoEmbedFields = VideoEmbedSkeleton['fields']
export type SocialEmbedFields = SocialEmbedSkeleton['fields']
export type KaijuBatchFields = KaijuBatchSkeleton['fields']

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

export function toNumberValue(value: any): number {
  if (value == null) return 0
  const extracted = extractLocalizedValue(value)
  if (typeof extracted === 'number') return extracted
  const parsed = Number(extracted)
  return isNaN(parsed) ? 0 : parsed
}

export function toBooleanValue(value: any): boolean {
  if (value == null) return false
  const extracted = extractLocalizedValue(value)
  return Boolean(extracted)
}

export function toDateString(value: any): string {
  if (!value) return ''
  const extracted = extractLocalizedValue(value)
  if (extracted instanceof Date) {
    return extracted.toISOString().split('T')[0]
  }
  if (typeof extracted === 'string') {
    const date = new Date(extracted)
    return isNaN(date.getTime()) ? extracted : date.toISOString().split('T')[0]
  }
  return String(extracted)
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

// UPDATED: Enhanced Kaiju Batch type guard for new schema
export function isValidKaijuBatch(entry: any): entry is KaijuBatch {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.fields &&
    entry.fields.batchId &&
    entry.fields.slug &&
    entry.fields.name &&
    entry.fields.type &&
    entry.fields.rarity &&
    entry.fields.characterDescription &&
    entry.fields.physicalDescription &&
    entry.fields.physicalImages &&
    Array.isArray(extractLocalizedValue(entry.fields.physicalImages)) &&
    typeof entry.fields.estimatedSupply === 'number' &&
    entry.fields.discoveredDate
  )
}

/* ------------------------------------------------------------------ */
/*  Local Kaiju Batch Interface (UPDATED FOR COMPLETE SCHEMA)        */
/* ------------------------------------------------------------------ */

export interface LocalKaijuBatch {
  // Core identification
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  essence: string
  availability: 'Secondary' | 'Mintable'
  colors: string[]
  
  // Descriptions
  characterDescription: string  
  physicalDescription: string   
  
  // Images - Enhanced structure
  images: {
    physical: string[]        
    nft: string[]            // Now always an array for consistency
    lifestyle: string[]      
    detail: string[]         
    concept: string[]        
    packaging: string[]      
  }
  
  // Supply and discovery
  estimatedSupply: number
  discoveredDate: string
  
  // Optional details
  habitat?: string
  materials?: string           
  dimensions?: string         
  features?: string[]         
  packagingStyle?: string     
  productionNotes?: string
  secondaryMarketUrl?: string
  backgroundColor?: string
  
  // SEO fields
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  
  // Open Graph fields
  openGraph?: {
    title?: string
    description?: string
    image?: string
  }
  
  // Twitter fields
  twitter?: {
    title?: string
    description?: string
  }
  
  // Product information
  product?: {
    price?: number
    currency?: 'ETH' | 'USD' | 'EUR' | 'GBP'
    condition?: 'New' | 'Used' | 'Refurbished'
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
    brand?: string
    gtin?: string
    mpn?: string
    manufacturer?: string
  }
  
  // Marketing and featured content
  marketing?: {
    featured?: boolean
    featuredPriority?: number
    tagline?: string
    collectorsNote?: string
  }
  
  // Series information
  series?: {
    isPartOfSeries?: boolean
    name?: string
    description?: string
    position?: number
  }
}

/**
 * UPDATED: Convert Contentful KaijuBatch to LocalKaijuBatch interface
 * Now supports all new schema fields
 */
export function convertContentfulBatchToLocal(batch: KaijuBatch): LocalKaijuBatch {
  const fields = batch.fields
  
  // Enhanced NFT image handling - always return array for consistency
  const getNftImages = (): string[] => {
    if (fields.nftImages) {
      return toAssetArray(fields.nftImages)
        .map(asset => getAssetUrl(asset))
        .filter(Boolean) as string[]
    }
    return []
  }
  
  return {
    // Core identification
    id: toStringValue(fields.batchId),
    slug: toStringValue(fields.slug),
    name: toStringValue(fields.name),
    type: toStringValue(fields.type) as 'Plush' | 'Vinyl',
    rarity: toStringValue(fields.rarity) as 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary',
    essence: toStringValue(fields.essence),
    availability: toStringValue(fields.availability) as 'Secondary' | 'Mintable',
    colors: toStringArray(fields.colors),
    
    // Descriptions
    characterDescription: toStringValue(fields.characterDescription),
    physicalDescription: toStringValue(fields.physicalDescription),
    
    // Images - Enhanced structure
    images: {
      physical: toAssetArray(fields.physicalImages).map(asset => getAssetUrl(asset)).filter(Boolean) as string[],
      nft: getNftImages(),
      lifestyle: toAssetArray(fields.lifestyleImages || []).map(asset => getAssetUrl(asset)).filter(Boolean) as string[],
      detail: toAssetArray(fields.detailImages || []).map(asset => getAssetUrl(asset)).filter(Boolean) as string[],
      concept: toAssetArray(fields.conceptImages || []).map(asset => getAssetUrl(asset)).filter(Boolean) as string[],
      packaging: toAssetArray(fields.packagingImages || []).map(asset => getAssetUrl(asset)).filter(Boolean) as string[],
    },
    
    // Supply and discovery
    estimatedSupply: toNumberValue(fields.estimatedSupply),
    discoveredDate: toDateString(fields.discoveredDate),
    
    // Optional details
    habitat: toStringValue(fields.habitat) || undefined,
    materials: toStringValue(fields.materials) || undefined,
    dimensions: toStringValue(fields.dimensions) || undefined,
    features: toStringArray(fields.features),
    packagingStyle: toStringValue(fields.packagingStyle) || undefined,
    productionNotes: toStringValue(fields.productionNotes) || undefined,
    secondaryMarketUrl: toStringValue(fields.secondaryMarketUrl) || undefined,
    backgroundColor: toStringValue(fields.backgroundColor) || undefined,
    
    // SEO fields
    seo: {
      title: toStringValue(fields.seoTitle) || undefined,
      description: toStringValue(fields.seoDescription) || undefined,
      keywords: toStringArray(fields.seoKeywords),
    },
    
    // Open Graph fields
    openGraph: {
      title: toStringValue(fields.openGraphTitle) || undefined,
      description: toStringValue(fields.openGraphDescription) || undefined,
      image: getAssetUrl(fields.openGraphImage) || undefined,
    },
    
    // Twitter fields
    twitter: {
      title: toStringValue(fields.twitterTitle) || undefined,
      description: toStringValue(fields.twitterDescription) || undefined,
    },
    
    // Product information
    product: {
      price: toNumberValue(fields.productPrice) || undefined,
      currency: toStringValue(fields.productCurrency) as 'ETH' | 'USD' | 'EUR' | 'GBP' || undefined,
      condition: toStringValue(fields.productCondition) as 'New' | 'Used' | 'Refurbished' || undefined,
      availability: toStringValue(fields.productAvailability) as 'InStock' | 'OutOfStock' | 'PreOrder' || undefined,
      brand: toStringValue(fields.productBrand) || undefined,
      gtin: toStringValue(fields.productGtin) || undefined,
      mpn: toStringValue(fields.productMpn) || undefined,
      manufacturer: toStringValue(fields.productManufacturer) || undefined,
    },
    
    // Marketing and featured content
    marketing: {
      featured: toBooleanValue(fields.featured),
      featuredPriority: toNumberValue(fields.featuredPriority) || undefined,
      tagline: toStringValue(fields.marketingTagline) || undefined,
      collectorsNote: toStringValue(fields.collectorsNote) || undefined,
    },
    
    // Series information
    series: {
      isPartOfSeries: toBooleanValue(fields.isPartOfSeries),
      name: toStringValue(fields.seriesName) || undefined,
      description: toStringValue(fields.seriesDescription) || undefined,
      position: toNumberValue(fields.seriesPosition) || undefined,
    },
  }
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
/*  Public API - Blog Posts                                          */
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

/* ------------------------------------------------------------------ */
/*  Public API - Kaiju Batches (UPDATED FOR NEW SCHEMA)             */
/* ------------------------------------------------------------------ */

/**
 * Get all Kaiju batches
 */
export async function getAllKaijuBatches(): Promise<KaijuBatch[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        limit: 1000,
        include: 2,
        order: ['fields.batchId']
      })
      return res.items.filter(isValidKaijuBatch)
    },
    [],
    'Error fetching Kaiju batches',
  )
}

/**
 * Get Kaiju batch by slug
 */
export async function getKaijuBatchBySlug(slug: string): Promise<KaijuBatch | null> {
  if (!slug) {
    console.error('Invalid slug for getKaijuBatchBySlug:', slug)
    return null
  }

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.slug': slug,
        limit: 1,
        include: 2,
      })
      const entry = res.items[0]
      return isValidKaijuBatch(entry) ? entry : null
    },
    null,
    `Error fetching Kaiju batch with slug: ${slug}`,
  )
}

/**
 * Get Kaiju batch by ID
 */
export async function getKaijuBatchById(batchId: string): Promise<KaijuBatch | null> {
  if (!batchId) {
    console.error('Invalid batchId for getKaijuBatchById:', batchId)
    return null
  }

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.batchId': batchId,
        limit: 1,
        include: 2,
      })
      const entry = res.items[0]
      return isValidKaijuBatch(entry) ? entry : null
    },
    null,
    `Error fetching Kaiju batch with ID: ${batchId}`,
  )
}

/**
 * Get Kaiju batches by type
 */
export async function getKaijuBatchesByType(type: 'Plush' | 'Vinyl'): Promise<KaijuBatch[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.type': type,
        limit: 1000,
        include: 2,
        order: ['fields.batchId']
      })
      return res.items.filter(isValidKaijuBatch)
    },
    [],
    `Error fetching Kaiju batches by type: ${type}`,
  )
}

/**
 * Get Kaiju batches by rarity
 */
export async function getKaijuBatchesByRarity(rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'): Promise<KaijuBatch[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.rarity': rarity,
        limit: 1000,
        include: 2,
        order: ['fields.batchId']
      })
      return res.items.filter(isValidKaijuBatch)
    },
    [],
    `Error fetching Kaiju batches by rarity: ${rarity}`,
  )
}

/**
 * Get featured Kaiju batches
 */
export async function getFeaturedKaijuBatches(limit = 10): Promise<KaijuBatch[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.featured': true,
        limit: Math.min(limit, 1000),
        include: 2,
        order: ['-fields.featuredPriority', 'fields.batchId']
      })
      return res.items.filter(isValidKaijuBatch)
    },
    [],
    'Error fetching featured Kaiju batches',
  )
}

/**
 * Get Kaiju batches by series
 */
export async function getKaijuBatchesBySeries(seriesName: string): Promise<KaijuBatch[]> {
  if (!seriesName) {
    console.error('Invalid seriesName for getKaijuBatchesBySeries:', seriesName)
    return []
  }

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.isPartOfSeries': true,
        'fields.seriesName': seriesName,
        limit: 1000,
        include: 2,
        order: ['fields.seriesPosition', 'fields.batchId']
      })
      return res.items.filter(isValidKaijuBatch)
    },
    [],
    `Error fetching Kaiju batches by series: ${seriesName}`,
  )
}