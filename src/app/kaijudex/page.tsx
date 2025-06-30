// src/app/kaijudex/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Zap, Package, Clock, Database, Cpu, Wallet, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { thirdwebClient } from '@/lib/thirdweb'
import { useAllKaiju, useMyKaiju, useKaijuStats } from '@/lib/hooks/useCryptoKaiju'
import type { KaijuNFT } from '@/lib/services/CryptoKaijuApiService'

const statusColors = {
  'owned': 'text-green-400',
  'available': 'text-blue-400',
  'rare': 'text-purple-400'
}

const KaijuCard = ({ 
  kaiju, 
  index, 
  isOwned = false 
}: { 
  kaiju: KaijuNFT; 
  index: number;
  isOwned?: boolean;
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getImageSrc = () => {
    if (imageError) return '/images/placeholder-kaiju.png'
    if (kaiju.ipfsData?.image) {
      if (kaiju.ipfsData.image.startsWith('ipfs://')) {
        return kaiju.ipfsData.image.replace('ipfs://', 'https://cryptokaiju.mypinata.cloud/ipfs/')
      }
      return kaiju.ipfsData.image
    }
    return '/images/placeholder-kaiju.png'
  }

  const getType = () => {
    const attributes = kaiju.ipfsData?.attributes
    if (attributes?.batch?.toLowerCase().includes('plush') || 
        attributes?.class?.toLowerCase().includes('plush')) {
      return 'Plush'
    }
    return 'Vinyl'
  }

  const getElement = () => {
    const attributes = kaiju.ipfsData?.attributes
    if (attributes?.colour) {
      const colour = attributes.colour.toLowerCase()
      if (colour.includes('purple') || colour.includes('ghost')) return 'Ghost'
      if (colour.includes('blue') || colour.includes('water')) return 'Water'
      if (colour.includes('green') || colour.includes('earth')) return 'Earth'
      if (colour.includes('red') || colour.includes('fire')) return 'Fire'
      if (colour.includes('yellow') || colour.includes('electric')) return 'Electric'
    }
    return attributes?.batch || 'Mystical'
  }

  const getRarity = (): 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary' => {
    const attributes = kaiju.ipfsData?.attributes
    if (attributes?.batch?.toLowerCase().includes('genesis')) return 'Legendary'
    if (attributes?.class?.toLowerCase().includes('diamond')) return 'Ultra Rare'
    if (getType() === 'Plush') return 'Rare'
    return 'Common'
  }

  const rarityColors = {
    'Common': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Rare': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    'Ultra Rare': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    'Legendary': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsScanning(true)}
      onHoverEnd={() => setIsScanning(false)}
      className="group"
    >
      <Link href={`/kaiju/${kaiju.tokenId}`}>
        <div className="relative bg-kaiju-navy/90 backdrop-blur-sm border border-kaiju-pink/30 rounded-xl p-6 hover:border-kaiju-pink/60 transition-all duration-300 hover:bg-kaiju-navy/95 cursor-pointer">
          
          {/* Owned Badge */}
          {isOwned && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
              OWNED
            </div>
          )}

          {/* Scanning line effect */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-kaiju-pink/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </AnimatePresence>

          {/* Character ID & Rarity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-kaiju-pink font-mono text-sm">#{kaiju.tokenId}</span>
            <div className={`px-2 py-1 rounded-full border text-xs font-mono ${rarityColors[getRarity()]}`}>
              {getRarity().toUpperCase()}
            </div>
          </div>

          {/* Character Image */}
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-kaiju-purple-dark/20 to-kaiju-pink/20">
            <Image
              src={getImageSrc()}
              alt={kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Character Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">
                {kaiju.ipfsData?.name || `Kaiju #${kaiju.tokenId}`}
              </h3>
              <p className="text-kaiju-pink/80 text-sm font-mono">
                {getElement()} • {getType()}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 rounded p-2">
                <div className="text-white/60 font-mono">OWNER</div>
                <div className="text-white font-bold">
                  {kaiju.owner ? `${kaiju.owner.slice(0, 6)}...${kaiju.owner.slice(-4)}` : 'Unknown'}
                </div>
              </div>
              <div className="bg-white/5 rounded p-2">
                <div className="text-white/60 font-mono">BATCH</div>
                <div className="text-white font-bold capitalize">
                  {kaiju.ipfsData?.attributes?.batch || 'Genesis'}
                </div>
              </div>
            </div>

            {/* Traits */}
            {kaiju.ipfsData?.attributes && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(kaiju.ipfsData.attributes)
                  .filter(([key, value]) => value && !['dob', 'nfc'].includes(key))
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <span 
                      key={key}
                      className="bg-kaiju-pink/20 text-kaiju-pink text-xs px-2 py-1 rounded-full font-mono"
                    >
                      {value}
                    </span>
                  ))
                }
              </div>
            )}

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${isOwned ? statusColors.owned : statusColors.available}`}>
                {isOwned ? '● OWNED' : '● AVAILABLE'}
              </span>
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-white/40" />
                <span className="text-white/60 text-xs">View</span>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-kaiju-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function KaijudexPage() {
  const account = useActiveAccount()
  const { kaijus: allKaijus, isLoading: loadingAll } = useAllKaiju()
  const { kaijus: myKaijus } = useMyKaiju()
  const { stats, isLoading: loadingStats } = useKaijuStats()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'available'>('all')
  const [filterRarity, setFilterRarity] = useState<'all' | 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary'>('all')
  
  // New state for search results
  const [searchResults, setSearchResults] = useState<KaijuNFT[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Create a Set of owned token IDs for quick lookup
  const ownedTokenIds = new Set(myKaijus.map(k => k.tokenId))

  // Handle search with debouncing
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        setHasSearched(false)
        return
      }

      // Only search if it looks like a specific lookup (token ID or NFC ID)
      const query = searchTerm.trim()
      const isTokenId = /^\d+$/.test(query)
      const isNFCId = /^[0-9a-f]{8,}$/i.test(query)
      
      if (isTokenId || isNFCId) {
        setIsSearching(true)
        setHasSearched(true)
        
        try {
          console.log(`🔍 Performing search for: "${query}"`)
          const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
          const results = await CryptoKaijuApiService.searchTokens(query)
          console.log(`📊 Search results:`, results)
          setSearchResults(results)
        } catch (error) {
          console.error('❌ Search failed:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        // For other searches, fall back to local filtering
        setHasSearched(false)
        setSearchResults([])
      }
    }

    // Debounce search
    const timeoutId = setTimeout(performSearch, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Determine which kaijus to display
  const getDisplayKaijus = () => {
    // If we have search results, use those
    if (hasSearched) {
      return searchResults
    }
    
    // Otherwise, use local filtering on allKaijus
    return allKaijus.filter(kaiju => {
      // Search filter (local)
      if (searchTerm && !hasSearched) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          kaiju.tokenId.includes(searchLower) ||
          kaiju.nfcId.toLowerCase().includes(searchLower) ||
          kaiju.ipfsData?.name?.toLowerCase().includes(searchLower) ||
          Object.values(kaiju.ipfsData?.attributes || {}).some(val => 
            val?.toString().toLowerCase().includes(searchLower)
          )
        if (!matchesSearch) return false
      }

      // Ownership filter
      if (filterType === 'owned' && !ownedTokenIds.has(kaiju.tokenId)) return false
      if (filterType === 'available' && ownedTokenIds.has(kaiju.tokenId)) return false

      // Rarity filter
      if (filterRarity !== 'all') {
        const attributes = kaiju.ipfsData?.attributes
        let rarity: string = 'Common'
        
        if (attributes?.batch?.toLowerCase().includes('genesis')) rarity = 'Legendary'
        else if (attributes?.class?.toLowerCase().includes('diamond')) rarity = 'Ultra Rare'
        else if (attributes?.batch?.toLowerCase().includes('plush')) rarity = 'Rare'
        
        if (rarity !== filterRarity) return false
      }

      return true
    })
  }

  const filteredKaijus = getDisplayKaijus()

  if (loadingAll && allKaijus.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="text-kaiju-pink font-mono text-lg">INITIALIZING KAIJUDEX...</div>
          <div className="text-white/60 font-mono text-sm mt-2">Scanning blockchain for new Kaiju...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-black">
      {/* Fixed Logo in top left */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <Image
              src="/images/cryptokaiju-logo.png"
              alt="CryptoKaiju"
              width={140}
              height={70}
              className="h-auto hover:drop-shadow-lg transition-all duration-300"
              priority
            />
          </motion.div>
        </Link>
      </div>

      {/* Header */}
      <div className="relative pt-32 pb-16 px-6">
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Cpu className="w-8 h-8 text-kaiju-pink" />
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                THE <span className="text-kaiju-pink">KAIJUDEX</span>
              </h1>
              <Database className="w-8 h-8 text-kaiju-pink" />
            </div>
            <p className="text-xl text-white/80 font-mono max-w-3xl mx-auto leading-relaxed">
              Comprehensive database of discovered Kaiju entities on Ethereum.
              <br />
              <span className="text-kaiju-pink">
                {loadingStats ? 'Loading...' : `${stats.totalSupply} entities catalogued`} • 
                {account ? ` ${myKaijus.length} in your collection` : ' Connect wallet to view owned'}
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Connect Wallet Bar */}
      {!account && (
        <div className="px-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-kaiju-pink/20 backdrop-blur-sm border border-kaiju-pink/30 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-4 text-white">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Connect your wallet to see which Kaiju you own</span>
                <ConnectButton
                  client={thirdwebClient}
                  theme="dark"
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
      )}

      {/* Debug Section - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-4"
            >
              <h3 className="text-orange-200 font-bold mb-3 text-center">🧪 Debug Tools (Development Only)</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={async () => {
                    console.log('🧪 Starting NFC debug tests...')
                    
                    try {
                      // Import the service
                      const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                      
                      console.log('✅ Service imported successfully')
                      
                      // Test 1: Get token details to see trait structure
                      console.log('🔍 Test 1: Fetching token 1300...')
                      const token = await CryptoKaijuApiService.getTokenDetails('1300')
                      console.log('📄 Token data:', token)
                      console.log('🏷️ Traits/attributes:', token?.ipfsData?.attributes)
                      
                      // Test 2: Clear cache and build NFC mapping
                      console.log('🔄 Test 2: Building NFC mapping...')
                      CryptoKaijuApiService.clearCache()
                      const mapping = await CryptoKaijuApiService.getNFCMapping()
                      
                      console.log('📊 NFC Mapping Results:')
                      console.log('- Total mappings found:', Object.keys(mapping).length)
                      console.log('- Sample mappings:', Object.entries(mapping).slice(0, 10))
                      
                      // Test 3: Try searching for an NFC ID
                      console.log('🔍 Test 3: Testing NFC search...')
                      const searchResults = await CryptoKaijuApiService.searchTokens('043821FA4E6E80')
                      console.log('🎯 Search results:', searchResults)
                      
                      // Test 4: Try direct NFC lookup
                      console.log('🔍 Test 4: Testing direct NFC lookup...')
                      const nfcResults = await CryptoKaijuApiService.lookupByNFC('043821FA4E6E80')
                      console.log('🎯 NFC lookup results:', nfcResults)
                      
                      alert('✅ Debug tests complete! Check browser console for results.')
                      
                    } catch (error) {
                      console.error('❌ Debug test failed:', error)
                      alert('❌ Debug test failed. Check console for details.')
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded text-sm"
                >
                  🧪 Debug NFC Mapping
                </button>
                
                <button 
                  onClick={async () => {
                    try {
                      const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                      await CryptoKaijuApiService.testAPI()
                      alert('✅ API test complete! Check console.')
                    } catch (error) {
                      console.error('❌ API test failed:', error)
                      alert('❌ API test failed. Check console.')
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded text-sm"
                >
                  🔌 Test API
                </button>
                
                <button 
                  onClick={async () => {
                    try {
                      const CryptoKaijuApiService = (await import('@/lib/services/CryptoKaijuApiService')).default
                      
                      // Test different token IDs to see trait variations
                      console.log('🔍 Testing multiple tokens for trait variations...')
                      
                      const testTokens = ['1', '2', '100', '1300', '2000']
                      
                      for (const tokenId of testTokens) {
                        try {
                          console.log(`\n--- Testing Token ${tokenId} ---`)
                          const token = await CryptoKaijuApiService.getTokenDetails(tokenId)
                          if (token) {
                            console.log(`Token ${tokenId}:`, token.ipfsData?.name)
                            console.log(`Traits:`, token.ipfsData?.attributes)
                            
                            // Look for any field that might contain NFC
                            const attrs = token.ipfsData?.attributes || {}
                            Object.entries(attrs).forEach(([key, value]) => {
                              if (key.toLowerCase().includes('nfc') || 
                                  (typeof value === 'string' && value.match(/^[0-9a-f]{8,}$/i))) {
                                console.log(`🏷️ Possible NFC field: ${key} = ${value}`)
                              }
                            })
                          } else {
                            console.log(`❌ Token ${tokenId} not found`)
                          }
                          
                          // Small delay between requests
                          await new Promise(resolve => setTimeout(resolve, 200))
                          
                        } catch (error) {
                          console.log(`❌ Token ${tokenId} failed:`, error.message)
                        }
                      }
                      
                      alert('✅ Multi-token test complete! Check console for trait variations.')
                      
                    } catch (error) {
                      console.error('❌ Multi-token test failed:', error)
                      alert('❌ Test failed. Check console.')
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded text-sm"
                >
                  🔍 Test Multiple Tokens
                </button>
              </div>
              <p className="text-orange-300 text-xs mt-3 text-center">
                These buttons will run tests and log results to browser console. This section only appears in development.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-kaiju-navy/50 backdrop-blur-sm border border-kaiju-pink/30 rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-kaiju-pink/60" />
                <input
                  type="text"
                  placeholder="Search by Token ID, NFC ID, name, trait..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 font-mono focus:border-kaiju-pink focus:outline-none"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-kaiju-pink border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Ownership Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:border-kaiju-pink focus:outline-none"
              >
                <option value="all">All Kaiju</option>
                <option value="owned">My Collection</option>
                <option value="available">Available</option>
              </select>

              {/* Rarity Filter */}
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as any)}
                className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:border-kaiju-pink focus:outline-none"
              >
                <option value="all">All Rarities</option>
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Ultra Rare">Ultra Rare</option>
                <option value="Legendary">Legendary</option>
              </select>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {account && (
                  <Link 
                    href="/my-kaiju"
                    className="flex-1 bg-kaiju-pink hover:bg-kaiju-red text-white font-bold py-3 px-4 rounded-lg transition-colors text-center text-sm"
                  >
                    My Kaiju ({myKaijus.length})
                  </Link>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-kaiju-pink/80 font-mono text-sm">
                {hasSearched ? (
                  <>
                    {isSearching ? (
                      'Searching...'
                    ) : (
                      <>
                        {filteredKaijus.length} result{filteredKaijus.length !== 1 ? 's' : ''} found for "{searchTerm}"
                        {filteredKaijus.length === 0 && (
                          <span className="text-white/60 ml-2">
                            (Try exact Token ID like "1300" or NFC ID like "046B14BA4E6E80")
                          </span>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {filteredKaijus.length} entities found
                    {account && ` • ${myKaijus.length} owned by you`}
                  </>
                )}
              </div>
              
              {hasSearched && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSearchResults([])
                    setHasSearched(false)
                  }}
                  className="text-white/60 hover:text-white text-sm font-mono underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Kaiju Grid */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredKaijus.length === 0 ? (
            <div className="text-center py-20">
              <Database className="w-16 h-16 text-kaiju-pink/50 mx-auto mb-4" />
              <div className="text-white font-mono text-xl mb-2">No entities found</div>
              <div className="text-white/60 font-mono">Try adjusting your search parameters</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredKaijus.map((kaiju, index) => (
                <KaijuCard 
                  key={kaiju.tokenId} 
                  kaiju={kaiju} 
                  index={index}
                  isOwned={ownedTokenIds.has(kaiju.tokenId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}