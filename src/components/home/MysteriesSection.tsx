// src/components/home/MysteriesSection.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronRight, Sparkles, Zap, Droplets, Flame, Star, Eye, ChevronDown, Book, Zap as Lightning, Shield } from 'lucide-react'

interface Character {
  name: string
  type: string
  power: string
  description: string
  backstory: string
  abilities: string[]
  image: string
  backgroundColor: string
  accentColor: string
  powerIcon: string
}

interface MysteriesSectionProps {
  title?: string
  subtitle?: string
  characters?: Character[]
  onDiscoverStory?: (characterName: string) => void
}

const defaultCharacters: Character[] = [
  {
    name: 'Uri',
    type: 'Plush',
    power: 'Glows in the dark',
    description: 'A mysterious ghost-like entity that illuminates the darkness with an ethereal glow.',
    backstory: 'Born from the dreams of lost travelers, Uri emerged as a guardian spirit to guide those who wander in darkness. For centuries, this benevolent ghost has appeared to sailors, hikers, and adventurers when they need light most.',
    abilities: ['Ethereal Illumination', 'Spirit Communication', 'Dream Walking', 'Protective Aura'],
    image: '/images/Ghost1.png',
    backgroundColor: 'from-purple-900/60 via-indigo-800/40 to-purple-900/60',
    accentColor: 'from-purple-400 to-indigo-300',
    powerIcon: 'star'
  },
  {
    name: 'Kappa',
    type: 'Vinyl',
    power: 'Water manipulation',
    description: 'Ancient water spirit with the ability to control rivers and rain.',
    backstory: 'An ancient guardian of Japan\'s waterways, Kappa has protected rivers and lakes for over a millennium. Known for challenging travelers to sumo wrestling, this mischievous yet honorable spirit grants safe passage to those who show respect for nature.',
    abilities: ['Hydrokinesis', 'Weather Control', 'Underwater Breathing', 'River Blessing'],
    image: '/images/kappa.png',
    backgroundColor: 'from-blue-900/60 via-cyan-800/40 to-blue-900/60',
    accentColor: 'from-cyan-400 to-blue-300',
    powerIcon: 'droplets'
  },
  {
    name: 'Ryuu',
    type: 'Plush',
    power: 'Fire breathing',
    description: 'A legendary dragon whose flames can forge the strongest metals.',
    backstory: 'The last of the Eastern Fire Dragons, Ryuu once served as protector of ancient temples. His flames have the unique property of burning away evil while warming the hearts of the pure. Legends say his fire can forge weapons that never break.',
    abilities: ['Sacred Flames', 'Metal Forging', 'Flight', 'Ancient Wisdom'],
    image: '/images/dragon.png',
    backgroundColor: 'from-red-900/60 via-orange-800/40 to-red-900/60',
    accentColor: 'from-orange-400 to-red-300',
    powerIcon: 'flame'
  },
  {
    name: 'Fenikkusu',
    type: 'Vinyl',
    power: 'Eternal rebirth',
    description: 'The immortal phoenix that rises from ashes stronger than before.',
    backstory: 'Fenikkusu has witnessed the rise and fall of civilizations, each death and rebirth bringing greater wisdom. This cosmic phoenix appears during humanity\'s darkest hours, its rebirth symbolizing hope and renewal for all who witness its resurrection.',
    abilities: ['Immortal Resurrection', 'Healing Flames', 'Time Perception', 'Hope Manifestation'],
    image: '/images/phoenix.png',
    backgroundColor: 'from-pink-900/60 via-rose-800/40 to-pink-900/60',
    accentColor: 'from-rose-400 to-pink-300',
    powerIcon: 'zap'
  }
]

// Icon mapping function
const getIcon = (iconName: string) => {
  const icons = {
    star: Star,
    droplets: Droplets,
    flame: Flame,
    zap: Zap
  }
  return icons[iconName as keyof typeof icons] || Star
}

