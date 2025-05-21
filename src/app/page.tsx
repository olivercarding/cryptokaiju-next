// src/app/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [currentKaiju, setCurrentKaiju] = useState(0)
  const kaijuImages = [
    '/images/kaiju-green.png',
    '/images/kaiju-pink.png',
    '/images/kaiju-blue.png',
  ]
  
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 250])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKaiju((prev) => (prev + 1) % kaijuImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animation */}
      <motion.section 
        ref={ref}
        className="relative overflow-hidden bg-white min-h-screen flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]), opacity }}
        >
          <Image 
            src="/images/blob-gradient-1.svg" 
            alt="" 
            fill
            className="object-cover object-left"
            priority
          />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-0 left-0 w-1/2 h-full pointer-events-none"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]), opacity }}
        >
          <Image 
            src="/images/blob-gradient-2.svg" 
            alt="" 
            fill
            className="object-cover object-right"
          />
        </motion.div>
        
        {/* Floating elements */}
        <motion.div 
          className="absolute left-[15%] top-[20%] w-16 h-16 rounded-full bg-kaiju-pink/40 blur-md"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute right-[20%] bottom-[30%] w-12 h-12 rounded-full bg-kaiju-navy/30 blur-md"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="block text-kaiju-navy">CryptoKaiju</span>
                <motion.span 
                  className="block text-kaiju-pink"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Pretty Fine Plushies
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-kaiju-navy/80 mb-8 max-w-md mx-auto md:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                777 soft huggable plush Kaiju linked to NFTs, ready for new homes. Collect, cuddle, and connect to the metaverse.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.button 
                  className="btn-primary text-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Mint Now</span>
                  <motion.span 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
                
                <motion.button 
                  className="btn-secondary text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Collection
                </motion.button>
              </motion.div>
              
              {/* Collection stats */}
              <motion.div 
                className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-kaiju-pink">777</div>
                  <div className="text-sm text-kaiju-navy/70">Total Supply</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-kaiju-pink">2</div>
                  <div className="text-sm text-kaiju-navy/70">Colorways</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-kaiju-pink">0.055</div>
                  <div className="text-sm text-kaiju-navy/70">ETH Price</div>
                </div>
              </motion.div>
            </div>
            
            {/* Animated Kaiju Display */}
            <motion.div 
              className="relative h-[500px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Rotating circle */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[380px] md:h-[380px] bg-kaiju-light-pink rounded-full"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, repeatType: "reverse" }
                }}
              />
              
              {/* Animated dots around the circle */}
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-kaiju-pink"
                  style={{ 
                    top: `${50 + 45 * Math.sin(i * (Math.PI / 3))}%`,
                    left: `${50 + 45 * Math.cos(i * (Math.PI / 3))}%`
                  }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.3
                  }}
                />
              ))}
              
              {/* Animated Kaiju character */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[350px] md:h-[350px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentKaiju}
                    className="w-full h-full"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Image
                      src={kaijuImages[currentKaiju]}
                      alt={`CryptoKaiju #${currentKaiju + 1}`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute -bottom-6 -right-6 w-20 h-20"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -10, 10, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Image
                  src="/images/star-decoration.svg"
                  alt=""
                  width={80}
                  height={80}
                />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ 
              y: [0, 10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity
            }}
            style={{ opacity }}
          >
            <div className="flex flex-col items-center">
              <span className="text-kaiju-navy/60 mb-2">Scroll to explore</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Rest of your homepage sections... */}
    </div>
  )
}   