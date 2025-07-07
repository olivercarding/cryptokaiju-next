// src/components/home/HowItWorksSection.tsx
'use client'

import PolaroidCard from '../shared/PolaroidCard'

interface Step {
  title: string
  description: string
  mediaSrc: string
  mediaType?: 'image' | 'video'
  backgroundColor: string
  // Legacy support
  imageSrc?: string
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
      mediaSrc: "/videos/Comp 1_8.webm",
      mediaType: "video",
      backgroundColor: "bg-kaiju-purple-light/20"
    },
    {
      title: "Open Mystery Box",
      description: "Mint your box to reveal which of the 4 exclusive designs you received.",
      mediaSrc: "/videos/open-box.mp4",
      mediaType: "video",
      backgroundColor: "bg-kaiju-purple-light/20"
    },
    {
      title: "Claim Physical",
      description: "If you got a plush design, we'll ship your NFC‑chipped Kaiju to your door.",
      mediaSrc: "/videos/claim-physical.mp4",
      mediaType: "video",
      backgroundColor: "bg-kaiju-navy/10"
    }
  ],
  rotations = ['-3deg', '2deg', '-2deg']
}: HowItWorksSectionProps) {
  
  return (
    <section className="bg-kaiju-light-pink py-24 px-6" id="how">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-14 text-kaiju-navy leading-tight">{title}</h2>

        <div className="relative grid gap-10 md:grid-cols-3 justify-items-center">
          {steps.map((step, i) => (
            <PolaroidCard
              key={i}
              step={i + 1}
              title={step.title}
              description={step.description}
              mediaSrc={step.mediaSrc}
              mediaType={step.mediaType}
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