// src/app/kaijudex/[slug]/page.tsx - ENHANCED THREE-TAB VERSION
'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Package, Sparkles, Zap, Star, Database, Camera, Flame, Droplets, Leaf, Mountain, Wind, Skull, Info, Palette, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { getBatchBySlug, KaijuBatch } from '@/config/batches'
import { notFound } from 'next/navigation'

interface BatchDetailPageProps {
  params: {
    slug: string
  }
}

const rarityColors = {
  'Common': 'text-green-600 bg-green-50 border-green-200',
  'Rare': 'text-blue-600 bg-blue-50 border-blue-200',
  'Ultra Rare': 'text-purple-600 bg-purple-50 border-purple-200',
  'Legendary': 'text-yellow-600 bg-yellow-50 border-yellow-200'
}

const elementIcons = {
  'Digital Fire': Flame,
  'Digital Earth': Mountain,
  'Moonlight': Star,
  'Creative Air': Wind,
  'Meme Wind': Wind,
  'Tide': Droplets,
  'Spice': Leaf,
  'Court': Package,
  'Tropic': Leaf,
  'Crystal': Star,
  'Starfire': Flame,
  'Autumn Flame': Flame,
  'Comfort': Star,
  'Heritage': Database,
  'Voxel': Package,
  'Spectral Finance': Star,
  'Ghost': Skull,
  'Ancient Ember': Flame,
  'Gathering Stone': Mountain,
  'Luna\'s Blessing': Star,
  'Creative Spark': Sparkles,
  'Joy Wind': Wind,
  'Tidal Comfort': Droplets,
  'Living Zest': Leaf,
  'Unity Field': Database,
  'Tropical Breeze': Wind,
  'Crystal Clarity': Star,
  'Celebration Fire': Flame,
  'Autumn\'s Mystery': Leaf,
  'Soft Wonder': Star,
  'Living Archive': Database,
  'Building Blocks': Package,
  'Ethereal Flow': Wind,
  'Twilight Mist': Star
}

