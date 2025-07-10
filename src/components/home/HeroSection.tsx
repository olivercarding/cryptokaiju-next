// src/components/home/HeroSection.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import MysteryBox from '../shared/MysteryBox'
import MintSuccessModal from '../shared/MintSuccessModal'
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { getContract, prepareContractCall } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient, MERKLE_MINTER_ADDRESS, MERKLE_MINTER_ABI } from '@/lib/thirdweb'
import { useTotalSupply } from '@/lib/hooks/useTotalSupply'
import { useMintPrice } from '@/lib/hooks/useMintPrice'

interface HeroSectionProps {
  mysteryDesigns?: Array<{
    type: string
    power: string
  }>
  stats?: {
    boxesLeft: number
  }
  onMint?: (quantity: number) => void
  onViewPossibilities?: () => void
}

interface UserClaim {
  nfcId: string;
  tokenUri: string;
  birthday: number;
}

interface MintedNFT {
  nfcId: string
  tokenUri: string
  birthday: number
}

// Contract-compatible type
interface ContractClaim {
  nfcId: `0x${string}`
  birthday: bigint
  tokenUri: string
}

export default function HeroSection({ 
  mysteryDesigns = [
    { type: 'Plush', power: 'Glows in the dark' },
    { type: 'Vinyl', power: 'Water manipulation' },
    { type: 'Plush', power: 'Fire breathing' },
    { type: 'Vinyl', power: 'Eternal rebirth' },
  ],
  stats = {
    boxesLeft: 427
  },
  onMint,
  onViewPossibilities
}: HeroSectionProps) {
  
  const [numToMint, setNumToMint] = useState(0)
  const [userClaims, setUserClaims] = useState<UserClaim[]>([])
  const [proofs, setProofs] = useState<string[][]>([])
  const [isReserving, setIsReserving] = useState(false)
  const [minActive, setMinActive] = useState(false)
  const [plusActive, setPlusActive] = useState(true)
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])

  // Thirdweb hooks
  const account = useActiveAccount()
  const { mutate: sendTransaction, isPending } = useSendTransaction()
  
  // Fetch total supply from blockchain
  const { totalSupply, isLoading: isLoadingSupply } = useTotalSupply()
  
  // Fetch current mint price from contract
  const { priceInETH, priceInWei, priceFormatted, isLoading: isLoadingPrice } = useMintPrice()

  // Calculate costs using dynamic price from contract
  const pricePerBox = parseFloat(priceInETH)
  const totalMintCost = pricePerBox * numToMint

  // Helper function to convert UserClaim to ContractClaim
  const convertToContractClaims = (claims: UserClaim[]): ContractClaim[] => {
    return claims.map(claim => ({
      nfcId: claim.nfcId.startsWith('0x') ? claim.nfcId as `0x${string}` : `0x${claim.nfcId}` as `0x${string}`,
      birthday: BigInt(claim.birthday),
      tokenUri: claim.tokenUri
    }))
  }

  // Helper function to convert proofs to proper hex format
  const convertToContractProofs = (proofs: string[][]): readonly (readonly `0x${string}`[])[] => {
    return proofs.map(proofArray => 
      proofArray.map(proof => 
        proof.startsWith('0x') ? proof as `0x${string}` : `0x${proof}` as `0x${string}`
      )
    )
  }

  // Reserve function from the working older app
  const reserve = async () => {
    console.log('Reserve triggered...')
    setIsReserving(true)
    setPlusActive(false)

    try {
      const response = await axios.get('https://us-central1-merkle-minter.cloudfunctions.net/claim')
      const { data } = response
      const result = data.result
      const canOpenMint = data.canOpenMint

      if (!result || result.length === 0) {
        console.log('No more available for the moment...')
        alert('No more NFTs available at the moment')
        return
      }

      if (!canOpenMint) {
        console.log('Unable to open mint - try again')
        alert('Unable to open mint - please try again')
        return
      }

      setNumToMint(prev => prev + 1)
      setMinActive(true)

      const claim = result[0]
      const { proof, nfcId, tokenUri, birthday } = claim

      setUserClaims(arr => [...arr, { nfcId, tokenUri, birthday }])
      setProofs(arr => [...arr, proof])

    } catch (error) {
      console.log('Failed to reserve:', error)
      alert('Failed to reserve NFT. Please try again.')
    } finally {
      setIsReserving(false)
      setPlusActive(true)
    }
  }

  // Remove reservation
  const removeReservation = () => {
    if (numToMint > 0) {
      setNumToMint(prev => prev - 1)
      setUserClaims(prev => prev.slice(0, -1))
      setProofs(prev => prev.slice(0, -1))
      
      if (numToMint === 1) {
        setMinActive(false)
      }
    }
  }

  // Handle mint with proper multi-mint logic
  const handleMintClick = async () => {
    if (!account) {
      alert('Please connect your wallet first')
      return
    }

    if (numToMint === 0) {
      alert("Please click '+' to reserve at least one NFT")
      return
    }

    if (!MERKLE_MINTER_ADDRESS) {
      alert('Contract address not configured')
      return
    }

    try {
      // Contract setup
      const contract = getContract({
        client: thirdwebClient,
        chain: ethereum,
        address: MERKLE_MINTER_ADDRESS,
        abi: MERKLE_MINTER_ABI,
      })

      // Convert UserClaims to ContractClaims
      const contractClaims = convertToContractClaims(userClaims)
      
      // Convert proofs to proper hex format
      const contractProofs = convertToContractProofs(proofs)

      // Use multiOpenMint for multiple NFTs like the working app
      const transaction = prepareContractCall({
        contract,
        method: "multiOpenMint",
        params: [account.address, contractClaims, contractProofs],
        value: priceInWei * BigInt(userClaims.length), // Use exact wei amount from contract
      })

      // Send transaction with Universal Bridge - cast to correct type
      sendTransaction(transaction as any, {
        onSuccess: (result) => {
          console.log("Transaction successful:", result)
          
          // Set minted NFTs for the modal
          setMintedNFTs(userClaims.map(claim => ({
            nfcId: claim.nfcId,
            tokenUri: claim.tokenUri,
            birthday: claim.birthday
          })))
          
          // Show success modal
          setShowSuccessModal(true)
          
          // Reset state after successful mint
          setNumToMint(0)
          setUserClaims([])
          setProofs([])
          setMinActive(false)
          
          if (onMint) onMint(numToMint)
        },
        onError: (error) => {
          console.error("Transaction failed:", error)
          alert("Transaction failed. Please try again.")
        },
      })
    } catch (error) {
      console.error("Error preparing transaction:", error)
      alert("Error preparing transaction. Please try again.")
    }
  }

  // Handle navigation to mysteries section
  const handleViewRewards = () => {
    const element = document.querySelector('#mysteries')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    if (onViewPossibilities) {
      onViewPossibilities()
    }
  }

  // Handle closing modal
  const handleCloseModal = () => {
    setShowSuccessModal(false)
  }
  
  return (
    <>
      {/* Mint Success Modal */}
      <MintSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        mintedNFTs={mintedNFTs}
        onEnterShipping={() => {}} // This prop is no longer used - modal handles navigation internally
      />

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
      {[...Array(20)].map((_, i) => (
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
        <div className="lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Mobile: Title and subtitle first */}
          <div className="text-center lg:hidden mb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black mb-4 tracking-tight text-white leading-tight">
                <span className="block">CryptoKaiju</span>
                <span className="block bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light bg-clip-text text-transparent">
                  MYSTERY BOXES
                </span>
              </h1>
              
              <p className="text-lg text-white/90 mb-0 max-w-lg mx-auto font-medium">
                4 Designs - 1 Chosen at Random on every mint.
              </p>
            </motion.div>
          </div>

          {/* Mobile: Mystery Box */}
          <div className="lg:hidden flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/50 to-kaiju-purple-light/50 rounded-full blur-3xl scale-110 opacity-75 animate-pulse"></div>
              
              <div className="relative">
                <MysteryBox 
                  mysteryDesigns={mysteryDesigns}
                  size="medium"
                  showBreakdown={true}
                  className="!bg-transparent"
                />
              </div>
            </motion.div>
          </div>

          {/* Desktop: Left column with all content */}
          <div className="text-center lg:text-left order-1 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Desktop: Title and subtitle */}
              <div className="hidden lg:block">
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-black mb-4 tracking-tight text-white leading-tight">
                  <span className="block">CryptoKaiju</span>
                  <span className="block bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light bg-clip-text text-transparent">
                    MYSTERY BOXES
                  </span>
                </h1>
                
                <p className="text-lg text-white/90 mb-8 max-w-lg mx-auto lg:mx-0 font-medium">
                  4 Designs - 1 Chosen at Random on every mint.
                </p>
              </div>
              
              {/* Enhanced mint section with reservation system */}
              <div className="space-y-4">
                {/* Wallet Status */}
                {account ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-white/70">Connected:</div>
                      <div className="text-white font-mono">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <div className="text-white/70">Status:</div>
                      <div className="text-green-400 font-semibold">Ready to mint</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                    <div className="text-white/70 text-sm">Connect wallet to mint</div>
                  </div>
                )}

                {/* Main minting interface */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                      <div className="text-center sm:text-left">
                        <div className="text-3xl font-black text-white">
                          {isLoadingPrice ? 'Loading...' : priceFormatted}
                        </div>
                        <div className="text-white/60 text-sm">per mystery box</div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-white/60 text-sm">Discover your</div>
                        <div className="text-xl font-bold text-kaiju-pink">Mystery Kaiju</div>
                      </div>
                    </div>

                    {/* Reservation System */}
                    <div className="mb-4">
                      <div className="text-white/70 text-sm mb-2 text-center">Reserved Boxes</div>
                      <div className="flex justify-center items-center gap-4">
                        <motion.button
                          onClick={removeReservation}
                          disabled={!minActive || isPending}
                          className="w-10 h-10 rounded-full bg-red-500/80 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600/80 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          -
                        </motion.button>
                        
                        <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{numToMint}</span>
                        </div>
                        
                        <motion.button
                          onClick={reserve}
                          disabled={!plusActive || isPending || isReserving}
                          className="w-10 h-10 rounded-full bg-kaiju-pink text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-kaiju-red transition-colors flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isReserving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            '+'
                          )}
                        </motion.button>
                      </div>
                      <p className="text-white/60 text-xs text-center mt-2">
                        Click + to reserve available mystery boxes
                      </p>
                    </div>

                    {/* Cost display */}
                    {numToMint > 0 && (
                      <div className="bg-white/5 rounded-xl p-4 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Total Cost:</span>
                          <span className="text-white font-semibold">{totalMintCost.toFixed(3)} ETH</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-white/50">Reserved NFTs:</span>
                          <span className="text-white/70">{userClaims.length}</span>
                        </div>
                      </div>
                    )}

                    {/* Main mint button */}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleMintClick}
                      disabled={!account || isPending || numToMint === 0}
                      className="w-full bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-black text-xl py-4 px-8 rounded-xl shadow-2xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending 
                        ? '⏳ MINTING...' 
                        : numToMint === 0
                        ? '⚡ CHECK AVAILABILITY'
                        : `⚡ MINT ${numToMint} MYSTERY BOX${numToMint > 1 ? 'ES' : ''}`
                      }
                    </motion.button>

                    {!account && (
                      <div className="text-center text-white/60 text-sm mt-2">
                        Connect your wallet to start minting
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Secondary action */}
              <motion.button 
                onClick={handleViewRewards}
                className="mt-4 text-white/80 hover:text-white text-sm underline transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                View all possible rewards →
              </motion.button>
            </motion.div>
          </div>
          
          {/* Desktop: Right column Mystery Box */}
          <div className="hidden lg:flex order-2 lg:order-2 justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/50 to-kaiju-purple-light/50 rounded-full blur-3xl scale-110 opacity-75 animate-pulse"></div>
              
              <div className="relative">
                <MysteryBox 
                  mysteryDesigns={mysteryDesigns}
                  size="medium"
                  showBreakdown={true}
                  className="!bg-transparent"
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom urgency bar - Updated with blockchain data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-kaiju-pink rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-white/80 text-sm font-medium">
              {isLoadingSupply 
                ? "Loading minted count..." 
                : `${totalSupply.toLocaleString()} Kaiju minted • Reserve before they're gone`
              }
            </span>
          </div>
        </motion.div>
      </div>
    </section>
    </>
  )
}