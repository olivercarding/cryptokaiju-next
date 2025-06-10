// src/components/home/MysteriesSection.tsx
'use client'

import MysteryCard from '../shared/MysteryCard'

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
}

export default function MysteriesSection({
  title = "Meet The Kaiju",
  subtitle = "Deep within the CryptoKaiju vault, four distinct design types await discovery. Some will be cuddly plush companions, others collectible vinyl figures. Which destiny calls to you?",
  mysteries = [
    {
      type: 'Plush (Common)',
      backgroundColor: 'bg-kaiju-light-pink',
      isRevealed: false
    },
    {
      type: 'Vinyl (Common)',
      backgroundColor: 'bg-kaiju-purple-light/20',
      isRevealed: false
    },
    {
      type: 'Plush (Rare)',
      backgroundColor: 'bg-kaiju-navy/10',
      isRevealed: false
    },
    {
      type: 'Vinyl (Ultra Rare)',
      backgroundColor: 'bg-kaiju-pink/10',
      isRevealed: false
    }
  ]
}: MysteriesSectionProps) {
  
  return (
    <section className="py-24 px-6 bg-white" id="mysteries">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-kaiju-navy">
          {title}
        </h2>
        <p className="max-w-3xl mx-auto text-center text-kaiju-navy/75 mb-16">
          {subtitle}
        </p>

        <div className="grid gap-10 md:grid-cols-4 sm:grid-cols-2">
          {mysteries.map((mystery, idx) => (
            <MysteryCard
              key={idx}
              type={mystery.type}
              backgroundColor={mystery.backgroundColor}
              isRevealed={mystery.isRevealed}
              revealedName={mystery.revealedName}
              revealedPower={mystery.revealedPower}
              revealedImage={mystery.revealedImage}
              size="medium"
            />
          ))}
        </div>
      </div>
    </section>
  )
}