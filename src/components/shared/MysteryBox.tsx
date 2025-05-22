// src/components/shared/MysteryBox.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MysteryBoxProps {
  mysteryDesigns: Array<{
    type: string
    rarity: string
    probability: string
  }>
  size?: 'small' | 'medium' | 'large'
  showBreakdown?: boolean
  className?: string
}

export default function MysteryBox({ 
  mysteryDesigns, 
  size = 'medium', 
  showBreakdown = true,
  className = '' 
}: MysteryBoxProps) {
  const sizeConfig = {
    small: {
      container: 'w-[200px] h-[240px]',
      particleCount: 4,
      particleSize: 'w-1.5 h-1.5',
      questionMarks: 2
    },
    medium: {
      container: 'w-[280px] h-[320px] md:w-[320px] md:h-[360px]',
      particleCount: 6,
      particleSize: 'w-2 h-2',
      questionMarks: 3
    },
    large: {
      container: 'w-[360px] h-[420px] md:w-[400px] md:h-[460px]',
      particleCount: 8,
      particleSize: 'w-3 h-3',
      questionMarks: 4
    }
  }

  const config = sizeConfig[size]

  const [isHovered, setIsHovered] = useState(false)
  const [currentSilhouette, setCurrentSilhouette] = useState(0)
  const [showPeek, setShowPeek] = useState(false)
  const [particlePositions, setParticlePositions] = useState<Array<{top: string, left: string}>>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSilhouette(prev => (prev + 1) % mysteryDesigns.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [mysteryDesigns.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPeek(true)
      setTimeout(() => setShowPeek(false), 800)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setIsMounted(true)
    const positions = Array.from({ length: config.particleCount }, (_, i) => ({
      top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 150}px`,
      left: `${160 + Math.cos(i * 60 * Math.PI / 180) * 120}px`,
    }))
    setParticlePositions(positions)
  }, [config.particleCount])

  return (
    <div className={`relative h-[400px] md:h-[500px] flex items-center justify-center ${className}`}>
      <motion.div 
        className={`relative ${config.container}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{ 
          y: [0, -8, 0],
          rotateX: isHovered ? 5 : 0,
          rotateY: isHovered ? -5 : 0
        }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 0.3 },
          rotateY: { duration: 0.3 }
        }}
      >
        {isMounted && particlePositions.map((position, i) => (
          <motion.div
            key={i}
            className={`absolute ${config.particleSize} rounded-full`}
            style={{
              top: position.top,
              left: position.left,
              backgroundColor: ['#FF69B4', '#FFD700', '#FF6347', '#98FB98', '#87CEEB', '#DDA0DD'][i % 6]
            }}
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.5, 1.2, 0.5],
              rotate: 360,
              y: [0, -15, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}

        <motion.div 
          className="relative w-full h-full flex items-center justify-center"
          animate={{ scale: isHovered ? [1, 1.05, 1] : 1 }}
          transition={{ scale: { duration: 0.6, repeat: isHovered ? Infinity : 0 } }}
        >
          <div className="absolute bottom-8 w-52 h-8 bg-black/20 rounded-full blur-md"></div>

          <div className="relative w-48 h-48 bg-[#E33232]">
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-[40px] bg-[#F8CB36] z-10"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40px] h-full bg-[#F8CB36] z-10"></div>

            <motion.div
              className="absolute top-0 left-0 w-full h-12 bg-[#E33232] z-20"
              animate={{ rotate: isHovered ? [0, -2, 2, 0] : 0 }}
              transition={{ duration: 0.4, repeat: isHovered ? Infinity : 0, repeatType: 'loop' }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSilhouette}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl text-white/60 font-bold"
                >
                  ?
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div 
            className="absolute bottom-0 bg-gradient-to-r from-purple-600 to-purple-700 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm font-bold shadow-xl border border-purple-500"
            animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {mysteryDesigns[currentSilhouette]?.probability} chance
          </motion.div>
        </motion.div>

        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -inset-4 border-2 border-dashed border-kaiju-pink/50 rounded-lg"
          />
        )}
      </motion.div>

      {isMounted && [...Array(config.questionMarks)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          style={{
            top: `${30 + i * 120}px`,
            left: i % 2 === 0 ? '20px' : 'calc(100% - 60px)'
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut"
          }}
        >
          {['✨', '🎉', '⭐', '🎊'][i % 4]}
        </motion.div>
      ))}

      {showBreakdown && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-kaiju-light-gray">
            <h3 className="text-center font-bold text-kaiju-navy mb-3">Mystery Box Contents</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {mysteryDesigns.map((design, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-kaiju-navy">{design.type} ({design.rarity})</span>
                  <span className="text-kaiju-pink font-bold">{design.probability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
