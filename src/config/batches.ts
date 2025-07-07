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
      slug: 'uri',
      name: 'Uri',
      type: 'Vinyl',
      rarity: 'Rare',
      element: 'Ghost',
      power: 'Spectral Manipulation',
      description: 'A mysterious ghost-like entity that illuminates the darkness with an ethereal glow.',
      lore: 'Uri emerged from the liminal space between worlds, a being of pure ethereal energy that defies conventional understanding. First documented during the Great Convergence Event, Uri exhibits the unique ability to phase between dimensions.',
      nftImage: '/images/Ghost1.png',
      physicalImage: '/images/Uri_product_shot.png',
      conceptArt: ['/images/uri-concept-1.jpg', '/images/uri-concept-2.jpg'],
      backgroundColor: 'bg-purple-100',
      origin: 'The Ethereal Plane',
      abilities: ['Phase Shifting', 'Spectral Projection', 'Ethereal Communication', 'Dimensional Sensing', 'Energy Absorption'],
      personalityTraits: ['Mysterious and enigmatic', 'Protective of smaller entities', 'Drawn to sources of spiritual energy'],
      weaknesses: ['Vulnerable to iron-based materials', 'Loses power in areas of high electromagnetic interference'],
      habitat: 'Ethereal Plane intersections, ancient temples, areas of high spiritual activity',
      estimatedSupply: 500,
      discoveredDate: '2024.03.15',
      battleStats: { attack: 65, defense: 80, speed: 95, special: 100 }
    },
    {
      id: '002',
      slug: 'meme',
      name: 'Meme',
      type: 'Vinyl',
      rarity: 'Common',
      element: 'Water',
      power: 'Aquatic Mastery',
      description: 'Ancient water spirit with the ability to control rivers and rain.',
      lore: 'Meme is one of the oldest known Kaiju, with legends dating back over a thousand years. This aquatic guardian has been protector of waterways and marine life throughout the ages.',
      nftImage: '/images/Meme-NFT.png',
      physicalImage: '/images/Meme.png',
      backgroundColor: 'bg-blue-100',
      origin: 'Ancient Ocean Depths',
      abilities: ['Water Manipulation', 'Tsunami Generation', 'Rain Calling', 'Marine Telepathy', 'Healing Springs'],
      personalityTraits: ['Wise and ancient', 'Protector of marine life', 'Calm but fierce when threatened'],
      weaknesses: ['Vulnerable in arid environments', 'Loses power away from water sources'],
      habitat: 'Oceans, rivers, lakes, underwater caverns',
      estimatedSupply: 800,
      discoveredDate: '2023.11.20',
      battleStats: { attack: 75, defense: 85, speed: 70, special: 90 }
    },
    {
      id: '003',
      slug: 'diamond-hands',
      name: 'Diamond Hands',
      type: 'Vinyl',
      rarity: 'Ultra Rare',
      element: 'Earth',
      power: 'Crystalline Transformation',
      description: 'A legendary Kaiju with diamond-hard appendages and unbreakable resolve.',
      lore: 'Born from the pressure of millennia deep within the Earth\'s core, Diamond Hands represents the ultimate fusion of patience and strength. Its crystalline form can withstand any force.',
      nftImage: '/images/dragon.png',
      physicalImage: '/images/Diamond_hands_product_shot.png',
      backgroundColor: 'bg-gray-100',
      origin: 'Earth\'s Core',
      abilities: ['Diamond Skin', 'Crystal Shard Projection', 'Seismic Tremors', 'Mineral Detection', 'Pressure Resistance'],
      personalityTraits: ['Incredibly patient', 'Unshakeable determination', 'Values long-term thinking'],
      weaknesses: ['Slow movement speed', 'Vulnerable to sonic attacks'],
      habitat: 'Deep caves, mountain peaks, crystal formations',
      estimatedSupply: 200,
      discoveredDate: '2024.01.10',
      battleStats: { attack: 95, defense: 100, speed: 40, special: 85 }
    },
    {
      id: '004',
      slug: 'genesis-green',
      name: 'Genesis (Green)',
      type: 'Plush',
      rarity: 'Legendary',
      element: 'Nature',
      power: 'Life Force Manipulation',
      description: 'The original Kaiju design, representing the birth of all CryptoKaiju.',
      lore: 'Genesis Green is the primordial Kaiju from which all others are said to have evolved. Its connection to the life force of the planet makes it incredibly powerful and wise.',
      nftImage: '/images/Genesis-NFT.png',
      physicalImage: '/images/Green_genesis_product_shot.png',
      backgroundColor: 'bg-green-100',
      origin: 'The First Dimension',
      abilities: ['Life Restoration', 'Plant Growth', 'Nature Communication', 'Healing Aura', 'Ecosystem Balance'],
      personalityTraits: ['Ancient wisdom', 'Nurturing protector', 'Connected to all life'],
      weaknesses: ['Affected by environmental destruction', 'Vulnerable to corruption'],
      habitat: 'Primordial forests, sacred groves, life nexus points',
      estimatedSupply: 100,
      discoveredDate: '2023.10.01',
      battleStats: { attack: 80, defense: 90, speed: 75, special: 100 }
    },
    {
      id: '005',
      slug: 'genesis-blue',
      name: 'Genesis (Blue)',
      type: 'Plush',
      rarity: 'Legendary',
      element: 'Ice',
      power: 'Cryogenic Control',
      description: 'The ice variant of the original Genesis design, master of frozen realms.',
      lore: 'Genesis Blue emerged during the Great Freeze, adapting the original Genesis form to survive in the harshest cold. It now governs all frozen territories.',
      nftImage: '/images/Genesis-Blue-NFT.png',
      physicalImage: '/images/Blue_genesis_product_shot.png',
      backgroundColor: 'bg-blue-200',
      origin: 'The Frozen Wastes',
      abilities: ['Ice Manipulation', 'Blizzard Creation', 'Cryo-preservation', 'Absolute Zero Touch', 'Glacier Formation'],
      personalityTraits: ['Cool and calculating', 'Preserves ancient knowledge', 'Stoic guardian'],
      weaknesses: ['Vulnerable to extreme heat', 'Slower in warm climates'],
      habitat: 'Arctic regions, mountain glaciers, frozen caverns',
      estimatedSupply: 100,
      discoveredDate: '2023.10.01',
      battleStats: { attack: 85, defense: 95, speed: 60, special: 100 }
    },
    {
      id: '006',
      slug: 'kappa',
      name: 'Kappa',
      type: 'Vinyl',
      rarity: 'Common',
      element: 'Water',
      power: 'River Guardianship',
      description: 'Traditional water sprite known for protecting sacred waterways.',
      lore: 'Based on ancient Japanese folklore, Kappa serves as guardian of rivers and streams. Despite its mischievous nature, it\'s fiercely protective of aquatic ecosystems.',
      nftImage: '/images/kappa.png',
      physicalImage: '/images/kappa-physical.jpg',
      backgroundColor: 'bg-teal-100',
      origin: 'Japanese Folklore Realm',
      abilities: ['Water Blessing', 'Current Control', 'Aquatic Camouflage', 'River Purification', 'Swimmer\'s Aid'],
      personalityTraits: ['Mischievous but honorable', 'Respectful of traditions', 'Protective of water sources'],
      weaknesses: ['Power diminishes if head bowl empties', 'Bound by ancient codes'],
      habitat: 'Rivers, streams, traditional Japanese gardens',
      estimatedSupply: 600,
      discoveredDate: '2024.02.14',
      battleStats: { attack: 60, defense: 70, speed: 85, special: 75 }
    },
    {
      id: '007',
      slug: 'phoenix',
      name: 'Phoenix',
      type: 'Vinyl',
      rarity: 'Ultra Rare',
      element: 'Fire',
      power: 'Eternal Rebirth',
      description: 'The immortal phoenix that rises from ashes stronger than before.',
      lore: 'Every thousand years, Phoenix undergoes a spectacular rebirth, emerging more powerful than before. Its eternal cycle represents hope and renewal.',
      nftImage: '/images/phoenix.png',
      physicalImage: '/images/phoenix-physical.jpg',
      backgroundColor: 'bg-orange-100',
      origin: 'The Eternal Flame',
      abilities: ['Rebirth Cycle', 'Fire Mastery', 'Healing Tears', 'Solar Energy', 'Ash Transformation'],
      personalityTraits: ['Wise from countless lifetimes', 'Symbol of hope', 'Patient but passionate'],
      weaknesses: ['Vulnerable during rebirth process', 'Weakened by despair'],
      habitat: 'Volcanic peaks, solar temples, places of renewal',
      estimatedSupply: 150,
      discoveredDate: '2024.04.01',
      battleStats: { attack: 90, defense: 70, speed: 95, special: 100 }
    },
    {
      id: '008',
      slug: 'dragon',
      name: 'Dragon',
      type: 'Plush',
      rarity: 'Rare',
      element: 'Fire',
      power: 'Ancient Wisdom',
      description: 'Legendary dragon whose flames can forge the strongest metals.',
      lore: 'One of the most ancient and revered Kaiju, Dragon has witnessed the rise and fall of civilizations. Its knowledge spans eons, and its fire can create as well as destroy.',
      nftImage: '/images/dragon.png',
      physicalImage: '/images/dragon-physical.jpg',
      backgroundColor: 'bg-red-100',
      origin: 'The Ancient Peaks',
      abilities: ['Flame Breath', 'Metal Forging', 'Ancient Knowledge', 'Flight', 'Treasure Sensing'],
      personalityTraits: ['Ancient and wise', 'Proud but fair', 'Collector of knowledge'],
      weaknesses: ['Pride can be exploited', 'Vulnerable to betrayal'],
      habitat: 'Mountain peaks, ancient ruins, treasure vaults',
      estimatedSupply: 400,
      discoveredDate: '2023.12.05',
      battleStats: { attack: 95, defense: 85, speed: 80, special: 90 }
    },
    {
      id: '009',
      slug: 'lightning',
      name: 'Lightning',
      type: 'Vinyl',
      rarity: 'Rare',
      element: 'Electric',
      power: 'Storm Generation',
      description: 'Master of electrical storms and lightning strikes.',
      lore: 'Born from the first lightning strike, this Kaiju embodies the raw power of storms. Its presence heralds great changes and new beginnings.',
      nftImage: '/images/lightning.png',
      physicalImage: '/images/lightning-physical.jpg',
      backgroundColor: 'bg-yellow-100',
      origin: 'The Storm Realm',
      abilities: ['Lightning Control', 'Storm Summoning', 'Electrical Absorption', 'Speed Boost', 'EMP Generation'],
      personalityTraits: ['Energetic and unpredictable', 'Brings change', 'Quick to act'],
      weaknesses: ['Grounded by earth elements', 'Unstable in calm weather'],
      habitat: 'Storm clouds, electrical facilities, mountain tops',
      estimatedSupply: 300,
      discoveredDate: '2024.05.20',
      battleStats: { attack: 85, defense: 60, speed: 100, special: 95 }
    },
    {
      id: '010',
      slug: 'shadow',
      name: 'Shadow',
      type: 'Plush',
      rarity: 'Ultra Rare',
      element: 'Dark',
      power: 'Shadow Manipulation',
      description: 'Dweller of darkness with the ability to travel between shadows.',
      lore: 'Shadow exists in the spaces between light, a guardian of secrets and hidden knowledge. It moves unseen, protecting those who travel in darkness.',
      nftImage: '/images/shadow.png',
      physicalImage: '/images/shadow-physical.jpg',
      backgroundColor: 'bg-gray-900',
      origin: 'The Void Between',
      abilities: ['Shadow Travel', 'Invisibility', 'Dark Energy', 'Secret Keeping', 'Night Vision'],
      personalityTraits: ['Mysterious and secretive', 'Loyal guardian', 'Values privacy'],
      weaknesses: ['Weakened by bright light', 'Cannot exist without shadows'],
      habitat: 'Dark caves, moonless nights, hidden sanctuaries',
      estimatedSupply: 180,
      discoveredDate: '2024.06.15',
      battleStats: { attack: 80, defense: 75, speed: 90, special: 95 }
    },
    {
      id: '011',
      slug: 'crystal',
      name: 'Crystal',
      type: 'Vinyl',
      rarity: 'Rare',
      element: 'Earth',
      power: 'Prismatic Energy',
      description: 'Crystalline being that refracts light into powerful energy beams.',
      lore: 'Formed in the deepest crystal caves, this Kaiju has learned to harness and focus light energy through its crystalline body, creating spectacular displays of power.',
      nftImage: '/images/crystal.png',
      physicalImage: '/images/crystal-physical.jpg',
      backgroundColor: 'bg-indigo-100',
      origin: 'The Crystal Caverns',
      abilities: ['Light Refraction', 'Energy Beam', 'Crystal Growth', 'Hardness Control', 'Prismatic Shield'],
      personalityTraits: ['Reflective and thoughtful', 'Seeks clarity', 'Values precision'],
      weaknesses: ['Can be shattered by sonic attacks', 'Dulled by dirt and grime'],
      habitat: 'Crystal caves, geode formations, light temples',
      estimatedSupply: 350,
      discoveredDate: '2024.07.10',
      battleStats: { attack: 75, defense: 90, speed: 65, special: 85 }
    },
    {
      id: '012',
      slug: 'wind',
      name: 'Wind',
      type: 'Plush',
      rarity: 'Common',
      element: 'Air',
      power: 'Atmospheric Control',
      description: 'Ethereal being of pure air that commands the winds and weather.',
      lore: 'Wind is everywhere and nowhere, a gentle breeze one moment and a powerful gale the next. It carries messages across vast distances and brings change to stagnant places.',
      nftImage: '/images/wind.png',
      physicalImage: '/images/wind-physical.jpg',
      backgroundColor: 'bg-sky-100',
      origin: 'The Endless Sky',
      abilities: ['Wind Control', 'Weather Change', 'Message Carrying', 'Flight Assistance', 'Air Purification'],
      personalityTraits: ['Free-spirited and wandering', 'Brings news and change', 'Never stays in one place'],
      weaknesses: ['Cannot act in vacuum', 'Dispersed by extreme temperatures'],
      habitat: 'Open skies, mountain passes, windy plains',
      estimatedSupply: 700,
      discoveredDate: '2024.08.05',
      battleStats: { attack: 65, defense: 55, speed: 95, special: 80 }
    },
    {
      id: '013',
      slug: 'metal',
      name: 'Metal',
      type: 'Vinyl',
      rarity: 'Rare',
      element: 'Metal',
      power: 'Metallic Transformation',
      description: 'Robotic Kaiju with the ability to transform and adapt its metallic body.',
      lore: 'Created from the fusion of ancient magic and modern technology, Metal represents the harmony between tradition and innovation. Its adaptive abilities make it incredibly versatile.',
      nftImage: '/images/metal.png',
      physicalImage: '/images/metal-physical.jpg',
      backgroundColor: 'bg-slate-100',
      origin: 'The Forge of Worlds',
      abilities: ['Shape Shifting', 'Metal Manipulation', 'Technological Interface', 'Self-Repair', 'Magnetic Control'],
      personalityTraits: ['Logical but adaptable', 'Values innovation', 'Bridges old and new'],
      weaknesses: ['Vulnerable to rust and corrosion', 'EMP attacks disrupt systems'],
      habitat: 'Industrial zones, tech laboratories, metal refineries',
      estimatedSupply: 320,
      discoveredDate: '2024.09.12',
      battleStats: { attack: 85, defense: 95, speed: 70, special: 80 }
    },
    {
      id: '014',
      slug: 'cosmic',
      name: 'Cosmic',
      type: 'Plush',
      rarity: 'Legendary',
      element: 'Space',
      power: 'Stellar Manipulation',
      description: 'Celestial being that channels the power of stars and cosmic forces.',
      lore: 'Cosmic arrived from beyond the known universe, bringing with it the wisdom of distant galaxies. Its power is linked to stellar phenomena and cosmic events.',
      nftImage: '/images/cosmic.png',
      physicalImage: '/images/cosmic-physical.jpg',
      backgroundColor: 'bg-purple-900',
      origin: 'The Far Galaxy',
      abilities: ['Star Power', 'Cosmic Radiation', 'Gravity Control', 'Teleportation', 'Stellar Navigation'],
      personalityTraits: ['Otherworldly perspective', 'Vast knowledge', 'Peaceful but powerful'],
      weaknesses: ['Weakened by planetary atmospheres', 'Needs starlight to recharge'],
      habitat: 'Observatories, mountain peaks, open space',
      estimatedSupply: 80,
      discoveredDate: '2024.10.31',
      battleStats: { attack: 90, defense: 80, speed: 85, special: 100 }
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
  
  export const getBatchesByRarity = (rarity: string): KaijuBatch[] => {
    return KAIJU_BATCHES.filter(batch => batch.rarity === rarity)
  }
  
  export const getTotalEstimatedSupply = (): number => {
    return KAIJU_BATCHES.reduce((total, batch) => total + batch.estimatedSupply, 0)
  }