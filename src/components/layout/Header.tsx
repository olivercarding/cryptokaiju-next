// src/components/layout/Header.tsx
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from '@/lib/thirdweb'
import { Twitter, Instagram, MessageCircle, Send, ChevronDown, User } from 'lucide-react'

// Social media links configuration
const socialLinks = [
  {
    name: 'X (Twitter)',
    icon: Twitter,
    url: 'https://twitter.com/cryptokaiju',
    color: 'hover:text-blue-400'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/cryptokaiju',
    color: 'hover:text-pink-400'
  },
  {
    name: 'Discord',
    icon: MessageCircle,
    url: 'https://discord.gg/cryptokaiju',
    color: 'hover:text-indigo-400'
  },
  {
    name: 'Telegram',
    icon: Send,
    url: 'https://t.me/cryptokaiju',
    color: 'hover:text-blue-500'
  }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const { scrollY } = useScroll()
  const router = useRouter()
  
  // Transform scroll into background opacity
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.95])
  const blur = useTransform(scrollY, [0, 100], ['0px', '20px'])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (isAccountDropdownOpen) {
        const target = event.target as Element
        if (!target.closest('[data-account-dropdown]')) {
          setIsAccountDropdownOpen(false)
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isAccountDropdownOpen])

  const navItems = [
    { label: 'Mint', href: '/#hero' },
    { label: 'How It Works', href: '/#how' },
    { label: 'Designs', href: '/#mysteries' },
    { label: 'Kaijudex', href: '/kaijudex' },
    { label: 'Community', href: '/#community' },
  ]

  const accountItems = [
    { label: 'My Collection', href: '/my-kaiju' },
    { label: 'NFT Lookup', href: '/nft' },
  ]

  const handleNavClick = (href: string) => {
    // Close mobile menu first
    setIsMenuOpen(false)
    
    // Check if it's a home page anchor link
    if (href.startsWith('/#')) {
      const anchorId = href.substring(2) // Remove '/#'
      
      // If we're already on home page, just scroll to section
      if (window.location.pathname === '/') {
        setTimeout(() => {
          const element = document.querySelector(`#${anchorId}`)
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 100)
      } else {
        // Navigate to home page with anchor
        router.push(`/#${anchorId}`)
      }
    } else {
      // Regular page navigation
      router.push(href)
    }
  }

  // Determine text color based on scroll position
  const textColor = isScrolled ? 'text-kaiju-navy' : 'text-white'
  const hoverColor = isScrolled ? 'hover:text-kaiju-pink' : 'hover:text-kaiju-pink'

  return (
    <>
      {/* Custom styles for mobile connect button and improved mobile experience */}
      <style jsx global>{`
        .connect-button-container {
          display: flex;
          align-items: center;
        }
        
        /* Mobile specific styling for connect button - minimal changes to preserve desktop appearance */
        @media (max-width: 768px) {
          .connect-button-container button {
            min-height: 44px !important;
            min-width: 100px !important;
            white-space: nowrap !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
          }
          
          /* Ensure modal appears correctly on mobile */
          [data-rk] > div {
            z-index: 9999 !important;
          }
          
          /* Improve modal backdrop on mobile */
          [data-rk] [role="dialog"] {
            margin: 16px !important;
            max-width: calc(100vw - 32px) !important;
            max-height: calc(100vh - 32px) !important;
            border-radius: 16px !important;
          }
          
          /* Improve wallet option buttons in modal */
          [data-rk] button[data-testid] {
            padding: 16px !important;
            font-size: 16px !important;
            min-height: 60px !important;
            border-radius: 12px !important;
            margin-bottom: 8px !important;
          }
          
          /* Improve modal content spacing */
          [data-rk] [role="dialog"] > div {
            padding: 24px !important;
          }
          
          /* Fix wallet list spacing */
          [data-rk] [role="dialog"] > div > div {
            gap: 12px !important;
          }
        }
      `}</style>
      
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
              onClick={() => router.push('/')}
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
            <nav className="hidden lg:flex items-center space-x-10">
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
              
              {/* Account Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className={`relative ${textColor} font-semibold transition-colors duration-300 ${hoverColor} flex items-center gap-1`}
                  whileHover={{ y: -1 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                >
                  <User className="w-4 h-4" />
                  Account
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-kaiju-pink"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={isAccountDropdownOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 ${isAccountDropdownOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  {accountItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      onClick={() => {
                        handleNavClick(item.href)
                        setIsAccountDropdownOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-kaiju-navy font-medium hover:bg-kaiju-light-pink hover:text-kaiju-pink transition-colors border-b border-gray-100 last:border-b-0"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </nav>

            {/* Desktop Social Links + Connect Button + Mobile Menu */}
            <div className="flex items-center">
              {/* Subtle Separator */}
              <div className={`hidden lg:block w-px h-6 ${isScrolled ? 'bg-kaiju-navy/20' : 'bg-white/20'} mx-6`}></div>
              
              {/* Desktop Social Links */}
              <div className="hidden lg:flex items-center space-x-4 mr-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${textColor} ${social.color} transition-colors duration-300 p-2`}
                    whileHover={{ scale: 1.1, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    title={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>

              {/* Thirdweb Connect Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="connect-button-container mr-4"
              >
                <ConnectButton
                  client={thirdwebClient}
                  theme="dark"
                  connectModal={{
                    size: "compact",
                    title: "Connect to CryptoKaiju",
                    showThirdwebBranding: false,
                    welcomeScreen: {
                      title: "Welcome to CryptoKaiju",
                      subtitle: "Connect your wallet to mint mystery boxes"
                    }
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

          {/* Mobile Menu - Improved for better readability */}
          <motion.nav
            className="lg:hidden overflow-hidden"
            initial={false}
            animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-4 pb-6 space-y-4 bg-white/95 backdrop-blur-md rounded-lg mt-4 border border-kaiju-light-gray/30 shadow-xl">
              {/* Mobile Social Links */}
              <div className="flex items-center justify-center space-x-6 pb-4 border-b border-kaiju-light-gray/30 mx-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-kaiju-navy ${social.color} transition-colors duration-300 p-2`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isMenuOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.1 }}
                    title={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>

              {/* Mobile Navigation Items */}
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left text-kaiju-navy font-semibold py-3 px-6 rounded-lg hover:bg-kaiju-light-pink hover:text-kaiju-pink transition-colors text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {item.label}
                </motion.button>
              ))}

              {/* Mobile Account Section */}
              <div className="border-t border-kaiju-light-gray/30 mt-4 pt-4">
                <div className="px-6 mb-3">
                  <div className="flex items-center gap-2 text-kaiju-navy/60 text-sm font-medium">
                    <User className="w-4 h-4" />
                    Account
                  </div>
                </div>
                {accountItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full text-left text-kaiju-navy font-semibold py-3 px-8 rounded-lg hover:bg-kaiju-light-pink hover:text-kaiju-pink transition-colors text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: (navItems.length + index) * 0.1 + 0.3 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.nav>
        </div>
      </motion.header>
    </>
  )
}