// src/components/home/MysteriesSection.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'

interface Character {
  name: string
  type: string
  essence: string
  description: string
  nftImage: string
  physicalImage: string
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
    essence: 'Glows in the dark',
    description: 'A mysterious ghost-like entity that illuminates the darkness with an ethereal glow.',
    nftImage: '/images/Ghost1.png',
    physicalImage: '/images/uri-physical.jpg',
    backgroundColor: 'bg-purple-100'
  }
]

const PhysicalProductCard = ({ 
  character, 
  index, 
  onLearnMore 
}: { 
  character: Character
  index: number
  onLearnMore?: (name: string) => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="bg-white p-4 rounded-lg">
      <h3>{character.name}</h3>
      <p>{character.essence}</p>
      <button onClick={() => onLearnMore?.(character.name)}>
        Learn More
      </button>
    </div>
  )
}

export default function MysteriesSection({
  title = "Physical Collectibles Available",
  subtitle = "Each mystery box contains one of these incredible physical collectibles, each paired with a unique NFT. Check out what you can collect!",
  characters = defaultCharacters,
  onLearnMore
}: MysteriesSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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

  return (
    <section className="bg-kaiju-light-pink py-20 px-6" id="mysteries" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-kaiju-navy mb-6">
            {title}
          </h2>
          <p className="text-lg text-kaiju-navy/70 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {characters.map((character, index) => (
            <PhysicalProductCard
              key={character.name}
              character={character}
              index={index}
              onLearnMore={handleLearnMore}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => {
              const heroElement = document.querySelector('#hero')
              if (heroElement) {
                heroElement.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="bg-kaiju-pink text-white font-bold px-8 py-4 rounded-xl"
          >
            Open Your Mystery Box
          </button>
        </div>
      </div>
    </section>
  )
}