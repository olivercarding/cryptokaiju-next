// src/components/pages/BatchDetailPageClient.tsx - BEAUTIFUL DESIGN WITH CONTENTFUL DATA
'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Package, Sparkles, Zap, Star, Database, Camera, Info, Palette, Image as ImageIcon, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import KaijuBatchService, { type KaijuBatch } from '@/lib/services/KaijuBatchService'

interface BatchDetailPageClientProps {
  batch: KaijuBatch
}

const rarityColors = {
  'Common': 'text-green-600 bg-green-50 border-green-200',
  'Rare': 'text-blue-600 bg-blue-50 border-blue-200',
  'Ultra Rare': 'text-purple-600 bg-purple-50 border-purple-200',
  'Legendary': 'text-yellow-600 bg-yellow-50 border-yellow-200'
}

const availabilityColors = {
  'Mintable': 'text-green-600 bg-green-50 border-green-200',
  'Secondary': 'text-blue-600 bg-blue-50 border-blue-200'
}

// Enhanced Photo Gallery - Show All Available Images with Polaroid Style
const EnhancedPhotoGallery = ({ batch }: { batch: KaijuBatch }) => {
  const [activeImage, setActiveImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  
  // Collect all available images from enhanced structure
  const getAllImages = (): string[] => {
    const images: string[] = []
    
    if (batch.images) {
      // Add all images from each category if they exist
      if (batch.images.physical) images.push(...batch.images.physical)
      if (Array.isArray(batch.images.nft)) {
        images.push(...batch.images.nft)
      } else if (batch.images.nft) {
        images.push(batch.images.nft)
      }
      if (batch.images.lifestyle) images.push(...batch.images.lifestyle)
      if (batch.images.detail) images.push(...batch.images.detail)
      if (batch.images.concept) images.push(...batch.images.concept)
      if (batch.images.packaging) images.push(...batch.images.packaging)
    }
    
    return images.filter(img => img && img.length > 0)
  }

  const allImages = getAllImages()
  const polaroidRotations = ['-8deg', '4deg', '-3deg', '6deg', '-2deg', '5deg', '-4deg', '3deg']

  if (allImages.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No images available for this character</p>
      </div>
    )
  }

  const imageTypes = [
    'Physical Product', 'Digital NFT', 'Lifestyle Shot', 'Detail View', 
    'Concept Art', 'Packaging', 'Collection'
  ]

  return (
    <>
      <div className="space-y-12">
        {/* Main Featured Polaroid */}
        <motion.div
          className="relative max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.9, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotateY: -180 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-gray-100 transform hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group"
            style={{ 
              transform: `rotate(${polaroidRotations[activeImage % polaroidRotations.length]})`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
            onClick={() => setIsLightboxOpen(true)}
          >
            <div className="relative h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
              <Image
                src={allImages[activeImage]}
                alt={`${batch.name} image ${activeImage + 1}`}
                fill
                className="object-contain p-4 hover:scale-110 transition-transform duration-500"
              />
              
              {/* Photo corner tabs */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-white/80 transform rotate-45 -translate-x-3 -translate-y-3 border border-gray-200"></div>
              <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 transform rotate-45 translate-x-3 -translate-y-3 border border-gray-200"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/80 transform rotate-45 -translate-x-3 translate-y-3 border border-gray-200"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-white/80 transform rotate-45 translate-x-3 translate-y-3 border border-gray-200"></div>

              {/* Image counter with vintage style */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-mono">
                {activeImage + 1}/{allImages.length}
              </div>

              {/* Click to expand hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center"
              >
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <Eye className="w-6 h-6 text-kaiju-navy" />
                </motion.div>
              </motion.div>
            </div>

            {/* Polaroid caption */}
            <div className="pt-4 text-center">
              <div className="text-kaiju-navy font-bold text-xl handwritten mb-1">{batch.name}</div>
              <div className="text-kaiju-navy/60 text-sm">{imageTypes[activeImage % imageTypes.length]}</div>
              <div className="text-kaiju-navy/40 text-xs mt-1 font-mono">{batch.essence}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scattered Thumbnail Polaroids */}
        {allImages.length > 1 && (
          <div className="relative">
            <h4 className="text-center text-kaiju-navy font-bold mb-8 text-lg">Gallery Collection</h4>
            <div className="flex justify-center flex-wrap gap-4 max-w-4xl mx-auto">
              {allImages.map((image, index) => (
                <motion.button
                  key={`polaroid-${index}`}
                  onClick={() => setActiveImage(index)}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -12, 
                    rotate: '0deg', 
                    scale: 1.05,
                    zIndex: 10
                  }}
                  className={`relative bg-white p-3 rounded-lg shadow-xl border-2 transition-all duration-300 hover:shadow-2xl group ${
                    activeImage === index 
                      ? 'border-kaiju-pink shadow-kaiju-pink/25 ring-2 ring-kaiju-pink/50' 
                      : 'border-gray-200'
                  }`}
                  style={{ 
                    transform: `rotate(${polaroidRotations[index % polaroidRotations.length]})`,
                    zIndex: index
                  }}
                >
                  <div className="relative w-20 h-20 bg-gray-50 rounded overflow-hidden">
                    <Image 
                      src={image} 
                      alt={`${batch.name} thumbnail ${index + 1}`} 
                      fill 
                      className="object-contain p-1 group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  
                  {/* Active indicator */}
                  {activeImage === index && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 -right-1 w-6 h-6 bg-kaiju-pink rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                  )}

                  {/* Vintage label */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 text-xs text-kaiju-navy/60 font-mono rounded shadow">
                    {index + 1}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {/* Gallery Stats with vintage styling */}
        <div className="text-center">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
            <p className="text-kaiju-navy font-mono text-sm">
              📸 {allImages.length} photograph{allImages.length === 1 ? '' : 's'} • 
              Collected {batch.discoveredDate}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative max-w-5xl w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
              <div className="relative h-[60vh] lg:h-[70vh] rounded-xl overflow-hidden bg-gray-50">
                <Image
                  src={allImages[activeImage]}
                  alt={`${batch.name} - Full size`}
                  fill
                  className="object-contain"
                />
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              {/* Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setActiveImage(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    →
                  </button>
                </>
              )}

              {/* Caption */}
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-kaiju-navy">{batch.name}</h3>
                <p className="text-kaiju-navy/60">
                  {imageTypes[activeImage % imageTypes.length]} • {activeImage + 1} of {allImages.length}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default function BatchDetailPageClient({ batch }: BatchDetailPageClientProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'collectible' | 'gallery'>('story')
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Format discovery date to "27 November 2018" format
  const formatDiscoveryDate = (dateString: string): string => {
    if (!dateString) return 'Unknown'
    
    try {
      // Handle various date formats from Contentful
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString // Return original if can't parse
      }
      
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      console.warn('Error formatting discovery date:', error)
      return dateString // Return original on error
    }
  }

  // Get hero images (up to 3 for carousel)
  const getHeroImages = (): string[] => {
    const images: string[] = []
    
    if (batch.images) {
      // Priority order for hero images
      if (Array.isArray(batch.images.nft)) {
        images.push(...batch.images.nft.slice(0, 2)) // Up to 2 NFT images
      } else if (batch.images.nft) {
        images.push(batch.images.nft) // Single NFT image (backward compatibility)
      }
      
      if (batch.images.physical && images.length < 3) {
        const remaining = 3 - images.length
        images.push(...batch.images.physical.slice(0, remaining))
      }
      
      // Fill remaining slots with concept/detail images if needed
      if (batch.images.concept && images.length < 3) {
        const remaining = 3 - images.length  
        images.push(...batch.images.concept.slice(0, remaining))
      }
      
      if (batch.images.detail && images.length < 3) {
        const remaining = 3 - images.length
        images.push(...batch.images.detail.slice(0, remaining))
      }
    }
    
    return images.filter(img => img && img.length > 0).slice(0, 3)
  }

  // Handle both mint and secondary market redirects
  const handleActionClick = () => {
    if (batch.availability === 'Mintable') {
      // Redirect to mint page
      window.location.href = '/#hero'
    } else {
      // Redirect to secondary market
      if (batch.secondaryMarketUrl) {
        window.open(batch.secondaryMarketUrl, '_blank')
      } else {
        // Fallback to general collection page
        window.open('https://opensea.io/collection/cryptokaiju', '_blank')
      }
    }
  }

  // Get primary image using KaijuBatchService (with fallback for multiple NFT structure)
  const getPrimaryImage = () => {
    // Try the service first
    const serviceImage = KaijuBatchService.getBatchPrimaryImage(batch)
    if (serviceImage && serviceImage !== '/images/placeholder-kaiju.png') {
      return serviceImage
    }
    
    // Fallback logic for multiple NFT structure
    if (batch.images) {
      if (Array.isArray(batch.images.nft) && batch.images.nft.length > 0) {
        return batch.images.nft[0]
      } else if (batch.images.nft) {
        return batch.images.nft
      }
      if (batch.images.physical && batch.images.physical.length > 0) {
        return batch.images.physical[0]
      }
    }
    
    return '/images/placeholder-kaiju.png'
  }

  return (
    <>
      <Header />

      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Background animations */}
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
                  <span className="text-white font-mono text-xl font-bold">#{batch.id}</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${rarityColors[batch.rarity]}`}>
                    {batch.rarity}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${availabilityColors[batch.availability]}`}>
                    {batch.availability}
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                  {batch.name}
                </h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-5 h-5 text-white" />
                  <span className="text-xl text-white font-bold">{batch.type} Collectible</span>
                </div>
                
                <div className="flex items-center gap-2 mb-8">
                  <Sparkles className="w-5 h-5 text-white/80" />
                  <span className="text-lg text-white/90 italic">"{batch.essence}"</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">~{batch.estimatedSupply}</div>
                    <div className="text-white/70 text-sm">Est. Supply</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white mb-1">{formatDiscoveryDate(batch.discoveredDate)}</div>
                    <div className="text-white/70 text-sm">Discovered</div>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={handleActionClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 ${
                    batch.availability === 'Mintable' 
                      ? 'bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  }`}
                >
                  {batch.availability === 'Mintable' ? (
                    <>
                      <Package className="w-5 h-5" />
                      Mint Mystery Box
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Find on Secondary
                      <ExternalLink className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Right: Character Image Carousel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {(() => {
                  const heroImages = getHeroImages()
                  
                  if (heroImages.length === 0) {
                    return (
                      <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                        <Image
                          src="/images/placeholder-kaiju.png"
                          alt={batch.name}
                          fill
                          className="object-contain p-8"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/20 to-kaiju-purple-light/20 mix-blend-overlay"></div>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-4">
                      {/* Main Hero Image - FIXED: Removed key prop and motion wrapper */}
                      <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                        <div 
                          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                          style={{ opacity: 1 }}
                        >
                          <Image
                            src={heroImages[heroImageIndex]}
                            alt={`${batch.name} - Image ${heroImageIndex + 1}`}
                            fill
                            className="object-contain p-8 transition-opacity duration-300"
                            key={`hero-${heroImageIndex}`}
                          />
                        </div>
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/20 to-kaiju-purple-light/20 mix-blend-overlay"></div>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-mono">
                          {heroImageIndex + 1} of {heroImages.length}
                        </div>
                        
                        {/* Navigation arrows - FIXED: Added debouncing */}
                        {heroImages.length > 1 && (
                          <>
                            <button
                              onClick={() => {
                                const newIndex = heroImageIndex === 0 ? heroImages.length - 1 : heroImageIndex - 1
                                setHeroImageIndex(newIndex)
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-50"
                              disabled={heroImages.length <= 1}
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const newIndex = heroImageIndex === heroImages.length - 1 ? 0 : heroImageIndex + 1
                                setHeroImageIndex(newIndex)
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors rotate-180 disabled:opacity-50"
                              disabled={heroImages.length <= 1}
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Thumbnail Navigation - FIXED: Simplified animations */}
                      {heroImages.length > 1 && (
                        <div className="flex justify-center gap-3">
                          {heroImages.map((image, index) => (
                            <button
                              key={`thumb-${index}`}
                              onClick={() => setHeroImageIndex(index)}
                              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                                index === heroImageIndex 
                                  ? 'border-kaiju-pink shadow-lg shadow-kaiju-pink/25' 
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              <Image
                                src={image}
                                alt={`${batch.name} thumbnail ${index + 1}`}
                                fill
                                className="object-contain p-2"
                              />
                              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
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
                      <p className="text-kaiju-navy/80 leading-relaxed text-lg">{batch.characterDescription}</p>
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
                          <span className="text-kaiju-navy/60">Essence:</span>
                          <span className="font-semibold">{batch.essence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60">Rarity:</span>
                          <span className={`font-semibold px-2 py-1 rounded text-xs ${rarityColors[batch.rarity]}`}>
                            {batch.rarity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60">Availability:</span>
                          <span className={`font-semibold px-2 py-1 rounded text-xs ${availabilityColors[batch.availability]}`}>
                            {batch.availability}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Habitat Card */}
                    {batch.habitat && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                      >
                        <h4 className="font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-kaiju-pink" />
                          Natural Habitat
                        </h4>
                        <p className="text-kaiju-navy/70 text-sm leading-relaxed">{batch.habitat}</p>
                      </motion.div>
                    )}
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
                      <p className="text-kaiju-navy/80 leading-relaxed text-lg mb-6">{batch.physicalDescription}</p>
                      
                      {/* Features list */}
                      {batch.features && batch.features.length > 0 && (
                        <div>
                          <h4 className="font-bold text-kaiju-navy mb-3">Special Features:</h4>
                          <ul className="list-disc list-inside space-y-2 text-kaiju-navy/70">
                            {batch.features.map((feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>

                    {/* Production Notes if available */}
                    {batch.productionNotes && (
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
                        <p className="text-kaiju-navy/70 text-sm">{batch.productionNotes}</p>
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
                        {batch.materials && (
                          <div>
                            <span className="text-kaiju-navy/60 block mb-1">Materials:</span>
                            <span className="font-semibold text-xs leading-relaxed">{batch.materials}</span>
                          </div>
                        )}
                        {batch.dimensions && (
                          <div>
                            <span className="text-kaiju-navy/60 block mb-1">Dimensions:</span>
                            <span className="font-semibold">{batch.dimensions}</span>
                          </div>
                        )}
                        {batch.packagingStyle && (
                          <div>
                            <span className="text-kaiju-navy/60 block mb-1">Packaging:</span>
                            <span className="font-semibold text-xs leading-relaxed">{batch.packagingStyle}</span>
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
                    <p>Product and NFT images for {batch.name}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">
                  {batch.availability === 'Mintable' ? 'Ready to mint a CryptoKaiju?' : 'Want to collect this Kaiju?'}
                </h3>
                <p className="text-kaiju-navy/70 mb-6">
                  {batch.availability === 'Mintable' 
                    ? 'Who knows what\'s in your next mystery box...'
                    : 'Find this collectible on secondary marketplaces'
                  }
                </p>
                <motion.button
                  onClick={handleActionClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto ${
                    batch.availability === 'Mintable'
                      ? 'bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  }`}
                >
                  {batch.availability === 'Mintable' ? (
                    <>
                      <Package className="w-5 h-5" />
                      Open Mystery Box
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Find on Secondary
                      <ExternalLink className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}