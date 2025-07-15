// src/components/pages/HomePageClient.tsx
'use client'

import Header from '@/components/layout/Header'
import HeroSection from '@/components/home/HeroSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import MysteriesSection from '@/components/home/MysteriesSection'
import CTASection from '@/components/home/CTASection'

export default function HomePageClient() {
  
  // FIXED: Configuration data - updated to match HeroSection interface and new batch structure
  const mysteryDesigns = [
    { type: 'Plush', essence: 'Glows in the dark' },
    { type: 'Vinyl', essence: 'Water manipulation' },
    { type: 'Plush', essence: 'Fire breathing' },
    { type: 'Vinyl', essence: 'Eternal rebirth' },
  ]

  const heroStats = {
    boxesLeft: 427,
    ultraRareChance: '5%'
  }

  // Updated with MP4 fallbacks for Safari compatibility
  const howItWorksSteps = [
    {
      title: "Connect Wallet",
      description: "Link your wallet to participate in the mystery box mint.",
      mediaSrc: "/videos/Comp 1_8.webm",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-light-pink",
      mp4Fallback: "/videos/Comp1Safari2.mp4" // Add mp4 version for Safari
    },
    {
      title: "Open Mystery Box",
      description: "Mint your box to reveal which of the 4 Kaiju you've found.",
      mediaSrc: "/videos/comp2.webm",
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-purple-light/20",
      mp4Fallback: "/videos/boxmovie2safari.mp4" // Add mp4 version for Safari
    },
    {
      title: "Enter Shipping Info",
      description: "Complete your order with shipping details and receive your NFC-chipped collectible!", 
      mediaSrc: "/videos/Comp 1_9.mp4", // This is already mp4
      mediaType: "video" as const,
      backgroundColor: "bg-kaiju-navy/10"
    }
  ]

  // 🎯 PHYSICAL COLLECTIBLES SHOWCASE - UPDATED with essence and custom URLs
  const physicalCollectibles = [
    {
      name: 'Uri',
      type: 'Vinyl',
      essence: 'Glows in the dark',
      description: 'A mysterious ghost-like entity that illuminates the darkness with an ethereal glow.',
      nftImage: '/images/Ghost1.png',
      physicalImage: '/images/Uri_product_shot.png',
      backgroundColor: 'bg-purple-100',
      url: '/kaijudx/uri' // Custom URL
    },
    {
      name: 'Meme',
      type: 'Vinyl',
      essence: 'Cute, soft and cuddly',
      description: 'Ancient water spirit with the ability to control rivers and rain.',
      nftImage: '/images/Meme-NFT.png',
      physicalImage: '/images/Meme.png',
      backgroundColor: 'bg-blue-100',
      url: '/kaijudx/meme' // Custom URL
    },
    {
      name: 'Diamond Hands',
      type: 'Vinyl',
      essence: 'For those with hands stronger than steel',
      description: 'Classic design in a cool, iconic colourway.',
      nftImage: '/images/Diamond-Hands-NFT.png',
      physicalImage: '/images/Diamond_hands_product_shot.png',
      backgroundColor: 'bg-gray-100',
      url: '/kaijudx/diamond-hands' // Custom URL
    },
    {
      name: 'Genesis Plush (Green)',
      type: 'Plush',
      essence: 'Beautifully soft in the iconic design',
      description: 'The iconic Genesis design, in a cute and cuddly plush form.',
      nftImage: '/images/Genesis-NFT.png',
      physicalImage: '/images/Green_genesis_product_shot.png',
      backgroundColor: 'bg-green-100',
      url: '/kaijudex/pretty-fine-plushies' // Custom URL
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
    // Mint logic is handled in HeroSection with Thirdweb
  }

  const handleViewPossibilities = () => {
    console.log('View possibilities clicked')
    // Navigate to mysteries section
    const element = document.querySelector('#mysteries')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCTAAction = () => {
    console.log('CTA action clicked')
    // Navigate to hero section for minting
    const element = document.querySelector('#hero')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
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
        />
        
        <MysteriesSection 
          title="Physical Collectibles Available"
          subtitle="Each mystery box contains one of these incredible physical collectibles, each paired with a unique NFT. Check out what you can mint!"
          characters={physicalCollectibles}
          // Removed onLearnMore prop - navigation is now handled directly in the component
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