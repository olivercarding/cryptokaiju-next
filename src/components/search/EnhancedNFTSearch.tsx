// src/components/search/EnhancedNFTSearch.tsx - Enhanced NFT Search with Error Handling
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, Database, ArrowLeft, RefreshCw, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useBlockchainNFTSearch } from '@/lib/hooks/useBlockchainCryptoKaiju'
import { ErrorHandler, ErrorFactory } from '@/lib/utils/errorHandling'
import ErrorDisplay from '@/components/shared/ErrorDisplay'

interface EnhancedNFTSearchProps {
  initialQuery?: string
  onResultSelect?: (result: any) => void
  showBackButton?: boolean
  className?: string
}

// Enhanced Kaiju Card Component
const EnhancedKaijuCard = ({ result, index }: { result: any; index: number }) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const nft = result.nft
  const openSeaData = result.openSeaData

  // Smart image source selection with fallbacks
  const getImageSrc = () => {
    if (imageError) return '/images/placeholder-kaiju.png'
    
    // Priority: OpenSea display image > OpenSea image > IPFS image > placeholder
    if (openSeaData?.display_image_url) return openSeaData.display_image_url
    if (openSeaData?.image_url) return openSeaData.image_url
    if (nft?.ipfsData?.image) {
      const ipfsImage = nft.ipfsData.image
      return ipfsImage.startsWith('ipfs://') 
        ? ipfsImage.replace('ipfs://', 'https://cryptokaiju.mypinata.cloud/ipfs/')
        : ipfsImage
    }
    return '/images/placeholder-kaiju.png'
  }

  const displayName = nft?.ipfsData?.name || openSeaData?.name || `CryptoKaiju #${nft?.tokenId || 'Unknown'}`
  const description = nft?.ipfsData?.description || openSeaData?.description || 'A unique CryptoKaiju NFT with physical collectible counterpart.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-kaiju-pink/50 transition-all duration-300 overflow-hidden"
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/10 to-kaiju-purple-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Status badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Database className="w-3 h-3" />
          VERIFIED
        </div>
        {nft?.nfcId && (
          <div className="bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-bold">
            NFC CHIP
          </div>
        )}
      </div>

      {/* Token ID badge */}
      <div className="absolute top-4 right-4 bg-kaiju-pink text-white px-3 py-1 rounded-full text-sm font-bold z-10">
        #{nft?.tokenId || '?'}
      </div>

      {/* Main image */}
      <div className="relative h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mt-8">
        <Image
          src={getImageSrc()}
          alt={displayName}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-kaiju-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          initial={false}
          animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-white font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            View Details
            <Zap className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-black text-kaiju-navy mb-2 group-hover:text-kaiju-pink transition-colors">
          {displayName}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Enhanced metadata display */}
        <div className="space-y-3 mb-4">
          {nft?.nfcId && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">NFC Chip ID</div>
              <div className="text-sm font-mono font-bold text-blue-800">{nft.nfcId}</div>
            </div>
          )}
          
          {nft?.batch && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Batch Collection</div>
              <div className="text-sm font-bold text-purple-800">{nft.batch}</div>
            </div>
          )}
          
          {nft?.owner && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Current Owner</div>
              <div className="text-sm font-mono font-bold text-gray-800">
                {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/kaiju/${nft?.tokenId}`}
            className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 text-center text-sm flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            Full Details
          </Link>
          
          {openSeaData?.opensea_url && (
            <a
              href={openSeaData.opensea_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors text-sm flex items-center justify-center"
              title="View on OpenSea"
            >
              🌊
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Search suggestions component
const SearchSuggestions = ({ onSuggestionClick, searchHistory }: { 
  onSuggestionClick: (suggestion: string) => void
  searchHistory: string[]
}) => {
  const suggestions = [
    { label: 'Token ID: 1', value: '1', type: 'token' },
    { label: 'Token ID: 100', value: '100', type: 'token' },
    { label: 'Random NFC', value: '042C0A8A9F6580', type: 'nfc' },
  ]

  if (searchHistory.length === 0 && suggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-lg"
    >
      {searchHistory.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((query, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(query)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          Try These
        </h4>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.value)}
              className="px-3 py-1 bg-kaiju-pink/10 hover:bg-kaiju-pink/20 text-kaiju-pink rounded-full text-sm transition-colors flex items-center gap-1"
            >
              {suggestion.type === 'token' ? '🏷️' : '💎'}
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Main Enhanced NFT Search Component
export default function EnhancedNFTSearch({ 
  initialQuery = '', 
  onResultSelect,
  showBackButton = true,
  className = ''
}: EnhancedNFTSearchProps) {
  const { 
    results, 
    isLoading, 
    error, 
    query: currentQuery,
    searchHistory,
    hasQuery, 
    canRetry,
    search, 
    clear,
    retry
  } = useBlockchainNFTSearch()
  
  const [inputQuery, setInputQuery] = useState(initialQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchStats, setSearchStats] = useState({ totalSearches: 0, successfulSearches: 0 })

  // Initialize with query if provided
  useEffect(() => {
    if (initialQuery && !hasQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery, hasQuery])

  // Enhanced search handler with validation and analytics
  const handleSearch = async (searchQuery?: string) => {
    const query = searchQuery || inputQuery.trim()
    
    if (!query) {
      const validationError = ErrorFactory.validationError('search query', query)
      console.error('❌ Search validation failed:', validationError.userMessage)
      return
    }

    setShowSuggestions(false)
    setSearchStats(prev => ({ ...prev, totalSearches: prev.totalSearches + 1 }))

    try {
      await search(query)
      setSearchStats(prev => ({ ...prev, successfulSearches: prev.successfulSearches + 1 }))
    } catch (err) {
      console.error('❌ Search error:', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleRetry = async () => {
    try {
      await retry()
    } catch (err) {
      console.error('❌ Retry failed:', err)
    }
  }

  const handleClear = () => {
    setInputQuery('')
    clear()
    setShowSuggestions(true)
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        {showBackButton && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link 
              href="/kaijudex"
              className="inline-flex items-center gap-2 text-kaiju-navy hover:text-kaiju-pink transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Kaijudex
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-8 h-8 text-kaiju-pink" />
            <h1 className="text-3xl font-bold text-kaiju-navy">Blockchain NFT Search</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for any CryptoKaiju using Token ID or NFC Chip ID. All data is verified directly from the Ethereum blockchain.
          </p>
        </motion.div>
      </div>

      {/* Enhanced Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onFocus={() => setShowSuggestions(!hasQuery)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter Token ID (e.g., 1600) or NFC ID (e.g., 042C0A8A9F6580)"
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-6 py-4 pr-32 text-lg focus:border-kaiju-pink focus:outline-none font-medium shadow-lg"
              disabled={isLoading}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              {hasQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
                  disabled={isLoading}
                >
                  Clear
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="bg-kaiju-pink text-white px-6 py-2 rounded-lg hover:bg-kaiju-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-20 w-full mt-2"
              >
                <SearchSuggestions 
                  onSuggestionClick={handleSuggestionClick}
                  searchHistory={searchHistory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Search statistics */}
        {searchStats.totalSearches > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <p className="text-sm text-gray-500">
              {searchStats.successfulSearches}/{searchStats.totalSearches} successful searches
            </p>
          </div>
        )}
      </motion.div>

      {/* Enhanced Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <ErrorDisplay
              error={error}
              onRetry={canRetry ? handleRetry : undefined}
              onDismiss={() => clear()}
              context={{ 
                query: currentQuery, 
                component: 'NFTSearch',
                searchType: /^\d+$/.test(currentQuery) ? 'tokenId' : 'nfcId'
              }}
              showTechnicalDetails={process.env.NODE_ENV === 'development'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Results header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-kaiju-navy flex items-center gap-2">
                <Zap className="w-6 h-6 text-kaiju-pink" />
                Search Results
              </h2>
              <div className="bg-kaiju-pink/10 text-kaiju-pink px-4 py-2 rounded-full text-sm font-medium">
                {results.length} Kaiju Found
              </div>
            </div>

            {/* Results grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <EnhancedKaijuCard 
                  key={result.nft.tokenId} 
                  result={result} 
                  index={index} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results State */}
      {!isLoading && !error && hasQuery && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-kaiju-navy mb-4">No Kaiju Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No CryptoKaiju found matching "{currentQuery}". Double-check the Token ID or NFC ID and try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowSuggestions(true)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Try Suggestions
            </button>
            <Link
              href="/kaijudex"
              className="px-6 py-3 bg-kaiju-pink hover:bg-kaiju-red text-white rounded-lg transition-colors font-medium"
            >
              Browse All Kaiju
            </Link>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!hasQuery && !showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Ready to Search</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Enter a Token ID or NFC Chip ID to find any CryptoKaiju in the collection.
          </p>
          <button
            onClick={() => setShowSuggestions(true)}
            className="px-6 py-3 bg-kaiju-pink hover:bg-kaiju-red text-white rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <TrendingUp className="w-4 h-4" />
            Show Examples
          </button>
        </motion.div>
      )}
    </div>
  )
}