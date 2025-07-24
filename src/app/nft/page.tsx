// src/app/nft/page.tsx - FIXED VERSION WITH PROPER IMAGE LOADING
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, ExternalLink, Calendar, User, Hash, Share2, Sparkles, Database, Zap, AlertCircle, Package, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { useBlockchainNFTSearch } from '@/lib/hooks/useBlockchainCryptoKaiju'
import type { KaijuNFT, OpenSeaAsset } from '@/lib/services/BlockchainCryptoKaijuService'

// FIXED: Enhanced Image Component with proper fallback handling
const KaijuImage = ({ 
  nft, 
  openSeaData,
  onError 
}: { 
  nft: KaijuNFT
  openSeaData?: OpenSeaAsset | null
  onError?: () => void
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // FIXED: Build proper image source priority list
  const getImageSources = (): string[] => {
    const sources: string[] = []
    
    // 1. FIRST: Try OpenSea images (most reliable)
    if (openSeaData?.display_image_url) {
      sources.push(openSeaData.display_image_url)
    }
    if (openSeaData?.image_url && openSeaData.image_url !== openSeaData.display_image_url) {
      sources.push(openSeaData.image_url)
    }
    
    // 2. SECOND: IPFS sources via our proxy (to avoid CORS)
    if (nft?.ipfsData?.image) {
      let ipfsUrl = nft.ipfsData.image
      if (ipfsUrl.startsWith('ipfs://')) {
        const hash = ipfsUrl.replace('ipfs://', '')
        sources.push(`/api/ipfs/${hash}`)
      } else if (ipfsUrl.includes('/ipfs/')) {
        const hash = ipfsUrl.split('/ipfs/')[1].split('?')[0] // Remove query params if any
        sources.push(`/api/ipfs/${hash}`)
      }
    }
    
    // 3. THIRD: Token URI as IPFS source via proxy
    if (nft?.tokenURI) {
      if (nft.tokenURI.startsWith('ipfs://')) {
        const hash = nft.tokenURI.replace('ipfs://', '')
        sources.push(`/api/ipfs/${hash}`)
      } else if (nft.tokenURI.includes('/ipfs/')) {
        const hash = nft.tokenURI.split('/ipfs/')[1].split('?')[0]
        sources.push(`/api/ipfs/${hash}`)
      }
    }
    
    // 4. LAST: Fallback placeholder
    sources.push('/images/placeholder-kaiju.png')
    
    return sources.filter(Boolean) // Remove any undefined/empty sources
  }

  const imageSources = getImageSources()
  const currentSrc = imageSources[currentImageIndex] || '/images/placeholder-kaiju.png'

  const handleImageError = () => {
    console.log(`Image failed: ${currentSrc}, trying next source...`)
    
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
    } else {
      console.warn('All image sources failed, using placeholder')
      onError?.()
    }
  }

  return (
    <>
      <Image
        src={currentSrc}
        alt={nft?.ipfsData?.name || `Kaiju #${nft?.tokenId}`}
        fill
        className="object-contain p-6"
        onError={handleImageError}
        priority
      />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-1 rounded">
          Source {currentImageIndex + 1}/{imageSources.length}
          <br />
          {currentSrc.substring(0, 30)}...
        </div>
      )}
    </>
  )
}

