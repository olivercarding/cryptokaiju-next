// src/app/my-kaiju/page.tsx - FIXED VERSION WITH PROPER WALLET HANDLING
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Wallet, Package, ExternalLink, Heart, Sparkles, Filter, Zap, Database, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { ConnectButton, useActiveAccount } from "thirdweb/react"
import { thirdwebClient } from '@/lib/thirdweb'
import { useBlockchainKaijuSearch } from '@/lib/hooks/useBlockchainCryptoKaiju'
import BlockchainCryptoKaijuService, { type KaijuNFT } from '@/lib/services/BlockchainCryptoKaijuService'

// FIXED: Safe attribute value renderer
const renderAttributeValue = (value: any): string => {
  if (value === null || value === undefined) return 'Unknown'
  
  // If it's an object with trait_type and value properties (OpenSea format)
  if (typeof value === 'object' && value.trait_type && value.value !== undefined) {
    return String(value.value)
  }
  
  // If it's an object with just value property
  if (typeof value === 'object' && value.value !== undefined) {
    return String(value.value)
  }
  
  // If it's a plain object, try to stringify it safely
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }
  
  // For primitives, just convert to string
  return String(value)
}

// FIXED: Safe attribute extraction
const extractAttributes = (ipfsData: any): Array<{key: string, value: string}> => {
  if (!ipfsData?.attributes) return []
  
  const attributes: Array<{key: string, value: string}> = []
  
  try {
    // Handle array format (OpenSea style)
    if (Array.isArray(ipfsData.attributes)) {
      ipfsData.attributes.forEach((attr: any) => {
        if (attr && typeof attr === 'object') {
          const key = attr.trait_type || attr.key || 'Unknown'
          const value = renderAttributeValue(attr.value || attr)
          
          if (key && value && !['dob', 'nfc', 'birth_date'].includes(key.toLowerCase())) {
            attributes.push({ key: String(key), value })
          }
        }
      })
    }
    // Handle object format (key-value pairs)
    else if (typeof ipfsData.attributes === 'object') {
      Object.entries(ipfsData.attributes).forEach(([key, value]) => {
        if (key && value && !['dob', 'nfc', 'birth_date'].includes(key.toLowerCase())) {
          attributes.push({ 
            key: String(key), 
            value: renderAttributeValue(value)
          })
        }
      })
    }
  } catch (error) {
    console.warn('Error extracting attributes:', error)
  }
  
  return attributes.slice(0, 6) // Limit to 6 attributes
}

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

  // FIXED: Safe attribute extraction
  const attributes = extractAttributes(kaiju.ipfsData)

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

        {/* Blockchain verified badge */}
        <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
          <Database className="w-3 h-3" />
          ON-CHAIN
        </div>

        {/* Token ID Badge */}
        <div className="absolute top-4 right-4 bg-kaiju-pink text-white px-3 py-1 rounded-full text-sm font-bold z-10">
          #{kaiju.tokenId}
        </div>

        {/* Character Image */}
        <div className="relative h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mt-8">
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

          {/* NFC ID Display */}
          {kaiju.nfcId && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">NFC CHIP ID</div>
              <div className="text-sm font-mono font-bold text-blue-800">{kaiju.nfcId}</div>
            </div>
          )}

          {/* Batch Display */}
          {kaiju.batch && (
            <div className="mb-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-medium">BATCH</div>
              <div className="text-sm font-bold text-purple-800">{kaiju.batch}</div>
            </div>
          )}

          {/* FIXED: Attributes Grid - Safe rendering */}
          {attributes.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {attributes.map(({ key, value }, attrIndex) => (
                <div key={`${key}-${attrIndex}`} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm font-bold text-kaiju-navy capitalize truncate">
                    {value}
                  </div>
                </div>
              ))}
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
              href={`https://opensea.io/assets/ethereum/0x102c527714ab7e652630cac7a30abb482b041fd0/${kaiju.tokenId}`}
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

const SearchSection = ({ isConnected }: { isConnected: boolean }) => {
  const { results, isLoading, search, clear, hasQuery } = useBlockchainKaijuSearch()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      search(searchTerm.trim())
    } else {
      clear()
    }
  }

  if (!isConnected) return null

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Token ID or NFC ID..."
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
              <h3 className="font-bold text-kaiju-navy flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Blockchain Search Results
              </h3>
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
                No Kaiju found on blockchain matching your search.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ENHANCED DEBUG COMPONENT