// Enhanced Photo Gallery with Categories
const EnhancedPhotoGallery = ({ batch }: { batch: KaijuBatch }) => {
  const [activeCategory, setActiveCategory] = useState<'physical' | 'lifestyle' | 'detail' | 'concept' | 'packaging'>('physical')
  const [activeImage, setActiveImage] = useState(0)
  
  // Handle both new enhanced structure and legacy structure
  const getImagesByCategory = (category: string): string[] => {
    // New enhanced structure
    if (batch.images) {
      switch (category) {
        case 'physical': return batch.images.physical || []
        case 'lifestyle': return batch.images.lifestyle || []
        case 'detail': return batch.images.detail || []
        case 'concept': return batch.images.concept || []
        case 'packaging': return batch.images.packaging || []
        default: return []
      }
    }
    
    // Legacy fallback
    if (category === 'physical') return [(batch as any).physicalImage].filter(Boolean)
    if (category === 'concept') return (batch as any).conceptArt || []
    return []
  }

  const currentImages = getImagesByCategory(activeCategory)
  
  // Create category tabs with counts
  const categories = [
    { id: 'physical', label: 'Product', icon: Package, images: getImagesByCategory('physical') },
    { id: 'lifestyle', label: 'In Action', icon: Camera, images: getImagesByCategory('lifestyle') },
    { id: 'detail', label: 'Close-ups', icon: Zap, images: getImagesByCategory('detail') },
    { id: 'concept', label: 'Concept', icon: Palette, images: getImagesByCategory('concept') },
    { id: 'packaging', label: 'Packaging', icon: Package, images: getImagesByCategory('packaging') }
  ].filter(cat => cat.images.length > 0) // Only show categories with images

  const rotations = ['-3deg', '2deg', '-1deg', '1.5deg', '-2deg']

  // Reset active image when category changes
  const handleCategoryChange = (category: any) => {
    setActiveCategory(category)
    setActiveImage(0)
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No images available for this character</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm ${
                activeCategory === category.id
                  ? 'bg-kaiju-pink text-white shadow-lg'
                  : 'bg-white text-kaiju-navy hover:bg-gray-50 shadow border border-gray-200'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
              <span className="bg-kaiju-navy/20 text-xs px-2 py-0.5 rounded-full">
                {category.images.length}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Featured Image */}
      <motion.div
        key={`${activeCategory}-${activeImage}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg mx-auto"
      >
        <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-gray-100 transform hover:rotate-0 transition-transform duration-300"
             style={{ transform: 'rotate(-1deg)' }}>
          <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
            {currentImages[activeImage] && (
              <Image
                src={currentImages[activeImage]}
                alt={`${batch.name} ${activeCategory} view`}
                fill
                className="object-contain p-4"
              />
            )}

            <div className="absolute bottom-2 left-2 bg-kaiju-navy/80 text-white text-xs px-2 py-1 rounded">
              {categories.find(c => c.id === activeCategory)?.label} {currentImages.length > 1 && `${activeImage + 1}/${currentImages.length}`}
            </div>
          </div>

          <div className="pt-3 text-center">
            <div className="text-kaiju-navy font-bold text-lg handwritten">{batch.name}</div>
            <div className="text-kaiju-navy/60 text-sm">{batch.element} • {batch.rarity}</div>
          </div>
        </div>
      </motion.div>

      {/* Thumbnail Gallery - Only show if there are multiple images */}
      {currentImages.length > 1 && (
        <div className="flex justify-center gap-3 flex-wrap max-w-2xl mx-auto">
          {currentImages.map((image, index) => (
            <motion.button
              key={`${activeCategory}-thumb-${index}`}
              onClick={() => setActiveImage(index)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, rotate: '0deg', scale: 1.05 }}
              className={`bg-white p-2 rounded-lg shadow-lg border-2 transition-all duration-300 ${
                activeImage === index ? 'border-kaiju-pink shadow-kaiju-pink/25' : 'border-gray-200'
              }`}
              style={{ transform: `rotate(${rotations[index % rotations.length]})` }}
            >
              <div className="relative w-16 h-16 bg-gray-50 rounded overflow-hidden">
                <Image src={image} alt={`${batch.name} thumbnail ${index + 1}`} fill className="object-contain p-1" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
      
      {/* Gallery Stats */}
      <div className="text-center text-gray-500 text-sm">
        <p>Total {categories.reduce((acc, cat) => acc + cat.images.length, 0)} images across {categories.length} categories</p>
      </div>
    </div>
  )
}

export default function BatchDetailPage({ params }: BatchDetailPageProps) {
  const batch = getBatchBySlug(params.slug)
  if (!batch) notFound()

  const [activeTab, setActiveTab] = useState<'story' | 'collectible' | 'gallery'>('story')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const handleMintRedirect = () => {
    window.location.href = '/#hero'
  }

  const ElementIcon = elementIcons[batch.element as keyof typeof elementIcons] || Sparkles

  // Get primary image (support both structures)
  const getPrimaryImage = () => {
    if (batch.images?.physical?.[0]) return batch.images.physical[0]
    if (batch.images?.nft) return batch.images.nft
    return (batch as any).physicalImage || (batch as any).nftImage
  }

  // Get descriptions (support both structures)
  const getCharacterDescription = () => {
    return (batch as any).characterDescription || (batch as any).description || `${batch.name} is a mysterious and powerful entity from the realm of Komorebi, carrying the essence of ${batch.essence.toLowerCase()} within their being.`
  }

  const getPhysicalDescription = () => {
    return (batch as any).physicalDescription || `Experience the ${batch.name} ${batch.type.toLowerCase()} collectible - a premium piece crafted with attention to detail and designed for collectors who appreciate quality.`
  }

  return (
    <>
      <Header />

      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Hero Section - Same as before but with primary image */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Background animations - same as before */}
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
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Back Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link 
                href="/kaijudex"
                className="inline-flex items-center gap-2 text-white hover:text-kaiju-pink transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Kaijudex
              </Link>
            </motion.div>

            {/* Character Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Character Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-kaiju-pink font-mono text-xl font-bold">#{batch.id}</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${rarityColors[batch.rarity]}`}>
                    {batch.rarity}
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <ElementIcon className="w-4 h-4" />
                    <span className="text-sm">{batch.element}</span>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                  {batch.name}
                </h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-5 h-5 text-kaiju-pink" />
                  <span className="text-xl text-kaiju-pink font-bold">{batch.type} Collectible</span>
                  {!(batch.images?.nft || (batch as any).nftImage) && (
                    <span className="text-sm text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full">
                      Physical Only
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-white/80" />
                  <span className="text-lg text-white/90 italic">"{batch.essence}"</span>
                </div>

                <p className="text-lg text-white/90 leading-relaxed mb-8">
                  {getCharacterDescription()}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">~{batch.estimatedSupply}</div>
                    <div className="text-white/70 text-sm">Est. Supply</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">{batch.discoveredDate}</div>
                    <div className="text-white/70 text-sm">Discovered</div>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={handleMintRedirect}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                >
                  <Package className="w-5 h-5" />
                  Mint Mystery Box
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Right: Character Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                  <Image
                    src={getPrimaryImage()}
                    alt={batch.name}
                    fill
                    className="object-contain p-8"
                  />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/20 to-kaiju-purple-light/20 mix-blend-overlay"></div>
                  
                  {/* Show indicator if no NFT version */}
                  {!(batch.images?.nft || (batch as any).nftImage) && (
                    <div className="absolute top-4 right-4 bg-yellow-400/90 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      Physical Only
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content Section with Three Tabs */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6" ref={ref}>
          <div className="max-w-7xl mx-auto">
            {/* Three-Tab Navigation */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {[
                { id: 'story', label: 'Character Story', icon: Database },
                { id: 'collectible', label: 'Physical Collectible', icon: Info },
                { id: 'gallery', label: 'Photo Gallery', icon: Camera }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-kaiju-pink text-white shadow-lg'
                      : 'bg-white text-kaiju-navy hover:bg-gray-50 shadow'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Character Story Tab */}
              {activeTab === 'story' && (
                <motion.div 
                  key="story" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }} 
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                        <Database className="w-6 h-6 text-kaiju-pink" />
                        Character Lore
                      </h3>
                      <p className="text-kaiju-navy/80 leading-relaxed text-lg">{getCharacterDescription()}</p>
                    </motion.div>
                  </div>

                  {/* Sidebar with character classification */}
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h4 className="font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-kaiju-pink" />
                        Character Profile
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60">Type:</span>
                          <span className="font-semibold">{batch.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60">Element:</span>
                          <span className="font-semibold">{batch.element}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60">Essence:</span>
                          <span className="font-semibold">{batch.essence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60">Rarity:</span>
                          <span className={`font-semibold px-2 py-1 rounded text-xs ${rarityColors[batch.rarity]}`}>
                            {batch.rarity}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Habitat Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.1 }}
                      className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h4 className="font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-kaiju-pink" />
                        Natural Habitat
                      </h4>
                      <p className="text-kaiju-navy/70 text-sm leading-relaxed">{batch.habitat}</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Physical Collectible Tab */}
              {activeTab === 'collectible' && (
                <motion.div 
                  key="collectible" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }} 
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-kaiju-pink" />
                        About This Collectible
                      </h3>
                      <p className="text-kaiju-navy/80 leading-relaxed text-lg mb-6">{getPhysicalDescription()}</p>
                      
                      {/* Features list if available */}
                      {(batch as any).features && (
                        <div>
                          <h4 className="font-bold text-kaiju-navy mb-3">Special Features:</h4>
                          <ul className="list-disc list-inside space-y-2 text-kaiju-navy/70">
                            {(batch as any).features.map((feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>

                    {/* Production Notes if available */}
                    {(batch as any).productionNotes && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-kaiju-pink/5 to-kaiju-purple-light/5 p-6 rounded-2xl border-2 border-kaiju-pink/20"
                      >
                        <h4 className="font-bold text-kaiju-navy mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-kaiju-pink" />
                          Production Notes
                        </h4>
                        <p className="text-kaiju-navy/70 text-sm">{(batch as any).productionNotes}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Specifications Sidebar */}
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h4 className="font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-kaiju-pink" />
                        Specifications
                      </h4>
                      <div className="space-y-3 text-sm">
                        {(batch as any).materials && (
                          <div>
                            <span className="text-kaiju-navy/60 block mb-1">Materials:</span>
                            <span className="font-semibold text-xs leading-relaxed">{(batch as any).materials}</span>
                          </div>
                        )}
                        {(batch as any).dimensions && (
                          <div>
                            <span className="text-kaiju-navy/60 block mb-1">Dimensions:</span>
                            <span className="font-semibold">{(batch as any).dimensions}</span>
                          </div>
                        )}
                        {(batch as any).packagingStyle && (
                          <div>
                            <span className="text-kaiju-navy/60 block mb-1">Packaging:</span>
                            <span className="font-semibold text-xs leading-relaxed">{(batch as any).packagingStyle}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-kaiju-navy/60 block mb-1">Supply:</span>
                          <span className="font-semibold">~{batch.estimatedSupply} pieces</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Photo Gallery Tab */}
              {activeTab === 'gallery' && (
                <motion.div 
                  key="gallery" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }} 
                  className="text-center"
                >
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-8">Visual Collection</h3>
                  <EnhancedPhotoGallery batch={batch} />
                  <div className="mt-8 text-kaiju-navy/60">
                    <p>Complete visual archive of {batch.name}</p>
                    <p className="text-sm mt-2">
                      High-quality photography showcasing every detail
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom CTA - Same as before */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Ready to mint a CryptoKaiju?</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  Who knows what's in your next mystery box...
                </p>
                <motion.button
                  onClick={handleMintRedirect}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <Package className="w-5 h-5" />
                  Open Mystery Box
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}