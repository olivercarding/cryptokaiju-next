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
  lore: string

  // Visual assets
  nftImage: string
  physicalImage: string
  conceptArt?: string[]
  backgroundColor: string

  // Character details
  origin: string
  abilities: string[]
  personalityTraits: string[]
  weaknesses: string[]
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
  {
    id: '001',
    slug: 'genesis',
    name: 'Genesis',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Digital Fire',
    power: 'Spark of Creation',
    description: 'Genesis carries the first cryptographic spark and wears a playful dinosaur costume.',
    lore: 'Genesis was the first CryptoKaiju to cross from Komorebi. Wherever he walks, circuits stay calm and seedlings thrive.',
    nftImage: '/images/genesis.png',
    physicalImage: '/images/genesis-physical.png',
    backgroundColor: 'bg-orange-200',
    origin: 'Komorebi',
    abilities: ['Ignite Innovation', 'Calm Circuits', 'Seedling Shield'],
    personalityTraits: ['Brave', 'Patient', 'Thoughtful'],
    weaknesses: ['Overheats in prolonged stillness', 'Drawn to unsolved puzzles'],
    habitat: 'Workshops, learning circles',
    estimatedSupply: 300,
    discoveredDate: '2025.01.01',
    battleStats: { attack: 70, defense: 80, speed: 65, special: 90 }
  },
  {
    id: '002',
    slug: 'jaiantokoin',
    name: 'Jaiantokoin',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Digital Earth',
    power: 'Bridge Builder',
    description: 'Jaiantokoin is a towering coin with vintage cartoon limbs and a smile that lights villages.',
    lore: 'He embodies shared strength and lifts bridges and spirits on every side of a gateway.',
    nftImage: '/images/jaiantokoin.png',
    physicalImage: '/images/jaiantokoin-physical.png',
    backgroundColor: 'bg-brown-200',
    origin: 'Komorebi',
    abilities: ['Giant Embrace', 'Load Bearing Cheer', 'Community Rally'],
    personalityTraits: ['Gentle', 'Reliable', 'Strong'],
    weaknesses: ['Becomes sluggish after large meals', 'Hesitates in tight spaces'],
    habitat: 'Open plazas, construction sites',
    estimatedSupply: 500,
    discoveredDate: '2025.02.01',
    battleStats: { attack: 60, defense: 90, speed: 40, special: 70 }
  },
  {
    id: '003',
    slug: 'spookymon',
    name: 'Spookymon',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Moonlight',
    power: 'Glow Aura',
    description: 'A glow in the dark dino who loves gentle spooky tales.',
    lore: 'Spookymon arrives on bright moonlit nights and spins cozy stories that finish with friendly giggles.',
    nftImage: '/images/spookymon.png',
    physicalImage: '/images/spookymon-physical.png',
    backgroundColor: 'bg-indigo-100',
    origin: 'Komorebi',
    abilities: ['Story Spinner', 'Moonlit Lantern', 'Comforting Chill'],
    personalityTraits: ['Playful', 'Mysterious', 'Warm'],
    weaknesses: ['Drowsy at dawn', 'Distracted by campfire snacks'],
    habitat: 'Quiet rooftops, campfires',
    estimatedSupply: 300,
    discoveredDate: '2025.03.13',
    battleStats: { attack: 55, defense: 65, speed: 75, special: 85 }
  },
  {
    id: '004',
    slug: 'cryptokitty',
    name: 'CryptoKitty',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Creative Air',
    power: 'Idea Knead',
    description: 'A playful Kaiju created in collaboration with Dapper Labs and CryptoKaiju.',
    lore: 'CryptoKitty purrs when creativity blooms and kneads fresh ideas for artists across Komorebi and beyond.',
    nftImage: '/images/cryptokitty.png',
    physicalImage: '/images/cryptokitty-physical.png',
    backgroundColor: 'bg-blue-100',
    origin: 'Komorebi',
    abilities: ['Soothing Purr', 'Canvas Leap', 'Inspiration Spark'],
    personalityTraits: ['Curious', 'Helpful', 'Alert'],
    weaknesses: ['Easily sidetracked by string', 'Sneezes in dusty rooms'],
    habitat: 'Studios, craft rooms',
    estimatedSupply: 600,
    discoveredDate: '2025.04.05',
    battleStats: { attack: 50, defense: 55, speed: 80, special: 70 }
  },
  {
    id: '005',
    slug: 'dogejira',
    name: 'Dogejira',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Meme Wind',
    power: 'Viral Charm',
    description: 'Dogejira is a Shiba faced dino whose grin brightens every meme market.',
    lore: 'He speaks in simple phrases and spreads contagious laughter through every network breeze.',
    nftImage: '/images/dogejira.png',
    physicalImage: '/images/dogejira-physical.png',
    backgroundColor: 'bg-yellow-100',
    origin: 'Komorebi',
    abilities: ['Laughter Wave', 'Good Vibe Gust', 'Emoji Echo'],
    personalityTraits: ['Cheerful', 'Optimistic', 'Loyal'],
    weaknesses: ['Drops focus when patted on the head', 'Confused by serious debates'],
    habitat: 'Internet cafes, meme gardens',
    estimatedSupply: 800,
    discoveredDate: '2025.05.12',
    battleStats: { attack: 55, defense: 50, speed: 85, special: 60 }
  },
  {
    id: '006',
    slug: 'sushi',
    name: 'Sushi',
    type: 'Plush',
    rarity: 'Common',
    element: 'Tide',
    power: 'Picnic Aura',
    description: 'An anthropomorphic nigiri plush with a plump prawn hat who is always playful.',
    lore: 'Sushi invites friends to share snacks and code beneath sunny skies and spreads picnic vibes wherever it rolls.',
    nftImage: '/images/sushi.png',
    physicalImage: '/images/sushi-physical.png',
    backgroundColor: 'bg-teal-100',
    origin: 'Komorebi',
    abilities: ['Rolling Waddle', 'Flavor Burst', 'Tide Tune'],
    personalityTraits: ['Friendly', 'Playful', 'Easygoing'],
    weaknesses: ['Gets soggy in heavy rain', 'Distracted by soy sauce'],
    habitat: 'Parks, riversides',
    estimatedSupply: 700,
    discoveredDate: '2025.06.18',
    battleStats: { attack: 45, defense: 60, speed: 70, special: 55 }
  },
  {
    id: '007',
    slug: 'mr-wasabi',
    name: 'Mr Wasabi',
    type: 'Plush',
    rarity: 'Rare',
    element: 'Spice',
    power: 'Zing Burst',
    description: 'A small emerald sphere with a zingy sense of humour.',
    lore: 'Mr Wasabi keeps projects agile and conversations lively with flashes of spice that wake tired minds.',
    nftImage: '/images/mr-wasabi.png',
    physicalImage: '/images/mr-wasabi-physical.png',
    backgroundColor: 'bg-green-200',
    origin: 'Komorebi',
    abilities: ['Stealth Dash', 'Flavor Shock', 'Rapid Remix'],
    personalityTraits: ['Energetic', 'Mischievous', 'Loyal'],
    weaknesses: ['Overreacts to citrus scents', 'Fizzles in extreme cold'],
    habitat: 'Kitchen counters, hackathons',
    estimatedSupply: 400,
    discoveredDate: '2025.07.22',
    battleStats: { attack: 70, defense: 55, speed: 90, special: 75 }
  },
  {
    id: '008',
    slug: 'sacramento-kings',
    name: 'Sacramento Kings',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Court',
    power: 'Hoop Leap',
    description: 'A Kaiju produced in collaboration with the Sacramento Kings basketball team who loves friendly games.',
    lore: 'This court loving giant brings people together through sport and reminds them that teamwork is the true victory.',
    nftImage: '/images/sacramento-kings.png',
    physicalImage: '/images/sacramento-kings-physical.png',
    backgroundColor: 'bg-purple-300',
    origin: 'Komorebi',
    abilities: ['Team Rally', 'Three Point Pulse', 'Arena Echo'],
    personalityTraits: ['Competitive', 'Encouraging', 'Fair'],
    weaknesses: ['Deflates when seats are empty', 'Distracted by squeaky shoes'],
    habitat: 'Basketball courts',
    estimatedSupply: 300,
    discoveredDate: '2025.08.15',
    battleStats: { attack: 80, defense: 70, speed: 75, special: 65 }
  },
  {
    id: '009',
    slug: 'meme',
    name: 'Meme',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Tropic',
    power: 'Pineapple Breeze',
    description: 'A beach loving Kaiju created with the MEME project and marked with a pineapple emblem.',
    lore: 'Meme wafts fruit scented air along the shore and builds sand castles from bright ideas.',
    nftImage: '/images/meme.png',
    physicalImage: '/images/meme-physical.png',
    backgroundColor: 'bg-amber-200',
    origin: 'Komorebi',
    abilities: ['Idea Sandcastle', 'Beach Boogie', 'Sun Block Shield'],
    personalityTraits: ['Relaxed', 'Imaginative', 'Cheery'],
    weaknesses: ['Wilts in cold seasons', 'Slips on seaweed'],
    habitat: 'Beaches, boardwalks',
    estimatedSupply: 500,
    discoveredDate: '2025.09.09',
    battleStats: { attack: 60, defense: 55, speed: 80, special: 60 }
  },
  {
    id: '010',
    slug: 'diamond-hands',
    name: 'Diamond Hands',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Crystal',
    power: 'Steady Grip',
    description: 'A classy azure dino who loves sneakers and fine timepieces.',
    lore: 'Diamond Hands shows that style holds firm even when markets wobble and trends swirl.',
    nftImage: '/images/diamond-hands.png',
    physicalImage: '/images/diamond-hands-physical.png',
    backgroundColor: 'bg-cyan-200',
    origin: 'Komorebi',
    abilities: ['Style Flex', 'Price Freeze', 'Timekeeper Pulse'],
    personalityTraits: ['Steadfast', 'Stylish', 'Confident'],
    weaknesses: ['Glints attract magpies', 'Heavy limbs hinder quick turns'],
    habitat: 'Fashion districts, trading floors',
    estimatedSupply: 250,
    discoveredDate: '2025.10.18',
    battleStats: { attack: 85, defense: 95, speed: 45, special: 80 }
  },
  {
    id: '011',
    slug: 'spangle',
    name: 'Spangle',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Starfire',
    power: 'Firework Cheer',
    description: 'An all American dino with stars and stripes who lights July skies.',
    lore: 'Spangle hosts cookouts and teaches neighbours to trade recipes and bright ideas beneath summer fireworks.',
    nftImage: '/images/spangle.png',
    physicalImage: '/images/spangle-physical.png',
    backgroundColor: 'bg-red-200',
    origin: 'Komorebi',
    abilities: ['Grill Master', 'Patriotic Pulse', 'Sky Paint'],
    personalityTraits: ['Festive', 'Hospitable', 'Energetic'],
    weaknesses: ['Wind can fizzle sparks', 'Feels homesick outside July'],
    habitat: 'Backyards, open skies',
    estimatedSupply: 300,
    discoveredDate: '2025.11.04',
    battleStats: { attack: 75, defense: 70, speed: 70, special: 75 }
  },
  {
    id: '012',
    slug: 'halloween-celebration',
    name: 'Halloween Celebration',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Autumn Flame',
    power: 'Lantern Glow',
    description: 'A pumpkin bellied Kaiju who guides gentle Halloween gatherings.',
    lore: 'Under crisp leaves this Kaiju helps children craft costumes from recycled code and lights every jack o lantern with a gentle whisper.',
    nftImage: '/images/halloween-celebration.png',
    physicalImage: '/images/halloween-celebration-physical.png',
    backgroundColor: 'bg-orange-300',
    origin: 'Komorebi',
    abilities: ['Costume Craft', 'Harvest Hug', 'Spiced Candle Scent'],
    personalityTraits: ['Whimsical', 'Caring', 'Slightly spooky'],
    weaknesses: ['Fades at first frost', 'Startles at sudden flashlights'],
    habitat: 'Porches, town squares',
    estimatedSupply: 280,
    discoveredDate: '2025.10.31',
    battleStats: { attack: 65, defense: 60, speed: 60, special: 85 }
  },
  {
    id: '013',
    slug: 'pretty-fine-plushies',
    name: 'Pretty Fine Plushies',
    type: 'Plush',
    rarity: 'Legendary',
    element: 'Comfort',
    power: 'Dream Soothe',
    description: 'A cuddly plush version of Genesis designed for gentle reassurance.',
    lore: 'Perfect for nights when digital dreams feel jittery, this soft guardian brings warm hugs and calm thoughts.',
    nftImage: '/images/pretty-fine-plushies.png',
    physicalImage: '/images/pretty-fine-plushies-physical.png',
    backgroundColor: 'bg-pink-100',
    origin: 'Komorebi',
    abilities: ['Warm Hug', 'Silent Lullaby', 'Peace Field'],
    personalityTraits: ['Nurturing', 'Calming', 'Quiet'],
    weaknesses: ['Collects lint easily', 'Dozes off during action films'],
    habitat: 'Bedrooms, quiet corners',
    estimatedSupply: 150,
    discoveredDate: '2026.01.05',
    battleStats: { attack: 40, defense: 65, speed: 40, special: 90 }
  },
  {
    id: '014',
    slug: 'knownorigin',
    name: 'KnownOrigin',
    type: 'Vinyl',
    rarity: 'Legendary',
    element: 'Heritage',
    power: 'Provenance Shield',
    description: 'A one of a kind Kaiju honouring the acquisition of KnownOrigin by eBay.',
    lore: 'This keeper of stories safeguards the tale of creativity meeting commerce and encourages everyone to honour their origins.',
    nftImage: '/images/knownorigin.png',
    physicalImage: '/images/knownorigin-physical.png',
    backgroundColor: 'bg-violet-200',
    origin: 'Komorebi',
    abilities: ['Marketplace Insight', 'Authenticity Pulse', 'History Echo'],
    personalityTraits: ['Wise', 'Proud', 'Reflective'],
    weaknesses: ['Overloaded by counterfeit chatter', 'Grows somber in empty galleries'],
    habitat: 'Galleries, marketplaces',
    estimatedSupply: 1,
    discoveredDate: '2026.02.12',
    battleStats: { attack: 80, defense: 85, speed: 55, special: 95 }
  },
  {
    id: '015',
    slug: 'meebit',
    name: 'Meebit',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Voxel',
    power: 'Block Shift',
    description: 'A prototype Kaiju inspired by Meebit avatars.',
    lore: 'Meebit explores blocky realms and experiments with layouts for future generations.',
    nftImage: '/images/meebit.png',
    physicalImage: '/images/meebit-physical.png',
    backgroundColor: 'bg-gray-200',
    origin: 'Komorebi',
    abilities: ['Voxel Jump', 'Pixel Repair', 'Grid Flex'],
    personalityTraits: ['Experimental', 'Energetic', 'Adaptive'],
    weaknesses: ['Blurs in high resolution', 'Snaps under curved pressure'],
    habitat: 'Digital dioramas, test servers',
    estimatedSupply: 1,
    discoveredDate: '2026.03.08',
    battleStats: { attack: 70, defense: 60, speed: 85, special: 80 }
  },
  {
    id: '016',
    slug: 'aavegotchi',
    name: 'Aavegotchi',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Spectral Finance',
    power: 'Liquidity Drift',
    description: 'A one of one prototype Kaiju that bridges playful ghosts and defi dreams.',
    lore: 'Carrying the echo of pixel ghosts, Aavegotchi floats through markets and lends courage while yielding smiles.',
    nftImage: '/images/aavegotchi.png',
    physicalImage: '/images/aavegotchi-physical.png',
    backgroundColor: 'bg-purple-300',
    origin: 'Komorebi',
    abilities: ['Yield Chant', 'Collateral Cloak', 'Friendly Haunt'],
    personalityTraits: ['Friendly', 'Fickle', 'Resourceful'],
    weaknesses: ['Dissolves in bearish gloom', 'Loses shape without community'],
    habitat: 'Defi dashboards, pixel graveyards',
    estimatedSupply: 1,
    discoveredDate: '2026.04.14',
    battleStats: { attack: 75, defense: 70, speed: 80, special: 90 }
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
