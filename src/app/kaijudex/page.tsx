// src/app/kaijudex/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Zap, Package, Clock, Database, Cpu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'

interface KaijuCharacter {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  status: 'available' | 'sold-out' | 'coming-soon'
  
  // Stats
  totalMinted?: number // Will be fetched dynamically
  rarityPercentage: number
  releaseYear: number
  batch: string // For OpenSea API lookup
  
  // Visual assets
  nftImage: string
  physicalImage: string
  
  // Character details
  power: string
  element: string
  origin: string
  discoveredDate: string
}

// Sample data - replace with your actual character data
const kaijuDatabase: KaijuCharacter[] = [
  {
    id: '001',
    slug: 'uri',
    name: 'Uri',
    type: 'Plush',
    rarity: 'Rare',
    status: 'available',
    rarityPercentage: 20,
    releaseYear: 2024,
    batch: 'Uri',
    nftImage: '/images/Ghost1.png',
    physicalImage: '/images/Uri_product_shot.png',
    power: 'Spectral Manipulation',
    element: 'Ghost',
    origin: 'The Ethereal Plane',
    discoveredDate: '2024.03.15'
  },
  {
    id: '002',
    slug: 'meme',
    name: 'Meme',
    type: 'Vinyl',
    rarity: 'Common',
    status: 'available',
    rarityPercentage: 35,
    releaseYear: 2024,
    batch: 'Meme',
    nftImage: '/images/Meme-NFT.png',
    physicalImage: '/images/Meme.png',
    power: 'Aquatic Resonance',
    element: 'Water',
    origin: 'The Deep Currents',
    discoveredDate: '2024.02.28'
  },
  {
    id: '003',
    slug: 'diamond-hands',
    name: 'Diamond Hands',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    status: 'available',
    rarityPercentage: 5,
    releaseYear: 2024,
    batch: 'Diamond Hands',
    nftImage: '/images/dragon.png',
    physicalImage: '/images/Diamond_hands_product_shot.png',
    power: 'Crystalline Fortitude',
    element: 'Crystal',
    origin: 'The Mineral Depths',
    discoveredDate: '2024.01.12'
  },
  {
    id: '004',
    slug: 'genesis-plush',
    name: 'Genesis Plush',
    type: 'Plush',
    rarity: 'Legendary',
    status: 'available',
    rarityPercentage: 5,
    releaseYear: 2024,
    batch: 'Genesis',
    nftImage: '/images/Genesis-NFT.png',
    physicalImage: '/images/Green_genesis_product_shot.png',
    power: 'Primordial Energy',
    element: 'Origin',
    origin: 'The First Realm',
    discoveredDate: '2024.01.01'
  },
  // Coming soon characters
  {
    id: '005',
    slug: 'tempest',
    name: 'Tempest',
    type: 'Vinyl',
    rarity: 'Rare',
    status: 'coming-soon',
    rarityPercentage: 15,
    releaseYear: 2025,
    batch: 'Tempest',
    nftImage: '/images/placeholder-kaiju.png',
    physicalImage: '/images/placeholder-physical.jpg',
    power: 'Storm Mastery',
    element: 'Storm',
    origin: 'The Thunder Plains',
    discoveredDate: '2024.07.01'
  },
  {
    id: '006',
    slug: 'inferno',
    name: 'Inferno',
    type: 'Plush',
    rarity: 'Ultra Rare',
    status: 'coming-soon',
    rarityPercentage: 3,
    releaseYear: 2025,
    batch: 'Inferno',
    nftImage: '/images/placeholder-kaiju.png',
    physicalImage: '/images/placeholder-physical.jpg',
    power: 'Volcanic Eruption',
    element: 'Fire',
    origin: 'The Magma Core',
    discoveredDate: '2024.08.15'
  }
]

// OpenSea API configuration
const OPENSEA_API_URL = 'https://api.opensea.io/api/v2/collections/cryptokaiju/nfts'
const OPENSEA_API_KEY = 'a221b5fb89fb4ffeb5fbf4fa42cc6532' // Move to environment variables

// Function to fetch minted count for a specific batch
const fetchBatchMintedCount = async (batchName: string): Promise<number> => {
  try {
    const response = await axios.get(OPENSEA_API_URL, {
      headers: {
        "x-api-key": OPENSEA_API_KEY,
      },
      params: {
        trait_type: 'Batch', // Adjust this based on your actual trait name
        trait_value: batchName,
        limit: 200 // Adjust based on expected batch sizes
      }
    })

    return response.data.nfts?.length || 0
  } catch (error) {
    console.error(`Error fetching minted count for batch ${batchName}:`, error)
    return 0
  }
}

const rarityColors = {
  'Common': 'text-green-400 bg-green-400/10 border-green-400/30',
  'Rare': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Ultra Rare': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'Legendary': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
}

const statusColors = {
  'available': 'text-green-400',
  'sold-out': 'text-red-400',
  'coming-soon': 'text-yellow-400'
}

