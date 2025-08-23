// src/components/pages/BatchDetailPageClient.tsx - UPDATED WITH RICH TEXT SUPPORT
'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, ExternalLink, Share2, Star, Package, Database, ShoppingCart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import ImprovedRichTextRenderer from '@/components/blog/ImprovedRichTextRenderer' // 🆕 Use existing rich text renderer
import { type KaijuBatch } from '@/lib/services/KaijuBatchService'

interface BatchDetailPageClientProps {
  batch: KaijuBatch
}

export default function BatchDetailPageClient({ batch }: BatchDetailPageClientProps) {
  const [activeTab, setActiveTab] = useState<'character' | 'physical' | 'specs'>('character')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Get available images for gallery
  const allImages = [
    ...batch.images.physical,
    ...(typeof batch.images.nft === 'string' ? [batch.images.nft] : batch.images.nft || []),
    ...batch.images.lifestyle,
    ...batch.images.detail,
    ...batch.images.concept,
    ...batch.images.packaging
  ].filter(Boolean)

  const currentImage = allImages[currentImageIndex] || batch.images.physical[0] || '/images/placeholder-kaiju.png'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${batch.name} | CryptoKaiju`,
          text: `Check out ${batch.name} - ${batch.essence}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      alert('URL copied to clipboard!')
    }
  }

  const rarityColors = {
    'Common': 'bg-green-100 text-green-800 border-green-200',
    'Rare': 'bg-blue-100 text-blue-800 border-blue-200',
    'Ultra Rare': 'bg-purple-100 text-purple-800 border-purple-200',
    'Legendary': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Background effects */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,theme(colors.kaiju-pink/20)_0%,transparent_50%)]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Main Image */}
                <div className="relative aspect-square bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                  <Image
                    src={currentImage}
                    alt={batch.name}
                    fill
                    className="object-contain p-8"
                    priority
                  />
                  
                  {/* Image Navigation */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentImageIndex
                                ? 'bg-kaiju-pink'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Right: Batch Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-kaiju-pink font-mono text-lg">#{batch.id}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${rarityColors[batch.rarity]}`}>
                      {batch.rarity}
                    </span>
                    {batch.featured && (
                      <span className="bg-kaiju-pink text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{batch.name}</h1>
                  <p className="text-xl text-kaiju-pink italic">"{batch.essence}"</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white/60 text-sm font-mono mb-1">TYPE</div>
                    <div className="text-white font-bold">{batch.type}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white/60 text-sm font-mono mb-1">SUPPLY</div>
                    <div className="text-white font-bold">~{batch.estimatedSupply}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white/60 text-sm font-mono mb-1">STATUS</div>
                    <div className="text-white font-bold">{batch.availability}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white/60 text-sm font-mono mb-1">DISCOVERED</div>
                    <div className="text-white font-bold">{batch.discoveredDate}</div>
                  </div>
                </div>

                {/* Colors */}
                {batch.colors.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white/60 text-sm font-mono mb-2">COLORS</div>
                    <div className="flex flex-wrap gap-2">
                      {batch.colors.map((color, index) => (
                        <span 
                          key={index}
                          className="bg-white/20 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {batch.availability === 'Mintable' ? (
                    <button className="flex-1 bg-kaiju-pink hover:bg-kaiju-red text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Mint Now
                    </button>
                  ) : batch.secondaryMarketUrl ? (
                    <a
                      href={batch.secondaryMarketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      View on Secondary
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  ) : null}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6" ref={ref}>
          <div className="max-w-4xl mx-auto">
            
            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 mb-12">
              {[
                { id: 'character', label: 'Character Lore', icon: Sparkles },
                { id: 'physical', label: 'Physical Details', icon: Package },
                { id: 'specs', label: 'Specifications', icon: Database }
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

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100"
            >
              {activeTab === 'character' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-kaiju-pink" />
                    Character Lore
                  </h3>
                  
                  {/* 🆕 USE RICH TEXT RENDERER */}
                  {typeof batch.characterDescription === 'string' ? (
                    <p className="text-lg leading-relaxed text-kaiju-navy/90 whitespace-pre-wrap">
                      {batch.characterDescription}
                    </p>
                  ) : (
                    <ImprovedRichTextRenderer 
                      content={batch.characterDescription}
                      className="text-lg leading-relaxed"
                    />
                  )}

                  {batch.habitat && (
                    <div className="bg-kaiju-light-pink rounded-xl p-6 mt-8">
                      <h4 className="text-lg font-bold text-kaiju-navy mb-3">Natural Habitat</h4>
                      {typeof batch.habitat === 'string' ? (
                        <p className="text-kaiju-navy/80 whitespace-pre-wrap">{batch.habitat}</p>
                      ) : (
                        <ImprovedRichTextRenderer 
                          content={batch.habitat}
                          className="text-kaiju-navy/80"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'physical' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-kaiju-pink" />
                    Physical Collectible
                  </h3>
                  
                  {/* 🆕 USE RICH TEXT RENDERER */}
                  {typeof batch.physicalDescription === 'string' ? (
                    <p className="text-lg leading-relaxed text-kaiju-navy/90 whitespace-pre-wrap">
                      {batch.physicalDescription}
                    </p>
                  ) : (
                    <ImprovedRichTextRenderer 
                      content={batch.physicalDescription}
                      className="text-lg leading-relaxed"
                    />
                  )}

                  {batch.marketing?.collectorsNote && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
                      <h4 className="text-lg font-bold text-kaiju-navy mb-3">Collector's Note</h4>
                      {typeof batch.marketing.collectorsNote === 'string' ? (
                        <p className="text-kaiju-navy/80 whitespace-pre-wrap">{batch.marketing.collectorsNote}</p>
                      ) : (
                        <ImprovedRichTextRenderer 
                          content={batch.marketing.collectorsNote}
                          className="text-kaiju-navy/80"
                        />
                      )}
                    </div>
                  )}

                  {batch.productionNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
                      <h4 className="text-lg font-bold text-kaiju-navy mb-3">Production Notes</h4>
                      {typeof batch.productionNotes === 'string' ? (
                        <p className="text-kaiju-navy/80 whitespace-pre-wrap">{batch.productionNotes}</p>
                      ) : (
                        <ImprovedRichTextRenderer 
                          content={batch.productionNotes}
                          className="text-kaiju-navy/80"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                    <Database className="w-6 h-6 text-kaiju-pink" />
                    Specifications
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Material & Dimensions */}
                    <div className="space-y-4">
                      {batch.materials && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-kaiju-navy mb-2">Materials</div>
                          <div className="text-kaiju-navy/80">{batch.materials}</div>
                        </div>
                      )}
                      
                      {batch.dimensions && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-kaiju-navy mb-2">Dimensions</div>
                          <div className="text-kaiju-navy/80">{batch.dimensions}</div>
                        </div>
                      )}
                      
                      {batch.packagingStyle && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-kaiju-navy mb-2">Packaging</div>
                          <div className="text-kaiju-navy/80">{batch.packagingStyle}</div>
                        </div>
                      )}
                    </div>

                    {/* Features & Series */}
                    <div className="space-y-4">
                      {batch.features && batch.features.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-kaiju-navy mb-2">Features</div>
                          <ul className="space-y-1">
                            {batch.features.map((feature, index) => (
                              <li key={index} className="text-kaiju-navy/80 text-sm">
                                • {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {batch.series?.isPartOfSeries && batch.series.name && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="font-semibold text-kaiju-navy mb-2">Part of Series</div>
                          <div className="text-purple-700 font-medium">{batch.series.name}</div>
                          {batch.series.position && (
                            <div className="text-purple-600 text-sm">Position #{batch.series.position}</div>
                          )}
                          {batch.series.description && (
                            <div className="mt-2">
                              {typeof batch.series.description === 'string' ? (
                                <p className="text-purple-700/80 text-sm whitespace-pre-wrap">{batch.series.description}</p>
                              ) : (
                                <ImprovedRichTextRenderer 
                                  content={batch.series.description}
                                  className="text-purple-700/80 text-sm"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Explore More Kaiju</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  Discover the complete CryptoKaiju universe and find your next collectible adventure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/kaijudex"
                    className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Database className="w-5 h-5" />
                    Browse Collection
                  </Link>
                  <Link
                    href="/#hero"
                    className="bg-white border-2 border-kaiju-pink text-kaiju-pink font-bold px-8 py-4 rounded-xl hover:bg-kaiju-pink hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    Mint Mystery Box
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}