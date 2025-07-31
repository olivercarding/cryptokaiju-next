// src/components/layout/Footer.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Twitter, Instagram, MessageCircle, Send, ExternalLink, Heart } from 'lucide-react'

// Social media links configuration
const socialLinks = [
  {
    name: 'X (Twitter)',
    icon: Twitter,
    url: 'https://x.com/CryptoKaijuIO',
    color: 'hover:text-blue-400'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/cryptokaiju/',
    color: 'hover:text-pink-400'
  },
  {
    name: 'Discord',
    icon: MessageCircle,
    url: 'https://discord.gg/yMZtRgTps8',
    color: 'hover:text-indigo-400'
  },
  {
    name: 'Telegram',
    icon: Send,
    url: 'https://t.me/Crypto_Kaiju',
    color: 'hover:text-blue-500'
  }
]

// Footer navigation links
const footerSections = [
  {
    title: 'Explore',
    links: [
      { label: 'Mint Mystery Box', href: '/#hero' },
      { label: 'How It Works', href: '/#how' },
      { label: 'Physical Designs', href: '/#mysteries' },
      { label: 'Kaijudex Database', href: '/kaijudex' },
      { label: 'My Collection', href: '/my-kaiju' },
      { label: 'NFT Lookup', href: '/nft' }
    ]
  },
  {
    title: 'Learn',
    links: [
      { label: 'About CryptoKaiju', href: '/about' },
      { label: 'Frequently Asked Questions', href: '/faq' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'View on OpenSea', href: 'https://opensea.io/collection/cryptokaiju', external: true }
    ]
  },
  {
    title: 'Community',
    links: [
      { label: 'Join Discord', href: 'https://discord.gg/yMZtRgTps8', external: true },
      { label: 'Follow on X', href: 'https://x.com/CryptoKaijuIO', external: true },
      { label: 'Instagram', href: 'https://www.instagram.com/cryptokaiju/', external: true },
      { label: 'Telegram Group', href: 'https://t.me/Crypto_Kaiju', external: true }
    ]
  }
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Logo */}
              <Link href="/" className="inline-block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src="/images/cryptokaiju-logo.png"
                    alt="CryptoKaiju"
                    width={200}
                    height={100}
                    className="h-auto"
                  />
                </motion.div>
              </Link>
              
              {/* Description */}
              <p className="text-white/80 leading-relaxed">
                Unique collectible NFTs linked to physical toys. Bridging the gap between digital and physical collectibles through blockchain technology.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-white/70 ${social.color} transition-colors duration-300 p-2 rounded-lg hover:bg-white/10`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    viewport={{ once: true }}
                    title={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-6">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                viewport={{ once: true }}
                className="text-lg font-bold text-white"
              >
                {section.title}
              </motion.h3>
              
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 + 0.2 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {section.links.map((link, linkIndex) => (
                  <li key={link.label}>
                    {link.external ? (
                      <motion.a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-kaiju-pink transition-colors duration-300 flex items-center gap-2 group"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.a>
                    ) : (
                      <Link href={link.href}>
                        <motion.span
                          className="text-white/70 hover:text-kaiju-pink transition-colors duration-300 cursor-pointer inline-block"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    )}
                  </li>
                ))}
              </motion.ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
          >
            {/* Copyright */}
            <div className="text-white/60 text-sm text-center md:text-left">
              <p>© {currentYear} CryptoKaiju. All rights reserved.</p>
              <p className="mt-1">
                Contract:{' '}
                <a 
                  href="https://etherscan.io/address/0x102c527714ab7e652630cac7a30abb482b041fd0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors font-mono"
                >
                  0x102c...1fd0
                </a>
              </p>
            </div>

            {/* Made with Love */}
            <motion.div
              className="flex items-center gap-2 text-white/60 text-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-4 h-4 text-kaiju-pink fill-current" />
              </motion.div>
              <span>by </span>
              <a 
                href="https://olivercarding.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-kaiju-pink transition-colors underline underline-offset-2"
              >
                Oliver Carding
              </a>
            </motion.div>

            {/* Additional Links */}
            <div className="flex items-center space-x-6 text-sm text-white/60">
              <a 
                href="https://etherscan.io/address/0x102c527714ab7e652630cac7a30abb482b041fd0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-kaiju-pink transition-colors flex items-center gap-1"
              >
                <span>Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://opensea.io/collection/cryptokaiju"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-kaiju-pink transition-colors flex items-center gap-1"
              >
                <span>OpenSea</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}