const NFTDisplayCard = ({ 
  nft, 
  openSeaData,
  onShare 
}: { 
  nft: KaijuNFT
  openSeaData?: OpenSeaAsset | null
  onShare: () => void
}) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get the display name with fallback priority
  const getDisplayName = (): string => {
    if (nft?.ipfsData?.name) return nft.ipfsData.name
    if (openSeaData?.name) return openSeaData.name
    return `CryptoKaiju #${nft?.tokenId || 'Unknown'}`
  }

  // Get description with fallback
  const getDescription = (): string => {
    if (nft?.ipfsData?.description) return nft.ipfsData.description
    if (openSeaData?.description) return openSeaData.description
    return 'A unique CryptoKaiju NFT with physical collectible counterpart.'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div className="relative">
          <div className="relative h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
            <KaijuImage 
              nft={nft} 
              openSeaData={openSeaData}
            />
            
            {/* Blockchain badge */}
            <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              ON-CHAIN
            </div>
            
            {/* Data source indicators */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              {nft?.ipfsData && (
                <div className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                  IPFS ✓
                </div>
              )}
              {openSeaData && (
                <div className="bg-purple-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold">
                  OPENSEA ✓
                </div>
              )}
            </div>
            
            {/* Floating action buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onShare}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-kaiju-pink transition-colors shadow-lg"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
              <motion.a
                href={`https://opensea.io/assets/ethereum/0x102c527714ab7e652630cac7a30abb482b041fd0/${nft?.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* NFT Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-kaiju-pink font-mono text-lg font-bold">#{nft?.tokenId || 'Unknown'}</span>
              {nft?.nfcId && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    NFC: {nft.nfcId}
                  </span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-black text-kaiju-navy mb-2">
              {getDisplayName()}
            </h1>
            <p className="text-lg text-kaiju-pink font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Blockchain-Verified NFT
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1">
                <User className="w-4 h-4" />
                OWNER
              </div>
              <div className="text-kaiju-navy font-bold text-sm">
                {nft?.owner ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` : 'Unknown'}
              </div>
            </div>

            {/* Add batch information */}
            {nft?.batch && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1">
                  <Package className="w-4 h-4" />
                  BATCH
                </div>
                <div className="text-kaiju-pink font-bold text-sm">
                  {nft.batch}
                </div>
              </div>
            )}
            
            {nft?.birthDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4" />
                  BIRTH DATE
                </div>
                <div className="text-kaiju-navy font-bold text-sm">
                  {formatDate(nft.birthDate)}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-kaiju-light-pink rounded-lg p-4">
            <h3 className="font-bold text-kaiju-navy mb-2">Description</h3>
            <p className="text-kaiju-navy/80 text-sm leading-relaxed">
              {getDescription()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* View Details Button - Main CTA */}
            <Link
              href={`/kaiju/${nft?.tokenId}`}
              className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-3 px-4 rounded-xl transition-colors text-center flex items-center justify-center gap-2 hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </Link>
            
            <a
              href={`https://opensea.io/assets/ethereum/0x102c527714ab7e652630cac7a30abb482b041fd0/${nft?.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              View on OpenSea
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Data Quality Info */}
          {!nft?.ipfsData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">IPFS Metadata Loading Issues</h4>
                  <div className="text-sm text-yellow-700">
                    Unable to load metadata from IPFS. This may affect the display of name, description, and traits.
                    <div className="mt-2 text-xs">Using blockchain data and OpenSea fallbacks where available.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const SearchForm = ({ onSearch, isLoading }: { onSearch: (query: string) => void; isLoading: boolean }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Database className="w-8 h-8 text-kaiju-pink" />
          <h2 className="text-2xl font-bold text-kaiju-navy">NFT Lookup</h2>
        </div>
        <p className="text-gray-600">
          Find your CryptoKaiju with direct blockchain access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Token ID (e.g., 1) or NFC ID (e.g., 042C0A8A9F6580)"
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 pr-12 focus:border-kaiju-pink focus:outline-none font-medium text-lg"
            disabled={isLoading}
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching Blockchain...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Search Blockchain
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default function NFTLookupPage() {
  const { results, isLoading, error, search, clear } = useBlockchainNFTSearch()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Get the first result with both nft and openSeaData
  const searchResult = results.length > 0 ? results[0] : null
  const nft = searchResult?.nft || null
  const openSeaData = searchResult?.openSeaData || null

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
    search(query)
  }

  const handleShare = async () => {
    if (navigator.share && nft) {
      try {
        await navigator.share({
          title: `${nft.ipfsData?.name || `Kaiju #${nft.tokenId}`} | CryptoKaiju`,
          text: `Check out this CryptoKaiju NFT: ${nft.ipfsData?.name || `#${nft.tokenId}`}`,
          url: window.location.href,
        })
      } catch (err) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href)
          alert('URL copied to clipboard!')
        }
      }
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard!')
      }
    }
  }

  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Dark Hero Section */}
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  NFT Lookup
                </h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Find your CryptoKaiju NFT with direct blockchain search
              </p>
            </motion.div>
          </div>
        </section>

        {/* Light Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {!hasSearched || (!nft && !isLoading && !error) ? (
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            ) : (
              <div className="space-y-8">
                {/* Search Again Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 max-w-2xl mx-auto"
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                      placeholder="Enter Token ID or NFC ID"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-kaiju-pink focus:outline-none"
                    />
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      disabled={isLoading}
                      className="bg-kaiju-pink hover:bg-kaiju-red text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Search
                    </button>
                  </div>
                </motion.div>

                {/* Results */}
                <AnimatePresence mode="wait">
                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-20"
                    >
                      <div className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <div className="text-kaiju-navy text-xl font-bold">Searching Blockchain...</div>
                      <div className="text-gray-600 mt-2">Querying smart contract directly</div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-2xl p-8 shadow-xl border-2 border-red-200 max-w-2xl mx-auto text-center"
                    >
                      <div className="text-red-500 text-xl font-bold mb-4">NFT Not Found</div>
                      <div className="text-gray-600 mb-6">
                        Could not find a CryptoKaiju with "{searchQuery}" on the blockchain.
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setHasSearched(false)
                          clear()
                        }}
                        className="bg-kaiju-pink text-white font-bold px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors"
                      >
                        Try Another Search
                      </button>
                    </motion.div>
                  )}

                  {nft && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <NFTDisplayCard
                        nft={nft}
                        openSeaData={openSeaData}
                        onShare={handleShare}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}