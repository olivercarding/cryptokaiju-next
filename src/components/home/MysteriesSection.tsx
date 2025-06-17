// src/components/home/MysteriesSection.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronRight, Sparkles, Zap, Droplets, Flame, Star, Eye, ChevronDown, Book, Zap as Lightning, Shield, Database, Monitor } from 'lucide-react'

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

export default function MysteriesSection({
  title = "Guardian Database",
  subtitle = "Use the interface below to explore each legendary guardian",
  characters = defaultCharacters,
  onDiscoverStory
}: MysteriesSectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const handleLearnMore = (characterName: string) => {
    if (onDiscoverStory) {
      onDiscoverStory(characterName)
    } else {
      const heroElement = document.querySelector('#hero')
      if (heroElement) {
        heroElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const PowerIcon = selectedCharacter !== null && characters && characters[selectedCharacter] ? getIcon(characters[selectedCharacter].powerIcon) : Star

  return (
    <section className="relative py-12 md:py-20 px-4 md:px-6 min-h-screen bg-kaiju-navy overflow-hidden" id="mysteries" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-kaiju-purple-dark via-kaiju-navy to-kaiju-purple-dark" />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-sm"
            style={{
              width: `${(i * 0.5) + 2}px`,
              height: `${(i * 0.3) + 2}px`,
              background: i % 2 === 0 ? '#FF69B4' : '#A855F7',
              left: `${(i * 12 + 10) % 100}%`,
              top: `${(i * 17 + 5) % 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: (i * 0.5) + 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Pokédex Interface */}
        <motion.div
          className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-red-800"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Device Body */}
          <div className="bg-black/90 rounded-2xl p-4 md:p-6 border-2 border-gray-800">
            
            {/* Screen */}
            <div className="bg-green-400 rounded-xl p-1 mb-6 shadow-inner">
              <div className="bg-green-300 rounded-lg h-80 md:h-96 p-4 relative overflow-hidden">
                
                {/* Screen Content */}
                <AnimatePresence mode="wait">
                  {selectedCharacter === null || !characters || !characters[selectedCharacter] ? (
                    // Default Screen
                    <motion.div
                      key="default"
                      className="flex flex-col items-center justify-center h-full text-black"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Database className="w-16 h-16 mb-4 opacity-70" />
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">Choose Your Options</h3>
                      <p className="text-lg opacity-80 text-center">Select a button below to view guardian data</p>
                      
                      {/* Blinking cursor */}
                      <motion.div
                        className="w-3 h-6 bg-black mt-4"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </motion.div>
                  ) : (
                    // Character Display
                    <motion.div
                      key={`character-${selectedCharacter}`}
                      className="h-full text-black overflow-y-auto"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="h-full flex">
                        {/* Left Side - Character Image & Name */}
                        <div className="w-1/2 p-3 flex flex-col items-center justify-center border-r-2 border-black/20">
                          <div className="text-center mb-4">
                            <h3 className="text-lg md:text-xl font-bold mb-1">{characters[selectedCharacter].name}</h3>
                            <div className="inline-block px-2 py-1 bg-black/20 rounded-full text-xs font-semibold">
                              #{String(selectedCharacter + 1).padStart(3, '0')} • {characters[selectedCharacter].type}
                            </div>
                          </div>
                          
                          {/* Large Character Image */}
                          <div className="flex-1 flex items-center justify-center max-w-full">
                            <motion.img
                              src={characters[selectedCharacter].image}
                              alt={characters[selectedCharacter].name}
                              className="w-full h-auto max-w-[160px] md:max-w-[200px] max-h-[180px] md:max-h-[220px] object-contain drop-shadow-lg cursor-pointer"
                              whileHover={{ 
                                scale: 1.1,
                                rotateZ: [0, 5, -5, 0],
                                filter: "brightness(1.2) saturate(1.3)"
                              }}
                              transition={{ 
                                scale: { duration: 0.3 },
                                rotateZ: { duration: 0.6, ease: "easeInOut" },
                                filter: { duration: 0.3 }
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder-kaiju.png'
                              }}
                            />
                          </div>
                        </div>

                        {/* Right Side - Character Info */}
                        <div className="w-1/2 p-3 space-y-3 text-xs md:text-sm overflow-y-auto">
                          <div>
                            <div className="font-bold flex items-center gap-1 mb-1">
                              <PowerIcon className="w-3 h-3" />
                              SPECIAL ABILITY
                            </div>
                            <div className="font-semibold text-xs">{characters[selectedCharacter].power}</div>
                          </div>

                          <div>
                            <div className="font-bold mb-1">DESCRIPTION</div>
                            <div className="text-xs leading-tight">{characters[selectedCharacter].description}</div>
                          </div>

                          {characters[selectedCharacter].abilities && characters[selectedCharacter].abilities.length > 0 && (
                            <div>
                              <div className="font-bold mb-1">ABILITIES</div>
                              <div className="grid grid-cols-1 gap-1">
                                {characters[selectedCharacter].abilities.map((ability, i) => (
                                  <div key={i} className="bg-black/10 rounded px-2 py-1 text-xs">
                                    {ability}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {characters[selectedCharacter].backstory && (
                            <div>
                              <div className="font-bold mb-1">LEGEND</div>
                              <div className="text-xs leading-tight">{characters[selectedCharacter].backstory}</div>
                            </div>
                          )}

                          {/* Learn More Button for this character */}
                          <div className="pt-2">
                            <motion.button
                              onClick={() => handleLearnMore(characters[selectedCharacter].name)}
                              className="w-full bg-gradient-to-r from-kaiju-pink to-kaiju-purple-light text-white font-bold px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs"
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Eye className="w-3 h-3" />
                              Learn More About {characters[selectedCharacter].name}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {characters && characters.map((character, index) => (
                <motion.button
                  key={character.name}
                  onClick={() => setSelectedCharacter(index)}
                  className={`bg-gradient-to-br from-kaiju-navy to-kaiju-purple-dark hover:from-kaiju-purple-light hover:to-kaiju-pink rounded-xl p-4 border-2 shadow-xl transition-all duration-300 ${
                    selectedCharacter === index 
                      ? 'border-kaiju-pink ring-4 ring-kaiju-pink/50 bg-gradient-to-br from-kaiju-pink to-kaiju-red shadow-kaiju-pink/25' 
                      : 'border-white/30 hover:border-kaiju-pink/50 hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="text-white font-bold text-sm md:text-base">
                    {character.name}
                  </div>
                  <div className="text-white/70 text-xs mt-1">
                    #{String(index + 1).padStart(3, '0')}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            {selectedCharacter !== null && characters && characters[selectedCharacter] && (
              <motion.div
                className="mt-6 flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  onClick={() => handleLearnMore(characters[selectedCharacter].name)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4" />
                  Learn More About {characters[selectedCharacter].name}
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    const heroElement = document.querySelector('#hero')
                    if (heroElement) {
                      heroElement.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Open Mystery Box
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Big Open Mystery Box Button - Under the Pokédex */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            onClick={() => {
              const heroElement = document.querySelector('#hero')
              if (heroElement) {
                heroElement.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-black text-xl md:text-2xl px-10 md:px-16 py-4 md:py-6 rounded-full shadow-2xl hover:shadow-kaiju-pink/25 transition-all duration-300 flex items-center justify-center gap-4 border-4 border-white/20"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
            <span>Open Mystery Box</span>
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}