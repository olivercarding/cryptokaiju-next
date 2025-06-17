// src/app/page.tsx
'use client'

import Header from '@/components/layout/Header'
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
    boxesLeft: 427,
    ultraRareChance: '5%'
  }

  // Updated to use videos instead of images
  const howItWorksSteps = [
    {
      title: "Connect Wallet",
      description: "Link your wallet to participate in the mystery box mint.",
      mediaSrc: "/videos/Comp 1_8.webm",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-light-pink"
    },
    {
      title: "Open Mystery Box",
      description: "Mint your box to reveal which of the 4 Kaiju you've found.",
      mediaSrc: "/videos/Comp2.webm",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-purple-light/20"
    },
    {
      title: "Claim Physical",
      description: "Enter your physical address, pay the shipping fee, and enjoy your new CryptoKaiju!", 
      mediaSrc: "/videos/Comp 1_9.mp4",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-navy/10"
    }
  ]

  // 🎯 CHARACTER SHOWCASE - All 4 available designs
  const availableCharacters = [
    {
      name: 'Uri',
      type: 'Plush',
      rarity: 'Common',
      power: 'Glows in the dark',
      image: '/images/Ghost1.png',              // ✅ We know this works
      backgroundColor: 'bg-kaiju-light-pink'
    },
    {
      name: 'Kappa',
      type: 'Vinyl',
      rarity: 'Rare', 
      power: 'Water manipulation',
      image: '/images/kappa.png',               // Add this image to /public/images/
      backgroundColor: 'bg-kaiju-navy/10'
    },
    {
      name: 'Ryuu',
      type: 'Plush',
      rarity: 'Ultra Rare',
      power: 'Fire breathing',
      image: '/images/dragon.png',              // Add this image to /public/images/
      backgroundColor: 'bg-kaiju-pink/10'
    },
    {
      name: 'Fenikkusu',
      type: 'Vinyl',
      rarity: 'Legendary',
      power: 'Eternal rebirth',
      image: '/images/phoenix.png',             // Add this image to /public/images/
      backgroundColor: 'bg-kaiju-purple-light/10'
    }
  ]

  const ctaStats = {
    priceLabel: "Price per Box",
    price: "Dynamic", // This will be fetched from contract
    countLabel: "Mystery Boxes Left",
    count: 427
  }

  // Event handlers
  const handleMint = (quantity: number) => {
    console.log(`Mint button clicked - Quantity: ${quantity}`)
    // Mint logic will be handled in HeroSection with Thirdweb
  }

  const handleViewPossibilities = () => {
    console.log('View possibilities clicked')
    // Add navigation or modal logic here
  }

  const handleCTAAction = () => {
    console.log('CTA action clicked')
    // Add CTA logic here
  }

  const handleLearnMore = (characterName: string) => {
    console.log(`Learn more about ${characterName}`)
    // Could open a modal or navigate to character details
  }

  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        <section id="hero">
          <HeroSection 
            mysteryDesigns={mysteryDesigns}
            stats={heroStats}
            onMint={handleMint}
            onViewPossibilities={handleViewPossibilities}
          />
        </section>
        
        <HowItWorksSection 
          title="How it works"
          steps={howItWorksSteps}
          rotations={['-3deg', '2deg', '-2deg']}
          useVideoCards={true}
        />
        
        <MysteriesSection 
          title="4 Kaiju Designs Available"
          subtitle="Meet the incredible Kaiju waiting to join your collection! Each design comes with unique traits and powers. Which one will choose you in your mystery box?"
          characters={availableCharacters}  // 🎯 Now showing all characters!
          onLearnMore={handleLearnMore}
        />
        
        <section id="community">
          <CTASection 
            title="Ready to Discover Your Kaiju?"
            subtitle="Every mystery box is a surprise. Will you uncover a rare vinyl figure or a cuddly plush companion?"
            buttonText="Open Mystery Box"
            stats={ctaStats}
            onAction={handleCTAAction}
            variant="mystery"
          />
        </section>
      </main>
    </>
  )
}