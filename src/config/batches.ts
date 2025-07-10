// src/config/batches.ts - UPDATED WITHOUT ABILITIES AND BATTLE STATS
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
  habitat: string

  // Collection stats (approximate)
  estimatedSupply: number
  discoveredDate: string
}

export const KAIJU_BATCHES: KaijuBatch[] = [
  // 001 Genesis
  {
    id: '001',
    slug: 'genesis',
    name: 'Genesis',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Digital Fire',
    power: 'Spark of Creation',
    description: 'Genesis carries the first cryptographic spark and wears a playful dinosaur costume. He was the first CryptoKaiju to cross from Komorebi and wherever he walks circuits stay calm and seedlings thrive.',
    nftImage: '/images/genesis.png',
    physicalImage: '/images/genesis-physical.png',
    backgroundColor: 'bg-orange-200',
    origin: 'Komorebi',
    habitat: 'Workshops and learning circles',
    estimatedSupply: 300,
    discoveredDate: '2025.01.01'
  },
  // 002 Jaiantokoin
  {
    id: '002',
    slug: 'jaiantokoin',
    name: 'Jaiantokoin',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Digital Earth',
    power: 'Bridge Builder',
    description: 'A towering coin with vintage cartoon limbs and a smile that lights entire villages. Jaiantokoin embodies shared strength and lifts bridges and spirits on every side of a gateway.',
    nftImage: '/images/jaiantokoin.png',
    physicalImage: '/images/jaiantokoin-physical.png',
    backgroundColor: 'bg-brown-200',
    origin: 'Komorebi',
    habitat: 'Open plazas and construction sites',
    estimatedSupply: 500,
    discoveredDate: '2025.02.01'
  },
  // 003 Spookymon
  {
    id: '003',
    slug: 'spooky',
    name: 'Spooky',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Moonlight',
    power: 'Glow Aura',
    description: 'A glow in the dark dino who appears on bright moonlit nights. Spookymon tells friendly ghost stories that leave listeners smiling and scatters a soft trail of phosphorescent paw prints.',
    nftImage: '/images/spookymon.png',
    physicalImage: '/images/spookymon-physical.png',
    backgroundColor: 'bg-indigo-100',
    origin: 'Komorebi',
    habitat: 'Quiet rooftops and campfires',
    estimatedSupply: 300,
    discoveredDate: '2025.03.13'
  },
  // 004 CryptoKitty
  {
    id: '004',
    slug: 'cryptokitty',
    name: 'CryptoKitty',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Creative Air',
    power: 'Idea Knead',
    description: 'Born from a collaboration with Dapper Labs, CryptoKitty purrs when creativity blooms and kneads fresh ideas into shape for artists across Komorebi and beyond.',
    nftImage: '/images/cryptokitty.png',
    physicalImage: '/images/cryptokitty-physical.png',
    backgroundColor: 'bg-blue-100',
    origin: 'Komorebi',
    habitat: 'Studios and craft rooms',
    estimatedSupply: 600,
    discoveredDate: '2025.04.05'
  },
  // 005 Dogejira
  {
    id: '005',
    slug: 'dogejira',
    name: 'Dogejira',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Meme Wind',
    power: 'Viral Charm',
    description: 'A Shiba faced dino whose grin brightens every meme market. Dogejira speaks in short cheerful phrases and spreads contagious laughter across every network breeze.',
    nftImage: '/images/dogejira.png',
    physicalImage: '/images/dogejira-physical.png',
    backgroundColor: 'bg-yellow-100',
    origin: 'Komorebi',
    habitat: 'Internet cafés and meme gardens',
    estimatedSupply: 800,
    discoveredDate: '2025.05.12'
  },
  // 006 Sushi
  {
    id: '006',
    slug: 'sushi',
    name: 'Sushi',
    type: 'Plush',
    rarity: 'Common',
    element: 'Tide',
    power: 'Picnic Aura',
    description: 'An anthropomorphic nigiri plush with a plump prawn hat. Sushi invites friends to share snacks and code under clear skies and rolls contagious picnic vibes wherever it goes.',
    nftImage: '/images/sushi.png',
    physicalImage: '/images/sushi-physical.png',
    backgroundColor: 'bg-teal-100',
    origin: 'Komorebi',
    habitat: 'Parks and riversides',
    estimatedSupply: 700,
    discoveredDate: '2025.06.18'
  },
  // 007 Mr Wasabi
  {
    id: '007',
    slug: 'mr-wasabi',
    name: 'Mr Wasabi',
    type: 'Plush',
    rarity: 'Rare',
    element: 'Spice',
    power: 'Zing Burst',
    description: 'A small emerald sphere full of zing. Mr Wasabi keeps projects agile and conversations lively with bright flashes of flavour that wake tired minds.',
    nftImage: '/images/mr-wasabi.png',
    physicalImage: '/images/mr-wasabi-physical.png',
    backgroundColor: 'bg-green-200',
    origin: 'Komorebi',
    habitat: 'Kitchen counters and hackathons',
    estimatedSupply: 400,
    discoveredDate: '2025.07.22'
  },
  // 008 Sacramento Kings
  {
    id: '008',
    slug: 'sacramento-kings',
    name: 'Sacramento Kings',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Court',
    power: 'Hoop Leap',
    description: 'Created with the Sacramento Kings basketball team, this court loving giant unites players through friendly games and reminds everyone that teamwork is the true victory.',
    nftImage: '/images/sacramento-kings.png',
    physicalImage: '/images/sacramento-kings-physical.png',
    backgroundColor: 'bg-purple-300',
    origin: 'Komorebi',
    habitat: 'Basketball arenas and city blacktops',
    estimatedSupply: 300,
    discoveredDate: '2025.08.15'
  },
  // 009 Meme
  {
    id: '009',
    slug: 'meme',
    name: 'Meme',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Tropic',
    power: 'Pineapple Breeze',
    description: 'Made with the MEME project and marked by a pineapple crest, Meme sends fruit scented breezes across the shore and builds sandcastles from bright ideas.',
    nftImage: '/images/meme-NFT.png',
    physicalImage: '/images/meme-physical.png',
    backgroundColor: 'bg-amber-200',
    origin: 'Komorebi',
    habitat: 'Beaches and boardwalks',
    estimatedSupply: 500,
    discoveredDate: '2025.09.09'
  },
  // 010 Diamond Hands
  {
    id: '010',
    slug: 'diamond-hands',
    name: 'Diamond Hands',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Crystal',
    power: 'Steady Grip',
    description: 'A cool confident cosmopolitan azure dino who thrives in neon lit districts. Diamond Hands spends evenings in record shops of Takeshima or rooftop cafés in Kiyosawa listening to Deftones Nas and Glassjaw while planning long term strategies. Loves a classic slice of pizza and never drops what he believes in even when markets wobble.',
    nftImage: '/images/Diamond-Hands-NFT.png',
    physicalImage: '/images/Diamond_hands_product_shot.png',
    backgroundColor: 'bg-cyan-200',
    origin: 'Komorebi',
    habitat: 'Skyline apartments and music venues of coastal Takeshima',
    estimatedSupply: 250,
    discoveredDate: '2025.10.18'
  },
  // 011 Spangle
  {
    id: '011',
    slug: 'spangle',
    name: 'Spangle',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Starfire',
    power: 'Firework Cheer',
    description: 'An all American dino dressed in stars and stripes who lights July skies with glittering bursts of starfire and hosts cookouts where neighbours swap recipes and ideas.',
    nftImage: '/images/spangle.png',
    physicalImage: '/images/spangle-physical.png',
    backgroundColor: 'bg-red-200',
    origin: 'Komorebi',
    habitat: 'Backyards and open skies',
    estimatedSupply: 300,
    discoveredDate: '2025.11.04'
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
    description: 'A pumpkin bellied Kaiju who guides gentle Halloween gatherings, lighting every jack o lantern with a whisper and on occasion, summoning demons!',
    nftImage: '/images/halloween-celebration.png',
    physicalImage: '/images/halloween-celebration-physical.png',
    backgroundColor: 'bg-orange-300',
    origin: 'Komorebi',
    habitat: 'Porches and town squares',
    estimatedSupply: 280,
    discoveredDate: '2025.10.31'
  },
  // 013 Pretty Fine Plushies
  {
    id: '013',
    slug: 'pretty-fine-plushies',
    name: 'Pretty Fine Plushies',
    type: 'Plush',
    rarity: 'Legendary',
    element: 'Comfort',
    power: 'Dream Soothe',
    description: 'A kawaii plush version of Genesis who adores sailing on Komorebi lakes roller skating through pastel parks and creating cute crafts with friends. Favourite snacks include fondue cheese on toast beans on toast and tall ice cream sundaes.',
    nftImage: '/images/pretty-fine-plushies.png',
    physicalImage: '/images/pretty-fine-plushies-physical.png',
    backgroundColor: 'bg-pink-100',
    origin: 'Komorebi',
    habitat: 'Bedrooms and arts and craft studios',
    estimatedSupply: 150,
    discoveredDate: '2026.01.05'
  },
  // 014 KnownOrigin
  {
    id: '014',
    slug: 'knownorigin',
    name: 'KnownOrigin',
    type: 'Vinyl',
    rarity: 'Legendary',
    element: 'Heritage',
    power: 'Provenance Shield',
    description: 'A one of a kind Kaiju that celebrates KnownOrigin being purchased by eBay for $68 million.',
    physicalImage: '/images/knownorigin-physical.png',
    backgroundColor: 'bg-violet-200',
    origin: 'Komorebi',
    habitat: 'Galleries and marketplaces',
    estimatedSupply: 1,
    discoveredDate: '2026.02.12'
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
    description: 'A prototype Kaiju inspired by Meebit avatars who roams blocky realms testing new layouts for future generations.',
    physicalImage: '/images/meebit-physical.png',
    backgroundColor: 'bg-gray-200',
    origin: 'Komorebi',
    habitat: 'Digital dioramas and test servers',
    estimatedSupply: 1,
    discoveredDate: '2026.03.08'
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
    description: 'A one of one prototype Kaiju that blends playful ghosts with defi dreams and floats through markets lending courage and smiles.',
    physicalImage: '/images/aavegotchi-physical.png',
    backgroundColor: 'bg-purple-300',
    origin: 'Komorebi',
    habitat: 'Defi dashboards and pixel graveyards',
    estimatedSupply: 1,
    discoveredDate: '2026.04.14'
  },
  // 017 Uri
  {
    id: '017',
    slug: 'uri',
    name: 'Uri',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Ghost',
    power: 'Spectral Drift',
    description: 'A mysterious yet cute ghost Kaiju who drifts between the creaking homes of Ravnori and the deep green woods of Virdara guiding lost travelers with a gentle glow.',
    nftImage: '/images/uri.png',
    physicalImage: '/images/Uri_product_shot.png',
    backgroundColor: 'bg-indigo-200',
    origin: 'Komorebi',
    habitat: 'Haunted houses and Virdara forest paths',
    estimatedSupply: 125,
    discoveredDate: '2026.05.30'
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