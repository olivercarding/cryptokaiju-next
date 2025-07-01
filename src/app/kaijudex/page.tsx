// src/app/kaijudex/page.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, Database, Filter, Grid, List, Sparkles, Zap, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { KAIJU_BATCHES, KaijuBatch, getBatchesByType, getBatchesByRarity } from '@/config/batches'

// Batch Card Component
const BatchCard = ({ batch, index }: { batch: KaijuBatch; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const rarityColors = {
    'Common': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Rare': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    'Ultra Rare': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    'Legendary': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
  }

  const getImageSrc = () => {
    if (imageError) return '/images/placeholder-kaiju.png'
    return batch.physicalImage
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <Link href={`/kaijudex/${batch.slug}`}>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-kaiju-pink/50 transition-all duration-300 overflow-hidden h-full">
          
          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/5 to-kaiju-purple-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Header with badges */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="flex flex-col gap-2">
              <span className="text-kaiju-pink font-mono text-sm font-bold">#{batch.id}</span>
              <div className={`px-3 py-1 rounded-full border text-xs font-mono ${rarityColors[batch.rarity]}`}>
                {batch.rarity.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs font-medium">{batch.type}</div>
              <div className="text-kaiju-navy text-sm font-bold">{batch.element}</div>
            </div>
          </div>

          {/* Character Image */}
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Image
              src={getImageSrc()}
              alt={batch.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            
            {/* Hover overlay with special power */}
            <motion.div
              className="absolute inset-0 bg-kaiju-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              initial={false}
              animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="text-white font-bold text-center p-4">
                <Sparkles className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm">{batch.power}</div>
              </div>
            </motion.div>
          </div>

          {/* Character Info */}
          <div className="relative z-10">
            <h3 className="text-xl font-black text-kaiju-navy mb-2 group-hover:text-kaiju-pink transition-colors">
              {batch.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {batch.description}
            </p>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500 font-medium">Origin</div>
                <div className="text-sm font-bold text-kaiju-navy truncate">{batch.origin}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500 font-medium">Supply</div>
                <div className="text-sm font-bold text-kaiju-pink">~{batch.estimatedSupply}</div>
              </div>
            </div>

            {/* Battle stats bar */}
            <div className="flex gap-1 mb-4">
              {Object.entries(batch.battleStats).map(([stat, value]) => (
                <div key={stat} className="flex-1">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Action hint */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Discovered {batch.discoveredDate}</span>
              <div className="flex items-center gap-1 font-medium">
                <Eye className="w-4 h-4" />
                <span>Learn More</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Filter Controls Component
const FilterControls = ({ 
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
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 mb-8">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-kaiju-pink" />
          <span className="font-semibold text-kaiju-navy">Filters:</span>
        </div>
        
        {/* Type Filter */}
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-600">Type:</span>
          {types.map(type => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-kaiju-pink text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-600">Rarity:</span>
          {rarities.map(rarity => (
            <button
              key={rarity}
              onClick={() => onRarityChange(rarity)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedRarity === rarity
                  ? 'bg-kaiju-pink text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors"
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
  const [showNFTLookup, setShowNFTLookup] = useState(false)
  
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
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      {/* Header */}
      <div className="pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Database className="w-8 h-8 text-kaiju-pink" />
              <h1 className="text-4xl md:text-5xl font-black text-kaiju-navy">
                Kaijudex Database
              </h1>
            </div>
            <p className="text-lg text-kaiju-navy/70 max-w-3xl mx-auto">
              Explore all {totalBatches} unique CryptoKaiju character designs. Each batch represents a different character with unique traits, abilities, and collectible forms.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-kaiju-pink mb-1">{totalBatches}</div>
                <div className="text-gray-600 font-medium">Character Designs</div>
              </div>
              <div>
                <div className="text-3xl font-black text-kaiju-purple-dark mb-1">{plushCount}</div>
                <div className="text-gray-600 font-medium">Plush Collectibles</div>
              </div>
              <div>
                <div className="text-3xl font-black text-kaiju-navy mb-1">{vinylCount}</div>
                <div className="text-gray-600 font-medium">Vinyl Figures</div>
              </div>
              <div>
                <div className="text-3xl font-black text-kaiju-red mb-1">{legendaryCount}</div>
                <div className="text-gray-600 font-medium">Legendary Designs</div>
              </div>
            </div>
          </motion.div>

          {/* NFT Lookup Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Looking for your specific NFT?</h3>
                <p className="text-white/80">Search by Token ID or NFC ID to find your individual CryptoKaiju</p>
              </div>
              <Link
                href="/nft"
                className="bg-kaiju-pink hover:bg-kaiju-red text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                NFT Lookup
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <FilterControls
            selectedType={selectedType}
            selectedRarity={selectedRarity}
            onTypeChange={setSelectedType}
            onRarityChange={setSelectedRarity}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Batch Grid */}
      <div className="px-6 pb-20" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-kaiju-navy mb-2">
              Character Designs ({filteredBatches.length})
            </h2>
            <p className="text-gray-600">
              {selectedType !== 'All' || selectedRarity !== 'All' 
                ? `Filtered results • ${filteredBatches.length} of ${totalBatches} designs`
                : 'All available character designs'
              }
            </p>
          </motion.div>

          {filteredBatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBatches.map((batch, index) => (
                <BatchCard key={batch.id} batch={batch} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-kaiju-navy mb-2">No designs found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-kaiju-pink text-white font-bold px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}