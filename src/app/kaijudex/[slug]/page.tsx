// src/app/kaijudex/[slug]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Zap, Package, Clock, Database, Cpu, Eye, Shield, Sword, Heart, Star, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface KaijuCharacter {
  id: string
  slug: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'
  status: 'available' | 'sold-out' | 'coming-soon'
  
  // Stats
  totalMinted: number
  maxSupply: number
  rarityPercentage: number
  mintPrice?: string
  
  // Visual assets
  nftImage: string
  physicalImage: string
  conceptArt?: string[]
  
  // Character details
  power: string
  element: string
  origin: string
  backstory: string
  abilities: string[]
  discoveredDate: string
  
  // Battle stats (for fun)
  battleStats: {
    attack: number
    defense: number
    speed: number
    special: number
  }
  
  // Lore
  personalityTraits: string[]
  weaknesses: string[]
  habitat: string
  researchNotes: string[]
}

// Sample character data - this would normally come from your database/API
const sampleCharacter: KaijuCharacter = {
  id: '001',
  slug: 'uri',
  name: 'Uri',
  type: 'Plush',
  rarity: 'Rare',
  status: 'available',
  totalMinted: 247,
  maxSupply: 500,
  rarityPercentage: 20,
  mintPrice: '0.055 ETH',
  nftImage: '/images/Ghost1.png',
  physicalImage: '/images/Uri_product_shot.png',
  conceptArt: ['/images/uri-concept-1.jpg', '/images/uri-concept-2.jpg'],
  power: 'Spectral Manipulation',
  element: 'Ghost',
  origin: 'The Ethereal Plane',
  discoveredDate: '2024.03.15',
  backstory: 'Uri emerged from the liminal space between worlds, a being of pure ethereal energy that defies conventional understanding. First documented during the Great Convergence Event, Uri exhibits the unique ability to phase between dimensions, making it both elusive and invaluable for interdimensional research.',
  abilities: [
    'Phase Shifting',
    'Spectral Projection',
    'Ethereal Communication',
    'Dimensional Sensing',
    'Energy Absorption'
  ],
  battleStats: {
    attack: 65,
    defense: 80,
    speed: 95,
    special: 100
  },
  personalityTraits: [
    'Mysterious and enigmatic',
    'Protective of smaller entities',
    'Drawn to sources of spiritual energy',
    'Communicates through emotion rather than words'
  ],
  weaknesses: [
    'Vulnerable to iron-based materials',
    'Loses power in areas of high electromagnetic interference',
    'Cannot maintain physical form for extended periods'
  ],
  habitat: 'Ethereal Plane intersections, ancient temples, areas of high spiritual activity',
  researchNotes: [
    'Subject exhibits heightened activity during lunar eclipses',
    'Specimen shows protective behavior toward researchers',
    'Energy signature fluctuates with ambient temperature',
    'Successful communication achieved through meditation techniques'
  ]
}

const rarityColors = {
  'Common': 'text-green-400 bg-green-400/10 border-green-400/30',
  'Rare': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Ultra Rare': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'Legendary': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'available': { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', text: 'AVAILABLE FOR RESEARCH' },
    'sold-out': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', text: 'RESEARCH COMPLETE' },
    'coming-soon': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', text: 'PENDING DISCOVERY' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig]
  
  return (
    <div className={`px-3 py-1 rounded-full border ${config.color} ${config.bg} ${config.border} text-sm font-mono`}>
      ● {config.text}
    </div>
  )
}

const StatBar = ({ label, value, max = 100, icon }: { label: string; value: number; max?: number; icon: React.ReactNode }) => {
  const percentage = (value / max) * 100
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80 text-sm font-mono">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-kaiju-pink font-mono text-sm">{value}/{max}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  )
}

