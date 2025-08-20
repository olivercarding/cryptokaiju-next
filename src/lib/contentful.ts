// src/lib/contentful.ts - COMPLETE UPDATE WITH SEO FIELDS
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

// 🆕 UPDATED: Enhanced Kaiju Batch Content Model with ALL SEO fields
export interface KaijuBatchSkeleton extends EntrySkeletonType {
  contentTypeId: 'kaijuBatch'
  fields: {
    batchId: EntryFieldTypes.Text
    slug: EntryFieldTypes.Symbol
    name: EntryFieldTypes.Text
    type: EntryFieldTypes.Symbol // 'Plush' | 'Vinyl'
    rarity: EntryFieldTypes.Symbol // 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
    essence: EntryFieldTypes.Text
    availability: EntryFieldTypes.Symbol // 'Secondary' | 'Mintable'
    colors?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    characterDescription: EntryFieldTypes.Text
    physicalDescription: EntryFieldTypes.Text
    habitat?: EntryFieldTypes.Text
    materials?: EntryFieldTypes.Text
    dimensions?: EntryFieldTypes.Text
    features?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    packagingStyle?: EntryFieldTypes.Text
    productionNotes?: EntryFieldTypes.Text
    estimatedSupply: EntryFieldTypes.Number
    discoveredDate: EntryFieldTypes.Symbol
    secondaryMarketUrl?: EntryFieldTypes.Symbol
    backgroundColor?: EntryFieldTypes.Symbol
    
    // Image fields - Enhanced to support multiple NFT images
    physicalImages: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    
    // 🆕 NEW: Multiple NFT images support
    nftImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    
    // DEPRECATED: Single NFT image (kept for backward compatibility)
    nftImage?: EntryFieldTypes.AssetLink | any
    
    lifestyleImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    detailImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    conceptImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    packagingImages?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink | any>
    
    // 🆕 NEW: SEO FIELDS
    seoTitle?: EntryFieldTypes.Symbol
    seoDescription?: EntryFieldTypes.Text
    seoKeywords?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
    openGraphTitle?: EntryFieldTypes.Symbol
    openGraphDescription?: EntryFieldTypes.Text
    openGraphImage?: EntryFieldTypes.AssetLink | any
    twitterTitle?: EntryFieldTypes.Symbol
    twitterDescription?: EntryFieldTypes.Text
    
    // 🆕 NEW: Additional product/marketing fields
    featured?: EntryFieldTypes.Boolean
    productManufacturer?: EntryFieldTypes.Symbol
    productPrice?: EntryFieldTypes.Number
    productCurrency?: EntryFieldTypes.Symbol
    productCondition?: EntryFieldTypes.Symbol
    productAvailability?: EntryFieldTypes.Symbol
    productBrand?: EntryFieldTypes.Symbol
    productGtin?: EntryFieldTypes.Symbol
    productMpn?: EntryFieldTypes.Symbol
    marketingTagline?: EntryFieldTypes.Symbol
    collectorsNote?: EntryFieldTypes.Text
    featuredPriority?: EntryFieldTypes.Number
    isPartOfSeries?: EntryFieldTypes.Boolean
    seriesName?: EntryFieldTypes.Symbol
    seriesDescription?: EntryFieldTypes.Text
    seriesPosition?: EntryFieldTypes.Number
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

// Enhanced Kaiju Batch type guard
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
    typeof entry.fields.estimatedSupply === 'number' &&
    entry.fields.discoveredDate
  )
}

/* ------------------------------------------------------------------ */
/*  Local Kaiju Batch Interface (Enhanced for SEO and multiple NFT)  */
/* ------------------------------------------------------------------ */

export interface LocalKaijuBatch {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  essence: string
  availability: 'Secondary' | 'Mintable'
  colors: string[]
  characterDescription: string  
  physicalDescription: string   
  images: {
    physical: string[]        
    nft?: string | string[]  // 🎯 Enhanced to support both single and multiple NFT images
    lifestyle: string[]      
    detail: string[]         
    concept: string[]        
    packaging: string[]      
  }
  habitat?: string
  materials?: string           
  dimensions?: string         
  features?: string[]         
  packagingStyle?: string     
  productionNotes?: string   
  estimatedSupply: number
  discoveredDate: string
  secondaryMarketUrl?: string
  backgroundColor?: string
  
  // 🆕 NEW: SEO FIELDS organized in logical groups
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    openGraph?: {
      title?: string
      description?: string
      image?: string
    }
    twitter?: {
      title?: string
      description?: string
    }
  }
  
  // 🆕 NEW: PRODUCT INFORMATION FIELDS
  featured?: boolean
  productInfo?: {
    manufacturer?: string
    price?: number
    currency?: string
    condition?: string
    availability?: string
    brand?: string
    gtin?: string
    mpn?: string
  }
  
  // 🆕 NEW: MARKETING FIELDS
  marketing?: {
    tagline?: string
    collectorsNote?: string
    featuredPriority?: number
  }
  
  // 🆕 NEW: SERIES FIELDS
  series?: {
    isPartOfSeries?: boolean
    name?: string
    description?: string
    position?: number
  }
}

/**
 * 🆕 ENHANCED: Convert Contentful KaijuBatch to LocalKaijuBatch with full SEO support
 * Enhanced to handle both single and multiple NFT images + all new SEO fields
 */
