// src/app/kaiju/[tokenId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Calendar, User, Hash, Share2, Heart, Shield, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useKaijuDetails } from '@/lib/hooks/useCryptoKaiju'

interface KaijuDetailsPageProps {
  params: {
    tokenId: string
  }
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
    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-kaiju-pink/50 transition-all duration-300"
  >
    <div className="text-white/60 text-sm font-mono uppercase tracking-wide mb-1">
      {traitType}
    </div>
    <div className="text-white font-bold text-lg capitalize mb-1">
      {value}
    </div>
    {rarity && (
      <div className="text-kaiju-pink text-xs font-mono">
        {rarity}% have this trait
      </div>
    )}
  </motion.div>
)

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

export default function KaijuDetailsPage({ params }: KaijuDetailsPageProps) {
  const { kaiju, openSeaData, isLoading, error } = useKaijuDetails(params.tokenId)
  const [activeTab, setActiveTab] = useState<'overview' | 'traits' | 'history'>('overview')
  const [imageError, setImageError] = useState(false)

  const getImageSrc = () => {
    if (imageError) return '/images/placeholder-kaiju.png'
    
    // Prefer OpenSea image if available
    if (openSeaData?.display_image_url) return openSeaData.display_image_url
    if (openSeaData?.image_url) return openSeaData.image_url
    
    // Fall back to IPFS metadata
    if (kaiju?.ipfsData?.image) {
      if (kaiju.ipfsData.image.startsWith('ipfs://')) {
        return kaiju.ipfsData.image.replace('ipfs://', 'https://cryptokaiju.mypinata.cloud/ipfs/')
      }
      return kaiju.ipfsData.image
    }
    
    return '/images/placeholder-kaiju.png'
  }

  const getTraits = () => {
    const traits = []
    
    // Get traits from OpenSea if available
    if (openSeaData?.traits) {
      openSeaData.traits.forEach(trait => {
        traits.push({
          trait_type: trait.trait_type,
          value: trait.value.toString(),
          rarity: 0 // Calculate from trait counts if needed
        })
      })
    }
    
    // Fall back to IPFS attributes
    if (traits.length === 0 && kaiju?.ipfsData?.attributes) {
      Object.entries(kaiju.ipfsData.attributes).forEach(([key, value]) => {
        if (value && !['dob', 'nfc'].includes(key)) {
          traits.push({
            trait_type: key,
            value: value.toString(),
            rarity: 0
          })
        }
      })
    }
    
    return traits
  }

  const generateBattleStats = () => {
    // Generate pseudo-random stats based on token ID for consistency
    const seed = parseInt(params.tokenId) || 1
    const random = (min: number, max: number, offset: number = 0) => {
      return Math.floor(((seed + offset) * 9301 + 49297) % 233280 / 233280 * (max - min) + min)
    }
    
    return {
      attack: random(30, 100, 1),
      defense: random(30, 100, 2),
      speed: random(30, 100, 3),
      special: random(30, 100, 4)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
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
        navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard!')
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('URL copied to clipboard!')
    }
  }

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
          <div className="text-white/60 font-mono text-sm mt-2">Accessing blockchain records...</div>
        </div>
      </div>
    )
  }

  if (error || !kaiju) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl font-bold mb-4">Entity Not Found</div>
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
    )
  }

  const traits = getTraits()
  const battleStats = generateBattleStats()

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

          {/* Kaiju Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          >
            {/* Left: Kaiju Image */}
            <div className="lg:col-span-1">
              <div className="relative h-96 bg-gradient-to-br from-kaiju-purple-dark/20 to-kaiju-pink/20 rounded-xl overflow-hidden border border-kaiju-pink/30">
                <Image
                  src={getImageSrc()}
                  alt={kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
                  fill
                  className="object-contain p-6"
                  onError={() => setImageError(true)}
                />
                
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
              </div>
            </div>

            {/* Right: Kaiju Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-kaiju-pink font-mono text-lg">#{kaiju.tokenId}</span>
                  {kaiju.nfcId && (
                    <span className="text-white/60 font-mono text-sm">NFC: {kaiju.nfcId}</span>
                  )}
                </div>
                
                <h1 className="text-5xl font-black text-white mb-2">
                  {kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
                </h1>
                <p className="text-xl text-kaiju-pink font-mono">
                  Ethereum Entity • ERC-721 Token
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                    <User className="w-4 h-4" />
                    OWNER
                  </div>
                  <div className="text-white font-bold">
                    {kaiju.owner ? `${kaiju.owner.slice(0, 6)}...${kaiju.owner.slice(-4)}` : 'Unknown'}
                  </div>
                </div>
                
                {kaiju.birthDate && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                      <Calendar className="w-4 h-4" />
                      MINTED
                    </div>
                    <div className="text-white font-bold text-sm">
                      {formatDate(kaiju.birthDate)}
                    </div>
                  </div>
                )}
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm font-mono mb-1">
                    <Hash className="w-4 h-4" />
                    TOKEN ID
                  </div>
                  <div className="text-kaiju-pink font-bold">
                    #{kaiju.tokenId}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
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
                  href={`https://etherscan.io/token/0x0aa42b44ce63e4ba6c9b2c4a7bb7dd6d9f1b3f4a?a=${kaiju.tokenId}`}
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
      </div>

      {/* Content Tabs */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-white/20">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'traits', label: 'Traits' },
              { id: 'history', label: 'Battle Stats' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-mono transition-colors ${
                  activeTab === tab.id
                    ? 'text-kaiju-pink border-b-2 border-kaiju-pink'
                    : 'text-white/70 hover:text-white'
                }`}
              >
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
                className="space-y-8"
              >
                {/* Description */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                  <p className="text-white/80 leading-relaxed">
                    {kaiju.ipfsData?.description || openSeaData?.description || 
                     `A unique CryptoKaiju entity minted on the Ethereum blockchain. This digital collectible represents ownership of both a virtual and physical Kaiju character with unique traits and characteristics.`}
                  </p>
                </div>

                {/* Metadata */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-xl font-bold text-white mb-4">Blockchain Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Contract:</span>
                      <span className="text-white">0x0aa...3f4a</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Token Standard:</span>
                      <span className="text-white">ERC-721</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Blockchain:</span>
                      <span className="text-white">Ethereum</span>
                    </div>
                    {kaiju.tokenURI && (
                      <div className="flex justify-between">
                        <span className="text-white/60 font-mono">Metadata:</span>
                        <a 
                          href={`https://cryptokaiju.mypinata.cloud/ipfs/${kaiju.tokenURI}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-kaiju-pink hover:text-white transition-colors"
                        >
                          IPFS
                        </a>
                      </div>
                    )}
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
                    key={`${trait.trait_type}-${trait.value}`}
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
                  <div className="col-span-full text-center py-8 text-white/60">
                    No traits data available for this Kaiju.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Battle Stats */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-lg font-bold text-white mb-6">Combat Analysis</h3>
                  <div className="space-y-4">
                    <StatBar label="Attack" value={battleStats.attack} icon={<Zap className="w-4 h-4" />} />
                    <StatBar label="Defense" value={battleStats.defense} icon={<Shield className="w-4 h-4" />} />
                    <StatBar label="Speed" value={battleStats.speed} icon={<Zap className="w-4 h-4" />} />
                    <StatBar label="Special" value={battleStats.special} icon={<Star className="w-4 h-4" />} />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-kaiju-navy/50 rounded-xl p-6 border border-kaiju-pink/30">
                  <h3 className="text-lg font-bold text-white mb-4">Entity Classification</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Type:</span>
                      <span className="text-white">Digital Collectible</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Format:</span>
                      <span className="text-kaiju-pink">NFT + Physical</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Collection:</span>
                      <span className="text-white">CryptoKaiju</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-mono">Status:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}