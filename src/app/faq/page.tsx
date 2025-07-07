// src/app/faq/page.tsx
'use client'

import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'

export default function FAQPage() {
  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Coming soon - Find answers to common questions about CryptoKaiju NFTs and collectibles.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}