export function convertContentfulBatchToLocal(batch: KaijuBatch): LocalKaijuBatch {
  const fields = batch.fields
  
  // Enhanced NFT image handling with backward compatibility
  const getNftImages = (): string | string[] | undefined => {
    // Priority: use new nftImages array if available
    if (fields.nftImages) {
      const nftImageUrls = toAssetArray(fields.nftImages)
        .map(asset => getAssetUrl(asset) || '')
        .filter(Boolean)
      
      if (nftImageUrls.length > 0) {
        return nftImageUrls.length === 1 ? nftImageUrls[0] : nftImageUrls
      }
    }
    
    // Fallback: use legacy single nftImage field
    if (fields.nftImage) {
      const singleNftUrl = getAssetUrl(fields.nftImage)
      return singleNftUrl || undefined
    }
    
    return undefined
  }
  
  return {
    id: toStringValue(fields.batchId),
    slug: toStringValue(fields.slug),
    name: toStringValue(fields.name),
    type: toStringValue(fields.type) as 'Plush' | 'Vinyl',
    rarity: toStringValue(fields.rarity) as 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary',
    essence: toStringValue(fields.essence),
    availability: toStringValue(fields.availability) as 'Secondary' | 'Mintable',
    colors: toStringArray(fields.colors),
    
    characterDescription: toStringValue(fields.characterDescription),
    physicalDescription: toStringValue(fields.physicalDescription),
    
    images: {
      physical: toAssetArray(fields.physicalImages).map(asset => getAssetUrl(asset) || '').filter(Boolean),
      nft: getNftImages(), // 🎯 Enhanced with backward compatibility
      lifestyle: toAssetArray(fields.lifestyleImages || []).map(asset => getAssetUrl(asset) || '').filter(Boolean),
      detail: toAssetArray(fields.detailImages || []).map(asset => getAssetUrl(asset) || '').filter(Boolean),
      concept: toAssetArray(fields.conceptImages || []).map(asset => getAssetUrl(asset) || '').filter(Boolean),
      packaging: toAssetArray(fields.packagingImages || []).map(asset => getAssetUrl(asset) || '').filter(Boolean),
    },
    
    habitat: toStringValue(fields.habitat),
    materials: toStringValue(fields.materials),
    dimensions: toStringValue(fields.dimensions),
    features: toStringArray(fields.features),
    packagingStyle: toStringValue(fields.packagingStyle),
    productionNotes: toStringValue(fields.productionNotes),
    
    estimatedSupply: Number(fields.estimatedSupply) || 0,
    discoveredDate: toStringValue(fields.discoveredDate),
    secondaryMarketUrl: toStringValue(fields.secondaryMarketUrl),
    backgroundColor: toStringValue(fields.backgroundColor),
    
    // 🆕 NEW: SEO FIELDS with proper organization
    seo: {
      title: toStringValue(fields.seoTitle),
      description: toStringValue(fields.seoDescription),
      keywords: toStringArray(fields.seoKeywords),
      openGraph: {
        title: toStringValue(fields.openGraphTitle),
        description: toStringValue(fields.openGraphDescription),
        image: getAssetUrl(fields.openGraphImage)
      },
      twitter: {
        title: toStringValue(fields.twitterTitle),
        description: toStringValue(fields.twitterDescription)
      }
    },
    
    // 🆕 NEW: FEATURED STATUS
    featured: fields.featured || false,
    
    // 🆕 NEW: PRODUCT INFORMATION
    productInfo: {
      manufacturer: toStringValue(fields.productManufacturer),
      price: fields.productPrice ? Number(fields.productPrice) : undefined,
      currency: toStringValue(fields.productCurrency),
      condition: toStringValue(fields.productCondition),
      availability: toStringValue(fields.productAvailability),
      brand: toStringValue(fields.productBrand),
      gtin: toStringValue(fields.productGtin),
      mpn: toStringValue(fields.productMpn)
    },
    
    // 🆕 NEW: MARKETING INFORMATION
    marketing: {
      tagline: toStringValue(fields.marketingTagline),
      collectorsNote: toStringValue(fields.collectorsNote),
      featuredPriority: fields.featuredPriority ? Number(fields.featuredPriority) : undefined
    },
    
    // 🆕 NEW: SERIES INFORMATION
    series: {
      isPartOfSeries: fields.isPartOfSeries || false,
      name: toStringValue(fields.seriesName),
      description: toStringValue(fields.seriesDescription),
      position: fields.seriesPosition ? Number(fields.seriesPosition) : undefined
    }
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
/*  Public API - Kaiju Batches (Enhanced with SEO support)           */
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
 * 🆕 NEW: Get featured Kaiju batches for homepage/SEO
 */
export async function getFeaturedKaijuBatches(limit = 6): Promise<KaijuBatch[]> {
  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.featured': true,
        limit: Math.min(limit, 100),
        include: 2,
        order: ['fields.featuredPriority', 'fields.batchId']
      })
      return res.items.filter(isValidKaijuBatch)
    },
    [],
    'Error fetching featured Kaiju batches',
  )
}

/**
 * 🆕 NEW: Get batches by series for related content
 */
export async function getKaijuBatchesBySeries(seriesName: string): Promise<KaijuBatch[]> {
  if (!seriesName) return []

  return safeContentfulCall(
    async (client) => {
      const res = await client.getEntries({
        content_type: 'kaijuBatch',
        'fields.seriesName': seriesName,
        'fields.isPartOfSeries': true,
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