// src/app/my-kaiju/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Wallet, Package, ExternalLink, Heart, Sparkles, Filter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from '@/lib/thirdweb'
import { useMyKaiju, useKaijuSearch } from '@/lib/hooks/useCryptoKaiju'
import type { KaijuNFT } from '@/lib/services/CryptoKaijuApiService'

const KaijuCard = ({ kaiju, index }: { kaiju: KaijuNFT; index: number }) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getImageSrc = () => {
    if (imageError) return '/images/placeholder-kaiju.png'
    if (kaiju.ipfsData?.image) {
      // Handle IPFS URLs
      if (kaiju.ipfsData.image.startsWith('ipfs://')) {
        return kaiju.ipfsData.image.replace('ipfs://', 'https://cryptokaiju.mypinata.cloud/ipfs/')
      }
      return kaiju.ipfsData.image
    }
    return '/images/placeholder-kaiju.png'
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-kaiju-pink/50 transition-all duration-300 overflow-hidden">
        
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/10 to-kaiju-purple-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Token ID Badge */}
        <div className="absolute top-4 right-4 bg-kaiju-pink text-white px-3 py-1 rounded-full text-sm font-bold z-10">
          #{kaiju.tokenId}
        </div>

        {/* Character Image */}
        <div className="relative h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={getImageSrc()}
            alt={kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
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
              <Sparkles className="w-5 h-5" />
              View Details
              <Sparkles className="w-5 h-5" />
            </div>
          </motion.div>
        </div>

        {/* Character Info */}
        <div className="relative z-10">
          <h3 className="text-xl font-black text-kaiju-navy mb-2 group-hover:text-kaiju-pink transition-colors">
            {kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {kaiju.ipfsData?.description || 'A mysterious and powerful Kaiju from the blockchain realm.'}
          </p>

          {/* Attributes Grid */}
          {kaiju.ipfsData?.attributes && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(kaiju.ipfsData.attributes)
                .filter(([key, value]) => value && key !== 'dob' && key !== 'nfc')
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 font-medium capitalize">{key}</div>
                    <div className="text-sm font-bold text-kaiju-navy capitalize">{value}</div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Birth Date */}
          {kaiju.birthDate && (
            <div className="text-xs text-gray-500 mb-4">
              Born: {formatDate(kaiju.birthDate)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/kaiju/${kaiju.tokenId}`}
              className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 text-center text-sm"
            >
              View Details
            </Link>
            <a
              href={`https://opensea.io/assets/ethereum/0x0aa42b44ce63e4ba6c9b2c4a7bb7dd6d9f1b3f4a/${kaiju.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const SearchSection = () => {
  const { results, isLoading, search, clear, hasQuery } = useKaijuSearch()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      search(searchTerm.trim())
    } else {
      clear()
    }
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Token ID, NFC ID, or name..."
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-kaiju-pink focus:outline-none font-medium"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-kaiju-pink text-white p-2 rounded-lg hover:bg-kaiju-red transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Search Results */}
      <AnimatePresence>
        {hasQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-kaiju-navy">Search Results</h3>
              <button
                onClick={clear}
                className="text-gray-500 hover:text-kaiju-pink text-sm font-medium"
              >
                Clear
              </button>
            </div>
            
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.slice(0, 6).map((kaiju, index) => (
                  <KaijuCard key={kaiju.tokenId} kaiju={kaiju} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No Kaiju found matching your search.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MyKaijuPage() {
  const { kaijus, isLoading, error, isConnected } = useMyKaiju()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
        {/* Header */}
        <div className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Wallet className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-kaiju-navy">
                  My Kaiju Collection
                </h1>
              </div>
              
              <p className="text-xl text-kaiju-navy/70 mb-8 max-w-2xl mx-auto">
                Connect your wallet to view your CryptoKaiju NFT collection
              </p>

              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 max-w-md mx-auto">
                <Package className="w-16 h-16 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-xl font-bold text-kaiju-navy mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your Ethereum wallet to view and manage your CryptoKaiju collection.
                </p>
                <ConnectButton
                  client={thirdwebClient}
                  theme="light"
                  connectModal={{
                    size: "compact",
                    title: "Connect to view your Kaiju",
                    showThirdwebBranding: false,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      {/* Header */}
      <div className="pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-kaiju-pink" />
              <h1 className="text-4xl md:text-5xl font-black text-kaiju-navy">
                My Kaiju Collection
              </h1>
            </div>
            <p className="text-lg text-kaiju-navy/70">
              Your personal collection of CryptoKaiju NFTs
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-kaiju-pink mb-1">
                  {kaijus.length}
                </div>
                <div className="text-gray-600 font-medium">Kaiju Owned</div>
              </div>
              <div>
                <div className="text-3xl font-black text-kaiju-purple-dark mb-1">
                  {new Set(kaijus.map(k => k.ipfsData?.attributes?.batch)).size}
                </div>
                <div className="text-gray-600 font-medium">Unique Batches</div>
              </div>
              <div>
                <div className="text-3xl font-black text-kaiju-navy mb-1">
                  {new Set(kaijus.map(k => k.ipfsData?.attributes?.class)).size}
                </div>
                <div className="text-gray-600 font-medium">Unique Classes</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <SearchSection />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full mx-auto mb-4"
              />
              <div className="text-kaiju-navy text-xl font-bold">Loading your collection...</div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-xl font-bold mb-4">Error loading collection</div>
              <div className="text-gray-600">{error}</div>
            </div>
          ) : kaijus.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-kaiju-navy mb-4">No Kaiju Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You don't own any CryptoKaiju NFTs yet. Visit our marketplace to start your collection!
              </p>
              <Link
                href="/#hero"
                className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Mint Your First Kaiju
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {kaijus.map((kaiju, index) => (
                <KaijuCard key={kaiju.tokenId} kaiju={kaiju} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}