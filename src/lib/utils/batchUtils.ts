// src/lib/utils/batchUtils.ts - UPDATED for Contentful integration
import KaijuBatchService, { type KaijuBatch } from '@/lib/services/KaijuBatchService'

/**
 * Convert batch name to URL slug
 * Examples:
 * "Halloween Celebration" -> "halloween-celebration"
 * "Genesis Kaiju" -> "genesis"
 * "Mr. Wasabi" -> "mr-wasabi"
 */
export function batchNameToSlug(batchName: string): string {
  if (!batchName) return ''
  
  // Common mappings for known batches
  const batchMappings: Record<string, string> = {
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
  }
  
  // Check if we have a direct mapping
  if (batchMappings[batchName]) {
    return batchMappings[batchName]
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
 * Check if a batch page exists for the given batch name (async - uses Contentful)
 */
export async function batchPageExists(batchName: string): Promise<boolean> {
  if (!batchName) return false
  
  try {
    const slug = batchNameToSlug(batchName)
    return await KaijuBatchService.batchExists(slug)
  } catch (error) {
    console.error('Error checking if batch exists:', error)
    return false
  }
}

/**
 * Check if a batch page exists (synchronous version using known mappings)
 * Use this for immediate checks without async calls
 */
export function batchPageExistsSync(batchName: string): boolean {
  if (!batchName) return false
  
  // List of known batches that we're confident exist
  const knownBatches = [
    'Halloween Celebration',
    'Spooky Halloween Special', 
    'Genesis Kaiju',
    'Genesis',
    'Mr. Wasabi',
    'Mr Wasabi',
    'Dogejira',
    'CryptoKitty',
    'CryptoKitties',
    'Sushi',
    'SushiSwap',
    'Pretty Fine Plushies',
    'Jaiantokoin',
    'URI',
    'Spangle',
    'Christmas Special',
    'Valentine Special',
    'Easter Special',
    'Diamond Hands',
  ]
  
  return knownBatches.includes(batchName)
}

/**
 * Get the full URL for a batch page
 */
export function getBatchPageUrl(batchName: string): string {
  const slug = batchNameToSlug(batchName)
  return `/kaijudex/${slug}`
}

/**
 * Get batch info by name (async - uses Contentful)
 */
export async function getBatchByName(batchName: string): Promise<KaijuBatch | null> {
  if (!batchName) return null
  
  try {
    const slug = batchNameToSlug(batchName)
    const batch = await KaijuBatchService.getBatchBySlug(slug)
    return batch || null
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
 * Search batches by name (fuzzy search)
 */
export async function searchBatches(searchTerm: string): Promise<KaijuBatch[]> {
  if (!searchTerm.trim()) return []
  
  try {
    const allBatches = await getAllBatchesCached()
    const term = searchTerm.toLowerCase().trim()
    
    return allBatches.filter(batch => 
      batch.name.toLowerCase().includes(term) ||
      batch.essence.toLowerCase().includes(term) ||
      batch.characterDescription.toLowerCase().includes(term)
    )
  } catch (error) {
    console.error('Error searching batches:', error)
    return []
  }
}