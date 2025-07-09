// src/app/kaijudex/[slug]/page.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Package, Sparkles, Sword, Zap, Star, Database, Camera } from 'lucide-react'
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
        <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-gray-100 transform hover:rotate-0 transition-transform duration-300"
             style={{ transform: 'rotate(-1deg)' }}>
          <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
            <Image
              src={allImages[activeImage]?.src || batch.nftImage}
              alt={allImages[activeImage]?.label || batch.name}
              fill
              className="object-contain p-4"
            />

            <div className="absolute bottom-2 left-2 bg-kaiju-navy/80 text-white text-xs px-2 py-1 rounded">
              {allImages[activeImage]?.label}
            </div>
          </div>

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
              <Image src={image.src} alt={image.label} fill className="object-contain p-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Ability Card
const AbilityCard = ({ ability, index }: { ability: string; index: number }) => (
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
      <div className="text-kaiju-navy font-bold text-sm leading-tight">{ability}</div>
    </div>
  </motion.div>
)

// Battle Stats Card
const BattleStatsCard = ({ batch }: { batch: KaijuBatch }) => (
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

export default function BatchDetailPage({ params }: BatchDetailPageProps) {
  const batch = getBatchBySlug(params.slug)
  if (!batch) notFound()

  const [activeTab, setActiveTab] = useState<'story' | 'abilities' | 'gallery'>('story')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const handleMintRedirect = () => {
    window.location.href = '/#hero'
  }

  return (
    <>
      <Header />

      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Hero Section */}
        {/* ... unchanged hero code ... */}
        {/* Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6" ref={ref}>
          <div className="max-w-7xl mx-auto">
            {/* Tabs */}
            {/* ... tab nav unchanged ... */}
            <AnimatePresence mode="wait">
              {activeTab === 'story' && (
                <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-100">
                      <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                        <Database className="w-6 h-6 text-kaiju-pink" />
                        Character Story
                      </h3>
                      <p className="text-kaiju-navy/80 leading-relaxed text-lg">{batch.description}</p>
                    </motion.div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Classification & Habitat cards unchanged */}
                  </div>
                </motion.div>
              )}

              {activeTab === 'abilities' && (
                <motion.div key="abilities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-kaiju-navy mb-8 text-center">Documented Abilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {batch.abilities.map((ability, index) => <AbilityCard key={index} ability={ability} index={index} />)}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <BattleStatsCard batch={batch} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-8">Photo Collection</h3>
                  <PolaroidGallery batch={batch} />
                  <div className="mt-8 text-kaiju-navy/60">
                    <p>Complete visual archive of {batch.name}</p>
                    <p className="text-sm mt-2">Physical collectible, digital NFT and concept artwork</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom CTA unchanged */}
          </div>
        </section>
      </main>
    </>
  )
}
