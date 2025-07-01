// Auto-generated NFC mapping
// Generated at: 2025-07-01T22:14:57.499Z
// Total mappings: 1

export const NFC_MAPPING = {
  "042546aae25680": {
    "tokenId": "0",
    "name": "Mr. Toshi",
    "discoveredAt": "2025-07-01T22:01:48.177Z"
  }
}

export function getTokenIdByNFC(nfcId: string): string | null {
  const normalized = nfcId.toLowerCase().trim()
  return NFC_MAPPING[normalized]?.tokenId || null
}

export function getAllNFCIds(): string[] {
  return Object.keys(NFC_MAPPING)
}

export function getMappingStats() {
  return {
    totalMappings: Object.keys(NFC_MAPPING).length,
    generatedAt: '2025-07-01T22:14:57.499Z'
  }
}
