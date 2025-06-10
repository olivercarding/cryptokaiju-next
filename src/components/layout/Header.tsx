// src/components/layout/Header.tsx
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from '@/lib/thirdweb'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  
  // Transform scroll into background opacity
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.95])
  const blur = useTransform(scrollY, [0, 100], ['0px', '20px'])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Mint', href: '#hero' },
    { label: 'How It Works', href: '#how' },
    { label: 'Designs', href: '#mysteries' },
    { label: 'Community', href: '#community' },
  ]

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  // Determine text color based on scroll position
  const textColor = isScrolled ? 'text-kaiju-navy' : 'text-white'
  const hoverColor = isScrolled ? 'hover:text-kaiju-pink' : 'hover:text-kaiju-pink'

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-4'
      }`}
      style={{
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
      }}
    >
      <motion.div
        className="absolute inset-0 bg-kaiju-white border-b border-kaiju-light-gray/20"
        style={{ opacity: backgroundOpacity }}
      />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick('#hero')}
          >
            <motion.div
              animate={{ 
                y: [0, -2, 0],
                rotate: [0, 1, 0, -1, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/images/cryptokaiju-logo.png"
                alt="CryptoKaiju"
                width={isScrolled ? 160 : 180}
                height={isScrolled ? 80 : 90}
                className="h-auto transition-all duration-300 hover:drop-shadow-lg"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`relative ${textColor} font-semibold transition-colors duration-300 ${hoverColor}`}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.label}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-kaiju-pink"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </nav>

          {/* Thirdweb Connect Button + Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Thirdweb Connect Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ConnectButton
                client={thirdwebClient}
                theme="dark"
                connectModal={{
                  size: "wide",
                  title: "Connect to CryptoKaiju",
                  showThirdwebBranding: false,
                }}
                appMetadata={{
                  name: "CryptoKaiju",
                  description: "Collectible NFTs Linked to Toys",
                  url: "https://cryptokaiju.com",
                  logoUrl: "/images/cryptokaiju-logo.png",
                }}
              />
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className={`lg:hidden p-2 ${textColor} ${hoverColor} transition-colors`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <motion.span
                  className="w-full h-0.5 bg-current mb-1"
                  animate={isMenuOpen ? { rotate: 45, y: 2 } : { rotate: 0, y: 0 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-current mb-1"
                  animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-current"
                  animate={isMenuOpen ? { rotate: -45, y: -2 } : { rotate: 0, y: 0 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.nav
          className="lg:hidden overflow-hidden"
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pt-4 pb-6 space-y-4">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`block w-full text-left ${textColor} font-medium py-2 px-4 rounded-lg hover:bg-kaiju-light-pink hover:text-kaiju-pink transition-colors`}
                initial={{ opacity: 0, x: -20 }}
                animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.nav>
      </div>
    </motion.header>
  )
}