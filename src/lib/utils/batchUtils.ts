// src/lib/utils/batchUtils.ts - FIXED for Rich Text Support
import KaijuBatchService, { type KaijuBatch } from '@/lib/services/KaijuBatchService'
import type { Document } from '@contentful/rich-text-types'

// 🆕 NEW: Helper function to extract plain text from rich text or string
function extractPlainText(content: string | Document): string {
  if (typeof content === 'string') {
    return content
  }
  
  // If it's a Document (rich text), extract plain text from all nodes
  if (content && typeof content === 'object' && content.nodeType === 'document') {
    const extractTextFromNode = (node: any): string => {
      if (!node) return ''
      
      // Handle text nodes
      if (node.nodeType === 'text') {
        return node.value || ''
      }
      
      // Handle other nodes with content
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractTextFromNode).join('')
      }
      
      return ''
    }
    
    return content.content ? content.content.map(extractTextFromNode).join(' ') : ''
  }
  
  return ''
}

/**
 * Enhanced batch name to slug conversion with comprehensive mappings
 */
export function batchNameToSlug(batchName: string): string {
  if (!batchName) return ''
  
  // Comprehensive mappings for blockchain -> Contentful slug conversion
  const batchMappings: Record<string, string> = {
    // Exact matches from blockchain/OpenSea
    'Halloween Celebration': 'halloween-celebration',
    'Spooky Halloween Special': 'spooky',
    'Genesis Kaiju': 'genesis',
    'Genesis': 'genesis',
    'genesis': 'genesis',
    'Mr. Wasabi': 'mr-wasabi',
    'Mr Wasabi': 'mr-wasabi',
    'Dogejira': 'dogejira',
    'CryptoKitty': 'cryptokitty',
    'CryptoKitties': 'cryptokitty',
    'Sushi': 'sushi',
    'SushiSwap': 'sushi',
    'Pretty Fine Plushies': 'pretty-fine-plushies',
    'Jaiantokoin': 'jaiantokoin',
    'URI': 'uri',
    'Spangle': 'spangle',
    'Christmas Special': 'christmas-special',
    'Valentine Special': 'valentine-special',
    'Easter Special': 'easter-special',
    'Diamond Hands': 'diamond-hands',
    
    // Common variations that might appear in NFT metadata
    'Genesis Kaiju Collection': 'genesis',
    'Original Genesis': 'genesis',
    'Genesis Series': 'genesis',
    'Halloween': 'halloween-celebration',
    'Spooky': 'spooky',
    'Halloween 2023': 'halloween-celebration',
    'Mr Wasabi Edition': 'mr-wasabi',
    'Wasabi': 'mr-wasabi',
    'Doge': 'dogejira',
    'CryptoKitties Collaboration': 'cryptokitty',
    'Kitty': 'cryptokitty',
    'SushiSwap Collaboration': 'sushi',
    'Sushi Edition': 'sushi',
    'Plushies': 'pretty-fine-plushies',
    'Fine Plushies': 'pretty-fine-plushies',
  }
  
  // Check if we have a direct mapping (case insensitive)
  const exactMatch = batchMappings[batchName]
  if (exactMatch) {
    return exactMatch
  }
  
  // Check case-insensitive matches
  const lowerCaseMatch = Object.keys(batchMappings).find(
    key => key.toLowerCase() === batchName.toLowerCase()
  )
  if (lowerCaseMatch) {
    return batchMappings[lowerCaseMatch]
  }
  
  // Otherwise, convert to slug format
  return batchName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * UPDATED: Check if a batch page exists using Contentful (async)
 * This is the preferred method for accurate checking
 */
export async function batchPageExists(batchName: string): Promise<boolean> {
  if (!batchName) return false
  
  try {
    const slug = batchNameToSlug(batchName)
    const exists = await KaijuBatchService.batchExists(slug)
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Batch check: "${batchName}" -> "${slug}" -> exists: ${exists}`)
    }
    
    return exists
  } catch (error) {
    console.error('Error checking if batch exists:', error)
    return false
  }
}

/**
 * ENHANCED: Check if batch exists (sync version with fallback to Contentful cache)
 * This checks the service cache first, then falls back to known mappings
 */
export function batchPageExistsSync(batchName: string): boolean {
  if (!batchName) return false
  
  // Try to check the service cache first (if batches have been loaded)
  try {
    // Get cached batches from the service (synchronous if already loaded)
    const cachedBatches = KaijuBatchService['cache']?.get('all-batches')
    if (cachedBatches && Array.isArray(cachedBatches)) {
      const slug = batchNameToSlug(batchName)
      const found = cachedBatches.some((batch: any) => batch.slug === slug)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 Sync batch check (cached): "${batchName}" -> "${slug}" -> exists: ${found}`)
      }
      
      return found
    }
  } catch (error) {
    // Cache not available, fall through to static check
  }
  
  // Fallback to known mappings (less accurate but immediate)
  const hasKnownMapping = Object.keys({
    'Halloween Celebration': 'halloween-celebration',
    'Spooky Halloween Special': 'spooky',
    'Genesis Kaiju': 'genesis',
    'Genesis': 'genesis',
    'Mr. Wasabi': 'mr-wasabi',
    'Mr Wasabi': 'mr-wasabi',
    'Dogejira': 'dogejira',
    'CryptoKitty': 'cryptokitty',
    'CryptoKitties': 'cryptokitty',
    'Sushi': 'sushi',
    'SushiSwap': 'sushi',
    'Pretty Fine Plushies': 'pretty-fine-plushies',
    'Jaiantokoin': 'jaiantokoin',
    'URI': 'uri',
    'Spangle': 'spangle',
  }).some(knownBatch => 
    knownBatch.toLowerCase() === batchName.toLowerCase()
  )
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Sync batch check (fallback): "${batchName}" -> known mapping: ${hasKnownMapping}`)
  }
  
  return hasKnownMapping
}

/**
 * Get the full URL for a batch page
 */
export function getBatchPageUrl(batchName: string): string {
  const slug = batchNameToSlug(batchName)
  return `/kaijudx/${slug}`
}

/**
 * ENHANCED: Get batch info by name with fuzzy matching
 */
export async function getBatchByName(batchName: string): Promise<KaijuBatch | null> {
  if (!batchName) return null
  
  try {
    // First try exact slug match
    const slug = batchNameToSlug(batchName)
    let batch = await KaijuBatchService.getBatchBySlug(slug)
    
    if (batch) {
      return batch
    }
    
    // If no exact match, try fuzzy search through all batches
    const allBatches = await KaijuBatchService.getAllBatches()
    const normalizedName = batchName.toLowerCase().trim()
    
    // Try exact name match
    batch = allBatches.find(b => b.name.toLowerCase() === normalizedName)
    if (batch) return batch
    
    // Try partial name match
    batch = allBatches.find(b => 
      b.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(b.name.toLowerCase())
    )
    if (batch) return batch
    
    return null
  } catch (error) {
    console.error('Error fetching batch by name:', error)
    return null
  }
}

/**
 * Get batch info by ID (async - uses Contentful)
 */
export async function getBatchById(batchId: string): Promise<KaijuBatch | null> {
  if (!batchId) return null
  
  try {
    const batch = await KaijuBatchService.getBatchById(batchId)
    return batch || null
  } catch (error) {
    console.error('Error fetching batch by ID:', error)
    return null
  }
}

/**
 * Get all available batches (async - uses Contentful)
 */
export async function getAllBatches(): Promise<KaijuBatch[]> {
  try {
    return await KaijuBatchService.getAllBatches()
  } catch (error) {
    console.error('Error fetching all batches:', error)
    return []
  }
}

/**
 * Cache for quick batch lookups (populated on first use)
 */
let batchCache: KaijuBatch[] | null = null

/**
 * Get all batches with caching for better performance
 */
export async function getAllBatchesCached(): Promise<KaijuBatch[]> {
  if (batchCache === null) {
    batchCache = await getAllBatches()
  }
  return batchCache
}

/**
 * Clear the batch cache (useful for testing or when data updates)
 */
export function clearBatchCache(): void {
  batchCache = null
  KaijuBatchService.clearCache()
}

/**
 * 🆕 FIXED: Search batches by name (fuzzy search) - with rich text support
 */
export async function searchBatches(searchTerm: string): Promise<KaijuBatch[]> {
  if (!searchTerm.trim()) return []
  
  try {
    const allBatches = await getAllBatchesCached()
    const term = searchTerm.toLowerCase().trim()
    
    return allBatches.filter(batch => 
      batch.name.toLowerCase().includes(term) ||
      batch.essence.toLowerCase().includes(term) ||
      extractPlainText(batch.characterDescription).toLowerCase().includes(term) // 🆕 FIXED: Handle rich text
    )
  } catch (error) {
    console.error('Error searching batches:', error)
    return []
  }
}

/**
 * NEW: Preload batches into cache for better sync performance
 * Call this early in the app lifecycle
 */
export async function preloadBatchCache(): Promise<void> {
  try {
    await getAllBatchesCached()
    // Also preload into the service cache
    await KaijuBatchService.preloadBatches()
    console.log('🚀 Batch cache preloaded successfully')
  } catch (error) {
    console.error('⚠️ Failed to preload batch cache:', error)
  }
}

/**
 * NEW: Normalize batch name for better matching
 * Handles common variations in NFT metadata
 */
export function normalizeBatchName(batchName: string): string {
  if (!batchName) return ''
  
  return batchName
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/collection$/i, '') // Remove "Collection" suffix
    .replace(/series$/i, '') // Remove "Series" suffix
    .replace(/edition$/i, '') // Remove "Edition" suffix
    .replace(/\s+$/, '') // Trim trailing space
}

/**
 * 🆕 UPDATED: Debug function to help troubleshoot batch linking issues - with rich text support
 */
export async function debugBatchLinking(batchName: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return
  
  console.group(`🐛 Debug batch linking: "${batchName}"`)
  
  const normalized = normalizeBatchName(batchName)
  const slug = batchNameToSlug(normalized)
  const existsAsync = await batchPageExists(normalized)
  const existsSync = batchPageExistsSync(normalized)
  const url = getBatchPageUrl(normalized)
  
  console.log(`Original: "${batchName}"`)
  console.log(`Normalized: "${normalized}"`)
  console.log(`Slug: "${slug}"`)
  console.log(`Exists (async): ${existsAsync}`)
  console.log(`Exists (sync): ${existsSync}`)
  console.log(`URL: ${url}`)
  
  try {
    const batch = await getBatchByName(normalized)
    console.log(`Found batch:`, batch ? batch.name : 'Not found')
    
    if (batch) {
      // Show how the character description looks (debug rich text)
      const characterDesc = extractPlainText(batch.characterDescription)
      console.log(`Character description (plain text): "${characterDesc.substring(0, 100)}..."`)
    }
  } catch (error) {
    console.log(`Error finding batch:`, error)
  }
  
  console.groupEnd()
}