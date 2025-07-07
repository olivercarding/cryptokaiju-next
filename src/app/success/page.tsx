// src/app/success/page.tsx
'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function SuccessPage() {
  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20 min-h-screen flex items-center">
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-green-400/30 mb-8">
                <CheckCircle className="text-green-400" size={24} />
                <span className="text-green-400 font-bold text-lg">Mint Successful!</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                Welcome to the CryptoKaiju Family!
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Your mystery box has been successfully minted! Your unique Kaiju is now part of your collection.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">What's Next?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-start gap-4">
                    <Package className="text-kaiju-pink flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold mb-2">Claim Your Physical Collectible</h3>
                      <p className="text-white/80 text-sm">
                        Visit our claim portal to enter your shipping information and receive your physical Kaiju.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-kaiju-pink flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold mb-2">View Your Collection</h3>
                      <p className="text-white/80 text-sm">
                        Check out your NFT collection and explore all your Kaiju's unique traits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/my-kaiju"
                  className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  View My Collection
                  <ArrowRight size={20} />
                </Link>
                
                <a
                  href="https://cryptokaiju.io/plushclaim/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center gap-3"
                >
                  <Package size={20} />
                  Claim Physical Item
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}