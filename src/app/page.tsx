// src/app/page.tsx
'use client'

import HeroSection from '@/components/home/HeroSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import MysteriesSection from '@/components/home/MysteriesSection'
import CTASection from '@/components/home/CTASection'

export default function Home() {
  
  // Configuration data - could be moved to separate config files or fetched from API
  const mysteryDesigns = [
    { type: 'Plush', rarity: 'Common', probability: '40%' },
    { type: 'Vinyl', rarity: 'Common', probability: '35%' },
    { type: 'Plush', rarity: 'Rare', probability: '20%' },
    { type: 'Vinyl', rarity: 'Ultra Rare', probability: '5%' },
  ]

  const heroStats = {
    price: '0.055 Ξ',
    boxesLeft: 427,
    ultraRareChance: '5%'
  }

  // Updated to use videos instead of images
  const howItWorksSteps = [
    {
      title: "Connect Wallet",
      description: "Link your ETH wallet to participate in the blind mint.",
      mediaSrc: "/videos/Comp 1_8.webm",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-light-pink"
    },
    {
      title: "Open Mystery Box",
      description: "Mint your box to reveal which of the 4 exclusive designs you received.",
      mediaSrc: "/videos/open-mystery-box.mp4",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-purple-light/20"
    },
    {
      title: "Claim Physical",
      description: "If you got a plush design, we'll ship your NFC‑chipped Kaiju to your door.",
      mediaSrc: "/videos/claim-physical.mp4",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-navy/10"
    }
  ]

  // You can also mix images and videos:
  // const howItWorksStepsMixed = [
  //   {
  //     title: "Connect Wallet",
  //     description: "Link your ETH wallet to participate in the blind mint.",
  //     mediaSrc: "/videos/connect-wallet.mp4",
  //     mediaType: "video" as const,
  //     backgroundColor: "bg-kaiju-light-pink"
  //   },
  //   {
  //     title: "Open Mystery Box", 
  //     description: "Mint your box to reveal which of the 4 exclusive designs you received.",
  //     mediaSrc: "/images/kaiju-box.png",
  //     mediaType: "image" as const,
  //     backgroundColor: "bg-kaiju-purple-light/20"
  //   },
  //   {
  //     title: "Claim Physical",
  //     description: "If you got a plush design, we'll ship your NFC‑chipped Kaiju to your door.",
  //     mediaSrc: "/videos/shipping.mp4",
  //     mediaType: "video" as const,
  //     backgroundColor: "bg-kaiju-navy/10"
  //   }
  // ]

  const mysteries = [
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

  const ctaStats = {
    priceLabel: "Price per Box",
    price: "0.055 ETH",
    countLabel: "Mystery Boxes Left",
    count: 427
  }

  // Event handlers
  const handleMint = () => {
    console.log('Mint button clicked')
    // Add mint logic here
  }

  const handleViewPossibilities = () => {
    console.log('View possibilities clicked')
    // Add navigation or modal logic here
  }

  const handleCTAAction = () => {
    console.log('CTA action clicked')
    // Add CTA logic here
  }

  return (
    <main className="text-kaiju-navy overflow-x-hidden">
      <HeroSection 
        mysteryDesigns={mysteryDesigns}
        stats={heroStats}
        onMint={handleMint}
        onViewPossibilities={handleViewPossibilities}
      />
      
      <HowItWorksSection 
        title="How it works"
        steps={howItWorksSteps}
        rotations={['-3deg', '2deg', '-2deg']}
        useVideoCards={true}
      />
      
      <MysteriesSection 
        title="The Four Mysteries"
        subtitle="Deep within the CryptoKaiju vault, four distinct design types await discovery. Some will be cuddly plush companions, others collectible vinyl figures. Which destiny calls to you?"
        mysteries={mysteries}
      />
      
      <CTASection 
        title="Ready to Discover Your Kaiju?"
        subtitle="Every mystery box is a surprise. Will you uncover a rare vinyl figure or a cuddly plush companion?"
        buttonText="Open Mystery Box"
        stats={ctaStats}
        onAction={handleCTAAction}
        variant="mystery"
      />
    </main>
  )
}