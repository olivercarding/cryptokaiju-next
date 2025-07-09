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
    abilities: ['Ignite Innovation', 'Calm Circuits', 'Seedling Shield'],
    habitat: 'Workshops and learning circles',
    estimatedSupply: 300,
    discoveredDate: '2025.01.01',
    battleStats: { attack: 70, defense: 80, speed: 65, special: 90 }
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
    abilities: ['Giant Embrace', 'Load Bearing Cheer', 'Community Rally'],
    habitat: 'Open plazas and construction sites',
    estimatedSupply: 500,
    discoveredDate: '2025.02.01',
    battleStats: { attack: 60, defense: 90, speed: 40, special: 70 }
  },
  // 003 Spookymon
  {
    id: '003',
    slug: 'spookymon',
    name: 'Spookymon',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Moonlight',
    power: 'Glow Aura',
    description: 'A glow in the dark dino who appears on bright moonlit nights. Spookymon tells friendly ghost stories that leave listeners smiling and scatters a soft trail of phosphorescent paw prints.',
    nftImage: '/images/spookymon.png',
    physicalImage: '/images/spookymon-physical.png',
    backgroundColor: 'bg-indigo-100',
    origin: 'Komorebi',
    abilities: ['Story Spinner', 'Moonlit Lantern', 'Comforting Chill'],
    habitat: 'Quiet rooftops and campfires',
    estimatedSupply: 300,
    discoveredDate: '2025.03.13',
    battleStats: { attack: 55, defense: 65, speed: 75, special: 85 }
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
    abilities: ['Soothing Purr', 'Canvas Leap', 'Inspiration Spark'],
    habitat: 'Studios and craft rooms',
    estimatedSupply: 600,
    discoveredDate: '2025.04.05',
    battleStats: { attack: 50, defense: 55, speed: 80, special: 70 }
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
    abilities: ['Laughter Wave', 'Good Vibe Gust', 'Emoji Echo'],
    habitat: 'Internet cafés and meme gardens',
    estimatedSupply: 800,
    discoveredDate: '2025.05.12',
    battleStats: { attack: 55, defense: 50, speed: 85, special: 60 }
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
    abilities: ['Rolling Waddle', 'Flavor Burst', 'Tide Tune'],
    habitat: 'Parks and riversides',
    estimatedSupply: 700,
    discoveredDate: '2025.06.18',
    battleStats: { attack: 45, defense: 60, speed: 70, special: 55 }
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
    abilities: ['Stealth Dash', 'Flavor Shock', 'Rapid Remix'],
    habitat: 'Kitchen counters and hackathons',
    estimatedSupply: 400,
    discoveredDate: '2025.07.22',
    battleStats: { attack: 70, defense: 55, speed: 90, special: 75 }
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
    abilities: ['Team Rally', 'Three Point Pulse', 'Arena Echo'],
    habitat: 'Basketball arenas and city blacktops',
    estimatedSupply: 300,
    discoveredDate: '2025.08.15',
    battleStats: { attack: 80, defense: 70, speed: 75, special: 65 }
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
    nftImage: '/images/meme.png',
    physicalImage: '/images/meme-physical.png',
    backgroundColor: 'bg-amber-200',
    origin: 'Komorebi',
    abilities: ['Idea Sandcastle', 'Beach Boogie', 'Sun Block Shield'],
    habitat: 'Beaches and boardwalks',
    estimatedSupply: 500,
    discoveredDate: '2025.09.09',
    battleStats: { attack: 60, defense: 55, speed: 80, special: 60 }
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
    description: 'A pumpkin bellied Kaiju who guides gentle Halloween gatherings, lighting every jack o lantern with a whisper and on occasion, summoning demons!',
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
    abilities: ['Warm Hug', 'Silent Lullaby', 'Peace Field'],
    habitat: 'Bedrooms and arts and craft studios',
    estimatedSupply: 150,
    discoveredDate: '2026.01.05',
    battleStats: { attack: 40, defense: 65, speed: 40, special: 90 }
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
    description: 'A one of a kind Kaiju that celebrates the purchase of KnownOrigin by eBay and guards the moment when creativity meets commerce.',
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
    description: 'A prototype Kaiju inspired by Meebit avatars who roams blocky realms testing new layouts for future generations.',
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
    description: 'A one of one prototype Kaiju that blends playful ghosts with defi dreams and floats through markets lending courage and smiles.',
    nftImage: '/images/aavegotchi.png',
    physicalImage: '/images/aavegotchi-physical.png',
    backgroundColor: 'bg-purple-300',
    origin: 'Komorebi',
    abilities: ['Yield Chant', 'Collateral Cloak', 'Friendly Haunt'],
    habitat: 'Defi dashboards and pixel graveyards',
    estimatedSupply: 1,
    discoveredDate: '2026.04.14',
    battleStats: { attack: 75, defense: 70, speed: 80, special: 90 }
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