export default function KaijuCharacterPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'gallery'>('overview')
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [character, setCharacter] = useState<KaijuCharacter>(sampleCharacter)

  // Simulate loading character data
  useEffect(() => {
    const timer = setTimeout(() => {
      // In real app, you'd fetch character data based on params.slug
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [params.slug])

  const allImages = [character.nftImage, character.physicalImage, ...(character.conceptArt || [])]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="text-kaiju-pink font-mono text-lg">LOADING ENTITY DATA...</div>
          <div className="text-white/60 font-mono text-sm mt-2">Accessing classified files...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black">
      {/* Header */}
      <div className="relative pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              href="/kaijudex"
              className="inline-flex items-center gap-2 text-kaiju-pink hover:text-white transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Kaijudex Database
            </Link>
          </motion.div>

          {/* Character Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          >
            {/* Left: Character Image */}
            <div className="lg:col-span-1">
              <div className="relative h-96 bg-gradient-to-br from-kaiju-purple-dark/20 to-kaiju-pink/20 rounded-xl overflow-hidden border border-kaiju-pink/30">
                <Image
                  src={allImages[activeImage]}
                  alt={character.name}
                  fill
                  className="object-contain p-6"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/placeholder-kaiju.png'
                  }}
                />
                
                {/* Image selector */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        activeImage === index ? 'bg-kaiju-pink' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Character Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-kaiju-pink font-mono text-lg">#{character.id}</span>
                  <div className={`px-3 py-1 rounded-full border text-sm font-mono ${rarityColors[character.rarity]}`}>
                    {character.rarity.toUpperCase()}
                  </div>
                  <StatusBadge status={character.status} />
                </div>
                
                <h1 className="text-5xl font-black text-white mb-2">{character.name}</h1>
                <p className="text-xl text-kaiju-pink font-mono">{character.element} Entity • {character.type} Format</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">MINTED</div>
                  <div className="text-2xl font-bold text-white">{character.totalMinted.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">MAX SUPPLY</div>
                  <div className="text-2xl font-bold text-white">{character.maxSupply.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">RARITY</div>
                  <div className="text-2xl font-bold text-kaiju-pink">{character.rarityPercentage}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">DISCOVERED</div>
                  <div className="text-lg font-bold text-white">{character.discoveredDate}</div>
                </div>
              </div>

              {/* Mint Button */}
              {character.status === 'available' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    href="/#hero"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Package className="w-5 h-5" />
                    Research This Entity ({character.mintPrice})
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-white/20">
            {[
              { id: 'overview', label: 'Entity Overview', icon: <Database className="w-4 h-4" /> },
              { id: 'research', label: 'Research Data', icon: <Cpu className="w-4 h-4" /> },
              { id: 'gallery', label: 'Visual Archive', icon: <Eye className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-mono transition-colors ${
                  activeTab === tab.id
                    ? 'text-kaiju-pink border-b-2 border-kaiju-pink'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Backstory */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-kaiju-pink" />
                      Entity Background
                    </h3>
                    <p className="text-white/80 leading-relaxed">{character.backstory}</p>
                  </div>

                  {/* Abilities */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-kaiju-pink" />
                      Documented Abilities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {character.abilities.map((ability, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                          <Star className="w-4 h-4 text-kaiju-pink" />
                          <span className="text-white font-mono">{ability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Battle Stats */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-lg font-bold text-white mb-4">Combat Analysis</h3>
                    <div className="space-y-4">
                      <StatBar label="Attack" value={character.battleStats.attack} icon={<Sword className="w-4 h-4" />} />
                      <StatBar label="Defense" value={character.battleStats.defense} icon={<Shield className="w-4 h-4" />} />
                      <StatBar label="Speed" value={character.battleStats.speed} icon={<Zap className="w-4 h-4" />} />
                      <StatBar label="Special" value={character.battleStats.special} icon={<Star className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Key Facts */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-lg font-bold text-white mb-4">Classification Data</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Origin:</span>
                        <span className="text-white">{character.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Element:</span>
                        <span className="text-kaiju-pink">{character.element}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Primary Power:</span>
                        <span className="text-white">{character.power}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Format:</span>
                        <span className="text-white">{character.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'research' && (
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Research Notes */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-kaiju-pink" />
                    Research Notes
                  </h3>
                  <div className="space-y-3">
                    {character.researchNotes.map((note, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border-l-2 border-kaiju-pink">
                        <p className="text-white/80 text-sm font-mono">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personality & Weaknesses */}
                <div className="space-y-6">
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-lg font-bold text-white mb-4">Behavioral Analysis</h3>
                    <div className="space-y-2">
                      {character.personalityTraits.map((trait, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-kaiju-pink rounded-full mt-2 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{trait}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-red-400/30">
                    <h3 className="text-lg font-bold text-red-400 mb-4">Known Vulnerabilities</h3>
                    <div className="space-y-2">
                      {character.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {allImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative h-64 bg-gradient-to-br from-kaiju-purple-dark/20 to-kaiju-pink/20 rounded-xl overflow-hidden border border-kaiju-pink/30 cursor-pointer hover:border-kaiju-pink/60 transition-colors"
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={image}
                      alt={`${character.name} - View ${index + 1}`}
                      fill
                      className="object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-kaiju.png'
                      }}
                    />
                    <div className="absolute inset-0 bg-kaiju-pink/10 opacity-0 hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}