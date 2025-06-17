// src/components/home/MysteriesSection.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Zap, Shield, Flame, ChevronRight } from 'lucide-react'

interface KaijuCharacter {
  id: string
  name: string
  type: 'Plush' | 'Vinyl'
  rarity: 'Common' | 'Rare' | 'Ultra Rare'
  element: string
  personality: string
  specialMove: string
  description: string
  image?: string
  animation?: string
  backgroundColor: string
  accentColor: string
}

interface MysteriesSectionProps {
  title?: string
  subtitle?: string
  characters?: KaijuCharacter[]
  onLearnMore?: (characterId: string) => void
}

const defaultCharacters: KaijuCharacter[] = [
  {
    id: 'cuddle-beast',
    name: 'Cuddle Beast',
    type: 'Plush',
    rarity: 'Common',
    element: 'Heart',
    personality: 'Gentle and nurturing, loves giving warm hugs',
    specialMove: 'Comfort Wave',
    description: 'This soft and cuddly Kaiju brings peace wherever it goes. Its fluffy exterior hides a heart full of love and the power to heal emotional wounds with a single embrace.',
    backgroundColor: 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100',
    accentColor: 'from-pink-400 to-rose-500',
    animation: '/animations/cuddle-beast.json' // Lottie file
  },
  {
    id: 'tech-guardian',
    name: 'Tech Guardian',
    type: 'Vinyl',
    rarity: 'Common',
    element: 'Digital',
    personality: 'Logical and protective, always analyzing threats',
    specialMove: 'Data Shield',
    description: 'A sleek technological marvel with advanced AI capabilities. This Kaiju can interface with any digital system and protect its collector from cyber threats with cutting-edge defenses.',
    backgroundColor: 'bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100',
    accentColor: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'crystal-sage',
    name: 'Crystal Sage',
    type: 'Plush',
    rarity: 'Rare',
    element: 'Mystic',
    personality: 'Wise and mysterious, sees beyond the veil',
    specialMove: 'Reality Glimpse',
    description: 'An ancient and wise Kaiju whose crystalline formations can peer into other dimensions. Its soft, ethereal form belies immense magical power and knowledge of cosmic secrets.',
    backgroundColor: 'bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-100',
    accentColor: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'inferno-king',
    name: 'Inferno King',
    type: 'Vinyl',
    rarity: 'Ultra Rare',
    element: 'Fire',
    personality: 'Fierce and commanding, burns with ancient power',
    specialMove: 'Apocalypse Flare',
    description: 'The legendary ruler of the fire realm, this Ultra Rare Kaiju commands respect and fear. Its presence alone can melt steel, and its roar can be heard across dimensions.',
    backgroundColor: 'bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100',
    accentColor: 'from-red-500 to-orange-600'
  }
]

// Element icons
const ElementIcon = ({ element }: { element: string }) => {
  const iconMap = {
    Heart: <Heart className="w-6 h-6" />,
    Digital: <Zap className="w-6 h-6" />,
    Mystic: <Shield className="w-6 h-6" />,
    Fire: <Flame className="w-6 h-6" />
  }
  return iconMap[element as keyof typeof iconMap] || <Heart className="w-6 h-6" />
}

