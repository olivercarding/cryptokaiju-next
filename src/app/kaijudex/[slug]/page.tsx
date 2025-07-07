// src/app/kaijudex/[slug]/page.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Package, Sparkles, Sword, Shield, Zap, Star, Eye, Database, Camera, Heart } from 'lucide-react'
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

// Polaroid Gallery Component
const PolaroidGallery = ({ batch }: { batch: KaijuBatch }) => {
  const [activeImage, setActiveImage] = useState(0)
  const allImages = [
    { src: batch.physicalImage, label: 'Physical Collectible', type: 'physical' },
    { src: batch.nftImage, label: 'Digital NFT', type: 'nft' },
    ...(batch.conceptArt || []).map((src, i) => ({ src, label: `Concept Art ${i + 1}`, type: 'concept' }))
  ].filter(img => img.src)

  const rotations = ['-3deg', '2deg', '-1deg', '1.5deg', '-2deg']

  return (
    <div className="space-y-8">
      {/* Main Featured Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md mx-auto"
      >
        {/* Polaroid frame */}
        <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-gray-100 transform hover:rotate-0 transition-transform duration-300"
             style={{ transform: 'rotate(-1deg)' }}>
          <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
            <Image
              src={allImages[activeImage]?.src || batch.nftImage}
              alt={allImages[activeImage]?.label || batch.name}
              fill
              className="object-contain p-4"
            />
            
            {/* Image type badge */}
            <div className="absolute bottom-2 left-2 bg-kaiju-navy/80 text-white text-xs px-2 py-1 rounded">
              {allImages[activeImage]?.label}
            </div>
          </div>
          
          {/* Polaroid caption */}
          <div className="pt-3 text-center">
            <div className="text-kaiju-navy font-bold text-lg handwritten">{batch.name}</div>
            <div className="text-kaiju-navy/60 text-sm">{batch.element} • {batch.rarity}</div>
          </div>
        </div>
      </motion.div>

      {/* Thumbnail Gallery */}
      <div className="flex justify-center gap-4 flex-wrap">
        {allImages.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveImage(index)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, rotate: '0deg' }}
            className={`bg-white p-2 rounded-lg shadow-lg border-2 transition-all duration-300 ${
              activeImage === index ? 'border-kaiju-pink' : 'border-gray-200'
            }`}
            style={{ transform: `rotate(${rotations[index % rotations.length]})` }}
          >
            <div className="relative w-16 h-16 bg-gray-50 rounded overflow-hidden">
              <Image
                src={image.src}
                alt={image.label}
                fill
                className="object-contain p-1"
              />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Clean Ability Card
const AbilityCard = ({ ability, index }: { ability: string; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100 hover:border-kaiju-pink/50 transition-all duration-300"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-kaiju-pink mb-2">
          <Star className="w-4 h-4" />
          <span className="font-bold text-xs uppercase tracking-wide">Ability</span>
        </div>
        <div className="text-kaiju-navy font-bold text-sm leading-tight">
          {ability}
        </div>
      </div>
    </motion.div>
  )
}

// Clean Battle Stats Card
const BattleStatsCard = ({ batch }: { batch: KaijuBatch }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-xl border-2 border-gray-100"
    >
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-kaiju-pink mb-2">
          <Sword className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wide">Combat Analysis</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {Object.entries(batch.battleStats).map(([stat, value]) => (
          <div key={stat} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-kaiju-navy/70 capitalize">{stat}</span>
              <span className="text-kaiju-pink font-bold">{value}/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <div className="text-kaiju-navy/60 text-xs">Overall Power</div>
        <div className="text-kaiju-pink font-bold text-lg">
          {Math.round(Object.values(batch.battleStats).reduce((a, b) => a + b, 0) / 4)}/100
        </div>
      </div>
    </motion.div>
  )
}