const KaijuCard = ({ character, index }: { character: KaijuCharacter; index: number }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [mintedCount, setMintedCount] = useState<number | null>(null)
  const [isLoadingCount, setIsLoadingCount] = useState(true)

  // Fetch minted count for this character
  useEffect(() => {
    const fetchMintedCount = async () => {
      if (character.status === 'coming-soon') {
        setMintedCount(0)
        setIsLoadingCount(false)
        return
      }

      try {
        setIsLoadingCount(true)
        const count = await fetchBatchMintedCount(character.batch)
        setMintedCount(count)
      } catch (error) {
        console.error(`Failed to fetch minted count for ${character.name}:`, error)
        setMintedCount(0)
      } finally {
        setIsLoadingCount(false)
      }
    }

    fetchMintedCount()
  }, [character.batch, character.status])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsScanning(true)}
      onHoverEnd={() => setIsScanning(false)}
      className="group"
    >
      <Link href={`/kaijudex/${character.slug}`}>
        <div className="relative bg-kaiju-navy/90 backdrop-blur-sm border border-kaiju-pink/30 rounded-xl p-6 hover:border-kaiju-pink/60 transition-all duration-300 hover:bg-kaiju-navy/95">
          
          {/* Scanning line effect */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-kaiju-pink/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </AnimatePresence>

          {/* Character ID */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-kaiju-pink font-mono text-sm">#{character.id}</span>
            <div className={`px-2 py-1 rounded-full border text-xs font-mono ${rarityColors[character.rarity]}`}>
              {character.rarity.toUpperCase()}
            </div>
          </div>

          {/* Character Image */}
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-kaiju-purple-dark/20 to-kaiju-pink/20">
            {character.status === 'coming-soon' ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Database className="w-12 h-12 text-kaiju-pink/50 mx-auto mb-2" />
                  <span className="text-kaiju-pink/70 text-sm font-mono">CLASSIFIED</span>
                </div>
              </div>
            ) : (
              <Image
                src={character.nftImage}
                alt={character.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-kaiju.png'
                }}
              />
            )}
          </div>

          {/* Character Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{character.name}</h3>
              <p className="text-kaiju-pink/80 text-sm font-mono">{character.element} • {character.type}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 rounded p-2">
                <div className="text-white/60 font-mono">MINTED</div>
                <div className="text-white font-bold">
                  {isLoadingCount ? (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-kaiju-pink"
                    >
                      Loading...
                    </motion.div>
                  ) : (
                    mintedCount?.toLocaleString() || '0'
                  )}
                </div>
              </div>
              <div className="bg-white/5 rounded p-2">
                <div className="text-white/60 font-mono">RELEASE YEAR</div>
                <div className="text-white font-bold">{character.releaseYear}</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${statusColors[character.status]}`}>
                {character.status === 'available' && '● AVAILABLE'}
                {character.status === 'sold-out' && '● SOLD OUT'}
                {character.status === 'coming-soon' && '● COMING SOON'}
              </span>
              <span className="text-white/60 text-xs font-mono">
                {character.rarityPercentage}% CHANCE
              </span>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-kaiju-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function KaijudexPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState<'all' | number>('all')
  const [filterType, setFilterType] = useState<'all' | 'Plush' | 'Vinyl'>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Get unique release years for filter
  const releaseYears = [...new Set(kaijuDatabase.map(c => c.releaseYear))].sort((a, b) => b - a)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Filter characters
  const filteredCharacters = kaijuDatabase.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.element.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = filterYear === 'all' || character.releaseYear === filterYear
    const matchesType = filterType === 'all' || character.type === filterType
    
    return matchesSearch && matchesYear && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="text-kaiju-pink font-mono text-lg">INITIALIZING KAIJUDEX...</div>
          <div className="text-white/60 font-mono text-sm mt-2">Scanning database entries...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black">
      {/* Fixed Logo in top left */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <Image
              src="/images/cryptokaiju-logo.png"
              alt="CryptoKaiju"
              width={140}
              height={70}
              className="h-auto hover:drop-shadow-lg transition-all duration-300"
              priority
            />
          </motion.div>
        </Link>
      </div>

      {/* Header */}
      <div className="relative pt-32 pb-16 px-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kaiju-pink/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Cpu className="w-8 h-8 text-kaiju-pink" />
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                THE <span className="text-kaiju-pink">KAIJUDEX</span>
              </h1>
              <Database className="w-8 h-8 text-kaiju-pink" />
            </div>
            <p className="text-xl text-white/80 font-mono max-w-3xl mx-auto leading-relaxed">
              Access the comprehensive database of discovered Kaiju entities.
              <br />
              <span className="text-kaiju-pink">Classification Level: Research Terminal</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-kaiju-navy/50 backdrop-blur-sm border border-kaiju-pink/30 rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-kaiju-pink/60" />
                <input
                  type="text"
                  placeholder="Search by name or element..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 font-mono focus:border-kaiju-pink focus:outline-none"
                />
              </div>

              {/* Release Year Filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:border-kaiju-pink focus:outline-none"
              >
                <option value="all">All Years</option>
                {releaseYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:border-kaiju-pink focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="Plush">Plush</option>
                <option value="Vinyl">Vinyl</option>
              </select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-kaiju-pink/80 font-mono text-sm">
              {filteredCharacters.length} entities found • {kaijuDatabase.filter(c => c.status === 'available').length} available for research
            </div>
          </motion.div>
        </div>
      </div>

      {/* Character Grid */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharacters.map((character, index) => (
              <KaijuCard key={character.id} character={character} index={index} />
            ))}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="text-center py-20">
              <Database className="w-16 h-16 text-kaiju-pink/50 mx-auto mb-4" />
              <div className="text-white font-mono text-xl mb-2">No entities found</div>
              <div className="text-white/60 font-mono">Try adjusting your search parameters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}