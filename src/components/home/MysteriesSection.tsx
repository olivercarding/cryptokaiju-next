// src/components/home/MysteriesSection.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'

interface Character {
  name: string
  type: string
  rarity: string
  power: string
  image: string
  backgroundColor: string
}

interface MysteriesSectionProps {
  title?: string
  subtitle?: string
  characters?: Character[]
  onLearnMore?: (characterName: string) => void
}

const defaultCharacters: Character[] = [
  {
    name: 'Uri',
    type: 'Plush',
    rarity: 'Common',
    power: 'Glows in the dark',
    image: '/images/Ghost1.png',
    backgroundColor: 'bg-kaiju-light-pink'
  },
  {
    name: 'Kappa',
    type: 'Vinyl',
    rarity: 'Rare',
    power: 'Water manipulation',
    image: '/images/kappa.png',
    backgroundColor: 'bg-kaiju-navy/10'
  },
  {
    name: 'Ryuu',
    type: 'Plush',
    rarity: 'Ultra Rare',
    power: 'Fire breathing',
    image: '/images/dragon.png',
    backgroundColor: 'bg-kaiju-pink/10'
  },
  {
    name: 'Fenikkusu',
    type: 'Vinyl',
    rarity: 'Legendary',
    power: 'Eternal rebirth',
    image: '/images/phoenix.png',
    backgroundColor: 'bg-kaiju-purple-light/10'
  }
]

const CharacterCard = ({ character, index, onLearnMore }: { 
  character: Character
  index: number
  onLearnMore: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const rotation = ['-2deg', '1deg', '-1deg', '2deg'][index] || '0deg'

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-purple-600'
      case 'Ultra Rare': return 'bg-red-500'
      case 'Rare': return 'bg-blue-500'
      default: return 'bg-green-500'
    }
  }

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
      className="relative group cursor-pointer w-full"
    >
      <div className="bg-kaiju-white border-[3px] border-kaiju-light-gray rounded-[18px] pt-6 pb-6 px-4 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-80 w-full flex flex-col">
        
        <div className={`${character.backgroundColor} h-48 w-full mb-4 rounded-[12px] overflow-hidden relative flex items-center justify-center flex-shrink-0`}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <img
              src={character.image}
              alt={character.name}
              className="w-32 h-32 object-contain rounded-lg drop-shadow-lg"
              onError={(e) => {
                console.log('Image failed to load:', character.image)
                const target = e.target as HTMLImageElement
                target.src = '/images/placeholder-kaiju.png'
              }}
              onLoad={() => console.log('Image loaded successfully:', character.image)}
            />
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-kaiju-pink/10 to-kaiju-purple-light/10 rounded-[12px]"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg ${getRarityColor(character.rarity)}`}>
              {character.rarity}
            </div>

            <div className="absolute top-2 left-2 bg-kaiju-navy/80 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {character.type}
            </div>
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-kaiju-navy/30 via-transparent to-transparent flex items-end justify-center pb-4 rounded-[12px]"
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
                <div className="text-xs font-semibold">Available to Mint</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="text-center px-2 h-20 flex flex-col justify-center flex-shrink-0">
          <h3 className="text-lg font-extrabold mb-1 text-kaiju-navy leading-tight">
            {character.name}
          </h3>
          <div className="bg-gradient-to-r from-kaiju-navy/5 to-kaiju-purple-light/5 rounded-lg p-2">
            <p className="text-xs text-kaiju-navy/70 leading-relaxed">
              {character.power}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MysteriesSection({
  title = "4 Kaiju Designs Available",
  subtitle = "Meet the incredible Kaiju waiting to join your collection! Each design comes with unique traits and powers. Which one will choose you in your mystery box?",
  characters = defaultCharacters,
  onLearnMore
}: MysteriesSectionProps) {
  
  const handleLearnMore = (characterName: string) => {
    if (onLearnMore) {
      onLearnMore(characterName)
    } else {
      const heroElement = document.querySelector('#hero')
      if (heroElement) {
        heroElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const rarityTypes = ['Common', 'Rare', 'Ultra Rare', 'Legendary']

  return (
    <section className="bg-kaiju-light-pink py-24 px-6" id="mysteries">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-kaiju-navy">{title}</h2>
        <p className="max-w-3xl mx-auto text-kaiju-navy/70 mb-14 leading-relaxed">
          {subtitle}
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center max-w-6xl mx-auto">
          {characters.map((character, index) => (
            <div key={index} className="w-full max-w-[280px]">
              <CharacterCard
                character={character}
                index={index}
                onLearnMore={() => handleLearnMore(character.name)}
              />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {rarityTypes.map((rarity) => {
            const count = characters.filter(c => c.rarity === rarity).length
            if (count === 0) return null
            
            const getTextColor = (rarity: string) => {
              switch (rarity) {
                case 'Legendary': return 'text-purple-600'
                case 'Ultra Rare': return 'text-red-500'
                case 'Rare': return 'text-blue-500'
                default: return 'text-green-500'
              }
            }
            
            return (
              <div key={rarity} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-kaiju-light-gray/30">
                <div className={`text-lg font-bold ${getTextColor(rarity)}`}>
                  {count}
                </div>
                <div className="text-xs text-kaiju-navy/70">{rarity}</div>
              </div>
            )
          })}
        </motion.div>

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
              Every mystery box contains one of these amazing designs! Start your collection and discover which Kaiju destiny awaits you.
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