export default function BatchDetailPage({ params }: BatchDetailPageProps) {
  const batch = getBatchBySlug(params.slug)
  
  if (!batch) {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<'story' | 'abilities' | 'gallery'>('story')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const handleMintRedirect = () => {
    window.location.href = '/#hero'
  }

  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Hero Section - Dark with particles */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,theme(colors.kaiju-pink/25)_0%,transparent_50%)]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kaiju-pink rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
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
                Back to all Kaiju
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Character Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-white font-mono text-lg">#{batch.id}</span>
                    <div className={`px-3 py-1 rounded-full border text-sm font-mono ${rarityColors[batch.rarity]}`}>
                      {batch.rarity.toUpperCase()}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-mono">
                      {batch.type.toUpperCase()}
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                    {batch.name}
                  </h1>
                  <p className="text-xl text-kaiju-pink font-mono mb-6">
                    {batch.element} Entity • "{batch.power}"
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-white/60 text-sm font-mono">ORIGIN</div>
                    <div className="text-white font-bold">{batch.origin}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-white/60 text-sm font-mono">DISCOVERED</div>
                    <div className="text-white font-bold text-sm">{batch.discoveredDate}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-white/60 text-sm font-mono">SUPPLY</div>
                    <div className="text-kaiju-pink font-bold">~{batch.estimatedSupply.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-white/60 text-sm font-mono">ELEMENT</div>
                    <div className="text-white font-bold">{batch.element}</div>
                  </div>
                </div>

                {/* Mint Button */}
                <motion.button 
                  onClick={handleMintRedirect}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl border-2 border-kaiju-pink/50 hover:shadow-2xl transition-all duration-300"
                >
                  <Package className="w-5 h-5" />
                  Mint Mystery Box
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Right: Featured Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center"
              >
                <PolaroidGallery batch={batch} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content Section - Light background */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6" ref={ref}>
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="flex justify-center gap-4 mb-12"
            >
              {[
                { id: 'story', label: 'Character Story', icon: <Database className="w-4 h-4" /> },
                { id: 'abilities', label: 'Powers & Stats', icon: <Zap className="w-4 h-4" /> },
                { id: 'gallery', label: 'Photo Collection', icon: <Camera className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-kaiju-pink text-white shadow-lg'
                      : 'bg-white text-kaiju-navy hover:bg-kaiju-pink/10 shadow-md border border-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'story' && (
                <motion.div
                  key="story"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Main Story */}
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
                      <p className="text-kaiju-navy/80 leading-relaxed text-lg">
                        {batch.lore}
                      </p>
                    </motion.div>

                    {/* Personality & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                      >
                        <h3 className="text-lg font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-kaiju-pink" />
                          Personality
                        </h3>
                        <div className="space-y-2">
                          {batch.personalityTraits.map((trait, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-kaiju-pink rounded-full mt-2 flex-shrink-0" />
                              <span className="text-kaiju-navy/80 text-sm">{trait}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-xl border-2 border-red-100"
                      >
                        <h3 className="text-lg font-bold text-red-600 mb-4">Vulnerabilities</h3>
                        <div className="space-y-2">
                          {batch.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-kaiju-navy/80 text-sm">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h3 className="text-lg font-bold text-kaiju-navy mb-4">Classification</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60 font-mono">Type:</span>
                          <span className="text-kaiju-navy font-bold">{batch.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60 font-mono">Element:</span>
                          <span className="text-kaiju-pink font-bold">{batch.element}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-kaiju-navy/60 font-mono">Rarity:</span>
                          <span className="text-kaiju-navy font-bold">{batch.rarity}</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100"
                    >
                      <h3 className="text-lg font-bold text-kaiju-navy mb-4">Habitat</h3>
                      <p className="text-kaiju-navy/80 text-sm leading-relaxed">
                        {batch.habitat}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'abilities' && (
                <motion.div
                  key="abilities"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Abilities Grid */}
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-kaiju-navy mb-8 text-center">
                      Documented Abilities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {batch.abilities.map((ability, index) => (
                        <AbilityCard key={index} ability={ability} index={index} />
                      ))}
                    </div>
                  </div>

                  {/* Battle Stats */}
                  <div className="flex justify-center">
                    <BattleStatsCard batch={batch} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-8">Photo Collection</h3>
                  <PolaroidGallery batch={batch} />
                  <div className="mt-8 text-kaiju-navy/60">
                    <p>Complete visual archive of {batch.name}</p>
                    <p className="text-sm mt-2">Physical collectible, digital NFT, and concept artwork</p>
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
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Collect {batch.name}</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  This character might be waiting in your next mystery box. Each mint is a surprise!
                </p>
                <button
                  onClick={handleMintRedirect}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Package className="w-5 h-5" />
                  Open Mystery Box
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}