// src/config/batches.ts - ENHANCED FOR THREE-TAB APPROACH
export interface KaijuBatch {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  element: string
  essence: string
  
  // SEPARATED DESCRIPTIONS
  characterDescription: string  // Pure lore/narrative about the character
  physicalDescription: string   // Details about the actual collectible
  
  // ENHANCED IMAGE STRUCTURE
  images: {
    physical: string[]        // Multiple physical product shots
    nft?: string             // Single NFT image (optional)
    lifestyle: string[]      // Toy in environments, with people, in use
    detail: string[]         // Close-ups of features, textures, accessories
    concept: string[]        // Concept art and sketches
    packaging: string[]      // Box art, unboxing shots, packaging design
  }
  
  backgroundColor: string
  
  // Character details (for lore)
  habitat: string
  
  // Physical product details
  materials: string           // "Premium vinyl with hand-painted details"
  dimensions: string         // "4.5" tall x 3.2" wide"
  features: string[]         // ["Rotating head", "Removable accessories", "Glow-in-dark eyes"]
  packagingStyle: string     // "Collectible window box with character artwork"
  productionNotes?: string   // Special manufacturing details
  
  // Collection stats
  estimatedSupply: number
  discoveredDate: string
}

export const KAIJU_BATCHES: KaijuBatch[] = [
  // 001 Genesis - EXAMPLE WITH FULL DATA
  {
    id: '001',
    slug: 'genesis',
    name: 'Genesis',
    type: 'Vinyl',
    rarity: 'Rare',
    element: 'Ancient Ember',
    essence: 'First Light',
    
    characterDescription: 'Genesis carries memories from before Komorebi\'s first dawn, wrapped in a beloved dinosaur costume that has become part of his soul. Where he rests, old seeds remember how to grow and forgotten paths reveal themselves. His presence whispers that every ending holds a new beginning, and children who find him discover that growing up doesn\'t mean leaving wonder behind.',
    
    physicalDescription: 'Our inaugural CryptoKaiju design, Genesis represents the perfect fusion of nostalgic charm and modern craftsmanship. This premium vinyl figure captures the whimsical spirit of childhood imagination with its beloved dinosaur costume aesthetic. Each figure is hand-painted with meticulous attention to detail, featuring subtle weathering effects that give Genesis his lived-in, treasured toy appearance.',
    
    images: {
      physical: [
        '/images/genesis-physical.png',
        '/images/genesis-front-view.png', 
        '/images/genesis-side-profile.png'
      ],
      nft: '/images/genesis.png',
      lifestyle: [
        '/images/genesis-on-desk.png',
        '/images/genesis-in-garden.png'
      ],
      detail: [
        '/images/genesis-face-closeup.png',
        '/images/genesis-costume-texture.png'
      ],
      concept: [
        '/images/genesis-concept-1.png',
        '/images/genesis-sketch.png'
      ],
      packaging: [
        '/images/genesis-box-front.png',
        '/images/genesis-unboxing.png'
      ]
    },
    
    backgroundColor: 'bg-orange-200',
    habitat: 'The Sunrise Meadows of Hanakiri',
    
    materials: 'Premium vinyl with hand-painted acrylic details and protective matte coating',
    dimensions: '4.5" tall x 3.2" wide x 2.8" deep',
    features: ['Rotating head mechanism', 'Removable dinosaur hood', 'Weighted base for stability'],
    packagingStyle: 'Premium collector\'s window box with original character artwork and lore insert',
    productionNotes: 'Limited first edition features special metallic accents on the dinosaur scales.',
    
    estimatedSupply: 300,
    discoveredDate: '2025.01.01'
  },
  
  // 007 Mr Wasabi - EXAMPLE WITH RICH DETAIL DATA
  {
    id: '007',
    slug: 'mr-wasabi',
    name: 'Mr Wasabi',
    type: 'Plush',
    rarity: 'Rare',
    element: 'Living Zest',
    essence: 'Wake-Up Call',
    
    characterDescription: 'Mr Wasabi is a spicy little goofball, a bright emerald blob who zips around Komorebi pulling harmless pranks and popping out of teacups with a loud surprise. He makes noses tingle and eyes water for a heartbeat, then laughs and offers snacks. The postman is his sworn rival; a single knock at the door can send him into a tiny tempest until someone waves soy sauce or a new trick in front of him.',
    
    physicalDescription: 'Mr Wasabi brings explosive personality in an irresistibly soft package. This premium plush collectible features a unique squishy texture that mimics the real thing, complete with subtle sparkle threads woven throughout his emerald surface. His mischievous expression is embroidered with precision, capturing that perfect moment of cheeky anticipation.',
    
    images: {
      physical: [
        '/images/mr-wasabi-physical.png',
        '/images/mr-wasabi-squeezed.png',
        '/images/mr-wasabi-multiple-angles.png'
      ],
      nft: '/images/mr-wasabi.png',
      lifestyle: [
        '/images/mr-wasabi-with-sushi.png',
        '/images/mr-wasabi-kitchen-scene.png',
        '/images/mr-wasabi-prank-setup.png'
      ],
      detail: [
        '/images/mr-wasabi-face-detail.png',
        '/images/mr-wasabi-texture-closeup.png',
        '/images/mr-wasabi-size-comparison.png'
      ],
      concept: [
        '/images/mr-wasabi-original-concept.png',
        '/images/mr-wasabi-expression-studies.png'
      ],
      packaging: [
        '/images/mr-wasabi-special-box.png',
        '/images/mr-wasabi-tissue-paper.png'
      ]
    },
    
    backgroundColor: 'bg-green-200',
    habitat: 'The spice gardens of Mochigawa',
    
    materials: 'Ultra-soft minky plush with sparkle thread accents and premium polyester fill',
    dimensions: '3.8" tall x 4.2" wide x 3.5" deep',
    features: ['Extra-squishy texture', 'Embroidered facial features', 'Hidden surprise squeaker'],
    packagingStyle: 'Japanese-inspired gift box with tissue paper and character story card',
    productionNotes: 'Each Mr Wasabi includes a unique "prank card" with silly joke suggestions.',
    
    estimatedSupply: 6,
    discoveredDate: '2025.07.22'
  }
  
  // NOTE: Add similar enhanced data structure to all other batches
  // For now, I'll show the structure with these two examples
  // The rest would follow the same pattern with appropriate image arrays and descriptions
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