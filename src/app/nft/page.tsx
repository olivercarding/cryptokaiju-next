// src/app/nft/page.tsx - COMPLETE FIXED VERSION
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, ExternalLink, Calendar, User, Hash, Share2, Sparkles, Database, Zap, Settings, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useBlockchainNFTSearch, useBlockchainTest } from '@/lib/hooks/useBlockchainCryptoKaiju'

// Import the test component
const NFCConversionTest = dynamic(() => import('@/components/dev/NFCConversionTest'), { ssr: false })

const NFTDisplayCard = ({ 
  nft, 
  openSeaData, 
  onShare 
}: { 
  nft: any
  openSeaData: any
  onShare: () => void
}) => {
  const [imageError, setImageError] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const getImageSrc = () => {
    console.log('🖼️ Determining image source:', {
      imageError,
      openSeaDisplayUrl: openSeaData?.display_image_url,
      openSeaImageUrl: openSeaData?.image_url,
      ipfsImage: nft?.ipfsData?.image
    })

    if (imageError) return '/images/placeholder-kaiju.png'
    
    // Priority order: OpenSea display_image_url > image_url > IPFS image
    if (openSeaData?.display_image_url) {
      console.log('✅ Using OpenSea display_image_url')
      return openSeaData.display_image_url
    }
    if (openSeaData?.image_url) {
      console.log('✅ Using OpenSea image_url')
      return openSeaData.image_url
    }
    if (nft?.ipfsData?.image) {
      let imageUrl = nft.ipfsData.image
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://cryptokaiju.mypinata.cloud/ipfs/')
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = `https://cryptokaiju.mypinata.cloud/ipfs/${imageUrl}`
      }
      console.log('✅ Using IPFS image:', imageUrl)
      return imageUrl
    }
    
    console.log('⚠️ No image source found, using placeholder')
    return '/images/placeholder-kaiju.png'
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get the display name with fallback priority
  const getDisplayName = () => {
    if (openSeaData?.name) return openSeaData.name
    if (nft?.ipfsData?.name) return nft.ipfsData.name
    return `Kaiju #${nft?.tokenId || 'Unknown'}`
  }

  // Get description with fallback
  const getDescription = () => {
    if (openSeaData?.description) return openSeaData.description
    if (nft?.ipfsData?.description) return nft.ipfsData.description
    return 'A unique CryptoKaiju NFT with physical toy counterpart.'
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
            <Image
              src={getImageSrc()}
              alt={getDisplayName()}
              fill
              className="object-contain p-6"
              onError={() => {
                console.log('❌ Image failed to load, switching to placeholder')
                setImageError(true)
              }}
              onLoad={() => console.log('✅ Image loaded successfully')}
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
                  OpenSea ✓
                </div>
              )}
            </div>
            
            {/* Debug toggle */}
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="absolute bottom-4 left-4 bg-gray-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs hover:bg-gray-600/90"
            >
              Debug {showDebugInfo ? '🔼' : '🔽'}
            </button>
            
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
              {openSeaData?.opensea_url && (
                <motion.a
                  href={openSeaData.opensea_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}
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

          {/* Debug Information */}
          <AnimatePresence>
            {showDebugInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-900 text-white rounded-lg p-4 text-xs"
              >
                <h4 className="font-bold mb-2 text-yellow-400">🔧 Debug Information</h4>
                <div className="space-y-1 font-mono">
                  <div>Has IPFS Data: {nft?.ipfsData ? '✅' : '❌'}</div>
                  <div>Has OpenSea Data: {openSeaData ? '✅' : '❌'}</div>
                  <div>OpenSea URL: {openSeaData?.opensea_url ? '✅' : '⚠️ Fallback'}</div>
                  <div>Token URI: {nft?.tokenURI || 'None'}</div>
                  <div>IPFS Image: {nft?.ipfsData?.image || 'None'}</div>
                  <div>OpenSea Image: {openSeaData?.image_url || 'None'}</div>
                  <div>OpenSea Display: {openSeaData?.display_image_url || 'None'}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* External Links - Always show OpenSea link */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={openSeaData?.opensea_url || `https://opensea.io/assets/ethereum/0x102c527714ab7e652630cac7a30abb482b041fd0/${nft?.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              View on OpenSea
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <a
              href={`https://etherscan.io/token/0x102c527714ab7e652630cac7a30abb482b041fd0?a=${nft?.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              Etherscan
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Missing Data Warning - Only show if critical data is missing */}
          {!nft?.ipfsData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">IPFS Metadata Loading Issues</h4>
                  <div className="text-sm text-yellow-700">
                    Unable to load metadata from IPFS. This may affect the display of name, description, and traits.
                    <div className="mt-2 text-xs">Check browser console for detailed error messages.</div>
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
          <h2 className="text-2xl font-bold text-kaiju-navy">Blockchain NFT Lookup</h2>
        </div>
        <p className="text-gray-600">
          Instantly find your CryptoKaiju using direct blockchain queries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Token ID (e.g., 1503) or NFC ID (e.g., 047D1BBA4E6E80)"
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

      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          ⚡ Enhanced Blockchain Search
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Improved error handling</strong> - detailed logging for debugging</li>
          <li>• <strong>Multiple IPFS gateways</strong> - fallback for failed metadata</li>
          <li>• <strong>Enhanced OpenSea integration</strong> - better image and link handling</li>
          <li>• <strong>Debug mode</strong> - click debug button to see data sources</li>
        </ul>
      </div>
    </motion.div>
  )
}

export default function NFTLookupPage() {
  const { result, isLoading, error, search, clear } = useBlockchainNFTSearch()
  const { runTest, isTestRunning, testResults } = useBlockchainTest()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [showConversion, setShowConversion] = useState(false)

  const handleSearch = (query: string) => {
    console.log(`🔍 Starting search for: "${query}"`)
    setSearchQuery(query)
    setHasSearched(true)
    search(query)
  }

  const handleShare = async () => {
    if (navigator.share && result?.nft) {
      try {
        await navigator.share({
          title: `${result.nft.ipfsData?.name || `Kaiju #${result.nft.tokenId}`} | CryptoKaiju`,
          text: `Check out this CryptoKaiju NFT: ${result.nft.ipfsData?.name || `#${result.nft.tokenId}`}`,
          url: window.location.href,
        })
      } catch (err) {
        navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard!')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('URL copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      {/* Header */}
      <div className="pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              href="/kaijudex"
              className="inline-flex items-center gap-2 text-kaiju-pink hover:text-kaiju-red transition-colors font-medium"
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
              <h1 className="text-4xl md:text-5xl font-black text-kaiju-navy">
                Enhanced NFT Lookup
              </h1>
            </div>
            <p className="text-lg text-kaiju-navy/70 max-w-2xl mx-auto">
              Find your CryptoKaiju with improved error handling and debugging
            </p>
          </motion.div>

          {/* Test Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8 space-y-2"
          >
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowTest(!showTest)}
                className="text-gray-500 hover:text-kaiju-pink text-sm font-medium transition-colors"
              >
                🧪 Blockchain Test Panel
              </button>
              <button
                onClick={() => setShowConversion(!showConversion)}
                className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                <Settings className="w-4 h-4 inline mr-1" />
                NFC Conversion Test
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Test Panels */}
      <AnimatePresence>
        {showTest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 mb-8"
          >
            <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Enhanced Blockchain Service Test</h3>
                <button
                  onClick={runTest}
                  disabled={isTestRunning}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isTestRunning ? 'Testing...' : 'Run Test'}
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                {testResults.length > 0 ? (
                  testResults.map((log, index) => (
                    <div key={`log-${index}`} className="text-sm font-mono mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">Click "Run Test" to test blockchain connectivity</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {showConversion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 mb-8"
          >
            <div className="max-w-7xl mx-auto">
              <NFCConversionTest />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {!hasSearched || (!result?.nft && !isLoading && !error) ? (
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
                    <div className="text-gray-600 mt-2">Enhanced search with better error handling</div>
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
                      Could not find a CryptoKaiju with "{searchQuery}" on the blockchain. Check the browser console for detailed error information.
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

                {result?.nft && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <NFTDisplayCard
                      nft={result.nft}
                      openSeaData={result.openSeaData}
                      onShare={handleShare}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}