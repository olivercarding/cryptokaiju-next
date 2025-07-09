// src/config/batches.ts
export interface KaijuBatch {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  element: string
  power: string
  description: string

  // Visual assets
  nftImage: string
  physicalImage: string
  conceptArt?: string[]
  backgroundColor: string

  // Character details
  origin: string
  abilities: string[]
  habitat: string

  // Collection stats (approximate)
  estimatedSupply: number
  discoveredDate: string

  // Battle stats for fun
  battleStats: {
    attack: number
    defense: number
    speed: number
    special: number
  }
}

export const KAIJU_BATCHES: KaijuBatch[] = [
  // 001 – 009 already crafted above
  // ------------------------------------------------------------
  // 010 Diamond Hands (updated cool cosmopolitan details)
  {
    id: '010',
    slug: 'diamond-hands',
    name: 'Diamond Hands',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Crystal',
    power: 'Steady Grip',
    description: 'A cool, confident and cosmopolitan azure dino who thrives in neon lit districts. Diamond Hands spends evenings in record shops of Takeshima or rooftop cafés in Kiyosawa listening to Deftones, Nas, and Glassjaw while plotting long‑term strategies. Loves a classic slice of pizza and never drops what he believes in even when markets wobble.',
    nftImage: '/images/diamond-hands.png',
    physicalImage: '/images/diamond-hands-physical.png',
    backgroundColor: 'bg-cyan-200',
    origin: 'Komorebi',
    abilities: ['Style Flex', 'Price Freeze', 'Timekeeper Pulse'],
    habitat: 'Skyline apartments and music venues of coastal Takeshima',
    estimatedSupply: 250,
    discoveredDate: '2025.10.18',
    battleStats: { attack: 85, defense: 95, speed: 45, special: 80 }
  },
  // 011 Spangle (kept shorter)
  {
    id: '011',
    slug: 'spangle',
    name: 'Spangle',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Starfire',
    power: 'Firework Cheer',
    description: 'An all‑American dino draped in stars and stripes who lights July skies with bursts of starfire, hosting cookouts where neighbours swap recipes and bright ideas.',
    nftImage: '/images/spangle.png',
    physicalImage: '/images/spangle-physical.png',
    backgroundColor: 'bg-red-200',
    origin: 'Komorebi',
    abilities: ['Grill Master', 'Patriotic Pulse', 'Sky Paint'],
    habitat: 'Backyards and open skies',
    estimatedSupply: 300,
    discoveredDate: '2025.11.04',
    battleStats: { attack: 75, defense: 70, speed: 70, special: 75 }
  },
  // 012 Halloween Celebration
  {
    id: '012',
    slug: 'halloween-celebration',
    name: 'Halloween Celebration',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Autumn Flame',
    power: 'Lantern Glow',
    description: 'A pumpkin‑bellied Kaiju who guides gentle Halloween gatherings, lighting every jack o lantern with a whisper and helping children craft costumes from recycled code.',
    nftImage: '/images/halloween-celebration.png',
    physicalImage: '/images/halloween-celebration-physical.png',
    backgroundColor: 'bg-orange-300',
    origin: 'Komorebi',
    abilities: ['Costume Craft', 'Harvest Hug', 'Spiced Candle Scent'],
    habitat: 'Porches and town squares',
    estimatedSupply: 280,
    discoveredDate: '2025.10.31',
    battleStats: { attack: 65, defense: 60, speed: 60, special: 85 }
  },
  // 013 Pretty Fine Plushies (kawaii update)
  {
    id: '013',
    slug: 'pretty-fine-plushies',
    name: 'Pretty Fine Plushies',
    type: 'Plush',
    rarity: 'Legendary',
    element: 'Comfort',
    power: 'Dream Soothe',
    description: 'A kawaii plush version of Genesis who adores sailing on Komorebi’s glittering lakes, roller skating through pastel parks and creating cute crafts with friends. Favourite snacks include fondue, cheese on toast, beans on toast and towering ice‑cream sundaes.',
    nftImage: '/images/pretty-fine-plushies.png',
    physicalImage: '/images/pretty-fine-plushies-physical.png',
    backgroundColor: 'bg-pink-100',
    origin: 'Komorebi',
    abilities: ['Warm Hug', 'Silent Lullaby', 'Peace Field'],
    habitat: 'Bedrooms and arts‑and‑craft studios',
    estimatedSupply: 150,
    discoveredDate: '2026.01.05',
    battleStats: { attack: 40, defense: 65, speed: 40, special: 90 }
  },
  // 014 KnownOrigin (unchanged brief)
  {
    id: '014',
    slug: 'knownorigin',
    name: 'KnownOrigin',
    type: 'Vinyl',
    rarity: 'Legendary',
    element: 'Heritage',
    power: 'Provenance Shield',
    description: 'A one‑of‑a‑kind Kaiju celebrating the acquisition of KnownOrigin by eBay, guarding the narrative where creativity meets commerce.',
    nftImage: '/images/knownorigin.png',
    physicalImage: '/images/knownorigin-physical.png',
    backgroundColor: 'bg-violet-200',
    origin: 'Komorebi',
    abilities: ['Marketplace Insight', 'Authenticity Pulse', 'History Echo'],
    habitat: 'Galleries and marketplaces',
    estimatedSupply: 1,
    discoveredDate: '2026.02.12',
    battleStats: { attack: 80, defense: 85, speed: 55, special: 95 }
  },
  // 015 Meebit
  {
    id: '015',
    slug: 'meebit',
    name: 'Meebit',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Voxel',
    power: 'Block Shift',
    description: 'A prototype Kaiju inspired by Meebit avatars who explores blocky realms and experiments with layouts for future generations.',
    nftImage: '/images/meebit.png',
    physicalImage: '/images/meebit-physical.png',
    backgroundColor: 'bg-gray-200',
    origin: 'Komorebi',
    abilities: ['Voxel Jump', 'Pixel Repair', 'Grid Flex'],
    habitat: 'Digital dioramas and test servers',
    estimatedSupply: 1,
    discoveredDate: '2026.03.08',
    battleStats: { attack: 70, defense: 60, speed: 85, special: 80 }
  },
  // 016 Aavegotchi
  {
    id: '016',
    slug: 'aavegotchi',
    name: 'Aavegotchi',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Spectral Finance',
    power: 'Liquidity Drift',
    description: 'A one‑of‑one prototype Kaiju that bridges playful ghosts and defi dreams, floating through markets while lending courage and yielding smiles.',
    nftImage: '/images/aavegotchi.png',
    physicalImage: '/images/aavegotchi-physical.png',
    backgroundColor: 'bg-purple-300',
    origin: 'Komorebi',
    abilities: ['Yield Chant', 'Collateral Cloak', 'Friendly Haunt'],
    habitat: 'DeFi dashboards and pixel graveyards',
    estimatedSupply: 1,
    discoveredDate: '2026.04.14',
    battleStats: { attack: 75, defense: 70, speed: 80, special: 90 }
  },
  // 017 Uri (mysterious ghost)
  {
    id: '017',
    slug: 'uri',
    name: 'Uri',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Ghost',
    power: 'Spectral Drift',
    description: 'A mysterious but undeniably cute ghost Kaiju who phases silently between the creaking homes of Ravnori and the deep emerald woods of Virdara, guiding lost wanderers with a gentle glow.',
    nftImage: '/images/uri.png',
    physicalImage: '/images/uri-physical.png',
    backgroundColor: 'bg-indigo-200',
    origin: 'Komorebi',
    abilities: ['Phase Step', 'Forest Whisper', 'Ethereal Light'],
    habitat: 'Haunted houses and Virdara forest paths',
    estimatedSupply: 125,
    discoveredDate: '2026.05.30',
    battleStats: { attack: 65, defense: 80, speed: 95, special: 100 }
  }
]

// Helper functions
export const getBatchBySlug = (slug: string): KaijuBatch | undefined => {
  return KAIJU_BATCHES.find(batch => batch.slug === slug)
}

export const getBatchById = (id: string): KaijuBatch | undefined => {
  return KAIJU_BATCHES.find(batch => batch.id === id)
}

export const getBatchesByType = (type: 'Plush' | 'Vinyl'): KaijuBatch[] => {
  return KAIJU_BATCHES.filter(batch => batch.type === type)
}

export const getBatchesByRarity = (rarity: KaijuBatch['rarity']): KaijuBatch[] => {
  return KAIJU_BATCHES.filter(batch => batch.rarity === rarity)
}

export const getTotalEstimatedSupply = (): number => {
  return KAIJU_BATCHES.reduce((total, batch) => total + batch.estimatedSupply, 0)
}
