// src/config/batches.ts - UPDATED WITH OPTIONAL PROPERTIES
export interface KaijuBatch {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  essence: string
  availability: 'Secondary' | 'Mintable'
  colors: string[] // Array to handle single or multiple colors
  
  // SEPARATED DESCRIPTIONS
  characterDescription: string  
  physicalDescription: string   
  
  // ENHANCED IMAGE STRUCTURE
  images: {
    physical: string[]        
    nft?: string             
    lifestyle: string[]      
    detail: string[]         
    concept: string[]        
    packaging: string[]      
  }
  
  // Character details
  habitat?: string // Made optional
  
  // PHYSICAL PRODUCT DETAILS - Made optional since not all batches have complete info
  materials?: string           
  dimensions?: string         
  features?: string[]         
  packagingStyle?: string     
  productionNotes?: string   
  
  // Collection stats
  estimatedSupply: number
  discoveredDate: string
  
  // SECONDARY MARKET URL
  secondaryMarketUrl?: string
  
  // Legacy fields (for backward compatibility - can be removed later)
  backgroundColor?: string
}

export const KAIJU_BATCHES: KaijuBatch[] = [
  // 001 Genesis
  {
    id: '001',
    slug: 'genesis',
    name: 'Genesis',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'First Light',
    availability: 'Secondary',
    colors: ['Green', 'Orange'],
    
    characterDescription: 'Genesis carries memories from before Komorebi\'s first dawn, wrapped in a beloved dinosaur costume that has become part of his soul. Where he rests, old seeds remember how to grow and forgotten paths reveal themselves. His presence whispers that every ending holds a new beginning.',
    physicalDescription: 'Our inaugural CryptoKaiju design, Genesis represents the perfect fusion of nostalgic charm and modern craftsmanship. This premium vinyl figure captures the whimsical spirit of childhood imagination with its beloved dinosaur costume aesthetic.',
    
    images: {
      physical: ['/images/genesis-physical.png'],
      nft: '/images/genesis.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The Sunrise Meadows of Hanakiri',
    
    materials: 'Premium vinyl with hand-painted acrylic details',
    dimensions: '4.5" tall x 3.2" wide x 2.8" deep',
    features: ['Rotating head mechanism', 'Removable dinosaur hood'],
    packagingStyle: 'Premium collector\'s window box with embossed CryptoKaiju logo',
    
    estimatedSupply: 300,
    discoveredDate: '2025.01.01',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Genesis',
    backgroundColor: 'bg-orange-200'
  },

  // 002 Jaiantokoin
  {
    id: '002',
    slug: 'jaiantokoin',
    name: 'Jaiantokoin',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Community Heart',
    availability: 'Secondary',
    colors: ['Brown'],
    
    characterDescription: 'Jaiantokoin appears as a gentle giant whose round form and vintage cartoon movements remind everyone of simpler joys. His laughter echoes across valleys, calling scattered friends to gather. When communities need lifting, his presence alone lightens every burden.',
    physicalDescription: 'Jaiantokoin embodies the spirit of community and togetherness in a lovingly crafted vinyl figure. His warm brown coloring and friendly expression make him a perfect centerpiece for any collection.',
    
    images: {
      physical: ['/images/jaiantokoin-physical.png'],
      nft: '/images/jaiantokoin.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The gathering squares of Ashimura village',
    
    materials: 'High-quality vinyl with matte finish',
    dimensions: '4.2" tall x 3.8" wide x 3.0" deep',
    features: ['Soft-touch surface finish', 'Weighted base for stability'],
    packagingStyle: 'Collector\'s window box with character artwork and story details',
    
    estimatedSupply: 500,
    discoveredDate: '2025.02.01',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Jaiantokoin',
    backgroundColor: 'bg-brown-200'
  },

  // 003 Spooky
  {
    id: '003',
    slug: 'spooky',
    name: 'Spooky',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Gentle Glow',
    availability: 'Secondary',
    colors: ['Glow in the Dark'],
    
    characterDescription: 'Spooky emerges only when the moon is brightest, his phosphorescent scales catching starlight like captured dreams. He shares stories that make the darkness feel friendly and leaves glowing pawprints that guide night wanderers safely home.',
    physicalDescription: 'A mesmerizing glow-in-the-dark vinyl figure that transforms from day to night. Spooky\'s phosphorescent properties create an enchanting display that continues to glow long after lights out.',
    
    images: {
      physical: ['/images/spookymon-physical.png'],
      nft: '/images/spookymon.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Moonlit gardens in the hills of Tsukihama',
    
    materials: 'Glow-in-the-dark vinyl with phosphorescent coating',
    dimensions: '4.0" tall x 3.5" wide x 2.8" deep',
    features: ['Long-lasting glow properties', 'UV-reactive elements'],
    packagingStyle: 'Collector\'s window box with UV-reactive elements that glow alongside the figure',
    
    estimatedSupply: 300,
    discoveredDate: '2025.03.13',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Spooky',
    backgroundColor: 'bg-indigo-100'
  },

  // 004 CryptoKitty
  {
    id: '004',
    slug: 'cryptokitty',
    name: 'CryptoKitty',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Inspiration\'s Touch',
    availability: 'Secondary',
    colors: ['White', 'Pink'],
    
    characterDescription: 'Born from the collaboration between realms, Kitten purrs with the frequency of pure creativity. When artists feel stuck, her gentle kneading motions help shape new ideas from the air itself. Her whiskers twitch whenever imagination stirs nearby.',
    physicalDescription: 'A charming collaboration piece celebrating the bridge between CryptoKaiju and CryptoKitties. This adorable vinyl figure features the iconic kitty design reimagined in the CryptoKaiju aesthetic.',
    
    images: {
      physical: ['/images/cryptokitty-physical.png'],
      nft: '/images/cryptokitty.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Kittyverse',
    
    materials: 'Premium vinyl with gradient color finish',
    dimensions: '3.8" tall x 3.5" wide x 2.5" deep',
    features: ['Gradient coloring technique', 'Collaboration exclusive design'],
    packagingStyle: 'Co-branded premium window box featuring both CryptoKaiju and CryptoKitties artwork',
    
    estimatedSupply: 600,
    discoveredDate: '2025.04.05',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=CryptoKitty',
    backgroundColor: 'bg-blue-100'
  },

  // 005 Dogejira
  {
    id: '005',
    slug: 'dogejira',
    name: 'Dogejira',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Infectious Cheer',
    availability: 'Secondary',
    colors: ['Yellow'],
    
    characterDescription: 'Dogejira bounds through Komorebi with the eternal optimism of a Shiba spirit, his grin so genuine it spreads like sunshine after rain. His playful energy turns mundane moments into small celebrations, reminding everyone that joy shared is joy doubled.',
    physicalDescription: 'Capturing the infectious joy of the beloved Dogecoin meme, Dogejira brings perpetual happiness to any collection. His bright yellow coloring and unmistakable grin embody the spirit of community and fun.',
    
    images: {
      physical: ['/images/dogejira-physical.png'],
      nft: '/images/dogejira.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The flowering meadows around Sakuradani',
    
    materials: 'Bright yellow vinyl with gloss finish',
    dimensions: '4.1" tall x 3.7" wide x 2.9" deep',
    features: ['Signature Shiba Inu expression', 'High-gloss finish for vibrant color'],
    packagingStyle: 'Collector\'s window box with meme-inspired artwork and character story',
    
    estimatedSupply: 800,
    discoveredDate: '2025.05.12',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Dogejira',
    backgroundColor: 'bg-yellow-100'
  },

  // 006 Sushi
  {
    id: '006',
    slug: 'sushi',
    name: 'Sushi',
    type: 'Plush',
    rarity: 'Common',
    essence: 'Nourishing Calm',
    availability: 'Secondary',
    colors: ['White', 'Orange'],
    
    characterDescription: 'Sushi carries the ocean\'s gentle rhythm in his rice-soft body, topped with the sweetest prawn crown. He appears wherever friends gather to share food and stories, bringing the peaceful satisfaction of a meal enjoyed together under open sky.',
    physicalDescription: 'An adorable sushi-themed plush collectible that brings kawaii culture to life. Soft white rice base topped with a perfectly crafted orange prawn, designed to evoke the comfort and joy of sharing a meal with friends.',
    
    images: {
      physical: ['/images/sushi-physical.png'],
      nft: '/images/sushi.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Riverside cafés along the Hinokawa',
    
    materials: 'Ultra-soft minky plush with embroidered details',
    dimensions: '3.5" tall x 4.0" wide x 4.0" deep',
    features: ['Food-safe materials', 'Machine washable', 'Embroidered facial features'],
    packagingStyle: 'Japanese-inspired gift box with food-themed artwork and care instructions',
    
    estimatedSupply: 700,
    discoveredDate: '2025.06.18',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Sushi',
    backgroundColor: 'bg-teal-100'
  },

  // 007 Mr Wasabi
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
    
    habitat: 'The spice gardens of Mochigawa',
    
    materials: 'Ultra-soft minky plush with sparkle thread accents',
    dimensions: '3.8" tall x 4.2" wide x 3.5" deep',
    features: ['Extra-squishy texture', 'Sparkle thread details', 'Embroidered facial features'],
    packagingStyle: 'Japanese-inspired gift box with magnetic closure and character story card',
    
    estimatedSupply: 6,
    discoveredDate: '2025.07.22',
    
    backgroundColor: 'bg-green-200'
  },

  // 008 Sacramento Kings
  {
    id: '008',
    slug: 'sacramento-kings',
    name: 'Sacramento Kings',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Collective Strength',
    availability: 'Secondary',
    colors: ['Purple', 'Silver'],
    
    characterDescription: 'Team Spirit emerged when distant courts called for harmony. This gentle giant understands that every game is really about connection, teaching that the highest victory is when everyone leaves feeling more whole than when they arrived.',
    physicalDescription: 'A special collaboration piece celebrating the partnership with Sacramento Kings. This premium vinyl figure features the team\'s iconic purple and silver colors while maintaining the distinctive CryptoKaiju character design.',
    
    images: {
      physical: ['/images/sacramento-kings-physical.png'],
      nft: '/images/sacramento-kings.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Sacramento',
    
    materials: 'Premium vinyl with metallic silver accents',
    dimensions: '4.3" tall x 3.6" wide x 2.8" deep',
    features: ['Official team collaboration', 'Metallic finish details', 'Limited edition numbering'],
    packagingStyle: 'Co-branded premium window box featuring Sacramento Kings and CryptoKaiju branding',
    
    estimatedSupply: 300,
    discoveredDate: '2025.08.15',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Sacramento%20Kings',
    backgroundColor: 'bg-purple-300'
  },

  // 009 Meme
  {
    id: '009',
    slug: 'meme',
    name: 'Meme',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Island Dreams',
    availability: 'Secondary',
    colors: ['Yellow', 'Green'],
    
    characterDescription: 'Tide Dancer carries the eternal summer in his pineapple crest, bringing warm breezes that taste of salt and sunshine. He builds castles from crystallized laughter and teaches that some of life\'s greatest treasures wash up when we\'re not looking.',
    physicalDescription: 'A tropical-themed vinyl figure that embodies the spirit of endless summer. The vibrant yellow and green coloring evokes pineapples and palm trees, bringing vacation vibes to any collection.',
    
    images: {
      physical: ['/images/meme-physical.png'],
      nft: '/images/meme-NFT.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The sunset beaches of Sumizawa bay',
    
    materials: 'Vinyl with tropical gradient finish',
    dimensions: '4.4" tall x 3.4" wide x 3.0" deep',
    features: ['Tropical color scheme', 'Textured pineapple details', 'Summer-themed design'],
    packagingStyle: 'Collector\'s window box with tropical beach artwork and character backstory',
    
    estimatedSupply: 500,
    discoveredDate: '2025.09.09',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Meme',
    backgroundColor: 'bg-amber-200'
  },

  // 010 Diamond Hands
  {
    id: '010',
    slug: 'diamond-hands',
    name: 'Diamond Hands',
    type: 'Vinyl',
    rarity: 'Common',
    essence: 'Cultured Conviction',
    availability: 'Mintable',
    colors: ['Robin Egg'],
    
    characterDescription: 'Diamond Hands are the cool heads of the CryptoKaiju crew, city born strategists with nerves like crystal. They roll through Kiyosawa\'s shopping district on scuffed skateboards, pause at record stalls, and map futures while the needle hums. They study the quiet craft of Auralee, Comoli, Maatee and Sons, and the playful grit of Nike SB, treating each label like a blueprint for balance. Culture is their compass, pizza their pause, patience their mantra. When markets shiver they read the current, hold firm, and guide the others.',
    physicalDescription: 'A stunning translucent vinyl figure that embodies the crypto culture concept of "diamond hands." Robin blue with a silver pouch on its stomach, featuring a vibrant diamond emblem at the centre. Its look is a direct nod to the Diamond Supply Co. x Dunk Low Pro SB "Tiffany", one of the most iconic Nike SB releases of all time.',
    
    images: {
      physical: ['/images/Diamond_hands_product_shot.png',
                 '/images/Diamond_hands_product_shot_2.png',
                  '/images/Diamond_hands_product_shot_3.png',
                  '/images/Diamond_hands_product_shot_4.png'
      ],
      nft: '/images/Diamond-Hands-NFT.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Urban rooftops and music venues in Kiyosawa city',
    
    materials: 'Robin egg body with metallic silver pouch and diamond emblem',
    dimensions: '5.5" tall',
    packagingStyle: 'Blister pack with holographic foiled backing card',
    
    estimatedSupply: 150,
    discoveredDate: '2022.08.31',
    
    backgroundColor: 'bg-cyan-700'
  },

  // 011 Spangle
  {
    id: '011',
    slug: 'spangle',
    name: 'Spangle',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Festival Joy',
    availability: 'Secondary',
    colors: ['Red', 'White', 'Blue'],
    
    characterDescription: 'Spangle appears whenever communities gather to celebrate, his star-spangled hide shimmering with the light of shared happiness. He hosts gatherings where neighbors become friends over shared stories and simple food, lighting up the sky with gratitude.',
    physicalDescription: 'A patriotic celebration in vinyl form, featuring the classic red, white, and blue color scheme with star-spangled detailing. This figure embodies the spirit of community gatherings and shared celebrations.',
    
    images: {
      physical: ['/images/spangle-physical.png'],
      nft: '/images/spangle.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Festival fields throughout the outer villages',
    
    materials: 'Vinyl with metallic star detailing and patriotic finish',
    dimensions: '4.2" tall x 3.9" wide x 2.7" deep',
    features: ['Metallic star accents', 'Patriotic color scheme', 'Festival-themed design'],
    packagingStyle: 'Collector\'s window box with patriotic artwork and celebration theme',
    
    estimatedSupply: 300,
    discoveredDate: '2025.11.04',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Spangle',
    backgroundColor: 'bg-red-200'
  },

  // 012 Halloween Celebration
  {
    id: '012',
    slug: 'halloween-celebration',
    name: 'Halloween Celebration',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Playful Shadows',
    availability: 'Secondary',
    colors: ['Orange', 'Black'],
    
    characterDescription: 'Lantern Keeper emerges when autumn mists rise, his pumpkin belly glowing with warm amber light. He guides gentle twilight gatherings where shadows dance and stories come alive, occasionally summoning friendly spirits who giggle more than they frighten.',
    physicalDescription: 'A spooky-fun Halloween-themed vinyl figure perfect for autumn celebrations. The warm orange and black coloring creates a perfect jack-o\'-lantern aesthetic that captures the playful spirit of Halloween.',
    
    images: {
      physical: ['/images/halloween-celebration-physical.png'],
      nft: '/images/halloween-celebration.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The twilight porches of Ravnori town',
    
    materials: 'Vinyl with glow-in-the-dark orange accents',
    dimensions: '4.1" tall x 3.7" wide x 3.1" deep',
    features: ['Glow-in-the-dark pumpkin details', 'Halloween-themed design', 'Seasonal collectible'],
    packagingStyle: 'Halloween-themed collector\'s window box with autumn artwork and spooky story',
    
    estimatedSupply: 280,
    discoveredDate: '2025.10.31',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Halloween%20Celebration',
    backgroundColor: 'bg-orange-300'
  },

  // 013 Pretty Fine Plushies
  {
    id: '013',
    slug: 'pretty-fine-plushies',
    name: 'Pretty Fine Plushies',
    type: 'Plush',
    rarity: 'Legendary',
    essence: 'Peaceful Sleep',
    availability: 'Mintable',
    colors: ['Pink', 'Purple'],
    
    characterDescription: 'Dream Weaver appears as Genesis\'s gentler twin, born from wishes whispered to pillows. He sails Komorebi\'s star-reflected lakes and skates through pastel parks, crafting sweet dreams from fondue, cheese toast, and towering ice cream sundaes shared with friends.',
    physicalDescription: 'The legendary Dream Weaver plush represents the pinnacle of CryptoKaiju craftsmanship. This ultra-soft collectible features gradient pink and purple coloring that seems to shift like twilight clouds, perfect for bedtime companions.',
    
    images: {
      physical: ['/images/pretty-fine-plushies-physical.png'],
      nft: '/images/pretty-fine-plushies.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'Cozy bedrooms in villages across Komorebi',
    
    materials: 'Premium plush with gradient dye technique and cloud-soft stuffing',
    dimensions: '5.0" tall x 4.5" wide x 4.0" deep',
    features: ['Gradient color transition', 'Ultra-soft cloud texture', 'Sleep-themed design', 'Legendary rarity'],
    packagingStyle: 'Deluxe gift box with satin interior, numbered certificate, and exclusive art prints',
    
    estimatedSupply: 150,
    discoveredDate: '2026.01.05',
    
    backgroundColor: 'bg-pink-100'
  },

  // 014 KnownOrigin
  {
    id: '014',
    slug: 'knownorigin',
    name: 'KnownOrigin',
    type: 'Vinyl',
    rarity: 'Legendary',
    essence: 'Story\'s Guardian',
    availability: 'Secondary',
    colors: ['Black', 'Gold'],
    
    characterDescription: 'Created to celebrate KnownOrigin being acquired by eBay for $68 million in 2022, this legendary guardian stands as a monument to the evolution of digital art and NFT marketplaces. He archives the stories of creators and collectors, preserving the history of artistic innovation.',
    physicalDescription: 'A one-of-a-kind legendary vinyl figure commemorating the historic KnownOrigin acquisition. The striking black and gold colorway represents the premium nature of this exclusive collaboration piece.',
    
    images: {
      physical: ['/images/knownorigin-physical.png'],
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The grand archives of Kiyosawa',
    
    materials: 'Premium vinyl with 24k gold leaf accents and matte black finish',
    dimensions: '4.8" tall x 3.5" wide x 3.0" deep',
    features: ['24k gold leaf details', 'Commemorative design', 'One-of-a-kind legendary status'],
    packagingStyle: 'Museum-quality collector\'s case with certificate of authenticity and acquisition history',
    productionNotes: 'Single piece created to commemorate the $68M KnownOrigin acquisition by eBay in 2022.',
    
    estimatedSupply: 1,
    discoveredDate: '2026.02.12',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=KnownOrigin',
    backgroundColor: 'bg-violet-200'
  },

  // 015 Meebit
  {
    id: '015',
    slug: 'meebit',
    name: 'Meebit',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    essence: 'Possibility\'s Map',
    availability: 'Secondary',
    colors: ['Pixelated'],
    
    characterDescription: 'Pixel Scout explores the geometric borderlands where ideas take shape, his blocky form shifting through dimensions of pure potential. He maps territories that don\'t exist yet, preparing space for dreams to build themselves.',
    physicalDescription: 'A unique collaboration piece celebrating the Meebits collection. This ultra-rare vinyl captures the distinctive voxel aesthetic in physical form, bridging the gap between 3D NFTs and collectible figures.',
    
    images: {
      physical: ['/images/meebit-physical.png'],
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The experimental districts of Terashima',
    
    materials: 'Vinyl with pixelated texture finish and geometric detailing',
    dimensions: '4.0" tall x 3.0" wide x 3.0" deep',
    features: ['Voxel-inspired design', 'Geometric texture work', 'Collaboration exclusive'],
    packagingStyle: 'Minimalist collector\'s box with pixelated artwork and digital art history',
    productionNotes: 'Single collaborative piece celebrating the intersection of 3D voxel art and physical collectibles.',
    
    estimatedSupply: 1,
    discoveredDate: '2026.03.08',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Meebit',
    backgroundColor: 'bg-gray-200'
  },

  // 016 Aavegotchi
  {
    id: '016',
    slug: 'aavegotchi',
    name: 'Aavegotchi',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    essence: 'Brave Crossing',
    availability: 'Secondary',
    colors: ['White', 'Purple'],
    
    characterDescription: 'Spirit Guide drifts between seen and unseen realms, his ghostly form flickering with courage-giving light. He appears to those facing difficult decisions, offering not answers but the certainty that they already carry what they need.',
    physicalDescription: 'A mystical collaboration piece celebrating the Aavegotchi protocol. This ultra-rare vinyl features the iconic ghost design with translucent elements that capture the ethereal nature of DeFi spirits.',
    
    images: {
      physical: ['/images/aavegotchi-physical.png'],
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The threshold bridges between all realms',
    
    materials: 'Vinyl with translucent white base and metallic purple accents',
    dimensions: '3.8" tall x 3.2" wide x 2.5" deep',
    features: ['Translucent ghost effect', 'DeFi protocol collaboration', 'Mystical design elements'],
    packagingStyle: 'Ethereal collector\'s box with holographic elements and protocol information',
    productionNotes: 'Exclusive collaboration celebrating the Aavegotchi DeFi gaming protocol.',
    
    estimatedSupply: 1,
    discoveredDate: '2026.04.14',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Aavegotchi',
    backgroundColor: 'bg-purple-300'
  },

  // 017 Uri
  {
    id: '017',
    slug: 'uri',
    name: 'Uri',
    type: 'Vinyl',
    rarity: 'Rare',
    essence: 'Gentle Guidance',
    availability: 'Secondary',
    colors: ['Blue', 'Glow in the Dark'],
    
    characterDescription: 'Uri drifts like morning fog between the creaking homes of Ravnori and the deep emerald woods of Virdara. His soft glow appears to lost travelers not as rescue, but as patient companionship, reminding them that being lost sometimes leads to the most important discoveries.',
    physicalDescription: 'A mystical vinyl figure that combines calming blue tones with enchanting glow-in-the-dark properties. Uri\'s ethereal presence brings a sense of peace and guidance to any collection.',
    
    images: {
      physical: ['/images/Uri_product_shot.png'],
      nft: '/images/uri.png',
      lifestyle: [],
      detail: [],
      concept: [],
      packaging: []
    },
    
    habitat: 'The misty paths of Virdara forest',
    
    materials: 'Vinyl with glow-in-the-dark blue coating and phosphorescent details',
    dimensions: '4.3" tall x 3.4" wide x 2.9" deep',
    features: ['Dual blue and glow properties', 'Guidance-themed design', 'Mystical forest aesthetic'],
    packagingStyle: 'Collector\'s window box with forest artwork and guidance story theme',
    
    estimatedSupply: 125,
    discoveredDate: '2026.05.30',
    
    secondaryMarketUrl: 'https://opensea.io/collection/cryptokaiju?search[stringTraits][0][name]=Uri',
    backgroundColor: 'bg-indigo-200'
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