// src/lib/utils/batchUtils.ts - Utility functions for batch handling
import { KAIJU_BATCHES } from '@/config/batches'

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
 * Check if a batch page exists for the given batch name
 */
export function batchPageExists(batchName: string): boolean {
  if (!batchName) return false
  
  const slug = batchNameToSlug(batchName)
  return KAIJU_BATCHES.some(batch => batch.slug === slug)
}

/**
 * Get the full URL for a batch page
 */
export function getBatchPageUrl(batchName: string): string {
  const slug = batchNameToSlug(batchName)
  return `/kaijudex/${slug}`
}

/**
 * Get batch info by name (for additional context)
 */
export function getBatchByName(batchName: string) {
  if (!batchName) return null
  
  const slug = batchNameToSlug(batchName)
  return KAIJU_BATCHES.find(batch => batch.slug === slug) || null
}