// src/components/home/MysteriesSection.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'

interface Mystery {
  type: string
  backgroundColor: string
  isRevealed?: boolean
  revealedName?: string
  revealedPower?: string
  revealedImage?: string
}

interface MysteriesSectionProps {
  title?: string
  subtitle?: string
  mysteries?: Mystery[]
  onLearnMore?: (mysteryType: string) => void
}

const defaultMysteries: Mystery[] = [
  {
    type: 'Uri (Common)',
    backgroundColor: 'bg-kaiju-light-pink'
  },
  {
    type: 'Plush (Rare)',
    backgroundColor: 'bg-kaiju-navy/10'
  },
  {
    type: 'Vinyl (Ultra Rare)',
    backgroundColor: 'bg-kaiju-pink/10'
  },
  {
    type: 'Mystery Design',
    backgroundColor: 'bg-kaiju-purple-light/10'
  }
]

// Simple, consistent mystery card - all cards look exactly the same
const MysteryCard = ({ 
  mystery, 
  index,
  onLearnMore 
}: { 
  mystery: Mystery
  index: number
  onLearnMore: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const rotation = ['-2deg', '1deg', '-1deg', '2deg'][index] || '0deg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        type: "spring",
        damping: 25
      }}
      style={{ rotate: rotation }}
      whileHover={{ y: -8, rotate: '0deg', scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <div className="bg-kaiju-white border-[3px] border-kaiju-light-gray rounded-[18px] pt-6 pb-6 px-4 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-80 flex flex-col">
        
        {/* Content area - same for ALL cards */}
        <div className={`${mystery.backgroundColor} h-48 w-full mb-4 rounded-[12px] overflow-hidden relative flex items-center justify-center flex-shrink-0`}>
          <div className="relative">
            {/* Mystery question mark - same for all cards */}
            <div className="w-24 h-24 bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <motion.span 
                className="text-4xl text-kaiju-navy/60 font-bold"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ?
              </motion.span>
            </div>

            {/* Floating sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-kaiju-pink rounded-full"
                style={{
                  left: `${25 + (i * 25)}%`,
                  top: `${20 + (i % 2) * 50}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                  y: [0, -8, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.4,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
            animate={{
              opacity: [0, 0.3, 0],
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-kaiju-navy/40 via-transparent to-transparent flex items-end justify-center pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ 
                y: isHovered ? 0 : 10,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center text-white"
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-semibold">Mystery Awaits</div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Text content - exactly the same for ALL cards with fixed height */}
        <div className="text-center px-2 h-20 flex flex-col justify-center flex-shrink-0">
          <h3 className="text-xl font-extrabold mb-2 uppercase tracking-tight text-kaiju-navy leading-tight">
            {mystery.type}
          </h3>
          <div className="bg-gradient-to-r from-kaiju-navy/5 to-kaiju-purple-light/5 rounded-lg p-2">
            <p className="text-sm text-kaiju-navy/70 leading-relaxed">
              Mint to discover
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MysteriesSection({
  title = "4 Kaiju Designs Await",
  subtitle = "Deep within the CryptoKaiju vault, four distinct design types await discovery. Some will be cuddly plush companions, others collectible vinyl figures. Which destiny calls to you?",
  mysteries = defaultMysteries,
  onLearnMore
}: MysteriesSectionProps) {
  
  const handleLearnMore = (mysteryType: string) => {
    if (onLearnMore) {
      onLearnMore(mysteryType)
    } else {
      // Default behavior - scroll to hero section
      const heroElement = document.querySelector('#hero')
      if (heroElement) {
        heroElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="bg-kaiju-light-pink py-24 px-6" id="mysteries">
      <div className="max-w-7xl mx-auto text-center">
        {/* Section header */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-kaiju-navy">{title}</h2>
        <p className="max-w-3xl mx-auto text-kaiju-navy/70 mb-14 leading-relaxed">
          {subtitle}
        </p>

        {/* Mystery cards grid */}
        <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {mysteries.map((mystery, index) => (
            <MysteryCard
              key={index}
              mystery={mystery}
              index={index}
              onLearnMore={() => handleLearnMore(mystery.type)}
            />
          ))}
        </div>

        {/* Bottom CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-kaiju-light-gray/50 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-kaiju-navy mb-4">
              Ready to Discover Your Kaiju?
            </h3>
            <p className="text-kaiju-navy/70 mb-6">
              Each mystery box guarantees one of these amazing designs. Start your collection and discover which Kaiju will choose you!
            </p>
            <motion.button
              onClick={() => {
                const heroElement = document.querySelector('#hero')
                if (heroElement) {
                  heroElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-gradient-to-r from-kaiju-pink to-red-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-kaiju-pink/25 transition-all duration-300 inline-flex items-center gap-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              Open Your Mystery Box
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}