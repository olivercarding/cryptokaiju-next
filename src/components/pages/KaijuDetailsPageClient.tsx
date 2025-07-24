// src/components/pages/KaijuDetailsPageClient.tsx - SIMPLE BATCH LINK FIX
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Calendar, User, Hash, Share2, Star, Database, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { useBlockchainKaiju } from '@/lib/hooks/useBlockchainCryptoKaiju'

interface KaijuDetailsPageClientProps {
  tokenId: string
}

interface TraitData {
  trait_type: string
  value: string
  rarity?: number
}

interface OpenSeaTrait {
  trait_type: string
  value: any
}

interface IPFSAttribute {
  trait_type?: string
  value?: any
  [key: string]: any
}

// Simple batch name to slug conversion
const batchNameToSlug = (batchName: string): string => {
  if (!batchName) return ''
  
  // Common batch mappings
  const mappings: Record<string, string> = {
    'Halloween Celebration': 'halloween-celebration',
    'Spooky Halloween Special': 'spooky',
    'Genesis Kaiju': 'genesis',
    'Genesis': 'genesis',
    'Mr. Wasabi': 'mr-wasabi',
    'Mr Wasabi': 'mr-wasabi',
    'Dogejira': 'dogejira',
    'CryptoKitty': 'cryptokitty',
    'CryptoKitties': 'cryptokitty',
    'Sushi': 'sushi',
    'SushiSwap': 'sushi',
    'Pretty Fine Plushies': 'pretty-fine-plushies',
    'Jaiantokoin': 'jaiantokoin',
    'URI': 'uri',
    'Spangle': 'spangle',
  }
  
  if (mappings[batchName]) {
    return mappings[batchName]
  }
  
  // Convert to slug format
  return batchName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Simple batch page existence check (we'll assume common ones exist)
const batchPageExists = (batchName: string): boolean => {
  if (!batchName) return false
  
  const knownBatches = [
    'Halloween Celebration',
    'Spooky Halloween Special', 
    'Genesis Kaiju',
    'Genesis',
    'Mr. Wasabi',
    'Mr Wasabi',
    'Dogejira',
    'CryptoKitty',
    'CryptoKitties',
    'Sushi',
    'SushiSwap',
    'Pretty Fine Plushies',
    'Jaiantokoin',
    'URI',
    'Spangle'
  ]
  
  return knownBatches.includes(batchName)
}

const TraitCard = ({ traitType, value, rarity }: { 
  traitType: string
  value: string
  rarity?: number 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-kaiju-pink/50 transition-all duration-300 shadow-lg"
  >
    <div className="text-kaiju-navy/60 text-sm font-mono uppercase tracking-wide mb-1">
      {traitType}
    </div>
    <div className="text-kaiju-navy font-bold text-lg capitalize mb-1">
      {value}
    </div>
    {rarity && (
      <div className="text-kaiju-pink text-xs font-mono">
        {rarity}% have this trait
      </div>
    )}
  </motion.div>
)

export default function KaijuDetailsPageClient({ tokenId }: KaijuDetailsPageClientProps) {
  const { kaiju, openSeaData, isLoading, error } = useBlockchainKaiju(tokenId)
  const [activeTab, setActiveTab] = useState<'overview' | 'traits'>('overview')
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Debug logging
  useEffect(() => {
    if (kaiju) {
      console.log('🐛 Kaiju data:', { 
        tokenId: kaiju.tokenId, 
        batch: kaiju.batch,
        openSeaData: openSeaData?.traits?.find((t: OpenSeaTrait) => t.trait_type?.toLowerCase() === 'batch')
      })
    }
  }, [kaiju, openSeaData])

  // Update page title when kaiju data loads
  useEffect(() => {
    if (kaiju?.ipfsData?.name) {
      document.title = `${kaiju.ipfsData.name} | CryptoKaiju #${tokenId}`
    }
  }, [kaiju, tokenId])

  // FIXED: Proper image source priority with proxy first
  const getImageSources = (): string[] => {
    const sources: string[] = []
    
    // 1. FIRST: OpenSea images (most reliable)
    if (openSeaData?.display_image_url) {
      sources.push(openSeaData.display_image_url)
    }
    if (openSeaData?.image_url && openSeaData.image_url !== openSeaData.display_image_url) {
      sources.push(openSeaData.image_url)
    }
    
    // 2. SECOND: IPFS proxy (avoids CORS)
    if (kaiju?.ipfsData?.image) {
      let ipfsUrl = kaiju.ipfsData.image
      if (ipfsUrl.startsWith('ipfs://')) {
        const hash = ipfsUrl.replace('ipfs://', '')
        sources.push(`/api/ipfs/${hash}`)
      } else if (ipfsUrl.includes('/ipfs/')) {
        const hash = ipfsUrl.split('/ipfs/')[1]
        sources.push(`/api/ipfs/${hash}`)
      }
    }
    
    // 3. THIRD: Token URI via proxy if it's IPFS
    if (kaiju?.tokenURI) {
      if (kaiju.tokenURI.startsWith('ipfs://')) {
        const hash = kaiju.tokenURI.replace('ipfs://', '')
        sources.push(`/api/ipfs/${hash}`)
      } else if (kaiju.tokenURI.includes('/ipfs/')) {
        const hash = kaiju.tokenURI.split('/ipfs/')[1]
        sources.push(`/api/ipfs/${hash}`)
      }
    }
    
    // 4. LAST: Fallback placeholder
    sources.push('/images/placeholder-kaiju.png')
    
    return sources
  }

  const imageSources = getImageSources()
  const currentSrc = imageSources[currentImageIndex] || '/images/placeholder-kaiju.png'

  const handleImageError = () => {
    console.log(`Image failed: ${currentSrc}, trying next source...`)
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
    } else {
      setImageError(true)
    }
  }

  const getTraits = (): TraitData[] => {
    const traits: TraitData[] = []
    
    // Get traits from OpenSea if available
    if (openSeaData?.traits && Array.isArray(openSeaData.traits)) {
      openSeaData.traits.forEach((trait: OpenSeaTrait) => {
        if (trait.trait_type && trait.value !== undefined && trait.value !== null) {
          traits.push({
            trait_type: trait.trait_type,
            value: trait.value.toString(),
            rarity: 0 // Calculate from trait counts if needed
          })
        }
      })
    }
    
    // Fall back to IPFS attributes
    if (traits.length === 0 && kaiju?.ipfsData?.attributes) {
      if (Array.isArray(kaiju.ipfsData.attributes)) {
        // Handle array format
        kaiju.ipfsData.attributes.forEach((attr: IPFSAttribute) => {
          if (attr.trait_type && attr.value && !['dob', 'nfc'].includes(attr.trait_type.toLowerCase())) {
            traits.push({
              trait_type: attr.trait_type,
              value: attr.value.toString(),
              rarity: 0
            })
          }
        })
      } else if (typeof kaiju.ipfsData.attributes === 'object' && kaiju.ipfsData.attributes !== null) {
        // Handle object format
        Object.entries(kaiju.ipfsData.attributes).forEach(([key, value]) => {
          if (value && !['dob', 'nfc'].includes(key.toLowerCase())) {
            traits.push({
              trait_type: key,
              value: value.toString(),
              rarity: 0
            })
          }
        })
      }
    }
    
    return traits
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async (): Promise<void> => {
    if (navigator.share && kaiju) {
      try {
        await navigator.share({
          title: `${kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`} | CryptoKaiju`,
          text: `Check out this amazing CryptoKaiju: ${kaiju.ipfsData?.name || `#${kaiju.tokenId}`}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
        // Fallback to copying URL
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href)
          alert('URL copied to clipboard!')
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard!')
      }
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full mx-auto mb-4"
            />
            <div className="text-kaiju-pink font-mono text-lg">LOADING KAIJU DATA...</div>
            <div className="text-white/60 font-mono text-sm mt-2">Accessing blockchain records...</div>
          </div>
        </div>
      </>
    )
  }

  if (error || !kaiju) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl font-bold mb-4">Kaiju Not Found</div>
            <div className="text-white/60 mb-8">The requested Kaiju does not exist in our database.</div>
            <Link 
              href="/kaijudex"
              className="inline-flex items-center gap-2 bg-kaiju-pink text-white font-bold px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Kaijudex
            </Link>
          </div>
        </div>
      </>
    )
  }

  const traits = getTraits()

  return (
    <>
      <Header />
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* HERO SECTION - DARK WITH KAIJU INFO */}
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

            {/* Kaiju Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
            >
              {/* Left: Kaiju Image */}
              <div className="lg:col-span-1">
                <div className="relative h-96 bg-gradient-to-br from-white/10 to-white/5 rounded-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                  <Image
                    src={currentSrc}
                    alt={kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
                    fill
                    className="object-contain p-6"
                    onError={handleImageError}
                    priority
                  />
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-1 rounded">
                      {currentImageIndex + 1}/{imageSources.length}
                    </div>
                  )}
                  
                  {/* Floating action buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                    {openSeaData?.opensea_url && (
                      <motion.a
                        href={openSeaData.opensea_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>

                  {/* Blockchain verification badge */}
                  <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    ON-CHAIN
                  </div>
                </div>
              </div>

              {/* Right: Kaiju Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="text-kaiju-pink font-mono text-lg">#{kaiju.tokenId}</span>
                    {kaiju.nfcId && (
                      <span className="text-white/60 font-mono text-sm bg-white/10 px-2 py-1 rounded">NFC: {kaiju.nfcId}</span>
                    )}
                    {/* UPDATED: Simple batch linking */}
                    {kaiju.batch && (
                      <span className="text-white/60 font-mono text-sm bg-white/10 px-2 py-1 rounded">
                        Batch: {batchPageExists(kaiju.batch) ? (
                          <Link 
                            href={`/kaijudex/${batchNameToSlug(kaiju.batch)}`}
                            className="text-kaiju-pink hover:text-white transition-colors underline decoration-dotted underline-offset-2 ml-1"
                            title={`View ${kaiju.batch} collection page`}
                          >
                            {kaiju.batch}
                          </Link>
                        ) : (
                          <span className="ml-1">{kaiju.batch}</span>
                        )}
                      </span>
                    )}
                    {/* Debug batch info */}
                    {process.env.NODE_ENV === 'development' && kaiju.batch && (
                      <span className="text-yellow-400 text-xs bg-black/50 px-2 py-1 rounded">
                        Batch: "{kaiju.batch}" → Exists: {batchPageExists(kaiju.batch) ? 'YES' : 'NO'}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-5xl font-black text-white mb-2">
                  {kaiju.ipfsData?.name || openSeaData?.name || `Kaiju #${kaiju.tokenId}`}
                  </h1>
                  <p className="text-xl text-kaiju-pink font-mono">
                    Ethereum NFT • Blockchain Collectible
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                      <User className="w-4 h-4" />
                      OWNER
                    </div>
                    <div className="text-white font-bold">
                      {kaiju.owner ? `${kaiju.owner.slice(0, 6)}...${kaiju.owner.slice(-4)}` : 'Unknown'}
                    </div>
                  </div>
                  
                  {kaiju.birthDate && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                        <Calendar className="w-4 h-4" />
                        MINTED
                      </div>
                      <div className="text-white font-bold text-sm">
                        {formatDate(kaiju.birthDate)}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                      <Hash className="w-4 h-4" />
                      TOKEN ID
                    </div>
                    <div className="text-kaiju-pink font-bold">
                      #{kaiju.tokenId}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                      <Star className="w-4 h-4" />
                      RARITY
                    </div>
                    <div className="text-white font-bold">
                      {openSeaData?.rarity?.rank ? `#${openSeaData.rarity.rank}` : 'Rare'}
                    </div>
                  </div>
                </div>

                {/* External Links */}
                <div className="flex gap-4">
                  {openSeaData?.opensea_url && (
                    <a
                      href={openSeaData.opensea_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                      View on OpenSea
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  <a
                    href={`https://etherscan.io/token/0x102c527714ab7e652630cac7a30abb482b041fd0?a=${kaiju.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    View on Etherscan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CONTENT SECTION - LIGHT BACKGROUND LIKE OTHER PAGES */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 mb-12">
              {[
                { id: 'overview', label: 'Overview', icon: Database },
                { id: 'traits', label: 'Traits', icon: Star }
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
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Description */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
                    <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                      <Package className="w-6 h-6 text-kaiju-pink" />
                      Description
                    </h3>
                    <p className="text-kaiju-navy/80 leading-relaxed text-lg">
                      {kaiju.ipfsData?.description || openSeaData?.description || 
                       `A unique CryptoKaiju entity minted on the Ethereum blockchain. This digital collectible represents ownership of both a virtual and physical Kaiju character with unique traits and characteristics.`}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
                    <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-2">
                      <Database className="w-6 h-6 text-kaiju-pink" />
                      Blockchain Data
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-kaiju-navy/60 font-medium">Contract:</span>
                          <span className="text-kaiju-navy font-mono">0x102c...1fd0</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-kaiju-navy/60 font-medium">Token Standard:</span>
                          <span className="text-kaiju-navy font-mono">ERC-721</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-kaiju-navy/60 font-medium">Blockchain:</span>
                          <span className="text-kaiju-navy">Ethereum</span>
                        </div>
                        {kaiju.tokenURI && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-kaiju-navy/60 font-medium">Metadata:</span>
                            <a 
                              href={kaiju.tokenURI}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-kaiju-pink hover:text-kaiju-red transition-colors font-mono"
                            >
                              IPFS
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'traits' && (
                <motion.div
                  key="traits"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {traits.map((trait, index) => (
                    <motion.div
                      key={`${trait.trait_type}-${trait.value}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TraitCard 
                        traitType={trait.trait_type}
                        value={trait.value}
                        rarity={trait.rarity}
                      />
                    </motion.div>
                  ))}
                  
                  {traits.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No traits data available for this Kaiju.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Discover More Kaiju</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  Explore the complete CryptoKaiju collection and find your next collectible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/kaijudex"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Database className="w-5 h-5" />
                    Browse Collection
                  </Link>
                  <Link
                    href="/#hero"
                    className="inline-flex items-center gap-3 bg-white border-2 border-kaiju-pink text-kaiju-pink font-bold text-lg px-8 py-4 rounded-xl hover:bg-kaiju-pink hover:text-white transition-all duration-300"
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