const DebugPanel = ({ kaijus, isLoading, error, isConnected }: { 
  kaijus: KaijuNFT[], 
  isLoading: boolean, 
  error: string | null, 
  isConnected: boolean 
}) => {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show Debug Info"
      >
        <Database className="w-5 h-5" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-xl shadow-2xl max-w-md z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">🐛 Debug Panel</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          )}
          <span>Wallet: {isConnected ? 'Connected' : 'Not Connected'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-4 h-4 border border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {error ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          <span>Error: {error ? 'Yes' : 'None'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span>NFTs Found: {kaijus.length}</span>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/50 rounded text-red-200 text-xs">
            {error}
          </div>
        )}
        
        {kaijus.length > 0 && (
          <div className="mt-2 p-2 bg-green-900/50 rounded text-green-200">
            <div className="text-xs font-medium mb-1">First NFT:</div>
            <div className="text-xs">
              ID: {kaijus[0].tokenId}<br/>
              Name: {kaijus[0].ipfsData?.name || 'Unknown'}<br/>
              NFC: {kaijus[0].nfcId || 'None'}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// FIXED: Manual Kaiju fetching hook to prevent auto-connection
function useManualKaijuFetch() {
  const [kaijus, setKaijus] = useState<KaijuNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKaijus = async (address: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Manually fetching Kaiju for address:', address)
      const fetchedKaijus = await BlockchainCryptoKaijuService.getTokensForAddress(address)
      setKaijus(fetchedKaijus)
      console.log('✅ Successfully fetched', fetchedKaijus.length, 'Kaiju')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching Kaiju:', errorMessage)
      setError(errorMessage)
      setKaijus([])
    } finally {
      setIsLoading(false)
    }
  }

  const clear = () => {
    setKaijus([])
    setError(null)
    setIsLoading(false)
  }

  return {
    kaijus,
    isLoading,
    error,
    fetchKaijus,
    clear
  }
}

export default function MyKaijuPage() {
  // FIXED: Use non-auto-connecting wallet hook
  const account = useActiveAccount()
  const isConnected = !!account?.address
  
  // FIXED: Use manual fetching to prevent auto-connection
  const { kaijus, isLoading, error, fetchKaijus, clear } = useManualKaijuFetch()
  
  // FIXED: Only fetch when user explicitly connects
  useEffect(() => {
    if (isConnected && account?.address) {
      console.log('🔗 Wallet connected, fetching Kaiju...')
      fetchKaijus(account.address)
    } else {
      console.log('💾 Wallet disconnected, clearing data...')
      clear()
    }
  }, [isConnected, account?.address])

  // ENHANCED DEBUG LOGGING
  console.log('🐛 MY-KAIJU PAGE DEBUG:')
  console.log('   isConnected:', isConnected)
  console.log('   isLoading:', isLoading)
  console.log('   error:', error)
  console.log('   kaijus.length:', kaijus.length)
  console.log('   kaijus array:', kaijus)

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
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Your Kaiju Collection
                </h1>
              </div>
              <p className="text-lg text-white/90 mb-4 max-w-2xl mx-auto">
                All the CryptoKaiju you own, verified directly from the blockchain
              </p>
              <div className="inline-flex items-center gap-2 bg-green-100/20 backdrop-blur-sm text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                <Database className="w-4 h-4" />
                {isLoading ? 'Scanning Blockchain...' : isConnected ? 'Blockchain Verified' : 'Connect Wallet to Begin'}
              </div>
            </motion.div>

            {/* FIXED: Wallet Connection Check - No auto-trigger */}
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md mx-auto"
              >
                <Database className="w-16 h-16 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Connect Your Wallet
                </h3>
                <p className="text-white/80 mb-6 text-center">
                  Connect your Ethereum wallet to view and manage your CryptoKaiju collection with instant blockchain verification.
                </p>
                <div className="flex justify-center">
                  <ConnectButton
                    client={thirdwebClient}
                    theme="light"
                    connectModal={{
                      size: "wide",
                      title: "Connect to view your Kaiju",
                      showThirdwebBranding: false,
                      titleIcon: "",
                    }}
                    connectButton={{
                      label: "Connect Wallet",
                      style: {
                        background: "linear-gradient(135deg, #ff6b9d 0%, #ff8cc8 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        minWidth: "160px"
                      }
                    }}
                    autoConnect={{
                      timeout: 15000
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Stats Bar - only show when connected */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="text-center">
                  <div className="text-4xl font-black text-kaiju-pink mb-2">
                    {isLoading ? '...' : kaijus.length}
                  </div>
                  <div className="text-white/80 font-medium text-lg">
                    CryptoKaiju Owned
                  </div>
                  {!isLoading && kaijus.length > 0 && (
                    <div className="text-white/60 text-sm mt-1">
                      Verified directly from the Ethereum blockchain
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Light Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Only show search and collection if connected */}
            {isConnected && (
              <>
                {/* Search Section */}
                <SearchSection isConnected={isConnected} />

                {/* Main Content */}
                {isLoading ? (
                  <div className="text-center py-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <div className="text-kaiju-navy text-xl font-bold">Loading from blockchain...</div>
                    <div className="text-gray-600 mt-2">Fetching your NFTs directly from smart contract</div>
                    <div className="text-gray-500 mt-1 text-sm">This may take a few seconds</div>
                  </div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-red-600 mb-4">Error Loading Collection</h3>
                    <div className="text-gray-600 mb-4 max-w-md mx-auto">
                      {error}
                    </div>
                    <div className="text-sm text-gray-500">
                      This could be a temporary issue. Try refreshing the page.
                    </div>
                  </motion.div>
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
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <h2 className="text-2xl font-bold text-kaiju-navy mb-2">
                        🎉 Found {kaijus.length} CryptoKaiju NFT{kaijus.length === 1 ? '' : 's'}!
                      </h2>
                      <p className="text-gray-600">
                        Your collection verified directly from the Ethereum blockchain
                      </p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {kaijus.map((kaiju, index) => (
                        <KaijuCard key={kaiju.tokenId} kaiju={kaiju} index={index} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* Enhanced Debug Panel */}
        <DebugPanel 
          kaijus={kaijus} 
          isLoading={isLoading} 
          error={error} 
          isConnected={isConnected} 
        />
      </main>
    </>
  )
}