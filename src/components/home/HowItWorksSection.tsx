// src/components/home/HowItWorksSection.tsx
'use client'

import PolaroidCard from '../shared/PolaroidCard'

interface Step {
  title: string
  description: string
  imageSrc: string
  backgroundColor: string
}

interface HowItWorksSectionProps {
  title?: string
  steps?: Step[]
  rotations?: string[]
}

export default function HowItWorksSection({
  title = "How it works",
  steps = [
    {
      title: "Connect Wallet",
      description: "Link your ETH wallet to participate in the blind mint.",
      imageSrc: "/images/kaiju-coin.png",
      backgroundColor: "bg-kaiju-light-pink"
    },
    {
      title: "Open Mystery Box",
      description: "Mint your box to reveal which of the 4 exclusive designs you received.",
      imageSrc: "/images/kaiju-box.png",
      backgroundColor: "bg-kaiju-purple-light/20"
    },
    {
      title: "Claim Physical",
      description: "If you got a plush design, we'll ship your NFC‑chipped Kaiju to your door.",
      imageSrc: "/images/kaiju-mystery.png",
      backgroundColor: "bg-kaiju-navy/10"
    }
  ],
  rotations = ['-3deg', '2deg', '-2deg']
}: HowItWorksSectionProps) {
  
  return (
    <section className="bg-kaiju-light-pink py-24 px-6" id="how">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-14 text-kaiju-navy">{title}</h2>

        <div className="relative grid gap-10 md:grid-cols-3 justify-items-center">
          {steps.map((step, i) => (
            <PolaroidCard
              key={i}
              step={i + 1}
              title={step.title}
              description={step.description}
              imageSrc={step.imageSrc}
              backgroundColor={step.backgroundColor}
              rotation={rotations[i] || '0deg'}
              size="medium"
            />
          ))}
        </div>
      </div>
    </section>
  )
}