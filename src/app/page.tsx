// src/app/page.tsx
'use client'

import Header from '@/components/layout/Header'
import HeroSection from '@/components/home/HeroSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import MysteriesSection from '@/components/home/MysteriesSection'
import CTASection from '@/components/home/CTASection'
// Removed the unused import: import { defaultEasing } from 'framer-motion'

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

  // 🎯 PHYSICAL COLLECTIBLES SHOWCASE - Updated for new component structure
  const physicalCollectibles = [
    {
      name: 'Uri',
      type: 'vinyl',
      power: 'Glows in the dark',
      description: 'A mysterious ghost-like entity that illuminates the darkness with an ethereal glow.',
      nftImage: '/images/Ghost1.png',
      physicalImage: '/images/Uri_product_shot.png',
      backgroundColor: 'bg-purple-100'
    },
    {
      name: 'Meme',
      type: 'vinyl',
      power: 'Cute, soft and cuddly.',
      description: 'Ancient water spirit with the ability to control rivers and rain.',
      nftImage: '/images/Meme-NFT.png',
      physicalImage: '/images/Meme.png',
      backgroundColor: 'bg-blue-100'
    },
    {
      name: 'Diamond Hands',
      type: 'Vinyl',
      power: 'Iconic, cuddly and soft.',
      description: 'A cool Kaiju you'll want to hold, based on the iconic Genesis design.',
      nftImage: '/images/dragon.png',
      physicalImage: '/images/Diamond_hands_product_shot.png',
      backgroundColor: 'bg-red-100'
    },
    {
      name: 'Genesis Plush (Green)',
      type: 'Plush',
      power: 'Beautifully soft in the iconic design',
      description: 'The immortal phoenix that rises from ashes stronger than before.',
      nftImage: '/images/Genesis-NFT.png',
      physicalImage: '/images/Green_genesis_product_shot.png',
      backgroundColor: 'bg-blue-100'
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
          title="Physical Collectibles Available"
          subtitle="Each mystery box contains one of these incredible physical collectibles, each paired with a unique NFT. Check out what you can mint!"
          characters={physicalCollectibles}
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