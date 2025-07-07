// src/app/kaijudex/page.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, Database, Filter, Sparkles, Zap, Eye, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { KAIJU_BATCHES, KaijuBatch, getBatchesByType, getBatchesByRarity } from '@/config/batches'

// Polaroid-style Character Card with flip interaction
const CharacterPolaroidCard = ({ batch, index }: { batch: KaijuBatch; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showNFT, setShowNFT] = useState(false)

  const rarityColors = {
    'Common': 'text-green-600 bg-green-50 border-green-200',
    'Rare': 'text-blue-600 bg-blue-50 border-blue-200', 
    'Ultra Rare': 'text-purple-600 bg-purple-50 border-purple-200',
    'Legendary': 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  const rotations = ['-2deg', '1deg', '-1deg', '2deg', '-1.5deg', '1.5deg']
  const rotation = rotations[index % rotations.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ 
        y: -12, 
        rotate: '0deg',
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative w-full max-w-[320px] mx-auto"
      style={{ rotate: rotation }}
    >
      <Link href={`/kaijudex/${batch.slug}`}>
        {/* Polaroid-style card */}
        <div className="bg-white rounded-xl p-4 shadow-2xl border-4 border-gray-100 hover:shadow-3xl transition-all duration-500">
          
          {/* Rarity badge */}
          <div className="absolute -top-2 -right-2 z-10">
            <div className={`px-2 py-1 rounded-full border text-xs font-bold ${rarityColors[batch.rarity]} shadow-lg`}>
              {batch.rarity.toUpperCase()}
            </div>
          </div>

          {/* Photo area with flip effect */}
          <div className="relative h-64 md:h-72 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            
            {/* Physical product image (front) */}
            <motion.div
              className="absolute inset-0"
              style={{
                transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
                backfaceVisibility: 'hidden'
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Image
                src={batch.physicalImage}
                alt={`${batch.name} Physical Collectible`}
                fill
                className="object-contain p-4"
                onError={() => setImageError(true)}
              />
              
              {/* Physical product label */}
              <div className="absolute bottom-2 left-2 bg-kaiju-navy/80 text-white text-xs px-2 py-1 rounded">
                {batch.type} Collectible
              </div>
            </motion.div>

            {/* NFT image (back) */}
            <motion.div
              className="absolute inset-0"
              style={{
                transform: isHovered ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                backfaceVisibility: 'hidden'
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-kaiju-navy/10 via-kaiju-purple-light/10 to-kaiju-pink/10">
                <motion.img
                  src={batch.nftImage}
                  alt={`${batch.name} NFT`}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  animate={{
                    scale: isHovered ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/placeholder-kaiju.png'
                  }}
                />
              </div>
              
              {/* NFT label */}
              <div className="absolute bottom-2 left-2 bg-kaiju-pink/90 text-white text-xs px-2 py-1 rounded">
                Digital NFT
              </div>
            </motion.div>

            {/* Hover instruction */}
            <motion.div
              className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              Hover to flip
            </motion.div>
          </div>

          {/* Polaroid caption area */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-kaiju-pink font-mono text-sm font-bold">#{batch.id}</span>
              <span className="text-kaiju-navy/60 text-xs">{batch.element}</span>
            </div>
            
            <motion.h3 
              className="text-xl font-black text-kaiju-navy tracking-tight handwritten"
              animate={{ 
                color: isHovered ? '#FF005C' : '#1f2760'
              }}
              transition={{ duration: 0.3 }}
            >
              {batch.name}
            </motion.h3>
            
            <p className="text-sm text-kaiju-navy/70 italic">
              "{batch.power}"
            </p>

            {/* Quick stats */}
            <div className="flex justify-between text-xs text-kaiju-navy/60 mt-3 pt-2 border-t border-gray-200">
              <span>Supply: ~{batch.estimatedSupply}</span>
              <span>{batch.discoveredDate}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Filter Pills Component
const FilterPills = ({ 
  selectedType, 
  selectedRarity, 
  onTypeChange, 
  onRarityChange,
  onClearFilters 
}: {
  selectedType: string
  selectedRarity: string
  onTypeChange: (type: string) => void
  onRarityChange: (rarity: string) => void
  onClearFilters: () => void
}) => {
  const types = ['All', 'Plush', 'Vinyl']
  const rarities = ['All', 'Common', 'Rare', 'Ultra Rare', 'Legendary']

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white" />
          <span className="font-semibold text-white">Discover:</span>
        </div>
        
        {/* Type Filter */}
        <div className="flex gap-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === type
                  ? 'bg-kaiju-pink text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2">
          {rarities.map(rarity => (
            <button
              key={rarity}
              onClick={() => onRarityChange(rarity)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRarity === rarity
                  ? 'bg-kaiju-pink text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {(selectedType !== 'All' || selectedRarity !== 'All') && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}

export default function KaijudexPage() {
  const [selectedType, setSelectedType] = useState('All')
  const [selectedRarity, setSelectedRarity] = useState('All')
  
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Filter batches based on selected filters
  const filteredBatches = KAIJU_BATCHES.filter(batch => {
    const typeMatch = selectedType === 'All' || batch.type === selectedType
    const rarityMatch = selectedRarity === 'All' || batch.rarity === selectedRarity
    return typeMatch && rarityMatch
  })

  const handleClearFilters = () => {
    setSelectedType('All')
    setSelectedRarity('All')
  }

  // Calculate stats
  const totalBatches = KAIJU_BATCHES.length
  const plushCount = getBatchesByType('Plush').length
  const vinylCount = getBatchesByType('Vinyl').length
  const legendaryCount = getBatchesByRarity('Legendary').length

  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Hero Section - Dark with particles like home page */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,theme(colors.kaiju-pink/20)_0%,transparent_50%)]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_30%,theme(colors.kaiju-purple-light/30)_0%,transparent_50%)]"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4]
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            />
          </div>

          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kaiju-pink rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Database className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                  All the Kaiju ..
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Discover all {totalBatches} unique CryptoKaiju designs. Each character comes as both a digital NFT and physical collectible.
              </p>
            </motion.div>

            {/* Stats showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Character Designs', value: totalBatches, color: 'text-white' },
                { label: 'Plush Collectibles', value: plushCount, color: 'text-white' },
                { label: 'Vinyl Figures', value: vinylCount, color: 'text-white' },
                { label: 'Legendary Designs', value: legendaryCount, color: 'text-yellow-400' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Filters */}
            <FilterPills
              selectedType={selectedType}
              selectedRarity={selectedRarity}
              onTypeChange={setSelectedType}
              onRarityChange={setSelectedRarity}
              onClearFilters={handleClearFilters}
            />

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/nft"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Your NFT
              </Link>
              <Link
                href="/#hero"
                className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Mint Mystery Box
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Gallery Section - Light like home page content sections */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6" ref={ref}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-kaiju-navy mb-4">
                Character Collection ({filteredBatches.length})
              </h2>
              <p className="text-kaiju-navy/70 max-w-2xl mx-auto">
                {selectedType !== 'All' || selectedRarity !== 'All' 
                  ? `Filtered results • Hover each card to see the NFT version`
                  : 'Browse all collectible designs • Hover each card to see the NFT version'
                }
              </p>
            </motion.div>

            {filteredBatches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredBatches.map((batch, index) => (
                  <CharacterPolaroidCard key={batch.id} batch={batch} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <Zap className="w-16 h-16 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-xl font-bold text-kaiju-navy mb-2">No designs found</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Ready to Collect?</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  Each mystery box contains an amazing design. Start your CryptoKaiju collection today!
                </p>
                <Link
                  href="/#hero"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Open Mystery Box
                  <Package className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}