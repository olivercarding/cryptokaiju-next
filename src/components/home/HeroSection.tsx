// src/components/home/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import MysteryBox from '../shared/MysteryBox'

interface HeroSectionProps {
  mysteryDesigns?: Array<{
    type: string
    rarity: string
    probability: string
  }>
  stats?: {
    price: string
    boxesLeft: number
    ultraRareChance: string
  }
  onMint?: () => void
  onViewPossibilities?: () => void
}

export default function HeroSection({ 
  mysteryDesigns = [
    { type: 'Plush', rarity: 'Common', probability: '40%' },
    { type: 'Vinyl', rarity: 'Common', probability: '35%' },
    { type: 'Plush', rarity: 'Rare', probability: '20%' },
    { type: 'Vinyl', rarity: 'Ultra Rare', probability: '5%' },
  ],
  stats = {
    price: '0.055 Ξ',
    boxesLeft: 427,
    ultraRareChance: '5%'
  },
  onMint,
  onViewPossibilities
}: HeroSectionProps) {
  
  const [recentMints] = useState([
    "0x1a2b...minted Rare Plush",
    "0x3c4d...minted Ultra Rare Vinyl",
    "0x5e6f...minted Common Vinyl"
  ])
  
  const [currentMintIndex, setCurrentMintIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMintIndex((prev) => (prev + 1) % recentMints.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [recentMints.length])
  
  return (
    <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden py-8 lg:py-12">
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
        {/* Top status bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6 text-white/80 text-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>LIVE MINT</span>
            </div>
            <div className="hidden sm:block">
              {recentMints[currentMintIndex]}
            </div>
          </div>
          <div className="text-right">
            <span className="text-kaiju-pink font-bold">{stats.boxesLeft}</span> boxes remaining
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column: Aggressive mint-focused content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Urgent mint badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kaiju-pink text-white text-sm font-bold mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                MINTING NOW • {stats.ultraRareChance} ULTRA RARE CHANCE
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black mb-4 tracking-tight text-white leading-tight">
                <span className="block">MINT YOUR</span>
                <span className="block bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light bg-clip-text text-transparent">
                  MYSTERY KAIJU
                </span>
              </h1>
              
              <p className="text-lg text-white/90 mb-8 max-w-lg mx-auto lg:mx-0 font-medium">
                4 exclusive designs. Physical + Digital. Only <span className="text-kaiju-pink font-bold">{stats.boxesLeft}</span> boxes left.
              </p>
              
              {/* Prominent mint section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="text-center sm:text-left">
                    <div className="text-3xl font-black text-white">{stats.price}</div>
                    <div className="text-white/60 text-sm">per mystery box</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-white/60 text-sm">You might get</div>
                    <div className="text-xl font-bold text-kaiju-pink">Ultra Rare Vinyl ({stats.ultraRareChance})</div>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onMint}
                  className="w-full bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-black text-xl py-4 px-8 rounded-xl shadow-2xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300"
                >
                  🎲 MINT MYSTERY BOX NOW
                </motion.button>
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-2xl font-bold text-kaiju-pink">{mysteryDesigns.length}</div>
                  <div className="text-xs text-white/60">Designs</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-2xl font-bold text-kaiju-pink">{stats.boxesLeft}</div>
                  <div className="text-xs text-white/60">Left</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-2xl font-bold text-kaiju-pink">∞</div>
                  <div className="text-xs text-white/60">Utility</div>
                </div>
              </div>
              
              {/* Secondary action */}
              <motion.button 
                onClick={onViewPossibilities}
                className="mt-4 text-white/80 hover:text-white text-sm underline transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                View all possible rewards →
              </motion.button>
            </motion.div>
          </div>
          
          {/* Right column: Enhanced Mystery Box */}
          <div className="order-1 lg:order-2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-kaiju-pink/50 to-kaiju-purple-light/50 rounded-full blur-3xl scale-110 opacity-75 animate-pulse"></div>
              
              <div className="relative">
                <MysteryBox 
                  mysteryDesigns={mysteryDesigns}
                  size="medium"
                  showBreakdown={true}
                  className="!bg-transparent"
                />
              </div>
              
              {/* Floating chance indicators */}
              <motion.div
                className="absolute -top-4 -left-4 bg-kaiju-pink text-white px-3 py-1 rounded-full text-sm font-bold"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {mysteryDesigns[0]?.probability}
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 bg-kaiju-purple-light text-white px-3 py-1 rounded-full text-sm font-bold"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                {mysteryDesigns[3]?.probability}
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom urgency bar */}
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
              Join 2,847 holders • Mint before they're gone
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}