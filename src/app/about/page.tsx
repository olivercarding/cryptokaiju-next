// src/app/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Users, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Dark Hero Section */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,theme(colors.kaiju-pink/20)_0%,transparent_50%)]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_30%,theme(colors.kaiju-purple-light/30)_0%,transparent_50%)]"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4]
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            />
          </div>

          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kaiju-pink rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Back Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-kaiju-pink transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Users className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  About CryptoKaiju
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Bridging the gap between digital collectibles and physical toys through innovative blockchain technology.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Light Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Pioneer Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-kaiju-pink/10 text-kaiju-pink font-bold px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4" />
                World's First
              </div>
              <h2 className="text-3xl font-bold text-kaiju-navy mb-6">Pioneering Connected Collectibles</h2>
              <p className="text-lg text-kaiju-navy/70 leading-relaxed max-w-3xl mx-auto">
                CryptoKaiju stands as the <strong>world's first vinyl toy company</strong> to fully bridge physical and digital realms through blockchain technology. Spun out of KnownOrigin and founded in 2018 by Oliver Carding, we created connected products that solve authenticity and provenance challenges in the collectibles market by linking physical toys to verifiable digital ownership and exclusive experiences.
              </p>
            </motion.div>

            {/* Innovation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 mb-12"
            >
              <div className="text-center mb-8">
                <Zap className="w-12 h-12 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">The Innovation That Changed Everything</h3>
                <p className="text-kaiju-navy/70 max-w-2xl mx-auto">
                  Each collectible contains a tamper-resistant NFC chip encrypted with a unique serial number that cannot be duplicated. When scanned, it reveals attributes that directly correspond to an ERC-721 compliant NFT on the Ethereum blockchain, creating our breakthrough connected products technology.
                </p>
              </div>
            </motion.div>

            {/* Partnerships Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold text-kaiju-navy text-center mb-8">Groundbreaking Partnerships</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex justify-center mb-6">
                    <img src="/logos/sandbox-logo.png" alt="The Sandbox" className="h-16 w-auto object-contain" />
                  </div>
                  <h4 className="font-bold text-kaiju-navy mb-2 text-center">The Sandbox</h4>
                  <p className="text-sm text-kaiju-navy/70 text-center">
                    Created toys that unlock metaverse assets, wearables, and in-game characters.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                  <div className="flex justify-center mb-6">
                    <img src="/logos/kings-logo.png" alt="Sacramento Kings" className="h-16 w-auto object-contain" />
                  </div>
                  <h4 className="font-bold text-kaiju-navy mb-2 text-center">Sacramento Kings</h4>
                  <p className="text-sm text-kaiju-navy/70 text-center">
                    <strong>First physical crypto-collectible in professional sports</strong> with scavenger hunts offering exclusive experiences and prizes.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200">
                  <div className="flex justify-center mb-6">
                    <img src="/images/dapper_labs_logo.svg" alt="Dapper Labs" className="h-16 w-auto object-contain" />
                  </div>
                  <h4 className="font-bold text-kaiju-navy mb-2 text-center">Dapper Labs</h4>
                  <p className="text-sm text-kaiju-navy/70 text-center">
                    CryptoKitties collaboration linking individual toys to specific digital cats.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark rounded-3xl p-8 text-white mb-12"
            >
              <h3 className="text-2xl font-bold text-center mb-8">Proven Track Record</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-black text-kaiju-pink mb-2">1,600+</div>
                  <div className="text-sm opacity-90">Toys Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-kaiju-pink mb-2">100%</div>
                  <div className="text-sm opacity-90">Delivery Record</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-kaiju-pink mb-2">30+</div>
                  <div className="text-sm opacity-90">Countries</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-kaiju-pink mb-2">6</div>
                  <div className="text-sm opacity-90">Years Strong</div>
                </div>
              </div>
            </motion.div>

            {/* Recognition & Community */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100"
              >
                <Zap className="w-12 h-12 text-kaiju-pink mb-4" />
                <h4 className="text-xl font-bold text-kaiju-navy mb-3">Industry Recognition</h4>
                <p className="text-kaiju-navy/70 text-sm mb-4">
                  Featured in <strong>Forbes</strong> and recognized as the "blockchain-enabled Amiibo" of Ethereum. 
                  Established thought leadership at NFT.NYC and Berlin Blockchain Week.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100"
              >
                <Users className="w-12 h-12 text-kaiju-pink mb-4" />
                <h4 className="text-xl font-bold text-kaiju-navy mb-3">Community-Driven Excellence</h4>
                <p className="text-kaiju-navy/70 text-sm">
                  We've built more than a product—we've cultivated a passionate community of collectors who value authenticity, innovation, and quality through organic growth.
                </p>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-center"
            >
              <div className="mb-4">
                <p className="text-lg font-bold text-kaiju-navy">Where physical meets digital, and collecting meets innovation.</p>
              </div>
              <Link
                href="/#hero"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                Start Your Collection
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}