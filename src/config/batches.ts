// src/config/batches.ts - UPDATED VERSION WITH CHANGES
export interface KaijuBatch {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  essence: string
  availability: 'Secondary' | 'Mintable'
  colors: string[] // Array to handle single or multiple colors
  
  // LEGACY DESCRIPTION (keep for backward compatibility)
  description?: string
  
  // NEW SEPARATED DESCRIPTIONS (optional for gradual migration)
  characterDescription?: string  
  physicalDescription?: string   
  
  // LEGACY IMAGE STRUCTURE (keep for backward compatibility)
  physicalImage?: string
  nftImage?: string
  conceptArt?: string[]
  backgroundColor?: string
  
  // NEW ENHANCED IMAGE STRUCTURE (optional)
  images?: {
    physical: string[]        
    nft?: string             
    lifestyle: string[]      
    detail: string[]         
    concept: string[]        
    packaging: string[]      
  }
  
  // Character details
  habitat: string
  
  // NEW PHYSICAL PRODUCT DETAILS (optional)
  materials?: string           
  dimensions?: string         
  features?: string[]         
  packagingStyle?: string     
  productionNotes?: string   
  
  // Collection stats
  estimatedSupply: number
  discoveredDate: string
}

export const KAIJU_BATCHES: KaijuBatch[] = [
  // 001 Genesis - Enhanced version
  {
    id: '001',
    slug: 'genesis',
    name: 'Genesis',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'First Light',
    availability: 'Secondary',
    colors: ['Green', 'Purple'], // Multiple colors for Genesis
    
    characterDescription: 'Genesis carries memories from before Komorebi\'s first dawn, wrapped in a beloved dinosaur costume that has become part of his soul. Where he rests, old seeds remember how to grow and forgotten paths reveal themselves. His presence whispers that every ending holds a new beginning.',
    physicalDescription: 'Our inaugural CryptoKaiju design, Genesis represents the perfect fusion of nostalgic charm and modern craftsmanship. This premium vinyl figure captures the whimsical spirit of childhood imagination with its beloved dinosaur costume aesthetic.',
    
    images: {
      physical: ['/images/genesis-physical.png'],
      nft: '/images/genesis.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: Clear plastic bag with header card.
    },
    
    backgroundColor: 'bg-orange-200',
    habitat: 'The Sunrise Meadows of Hanakiri',
    
    materials: 'Premium vinyl with hand-painted acrylic details',
    dimensions: '4.5" tall x 3.2" wide x 2.8" deep',
    features: ['Rotating head mechanism', 'Removable dinosaur hood'],
    packagingStyle: 'Premium collector\'s window box',
    
    estimatedSupply: 300,
    discoveredDate: '2025.01.01'
  },

  // 002 Jaiantokoin - Legacy format
  {
    id: '002',
    slug: 'jaiantokoin',
    name: 'Jaiantokoin',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Community Heart',
    availability: 'Secondary',
    colors: ['Brown, Orange'],
    description: 'Jaiantokoin appears as a gentle giant whose round form and vintage cartoon movements remind everyone of simpler joys. His laughter echoes across valleys, calling scattered friends to gather. When communities need lifting, his presence alone lightens every burden.',
    nftImage: '/images/jaiantokoin.png',
    physicalImage: '/images/jaiantokoin-physical.png',
    backgroundColor: 'bg-brown-200',
    habitat: 'The gathering squares of Ashimura village',
    estimatedSupply: 500,
    discoveredDate: '2025.02.01'
  },

  // 003 Spooky - Legacy format
  {
    id: '003',
    slug: 'spooky',
    name: 'Spooky',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Gentle Glow',
    availability: 'Secondary',
    colors: ['Glow in the Dark'],
    description: 'Spooky emerges only when the moon is brightest, his phosphorescent scales catching starlight like captured dreams. He shares stories that make the darkness feel friendly and leaves glowing pawprints that guide night wanderers safely home.',
    nftImage: '/images/spookymon.png',
    physicalImage: '/images/spookymon-physical.png',
    backgroundColor: 'bg-indigo-100',
    habitat: 'Moonlit gardens in the hills of Tsukihama',
    estimatedSupply: 300,
    discoveredDate: '2025.03.13'
  },

  // 004 CryptoKitty - Legacy format
  {
    id: '004',
    slug: 'cryptokitty',
    name: 'CryptoKitty',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Inspiration\'s Touch',
    availability: 'Secondary',
    colors: ['White', 'Pink'],
    description: 'Born from the collaboration between realms, Kitten purrs with the frequency of pure creativity. When artists feel stuck, her gentle kneading motions help shape new ideas from the air itself. Her whiskers twitch whenever imagination stirs nearby.',
    nftImage: '/images/cryptokitty.png',
    physicalImage: '/images/cryptokitty-physical.png',
    backgroundColor: 'bg-blue-100',
    habitat: 'Kittyverse',
    estimatedSupply: 600,
    discoveredDate: '2025.04.05'
  },

  // 005 Dogejira - Legacy format
  {
    id: '005',
    slug: 'dogejira',
    name: 'Dogejira',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Infectious Cheer',
    availability: 'Secondary',
    colors: ['Yellow'],
    description: 'Dogejira bounds through Komorebi with the eternal optimism of a Shiba spirit, his grin so genuine it spreads like sunshine after rain. His playful energy turns mundane moments into small celebrations, reminding everyone that joy shared is joy doubled.',
    nftImage: '/images/dogejira.png',
    physicalImage: '/images/dogejira-physical.png',
    backgroundColor: 'bg-yellow-100',
    habitat: 'The flowering meadows around Sakuradani',
    estimatedSupply: 800,
    discoveredDate: '2025.05.12'
  },

  // 006 Sushi - Legacy format
  {
    id: '006',
    slug: 'sushi',
    name: 'Sushi',
    type: 'Plush',
    rarity: 'Common',
    essence: 'Nourishing Calm',
    availability: 'Secondary',
    colors: ['White', 'Orange'],
    description: 'Sushi carries the ocean\'s gentle rhythm in his rice-soft body, topped with the sweetest prawn crown. He appears wherever friends gather to share food and stories, bringing the peaceful satisfaction of a meal enjoyed together under open sky.',
    nftImage: '/images/sushi.png',
    physicalImage: '/images/sushi-physical.png',
    backgroundColor: 'bg-teal-100',
    habitat: 'Riverside cafés along the Hinokawa',
    estimatedSupply: 700,
    discoveredDate: '2025.06.18'
  },

  // 007 Mr Wasabi - Enhanced version
  {
    id: '007',
    slug: 'mr-wasabi',
    name: 'Mr Wasabi',
    type: 'Plush',
    rarity: 'Rare',
    essence: 'Wake-Up Call',
    availability: 'Mintable',
    colors: ['Green'],
    
    characterDescription: 'Mr Wasabi is a spicy little goofball, a bright emerald blob who zips around Komorebi pulling harmless pranks and popping out of teacups with a loud surprise. He makes noses tingle and eyes water for a heartbeat, then laughs and offers snacks.',
    physicalDescription: 'Mr Wasabi brings explosive personality in an irresistibly soft package. This premium plush collectible features a unique squishy texture that mimics the real thing, complete with subtle sparkle threads woven throughout his emerald surface.',
    
    images: {
      physical: ['/images/mr-wasabi-physical.png'],
      nft: '/images/mr-wasabi.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    backgroundColor: 'bg-green-200',
    habitat: 'The spice gardens of Mochigawa',
    
    materials: 'Ultra-soft minky plush with sparkle thread accents',
    dimensions: '3.8" tall x 4.2" wide x 3.5" deep',
    features: ['Extra-squishy texture', 'Embroidered facial features'],
    packagingStyle: 'Japanese-inspired gift box with character story card',
    
    estimatedSupply: 6,
    discoveredDate: '2025.07.22'
  },

  // 008 Sacramento Kings - Legacy format
  {
    id: '008',
    slug: 'sacramento-kings',
    name: 'Sacramento Kings',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Collective Strength',
    availability: 'Secondary',
    colors: ['Purple', 'Silver'],
    description: 'Team Spirit emerged when distant courts called for harmony. This gentle giant understands that every game is really about connection, teaching that the highest victory is when everyone leaves feeling more whole than when they arrived.',
    nftImage: '/images/sacramento-kings.png',
    physicalImage: '/images/sacramento-kings-physical.png',
    backgroundColor: 'bg-purple-300',
    habitat: 'Sacramento',
    estimatedSupply: 300,
    discoveredDate: '2025.08.15'
  },

  // 009 Meme - Legacy format
  {
    id: '009',
    slug: 'meme',
    name: 'Meme',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Island Dreams',
    availability: 'Secondary',
    colors: ['Yellow', 'Green'],
    description: 'Tide Dancer carries the eternal summer in his pineapple crest, bringing warm breezes that taste of salt and sunshine. He builds castles from crystallized laughter and teaches that some of life\'s greatest treasures wash up when we\'re not looking.',
    nftImage: '/images/meme-NFT.png',
    physicalImage: '/images/meme-physical.png',
    backgroundColor: 'bg-amber-200',
    habitat: 'The sunset beaches of Sumizawa bay',
    estimatedSupply: 500,
    discoveredDate: '2025.09.09'
  },

  // 010 Diamond Hands - Legacy format
  {
    id: '010',
    slug: 'diamond-hands',
    name: 'Diamond Hands',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    essence: 'Unwavering Faith',
    availability: 'Secondary',
    colors: ['Clear', 'Blue'],
    description: 'Diamond Hands moves through Kiyosawa\'s neon-kissed districts with the confidence of someone who has found their truth. In record shops and rooftop cafés, he listens to Deftones and Nas while sharing pizza and philosophy. His crystalline nature reflects only what is real.',
    nftImage: '/images/Diamond-Hands-NFT.png',
    physicalImage: '/images/Diamond_hands_product_shot.png',
    backgroundColor: 'bg-cyan-200',
    habitat: 'Urban rooftops and music venues in Kiyosawa city',
    estimatedSupply: 250,
    discoveredDate: '2025.10.18'
  },

  // 011 Spangle - Legacy format
  {
    id: '011',
    slug: 'spangle',
    name: 'Spangle',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Festival Joy',
    availability: 'Secondary',
    colors: ['Red', 'White', 'Blue'],
    description: 'Spangle appears whenever communities gather to celebrate, his star-spangled hide shimmering with the light of shared happiness. He hosts gatherings where neighbors become friends over shared stories and simple food, lighting up the sky with gratitude.',
    nftImage: '/images/spangle.png',
    physicalImage: '/images/spangle-physical.png',
    backgroundColor: 'bg-red-200',
    habitat: 'Festival fields throughout the outer villages',
    estimatedSupply: 300,
    discoveredDate: '2025.11.04'
  },

  // 012 Halloween Celebration - Legacy format
  {
    id: '012',
    slug: 'halloween-celebration',
    name: 'Halloween Celebration',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Playful Shadows',
    availability: 'Secondary',
    colors: ['Orange', 'Black'],
    description: 'Lantern Keeper emerges when autumn mists rise, his pumpkin belly glowing with warm amber light. He guides gentle twilight gatherings where shadows dance and stories come alive, occasionally summoning friendly spirits who giggle more than they frighten.',
    nftImage: '/images/halloween-celebration.png',
    physicalImage: '/images/halloween-celebration-physical.png',
    backgroundColor: 'bg-orange-300',
    habitat: 'The twilight porches of Ravnori town',
    estimatedSupply: 280,
    discoveredDate: '2025.10.31'
  },

  // 013 Pretty Fine Plushies - Legacy format
  {
    id: '013',
    slug: 'pretty-fine-plushies',
    name: 'Pretty Fine Plushies',
    type: 'Plush',
    rarity: 'Legendary',
    essence: 'Peaceful Sleep',
    availability: 'Mintable',
    colors: ['Pink', 'Purple'],
    description: 'Dream Weaver appears as Genesis\'s gentler twin, born from wishes whispered to pillows. He sails Komorebi\'s star-reflected lakes and skates through pastel parks, crafting sweet dreams from fondue, cheese toast, and towering ice cream sundaes shared with friends.',
    nftImage: '/images/pretty-fine-plushies.png',
    physicalImage: '/images/pretty-fine-plushies-physical.png',
    backgroundColor: 'bg-pink-100',
    habitat: 'Cozy bedrooms in villages across Komorebi',
    estimatedSupply: 150,
    discoveredDate: '2026.01.05'
  },

  // 014 KnownOrigin - Legacy format (no NFT image)
  {
    id: '014',
    slug: 'knownorigin',
    name: 'KnownOrigin',
    type: 'Vinyl',
    rarity: 'Legendary',
    essence: 'Story\'s Guardian',
    availability: 'Secondary',
    colors: ['Black', 'Gold'],
    description: 'Created to celebrate KnownOrigin being acquired by eBay for $68 million in 2022.',
    physicalImage: '/images/knownorigin-physical.png',
    backgroundColor: 'bg-violet-200',
    habitat: 'The grand archives of Kiyosawa',
    estimatedSupply: 1,
    discoveredDate: '2026.02.12'
  },

  // 015 Meebit - Legacy format (no NFT image)
  {
    id: '015',
    slug: 'meebit',
    name: 'Meebit',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    essence: 'Possibility\'s Map',
    availability: 'Secondary',
    colors: ['Pixelated'],
    description: 'Pixel Scout explores the geometric borderlands where ideas take shape, his blocky form shifting through dimensions of pure potential. He maps territories that don\'t exist yet, preparing space for dreams to build themselves.',
    physicalImage: '/images/meebit-physical.png',
    backgroundColor: 'bg-gray-200',
    habitat: 'The experimental districts of Terashima',
    estimatedSupply: 1,
    discoveredDate: '2026.03.08'
  },

  // 016 Aavegotchi - Legacy format (no NFT image)
  {
    id: '016',
    slug: 'aavegotchi',
    name: 'Aavegotchi',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    essence: 'Brave Crossing',
    availability: 'Secondary',
    colors: ['White', 'Purple'],
    description: 'Spirit Guide drifts between seen and unseen realms, his ghostly form flickering with courage-giving light. He appears to those facing difficult decisions, offering not answers but the certainty that they already carry what they need.',
    physicalImage: '/images/aavegotchi-physical.png',
    backgroundColor: 'bg-purple-300',
    habitat: 'The threshold bridges between all realms',
    estimatedSupply: 1,
    discoveredDate: '2026.04.14'
  },

  // 017 Uri - Legacy format
  {
    id: '017',
    slug: 'uri',
    name: 'Uri',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Gentle Guidance',
    availability: 'Secondary',
    colors: ['Blue', 'Glow in the Dark'],
    description: 'Uri drifts like morning fog between the creaking homes of Ravnori and the deep emerald woods of Virdara. His soft glow appears to lost travelers not as rescue, but as patient companionship, reminding them that being lost sometimes leads to the most important discoveries.',
    nftImage: '/images/uri.png',
    physicalImage: '/images/Uri_product_shot.png',
    backgroundColor: 'bg-indigo-200',
    habitat: 'The misty paths of Virdara forest',
    estimatedSupply: 125,
    discoveredDate: '2026.05.30'
  }
]

// Helper functions remain the same
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