// Character showcase card
const CharacterCard = ({ 
  character, 
  index,
  onLearnMore 
}: { 
  character: KaijuCharacter
  index: number
  onLearnMore: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const isUltraRare = character.rarity === 'Ultra Rare'

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        type: "spring",
        damping: 25
      }}
      className="relative group"
    >
      {/* Ultra rare particle effects */}
      {isUltraRare && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-kaiju-pink to-orange-400 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                delay: i * 0.4,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className={`relative w-full ${character.backgroundColor} rounded-3xl shadow-xl border-4 border-white overflow-hidden cursor-pointer`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ 
          y: -12,
          scale: 1.02,
          boxShadow: isUltraRare 
            ? "0 35px 70px -12px rgba(255, 0, 92, 0.3)"
            : "0 35px 70px -12px rgba(0, 0, 0, 0.15)"
        }}
        transition={{ duration: 0.4, type: "spring", damping: 20 }}
      >
        {/* Character illustration area */}
        <div className="relative h-80 flex items-center justify-center p-8">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className={`w-full h-full bg-gradient-to-br ${character.accentColor}`} />
          </div>
          
          {/* Character illustration placeholder */}
          <motion.div
            className="relative z-10 w-full h-full flex items-center justify-center"
            animate={isHovered ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0]
            } : {}}
            transition={{ 
              duration: 2,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {/* Placeholder character - replace with actual images/animations */}
            <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${character.accentColor} flex items-center justify-center shadow-2xl`}>
              <div className="text-8xl filter drop-shadow-lg">
                {character.type === 'Plush' ? '🧸' : '🤖'}
              </div>
            </div>
            
            {/* Floating element icon */}
            <motion.div
              className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r ${character.accentColor} flex items-center justify-center text-white shadow-lg`}
              animate={isHovered ? { 
                y: [-2, 2, -2],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ 
                duration: 1.5,
                repeat: isHovered ? Infinity : 0
              }}
            >
              <ElementIcon element={character.element} />
            </motion.div>
          </motion.div>

          {/* Hover overlay with special move */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isHovered ? 1 : 0.8,
                  opacity: isHovered ? 1 : 0
                }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="text-sm font-medium mb-2 text-yellow-300">Special Move</div>
                <div className="text-2xl font-bold mb-4">{character.specialMove}</div>
                <div className="text-sm opacity-90 max-w-xs">{character.personality}</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Character info section */}
        <div className="relative bg-white/95 backdrop-blur-sm p-6">
          {/* Type and rarity badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-kaiju-navy/60 uppercase tracking-wide">
              {character.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              character.rarity === 'Ultra Rare' 
                ? 'bg-gradient-to-r from-kaiju-pink to-red-500 text-white'
                : character.rarity === 'Rare'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {character.rarity}
            </span>
          </div>

          {/* Character name */}
          <h3 className="text-2xl font-black text-kaiju-navy mb-2 leading-tight">
            {character.name}
          </h3>

          {/* Element */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${character.accentColor}`} />
            <span className="text-sm font-semibold text-kaiju-navy/70">
              {character.element} Element
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-kaiju-navy/70 leading-relaxed mb-6 line-clamp-3">
            {character.description}
          </p>

          {/* Learn more button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onLearnMore()
            }}
            className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isUltraRare
                ? 'bg-gradient-to-r from-kaiju-pink to-red-500 text-white hover:shadow-lg hover:shadow-kaiju-pink/25'
                : `bg-gradient-to-r ${character.accentColor} text-white hover:shadow-lg`
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Meet {character.name}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Ultra rare glow effect */}
        {isUltraRare && (
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255, 0, 92, 0.1), transparent)',
              filter: 'blur(1px)'
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.01, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default function MysteriesSection({
  title = "Meet the Kaiju",
  subtitle = "Four unique characters await discovery in our mystery boxes. Each Kaiju has their own personality, powers, and story. Which one will become your companion?",
  characters = defaultCharacters,
  onLearnMore
}: MysteriesSectionProps) {
  
  const handleLearnMore = (characterId: string) => {
    if (onLearnMore) {
      onLearnMore(characterId)
    } else {
      // Default behavior - could open a modal or navigate to character detail page
      console.log('Learn more about character:', characterId)
    }
  }

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white via-kaiju-light-pink/20 to-white" id="mysteries">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-kaiju-navy mb-6 leading-tight">
            {title}
          </h2>
          <p className="max-w-4xl mx-auto text-xl text-kaiju-navy/75 leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Character grid */}
        <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              onLearnMore={() => handleLearnMore(character.id)}
            />
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-20"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-kaiju-light-gray/50 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-kaiju-navy mb-4">
              Ready to Meet Your Kaiju?
            </h3>
            <p className="text-kaiju-navy/70 mb-6">
              Each mystery box guarantees one of these amazing characters. Start your collection and discover which Kaiju will choose you!
            </p>
            <motion.button
              onClick={() => {
                const heroElement = document.querySelector('#hero')
                if (heroElement) {
                  heroElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-gradient-to-r from-kaiju-pink to-red-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-kaiju-pink/25 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Open Your Mystery Box
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}