// src/app/kaijudex/[slug]/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Package, Sparkles, Sword, Shield, Zap, Star, Eye, Database, Cpu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getBatchBySlug, KaijuBatch } from '@/config/batches'
import { notFound } from 'next/navigation'

interface BatchDetailPageProps {
  params: {
    slug: string
  }
}

const rarityColors = {
  'Common': 'text-green-400 bg-green-400/10 border-green-400/30',
  'Rare': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Ultra Rare': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'Legendary': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
}

const StatBar = ({ 
  label, 
  value, 
  max = 100, 
  icon, 
  color = "from-kaiju-pink to-kaiju-purple-light" 
}: { 
  label: string
  value: number
  max?: number
  icon: React.ReactNode
  color?: string
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80 text-sm font-mono">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-kaiju-pink font-mono text-sm">{value}/{max}</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  )
}

const AbilityCard = ({ ability, index }: { ability: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-kaiju-pink/50 transition-all duration-300"
  >
    <div className="flex items-center gap-2 text-kaiju-pink mb-2">
      <Star className="w-4 h-4" />
      <span className="font-bold text-sm">ABILITY</span>
    </div>
    <div className="text-white font-mono text-lg">{ability}</div>
  </motion.div>
)

export default function BatchDetailPage({ params }: BatchDetailPageProps) {
  const batch = getBatchBySlug(params.slug)
  
  if (!batch) {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'gallery'>('overview')
  const [activeImage, setActiveImage] = useState(0)
  const [imageError, setImageError] = useState(false)

  // All available images for this character
  const allImages = [batch.nftImage, batch.physicalImage, ...(batch.conceptArt || [])].filter(Boolean)

  const getImageSrc = () => {
    if (imageError) return '/images/placeholder-kaiju.png'
    return allImages[activeImage] || batch.nftImage
  }

  const handleMintRedirect = () => {
    // Scroll to hero section for minting
    const heroElement = document.querySelector('#hero')
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Fallback: navigate to home page
      window.location.href = '/#hero'
    }
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
                  src={getImageSrc()}
                  alt={batch.name}
                  fill
                  className="object-contain p-6"
                  onError={() => setImageError(true)}
                />
                
                {/* Image selector */}
                {allImages.length > 1 && (
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
                )}
              </div>
            </div>

            {/* Right: Character Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-kaiju-pink font-mono text-lg">#{batch.id}</span>
                  <div className={`px-3 py-1 rounded-full border text-sm font-mono ${rarityColors[batch.rarity]}`}>
                    {batch.rarity.toUpperCase()}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-mono">
                    {batch.type.toUpperCase()} COLLECTIBLE
                  </div>
                </div>
                
                <h1 className="text-5xl font-black text-white mb-2">{batch.name}</h1>
                <p className="text-xl text-kaiju-pink font-mono">{batch.element} Entity • {batch.power}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">ORIGIN</div>
                  <div className="text-white font-bold text-sm">{batch.origin}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">ELEMENT</div>
                  <div className="text-kaiju-pink font-bold">{batch.element}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">EST. SUPPLY</div>
                  <div className="text-white font-bold">~{batch.estimatedSupply.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white/60 text-sm font-mono">DISCOVERED</div>
                  <div className="text-white font-bold text-sm">{batch.discoveredDate}</div>
                </div>
              </div>

              {/* Mint Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button 
                  onClick={handleMintRedirect}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Package className="w-5 h-5" />
                  Mint Mystery Box (Chance to get {batch.name})
                  <Sparkles className="w-5 h-5" />
                </button>
              </motion.div>
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
              { id: 'overview', label: 'Character Overview', icon: <Database className="w-4 h-4" /> },
              { id: 'research', label: 'Combat Data', icon: <Cpu className="w-4 h-4" /> },
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
                  {/* Lore */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-kaiju-pink" />
                      Character Lore
                    </h3>
                    <p className="text-white/80 leading-relaxed">{batch.lore}</p>
                  </div>

                  {/* Abilities */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-kaiju-pink" />
                      Documented Abilities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {batch.abilities.map((ability, index) => (
                        <AbilityCard key={index} ability={ability} index={index} />
                      ))}
                    </div>
                  </div>

                  {/* Personality & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                      <h3 className="text-lg font-bold text-white mb-4">Behavioral Analysis</h3>
                      <div className="space-y-2">
                        {batch.personalityTraits.map((trait, index) => (
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
                        {batch.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-white/80 text-sm">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Key Facts */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-lg font-bold text-white mb-4">Classification Data</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Type:</span>
                        <span className="text-white">{batch.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Element:</span>
                        <span className="text-kaiju-pink">{batch.element}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Rarity:</span>
                        <span className="text-white">{batch.rarity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Origin:</span>
                        <span className="text-white">{batch.origin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Habitat */}
                  <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                    <h3 className="text-lg font-bold text-white mb-4">Natural Habitat</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{batch.habitat}</p>
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
                {/* Battle Stats */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-lg font-bold text-white mb-6">Combat Analysis</h3>
                  <div className="space-y-4">
                    <StatBar label="Attack" value={batch.battleStats.attack} icon={<Sword className="w-4 h-4" />} />
                    <StatBar label="Defense" value={batch.battleStats.defense} icon={<Shield className="w-4 h-4" />} />
                    <StatBar label="Speed" value={batch.battleStats.speed} icon={<Zap className="w-4 h-4" />} />
                    <StatBar label="Special" value={batch.battleStats.special} icon={<Star className="w-4 h-4" />} />
                  </div>
                  
                  {/* Overall Rating */}
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 font-mono">OVERALL POWER</span>
                      <span className="text-kaiju-pink font-bold text-lg">
                        {Math.round(Object.values(batch.battleStats).reduce((a, b) => a + b, 0) / 4)}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-lg font-bold text-white mb-4">Collection Data</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-white/60 text-sm font-mono mb-1">ESTIMATED SUPPLY</div>
                      <div className="text-2xl font-bold text-kaiju-pink">{batch.estimatedSupply.toLocaleString()}</div>
                      <div className="text-white/60 text-xs mt-1">Individual NFTs in this design</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-white/60 text-sm font-mono mb-1">COLLECTIBLE TYPE</div>
                      <div className="text-xl font-bold text-white">{batch.type}</div>
                      <div className="text-white/60 text-xs mt-1">Physical format available</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-white/60 text-sm font-mono mb-1">DISCOVERY DATE</div>
                      <div className="text-xl font-bold text-white">{batch.discoveredDate}</div>
                      <div className="text-white/60 text-xs mt-1">First documented appearance</div>
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
                      alt={`${batch.name} - View ${index + 1}`}
                      fill
                      className="object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-kaiju.png'
                      }}
                    />
                    <div className="absolute inset-0 bg-kaiju-pink/10 opacity-0 hover:opacity-100 transition-opacity" />
                    
                    {/* Image type indicator */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index === 0 ? 'NFT' : index === 1 ? 'Physical' : 'Concept Art'}
                    </div>
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