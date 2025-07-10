// src/components/shared/MintSuccessModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface NFTMetadata {
  name: string
  image: string
  description: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

interface MintedNFT {
  nfcId: string
  tokenUri: string
  birthday: number
  metadata?: NFTMetadata
}

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  mintedNFTs: MintedNFT[]
  onEnterShipping: () => void
}

export default function MintSuccessModal({
  isOpen,
  onClose,
  mintedNFTs,
  onEnterShipping
}: MintSuccessModalProps) {
  const router = useRouter()
  const [nftsWithMetadata, setNftsWithMetadata] = useState<MintedNFT[]>([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0)

  // Fetch NFT metadata from IPFS
  useEffect(() => {
    if (!isOpen || mintedNFTs.length === 0) return

    const fetchMetadata = async () => {
      setIsLoadingMetadata(true)
      
      const nftsWithMeta = await Promise.all(
        mintedNFTs.map(async (nft) => {
          try {
            const response = await axios.get(
              `https://cryptokaiju.mypinata.cloud/ipfs/${nft.tokenUri}`,
              { timeout: 5000 }
            )
            
            return {
              ...nft,
              metadata: response.data
            }
          } catch (error) {
            console.error('Failed to fetch metadata for NFT:', nft.nfcId, error)
            return {
              ...nft,
              metadata: {
                name: 'Mystery Kaiju',
                image: '/images/mystery-placeholder.png',
                description: 'A mysterious Kaiju has been revealed!',
                attributes: []
              }
            }
          }
        })
      )
      
      setNftsWithMetadata(nftsWithMeta)
      setIsLoadingMetadata(false)
    }

    fetchMetadata()
  }, [isOpen, mintedNFTs])

  // Auto-cycle through multiple NFTs
  useEffect(() => {
    if (nftsWithMetadata.length <= 1) return

    const interval = setInterval(() => {
      setCurrentNFTIndex((prev) => (prev + 1) % nftsWithMetadata.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [nftsWithMetadata.length])

  const currentNFT = nftsWithMetadata[currentNFTIndex]

  const handleEnterShipping = () => {
    // Store minted NFTs in sessionStorage for the success page
    sessionStorage.setItem('mintedNFTs', JSON.stringify(nftsWithMetadata))
    
    // Close modal and navigate to success page
    onClose()
    router.push('/success')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy rounded-3xl border-4 border-kaiju-pink/50 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Success Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-green-400/30">
                <Sparkles className="text-green-400" size={24} />
                <span className="text-green-400 font-bold text-lg">Mint Successful!</span>
                <Sparkles className="text-green-400" size={24} />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-black text-white mb-2"
            >
              Your Mystery {mintedNFTs.length > 1 ? 'Kaijus' : 'Kaiju'} Revealed!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 mb-8"
            >
              {mintedNFTs.length > 1 
                ? `Congratulations! You've minted ${mintedNFTs.length} unique Kaijus!`
                : "Congratulations! Your unique Kaiju has been revealed!"
              }
            </motion.p>

            {/* NFT Display */}
            {isLoadingMetadata ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20"
              >
                <div className="w-64 h-64 mx-auto bg-white/20 rounded-xl animate-pulse mb-4"></div>
                <div className="h-6 bg-white/20 rounded-full animate-pulse mb-2"></div>
                <div className="h-4 bg-white/20 rounded-full animate-pulse w-3/4 mx-auto"></div>
              </motion.div>
            ) : currentNFT ? (
              <motion.div
                key={currentNFTIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 relative overflow-hidden"
              >
                {/* Animated background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/20 to-kaiju-purple-light/20"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* NFT Image */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.5, 
                      type: "spring", 
                      damping: 15,
                      stiffness: 300 
                    }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light rounded-xl blur-xl opacity-50 scale-110"></div>
                    
                    <img
                      src={currentNFT.metadata?.image || '/images/mystery-placeholder.png'}
                      alt={currentNFT.metadata?.name || 'Mystery Kaiju'}
                      className="relative w-64 h-64 mx-auto rounded-xl border-4 border-white/20 shadow-2xl object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/mystery-placeholder.png'
                      }}
                    />
                  </motion.div>

                  {/* NFT Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentNFT.metadata?.name || 'Mystery Kaiju'}
                    </h2>
                    <p className="text-white/70 mb-4 text-sm">
                      {currentNFT.metadata?.description || 'A mysterious and powerful Kaiju!'}
                    </p>

                    {/* Traits */}
                    {currentNFT.metadata?.attributes && currentNFT.metadata.attributes.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {currentNFT.metadata.attributes.slice(0, 6).map((attr, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + idx * 0.1 }}
                            className="bg-white/10 rounded-lg p-2 border border-white/10"
                          >
                            <div className="text-white/60 text-xs font-medium">
                              {attr.trait_type}
                            </div>
                            <div className="text-white text-sm font-bold">
                              {attr.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Multiple NFTs indicator */}
                    {mintedNFTs.length > 1 && (
                      <div className="flex justify-center gap-2 mb-4">
                        {nftsWithMetadata.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentNFTIndex ? 'bg-kaiju-pink' : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ) : null}

            {/* Physical Item Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-kaiju-pink/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-kaiju-pink/30"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <Package className="text-kaiju-pink" size={24} />
                <span className="text-white font-bold text-lg">Physical Collectible Available!</span>
              </div>
              <p className="text-white/80 text-sm">
                Your Kaiju comes with a real-world collectible! Enter your shipping information to receive your NFC-chipped collectible.
              </p>
            </motion.div>

            {/* Action Button - Single Button Now */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnterShipping}
                className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Package size={20} />
                Enter Shipping Information
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>

            {/* Celebration particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-kaiju-pink rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -100],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}