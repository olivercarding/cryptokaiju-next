// src/components/home/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
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
  
  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.kaiju-light-pink)_0%,theme(colors.kaiju-white)_70%)]" />
      
      {/* Animated gradient blobs */}
      <motion.div 
        className="absolute top-[10%] right-[10%] w-[600px] h-[600px] opacity-50 pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 10, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div className="absolute inset-0 bg-kaiju-gradient rounded-full blur-3xl" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] opacity-30 pointer-events-none"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
      >
        <div className="absolute inset-0 bg-kaiju-gradient rounded-full blur-3xl" />
      </motion.div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column: Text content */}
          <div className="text-center lg:text-left mt-8 lg:mt-0 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4 px-4 py-1 rounded-full bg-kaiju-pink/10 text-kaiju-pink text-sm font-medium">
                Blind Mint • 4 Unique Designs
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="block text-kaiju-navy">Which Kaiju</span>
                <span className="block text-kaiju-pink">Awaits You?</span>
              </h1>
              
              <p className="text-lg text-kaiju-navy/70 mb-8 max-w-lg mx-auto lg:mx-0">
                Every mystery box contains one of four exclusive CryptoKaiju designs. 
                Plush or vinyl? Rare or common? Only one way to find out...
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onMint}
                  className="btn-primary text-base inline-flex items-center gap-2"
                >
                  <span>Reveal Your Kaiju</span>
                  <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12L12 15L9 12M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
                
                <button 
                  onClick={onViewPossibilities}
                  className="btn-secondary text-base"
                >
                  View Possibilities
                </button>
              </div>
              
              {/* Collection stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg px-2 py-3 text-center">
                  <div className="text-2xl font-bold text-kaiju-pink">{stats.price}</div>
                  <div className="text-xs text-kaiju-navy/70 mt-1">Per Box</div>
                </div>
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg px-2 py-3 text-center">
                  <div className="text-2xl font-bold text-kaiju-pink">{stats.boxesLeft}</div>
                  <div className="text-xs text-kaiju-navy/70 mt-1">Boxes Left</div>
                </div>
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg px-2 py-3 text-center">
                  <div className="text-2xl font-bold text-kaiju-pink">{stats.ultraRareChance}</div>
                  <div className="text-xs text-kaiju-navy/70 mt-1">Ultra Rare</div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right column: Mystery Box */}
          <div className="order-1 lg:order-2">
            <MysteryBox 
              mysteryDesigns={mysteryDesigns}
              size="medium"
              showBreakdown={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}