// Enhanced Character Button Component
const CharacterButton = ({ 
  character, 
  isSelected, 
  onClick,
  index 
}: { 
  character: Character
  isSelected: boolean
  onClick: () => void
  index: number
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.button
      className="relative w-full text-left group"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selection glow */}
      {isSelected && (
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${character.accentColor} blur-lg opacity-60 rounded-2xl`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main button */}
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isSelected 
          ? 'bg-white/20 border-2 border-white/30 shadow-2xl' 
          : 'bg-white/10 border border-white/20 hover:bg-white/15'
      }`}>
        
        {/* Character-themed background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${character.backgroundColor} transition-opacity duration-300 ${
          isSelected ? 'opacity-70' : 'opacity-40'
        }`} />
        
        {/* Content */}
        <div className="relative z-10 p-4 flex items-center gap-4">
          {/* Large character image */}
          <motion.div
            className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20"
            animate={isHovered || isSelected ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-full h-full bg-gradient-to-br ${character.backgroundColor} flex items-center justify-center`}>
              <motion.img
                src={character.image}
                alt={character.name}
                className="w-12 h-12 object-contain drop-shadow-lg"
                animate={isHovered || isSelected ? { 
                  scale: 1.1,
                  filter: "brightness(1.2) saturate(1.3)"
                } : {}}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-kaiju.png'
                }}
              />
            </div>
          </motion.div>

          {/* Character info with proper contrast */}
          <div className="flex-1 min-w-0">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <h3 className={`font-black text-lg mb-1 transition-all duration-300 ${
                isSelected 
                  ? `bg-gradient-to-r ${character.accentColor} bg-clip-text text-transparent` 
                  : 'text-white'
              }`}>
                {character.name}
              </h3>
              <div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full font-bold ${
                isSelected 
                  ? `bg-gradient-to-r ${character.accentColor} text-white` 
                  : 'bg-white/20 text-white/90'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-white' : `bg-gradient-to-r ${character.accentColor}`
                }`} />
                {character.type}
              </div>
            </div>
          </div>

          {/* Selection indicator */}
          <motion.div
            className={`w-2 h-8 rounded-full transition-all duration-300 ${
              isSelected ? `bg-gradient-to-b ${character.accentColor}` : 'bg-white/20'
            }`}
            animate={isSelected ? { scaleY: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.button>
  )
}

// Information Card Component
const InfoCard = ({ 
  icon: Icon, 
  title, 
  children, 
  accentColor 
}: { 
  icon: any
  title: string
  children: React.ReactNode
  accentColor: string 
}) => (
  <motion.div
    className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 bg-gradient-to-r ${accentColor} rounded-lg shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="text-white font-bold text-lg">{title}</h4>
    </div>
    {children}
  </motion.div>
)

// Enhanced Character Showcase Component
const CharacterShowcase = ({ character }: { character: Character }) => {
  const PowerIcon = getIcon(character.powerIcon)

  return (
    <div className="relative h-full">
      {/* Enhanced Background with better contrast */}
      <div className={`absolute inset-0 bg-gradient-to-br ${character.backgroundColor} rounded-3xl`} />
      
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30 rounded-3xl" />
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`${character.name}-particle-${i}`}
          className={`absolute rounded-full blur-sm bg-gradient-to-r ${character.accentColor}`}
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${15 + (i * 10)}%`,
            top: `${10 + Math.sin(i * 1.5) * 70}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      <div className="relative z-10 h-full p-6 md:p-8 flex flex-col">
        {/* Header with Now Viewing */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          key={`${character.name}-header`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${character.accentColor} rounded-lg`}>
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider">Now Viewing</h4>
                <div className={`h-0.5 w-12 bg-gradient-to-r ${character.accentColor} rounded-full mt-1`} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* HERO CHARACTER IMAGE - Much Larger */}
        <motion.div
          className="flex-1 flex items-center justify-center mb-6"
          key={character.name}
          initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          transition={{ duration: 0.8, type: "spring", damping: 15 }}
        >
          <div className="relative">
            {/* Multi-layered glow for hero image */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${character.accentColor} rounded-full blur-3xl opacity-40`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* Hero image container - Much larger */}
            <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl">
              <motion.img
                src={character.image}
                alt={character.name}
                className="relative z-10 w-72 h-72 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                whileHover={{ 
                  scale: 1.05,
                  filter: "brightness(1.2) saturate(1.4)",
                  rotateZ: [0, 2, -2, 0]
                }}
                transition={{ duration: 0.6 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-kaiju.png'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Character Name - Better contrast */}
        <motion.div
          className="text-center mb-6"
          key={`${character.name}-name`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h2 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${character.accentColor} bg-clip-text text-transparent mb-2`}>
              {character.name}
            </h2>
            <div className={`h-1 w-20 bg-gradient-to-r ${character.accentColor} rounded-full mx-auto`} />
          </div>
        </motion.div>

        {/* Modular Information Cards */}
        <motion.div
          className="grid gap-4 md:gap-6"
          key={`${character.name}-info`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Power Card */}
          <InfoCard icon={PowerIcon} title="Legendary Power" accentColor={character.accentColor}>
            <h4 className={`text-xl md:text-2xl font-black bg-gradient-to-r ${character.accentColor} bg-clip-text text-transparent mb-3`}>
              {character.power}
            </h4>
            <p className="text-white/90 leading-relaxed">
              {character.description}
            </p>
          </InfoCard>

          {/* Abilities Card */}
          {character.abilities && character.abilities.length > 0 && (
            <InfoCard icon={Lightning} title="Special Abilities" accentColor={character.accentColor}>
              <div className="grid grid-cols-2 gap-2">
                {character.abilities.map((ability, i) => (
                  <motion.div
                    key={ability}
                    className="bg-white/10 rounded-lg p-2 border border-white/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="text-white/90 text-sm font-semibold">{ability}</span>
                  </motion.div>
                ))}
              </div>
            </InfoCard>
          )}

          {/* Backstory Card */}
          {character.backstory && (
            <InfoCard icon={Book} title="Ancient Legend" accentColor={character.accentColor}>
              <p className="text-white/90 leading-relaxed text-sm md:text-base">
                {character.backstory}
              </p>
            </InfoCard>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function MysteriesSection({
  title = "Choose Your Guardian",
  subtitle = "Four legendary Kaiju await discovery. Select a character to learn about their unique powers and ancient stories.",
  characters = defaultCharacters,
  onDiscoverStory
}: MysteriesSectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const ref = useRef(null)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll on mobile when character is selected
  useEffect(() => {
    if (isMobile && showcaseRef.current) {
      const timer = setTimeout(() => {
        showcaseRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selectedCharacter, isMobile])

  const handleDiscoverStory = (characterName: string) => {
    if (onDiscoverStory) {
      onDiscoverStory(characterName)
    } else {
      const heroElement = document.querySelector('#hero')
      if (heroElement) {
        heroElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="relative py-12 md:py-20 px-4 md:px-6 min-h-screen bg-kaiju-navy overflow-hidden" id="mysteries" ref={ref}>
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-kaiju-purple-dark via-kaiju-navy to-kaiju-purple-dark" />
        
        {/* Global particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-sm"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: i % 2 === 0 ? '#FF69B4' : '#A855F7',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Header with better contrast */}
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-6xl font-black mb-4 bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light bg-clip-text text-transparent">
              {title}
            </h2>
            <div className="h-1 w-20 md:w-32 bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light rounded-full mx-auto mb-4" />
            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </motion.div>

        {/* Mobile Layout: Character Carousel + Showcase */}
        {isMobile ? (
          <div className="space-y-6">
            {/* Horizontal Character Carousel */}
            <motion.div
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3 className="text-white font-bold text-lg mb-4 text-center">Select Your Guardian</h3>
              <div className="grid grid-cols-1 gap-3">
                {characters.map((character, index) => (
                  <CharacterButton
                    key={character.name}
                    character={character}
                    isSelected={selectedCharacter === index}
                    onClick={() => setSelectedCharacter(index)}
                    index={index}
                  />
                ))}
              </div>
              
              {/* Mobile scroll indicator */}
              <motion.div
                className="flex items-center justify-center gap-2 mt-4 text-white/60"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm">View details below</span>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Character Showcase */}
            <motion.div
              ref={showcaseRef}
              className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 min-h-[600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <CharacterShowcase 
                  key={selectedCharacter}
                  character={characters[selectedCharacter]} 
                />
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          /* Desktop Layout: Side-by-side */
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-4 min-h-[700px]">
              
              {/* Character Selection */}
              <motion.div
                className="lg:col-span-1 p-6 bg-black/20 border-r border-white/10"
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-white font-black text-xl mb-2">Select Guardian</h3>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light rounded-full mx-auto" />
                </div>
                
                <div className="space-y-4">
                  {characters.map((character, index) => (
                    <CharacterButton
                      key={character.name}
                      character={character}
                      isSelected={selectedCharacter === index}
                      onClick={() => setSelectedCharacter(index)}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Character Showcase */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <AnimatePresence mode="wait">
                  <CharacterShowcase 
                    key={selectedCharacter}
                    character={characters[selectedCharacter]} 
                  />
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}

        {/* Enhanced Action Section with better contrast */}
        <motion.div
          className="text-center mt-8 md:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 max-w-4xl mx-auto shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
              Ready to Meet Your Guardian?
            </h3>
            <div className="h-1 w-20 md:w-24 bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light rounded-full mx-auto mb-6" />
            <p className="text-white/90 mb-8 text-base md:text-lg leading-relaxed">
              Every mystery box contains one of these legendary Kaiju. Your adventure begins with a single mint.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => handleDiscoverStory(characters[selectedCharacter].name)}
                className={`bg-gradient-to-r ${characters[selectedCharacter].accentColor} text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3`}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm md:text-base">Learn About {characters[selectedCharacter].name}</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  const heroElement = document.querySelector('#hero')
                  if (heroElement) {
                    heroElement.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl hover:shadow-kaiju-pink/25 transition-all duration-300 inline-flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm md:text-base">Open Mystery Box</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}