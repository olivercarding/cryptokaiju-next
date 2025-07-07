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
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-kaiju-navy mb-6">Coming Soon</h2>
              <p className="text-lg text-kaiju-navy/70 leading-relaxed max-w-2xl mx-auto">
                We're working on an amazing story about CryptoKaiju's mission to revolutionize the collectibles space. 
                Check back soon to learn more about our journey and vision.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center"
              >
                <Heart className="w-12 h-12 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-xl font-bold text-kaiju-navy mb-3">Passion</h3>
                <p className="text-gray-600">
                  We're passionate about creating unique collectibles that bridge digital and physical worlds.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center"
              >
                <Zap className="w-12 h-12 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-xl font-bold text-kaiju-navy mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Using cutting-edge blockchain technology to create verifiable, unique digital assets.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center"
              >
                <Users className="w-12 h-12 text-kaiju-pink mx-auto mb-4" />
                <h3 className="text-xl font-bold text-kaiju-navy mb-3">Community</h3>
                <p className="text-gray-600">
                  Building a vibrant community of collectors who love both digital and physical collectibles.
                </p>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
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